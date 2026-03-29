import React from 'react';

const Playground3D = ({ locked }) => {
  return (
    <div className="w-full h-full relative border border-black overflow-hidden bg-white architectural-grid">
      
      {/* Background Guest Plaque */}
      {locked && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 border border-black bg-white px-8 py-3 z-30">
          <p className="font-['Space_Grotesk'] text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            ACCESS LIMITED: AUTHENTICATION REQUIRED TO ENABLE FULL 3D ENGINE
          </p>
        </div>
      )}

      {/* Crosshairs at intersections */}
      <div className="crosshair top-0 left-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      <div className="crosshair bottom-0 right-0 translate-x-1/2 translate-y-1/2 hidden md:block"></div>
      <div className="crosshair top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      <div className="crosshair top-0 right-0 translate-x-1/2 -translate-y-1/2 hidden md:block"></div>

      {/* Floating Left Toolbar (Toggles) */}
      <div className={`absolute left-8 top-12 z-20 flex flex-col gap-2 ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
        <button className="bg-white border border-black px-4 py-2 font-label text-[11px] tracking-widest hover:bg-black hover:text-white flex items-center justify-between w-64 group transition-none">
            <span>[ TOGGLE LOAD-BEARING ]</span>
            <span className="w-2 h-2 bg-black group-hover:bg-white transition-none"></span>
        </button>

        <button className="bg-black text-white border border-black px-4 py-2 font-label text-[11px] tracking-widest flex items-center justify-between w-64 transition-none">
            <span>[ MATERIAL: RCC ]</span>
            <span className="material-symbols-outlined text-sm">check</span>
        </button>

        <button className="bg-white border border-black px-4 py-2 font-label text-[11px] tracking-widest hover:bg-black hover:text-white flex items-center justify-between w-64 transition-none">
            <span>[ MATERIAL: AAC BLOCKS ]</span>
        </button>
      </div>

      {/* 3D Viewport Area - Isometric Cube SVG */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${locked ? 'opacity-40 grayscale blur-[2px]' : ''}`}>
        <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Isometric lines representation */}
            <svg className="w-full h-full stroke-black stroke-[0.5] fill-none opacity-80 mix-blend-multiply" viewBox="0 0 200 200">
                {/* Base */}
                <path d="M100 160 L40 130 L100 100 L160 130 Z"></path>
                {/* Top */}
                <path d="M100 70 L40 40 L100 10 L160 40 Z"></path>
                {/* Vertical Connectors */}
                <line x1="100" y1="160" x2="100" y2="70"></line>
                <line x1="40" y1="130" x2="40" y2="40"></line>
                <line x1="160" y1="130" x2="160" y2="40"></line>
                {/* Internal Dotted structure */}
                <path d="M100 100 L100 10" strokeDasharray="2,2"></path>
                <path d="M40 40 L160 130" strokeDasharray="2,2"></path>
            </svg>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
                <div className="font-label text-[10px] uppercase tracking-[0.4em] bg-white px-3 py-1 border border-black whitespace-nowrap">
                   {locked ? 'MODEL_PRIMITIVE: LOCKED' : 'MODEL_PRIMITIVE: 001'}
                </div>
            </div>
        </div>
      </div>

      {locked ? null : (
        <div className="absolute right-8 top-12 z-20 w-72 hidden lg:block">
            <div className="border border-black bg-white p-6 shadow-none">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-headline font-black text-xs uppercase tracking-tighter">Live Tradeoff Analysis</h3>
                    <span className="material-symbols-outlined text-sm">query_stats</span>
                </div>
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="font-label text-[9px] text-gray-400">METRIC_01</span>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                            <span className="font-label text-[11px]">COST_SCORE:</span>
                            <span className="font-label text-[11px] font-bold">85/100</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black">
                    <p className="font-label text-[9px] leading-relaxed text-gray-500 uppercase">Analysis reflects structural integrity based on current material selection: Reinforced Cement Concrete.</p>
                </div>
            </div>
        </div>
      )}

      {/* Floating Coordinates Label */}
      <div className="absolute bottom-8 right-8 text-right z-20">
          <div className="font-label text-[10px] text-black tracking-widest border-r-2 border-black pr-4 leading-relaxed">
              X: 104.22<br/>
              Y: 284.91<br/>
              Z: 00.00
          </div>
      </div>

    </div>
  );
};

export default Playground3D;
