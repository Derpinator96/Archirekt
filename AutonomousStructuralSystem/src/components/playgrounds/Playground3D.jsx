import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function Playground3D() {
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [elements, setElements] = useState([]);
  
  const [buildMode, setBuildMode] = useState('SELECT'); // 'SELECT', 'WALL', 'DOOR', 'WINDOW'
  const [startPoint, setStartPoint] = useState(null);
  const [previewEnd, setPreviewEnd] = useState(null);

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
      </div>

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
  const thickness = 0.2;

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
