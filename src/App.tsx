import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Sidebar from './components/Sidebar';
import StudioView from './components/StudioView';
import ApiView from './components/ApiView';
import BrandView from './components/BrandView';

// 🎯 ĐÃ ĐỒNG BỘ: Chuẩn hóa camelCase ăn khớp 100% với cấu trúc Serde v2 phía Rust Core
interface Scene { 
  sceneNumber: number; 
  text: string; 
  keyword: string; 
  imagePrompt: string; 
  duration: number; 
}

interface QueueItem {
  id: string; title: string; subtitle: string; type: 'script' | 'url'; content: string;
  outputPath: string; aspectRatio: '9:16' | '16:9' | '1:1'; resolution: '1080p' | '720p'; bitrate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number; log: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<'studio' | 'api' | 'brand'>('studio');
  const [apiKeys, setApiKeys] = useState({ gemini: '', openrouter: '', groq: '', openai: '' });
  const [keySaveStatus, setKeySaveStatus] = useState('');

  useEffect(() => {
    const storedKeys = localStorage.getItem('vidflow_api_keys');
    if (storedKeys) setApiKeys(JSON.parse(storedKeys));
  }, []);

  const handleSaveKeys = () => {
    localStorage.setItem('vidflow_api_keys', JSON.stringify(apiKeys));
    setKeySaveStatus('⚡ ĐÃ KHÓA BẢO MẬT CỤC BỘ!');
    setTimeout(() => setKeySaveStatus(''), 3000);
  };

  const [activeTab, setActiveTab] = useState<'script' | 'url'>('script');
  const [script, setScript] = useState('');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<keyof typeof apiKeys>('gemini');
  const [outputPath, setOutputPath] = useState('C:\\VidFlow_Exports');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [bitrate, setBitrate] = useState('4M');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = () => {
    const rawContent = activeTab === 'script' ? script : url;
    if (!rawContent.trim()) return;
    if (!apiKeys[provider]) {
      alert(`Bạn phải vào cấu hình Key của ${provider.toUpperCase()} trước!`);
      return;
    }

    let displayTitle = activeTab === 'url' ? 'ĐANG QUÉT TIÊU ĐỀ BÀI BÁO...' : rawContent.split('\n')[0].substring(0, 30);
    try { if (activeTab === 'url') displayTitle = new URL(rawContent).pathname.split('/').pop()?.replace(/-/g, ' ').substring(0, 35) || displayTitle; } catch {}

    setQueue([...queue, {
      id: `task_${Date.now()}`, title: displayTitle.toUpperCase(), subtitle: activeTab === 'url' ? 'Trang báo điện tử' : 'Văn bản thủ công',
      type: activeTab, content: rawContent, outputPath, aspectRatio, resolution, bitrate, status: 'pending', progress: 0, log: 'Đang xếp hàng chờ...'
    }]);
    if (activeTab === 'script') setScript(''); else setUrl('');
  };

  const processQueueSequentially = async () => {
    if (isProcessing || queue.filter(q => q.status === 'pending').length === 0) return;
    setIsProcessing(true);
    const currentQueue = [...queue];

    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status !== 'pending') continue;
      currentQueue[i].status = 'processing';
      currentQueue[i].log = '🧠 Đang phân tích nội dung bằng Gemini 3.5...';
      setQueue([...currentQueue]);

      try {
        // 🎯 ĐÃ VÁ CHÍ MẠNG: Đón nhận đầy đủ bộ ba dữ liệu đầu ra từ Rust gồm cả tiêu đề tiếng Việt chuẩn có dấu
        const result: { scenes: Scene[], scrapedImages: string[], title: string } = await invoke('process_script_with_ai', { 
          script: currentQueue[i].content, apiKey: apiKeys[provider], provider 
        });
        
        const { scenes, scrapedImages, title } = result;
        
        // 🎯 ĐÃ ĐỒNG BỘ: Ghi đè tiêu đề bài báo chính thức có dấu rõ ràng thay cho chuỗi slug không dấu cũ
        if (title) {
          currentQueue[i].title = title.toUpperCase();
        } else if (scenes.length > 0 && scenes[0].text) {
          currentQueue[i].title = scenes[0].text.substring(0, 30).toUpperCase() + '...';
        }

        let w = 1080; let h = 1920;
        if (currentQueue[i].aspectRatio === '16:9') { w = currentQueue[i].resolution === '1080p' ? 1920 : 1280; h = currentQueue[i].resolution === '1080p' ? 1080 : 720; }
        else if (currentQueue[i].aspectRatio === '9:16') { w = currentQueue[i].resolution === '1080p' ? 1080 : 720; h = currentQueue[i].resolution === '1080p' ? 1920 : 1280; }
        else { w = currentQueue[i].resolution === '1080p' ? 1080 : 720; h = w; }

        const mediaList = [];
        for (let j = 0; j < scenes.length; j++) {
          currentQueue[i].log = `⚡ Xử lý phân cảnh [${j+1}/${scenes.length}]: Tải tài nguyên đồ họa & Giọng nói...`;
          setQueue([...currentQueue]);

          let imageSource = scenes[j].imagePrompt; 
          let isUrl = false;

          // Điều phối luân phiên ảnh thật thời sự từ báo hoặc Prompt AI vẽ độc bản
          if (currentQueue[i].type === 'url' && scrapedImages && scrapedImages[j]) {
            imageSource = scrapedImages[j];
            isUrl = true;
          }

          const img = await invoke('prepare_scene_image', { 
            source: imageSource, isUrl, exportDir: currentQueue[i].outputPath, 
            sceneId: scenes[j].sceneNumber, width: w, height: h 
          });
          
          const aud = await invoke('generate_audio', { text: scenes[j].text, openaiKey: '', exportDir: currentQueue[i].outputPath, sceneId: scenes[j].sceneNumber });

          // Khớp nối chính xác cấu trúc snake_case đầu vào của `SceneMedia` phía Rust Core
          mediaList.push({ image_path: img, audio_path: aud, duration: scenes[j].duration, text: scenes[j].text });
          currentQueue[i].progress = Math.floor(((j + 1) / scenes.length) * 80);
          setQueue([...currentQueue]);
        }

        currentQueue[i].log = '🎬 FFMPEG Core đang xử lý hoạt cảnh Ken Burns lướt mịn và dập phụ đề...';
        setQueue([...currentQueue]);

        const finalPath = await invoke('render_video_project', { outputName: `VidFlow_${Date.now()}`, scenesMedia: mediaList, exportDir: currentQueue[i].outputPath, bitrate: currentQueue[i].bitrate, width: w, height: h });
        currentQueue[i].status = 'completed'; currentQueue[i].progress = 100; currentQueue[i].log = `🎉 Xuất file: ${finalPath}`;
        setQueue([...currentQueue]);
      } catch (err) {
        currentQueue[i].status = 'failed'; currentQueue[i].log = `❌ Lỗi: ${err}`;
        setQueue([...currentQueue]);
      }
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex h-screen w-screen text-gray-100 font-sans overflow-hidden bg-gradient-to-br from-[#0c0d12] via-[#141622] to-[#08090d]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'api' && <ApiView apiKeys={apiKeys} setApiKeys={setApiKeys} handleSaveKeys={handleSaveKeys} keySaveStatus={keySaveStatus} />}
        {activeView === 'brand' && <BrandView />}
        {activeView === 'studio' && (
          <StudioView
            provider={provider} setProvider={setProvider} apiKeys={apiKeys} setActiveView={setActiveView}
            outputPath={outputPath} setOutputPath={setOutputPath} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            resolution={resolution} setResolution={setResolution} bitrate={bitrate} setBitrate={setBitrate}
            activeTab={activeTab} setActiveTab={setActiveTab} script={script} setScript={setScript} url={url} setUrl={setUrl}
            addToQueue={addToQueue} queue={queue} isProcessing={isProcessing} processQueueSequentially={processQueueSequentially}
          />
        )}
      </main>
    </div>
  );
}