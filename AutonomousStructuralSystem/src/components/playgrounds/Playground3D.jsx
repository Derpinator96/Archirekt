import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function Playground3D({ setGeneratedModels }) {
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [elements, setElements] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [buildMode, setBuildMode] = useState('SELECT'); // 'SELECT', 'WALL', 'DOOR', 'WINDOW'
  const [startPoint, setStartPoint] = useState(null);
  const [previewEnd, setPreviewEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleCreateNew = () => {
    setElements([]);
    setProjectLoaded(true);
  };

  const handleLoadRecent = () => {
    setElements([
      { id: '1', type: 'wall', start: [-5, 0, -5], end: [5, 0, -5] },
      { id: '2', type: 'wall', start: [5, 0, -5], end: [5, 0, 5] },
      { id: '3', type: 'wall', start: [5, 0, 5], end: [-5, 0, 5] },
      { id: '4', type: 'wall', start: [-5, 0, 5], end: [-5, 0, -5] }
    ]);
    setProjectLoaded(true);
  };

  const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
          const res = await axios.post('http://localhost:8000/api/parse-floorplan', formData);
          if (res.data.walls && res.data.walls.length > 0) {
              const mappedElements = res.data.walls.map(w => ({
                  id: generateId(),
                  type: 'wall',
                  start: [w.startX, 0, w.startY],
                  end: [w.endX, 0, w.endY],
                  thickness: w.thickness,
                  isLoadBearing: w.isLoadBearing,
                  hasWindow: w.hasWindow,
                  hasDoor: w.hasDoor
              }));
              setElements(mappedElements);
              setProjectLoaded(true);
              
              setAnalysis(null);
              try {
                  const aiRes = await axios.post('http://localhost:8000/api/analyze-materials', {
                      walls: res.data.walls
                  });
                  setAnalysis(aiRes.data);
              } catch(aiErr) {
                  console.error('LLM Failure:', aiErr);
              }
              
              try {
                  const modelsRes = await axios.get('http://localhost:8000/api/models');
                  if (setGeneratedModels) setGeneratedModels(modelsRes.data);
              } catch (refreshErr) {
                  console.error("Failed to refresh global state:", refreshErr);
              }
          } else {
              alert("No structural geometry found. Please ensure the blueprint has clear, distinct walls.");
          }
      } catch(err) {
          console.error('CV Backend Failed:', err);
          alert("CV Backend Failed");
      }
      setLoading(false);
  };


  const handleSave = async () => {
    if (elements.length === 0) return;
    setIsSaving(true);
    const id = generateId();
    const modelData = {
      id: id,
      name: `Design_${new Date().toISOString().slice(0,10)}_${id}`,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      elements: elements,
      thumbnail: "https://placehold.co/400x500/FFFFFF/000000?text=Architectural+Draft" // Mock thumbnail
    };
    
    try {
      // Persist to backend (Hydrated in App.jsx)
      const res = await axios.post('http://localhost:8000/api/models', modelData);
      if (res.data) {
        setGeneratedModels(prev => [...prev, res.data]);
        alert("ARCHITECTURAL STATE PERSISTED TO SYSTEM");
      }
    } catch (err) {
      console.error("Save failed:", err);
      // Fallback for UI if backend is not up
      setGeneratedModels(prev => [...prev, modelData]);
      alert("LOCAL PERSISTENCE ACTIVE (REMOTE OFFLINE)");
    }
    setIsSaving(false);
  };

  const handlePointerDown = (e) => {
    if (buildMode !== 'WALL') return;
    e.stopPropagation();
    
    const { point } = e;
    
    if (!startPoint) {
      setStartPoint([point.x, 0, point.z]);
      setPreviewEnd([point.x, 0, point.z]);
    } else {
      setElements([...elements, {
        id: generateId(),
        type: 'wall',
        start: startPoint,
        end: [point.x, 0, point.z]
      }]);
      setStartPoint(null);
      setPreviewEnd(null);
    }
  };

  const handlePointerMove = (e) => {
    if (buildMode !== 'WALL' || !startPoint) return;
    
    // Check if the floor plane was hit (usually the first intersection, or we filter)
    const floorIntersect = e.intersections.find(i => i.object.name === "floorPlane");
    if (floorIntersect) {
      const { point } = floorIntersect;
      setPreviewEnd([point.x, 0, point.z]);
    } else {
      const { point } = e;
      setPreviewEnd([point.x, 0, point.z]);
    }
  };

  if (!projectLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white font-mono text-black">
        <div className="flex flex-col gap-4 border border-black bg-white p-8">
          <h1 className="mb-4 text-xl font-bold uppercase tracking-widest text-center">Autonomous Structural System</h1>
          <button 
            onClick={handleCreateNew}
            className="border border-black bg-white px-6 py-3 text-sm transition-colors hover:bg-black hover:text-white"
          >
            + CREATE NEW BLANK MODEL
          </button>
          <button 
            onClick={handleLoadRecent}
            className="border border-black bg-white px-6 py-3 text-sm transition-colors hover:bg-black hover:text-white"
          >
            LOAD RECENT MODEL
          </button>
          <label className="border border-black bg-black px-6 py-3 text-sm text-white transition-colors hover:bg-gray-800 text-center cursor-pointer">
            {loading ? '[ PARSING BLUEPRINT... ]' : '[ UPLOAD FLOOR PLAN ]'}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-white font-mono text-black overflow-hidden select-none">
      {/* UI Overlay */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 border border-black bg-white p-4">
        {['SELECT', 'WALL', 'DOOR', 'WINDOW'].map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setBuildMode(mode);
              setStartPoint(null);
              setPreviewEnd(null);
            }}
            className={`flex justify-start border border-black px-4 py-2 text-sm transition-colors ${
              buildMode === mode ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
            }`}
          >
            {mode === 'SELECT' ? '[ CURSOR ]' : `[ + ${mode} ]`}
          </button>
        ))}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 border border-black bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
        >
          {isSaving ? '[ PERSISTING... ]' : '[ PERSIST MODEL ]'}
        </button>

        <label className="mt-2 border border-black bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800 text-center cursor-pointer">
          {loading ? '[ PARSING... ]' : '[ AUTOPARSE PLAN ]'}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>

      {analysis && (
        <div className="absolute right-4 top-4 z-20 w-80 flex flex-col gap-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] pointer-events-auto">
              <h4 className="font-headline font-bold text-xs uppercase mb-3 border-b border-black pb-1 flex justify-between items-center">
                  <span>Material Analysis</span>
                  <span className="font-label text-[8px] bg-black text-white px-1 py-0.5">STAGE 04</span>
              </h4>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {analysis.materialsTradeoff && analysis.materialsTradeoff.map((tradeoff, idx) => (
                      <div key={idx} className="border border-gray-200 p-2 text-[10px] font-label">
                         <div className="flex justify-between text-gray-800 font-bold mb-1 uppercase text-[9px] border-b border-black pb-1">
                            <span>{tradeoff.elementId}</span>
                            <span className="bg-gray-100 px-1">{tradeoff.category}</span>
                         </div>
                         {tradeoff.rankedOptions.map((opt, i) => (
                             <div key={i} className="mt-1 flex flex-col border-t border-gray-100 pt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-black font-bold bg-black text-white px-1 mr-2 tracking-widest leading-none py-0.5">{opt.name}</span>
                                    <span className="text-gray-900 font-mono text-[8px] bg-gray-200 px-1 py-0.5 leading-none shadow-[1px_1px_0_0_rgba(0,0,0,0.2)]">RATIO: {opt.costStrengthRatio}</span>
                                </div>
                                <div className="text-gray-500 text-[8px] leading-[1.2rem] mt-0.5">JUSTIFICATION: {opt.justification}</div>
                             </div>
                         ))}
                      </div>
                  ))}
              </div>
          </div>
          <div className="bg-white/90 backdrop-blur border border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] pointer-events-auto">
              <h4 className="font-headline font-bold text-xs uppercase mb-3 border-b border-black pb-1 flex justify-between items-center">
                  <span>Explainability</span>
                  <span className="font-label text-[8px] bg-black text-white px-1 py-0.5">STAGE 05</span>
              </h4>
              <p className="font-mono text-[9px] text-gray-700 leading-relaxed uppercase">
                  {analysis.llmExplanation}
              </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas onPointerMove={startPoint ? handlePointerMove : undefined}>
        <color attach="background" args={['white']} />
        
        <OrthographicCamera makeDefault position={[50, 50, 50]} zoom={20} near={-500} far={1000} />
        <OrbitControls 
          makeDefault 
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={500}
        />

        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        {/* Floor grid */}
        <gridHelper args={[1000, 1000, '#e5e5e5', '#f0f0f0']} position={[0, -0.01, 0]} />

        {/* Invisible plane to catch raycast */}
        <mesh 
          name="floorPlane"
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Render elements */}
        {elements.map((el) => {
          if (el.type === 'wall') {
            return <Wall key={el.id} wall={el} buildMode={buildMode} elements={elements} setElements={setElements} />;
          }
          return null;
        })}

        {/* Preview wall */}
        {startPoint && previewEnd && (
          <Wall 
            wall={{ start: startPoint, end: previewEnd, isPreview: true }} 
            isPreview 
          />
        )}
      </Canvas>
    </div>
  );
}

function Wall({ wall, buildMode, elements, setElements, isPreview }) {
  const start = new THREE.Vector3(...wall.start);
  const end = new THREE.Vector3(...wall.end);

  const length = start.distanceTo(end);
  const height = 3.0;
  const thickness = wall.thickness || 0.2;

  const position = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  position.y = height / 2;

  const angle = Math.atan2(end.x - start.x, end.z - start.z);

  const [hoverPoint, setHoverPoint] = useState(null);

  const handlePointerMove = (e) => {
    if (isPreview) return;
    if (buildMode === 'DOOR' || buildMode === 'WINDOW') {
      e.stopPropagation();
      setHoverPoint(e.point);
    }
  };

  const handlePointerOut = () => {
    if (isPreview) return;
    setHoverPoint(null);
  };

  const handlePointerDown = (e) => {
    if (isPreview) return;
    if ((buildMode === 'DOOR' || buildMode === 'WINDOW') && hoverPoint) {
      e.stopPropagation();
      
      const isDoor = buildMode === 'DOOR';
      const width = isDoor ? 1.0 : 1.2;
      const elementHeight = isDoor ? 2.1 : 1.2;
      const yOffset = isDoor ? elementHeight / 2 : 1.5;
      
      const newElement = {
        id: generateId(),
        type: buildMode.toLowerCase(),
        parentId: wall.id,
        position: [hoverPoint.x, yOffset, hoverPoint.z],
        rotation: angle
      };
      
      setElements([...elements, newElement]);
    } else if (buildMode === 'SELECT') {
      // Basic select indication logic could go here
    }
  };

  return (
    <group>
      <mesh 
        position={position} 
        rotation={[0, angle, 0]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[thickness, height, length]} />
        <meshStandardMaterial 
          color="white" 
          transparent={isPreview} 
          opacity={isPreview ? 0.3 : 1}
        />
        <Edges color="black" />
      </mesh>

      {/* Snap preview for Door/Window */}
      {hoverPoint && (buildMode === 'DOOR' || buildMode === 'WINDOW') && (
        <mesh 
          position={[
            hoverPoint.x, 
            buildMode === 'DOOR' ? 1.05 : 1.5, 
            hoverPoint.z
          ]} 
          rotation={[0, angle, 0]}
          pointerEvents="none"
        >
          <boxGeometry args={[
            thickness + 0.1, 
            buildMode === 'DOOR' ? 2.1 : 1.2, 
            buildMode === 'DOOR' ? 1.0 : 1.2
          ]} />
          <meshStandardMaterial color="white" transparent opacity={0.6} depthTest={false} />
          <Edges color="black" />
        </mesh>
      )}

      {/* Render attached Doors/Windows */}
      {!isPreview && elements && elements.map((el) => {
        if (el.parentId === wall.id) {
          return (
            <mesh key={el.id} position={el.position} rotation={[0, el.rotation, 0]}>
              <boxGeometry args={[
                thickness + 0.05, 
                el.type === 'door' ? 2.1 : 1.2, 
                el.type === 'door' ? 1.0 : 1.2
              ]} />
              <meshStandardMaterial color="white" />
              <Edges color="black" />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}
