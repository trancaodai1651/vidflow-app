use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::process::Command;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MediaOutput {
    pub path: String,
    pub media_type: String,
}

// 🎯 HÀM TRỢ LÝ: Băm nhỏ chữ để Google TTS không bị "ngộp thở"
fn chunk_text_for_google(text: &str, max_len: usize) -> Vec<String> {
    let mut chunks = Vec::new();
    let mut current_chunk = String::new();
    for word in text.split_whitespace() {
        if current_chunk.len() + word.len() + 1 > max_len {
            if !current_chunk.is_empty() {
                chunks.push(current_chunk.trim().to_string());
                current_chunk.clear();
            }
        }
        current_chunk.push_str(word);
        current_chunk.push(' ');
    }
    if !current_chunk.is_empty() {
        chunks.push(current_chunk.trim().to_string());
    }
    chunks
}

#[tauri::command]
pub async fn generate_audio(
    text: String,
    elevenlabs_key: String, 
    voice_id: String,
    export_dir: String,
    scene_id: usize,
    tts_provider: String, 
) -> Result<String, String> {
    let file_name = format!("vidflow_voice_scene_{}.mp3", scene_id);
    let file_path = Path::new(&export_dir).join(&file_name);
    let client = reqwest::Client::new();

    // 🟢 LUỒNG 1: GOOGLE TTS
    if tts_provider == "google" {
        let chunks = chunk_text_for_google(&text, 180);
        let mut full_audio_bytes = Vec::new();

        for chunk in chunks {
            let url = format!("https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q={}", urlencoding::encode(&chunk));
            let response = client.get(&url).send().await.map_err(|e| format!("Lỗi mạng Google: {}", e))?;
            
            if response.status().is_success() {
                let bytes = response.bytes().await.map_err(|e| e.to_string())?;
                full_audio_bytes.extend_from_slice(&bytes);
            } else {
                return Err(format!("Google TTS lỗi: {}", response.status()));
            }
        }

        let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
        file.write_all(&full_audio_bytes).map_err(|e| e.to_string())?;
        return Ok(file_path.to_string_lossy().into_owned());
    }

    // 🔵 LUỒNG 2: EDGE TTS (ĐÃ ÉP DÙNG CMD CỦA WINDOWS ĐỂ PHÁ LỖI MICROSOFT STORE)
    if tts_provider == "edge" {
        let voice_arg = format!("--voice={}", voice_id);
        let text_arg = format!("--text={}", text);
        let file_arg = format!("--write-media={}", file_path.to_string_lossy());

        // 🎯 Lớp khiên 1: Nhờ thẳng CMD của Windows gọi edge-tts (Xuyên qua alias của MS Store)
        let mut output = Command::new("cmd")
            .args(["/C", "edge-tts", &voice_arg, &text_arg, &file_arg])
            .output();

        // 🎯 Lớp khiên 2: Nếu lệnh trên xịt, nhờ CMD gọi Python để kích hoạt edge_tts
        if output.is_err() || !output.as_ref().unwrap().status.success() {
            output = Command::new("cmd")
                .args(["/C", "python", "-m", "edge_tts", &voice_arg, &text_arg, &file_arg])
                .output();
        }

        match output {
            Ok(out) => {
                if out.status.success() {
                    return Ok(file_path.to_string_lossy().into_owned());
                } else {
                    let err_msg = String::from_utf8_lossy(&out.stderr);
                    return Err(format!("Sếp hãy mở 1 Terminal mới toanh và gõ 'pip install edge-tts' nhé! Lỗi hệ thống báo: {}", err_msg));
                }
            },
            Err(e) => return Err(format!("Lỗi không thể gọi Command Prompt của Windows: {}", e))
        }
    }

    // 🟣 LUỒNG 3: ELEVENLABS
    if elevenlabs_key.trim().is_empty() { return Err("Vui lòng nạp API Key ElevenLabs!".to_string()); }
    let url = format!("https://api.elevenlabs.io/v1/text-to-speech/{}", voice_id);
    let response = client.post(&url)
        .header("xi-api-key", &elevenlabs_key)
        .header("Content-Type", "application/json")
        .json(&json!({
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": { "stability": 0.45, "similarity_boost": 0.85 }
        }))
        .send().await.map_err(|e| format!("Lỗi kết nối ElevenLabs: {}", e))?;

    if !response.status().is_success() {
        let status_code = response.status();
        let err_text = response.text().await.unwrap_or_default();
        return Err(format!("ElevenLabs từ chối: Mã lỗi {} - {}", status_code, err_text));
    }

    let audio_bytes = response.bytes().await.map_err(|e| format!("Lỗi giải mã âm thanh: {}", e))?;
    let mut file = File::create(&file_path).map_err(|e| format!("Không tạo được file: {}", e))?;
    file.write_all(&audio_bytes).map_err(|e| format!("Lỗi ghi file: {}", e))?;

    Ok(file_path.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn prepare_hybrid_scene_media(
    keyword: String, image_source: String, is_url: bool, export_dir: String, scene_id: usize, pexels_key: String
) -> Result<MediaOutput, String> {
    let client = reqwest::Client::new();
    let mut video_download_url = String::new();

    if !pexels_key.trim().is_empty() {
        let pexels_api_url = format!("https://api.pexels.com/videos/search?query={}&per_page=1", urlencoding::encode(&keyword));
        if let Ok(res) = client.get(&pexels_api_url).header("Authorization", &pexels_key).header("User-Agent", "VidFlow-Client").send().await {
            if res.status().is_success() {
                if let Ok(json_data) = res.json::<Value>().await {
                    if let Some(videos) = json_data["videos"].as_array() {
                        if !videos.is_empty() {
                            if let Some(video_files) = videos[0]["video_files"].as_array() {
                                let mut max_width = 0;
                                for file in video_files {
                                    if let Some(w) = file["width"].as_i64() {
                                        if w > max_width {
                                            if let Some(link) = file["link"].as_str() { max_width = w; video_download_url = link.to_string(); }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if !video_download_url.is_empty() {
        let video_dir = format!("{}\\Temp_Videos_In", export_dir);
        if !Path::new(&video_dir).exists() { fs::create_dir_all(&video_dir).unwrap(); }
        let video_path = format!("{}\\{}.mp4", video_dir, scene_id);

        if let Ok(video_res) = client.get(&video_download_url).header("User-Agent", "Mozilla/5.0").send().await {
            if video_res.status().is_success() {
                if let Ok(bytes) = video_res.bytes().await {
                    let _ = fs::write(&video_path, bytes);
                    if let Ok(meta) = fs::metadata(&video_path) {
                        if meta.len() > 60000 { return Ok(MediaOutput { path: video_path, media_type: "video".to_string() }); }
                    }
                }
            }
        }
    }

    let img_dir = format!("{}\\Temp_Images", export_dir);
    if !Path::new(&img_dir).exists() { fs::create_dir_all(&img_dir).unwrap(); }
    let img_path = format!("{}\\{}.jpg", img_dir, scene_id);

    let img_bytes = if is_url {
        let res = reqwest::get(&image_source).await.map_err(|e| format!("Lỗi tải ảnh: {}", e))?;
        res.bytes().await.map_err(|e| e.to_string())?
    } else {
        let encoded_prompt = urlencoding::encode(&image_source);
        let url = format!("https://image.pollinations.ai/prompt/{}?width=1024&height=1024&nologo=true", encoded_prompt);
        let res = reqwest::get(&url).await.map_err(|e| format!("Lỗi mạng AI vẽ ảnh: {}", e))?;
        res.bytes().await.map_err(|e| e.to_string())?
    };

    fs::write(&img_path, img_bytes).map_err(|e| e.to_string())?;
    Ok(MediaOutput { path: img_path, media_type: "image".to_string() })
}