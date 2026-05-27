import React, { useState, useEffect, useRef } from 'react';
import { Play, FileText, Settings, Trash2, ShieldAlert, Zap, Cpu, Type, Video, Globe, AlertCircle, RefreshCw, Layers, ShieldCheck, HardDrive, Link2, PlusCircle, X, Loader2, AlignLeft, Mic } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export interface QueueItem {
  id: string; title: string; subtitle: string; type: 'script' | 'url'; content: string;
  outputPath: string; aspectRatio: '9:16' | '16:9' | '1:1'; resolution: '1080p' | '720p'; bitrate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number; log: string;
  encoder: 'cpu' | 'gpu'; useSubtitles: boolean; voiceId: string; 
  ttsProvider: 'google' | 'elevenlabs' | 'edge'; // 🎯 Thêm động cơ Edge
}

interface StudioViewProps {
  provider: string; setProvider: (v: any) => void; apiKeys: any; setActiveView: (v: any) => void;
  outputPath: string; setOutputPath: (v: string) => void; aspectRatio: '9:16' | '16:9' | '1:1'; setAspectRatio: (v: any) => void;
  resolution: '1080p' | '720p'; setResolution: (v: any) => void; bitrate: string; setBitrate: (v: string) => void;
  activeTab: 'script' | 'url'; setActiveTab: (v: any) => void; script: string; setScript: (v: string) => void;
  url: string; setUrl: (v: string) => void; addToQueue: () => void; queue: QueueItem[]; isProcessing: boolean;
  processQueueSequentially: () => void; deleteQueueItem: (id: string) => void; clearQueue: () => void;
  encoder: 'cpu' | 'gpu'; setEncoder: (v: 'cpu' | 'gpu') => void;
  useSubtitles: boolean; setUseSubtitles: (v: boolean) => void;
  defaultVoiceId: string; setDefaultVoiceId: (v: string) => void;
  ttsProvider: 'google' | 'elevenlabs' | 'edge'; setTtsProvider: (v: 'google' | 'elevenlabs' | 'edge') => void; // 🎯 Thêm động cơ Edge
  toggleItemSubtitle: (id: string) => void; toggleItemEncoder: (id: string) => void; changeItemVoice: (id: string, voiceId: string) => void;
  voicesList: { id: string, name: string }[];
}

export default function StudioView({
  provider, setProvider, apiKeys, setActiveView, outputPath, setOutputPath, aspectRatio, setAspectRatio,
  resolution, setResolution, bitrate, setBitrate, activeTab, setActiveTab, script, setScript, url, setUrl,
  addToQueue, queue, isProcessing, processQueueSequentially, deleteQueueItem, clearQueue, encoder, setEncoder, useSubtitles, setUseSubtitles,
  defaultVoiceId, setDefaultVoiceId, ttsProvider, setTtsProvider, toggleItemSubtitle, toggleItemEncoder, changeItemVoice, voicesList
}: StudioViewProps) {
  
  const endOfLogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [queue]);
  const activeItem = queue.find(q => q.status === 'processing');
  const [showClearModal, setShowClearModal] = useState(false);

  return (
    <div className="h-full w-full flex bg-[#09090b] text-gray-200 overflow-hidden font-sans">
      
      {/* ================= COLUMN 1 ================= */}
      <section className="w-[38%] shrink-0 min-w-0 flex flex-col border-r border-white/5 bg-gradient-to-b from-[#12141d] to-[#0c0d12] shadow-2xl z-10 relative">
        <div className="p-8 pb-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00ced1] to-[#007aff] flex items-center gap-2"><Zap className="text-[#00ced1] animate-pulse" size={28}/> CỖ MÁY SẢN XUẤT</h2>
          <p className="text-xs text-gray-400 mt-1">Dây chuyền tự động hóa AI chuyển đổi dữ liệu thành video.</p>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl flex justify-between items-center shadow-lg">
            <div className="flex-1 mr-3">
              <label className="text-[10px] font-black text-[#00ced1] tracking-widest block mb-1.5 uppercase flex items-center gap-1.5"><Cpu size={14}/> Trí Tuệ Nhân Tạo (Text)</label>
              <select value={provider} onChange={e => setProvider(e.target.value as any)} className="w-full bg-gradient-to-b from-[#161822] to-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-[#00ced1] transition-all cursor-pointer">
                <option value="gemini">Google Gemini (Mặc định)</option>
                <option value="groq">Groq LPU Speed (Siêu Tốc)</option>
              </select>
            </div>
            <div className="mt-4">{apiKeys[provider] ? <div className="p-3.5 bg-[#34c759]/10 text-[#34c759] rounded-xl"><ShieldCheck size={20}/></div> : <button onClick={() => setActiveView('api')} className="p-3.5 bg-red-500/10 text-red-400 rounded-xl animate-pulse"><ShieldAlert size={20}/></button>}</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/[0.06] pb-2 flex items-center gap-1.5"><Settings size={14} className="text-[#00ced1]"/>Thông Số Biên Dịch</h3>
            <div>
              <label className="text-[10px] font-black text-gray-400 block mb-1">THƯ MỤC XUẤT</label>
              <div className="relative">
                <input type="text" value={outputPath} onChange={e => setOutputPath(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 pl-10 text-xs font-mono font-bold text-gray-300 focus:outline-none focus:border-[#00ced1] transition-all" />
                <HardDrive size={14} className="absolute left-3.5 top-4 text-[#00ced1]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1">KHUNG HÌNH</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full bg-[#161822] border border-white/10 rounded-xl p-3 text-xs font-bold outline-none"><option value="9:16">Dọc 9:16</option><option value="16:9">Ngang 16:9</option><option value="1:1">Vuông 1:1</option></select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1">ĐỘ PHÂN GIẢI</label>
                <select value={resolution} onChange={e => setResolution(e.target.value as any)} className="w-full bg-[#161822] border border-white/10 rounded-xl p-3 text-xs font-bold outline-none"><option value="1080p">FullHD 1080p</option><option value="720p">HD 720p</option></select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1">BITRATE</label>
                <select value={bitrate} onChange={e => setBitrate(e.target.value)} className="w-full bg-[#161822] border border-white/10 rounded-xl p-3 text-xs font-bold outline-none"><option value="8M">8M (Nét)</option><option value="4M">4M (Đẹp)</option><option value="2M">2M (Nhẹ)</option></select>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[250px]">
            <div className="flex border-b border-white/5 mb-4 text-xs font-black uppercase tracking-wider gap-1">
              <button onClick={() => setActiveTab('script')} className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all duration-300 ${activeTab === 'script' ? 'border-[#00ced1] text-[#00ced1] text-sm' : 'border-transparent text-gray-500'}`}><FileText size={14}/>Soạn Kịch Bản</button>
              <button onClick={() => setActiveTab('url')} className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all duration-300 ${activeTab === 'url' ? 'border-[#00ced1] text-[#00ced1] text-sm' : 'border-transparent text-gray-500'}`}><Link2 size={14}/>Dán Link Bài Báo</button>
            </div>
            <div className="flex-1 flex group">
              {activeTab === 'script' ? <textarea placeholder="Nhập nội dung ý tưởng văn bản..." value={script} onChange={e => setScript(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-[#00ced1] resize-none custom-scrollbar" /> : <input type="text" placeholder="Nhập Link bài viết..." value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-[#00ced1] h-14" />}
            </div>
            {/* THAY THẾ NÚT BẤM CŨ BẰNG ĐOẠN NÀY VÀO CUỐI CỘT 1 TRONG FILE StudioView.tsx */}
            <button 
              onClick={addToQueue} 
              disabled={isProcessing && (!script.trim() && !url.trim())} 
              className={`w-full mt-5 py-4 font-black text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border hover:scale-[1.01] hover:shadow-lg ${
                activeTab === 'url' 
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 hover:from-blue-600/30 hover:to-cyan-500/30 border-blue-500/40 text-cyan-400'
                  : 'bg-gradient-to-r from-[#00ced1]/20 via-[#007aff]/10 to-transparent hover:from-[#00ced1]/30 hover:to-[#007aff]/20 border-[#00ced1]/40 text-[#00ced1]'
              }`}
            >
              {activeTab === 'url' ? (
                <>
                  <Link2 size={18} className="animate-pulse" /> IMPORT BÀI BÁO VÀO DÂY CHUYỀN
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> ĐẨY KỊCH BẢN VÀO DÂY CHUYỀN
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ================= COLUMN 2 ================= */}
      <section className="w-[37%] shrink-0 min-w-0 flex flex-col relative border-r border-white/5 bg-black/10">
        <div className="p-8 border-b border-white/5 bg-black/20 backdrop-blur-md flex justify-between items-center z-10">
          <h2 className="text-lg font-black flex items-center gap-2 tracking-widest"><Layers className="text-[#007aff]" size={20}/> GIÁM SÁT DÂY CHUYỀN <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-white/70 ml-2">{queue.length}</span></h2>
          <div className="flex gap-2">
            {queue.length > 0 && <button onClick={() => !isProcessing && setShowClearModal(true)} disabled={isProcessing} className="p-3 bg-red-500/10 text-red-400 rounded-xl transition-all border border-red-500/20 disabled:opacity-20 hover:scale-105" title="Xóa toàn bộ"><Trash2 size={16}/></button>}
            <button onClick={processQueueSequentially} disabled={isProcessing || queue.filter(q => q.status === 'pending').length === 0} className="px-5 py-3 bg-gradient-to-r from-blue-600 via-[#007aff] to-[#00ced1] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all hover:scale-[1.03] disabled:opacity-20">
              {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16}/>} BẮT ĐẦU SẢN XUẤT
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-4 custom-scrollbar z-10">
          {queue.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl p-6 text-center"><Video size={50} className="mb-4 opacity-50" /><p className="font-bold tracking-widest">HÀNG ĐỢI TRỐNG</p></div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className={`p-5 rounded-2xl border transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden backdrop-blur-md ${item.status === 'processing' ? 'bg-[#1a1c28]/80 border-[#00ced1]/50 shadow-[0_0_20px_rgba(0,206,209,0.1)]' : item.status === 'completed' ? 'bg-[#34c759]/[0.02] border-[#34c759]/40' : item.status === 'failed' ? 'bg-red-500/10 border-red-500/40' : 'bg-white/[0.01] border-white/[0.06]'}`}>
                {item.status === 'processing' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ced1] to-transparent animate-pulse"></div>}
                {item.status !== 'processing' && <button onClick={() => deleteQueueItem(item.id)} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-all p-1 bg-white/5 rounded-md"><X size={12} /></button>}

                <div className="flex justify-between items-start mb-3 pr-5">
                  <div className="flex items-start gap-3 w-full min-w-0">
                    <div className="mt-1 flex-shrink-0">{item.type === 'url' ? <Globe size={18} className="text-[#00ced1]" /> : <AlignLeft size={18} className="text-purple-400" />}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white truncate text-base">{item.title}</h3>
                      <p className="text-xs text-gray-500 font-medium truncate">{item.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.ttsProvider === 'elevenlabs' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : item.ttsProvider === 'edge' ? 'bg-[#00ced1]/10 text-[#00ced1] border-[#00ced1]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>⚡ {item.ttsProvider.toUpperCase()}</span>
                  <button onClick={() => item.status === 'pending' && toggleItemSubtitle(item.id)} disabled={item.status !== 'pending'} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${item.useSubtitles ? 'bg-[#00ced1]/10 text-[#00ced1] border-[#00ced1]/30 hover:bg-[#00ced1]/20' : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'} ${item.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}>📝 SUB: {item.useSubtitles ? 'ON' : 'OFF'}</button>
                  <button onClick={() => item.status === 'pending' && toggleItemEncoder(item.id)} disabled={item.status !== 'pending'} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${item.encoder === 'gpu' ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/30 hover:bg-[#34c759]/20' : 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/30 hover:bg-[#007aff]/20'} ${item.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}>⚙️ ENGINE: {item.encoder.toUpperCase()}</button>
                  
                  {/* 🎯 Dropdown tuỳ biến giọng cho từng Video dựa theo Engine của video đó */}
                  {item.ttsProvider !== 'google' && (
                    <select value={item.voiceId} onChange={(e) => changeItemVoice(item.id, e.target.value)} disabled={item.status !== 'pending'} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border outline-none ${item.status !== 'pending' ? 'bg-gray-800/50 text-gray-500 border-gray-600 cursor-not-allowed' : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 cursor-pointer hover:-translate-y-0.5'}`}>
                      {item.ttsProvider === 'elevenlabs' 
                        ? voicesList.map(v => <option key={v.id} value={v.id} className="bg-[#12131a]">{v.name.split(' ')[0]}</option>)
                        : [
                            { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My' },
                            { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh' }
                          ].map(v => <option key={v.id} value={v.id} className="bg-[#12131a]">{v.name}</option>)
                      }
                    </select>
                  )}
                </div>

                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden mb-3 border border-white/[0.05] relative">
                  <div className={`h-full transition-all duration-700 ease-out ${item.status === 'completed' ? 'bg-gradient-to-r from-[#34c759] to-[#30d158]' : item.status === 'failed' ? 'bg-gradient-to-r from-red-600 to-pink-500' : 'bg-gradient-to-r from-[#00ced1] via-[#007aff] to-blue-600'}`} style={{ width: `${item.progress}%` }}></div>
                </div>

                <p className={`text-xs font-mono font-medium line-clamp-3 break-all ${item.status === 'failed' ? 'text-red-400' : item.status === 'completed' ? 'text-[#34c759]' : 'text-[#00ced1]'}`}>
                  {item.status === 'processing' ? <span className="animate-pulse">⚡ {item.log}</span> : item.log}
                </p>

                {item.status === 'completed' && <button onClick={() => { invoke('open_exported_video', { path: item.log.replace('🎉 Xuất file: ', '') }); }} className="w-full mt-3 py-2.5 bg-[#34c759]/20 hover:bg-[#34c759]/30 border border-[#34c759]/40 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"><Play size={14} className="fill-white"/> XEM VIDEO THÀNH PHẨM</button>}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= COLUMN 3 ================= */}
      <section className="w-[25%] shrink-0 min-w-0 flex flex-col bg-[#0c0d12] shadow-2xl z-20">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40"><span className="text-xs font-mono font-bold text-green-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div> SYSTEM ONLINE</span></div>

        <div className="p-6 space-y-6 border-b border-white/5 bg-gradient-to-b from-[#12141d] to-[#0c0d12]">
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-1.5"><Mic size={14}/> ĐỘNG CƠ ÂM THANH (TTS)</label>
            <div className="flex bg-[#161822] p-1.5 rounded-xl border border-white/10 gap-1.5 flex-wrap">
              <button onClick={() => { setTtsProvider('edge'); setDefaultVoiceId('vi-VN-HoaiMyNeural'); }} className={`flex-1 min-w-[30%] py-2.5 rounded-lg text-xs font-bold transition-all ${ttsProvider === 'edge' ? 'bg-[#00ced1] text-black shadow-[0_0_15px_rgba(0,206,209,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>Microsoft (Free Pro)</button>
              <button onClick={() => setTtsProvider('google')} className={`flex-1 min-w-[30%] py-2.5 rounded-lg text-xs font-bold transition-all ${ttsProvider === 'google' ? 'bg-[#007aff] text-white shadow-[0_0_15px_rgba(0,122,255,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>Google (Chữa cháy)</button>
              <button onClick={() => { setTtsProvider('elevenlabs'); if(voicesList.length > 0) setDefaultVoiceId(voicesList[0].id); }} className={`flex-1 min-w-[30%] py-2.5 rounded-lg text-xs font-bold transition-all ${ttsProvider === 'elevenlabs' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>ElevenLabs (Pro)</button>
            </div>
          </div>

          {ttsProvider !== 'google' && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-1.5">🎙️ CHỌN GIỌNG MC ({ttsProvider.toUpperCase()})</label>
              <select value={defaultVoiceId} onChange={(e) => setDefaultVoiceId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-purple-400 focus:outline-none focus:border-[#00ced1] transition-all outline-none cursor-pointer">
                {ttsProvider === 'elevenlabs' 
                  ? voicesList.map(v => <option key={v.id} value={v.id} className="bg-[#12131a]">{v.name}</option>)
                  : [
                      { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ - Chuẩn Review Phim)' },
                      { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam - Trầm ấm kể chuyện)' }
                    ].map(v => <option key={v.id} value={v.id} className="bg-[#12131a]">{v.name}</option>)
                }
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-1.5"><Cpu size={14}/> MẶC ĐỊNH RENDER ENGINE</label>
            <div className="flex bg-[#161822] p-1.5 rounded-xl border border-white/10 gap-1.5">
              <button onClick={() => setEncoder('cpu')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${encoder === 'cpu' ? 'bg-[#00ced1] text-black shadow-[0_0_15px_rgba(0,206,209,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>CPU (Ổn định)</button>
              <button onClick={() => setEncoder('gpu')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${encoder === 'gpu' ? 'bg-[#34c759] text-black shadow-[0_0_15px_rgba(52,199,89,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>GPU (Siêu Tốc)</button>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-1.5"><Type size={14}/> MẶC ĐỊNH PHỤ ĐỀ</label>
            <div className="flex bg-[#161822] p-1.5 rounded-xl border border-white/10 gap-1.5">
              <button onClick={() => setUseSubtitles(true)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${useSubtitles ? 'bg-[#007aff] text-white shadow-[0_0_15px_rgba(0,122,255,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>BẬT (Có chữ)</button>
              <button onClick={() => setUseSubtitles(false)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${!useSubtitles ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>TẮT (Ẩn phụ đề)</button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col bg-[#050508] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(18,24,38,1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          <div className="text-[10px] font-black text-gray-500 tracking-widest mb-3 uppercase flex items-center justify-between z-10">Console Monitor<span className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/70"></div><div className="w-2 h-2 rounded-full bg-yellow-500/70"></div><div className="w-2 h-2 rounded-full bg-green-500/70"></div></span></div>
          
          <div className="flex-1 bg-black rounded-xl border border-white/5 p-5 font-mono text-[11px] text-green-400 overflow-y-auto space-y-2.5 custom-scrollbar shadow-inner relative z-10">
            <p className="text-gray-500">--- KHỞI ĐỘNG HỆ THỐNG THÀNH CÔNG ---</p>
            {activeItem ? (
              <div className="space-y-2 bg-[#00ced1]/5 p-3 rounded-lg border border-[#00ced1]/10">
                <p className="text-[#00ced1] font-bold animate-pulse">▶ Nạp lệnh: {activeItem.title.substring(0, 15)}...</p>
                <p className="text-gray-300 break-all">» {activeItem.log}</p>
              </div>
            ) : <p className="text-gray-500 animate-pulse flex items-center gap-2"><Loader2 size={12} className="animate-spin"/> Dây chuyền đợi lệnh...</p>}
            
            {queue.filter(q => q.status === 'failed').map(q => (
              <div key={q.id} className="text-red-400 bg-red-500/5 p-2 rounded-md border border-red-500/10 break-all line-clamp-2">
                ⚠️ Lỗi: {q.log}
              </div>
            ))}
            <div ref={endOfLogRef} />
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12131a] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center border border-red-500/20"><AlertCircle size={24} /></div>
            <h4 className="text-lg font-black text-white">Xác nhận xoá hàng loạt?</h4>
            <div className="flex gap-3 pt-2"><button onClick={() => setShowClearModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all border border-white/5">HỦY</button><button onClick={() => { clearQueue(); setShowClearModal(false); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition-all">XÓA SẠCH</button></div>
          </div>
        </div>
      )}
    </div>
  );
}