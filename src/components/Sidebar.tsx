import React from 'react';
import { Sparkles, Video, Layers, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: 'studio' | 'api' | 'brand';
  setActiveView: (view: 'studio' | 'api' | 'brand') => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-68 border-r border-white/[0.06] backdrop-blur-2xl z-10 flex flex-col justify-between bg-black/40 transition-all">
      <div className="p-6 space-y-8">
        <div className="flex items-center gap-3.5 transform hover:scale-105 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#00ced1] via-[#00a3ff] to-[#007aff] rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_25px_rgba(0,206,209,0.4)] animate-pulse">
            <Video size={24} />
          </div>
          <div>
            <span className="text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">VIDFLOW</span>
            <p className="text-[9px] text-[#00ced1] font-bold tracking-widest mt-0.5">STUDIO PRO v2.5</p>
          </div>
        </div>
        
        <nav className="space-y-3">
          <p className="text-[11px] uppercase font-black text-gray-400 tracking-widest px-3">Hệ Thống Lõi</p>
          
          <button onClick={() => setActiveView('studio')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeView === 'studio' ? 'bg-gradient-to-r from-[#00ced1]/20 to-[#007aff]/10 border border-[#00ced1]/40 text-white shadow-[0_0_25px_rgba(0,206,209,0.15)] translate-x-2' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
            <Sparkles size={20} className={activeView === 'studio' ? 'text-[#00ced1] animate-spin' : ''} /> Tự Động Hóa Video
          </button>
          
          <button onClick={() => setActiveView('brand')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeView === 'brand' ? 'bg-gradient-to-r from-[#00ced1]/20 to-[#007aff]/10 border border-[#00ced1]/40 text-white shadow-[0_0_25px_rgba(0,206,209,0.15)] translate-x-2' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
            <Layers size={20} className={activeView === 'brand' ? 'text-[#00ced1]' : ''} /> Brand Kits
          </button>
          
          <button onClick={() => setActiveView('api')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeView === 'api' ? 'bg-gradient-to-r from-[#00ced1]/20 to-[#007aff]/10 border border-[#00ced1]/40 text-white shadow-[0_0_25px_rgba(0,206,209,0.15)] translate-x-2' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
            <Settings size={20} className={activeView === 'api' ? 'text-[#00ced1]' : ''} /> API Credentials
          </button>
        </nav>
      </div>
    </aside>
  );
}