import React from 'react';

const GameViewer = ({ locked }) => {
  return (
    <div className="w-full h-full relative border border-black overflow-hidden bg-white architectural-grid">
      {/* Background Guest Plaque */}
      {locked && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 border border-black bg-white px-8 py-3 z-30">
          <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.3em] uppercase flex items-center gap-3 bg-white">
            <span className="material-symbols-outlined text-xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            ACCESS LIMITED: AUTHENTICATION REQUIRED TO ENABLE IMMERSIVE RENDER
          </p>
        </div>
      )}

      {/* Game Viewer Container */}
      <div className={`absolute inset-0 flex items-center justify-center p-12 ${locked ? 'opacity-30 grayscale blur-sm' : ''}`}>
        <div className="w-full h-full max-w-5xl relative border-2 border-black bg-[#cfc4c5]/20 flex flex-col justify-center items-center">
            
            <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
               <span className="font-label text-[10px] font-bold uppercase tracking-widest text-black bg-white px-2">REC // SIMULATION_ENVIRONMENT</span>
            </div>

            <span className="material-symbols-outlined text-6xl text-black opacity-30">sports_esports</span>
            <p className="font-headline font-black text-2xl tracking-tighter uppercase mt-4 opacity-50">
               AWAITING_RENDER_ENGINE
            </p>

        </div>
      </div>

       {/* Floating Coordinates Label */}
       <div className="absolute bottom-8 right-8 text-right z-20">
          <div className="font-label text-[10px] text-black tracking-widest border-r-2 border-black pr-4 leading-relaxed bg-white/80">
              FPS: 00<br/>
              LATENCY: ---<br/>
              ENGINE_STATE: STANDBY
          </div>
      </div>
    </div>
  );
};

export default GameViewer;
