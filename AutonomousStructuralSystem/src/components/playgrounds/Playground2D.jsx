import React from 'react';

const Playground2D = ({ locked }) => {
  return (
    <div className="w-full h-full relative border border-black overflow-hidden bg-white architectural-grid">
      {/* Background Guest Plaque */}
      {locked && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 border border-black bg-white px-8 py-3 z-30">
          <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            ACCESS LIMITED: AUTHENTICATION REQUIRED TO ENABLE 2D SKETCHPAD
          </p>
        </div>
      )}

      {/* Crosshairs at intersections */}
      <div className="crosshair top-0 left-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      <div className="crosshair bottom-0 right-0 translate-x-1/2 translate-y-1/2 hidden md:block"></div>
      <div className="crosshair top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      <div className="crosshair top-0 right-0 translate-x-1/2 -translate-y-1/2 hidden md:block"></div>

      {/* 2D Sketchpad Canvas Container */}
      <div className={`absolute inset-0 flex items-center justify-center p-12 ${locked ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
        <div className="w-full h-full max-w-4xl max-h-2xl border-2 border-black bg-white/80 p-6 flex flex-col pointer-events-none">
          
          <div className="flex justify-between items-center border-b border-black pb-4 mb-4">
              <h3 className="font-headline font-black text-lg uppercase tracking-tighter">Draft Schematic</h3>
              <div className="flex gap-4">
                  <span className="material-symbols-outlined">straighten</span>
                  <span className="material-symbols-outlined">architecture</span>
                  <span className="material-symbols-outlined">polyline</span>
              </div>
          </div>

          <div className="flex-grow flex items-center justify-center relative border border-gray-200">
             <div className="absolute inset-0 grid-canvas opacity-30"></div>
             <p className="font-label text-xs uppercase tracking-[0.2em] text-gray-400 z-10 bg-white px-4 border border-gray-200">
                 [ SKETCHPAD_PRIMITIVE_AREA ]
             </p>
          </div>

        </div>
      </div>

       {/* Floating Coordinates Label */}
       <div className="absolute bottom-8 right-8 text-right z-20">
          <div className="font-label text-[10px] text-black tracking-widest border-r-2 border-black pr-4 leading-relaxed bg-white/80">
              CURSOR_X: ---<br/>
              CURSOR_Y: ---<br/>
              MODE: DRAFT
          </div>
      </div>
    </div>
  );
};

export default Playground2D;
