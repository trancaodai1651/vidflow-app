import React from 'react';
import { Key, Save, ShieldCheck, Cpu, Mic, Image as ImageIcon, Globe, Newspaper, AlertCircle, Sparkles } from 'lucide-react';

interface ApiViewProps {
  apiKeys: { gemini: string; openrouter: string; groq: string; openai: string; pexels: string; elevenlabs: string; };
  setApiKeys: React.Dispatch<React.SetStateAction<{ gemini: string; openrouter: string; groq: string; openai: string; pexels: string; elevenlabs: string; }>>;
  handleSaveKeys: () => void;
  keySaveStatus: string;
}

export default function ApiView({ apiKeys, setApiKeys, handleSaveKeys, keySaveStatus }: ApiViewProps) {
  
  // Danh bạ hệ thống các trang báo điện tử tương thích 100% với lõi Scraper của sếp
  const supportedNewsSites = [
    { name: 'VnExpress', url: 'vnexpress.net', category: 'Tổng hợp' },
    { name: 'Tuổi Trẻ', url: 'tuoitre.vn', category: 'Thời sự - Xã hội' },
    { name: 'Dân Trí', url: 'dantri.com.vn', category: 'Tin tức 24h' },
    { name: 'Thanh Niên', url: 'thanhnien.vn', category: 'Tổng hợp' },
    { name: 'CafeF', url: 'cafef.vn', category: 'Tài chính - Chứng khoán' },
    { name: 'Kênh 14', url: 'kenh14.vn', category: 'Giới trẻ - Giải trí' },
    { name: 'Vietnamnet', url: 'vietnamnet.vn', category: 'Chính trị - Đời sống' },
  ];

  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-[#050508] custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ================= STICKY HEADER CONTROL BAR ================= */}
        <div className="backdrop-blur-xl bg-[#0c0e17]/80 border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00ced1] via-purple-400 to-[#007aff] flex items-center gap-2.5">
              <Key className="text-[#00ced1]" size={26}/> TRUNG TÂM KIỂM SOÁT AN NINH API
            </h2>
            <p className="text-xs text-gray-400 mt-1">Cấu hình mã khóa bảo mật để cấp quyền năng vận hành cho toàn bộ dây chuyền video tự động.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-mono font-bold text-[#34c759] tracking-wide bg-[#34c759]/5 px-3 py-2 rounded-lg border border-[#34c759]/10 animate-pulse empty:hidden">
              {keySaveStatus}
            </span>
            <button 
              onClick={handleSaveKeys} 
              className="px-6 py-3.5 bg-gradient-to-r from-[#00ced1] via-purple-600 to-[#007aff] hover:shadow-[0_0_25px_rgba(0,206,209,0.3)] text-white font-black text-xs rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <Save size={14} /> LƯU CẤU HÌNH CỤC BỘ
            </button>
          </div>
        </div>

        {/* ================= DASHBOARD SPLIT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* 🖥️ KHU VỰC CÁC BIỂU MẪU CẤU HÌNH (CHIẾM 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. KHỐI TRÍ TUỆ NHÂN TẠO (LLM ENGINE) */}
            <div className="bg-[#0d0f17]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00ced1] to-orange-500"></div>
              <h3 className="text-xs font-black tracking-widest text-[#00ced1] uppercase flex items-center gap-2">
                <Cpu size={14}/> 01. ĐỘNG CƠ PHÂN TÍCH VÀ CÔ ĐỌNG VĂN BẢN (LLM)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-300">Google Gemini API Key</label>
                    <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 px-1.5 py-0.5 rounded">Model: gemini-3.5-flash</span>
                  </div>
                  <input type="password" value={apiKeys.gemini || ''} onChange={e => setApiKeys({...apiKeys, gemini: e.target.value})} placeholder="AIzaSy..." className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-[#00ced1] focus:ring-1 focus:ring-[#00ced1]/20 transition-all shadow-inner" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-300">Groq LPU API Key</label>
                      <span className="text-[9px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/10 px-1.5 py-0.5 rounded">Llama-3.3 Siêu Tốc</span>
                    </div>
                    <input type="password" value={apiKeys.groq || ''} onChange={e => setApiKeys({...apiKeys, groq: e.target.value})} placeholder="gsk_..." className="w-full bg-black/50 border border-orange-500/20 rounded-xl p-3.5 text-xs font-mono text-orange-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-300">OpenRouter Free Key</label>
                      <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded">Hàng đợi Dự phòng</span>
                    </div>
                    <input type="password" value={apiKeys.openrouter || ''} onChange={e => setApiKeys({...apiKeys, openrouter: e.target.value})} placeholder="sk-or-v1-..." className="w-full bg-black/50 border border-blue-500/20 rounded-xl p-3.5 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-inner" />
                  </div>
                </div>

                {/* Giữ nguyên biến ẩn OpenAI của sếp để né lỗi TypeScript */}
                <div className="opacity-40 hover:opacity-100 transition-opacity">
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">OpenAI Gateway (Mở rộng)</label>
                  <input type="password" value={apiKeys.openai || ''} onChange={e => setApiKeys({...apiKeys, openai: e.target.value})} placeholder="sk-..." className="w-full bg-black/50 border border-white/5 rounded-xl p-3 text-xs font-mono text-gray-400 focus:outline-none focus:border-gray-500 transition-all" />
                </div>
              </div>
            </div>

            {/* 2. KHỐI GIỌNG ĐỌC MC PREMIUM (ELEVENLABS) */}
            <div className="bg-[#0d0f17]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black tracking-widest text-purple-400 uppercase flex items-center gap-2">
                  <Mic size={14}/> 02. ĐỘNG CƠ GIỌNG ĐỌC MC VOICE (ELEVENLABS BẢN QUYỀN)
                </h3>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold">Premium Speech</span>
              </div>
              <input type="password" value={apiKeys.elevenlabs || ''} onChange={e => setApiKeys({...apiKeys, elevenlabs: e.target.value})} placeholder="xi-api-key-xxxxxxxxxxxxxxxxxxxxxxxx" className="w-full bg-[#11131c] border border-white/10 rounded-xl px-4 py-3.5 text-xs font-mono text-purple-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-white shadow-inner" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Mã Token dùng để đồng bộ kho MC ảo biểu cảm nâng cao. Nếu sếp dùng động cơ miễn phí <strong className="text-[#00ced1]">Microsoft Edge TTS (Hoài My / Nam Minh)</strong> thì hoàn toàn có thể bỏ trống ô này mà không lo ảnh hưởng đến hệ thống.
              </p>
            </div>

            {/* 3. KHỐI TÀI NGUYÊN ĐỒ HỌA (PEXELS B-ROLL) */}
            <div className="bg-[#0d0f17]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-600"></div>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black tracking-widest text-green-400 uppercase flex items-center gap-2">
                  <ImageIcon size={14}/> 03. THƯ VIỆN VIDEO B-ROLL ĐIỆN ẢNH NỀN TẢNG (PEXELS)
                </h3>
                <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold">Stock Videos</span>
              </div>
              <input type="password" value={apiKeys.pexels || ''} onChange={e => setApiKeys({...apiKeys, pexels: e.target.value})} placeholder="Dán mã Token Pexels chính thức của sếp vào đây..." className="w-full bg-black/50 border border-green-500/20 rounded-xl p-3.5 text-xs font-mono text-green-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all shadow-inner" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Cung cấp khóa API để hệ thống tự động dò tìm, tải xuống các đoạn video phong cảnh nền (B-Roll) độ nét cao, chống lặp hình và vượt qua các giới hạn băng thông tải của bên thứ ba.
              </p>
            </div>

          </div>

          {/* 📰 KANBAN GIỚI THIỆU DANH SÁCH BÁO TƯƠNG THÍCH (CHIẾM 1/3) */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-gradient-to-b from-[#0d0f17] to-[#06070a] border border-white/5 rounded-2xl p-6 flex flex-col h-[610px] shadow-2xl relative">
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/10"><Newspaper size={18} className="text-blue-400" /></div>
                <div>
                  <h4 className="text-xs font-black tracking-wider text-white">DANH MỤC NGUỒN BÁO</h4>
                  <p className="text-[10px] text-gray-400">Hỗ trợ trích xuất tự động bằng URL</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                Khi sếp dán đường dẫn (Link) thuộc các cơ quan báo chí này vào dây chuyền, lõi Scraper của hệ thống sẽ tự động bóc tách, tải ảnh mượt mà:
              </p>

              {/* Danh sách cuộn mượt các đầu báo hỗ trợ */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {supportedNewsSites.map((site, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-300 group cursor-default">
                    <div className="flex items-center gap-2.5">
                      <Globe size={13} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                      <div>
                        <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{site.name}</p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">{site.url}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase bg-white/5 px-2 py-1 rounded text-gray-400 group-hover:text-blue-300 transition-colors">{site.category}</span>
                  </div>
                ))}
              </div>

              {/* Box Lưu ý kỹ thuật chân trang */}
              <div className="mt-4 p-3 bg-yellow-500/[0.03] border border-yellow-500/10 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="text-yellow-500/80 mt-0.5 shrink-0" />
                <p className="text-[10px] text-yellow-500/70 leading-relaxed">
                  Hệ thống cào quét dựa trên cấu trúc thẻ Semantic chuẩn <code>&lt;p&gt;</code>. Các trang báo bắt đăng nhập, chặn tường lửa hoặc dùng cơ chế Hydration nặng cần sao chép văn bản thủ công vào ô kịch bản.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}