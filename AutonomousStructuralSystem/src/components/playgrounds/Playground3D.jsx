import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Edges, Grid } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useModelContext } from '../../context/ModelContext';

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function Playground3D() {
  const navigate = useNavigate();
  const { modelId } = useParams();
  const { savedModels, saveNewModel, updateExistingModel } = useModelContext();

  const [projectLoaded, setProjectLoaded] = useState(false);
  const [elements, setElements] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('[ SAVE PROJECT ]');
  
  const [buildMode, setBuildMode] = useState('SELECT'); // 'SELECT', 'WALL', 'DOOR', 'WINDOW'
  const [startPoint, setStartPoint] = useState(null);
  const [previewEnd, setPreviewEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploadTimestamp, setUploadTimestamp] = useState(Date.now());

  // Load existing model if modelId is present
  useEffect(() => {
    if (modelId) {
      const existingModel = savedModels.find(m => m.id === modelId);
      if (existingModel) {
        // Reconstruct elements from walls and doors
        const reconstructed = [
          ...(existingModel.walls || []),
          ...(existingModel.doors || [])
        ];
        setElements(reconstructed);
        setProjectLoaded(true);
      }
    }
  }, [modelId, savedModels]);

  const handleCreateNew = () => {
    setElements([]);
    setProjectLoaded(true);
    setUploadTimestamp(Date.now());
  };

  const handleLoadRecent = () => {
    setElements([
      { id: '1', type: 'wall', start: [-5, 0, -5], end: [5, 0, -5] },
      { id: '2', type: 'wall', start: [5, 0, -5], end: [5, 0, 5] },
      { id: '3', type: 'wall', start: [5, 0, 5], end: [-5, 0, 5] },
      { id: '4', type: 'wall', start: [-5, 0, 5], end: [-5, 0, -5] }
    ]);
    setProjectLoaded(true);
    setUploadTimestamp(Date.now());
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
              setUploadTimestamp(Date.now());
              
              setAnalysis(null);
              try {
                  const aiRes = await axios.post('http://localhost:8000/api/analyze-materials', {
                      walls: res.data.walls
                  });
                  setAnalysis(aiRes.data);
              } catch(aiErr) {
                  console.error('LLM Failure:', aiErr);
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

  const handleSave = () => {
    if (elements.length === 0) return;
    setIsSaving(true);

    const walls = elements.filter(el => el.type === 'wall');
    const doors = elements.filter(el => el.type === 'door' || el.type === 'window');

    if (modelId) {
      // Update existing
      updateExistingModel(modelId, walls, doors);
      setSaveStatus('[ SAVED ✓ ]');
      setTimeout(() => {
        setSaveStatus('[ SAVE PROJECT ]');
        setIsSaving(false);
      }, 2000);
    } else {
      // New project
      const newId = saveNewModel('Untitled Render', walls, doors);
      // Immediately update URL to reflect the new ID
      navigate(`/3d/${newId}`, { replace: true });
      setIsSaving(false);
    }
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
    const { point } = e;
    setPreviewEnd([point.x, 0, point.z]);
  };

  const wallMeshes = useMemo(() => {
    return elements.map((el) => {
      if (el.type === 'wall') {
        return <Wall key={el.id} wall={el} buildMode={buildMode} elements={elements} setElements={setElements} />;
      }
      return null;
    });
  }, [elements, buildMode]);

  const fallbackMeshes = useMemo(() => {
    return elements.filter(el => el.type === 'wall' && (el.hasDoor || el.hasWindow)).flatMap((el) => {
      const start = new THREE.Vector3(...el.start);
      const end = new THREE.Vector3(...el.end);
      const position = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const angle = Math.atan2(end.x - start.x, end.z - start.z);

      const meshes = [];
      if (el.hasDoor) {
        meshes.push(
          <mesh key={`${el.id}-door`} position={[position.x, 1.05, position.z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.25, 2.1, 1.0]} />
            <meshPhysicalMaterial color="#8b5a2b" transparent opacity={0.6} />
          </mesh>
        );
      }
      if (el.hasWindow) {
        meshes.push(
          <mesh key={`${el.id}-window`} position={[position.x, 1.5, position.z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.25, 1.2, 1.2]} />
            <meshPhysicalMaterial color="#4da6ff" transparent opacity={0.6} transmission={0.5} roughness={0.1} />
          </mesh>
        );
      }
      return meshes;
    });
  }, [elements]);

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
          disabled={isSaving || elements.length === 0}
          className="mt-4 border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-white hover:text-black disabled:opacity-50 uppercase tracking-widest"
        >
          {saveStatus}
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
      <Canvas key={uploadTimestamp} onPointerMove={startPoint ? handlePointerMove : undefined}>
        <color attach="background" args={['white']} />
        
        <PerspectiveCamera makeDefault position={[15, 20, 15]} fov={50} />
        <OrbitControls 
          makeDefault 
          minDistance={1}
          maxDistance={500}
        />

        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1} />

        {/* Floor grid & Axes */}
        <Grid infiniteGrid fadeDistance={50} sectionColor="#aaaaaa" cellColor="#dddddd" position={[0, -0.01, 0]} />
        <axesHelper args={[5]} />

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
        {wallMeshes}

        {/* Fallback Features */}
        {fallbackMeshes}

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

  const wallMat = <meshStandardMaterial color="white" transparent={isPreview} opacity={isPreview ? 0.3 : 1} />;
  const snapMat = <meshStandardMaterial color="white" transparent opacity={0.6} depthTest={false} />;

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
        {wallMat}
        <Edges color="black" />
      </mesh>

      {hoverPoint && (buildMode === 'DOOR' || buildMode === 'WINDOW') && (
        <mesh 
          position={[hoverPoint.x, buildMode === 'DOOR' ? 1.05 : 1.5, hoverPoint.z]} 
          rotation={[0, angle, 0]}
          pointerEvents="none"
        >
          <boxGeometry args={[thickness + 0.1, buildMode === 'DOOR' ? 2.1 : 1.2, buildMode === 'DOOR' ? 1.0 : 1.2]} />
          {snapMat}
          <Edges color="black" />
        </mesh>
      )}

      {!isPreview && elements && elements.map((el) => {
        if (el.parentId === wall.id) {
          return (
            <mesh key={el.id} position={el.position} rotation={[0, el.rotation, 0]}>
              <boxGeometry args={[thickness + 0.05, el.type === 'door' ? 2.1 : 1.2, el.type === 'door' ? 1.0 : 1.2]} />
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

