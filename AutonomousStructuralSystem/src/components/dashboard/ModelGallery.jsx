import React from 'react';

const ModelGallery = ({ locked }) => {
  return (
    <div className="w-full py-6 z-30">
      <div className="flex justify-between items-end mb-4 px-12">
        <h4 className="font-label text-[10px] tracking-[0.3em] uppercase">REPOSITORY // RECENT_MODELS {locked && '[LOCKED: READ ONLY]'}</h4>
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
        {/* Model Card 1 */}
        <div className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group">
          <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
            <img 
              className="max-h-full max-w-full grayscale brightness-0 opacity-40 group-hover:opacity-100 transition-opacity" 
              alt="Technical wireframe of a structural box node." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQYR78L_ZrdlaGY3bRtSgq4di6MifHrsdU6V_fIKcB6nPu3Ta1EshyhvOVMN1Y7wf2kvg6QxIJL-zpEzo5NOFFu7NwPNxVgdHKvKOALLCYpoJcaVRJt-sPcqWUSpfhovYm41P73GC_Jb7rnV3cdsmBlTzRRqNsy9IWXEZV11O6bMVi9WGvrYr_qLwQMiGBXTskNpARaSZVHB26S72d8C4ZSQikmSjnw_x14-7RhYyUqhv-Yq2jUv-wl9DgbAjpDBXp-urCSXsGtg"
            />
            {locked && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-black">lock</span>
              </div>
            )}
          </div>
          <div className="p-3 font-mono">
            <div className="text-[8px] text-gray-500 leading-tight">ID: 0x8F92-CA</div>
            <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: 29.03.2026</div>
            <button className="w-full border border-black py-2 text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-none">
              [ VIEW RENDER ]
            </button>
          </div>
        </div>

        {/* Model Card 2 */}
        <div className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group">
          <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
            <img 
              className="max-h-full max-w-full grayscale brightness-0 opacity-40 group-hover:opacity-100 transition-opacity" 
              alt="Technical wireframe of a spiral staircase structure." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4keSWMyhkhSok0wblcvmzGwF5pMi-uAyYFCA5-01v6WcqqyIpRladhD_IoJlvGZ33Acf609-mahngAVGNLby2gvQxU5hSOWOYds817Mk-ucU4VKhe6SGRWHkaCvZDxviKnoEAG3po9PWfytJpJAEsWaFpawOH26mJI2ESm9XxONmi0X8fU0eyYXvrPgf2trZ1Q23irA72IRqwZSbb7Wlle9cI_nXYOiS6CMxNwE_qidTnz-3uyFHoaZHwCt7r5dgeLLAeXXAggA"
            />
             {locked && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-black">lock</span>
              </div>
            )}
          </div>
          <div className="p-3 font-mono">
            <div className="text-[8px] text-gray-500 leading-tight">ID: 0x4A21-EE</div>
            <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: 28.03.2026</div>
            <button className="w-full border border-black py-2 text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-none">
              [ VIEW RENDER ]
            </button>
          </div>
        </div>

        {/* Model Card 3 */}
        <div className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group">
          <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
            <img 
              className="max-h-full max-w-full grayscale brightness-0 opacity-40 group-hover:opacity-100 transition-opacity" 
              alt="Technical wireframe of a roof truss system." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkn0e2XFm4gH74DE9A3lWqSFUN1QshypWU1KaFFT5SUUDqhM5LIIdOKD553D51O4ClzkNEWviMjpja6LKv9TA0W2YFAZuW3t_j5yJk8tf-shysHNopVAb5U4UZvl3C9mG2XcgZGnmorQglahzzoC1EJnuB6Hl6T9c2yOouf0-bE16u_Y-g7NWXgt7WMkXMAFIIc-Xd7ZFgw1iYbztGy1RRa00SQojvhQOJHx0_VHW5fcfyz2VziL1R8WuHoCGD7jhcXBYFmbfSvA"
            />
             {locked && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-black">lock</span>
              </div>
            )}
          </div>
          <div className="p-3 font-mono">
            <div className="text-[8px] text-gray-500 leading-tight">ID: 0xBB82-FF</div>
            <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: 27.03.2026</div>
            <button className="w-full border border-black py-2 text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-none">
              [ VIEW RENDER ]
            </button>
          </div>
        </div>

        {/* Model Card 4 / Placeholder */}
        <div className="flex-shrink-0 w-64 border border-black bg-white cursor-pointer group">
          <div className="h-32 border-b border-black bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-3xl">polyline</span>
            </div>
          </div>
          <div className="p-3 font-mono">
            <div className="text-[8px] text-gray-500 leading-tight">ID: 0x923C-01</div>
            <div className="text-[8px] text-gray-500 leading-tight mb-3">DATE: 26.03.2026</div>
            <button className="w-full border border-black py-2 text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-none">
              [ VIEW RENDER ]
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ModelGallery;
