import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Environment, ContactShadows, Grid } from '@react-three/drei';
import { useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import axios from 'axios';

// FPS Controller Component
const PlayerController = () => {
  const { camera } = useThree();
  const moveSpeed = 0.15;
  const keys = useRef({});

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true);
    const handleKeyUp = (e) => (keys.current[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
      0,
      0,
      Number(keys.current['KeyS'] || false) - Number(keys.current['KeyW'] || false)
    );
    const sideVector = new THREE.Vector3(
      Number(keys.current['KeyA'] || false) - Number(keys.current['KeyD'] || false),
      0,
      0
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(moveSpeed)
      .applyEuler(camera.rotation);

    camera.position.add(new THREE.Vector3(direction.x, 0, direction.z));
  });

  return null;
};

const WallMesh = ({ startX, startY, endX, endY, thickness, isLoadBearing }) => {
  const length = Math.hypot(endX - startX, endY - startY);
  const angle = Math.atan2(endY - startY, endX - startX);
  const centerX = (startX + endX) / 2;
  const centerZ = (startY + endY) / 2;
  const height = 3.0;

  return (
    <mesh position={[centerX, height / 2, centerZ]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={isLoadBearing ? "#d1d1d1" : "#f0f0f0"} roughness={0.6} metalness={0.1} />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(length, height, thickness)]} />
        <lineBasicMaterial attach="material" color="black" linewidth={1} opacity={0.1} transparent />
      </lineSegments>
    </mesh>
  );
};

const GameViewer = ({ models = [] }) => {
  const { id } = useParams();
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (models.length > 0) {
         const found = models.find(m => m.id === id);
         if (found && found.walls) {
             setWalls(found.walls);
         } else {
             console.warn("Model ID not found in pipeline state.");
         }
         setLoading(false);
     } else {
         // Fallback if user hits directly without App context loaded yet
         const fetchLatestModel = async () => {
             try {
                 const res = await axios.get('http://localhost:8000/api/models');
                 const found = res.data.find(m => m.id === id);
                 if (found) setWalls(found.walls);
             } catch (err) {
                 console.error('Failed to fetch fallback model:', err);
             }
             setLoading(false);
         };
         fetchLatestModel();
     }
  }, [id, models]);

  return (
    <div className="w-full h-screen bg-white relative font-body overflow-hidden">
      {/* HUD Overlays */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none flex flex-col gap-6">
        <Link to="/dashboard/game-select" className="pointer-events-auto bg-black text-white hover:bg-gray-800 border border-black px-4 py-2 font-label text-[10px] tracking-widest uppercase flex items-center gap-2 w-max shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            EXIT TO GRID
        </Link>
        <div>
          <h2 className="font-headline font-bold text-lg uppercase tracking-tight mb-1">A.S.I.S // ANALYZE_GAME</h2>
          <p className="font-label text-[10px] tracking-[0.2em] text-gray-500 uppercase">MODE: 1ST_PERSON_KINETIC // ID: {id}</p>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-20 pointer-events-none text-right">
        <div className="border border-black bg-white/90 backdrop-blur p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
           <p className="font-label text-[9px] font-bold uppercase mb-2 border-b border-black pb-1">Navigation Commands</p>
           <div className="flex flex-col gap-1 text-[9px] uppercase">
              <div className="flex justify-between gap-4"><span>WALK:</span> <span className="text-gray-500">W A S D</span></div>
              <div className="flex justify-between gap-4"><span>LOOK:</span> <span className="text-gray-500">MOUSE</span></div>
              <div className="flex justify-between gap-4"><span>LOCK:</span> <span className="text-gray-500">CLICK SCREEN</span></div>
           </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-40">
        <div className="w-4 h-4 border border-black rounded-full" />
      </div>

      <Canvas shadows camera={{ position: [0, 1.7, 5], fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight 
            position={[5, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
        />
        <Environment preset="city" />

        <PointerLockControls />
        <PlayerController />

        <group>
          {/* Infinite Architectural Slab */}
          <Grid infiniteGrid fadeDistance={50} sectionColor="#aaaaaa" cellColor="#e2e2e2" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[2000, 2000]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>

          {/* Render Wall Topology */}
          {walls.map((wall, i) => (
            <WallMesh key={i} {...wall} />
          ))}
        </group>
      </Canvas>

      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <p className="font-label text-[11px] uppercase tracking-[0.4em] animate-pulse">INIT_ARCHITECTURE_VR...</p>
        </div>
      )}
    </div>
  );
};

export default GameViewer;
