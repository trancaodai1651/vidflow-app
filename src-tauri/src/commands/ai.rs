use serde::{Deserialize, Serialize};
use reqwest::Client;
use serde_json::{json, Value};
use scraper::{Html, Selector};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Scene {
    pub scene_number: usize,
    pub text: String,
    pub keyword: String,
    pub image_prompt: String,
    pub duration: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AiScriptResult {
    pub scenes: Vec<Scene>,
    pub scraped_images: Vec<String>,
    pub title: String, // 🎯 TÍNH NĂNG MỚI: Trích xuất tiêu đề gốc tiếng Việt có dấu đầy đủ
}

#[derive(Serialize, Deserialize)]
struct AiResponseWrapper {
    scenes: Vec<Scene>,
}

#[tauri::command]
pub async fn process_script_with_ai(script: String, api_key: String, provider: String) -> Result<AiScriptResult, String> {
    if api_key.trim().is_empty() { return Err(format!("Thiếu Key {}", provider.to_uppercase())); }
    
    let client = Client::new();
    let mut actual_content = script.clone();
    let mut scraped_images = Vec::new();
    let mut article_title = "KỊCH BẢN THỦ CÔNG".to_string(); // Tiêu đề mặc định nếu nhập text

    // LÕI CÀO DỮ LIỆU BÀI BÁO ONLINE CAO CẤP
    if actual_content.starts_with("http://") || actual_content.starts_with("https://") {
        let res = client.get(&actual_content)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .send().await.map_err(|e| format!("Không thể truy cập Link: {}", e))?;
            
        let html_text = res.text().await.map_err(|e| format!("Lỗi đọc HTML: {}", e))?;
        let document = Html::parse_document(&html_text);

        // 1. CÀO TIÊU ĐỀ GỐC CÓ DẤU CHUẨN ĐẸP (Quét thẻ title của trang báo)
        let title_selector = Selector::parse("title").unwrap();
        if let Some(title_element) = document.select(&title_selector).next() {
            let raw_title = title_element.text().collect::<Vec<_>>().join("");
            // Làm sạch tiêu đề: loại bỏ phần đuôi tên báo (ví dụ: " - VnExpress")
            article_title = raw_title.split('-').next().unwrap_or(&raw_title).trim().to_string();
        }

        // 2. Thu thập nội dung văn bản
        let p_selector = Selector::parse("p").unwrap();
        let mut article_text = String::new();
        for element in document.select(&p_selector) {
            let text = element.text().collect::<Vec<_>>().join("");
            if text.len() > 30 {
                article_text.push_str(&text);
                article_text.push_str("\n");
            }
        }
        
        // 3. Thu thập kho ảnh gốc thời sự của bài báo
        let img_selector = Selector::parse("img").unwrap();
        for element in document.select(&img_selector) {
            if let Some(src) = element.value().attr("src") {
                if src.starts_with("http") && (src.contains(".jpg") || src.contains(".jpeg") || src.contains(".png") || src.contains(".webp")) {
                    scraped_images.push(src.to_string());
                }
            }
        }

        if article_text.trim().is_empty() { return Err("Không tìm thấy chữ trong bài viết".to_string()); }
        actual_content = article_text;
    } else {
        // Nếu nhập kịch bản chữ, lấy dòng đầu tiên làm tiêu đề
        if let Some(first_line) = script.lines().next() {
            if !first_line.trim().is_empty() {
                article_title = first_line.chars().take(40).collect();
            }
        }
    }

    // 🎯 FIX CHÍ MẠNG SYSTEM PROMPT: Ép Gemini viết hoa đúng chuẩn camelCase (sceneNumber, imagePrompt)
    let system_prompt = "Bạn là đạo diễn phim ngắn. Chia nội dung thành các phân cảnh. BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON KHÔNG GIẢI THÍCH THÊM. Hãy chú ý viết đúng hoa-thường cho các thuộc tính JSON theo mẫu chính xác sau đây:\n\
    { \"scenes\": [ { \"sceneNumber\": 1, \"text\": \"Thoại ngắn\", \"keyword\": \"Từ khóa\", \"imagePrompt\": \"Prompt tả ảnh dọc Cinematic tiếng Anh chi tiết\", \"duration\": 4.0 } ] }";

    let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={}", api_key);
    let request_body = json!({
        "contents": [{ "parts": [{"text": format!("{}\n\nNội dung:\n{}", system_prompt, actual_content)}] }],
        "generationConfig": { "responseMimeType": "application/json" }
    });

    let res = client.post(&url).json(&request_body).send().await.map_err(|e| format!("Lỗi kết nối Gemini: {}", e))?;
    if !res.status().is_success() { return Err(format!("Gemini từ chối dịch vụ: {}", res.status())); }
    
    let res_json: Value = res.json().await.map_err(|e| format!("Lỗi JSON: {}", e))?;
    let content = res_json["candidates"][0]["content"]["parts"][0]["text"].as_str().unwrap_or("{\"scenes\":[]}");

    let parsed_data: AiResponseWrapper = serde_json::from_str(content).map_err(|e| format!("Sai cấu trúc AI JSON: {}", e))?;

    Ok(AiScriptResult {
        scenes: parsed_data.scenes,
        scraped_images,
        title: article_title, // Trả tiêu đề xịn về cho giao diện nhận
    })
}