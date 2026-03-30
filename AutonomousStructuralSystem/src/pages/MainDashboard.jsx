import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthBridge';
import { useModelContext } from '../context/ModelContext';
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

const NavigationCard = ({ icon, title, subtitle, status, isGuest, onClick }) => (
  <motion.div
    variants={itemVariants}
    whileHover={isGuest ? {} : { scale: 1.02 }}
    onClick={isGuest ? undefined : onClick}
    className={`min-w-[320px] w-auto border border-black bg-white p-8 shadow-[0_1px_0_0_rgba(0,0,0,1)] pointer-events-auto ${isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} transition-colors hover:bg-gray-50`}
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
);

const MainDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { savedModels, loading } = useModelContext();
  const isGuest = location.state?.guest && !isSignedIn;

  return (
    <div 
      className="bg-white text-black w-screen min-h-screen relative font-body overflow-x-hidden z-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 0 L 0 0 0 50' fill='none' stroke='%23cccccc' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '50px 50px'
      }}
    >
      <Topbar />

      {/* Main Content Area - Vertical Flex Layout */}
      <main className="flex flex-col items-center justify-start min-h-[60vh] w-full max-w-7xl mx-auto gap-12 relative pt-24">
        
        {/* The Centerpiece: Active 3D House Rendering (Top) */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-[400px] h-[400px] pointer-events-auto"
        >
            <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <SpinningHouse />
            </Canvas>
        </motion.div>

        {/* Action Cards Row (Bottom) */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row flex-wrap justify-center gap-10 w-full pointer-events-auto"
        >
            {/* [ 3D PLAYGROUND ] */}
            <NavigationCard 
                icon="view_in_ar" 
                title="3D Playground" 
                subtitle="Live Architecture Editor" 
                status="MOD: INTERACT" 
                isGuest={isGuest} 
                onClick={() => navigate('/playground')}
            />

            {/* [ ANALYZE GAME ] */}
            <NavigationCard 
                icon="sports_esports" 
                title="Analyze Game" 
                subtitle="High-fidelity 3D Render" 
                status="MOD: RENDER" 
                isGuest={isGuest} 
                onClick={() => navigate('/dashboard/game-select')}
            />

            {/* [ UPLOAD PLANS ] */}
            <NavigationCard 
                icon="upload_file" 
                title="Upload Plans" 
                subtitle="CAD / Blueprint Importer" 
                status="MOD: INPUT_NODE" 
                isGuest={isGuest} 
                onClick={() => navigate('/upload')}
            />
        </motion.div>
      </main>

      {/* Model Gallery Below Fold */}
      <section className="relative w-full z-20 bg-white border-t border-black pointer-events-auto">
          <div className="max-w-7xl mx-auto">
              <ModelGallery locked={isGuest} models={savedModels} loading={loading} />
          </div>
      </section>
    </div>
  );
};

export default MainDashboard;