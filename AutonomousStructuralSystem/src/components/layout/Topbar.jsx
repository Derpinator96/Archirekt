import React from 'react';
import { useLocation } from 'react-router-dom';

const Topbar = () => {
  const location = useLocation();
  const isGuest = location.state?.guest;

  return (
    <header className="fixed top-0 w-full border-b border-black bg-white z-50 flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-4">
        <span className="font-['Inter'] font-black text-black uppercase tracking-tighter text-2xl">
          A.S.I.S.
        </span>
        <div className="h-8 w-px bg-black hidden md:block"></div>
        <span className="font-['Space_Grotesk'] uppercase text-[10px] tracking-widest hidden md:block">
          System Status: Nominal // Auth_Level: {isGuest ? 'Guest' : 'Admin'}
        </span>
      </div>

      <div className="flex items-center gap-8">
        <nav className="hidden md:flex gap-6">
          <a className="text-gray-400 font-['Space_Grotesk'] uppercase text-xs hover:text-black transition-none cursor-pointer">
            Schematics
          </a>
          <a className="text-gray-400 font-['Space_Grotesk'] uppercase text-xs hover:text-black transition-none cursor-pointer">
            Analysis
          </a>
          <a className="text-black font-bold underline decoration-1 underline-offset-4 font-['Space_Grotesk'] uppercase text-xs cursor-pointer">
            Dashboard
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined cursor-pointer">grid_view</span>
          <span className="material-symbols-outlined cursor-pointer">settings</span>
          <button className="bg-black text-white px-4 py-2 font-['Space_Grotesk'] text-xs uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-none">
            {isGuest ? '[ AUTHENTICATION REQUIRED ]' : '[ SYS_ADMIN_ACTIVE ]'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
