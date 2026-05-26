use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn generate_audio(text: String, _openai_key: String, export_dir: String, scene_id: usize) -> Result<String, String> {
    let encoded_text = urlencoding::encode(&text);
    let url = format!("https://translate.google.com/translate_tts?ie=UTF-8&q={}&tl=vi&client=tw-ob", encoded_text);
    let res = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    
    let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    let dir = format!("{}\\Temp_Audio", export_dir);
    if !Path::new(&dir).exists() { fs::create_dir_all(&dir).unwrap(); }
    let path = format!("{}\\{}.mp3", dir, scene_id);
    fs::write(&path, bytes).map_err(|e| e.to_string())?;
    Ok(path)
}

// 🎯 BỘ XỬ LÝ HÌNH ẢNH HYBRID CẤP CAO
#[tauri::command]
pub async fn prepare_scene_image(source: String, is_url: bool, export_dir: String, scene_id: usize, width: u32, height: u32) -> Result<String, String> {
    let bytes = if is_url {
        // Tình huống 1: Tải ảnh thật thu thập từ link báo điện tử
        let res = reqwest::get(&source).await.map_err(|e| format!("Lỗi tải hình trang báo: {}", e))?;
        res.bytes().await.map_err(|e| e.to_string())?
    } else {
        // Tình huống 2: Gọi AI sinh ảnh độc bản theo Prompt riêng của phân cảnh
        let encoded_prompt = urlencoding::encode(&source);
        let url = format!("https://image.pollinations.ai/prompt/{}?width={}&height={}&nologo=true", encoded_prompt, width, height);
        let res = reqwest::get(&url).await.map_err(|e| format!("Lỗi mạng AI vẽ ảnh: {}", e))?;
        res.bytes().await.map_err(|e| e.to_string())?
    };

    let dir = format!("{}\\Temp_Images", export_dir);
    if !Path::new(&dir).exists() { fs::create_dir_all(&dir).unwrap(); }
    let path = format!("{}\\{}.jpg", dir, scene_id);
    fs::write(&path, bytes).map_err(|e| e.to_string())?;
    Ok(path)
}