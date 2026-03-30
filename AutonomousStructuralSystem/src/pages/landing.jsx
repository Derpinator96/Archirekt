import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthBridge';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  // Premium loading state with a splash of accent color
  if (!isLoaded) {
    return (
      <div className="h-[100dvh] bg-[#f8fafc] flex flex-col items-center justify-center font-['Space_Grotesk'] uppercase text-[10px] tracking-[0.4em] text-black">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-10 h-10 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          SYSTEM_BOOT_SEQUENCE...
        </motion.div>
      </div>
    );
  }

  // Auto-redirect to dashboard if already logged in
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGuestBypass = () => {
    navigate('/dashboard', { state: { guest: true } });
  };

  return (
    <div className="min-h-[100dvh] w-full relative bg-[#f8fafc] selection:bg-blue-600 selection:text-white flex flex-col items-center overflow-x-hidden font-['Space_Grotesk']">
      
      {/* BACKGROUND AMBIENT GLOWS (Light mode version) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* NAVBAR */}
      <header className="w-full max-w-7xl px-6 py-8 flex items-center justify-between z-20">
        <div className="font-['Inter'] font-black text-xl tracking-tighter text-slate-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
          A.S.I.S.
        </div>
        {/* <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <span className="text-slate-900 border-b-2 border-blue-600 pb-1 cursor-pointer">Features</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Nodes</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">About</span>
        </nav> */}
        {/* Placeholder to balance flex-between since buttons moved to center */}
        <div className="w-24 hidden md:block"></div> 
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-10 md:pt-16 z-10 w-full max-w-5xl">
        
        {/* Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-100/50 border border-blue-200 text-blue-700 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8 shadow-sm"
        >
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          SYS_STATUS: ONLINE
        </motion.div>

        {/* Massive Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-black text-[clamp(2.5rem,6vw,5.5rem)] tracking-tight font-['Inter'] leading-[1.1] text-slate-900 mb-6"
        >
          Advanced Spatial <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Intelligence System
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-slate-600 font-medium max-w-2xl leading-relaxed mb-10"
        >
          Experience the next dimension of digital imagery. Access high-fidelity 3D structural rendering, real-time blueprint analysis, and spatial drafting tools directly from the public facing node.
        </motion.p>

        {/* The Three Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Sign Up */}
          <button 
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-0.5"
          >
            Register Profile
          </button>
          
          {/* Sign In */}
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide px-8 py-4 rounded-full transition-all shadow-md hover:-translate-y-0.5"
          >
            Sign In
          </button>

          {/* Guest */}
          <button 
            onClick={handleGuestBypass}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm tracking-wide px-8 py-4 rounded-full transition-all hover:border-slate-300 hover:-translate-y-0.5"
          >
            Guest Bypass
          </button>
        </motion.div>
      </main>

      {/* BOTTOM GRAPHIC "MASTERPIECE" WINDOW */}
      {/* We reuse your cool architectural canvas, but house it in a dark presentation window at the bottom */}
     

    </div>
  );
};

export default Landing;