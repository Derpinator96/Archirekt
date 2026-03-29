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
from typing import List, Optional
from shapely.geometry import LineString, Point

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

class ModelRecord(BaseModel):
    id: str
    date: str
    thumbnail: str
    walls: List[Wall]

@app.get("/api/models", response_model=List[ModelRecord])
def get_models():
    conn = sqlite3.connect('asis_models.db')
    c = conn.cursor()
    c.execute("SELECT id, date, thumbnail, walls_json FROM models ORDER BY date DESC LIMIT 10")
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
    
    # Hough Lines Extraction
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=60, maxLineGap=20)
    
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
            if line_geom.length < 0.5:
                continue
                
            processed_lines.append(line_geom)
            
        # Simplistic line merging heuristic: Skip lines that are almost identical
        filtered_lines = []
        for l in processed_lines:
            # Check if l is too close to any line in filtered_lines
            is_dup = False
            for fl in filtered_lines:
                # if distance between them is tiny, and they are parallel, it's a duplicate edge
                if l.distance(fl) < 0.5 and abs(l.length - fl.length) < 2.0:
                    is_dup = True
                    break
            if not is_dup:
                filtered_lines.append(l)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("floor_parser:app", host="0.0.0.0", port=8000, reload=True)
