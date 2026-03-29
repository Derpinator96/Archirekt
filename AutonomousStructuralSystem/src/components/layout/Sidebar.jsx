import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 border-r border-black bg-white flex flex-col items-center justify-between py-8 z-40">
      <div className="flex flex-col w-full items-center">
        {/* Active Nav Item */}
        <div className="bg-black text-white w-full flex flex-col items-center py-4 cursor-pointer hover:bg-gray-900 transition-none">
          <span className="material-symbols-outlined">architecture</span>
          <span className="font-['Space_Grotesk'] uppercase text-[8px] tracking-tight mt-1 text-center leading-none px-1">SCHEMATICS</span>
        </div>
        
        <div className="text-black w-full flex flex-col items-center py-4 hover:bg-gray-100 transition-none cursor-pointer">
          <span className="material-symbols-outlined">account_tree</span>
          <span className="font-['Space_Grotesk'] uppercase text-[8px] tracking-tight mt-1 text-center leading-none px-1">NODES</span>
        </div>
        
        <div className="text-black w-full flex flex-col items-center py-4 hover:bg-gray-100 transition-none cursor-pointer">
          <span className="material-symbols-outlined">terminal</span>
          <span className="font-['Space_Grotesk'] uppercase text-[8px] tracking-tight mt-1 text-center leading-none px-1">LOGS</span>
        </div>
        
        <div className="text-black w-full flex flex-col items-center py-4 hover:bg-gray-100 transition-none cursor-pointer">
          <span className="material-symbols-outlined">settings_input_component</span>
          <span className="font-['Space_Grotesk'] uppercase text-[8px] tracking-tight mt-1 text-center leading-none px-1">CONFIG</span>
        </div>
      </div>
      
      <div 
        onClick={handleLogout}
        className="text-black w-full flex flex-col items-center py-4 hover:bg-gray-100 transition-none cursor-pointer border-t border-black"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="font-['Space_Grotesk'] uppercase text-[8px] tracking-tight mt-1 text-center leading-none px-1">EXIT</span>
      </div>
    </aside>
  );
};

export default Sidebar;
