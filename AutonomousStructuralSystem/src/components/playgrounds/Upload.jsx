import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

const SceneCamera = () => {
    const scroll = useScroll();
    
    useFrame((state) => {
        const offset = scroll.offset; // 0 to 1
        
        // Lerp camera from Top-down (Y=25) to First-person inside (Y=1.5, Z=8)
        const targetPosY = THREE.MathUtils.lerp(25, 1.5, offset);
        const targetPosZ = THREE.MathUtils.lerp(0.1, 8, offset); 
        
        state.camera.position.lerp(new THREE.Vector3(0, targetPosY, targetPosZ), 0.1);
        
        const targetLookY = THREE.MathUtils.lerp(0, 1.5, offset);
        state.camera.lookAt(0, targetLookY, 0);
    });
    
    return null;
}

const WallMesh = ({ startX, startY, endX, endY, thickness, isLoadBearing, hasWindow, hasDoor }) => {
    const length = Math.hypot(endX - startX, endY - startY);
    const angle = Math.atan2(endY - startY, endX - startX);
    const midX = (startX + endX) / 2;
    const midZ = (startY + endY) / 2;
    const height = 3.0; 

    // Render material parameters (Architectural Plaster / Concrete)
    const renderMaterial = () => (
        <meshStandardMaterial 
            color={isLoadBearing ? "#e2e2e2" : "#ffffff"} 
            roughness={0.8}
            metalness={0.05}
        />
    );

    const renderOutline = (l, h, t) => (
        <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(l, h, t)]} />
            <lineBasicMaterial attach="material" color="black" linewidth={1} opacity={0.2} transparent />
        </lineSegments>
    );

    // Architectural Door Generator
    if (hasDoor && length > 2) {
        const doorWidth = 1.0;
        const doorHeight = 2.1;
        const remainder = length - doorWidth;
        
        return (
            <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
                <mesh position={[-length/2 + remainder/4, height/2, 0]}>
                    <boxGeometry args={[remainder/2, height, thickness]} />
                    {renderMaterial()}
                    {renderOutline(remainder/2, height, thickness)}
                </mesh>
                <mesh position={[length/2 - remainder/4, height/2, 0]}>
                    <boxGeometry args={[remainder/2, height, thickness]} />
                    {renderMaterial()}
                    {renderOutline(remainder/2, height, thickness)}
                </mesh>
                <mesh position={[0, height - (height - doorHeight)/2, 0]}>
                    <boxGeometry args={[doorWidth, height - doorHeight, thickness]} />
                    {renderMaterial()}
                    {renderOutline(doorWidth, height - doorHeight, thickness)}
                </mesh>
                {/* Actual Wood Door Pane */}
                <mesh position={[0, doorHeight/2, 0]}>
                    <boxGeometry args={[doorWidth - 0.05, doorHeight - 0.05, 0.05]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
                </mesh>
            </group>
        );
    } 
    // Architectural Window Generator
    else if (hasWindow && length > 3) {
        const winWidth = 2.0;
        const winHeight = 1.2;
        const sillHeight = 1.0;
        const remainder = length - winWidth;
        const topHeight = height - (sillHeight + winHeight);

        return (
            <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
                <mesh position={[-length/2 + remainder/4, height/2, 0]}>
                    <boxGeometry args={[remainder/2, height, thickness]} />
                    {renderMaterial()}
                    {renderOutline(remainder/2, height, thickness)}
                </mesh>
                <mesh position={[length/2 - remainder/4, height/2, 0]}>
                    <boxGeometry args={[remainder/2, height, thickness]} />
                    {renderMaterial()}
                    {renderOutline(remainder/2, height, thickness)}
                </mesh>
                <mesh position={[0, sillHeight/2, 0]}>
                    <boxGeometry args={[winWidth, sillHeight, thickness]} />
                    {renderMaterial()}
                    {renderOutline(winWidth, sillHeight, thickness)}
                </mesh>
                <mesh position={[0, height - topHeight/2, 0]}>
                    <boxGeometry args={[winWidth, topHeight, thickness]} />
                    {renderMaterial()}
                    {renderOutline(winWidth, topHeight, thickness)}
                </mesh>
                {/* Physical Glass Pane */}
                <mesh position={[0, sillHeight + winHeight/2, 0]}>
                    <boxGeometry args={[winWidth, winHeight, 0.02]} />
                    <meshPhysicalMaterial 
                        color="#88ccff" 
                        transmission={0.8} 
                        opacity={1} 
                        roughness={0.1}
                        metalness={0.2}
                    />
                </mesh>
            </group>
        );
    } 
    
    // Standard Blank Wall
    return (
        <mesh position={[midX, height/2, midZ]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, height, thickness]} />
            {renderMaterial()}
            {renderOutline(length, height, thickness)}
        </mesh>
    );
};

const FloorPlanModels = ({ walls }) => {
    return (
        <group>
            {/* Ground Plane */}
            <Grid infiniteGrid fadeDistance={40} sectionColor="#aaaaaa" cellColor="#dddddd" />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>

            {walls.map((wall, i) => (
                <WallMesh key={i} {...wall} />
            ))}
        </group>
    );
}

const Upload = ({ locked }) => {
  const initialWalls = [
      { startX: -5, startY: -5, endX: 5, endY: -5, thickness: 0.4, isLoadBearing: true, hasWindow: true, hasDoor: false },
      { startX: 5, startY: -5, endX: 5, endY: 5, thickness: 0.4, isLoadBearing: true, hasWindow: true, hasDoor: false },
      { startX: 5, startY: 5, endX: -5, endY: 5, thickness: 0.2, isLoadBearing: false, hasWindow: false, hasDoor: true },
      { startX: -5, startY: 5, endX: -5, endY: -5, thickness: 0.2, isLoadBearing: false, hasWindow: false, hasDoor: false },
      { startX: 0, startY: -5, endX: 0, endY: 2, thickness: 0.2, isLoadBearing: false, hasWindow: false, hasDoor: true },
  ];
  
  const [walls, setWalls] = useState(initialWalls);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
          const res = await axios.post('http://localhost:8000/api/parse-floorplan', formData);
          if (res.data.walls && res.data.walls.length > 0) {
              setWalls(res.data.walls);
          } else {
              alert("No structural geometry found. Please ensure the blueprint has clear, distinct walls.");
          }
      } catch(err) {
          console.error('CV Backend Failed:', err);
          alert("CV Parsing Error. Server communication compromised.");
      }
      setLoading(false);
  };

  return (
    <div className="w-full h-screen relative border-none bg-white font-body z-10 architect-grid">
      
      {locked && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 border border-black bg-white px-8 py-3 z-30 pointer-events-none">
          <p className="font-label text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-black">lock</span>
            ACCESS LIMITED: AUTHENTICATION REQUIRED
          </p>
        </div>
      )}

      {/* Floating Left Toolbar */}
      <div className={`absolute left-8 top-12 z-20 flex flex-col gap-2 ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className="bg-black text-white border border-black px-4 py-3 font-label text-[11px] tracking-widest hover:bg-gray-900 flex justify-center items-center cursor-pointer w-64 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
            {loading ? <span>[ PARSING BLUEPRINT... ]</span> : <span>[ UPLOAD FLOOR PLAN ]</span>}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
        
        <div className="bg-white border border-black p-4 mt-4 w-64 shadow-[0_1px_0_0_rgba(0,0,0,1)]">
            <h4 className="font-headline font-bold text-xs uppercase mb-2 border-b border-black pb-1">Geometry Engine</h4>
            <p className="font-label text-[9px] uppercase text-gray-500 mb-2">Scroll to interpolate camera depth (Orthogonal -&gt; Perspective).</p>
            <div className="flex justify-between items-center text-[9px] font-bold border-t border-gray-100 pt-2 mt-2">
                <span>WALLS GENERATED:</span>
                <span>{walls.length}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold mt-1">
                <span>DOOR NODES:</span>
                <span>{walls.filter(w => w.hasDoor).length}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold mt-1 shadow-none">
                <span>WINDOW PANES:</span>
                <span>{walls.filter(w => w.hasWindow).length}</span>
            </div>
        </div>
      </div>

      {/* 3D Viewport Area */}
      <div className={`absolute inset-0 z-0 ${locked ? 'opacity-40 grayscale blur-[2px] pointer-events-none' : ''}`}>
         <Canvas camera={{ position: [0, 25, 0.1], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 20, 10]} castShadow intensity={1.5} />
            <Environment preset="city" />
            
            <ScrollControls pages={3} damping={0.25}>
                <SceneCamera />
                <FloorPlanModels walls={walls} />
            </ScrollControls>
        </Canvas>
      </div>

      {/* Floating Coordinates Tag */}
      <div className="absolute bottom-8 right-8 text-right z-20 pointer-events-none">
          <div className="font-label text-[10px] text-black tracking-widest border-r border-black pr-4 leading-relaxed">
              PIPELINE: ACTIVE<br/>
              A.S.I.S CV ENGINE<br/>
              AESTHETIC: SWISS-HFC
          </div>
      </div>

    </div>
  );
};

export default Upload;