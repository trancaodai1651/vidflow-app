import React from 'react';
// 🎯 ĐÃ FIX: Nhập thư viện gọi lõi hệ thống Tauri vào component con
import { invoke } from '@tauri-apps/api/core';
import { Settings, HardDrive, FileText, Link2, PlusCircle, Layers, Play, RefreshCw, Globe, AlignLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface QueueItem {
  id: string; title: string; subtitle: string; type: 'script' | 'url'; content: string;
  outputPath: string; aspectRatio: '9:16' | '16:9' | '1:1'; resolution: '1080p' | '720p'; bitrate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number; log: string;
}

interface StudioViewProps {
  provider: string;
  setProvider: (val: any) => void;
  apiKeys: any;
  setActiveView: (view: any) => void;
  outputPath: string;
  setOutputPath: (val: string) => void;
  aspectRatio: '9:16' | '16:9' | '1:1';
  setAspectRatio: (val: any) => void;
  resolution: '1080p' | '720p';
  setResolution: (val: any) => void;
  bitrate: string;
  setBitrate: (val: string) => void;
  activeTab: 'script' | 'url';
  setActiveTab: (val: any) => void;
  script: string;
  setScript: (val: string) => void;
  url: string;
  setUrl: (val: string) => void;
  addToQueue: () => void;
  queue: QueueItem[];
  isProcessing: boolean;
  processQueueSequentially: () => void;
}

export default function StudioView({
  provider, setProvider, apiKeys, setActiveView,
  outputPath, setOutputPath, aspectRatio, setAspectRatio,
  resolution, setResolution, bitrate, setBitrate,
  activeTab, setActiveTab, script, setScript, url, setUrl,
  addToQueue, queue, isProcessing, processQueueSequentially
}: StudioViewProps) {
  return (
    <div className="flex h-full w-full animate-fade-in">
      
      {/* COLUMN 1: CONFIG & INPUTS */}
      <section className="w-[38%] p-8 flex flex-col bg-black/20 border-r border-white/[0.06] overflow-y-auto space-y-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">CỖ MÁY SẢN XUẤT</h2>
          <p className="text-xs text-gray-400 mt-1">Dây chuyền tự động hóa chuyển đổi dữ liệu thô sang video độ phân giải cao.</p>
        </div>

        {/* Engine Selector */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl flex justify-between items-center">
          <div className="flex-1 mr-3">
            <label className="text-[10px] font-black text-[#00ced1] tracking-widest block mb-1.5 uppercase">Trí Tuệ Nhân Tạo</label>
            <select value={provider} onChange={e => setProvider(e.target.value as any)} className="w-full bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-xl p-3 text-sm font-black text-white focus:outline-none">
              <option value="gemini">Google Gemini 3.5 Core</option>
              <option value="openrouter">OpenRouter Free Cluster</option>
              <option value="groq">Groq LPU Speed</option>
            </select>
          </div>
          <div className="mt-4">
            {apiKeys[provider] ? (
              <div className="p-3.5 bg-[#34c759]/10 border border-[#34c759]/30 text-[#34c759] rounded-xl shadow-[0_0_15px_rgba(52,199,89,0.2)]"><ShieldCheck size={20}/></div>
            ) : (
              <button onClick={() => setActiveView('api')} className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl animate-pulse"><AlertCircle size={20}/></button>
            )}
          </div>
        </div>

        {/* Video Specs Parameters */}
        <div className="backdrop-blur-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/[0.06] pb-2 flex items-center gap-1.5"><Settings size={14} className="text-[#00ced1]"/>Thông Số Cấu Hình Biên Dịch</h3>
          
          <div>
            <label className="text-[10px] font-black text-gray-400 block mb-1">THƯ MỤC XUẤT VIDEO VẬT LÝ</label>
            <div className="relative">
              <input type="text" value={outputPath} onChange={e => setOutputPath(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 pl-10 text-xs font-mono font-bold text-gray-300 focus:outline-none focus:border-[#00ced1] transition-all" />
              <HardDrive size={14} className="absolute left-3.5 top-4 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-black text-gray-400 block mb-1">KHUNG HÌNH</label>
              <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none">
                <option value="9:16">Dọc 9:16 (TikTok)</option>
                <option value="16:9">Ngang 16:9 (YT)</option>
                <option value="1:1">Vuông 1:1 (FB)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 block mb-1">ĐỘ PHÂN GIẢI</label>
              <select value={resolution} onChange={e => setResolution(e.target.value as any)} className="w-full bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none">
                <option value="1080p">FullHD 1080p</option>
                <option value="720p">HD 720p</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 block mb-1">BITRATE (NÉN)</label>
              <select value={bitrate} onChange={e => setBitrate(e.target.value)} className="w-full bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none">
                <option value="8M">8M (Siêu Nét)</option>
                <option value="4M">4M (Chuẩn Đẹp)</option>
                <option value="2M">2M (Dung Lượng Nhẹ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Input Section */}
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex border-b border-white/5 mb-4 text-xs font-black uppercase tracking-wider gap-1">
            <button onClick={() => setActiveTab('script')} className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all duration-300 ${activeTab === 'script' ? 'border-[#00ced1] text-[#00ced1] text-sm' : 'border-transparent text-gray-500'}`}><FileText size={14}/>Soạn Kịch Bản</button>
            <button onClick={() => setActiveTab('url')} className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all duration-300 ${activeTab === 'url' ? 'border-[#00ced1] text-[#00ced1] text-sm' : 'border-transparent text-gray-500'}`}><Link2 size={14}/>Dán Link Bài Báo</button>
          </div>
          
          <div className="flex-1 flex">
            {activeTab === 'script' ? (
              <textarea placeholder="Nhập nội dung ý tưởng văn bản thô của bạn tại đây..." value={script} onChange={e => setScript(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-base font-medium focus:outline-none focus:border-[#00ced1] focus:ring-1 focus:ring-[#00ced1]/20 resize-none leading-relaxed transition-all" />
            ) : (
              <input type="text" placeholder="Nhập Link bài viết (VnExpress, Tuổi Trẻ...)" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-[#00ced1] h-14 transition-all shadow-inner" />
            )}
          </div>

          <button onClick={addToQueue} className="w-full mt-5 py-4 bg-gradient-to-r from-[#00ced1]/20 via-[#007aff]/10 to-transparent hover:from-[#00ced1]/30 hover:to-[#007aff]/20 border border-[#00ced1]/40 text-[#00ced1] font-black text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,206,209,0.15)] hover:scale-[1.01]">
            <PlusCircle size={16} /> ĐẨY VÀO HÀNG ĐỢI SẢN XUẤT
          </button>
        </div>
      </section>

      {/* COLUMN 2: PREMIUM SLATE BATCH QUEUE */}
      <section className="w-[37%] p-8 flex flex-col bg-black/10 border-r border-white/[0.06]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
            <Layers size={18} className="text-[#007aff]" /> GIÁM SÁT DÂY CHUYỀN ({queue.length})
          </h3>
          <button onClick={processQueueSequentially} disabled={isProcessing || queue.filter(q => q.status === 'pending').length === 0} className="px-5 py-3 bg-gradient-to-r from-blue-600 via-[#007aff] to-[#00ced1] disabled:opacity-20 text-white font-black text-xs rounded-xl shadow-[0_4px_20px_rgba(0,122,255,0.3)] flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_4px_30px_rgba(0,206,209,0.4)]">
            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />} BẮT ĐẦU SẢN XUẤT
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {queue.length === 0 ? (
            <div className="h-full border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-gray-600 animate-pulse">
              <Layers size={40} className="mb-2 opacity-10" />
              <p className="text-sm font-bold">Hàng đợi trống rỗng</p>
              <p className="text-xs opacity-50 mt-1 max-w-[240px]">Hãy thêm kịch bản hoặc link tin tức ở bên trái để xếp lịch tự động.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className={`border rounded-2xl p-5 transition-all duration-500 backdrop-blur-md transform hover:-translate-y-1 relative overflow-hidden ${item.status === 'processing' ? 'border-[#00ced1] shadow-[0_0_30px_rgba(0,206,209,0.15)] bg-[#00ced1]/[0.02]' : item.status === 'completed' ? 'border-[#34c759]/40 bg-[#34c759]/[0.02]' : item.status === 'failed' ? 'border-red-500/40 bg-red-500/10' : 'border-white/[0.06] bg-white/[0.01]'}`}>
                {item.status === 'processing' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ced1] to-transparent animate-pulse"></div>}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1.5 flex-1 mr-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'url' ? <Globe size={16} className="text-[#00ced1]" /> : <AlignLeft size={16} className="text-purple-400" />}
                      <h4 className="text-base font-black text-white tracking-wide truncate max-w-[230px]">{item.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center gap-1.5">Nguồn: <span className="text-gray-300 font-bold">{item.subtitle}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${item.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' : item.status === 'completed' ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' : item.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 font-bold">📐 {item.aspectRatio}</span>
                  <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 font-bold">📺 {item.resolution}</span>
                  <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 font-bold">⚡ {item.bitrate}</span>
                </div>

                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden mb-3 border border-white/[0.05] relative">
                  <div className={`h-full transition-all duration-700 ease-out ${item.status === 'completed' ? 'bg-gradient-to-r from-[#34c759] to-[#30d158]' : item.status === 'failed' ? 'bg-gradient-to-r from-red-600 to-pink-500' : 'bg-gradient-to-r from-[#00ced1] via-[#007aff] to-blue-600'}`} style={{ width: `${item.progress}%` }}></div>
                  {item.status === 'processing' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>}
                </div>

                <p className={`text-xs font-mono font-medium truncate ${item.status === 'failed' ? 'text-red-400' : item.status === 'completed' ? 'text-[#34c759]' : 'text-gray-400'}`}>
                  {item.log}
                </p>

                {item.status === 'completed' && (
                  <button 
                    onClick={() => {
                      const filePath = item.log.replace('🎉 Xuất file: ', '');
                      invoke('open_exported_video', { path: filePath });
                    }}
                    className="w-full mt-3 py-2 bg-[#34c759]/20 hover:bg-[#34c759]/30 border border-[#34c759]/40 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(52,199,89,0.1)]"
                  >
                    <Play size={12} className="fill-white"/> XEM VIDEO THÀNH PHẨM
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* COLUMN 3: REALTIME INDUSTRIAL MONITOR CONSOLE */}
      <section className="w-[25%] p-8 flex flex-col justify-between overflow-hidden bg-black/5">
        <div className="flex-1 flex flex-col bg-black/40 border border-white/[0.06] rounded-3xl p-6 mb-5 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(18,24,38,1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-white/[0.06] pb-2 flex items-center gap-1.5">REALTIME CONSOLE MONITOR</h3>
          
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-3 text-[#00ced1]/90 pr-1 select-text">
            <div className="text-gray-500 font-bold">--- KHỞI ĐỘNG HỆ THỐNG THÀNH CÔNG ---</div>
            <div>⚙️ LÕI HỆ THỐNG RUST CORE: HOẠT ĐỘNG</div>
            <div>⚙️ AUDIO ENGINE: GOOGLE TTS (FREE)</div>
            <div>⚙️ MEDIA RENDER: POLLINATIONS GRAPHIC API</div>
            <div>⚙️ COMPILER ENGINE: PORTABLE FFMPEG PACK</div>
            
            {isProcessing && (
              <div className="text-blue-400 animate-pulse font-bold flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Loader2 size={14} className="animate-spin" /> Dây chuyền hàng loạt đang chạy ngầm...
              </div>
            )}

            {queue.filter(q => q.status === 'completed').map(q => (
              <div key={q.id} className="text-[#34c759] font-bold bg-[#34c759]/5 p-2 rounded-lg border border-[#34c759]/10 animate-slide-up">✓ Đã xuất xưởng video thành công cho: {q.title.substring(0,20)}...</div>
            ))}
            {queue.filter(q => q.status === 'failed').map(q => (
              <div key={q.id} className="text-red-400 font-bold bg-red-500/5 p-2 rounded-lg border border-red-500/10 animate-slide-up">⚠️ Task lỗi hệ thống: {q.title.substring(0,20)}...</div>
            ))}
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3 shadow-inner">
          <span className="w-3 h-3 bg-[#34c759] rounded-full animate-pulse shadow-[0_0_15px_#34c759]"></span>
          <span className="text-xs font-black text-gray-400 tracking-widest uppercase">AUTOMATION SYSTEM STABLE</span>
        </div>
      </section>

    </div>
  );
}