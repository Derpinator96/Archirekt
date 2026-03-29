import React from 'react';

export const UploadDropzone = ({ locked }) => {
  return (
    <div className="w-full border border-dashed border-[#474747] bg-[#1b1b1b] p-12 flex flex-col items-center justify-center group hover:bg-[#2a2a2a] hover:border-white transition-colors duration-0 relative overflow-hidden">
      
      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#474747] group-hover:border-white transition-colors duration-0"></div>
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#474747] group-hover:border-white transition-colors duration-0"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#474747] group-hover:border-white transition-colors duration-0"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#474747] group-hover:border-white transition-colors duration-0"></div>

      <span className="material-symbols-outlined text-[3rem] text-[#919191] group-hover:text-white mb-4 transition-colors duration-0">
        upload_file
      </span>
      <h3 className="font-headline font-black text-xl tracking-tighter uppercase mb-2 text-white">
        Upload Architecture Plan
      </h3>
      <p className="font-label text-[10px] tracking-widest text-[#c6c6c6] uppercase mb-6">
        {locked ? 'GUEST MODE: UPLOAD DISABLED' : 'Drag and drop .DWG, .DXF, or Images'}
      </p>
      <button 
        disabled={locked} 
        className={`px-6 py-3 border text-[11px] font-label font-bold tracking-[0.2em] uppercase transition-colors duration-0 ${
          locked 
            ? 'border-[#474747] text-[#474747] cursor-not-allowed' 
            : 'border-white text-white hover:bg-white hover:text-black'
        }`}
      >
        [ BROWSE_FILES ]
      </button>
    </div>
  );
};
