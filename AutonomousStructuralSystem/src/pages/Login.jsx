import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleGuestBypass = () => {
    navigate('/dashboard', { state: { guest: true } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative w-full overflow-hidden">
      {/* ARCHITECTURAL CANVAS */}
      <div className="fixed inset-0 grid-canvas pointer-events-none">
        {/* Manual Crosshairs at intersections */}
        <div className="crosshair" style={{ top: '39px', left: '39px' }}></div>
        <div className="crosshair" style={{ top: '39px', right: '39px' }}></div>
        <div className="crosshair" style={{ bottom: '39px', left: '39px' }}></div>
        <div className="crosshair" style={{ bottom: '39px', right: '39px' }}></div>
        <div className="crosshair" style={{ top: '50%', left: '50%', transform: 'translate(-4px, -4px)' }}></div>
      </div>
      
      {/* SYSTEM DATA ANCHORS (DECORATIVE) */}
      <div className="fixed top-6 left-6 flex flex-col gap-1 z-20">
        <span className="label-font text-[10px] uppercase tracking-[0.2em] font-bold text-black">SYSTEM_INTEL_V.01</span>
        <span className="label-font text-[9px] uppercase tracking-widest text-gray-400">LAT: 47.3769 N / LON: 8.5417 E</span>
      </div>
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-1 z-20">
        <span className="label-font text-[9px] uppercase tracking-widest text-gray-400">STATUS: WAITING_FOR_AUTH</span>
        <span className="label-font text-[10px] uppercase tracking-[0.2em] font-bold text-black">AUTH_MODULE_ACTIVE</span>
      </div>

      {/* LOGIN PLAQUE */}
      <main className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white border border-black p-10 flex flex-col gap-8 shadow-none relative">
          
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="font-black text-2xl tracking-tighter uppercase font-headline">SYSTEM_LOGIN</h1>
            <div className="h-px bg-black w-12"></div>
          </div>

          {/* Clerk Placeholder Section */}
          <div className="relative group">
            <div className="border border-dashed border-gray-300 h-48 flex items-center justify-center p-6 bg-surface-container/30">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-gray-400 text-3xl">terminal</span>
                <p className="label-font text-[11px] uppercase tracking-widest text-gray-500 font-medium">
                  [ CLERK AUTHENTICATION MODULE ]
                </p>
              </div>
            </div>
            {/* Technical Metadata Overlap */}
            <div className="absolute -top-3 -right-2 bg-white px-2 border border-white">
              <span className="label-font text-[9px] text-black font-bold">MODULE_ID: 882-AX</span>
            </div>
          </div>

          {/* Interaction Section */}
          <div className="flex flex-col gap-4 mt-4">
            <button 
              onClick={handleGuestBypass}
              className="cursor-pointer w-full border border-black py-4 px-6 flex items-center justify-between group bg-white text-black transition-none hover:bg-black hover:text-white"
            >
              <span className="label-font text-[11px] font-bold uppercase tracking-[0.2em]">
                &gt; INITIATE GUEST BYPASS_
              </span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-none">arrow_forward</span>
            </button>
            <div className="flex justify-between items-center px-1">
              <span className="label-font text-[9px] uppercase tracking-widest text-gray-400">SECURE_CHANNEL_L3</span>
              <span className="cursor-pointer label-font text-[9px] uppercase tracking-widest text-black underline underline-offset-4 hover:text-gray-500 transition-none">
                RESET_ACCESS
              </span>
            </div>
          </div>

          {/* Absolute Positioned Corner Marks */}
          <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-black"></div>
          <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-black"></div>
        </div>

        {/* Footnote alignment */}
        <div className="mt-6 flex justify-center">
          <p className="label-font text-[10px] uppercase tracking-[0.3em] text-gray-400">
            PROPRIETARY ARCHITECTURE © 2026
          </p>
        </div>
      </main>

      {/* SIDE DATUM LINE */}
      <div className="fixed right-12 top-0 bottom-0 w-px bg-black opacity-5"></div>
      <div className="fixed left-12 top-0 bottom-0 w-px bg-black opacity-5"></div>
    </div>
  );
};

export default Login;
