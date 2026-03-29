import React from 'react';

const ModelGallery = ({ models = [] }) => {
  const loading = false;

  return (
    <div className="w-full py-6 z-30">
      <div className="flex justify-between items-end mb-4 px-12">
        <h4 className="font-label text-[10px] tracking-[0.3em] uppercase">REPOSITORY // GENERATED_MODELS</h4>
        <div className="flex gap-2">
          <button className="border border-black p-1 hover:bg-black hover:text-white transition-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="border border-black p-1 hover:bg-black hover:text-white transition-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div className={`flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-12`}>
        
        {loading && (
             <div className="flex-shrink-0 w-64 border border-black bg-white flex items-center justify-center h-48">
                 <span className="font-label text-[10px] uppercase text-gray-500 tracking-widest">[ LOADING DATABANKS... ]</span>
             </div>
        )}

        {!loading && models.length === 0 && (
            <div className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group">
              <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full h-full border border-dashed border-gray-300 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-gray-300 text-3xl mb-2">polyline</span>
                  <span className="font-label text-[8px] text-gray-400 tracking-widest text-center">NO DATA<br/>UPLOAD FLOORPLAN</span>
                </div>
              </div>
              <div className="p-3 font-mono">
                <div className="text-[8px] text-gray-500 leading-tight">ID: NULL</div>
                <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: --.--.----</div>
                <button className="w-full border border-black py-2 text-[9px] uppercase tracking-widest text-gray-300 transition-none cursor-not-allowed">
                  [ WAITING ]
                </button>
              </div>
            </div>
        )}

        {!loading && models.map((model) => (
            <div key={model.id} className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group hover:-translate-y-1 transition-transform">
              <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center overflow-hidden relative p-4">
                {/* Dynamically Loaded Base64 OpenCV Thumbnail */}
                <img 
                  className="max-h-full max-w-full grayscale opacity-60 group-hover:opacity-100 transition-opacity mix-blend-multiply" 
                  alt="Dynamically Extracted CV Blueprint" 
                  src={model.thumbnail}
                />
                
                 {/* Lock overlay removed */}
              </div>
              <div className="p-3 font-mono">
                <div className="text-[8px] text-gray-500 leading-tight">ID: {model.id}</div>
                <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: {model.date}</div>
                <button className="w-full border border-black py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                  [ VIEW 3D RENDER ]
                </button>
              </div>
            </div>
        ))}

        {/* Static Padder to ensure horizontal scroll doesn't cut off wildly */}
        {models.length > 0 && (
             <div className="flex-shrink-0 w-8" />
        )}

      </div>
    </div>
  );
};

export default ModelGallery;
