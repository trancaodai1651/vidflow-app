import React from 'react';
import { Key, Save, ShieldCheck } from 'lucide-react';

interface ApiViewProps {
  apiKeys: { gemini: string; openrouter: string; groq: string; openai: string };
  setApiKeys: React.Dispatch<React.SetStateAction<{ gemini: string; openrouter: string; groq: string; openai: string }>>;
  handleSaveKeys: () => void;
  keySaveStatus: string;
}

export default function ApiView({ apiKeys, setApiKeys, handleSaveKeys, keySaveStatus }: ApiViewProps) {
  return (
    <div className="h-full w-full p-12 overflow-y-auto flex justify-center items-center bg-black/10">
      <div className="max-w-2xl w-full space-y-6 transform scale-100 transition-all duration-500">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3">
            <Key className="text-[#00ced1] animate-bounce" size={36}/> THIẾT LẬP AN NISNH API
          </h2>
          <p className="text-sm text-gray-400 mt-2">Nhập mã thông báo bảo mật một lần, hệ thống mã hóa và lưu vĩnh viễn trên thiết bị cục bộ của bạn.</p>
        </div>

        <div className="backdrop-blur-3xl bg-white/[0.02] border border-white/[0.08] p-8 rounded-3xl space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div>
            <label className="text-sm font-black text-gray-300 flex items-center gap-2 mb-2">🌐 GOOGLE GEMINI KEY (Model: gemini-3.5-flash)</label>
            <input type="password" value={apiKeys.gemini} onChange={e => setApiKeys({...apiKeys, gemini: e.target.value})} placeholder="AIzaSy..." className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-base font-mono text-[#00ced1] focus:outline-none focus:border-[#00ced1] transition-all shadow-inner" />
          </div>
          <div>
            <label className="text-sm font-black text-gray-300 flex items-center gap-2 mb-2">🔮 OPENROUTER FREE KEY</label>
            <input type="password" value={apiKeys.openrouter} onChange={e => setApiKeys({...apiKeys, openrouter: e.target.value})} placeholder="sk-or-v1-..." className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-base font-mono text-[#00ced1] focus:outline-none focus:border-[#00ced1] transition-all shadow-inner" />
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm font-black text-[#34c759] tracking-wide animate-pulse">{keySaveStatus}</span>
            <button onClick={handleSaveKeys} className="px-8 py-4 bg-gradient-to-r from-[#00ced1] to-[#007aff] hover:shadow-[0_0_30px_rgba(0,206,209,0.4)] text-white font-black text-sm rounded-xl flex items-center gap-2 hover:scale-[1.03] transition-all duration-300">
              <Save size={18} /> LƯU TRỮ VÀ KHÓA BẢO MẬT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}