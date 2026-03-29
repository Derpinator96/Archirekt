import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ModelGallery from '../components/dashboard/ModelGallery';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import SpinningHouse from '../components/dashboard/SpinningHouse';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const galleryVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 1, type: "spring", stiffness: 80, damping: 20 }
  }
};

const NavigationCard = ({ icon, title, subtitle, status, isGuest, translateClasses }) => (
  <div 
    className={`absolute top-1/2 left-1/2 ${translateClasses} z-20 pointer-events-none`}
    style={{ marginTop: '-50px', marginLeft: '-128px' }}
  >
    <motion.div 
      variants={itemVariants}
      whileHover={isGuest ? {} : { scale: 1.02 }}
      className={`w-64 border border-black bg-white p-5 shadow-[0_1px_0_0_rgba(0,0,0,1)] pointer-events-auto ${isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`flex items-center gap-3 mb-3 ${isGuest ? '' : 'group-hover:text-gray-700'}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <h3 className="font-headline font-bold text-[14px] tracking-tight uppercase leading-none mt-1">{title}</h3>
      </div>
      <p className="font-label text-[10px] uppercase tracking-widest text-gray-500 mb-4 h-6">{subtitle}</p>
      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <span className="font-label text-[9px] uppercase font-bold">{isGuest ? 'LOCKED' : status}</span>
        <span className="material-symbols-outlined text-sm text-black">{isGuest ? 'lock' : 'arrow_forward'}</span>
      </div>
    </motion.div>
  </div>
);

const MainDashboard = () => {
  const location = useLocation();
  const isGuest = location.state?.guest;

  return (
    <div className="bg-white text-black h-screen w-screen fixed inset-0 font-body overflow-hidden architectural-grid z-0">
      <Topbar />
      <Sidebar />

      {/* Main Canvas Context */}
      <main className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        
        {/* Absolute Top Right System Status (Swiss Minimal) */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-48 text-right pointer-events-auto hidden xl:block"
            style={{ position: 'absolute', top: '6rem', right: '3rem' }}
        >
            <div className="border-b border-black pb-1 mb-2">
                <span className="font-label text-[9px] uppercase tracking-[0.2em] font-bold">SYS_TELEM // 001</span>
            </div>
            <p className="font-label text-[9px] uppercase text-gray-500 mb-1 flex justify-between">
                <span>COORD:</span> <span className="text-black">47.3769°N 8.5°E</span>
            </p>
            <p className="font-label text-[9px] uppercase text-gray-500 mb-1 flex justify-between">
                <span>LOAD:</span> <span className="text-black">04.2%</span>
            </p>
            <p className="font-label text-[9px] uppercase text-gray-500 flex justify-between">
                <span>NODES:</span> <span className="text-black">{isGuest ? 'RESTRICTED' : 'ACTIVE'}</span>
            </p>
        </motion.div>

        {/* Central 3D Canvas wrapper */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="pointer-events-auto"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '400px',
              height: '400px',
              marginTop: '-200px',
              marginLeft: '-200px'
            }}
        >
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <SpinningHouse />
            </Canvas>
        </motion.div>

        {/* Radial Layout Container for Nodes */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 pointer-events-auto"
        >
            {/* Top Left */}
            <NavigationCard 
                icon="view_in_ar" 
                title="3D Playground" 
                subtitle="Live Architecture Editor" 
                status="MOD: INTERACT" 
                isGuest={isGuest} 
                translateClasses="-translate-x-[20rem] -translate-y-[12rem] xl:-translate-x-[24rem]" 
            />

            {/* Bottom Left */}
            <NavigationCard 
                icon="edit_square" 
                title="2D Sketchpad" 
                subtitle="Floorplan Layout System" 
                status="MOD: DRAFT" 
                isGuest={isGuest} 
                translateClasses="-translate-x-[20rem] translate-y-[12rem] xl:-translate-x-[24rem]" 
            />

            {/* Top Right */}
            <NavigationCard 
                icon="sports_esports" 
                title="Analyze Game" 
                subtitle="High-fidelity 3D Render" 
                status="MOD: RENDER" 
                isGuest={isGuest} 
                translateClasses="translate-x-[20rem] -translate-y-[12rem] xl:translate-x-[24rem]" 
            />

            {/* Bottom Right */}
            <NavigationCard 
                icon="upload_file" 
                title="Upload Plans" 
                subtitle="CAD / Blueprint Importer" 
                status="MOD: INPUT_NODE" 
                isGuest={isGuest} 
                translateClasses="translate-x-[20rem] translate-y-[12rem] xl:translate-x-[24rem]" 
            />
        </motion.div>
        
        {/* Floating Bottom Gallery row - wraps horizontally to bounds */}
        <motion.div 
            variants={galleryVariants}
            initial="hidden"
            animate="visible"
            className="absolute bottom-0 left-20 right-0 px-12 pointer-events-auto z-30"
        >
            <div className="w-full flex justify-center">
                <div className="max-w-6xl w-full border border-black border-b-0 bg-white/95 backdrop-blur max-h-[260px] overflow-y-auto">
                    <ModelGallery locked={isGuest} />
                </div>
            </div>
        </motion.div>

      </main>
    </div>
  );
};

export default MainDashboard;
