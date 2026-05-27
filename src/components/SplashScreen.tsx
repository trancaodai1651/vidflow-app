import React, { useEffect, useState } from 'react';
import { Video, ShieldCheck, Cpu, Terminal } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Đang khởi tạo Rust Core v2...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        if (old === 30) setStatusText('Đang nạp bộ dịch mã di động Portable FFMPEG...');
        if (old === 65) setStatusText('Đang kiểm tra an ninh luồng bảo mật LocalStorage...');
        if (old === 85) setStatusText('Hệ thống ổn định. Đang mở Trung tâm Sản xuất...');
        return old + 5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07080c] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Hiệu ứng lưới ma trận Cyberpunk chìm phía nền */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#00ced1_1px,transparent_1px),linear-gradient(to_bottom,#00ced1_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      <div className="text-center space-y-6 max-w-sm w-full px-6 relative z-10 animate-fade-in">
        {/* Glow Logo */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-[#00ced1] via-[#007aff] to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_50px_rgba(0,206,209,0.4)] relative">
          <Video size={40} className="animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#00ced1] to-[#007aff] blur opacity-30 animate-pulse"></div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-widest text-white">VIDFLOW</h1>
          <p className="text-[10px] text-[#00ced1] font-black tracking-widest uppercase">Industrial Video AI Engine</p>
        </div>

        {/* Console Logs Micro */}
        <div className="bg-black/60 border border-white/5 rounded-xl p-3 text-left font-mono text-[10px] text-gray-400 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 text-gray-500"><Terminal size={10}/> [SYS] Initializing thread pool...</div>
          <div className="flex items-center gap-1.5 text-[#34c759]"><ShieldCheck size={10}/> [AUTH] Local secure vault loaded.</div>
          <div className="flex items-center gap-1.5 text-purple-400"><Cpu size={10}/> [GPU] Acceleration layer optimized.</div>
        </div>

        {/* Progress Bar Giga */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-1.5 overflow-hidden p-[1px]">
            <div className="h-full bg-gradient-to-r from-[#00ced1] via-[#007aff] to-purple-600 rounded-full transition-all duration-100 shadow-[0_0_15px_#00ced1]" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold font-mono tracking-wide">
            <span className="text-gray-500 uppercase">{statusText}</span>
            <span className="text-[#00ced1]">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}