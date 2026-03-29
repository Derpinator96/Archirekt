import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function SpinningHouse() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Slow elegant Y-axis spin
    groupRef.current.rotation.y += delta * 0.2;
    // Subtle float
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Base Structure */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color="#000000" wireframe={true} transparent opacity={0.4} />
      </mesh>
      
      {/* Roof Structure */}
      <mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
        {/* Radius, Height, Radial Segments (4 for a square base pyramid) */}
        <coneGeometry args={[1.06, 1.5, 4]} />
        <meshBasicMaterial color="#000000" wireframe={true} transparent opacity={0.4} />
      </mesh>

      {/* Internal Core Box for extra structural complexity */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshBasicMaterial color="#000000" wireframe={true} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
