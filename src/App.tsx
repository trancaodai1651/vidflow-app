import React from 'react';
import { useAppEngine } from './hooks/useAppEngine';
import StudioView from './components/StudioView';
import ApiView from './components/ApiView'; // 🎯 ỔN ĐỊNH: Gọi đúng linh kiện tách riêng của sếp
import { Video, Settings } from 'lucide-react';

export default function App() {
  const engine = useAppEngine();

  return (
    <div className="h-screen w-screen flex bg-[#050508] text-white overflow-hidden font-sans selection:bg-[#00ced1]/30">
      
      {/* ================= THANH ĐIỀU HƯỚNG SIDEBAR ================= */}
      <div className="w-16 flex flex-col items-center py-6 bg-black/40 border-r border-white/5 z-50 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00ced1] to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,206,209,0.4)] mb-8">
          <Video size={20} className="text-white" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => engine.setActiveView('studio')} 
            className={`p-3 rounded-xl transition-all ${engine.activeView === 'studio' ? 'bg-white/10 text-[#00ced1]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} 
            title="Cỗ máy sản xuất"
          >
            <Video size={22} />
          </button>
          <button 
            onClick={() => engine.setActiveView('api')} 
            className={`p-3 rounded-xl transition-all ${engine.activeView === 'api' ? 'bg-white/10 text-purple-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`} 
            title="Trung tâm cấu hình API"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* ================= KHU VỰC HIỂN THỊ MÀN HÌNH CHÍNH ================= */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* TAB 1: GIAO DIỆN PHÒNG STUDIO SẢN XUẤT */}
        {engine.activeView === 'studio' && (
          <StudioView
            provider={engine.provider} setProvider={engine.setProvider} apiKeys={engine.apiKeys} setActiveView={engine.setActiveView}
            outputPath={engine.outputPath} setOutputPath={engine.setOutputPath} aspectRatio={engine.aspectRatio} setAspectRatio={engine.setAspectRatio}
            resolution={engine.resolution} setResolution={engine.setResolution} bitrate={engine.bitrate} setBitrate={engine.setBitrate}
            activeTab={engine.activeTab} setActiveTab={engine.setActiveTab} script={engine.script} setScript={engine.setScript}
            url={engine.url} setUrl={engine.setUrl} addToQueue={engine.addToQueue} queue={engine.queue} isProcessing={engine.isProcessing}
            processQueueSequentially={engine.processQueueSequentially} deleteQueueItem={engine.deleteQueueItem} clearQueue={engine.clearQueue}
            encoder={engine.encoder} setEncoder={engine.setEncoder} useSubtitles={engine.useSubtitles} setUseSubtitles={engine.setUseSubtitles}
            defaultVoiceId={engine.defaultVoiceId} setDefaultVoiceId={engine.setDefaultVoiceId} ttsProvider={engine.ttsProvider} setTtsProvider={engine.setTtsProvider}
            toggleItemSubtitle={engine.toggleItemSubtitle} toggleItemEncoder={engine.toggleItemEncoder} changeItemVoice={engine.changeItemVoice}
            voicesList={engine.elevenLabsVoices}
          />
        )}

        {/* TAB 2: GIAO DIỆN KHÔNG GIAN CẤU HÌNH API */}
        {engine.activeView === 'api' && (
          <ApiView 
            apiKeys={engine.apiKeys}
            setApiKeys={engine.setApiKeys}
            handleSaveKeys={engine.handleSaveKeys}
            keySaveStatus={engine.keySaveStatus}
          />
        )}
        
      </div>
    </div>
  );
}