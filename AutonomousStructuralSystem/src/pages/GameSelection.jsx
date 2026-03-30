import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelContext } from '../context/ModelContext';

const GameSelection = () => {
  const navigate = useNavigate();
  const { savedModels, loading } = useModelContext();

  return (
    <div className="bg-white text-black font-body selection:bg-black selection:text-white pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white border-b border-black">
        <div className="flex items-center h-full">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 group px-4 h-full border-r border-black hover:bg-black hover:text-white transition-none"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="font-label text-[10px] tracking-widest uppercase">Back</span>
          </button>
          <div className="text-xl font-black text-black border-r border-black px-6 h-full flex items-center">
            ARCH-SELECT-01
          </div>
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <h1 className="font-label text-xs tracking-[0.3em] uppercase font-bold">Select_Model_For_Immersive_Render</h1>
        </div>
        <nav className="flex h-full items-center">
          <div className="flex items-center gap-8 px-6">
            <span className="font-label font-bold tracking-tighter uppercase text-sm text-black underline decoration-2 underline-offset-8 cursor-pointer">Models</span>
            <span className="font-label font-bold tracking-tighter uppercase text-sm text-gray-400 hover:text-black transition-none cursor-pointer">Drafts</span>
            <span className="font-label font-bold tracking-tighter uppercase text-sm text-gray-400 hover:text-black transition-none cursor-pointer">Archive</span>
          </div>
          <div className="flex border-l border-black h-full">
            <button className="px-4 hover:bg-black hover:text-white transition-none"><span className="material-symbols-outlined">settings</span></button>
            <button className="px-4 border-l border-black hover:bg-black hover:text-white transition-none"><span className="material-symbols-outlined">account_circle</span></button>
          </div>
        </nav>
      </header>

      {/* SideNavBar */}
      {/* ... (keeping Sidebar same) */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 flex flex-col z-40 bg-white border-r border-black">
        <div className="flex flex-col flex-1">
          <div className="bg-black text-white flex flex-col items-center justify-center py-6 border-b border-black cursor-pointer">
            <span className="material-symbols-outlined mb-1">architecture</span>
            <span className="font-label uppercase text-[8px] tracking-[0.2em]">Schem</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 border-b border-black hover:bg-gray-100 transition-none cursor-pointer">
            <span className="material-symbols-outlined mb-1">texture</span>
            <span className="font-label uppercase text-[8px] tracking-[0.2em]">Matrl</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 border-b border-black hover:bg-gray-100 transition-none cursor-pointer">
            <span className="material-symbols-outlined mb-1">sensors</span>
            <span className="font-label uppercase text-[8px] tracking-[0.2em]">Sensr</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 border-b border-black hover:bg-gray-100 transition-none cursor-pointer">
            <span className="material-symbols-outlined mb-1">history</span>
            <span className="font-label uppercase text-[8px] tracking-[0.2em]">Histy</span>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-20 pt-16 min-h-screen relative architect-grid">
        <section className="max-w-7xl mx-auto px-12 py-24 relative z-10">
          
          <div className="mb-16 flex justify-between items-end border-b border-black pb-4 bg-white/50 backdrop-blur">
            <div>
              <span className="font-label text-[10px] tracking-widest text-gray-500 uppercase block mb-2">Project Root / Models / Structural</span>
              <h2 className="font-headline text-5xl font-black tracking-tighter uppercase leading-none">Global_Inventory</h2>
            </div>
            <div className="text-right">
              <span className="font-label text-[10px] tracking-widest text-black uppercase block">Active_Nodes: {savedModels.length}</span>
              <span className="font-label text-[10px] tracking-widest text-black uppercase block">Sync_Status: {loading ? 'FETCHING...' : 'VERIFIED'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {loading && (
                <div className="col-span-full py-12 border border-black flex items-center justify-center bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold animate-pulse">[ ACCESSING_REMOTE_DATABANKS... ]</span>
                </div>
            )}

            {!loading && savedModels.length === 0 && (
                <div className="col-span-full py-12 border border-black flex items-center justify-center bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-gray-500">[ NO_MODELS_IN_DATABASE ]</span>
                </div>
            )}

            {!loading && savedModels.map((model, idx) => (
              <div key={model.id} className="group border border-black bg-white flex flex-col shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-300 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="aspect-[4/5] bg-gray-50 border-b border-black relative overflow-hidden p-8 flex items-center justify-center">
                  <img 
                      className="w-full h-full object-contain mix-blend-multiply grayscale opacity-80 group-hover:scale-105 transition-transform duration-700" 
                      alt={`Parsed geometric graph topology ${model.id}`} 
                      src={model.thumbnail}
                  />
                  <div className="absolute top-4 left-4 bg-white font-label text-[8px] tracking-tighter uppercase border border-black px-1">Cam_{String(idx + 1).padStart(2, '0')}</div>
                </div>
                
                <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-label text-[10px] tracking-widest uppercase text-gray-500">Model_ID</span>
                      <span className="font-label text-[10px] tracking-widest uppercase font-bold">{model.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-label text-[10px] tracking-widest uppercase text-gray-500">Date</span>
                      <span className="font-label text-[10px] tracking-widest uppercase font-bold">{model.date}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-label text-[10px] tracking-widest uppercase text-gray-500">Status</span>
                      <span className="font-label text-[10px] tracking-widest uppercase font-bold text-green-600">STAGE 03 COMPLETE</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/dashboard/game/${model.id}`)}
                    className="mt-8 w-full border border-black py-4 font-label text-xs tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white transition-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    Initialize Render
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-black pt-8 bg-white/80 p-6 backdrop-blur shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <div>
              <span className="font-label text-[10px] tracking-[0.2em] font-bold uppercase block mb-4">System_Diagnostics</span>
              <p className="font-body text-xs leading-relaxed text-gray-600">
                  The Autonomous Structural Intelligence System (ASIS) repository is now unified. Projects saved in the 3D Playground are immediately visible here for kinetic analysis.
              </p>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default GameSelection;
