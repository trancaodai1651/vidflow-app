import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Nữ MC - Truyền cảm)' },
  { id: 'pNInz6obpgDQGcFmaJcg', name: 'Adam (Nam MC - Trầm ấm)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Nam - Bản tin VTV)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Nữ - Nhẹ nhàng)' }
];

export interface Scene {
  sceneNumber: number; text: string; keyword: string; imagePrompt: string; duration: number;
}

export interface QueueItem {
  id: string; title: string; subtitle: string; type: 'script' | 'url'; content: string;
  outputPath: string; aspectRatio: '9:16' | '16:9' | '1:1'; resolution: '1080p' | '720p'; bitrate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed'; progress: number; log: string;
  encoder: 'cpu' | 'gpu'; useSubtitles: boolean; voiceId: string; ttsProvider: 'google' | 'elevenlabs' | 'edge';
}

export function useAppEngine() {
  const [activeView, setActiveView] = useState<'studio' | 'api' | 'brand'>('studio');
  const [apiKeys, setApiKeys] = useState({ gemini: '', openrouter: '', groq: '', openai: '', pexels: '', elevenlabs: '' });
  const [keySaveStatus, setKeySaveStatus] = useState('');

  const [elevenLabsVoices, setElevenLabsVoices] = useState<{id: string, name: string}[]>([
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Mặc định)' }
  ]);

  useEffect(() => {
    const storedKeys = localStorage.getItem('vidflow_api_keys');
    if (storedKeys) setApiKeys(JSON.parse(storedKeys));
  }, []);

  useEffect(() => {
    if (apiKeys.elevenlabs && apiKeys.elevenlabs.trim().length > 10) {
      fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKeys.elevenlabs }
      })
      .then(res => res.json())
      .then(data => {
        if (data.voices && data.voices.length > 0) {
          const loadedVoices = data.voices.map((v: any) => ({
            id: v.voice_id,
            name: v.name
          }));
          setElevenLabsVoices(loadedVoices);
        }
      })
      .catch(err => console.error("Lỗi đồng bộ giọng ElevenLabs:", err));
    }
  }, [apiKeys.elevenlabs]);

  const handleSaveKeys = () => {
    localStorage.setItem('vidflow_api_keys', JSON.stringify(apiKeys));
    setKeySaveStatus('⚡ ĐÃ KHÓA BẢO MẬT CỤC BỘ!');
    setTimeout(() => setKeySaveStatus(''), 3000);
  };

  const [activeTab, setActiveTab] = useState<'script' | 'url'>('script');
  const [script, setScript] = useState('');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<keyof typeof apiKeys>('groq');
  const [outputPath, setOutputPath] = useState('C:\\VidFlow_Exports');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [bitrate, setBitrate] = useState('4M');

  const [encoder, setEncoder] = useState<'cpu' | 'gpu'>('cpu');
  const [useSubtitles, setUseSubtitles] = useState<boolean>(true);
  const [defaultVoiceId, setDefaultVoiceId] = useState('vi-VN-HoaiMyNeural');
  const [ttsProvider, setTtsProvider] = useState<'google' | 'elevenlabs' | 'edge'>('edge');

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  const addToQueue = () => {
    const rawContent = activeTab === 'script' ? script : url;
    if (!rawContent.trim()) return;
    if (!apiKeys[provider]) { alert(`Bạn phải vào cấu hình Key của ${provider.toUpperCase()} trước!`); return; }

    let displayTitle = '';
    if (activeTab === 'url') {
      try {
        let slug = new URL(rawContent).pathname.split('/').pop() || 'TIN_TUC';
        displayTitle = slug.replace(/-/g, ' ').replace(/\.html$/, '').replace(/\d+$/, '').trim();
      } catch { displayTitle = 'BÀI VIẾT TRỰC TUYẾN'; }
    } else { displayTitle = rawContent.split('\n')[0].substring(0, 60); }

    setQueue([...queue, {
      id: `task_${Date.now()}`, title: displayTitle.toUpperCase() || 'VIDEO MỚI', subtitle: activeTab === 'url' ? 'Trang báo điện tử' : 'Văn bản thủ công',
      type: activeTab, content: rawContent, outputPath, aspectRatio, resolution, bitrate, status: 'pending', progress: 0, log: 'Đang xếp hàng chờ...',
      encoder, useSubtitles, voiceId: defaultVoiceId, ttsProvider
    }]);
    if (activeTab === 'script') setScript(''); else setUrl('');
  };

  const deleteQueueItem = (id: string) => { setQueue(prev => { const updated = prev.filter(item => item.id !== id || item.status === 'processing'); queueRef.current = updated; return updated; }); };
  const clearQueue = () => { if (isProcessing) return; setQueue([]); queueRef.current = []; };

  const toggleItemSubtitle = (id: string) => { setQueue(prev => prev.map(item => item.id === id && item.status === 'pending' ? { ...item, useSubtitles: !item.useSubtitles } : item)); };
  const toggleItemEncoder = (id: string) => { setQueue(prev => prev.map(item => item.id === id && item.status === 'pending' ? { ...item, encoder: (item.encoder === 'cpu' ? 'gpu' : 'cpu') as 'cpu' | 'gpu' } : item)); };
  const changeItemVoice = (id: string, voiceId: string) => { setQueue(prev => prev.map(item => item.id === id && item.status === 'pending' ? { ...item, voiceId } : item)); };

  const processQueueSequentially = async () => {
    if (isProcessing || queueRef.current.filter(q => q.status === 'pending').length === 0) return;
    setIsProcessing(true);

    const updateItemState = (id: string, updates: Partial<QueueItem>) => {
      setQueue(prev => { const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item); queueRef.current = updated; return updated; });
    };

    while (true) {
      const currentLatestQueue = [...queueRef.current];
      const nextPendingItem = currentLatestQueue.find(q => q.status === 'pending');
      if (!nextPendingItem) break;

      const targetId = nextPendingItem.id;
      updateItemState(targetId, { status: 'processing', log: '🧠 Đang phân tích kịch bản bằng AI...' });

      try {
        const result: { scenes: Scene[], scrapedImages: string[], title: string } = await invoke('process_script_with_ai', { script: nextPendingItem.content, apiKey: apiKeys[provider], provider });
        if (!queueRef.current.some(item => item.id === targetId)) continue;
        if (result.title) updateItemState(targetId, { title: result.title.toUpperCase() });

        let w = 1080; let h = 1920;
        if (nextPendingItem.aspectRatio === '16:9') { w = nextPendingItem.resolution === '1080p' ? 1920 : 1280; h = nextPendingItem.resolution === '1080p' ? 1080 : 720; }
        else if (nextPendingItem.aspectRatio === '9:16') { w = nextPendingItem.resolution === '1080p' ? 1080 : 720; h = nextPendingItem.resolution === '1080p' ? 1920 : 1280; }
        else { w = nextPendingItem.resolution === '1080p' ? 1080 : 720; h = w; }

        const mediaList = [];
        let isTaskDeletedMidWay = false;

        for (let j = 0; j < result.scenes.length; j++) {
          if (!queueRef.current.some(item => item.id === targetId)) { isTaskDeletedMidWay = true; break; }
          updateItemState(targetId, { log: `⚡ Dây chuyền Đồ họa [${j+1}/${result.scenes.length}]: Nạp dữ liệu...` });

          let imageSource = result.scenes[j].imagePrompt; let isUrl = false;
          if (nextPendingItem.type === 'url' && result.scrapedImages && result.scrapedImages[j]) { imageSource = result.scrapedImages[j]; isUrl = true; }

          const mediaOutput: { path: string, mediaType: string } = await invoke('prepare_hybrid_scene_media', { keyword: result.scenes[j].keyword, imageSource, isUrl, exportDir: nextPendingItem.outputPath, sceneId: result.scenes[j].sceneNumber, pexelsKey: apiKeys.pexels });
          
          const aud = await invoke<string>('generate_audio', { 
            text: result.scenes[j].text, 
            elevenlabsKey: apiKeys.elevenlabs, 
            voiceId: nextPendingItem.voiceId,
            exportDir: nextPendingItem.outputPath, 
            sceneId: result.scenes[j].sceneNumber, 
            ttsProvider: nextPendingItem.ttsProvider 
          });

          // 🎯 FIX CHÍ MẠNG LỖI SỐ 2: Ép đúng định dạng CamelCase cho Rust
          mediaList.push({ 
            path: mediaOutput.path, 
            mediaType: mediaOutput.mediaType, 
            audioPath: aud,                   
            duration: result.scenes[j].duration, 
            text: result.scenes[j].text 
          });
          
          updateItemState(targetId, { progress: Math.floor(((j + 1) / result.scenes.length) * 80) });
        }

        if (isTaskDeletedMidWay) continue;
        updateItemState(targetId, { log: '🎬 FFMPEG đang render chuẩn điện ảnh...' });

        const safeFilename = (result.title || nextPendingItem.title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_').toUpperCase();
        const finalOutputName = `${safeFilename.substring(0, 50)}_${Date.now()}`;

        const finalPath = await invoke('render_video_project', { outputName: finalOutputName, scenesMedia: mediaList, exportDir: nextPendingItem.outputPath, bitrate: nextPendingItem.bitrate, width: w, height: h, encoder: nextPendingItem.encoder, useSubtitles: nextPendingItem.useSubtitles });
        if (queueRef.current.some(item => item.id === targetId)) { updateItemState(targetId, { status: 'completed', progress: 100, log: `🎉 Xuất file: ${finalPath}` }); }
      } catch (err) {
        if (queueRef.current.some(item => item.id === targetId)) { updateItemState(targetId, { status: 'failed', log: `❌ Lỗi: ${err}` }); }
      }
    }
    setIsProcessing(false);
  };

  return {
    activeView, setActiveView, apiKeys, setApiKeys, keySaveStatus, handleSaveKeys, activeTab, setActiveTab,
    script, setScript, url, setUrl, provider, setProvider, outputPath, setOutputPath, aspectRatio, setAspectRatio,
    resolution, setResolution, bitrate, setBitrate, queue, isProcessing, addToQueue, deleteQueueItem, clearQueue, processQueueSequentially,
    encoder, setEncoder, useSubtitles, setUseSubtitles, defaultVoiceId, setDefaultVoiceId,
    ttsProvider, setTtsProvider, toggleItemSubtitle, toggleItemEncoder, changeItemVoice,
    elevenLabsVoices
  };
}