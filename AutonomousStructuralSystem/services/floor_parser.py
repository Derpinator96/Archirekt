import cv2
import numpy as np
import io
import sqlite3
import base64
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from shapely.geometry import LineString, Point
import os
import math
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

SNAPPING_TOLERANCE_PX = 25
OPENAI_CLIENT = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="A.S.I.S. Floor Parser")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite
def init_db():
    conn = sqlite3.connect('asis_models.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS models
                 (id TEXT PRIMARY KEY, date TEXT, thumbnail TEXT, walls_json TEXT)''')
    conn.commit()
    conn.close()

init_db()

class Wall(BaseModel):
    startX: float
    startY: float
    endX: float
    endY: float
    thickness: float
    isLoadBearing: bool
    hasWindow: bool = False
    hasDoor: bool = False

class ParseResponse(BaseModel):
    id: str
    walls: List[Wall]

class TradeoffOption(BaseModel):
    name: str
    costStrengthRatio: str
    justification: str

class MaterialTradeoff(BaseModel):
    elementId: str
    category: str
    rankedOptions: List[TradeoffOption]

class AnalyzeMaterialsRequest(BaseModel):
    walls: List[Wall]

class AnalyzeMaterialsResponse(BaseModel):
    materialsTradeoff: List[MaterialTradeoff]
    llmExplanation: str

class ModelRecord(BaseModel):
    id: str
    date: str
    thumbnail: str
    walls: List[Wall]

@app.get("/api/models", response_model=List[ModelRecord])
def get_models():
    conn = sqlite3.connect('asis_models.db')
    c = conn.cursor()
    c.execute("SELECT id, date, thumbnail, walls_json FROM models ORDER BY date DESC LIMIT 20")
    rows = c.fetchall()
    conn.close()
    
    models = []
    for row in rows:
        models.append(ModelRecord(
            id=row[0],
            date=row[1],
            thumbnail=row[2],
            walls=json.loads(row[3])
        ))
    return models

@app.post("/api/models")
def save_manual_model(record: ModelRecord):
    conn = sqlite3.connect('asis_models.db')
    c = conn.cursor()
    
    # Check if model exists to handle updates
    c.execute("SELECT id FROM models WHERE id = ?", (record.id,))
    if c.fetchone():
        c.execute("UPDATE models SET walls_json = ?, date = ?, thumbnail = ? WHERE id = ?",
                  (json.dumps(record.walls), record.date, record.thumbnail, record.id))
    else:
        c.execute("INSERT INTO models (id, date, thumbnail, walls_json) VALUES (?, ?, ?, ?)",
                  (record.id, record.date, record.thumbnail, json.dumps(record.walls)))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": record.id}

@app.post("/api/parse-floorplan", response_model=ParseResponse)
async def parse_floorplan(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    model_id = str(uuid.uuid4())[:8]
    
    if img is None:
        return ParseResponse(id=model_id, walls=[])
        
    # Standardize image size
    max_dim = 1000
    if img.shape[0] > max_dim or img.shape[1] > max_dim:
        scale = max_dim / max(img.shape[0], img.shape[1])
        img = cv2.resize(img, None, fx=scale, fy=scale)
    
    # Generate Thumbnail
    thumb_img = cv2.resize(img, (256, 256))
    _, buffer = cv2.imencode('.png', thumb_img)
    thumbnail_b64 = "data:image/png;base64," + base64.b64encode(buffer).decode('utf-8')
    
    # Preprocessing: blur and threshold
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    
    # MORPHOLOGICAL FILTERING: Remove text and noise. 
    # Text is usually small, thin components. 
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    # Opening removes small objects (text)
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    # Closing connects small gaps in walls
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    edges = cv2.Canny(closed, 50, 150, apertureSize=3)
    
    # Hough Lines Extraction: Higher threshold and longer min length for structural stability
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=120, minLineLength=80, maxLineGap=30)
    
    walls = []
    
    if lines is not None:
        height, width = img.shape
        scale_x = 20.0 / width
        scale_y = 20.0 / height
        
        processed_lines = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            mapped_x1 = (x1 * scale_x) - 10
            mapped_y1 = (y1 * scale_y) - 10
            mapped_x2 = (x2 * scale_x) - 10
            mapped_y2 = (y2 * scale_y) - 10
            
            line_geom = LineString([(mapped_x1, mapped_y1), (mapped_x2, mapped_y2)])
            if line_geom.length < 1.0: # Filter small noise
                continue
            processed_lines.append(line_geom)
            
        # 1. PROJECTIVE CENTERLINE REDUCTION (Iterative Parallel Merging)
        snapping_dist = SNAPPING_TOLERANCE_PX * scale_x
        
        def merge_lines_pass(lines_to_merge):
            merged = []
            for l in lines_to_merge:
                is_merged = False
                for i, ml in enumerate(merged):
                    dx1, dy1 = l.coords[1][0] - l.coords[0][0], l.coords[1][1] - l.coords[0][1]
                    dx2, dy2 = ml.coords[1][0] - ml.coords[0][0], ml.coords[1][1] - ml.coords[0][1]
                    a1, a2 = math.atan2(dy1, dx1), math.atan2(dy2, dx2)
                    
                    # Normalize angles to [0, pi) for parallel check
                    a1 = a1 % math.pi
                    a2 = a2 % math.pi
                    
                    if abs(a1 - a2) < 0.2 or abs(a1 - a2) > (math.pi - 0.2):
                        # They are roughly parallel, check if they overlap or are very close
                        if l.distance(ml) < snapping_dist * 2.0: 
                            pts = list(l.coords) + list(ml.coords)
                            
                            ux = math.cos(a2)
                            uy = math.sin(a2)
                            nx = -uy
                            ny = ux
                            
                            ref_x, ref_y = ml.coords[0][0], ml.coords[0][1]
                            
                            proj_u = []
                            proj_n = []
                            for p in pts:
                                vec_x = p[0] - ref_x
                                vec_y = p[1] - ref_y
                                proj_u.append(vec_x * ux + vec_y * uy)
                                proj_n.append(vec_x * nx + vec_y * ny)
                                
                            min_u = min(proj_u)
                            max_u = max(proj_u)
                            avg_n = sum(proj_n) / len(proj_n)
                            
                            new_p1 = (ref_x + min_u * ux + avg_n * nx, ref_y + min_u * uy + avg_n * ny)
                            new_p2 = (ref_x + max_u * ux + avg_n * nx, ref_y + max_u * uy + avg_n * ny)
                            
                            merged[i] = LineString([new_p1, new_p2])
                            is_merged = True
                            break
                if not is_merged:
                    merged.append(l)
            return merged

        merged_lines = processed_lines
        for _ in range(3):
            merged_lines = merge_lines_pass(merged_lines)
            
        # 2. STRICT CORNER SNAPPING (Mathematical Extension)
        # Snap endpoints of perpendicular (or intersecting) lines mathematically if they fall just short of each other.
        for i in range(len(merged_lines)):
            for j in range(i + 1, len(merged_lines)):
                l1 = merged_lines[i]
                l2 = merged_lines[j]
                
                # Check distances between all 4 endpoint combinations
                ext_dist = [
                    (0, 0, math.hypot(l1.coords[0][0]-l2.coords[0][0], l1.coords[0][1]-l2.coords[0][1])),
                    (0, 1, math.hypot(l1.coords[0][0]-l2.coords[1][0], l1.coords[0][1]-l2.coords[1][1])),
                    (1, 0, math.hypot(l1.coords[1][0]-l2.coords[0][0], l1.coords[1][1]-l2.coords[0][1])),
                    (1, 1, math.hypot(l1.coords[1][0]-l2.coords[1][0], l1.coords[1][1]-l2.coords[1][1]))
                ]
                
                # Pick the two endpoints nearest each other
                best_pair = min(ext_dist, key=lambda x: x[2])
                
                # If they are very near but not identical
                if best_pair[2] > 0.05 and best_pair[2] < snapping_dist * 2.0:
                    x1, y1 = l1.coords[0]
                    x2, y2 = l1.coords[1]
                    x3, y3 = l2.coords[0]
                    x4, y4 = l2.coords[1]
                    
                    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
                    if abs(denom) > 1e-6: # Protect against completely parallel lines bypassing merge
                        int_x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom
                        int_y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom
                        
                        # Verify the mathematical intersection doesn't blast the line millions of miles into space
                        if math.hypot(l1.coords[best_pair[0]][0] - int_x, l1.coords[best_pair[0]][1] - int_y) < snapping_dist * 3.0:
                            l1_coords = list(l1.coords)
                            l1_coords[best_pair[0]] = (int_x, int_y)
                            merged_lines[i] = LineString(l1_coords)
                            
                            l2_coords = list(l2.coords)
                            l2_coords[best_pair[1]] = (int_x, int_y)
                            merged_lines[j] = LineString(l2_coords)
                            
        filtered_lines = merged_lines
        # Sort by length and cap to top 150 to prevent frontend WebGL Context Lost
        filtered_lines.sort(key=lambda x: x.length, reverse=True)
        filtered_lines = filtered_lines[:150]

        for l in filtered_lines:
            coords = list(l.coords)
            length = l.length
            is_lb = length > 4.0 
            thickness = 0.4 if is_lb else 0.2
            
            # Heuristics for Doors and Windows
            has_door = False
            has_window = False
            
            if length > 3.0 and length < 6.0:
                has_door = True  # Medium walls usually border rooms and have doors
            elif length >= 6.0:
                has_window = True # Extremely long walls are usually exterior facades = windows
            
            walls.append(Wall(
                startX=coords[0][0],
                startY=coords[0][1],
                endX=coords[1][0],
                endY=coords[1][1],
                thickness=thickness,
                isLoadBearing=is_lb,
                hasWindow=has_window,
                hasDoor=has_door
            ))
            
    # Fallback to structural primitive if no lines or image couldn't be parsed
    if len(walls) == 0:
        walls = [
            Wall(startX=-5, startY=-5, endX=5, endY=-5, thickness=0.4, isLoadBearing=True, hasWindow=True),
            Wall(startX=5, startY=-5, endX=5, endY=5, thickness=0.4, isLoadBearing=True, hasWindow=True),
            Wall(startX=5, startY=5, endX=-5, endY=5, thickness=0.2, isLoadBearing=False, hasDoor=True),
            Wall(startX=-5, startY=5, endX=-5, endY=-5, thickness=0.2, isLoadBearing=False),
            Wall(startX=0, startY=-5, endX=0, endY=2, thickness=0.2, isLoadBearing=False, hasDoor=True),
        ]

    # Save to SQLite DB
    conn = sqlite3.connect('asis_models.db')
    c = conn.cursor()
    c.execute("INSERT INTO models (id, date, thumbnail, walls_json) VALUES (?, ?, ?, ?)",
              (model_id, datetime.now().strftime("%d.%m.%Y"), thumbnail_b64, json.dumps([w.dict() for w in walls])))
    conn.commit()
    conn.close()

    return ParseResponse(id=model_id, walls=walls)

@app.post("/api/analyze-materials", response_model=AnalyzeMaterialsResponse)
async def analyze_materials(req: AnalyzeMaterialsRequest):
    materials_db = []
    try:
        with open("services/materials.json", "r") as f:
            materials_db = json.load(f)
    except Exception as e:
        print("Materials JSON missing", e)
    
    # Analyze geometry
    load_bearing = [w for w in req.walls if w.isLoadBearing]
    spans = [math.hypot(w.endX - w.startX, w.endY - w.startY) for w in load_bearing]
    max_span = max(spans) if spans else 0
    total_walls = len(req.walls)
    
    prompt = f"""
You are a Senior Structural Engineer. Analyze this geometry data for an architectural layout:
- Total Walls: {total_walls}
- Load Bearing Walls: {len(load_bearing)}
- Max Structural Span: {max_span:.2f} meters

Here is the officially approved materials database:
{json.dumps(materials_db, indent=2)}

OUTPUT REQUIREMENT:
You MUST output ONLY valid JSON matching this exact structure:
{{
  "materialsTradeoff": [
    {{
      "elementId": "Load Bearing Walls",
      "category": "Structural",
      "rankedOptions": [
        {{ "name": "Material from DB", "costStrengthRatio": "High/Low", "justification": "Why?" }}
      ]
    }}
  ],
  "llmExplanation": "A plain language summary of your analysis based on spans and physics."
}}
Do NOT output any markdown formatting, just the raw JSON string. Do NOT invent new materials.
"""

    if not OPENAI_CLIENT.api_key:
        return AnalyzeMaterialsResponse(
            materialsTradeoff=[],
            llmExplanation="OPENAI API KEY MISSING. Analysis disabled."
        )

    try:
        response = await OPENAI_CLIENT.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
            
        data = json.loads(content)
        return AnalyzeMaterialsResponse(**data)
    except Exception as e:
        print(f"OpenAI LLM Failure: {e}")
        return AnalyzeMaterialsResponse(
            materialsTradeoff=[],
            llmExplanation=f"LLM Error: Failed to generate tradeoffs."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("floor_parser:app", host="0.0.0.0", port=8000, reload=True)

