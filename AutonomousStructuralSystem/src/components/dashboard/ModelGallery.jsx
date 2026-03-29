import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelGallery = ({ locked }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchModels = async () => {
         try {
             // In production this would point to a relative /api route
             const res = await axios.get('http://localhost:8000/api/models');
             setModels(res.data);
         } catch (e) {
             console.error("Failed to load models index", e);
         }
         setLoading(false);
     };
     fetchModels();
  }, []);

  return (
    <div className="w-full py-6 z-30">
      <div className="flex justify-between items-end mb-4 px-12">
        <h4 className="font-label text-[10px] tracking-[0.3em] uppercase">REPOSITORY // GENERATED_MODELS {locked && '[LOCKED: READ ONLY]'}</h4>
        <div className="flex gap-2">
          <button className="border border-black p-1 hover:bg-black hover:text-white transition-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="border border-black p-1 hover:bg-black hover:text-white transition-none cursor-pointer">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div className={`flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-12 ${locked ? 'opacity-80' : ''}`}>
        
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
                
                {locked && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-black">lock</span>
                  </div>
                )}
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
