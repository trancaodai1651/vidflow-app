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
    pub title: String,
}

#[derive(Serialize, Deserialize)]
struct AiResponseWrapper {
    scenes: Vec<Scene>,
}

#[tauri::command]
pub async fn process_script_with_ai(script: String, api_key: String, provider: String) -> Result<AiScriptResult, String> {
    if api_key.trim().is_empty() { 
        return Err(format!("Thiếu mã Key của {}", provider.to_uppercase())); 
    }

    let client = Client::new();
    let mut actual_content = script.clone();
    let mut scraped_images = Vec::new();
    let mut article_title = "KỊCH BẢN THỦ CÔNG".to_string();

    if actual_content.starts_with("http://") || actual_content.starts_with("https://") {
        let res = client.get(&actual_content)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .send().await.map_err(|e| format!("Không thể truy cập Link: {}", e))?;

        let html_text = res.text().await.map_err(|e| format!("Lỗi đọc HTML: {}", e))?;
        let document = Html::parse_document(&html_text);

        let title_selector = Selector::parse("title").unwrap();
        if let Some(title_element) = document.select(&title_selector).next() {
            let raw_title = title_element.text().collect::<Vec<_>>().join("");
            article_title = raw_title.split('-').next().unwrap_or(&raw_title).trim().to_string();
        }

        let p_selector = Selector::parse("p").unwrap();
        let mut article_text = String::new();
        for element in document.select(&p_selector) {
            let text = element.text().collect::<Vec<_>>().join("");
            if text.len() > 30 {
                article_text.push_str(&text);
                article_text.push_str("\n");
            }
        }

        let img_selector = Selector::parse("img").unwrap();
        for element in document.select(&img_selector) {
            if let Some(src) = element.value().attr("src") {
                if src.starts_with("http") && (src.contains(".jpg") || src.contains(".jpeg") || src.contains(".png") || src.contains(".webp")) {
                    scraped_images.push(src.to_string());
                }
            }
        }

        if article_text.trim().is_empty() { 
            return Err("Không tìm thấy chữ văn bản trong bài viết báo chí!".to_string()); 
        }
        actual_content = article_text;
    } else {
        if let Some(first_line) = script.lines().next() {
            if !first_line.trim().is_empty() { 
                article_title = first_line.chars().take(40).collect(); 
            }
        }
    }

    let system_prompt = "BẠN LÀ BIÊN TẬP VIÊN KIÊM ĐẠO DIỄN YOUTUBE/TIKTOK CHUYÊN NGHIỆP.\n\
    MỤC TIÊU TỐI THƯỢNG: Đọc kỹ bài báo/văn bản được cung cấp, TÓM TẮT ĐẦY ĐỦ, CÓ NGHĨA và BÁM SÁT THÔNG TIN GỐC. \n\
    KHÔNG GIỚI HẠN THỜI GIAN: Nội dung dài đến đâu thì bạn tự do chia thành bấy nhiêu phân cảnh (scenes) cho phù hợp nhất.\n\
    \n\
    QUY TẮC BẮT BUỘC ĐỂ TỐI ƯU AUDIO (TTS):\n\
    1. CẤU TRÚC CÂU DÀI, TRÔI CHẢY: Tuyệt đối CẤM viết câu ngắn, câu vụn vặt làm sượng giọng AI. \n\
       Mỗi phân cảnh (scene) phần 'text' PHẢI LÀ MỘT CÂU VĂN DÀI, LIỀN MẠCH chứa khoảng 35 đến 55 từ. \n\
       Sử dụng cấu trúc câu ghép, từ nối (và, nhưng, tuy nhiên, do đó, điều này dẫn đến) để tạo mạch đọc êm ái.\n\
    2. CHẤT LƯỢNG TÓM TẮT: Không bịa đặt thông tin. Đảm bảo logic từ mở đầu, phân tích đến kết luận.\n\
    3. HOOK 3 GIÂY ĐẦU: Cảnh số 1 luôn phải là một câu dẫn dắt (Hook) tóm tắt cực sốc hoặc khơi gợi tò mò mạnh mẽ.\n\
    4. THỜI LƯỢNG (DURATION): Ước tính 'duration' hợp lý cho từng cảnh dựa trên tốc độ đọc người bình thường (khoảng 3.5 từ/giây).\n\
    5. ĐA DẠNG KEYWORD B-ROLL: Từ khóa (keyword) PHẢI là cụm từ Tiếng Anh khái quát, mang tính điện ảnh cao. TUYỆT ĐỐI KHÔNG LẶP LẠI từ khóa giữa các cảnh.\n\
    \n\
    TRẢ VỀ ĐỊNH DẠNG JSON NGUYÊN BẢN (KHÔNG CHỨA CHỮ GIẢI THÍCH NGOÀI LỀ):\n\
    { \"scenes\": [ { \"sceneNumber\": 1, \"text\": \"(Câu văn phức dài trôi chảy...)\", \"keyword\": \"cinematic news abstract\", \"imagePrompt\": \"Detailed image prompt...\", \"duration\": 12.5 } ] }";

    let mut content_output = String::new();

    match provider.trim().to_lowercase().as_str() {
        "groq" => {
            let groq_url = "https://api.groq.com/openai/v1/chat/completions";
            let body = json!({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": format!("Nội dung văn bản gốc cần tóm tắt:\n{}", actual_content) }
                ],
                "response_format": { "type": "json_object" },
                "temperature": 0.3 
            });

            let res = client.post(groq_url)
                .header("Authorization", format!("Bearer {}", api_key))
                .json(&body)
                .send().await.map_err(|e| format!("Lỗi kết nối trạm Groq: {}", e))?;

            if res.status().is_success() {
                let json_res: Value = res.json().await.map_err(|e| format!("Lỗi parse JSON Groq: {}", e))?;
                if let Some(txt) = json_res["choices"][0]["message"]["content"].as_str() {
                    content_output = txt.to_string();
                }
            } else {
                let status_code = res.status();
                let err_txt = res.text().await.unwrap_or_default();
                return Err(format!("Cổng Groq từ chối dịch vụ: Mã {} - {}", status_code, err_txt));
            }
        },
        "openrouter" => {
            let or_url = "https://openrouter.ai/api/v1/chat/completions";
            let body = json!({
                "model": "meta-llama/llama-3-8b-instruct:free",
                "messages": [
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": format!("Nội dung văn bản gốc cần tóm tắt:\n{}", actual_content) }
                ],
                "temperature": 0.3
            });

            let res = client.post(or_url)
                .header("Authorization", format!("Bearer {}", api_key))
                .header("HTTP-Referer", "https://vidflow.io")
                .json(&body)
                .send().await.map_err(|e| format!("Lỗi kết nối trạm OpenRouter: {}", e))?;

            if res.status().is_success() {
                let json_res: Value = res.json().await.map_err(|e| format!("Lỗi parse JSON OR: {}", e))?;
                if let Some(txt) = json_res["choices"][0]["message"]["content"].as_str() {
                    content_output = txt.to_string();
                }
            } else {
                return Err(format!("Cổng OpenRouter từ chối dịch vụ: Mã {}", res.status()));
            }
        },
        _ => { 
            // 🎯 ĐÃ SỬA CHỮA: Chuyển lại về gemini-3.5-flash để né lỗi 404 của bản 1.5 cũ
            let gemini_url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={}", api_key);
            let body = json!({
                "contents": [{ "parts": [{"text": format!("{}\n\nNội dung văn bản gốc cần tóm tắt:\n{}", system_prompt, actual_content)}] }],
                "generationConfig": { "responseMimeType": "application/json", "temperature": 0.3 }
            });

            let res = client.post(&gemini_url).json(&body).send().await.map_err(|e| format!("Lỗi mạng Gemini: {}", e))?;
            if res.status().is_success() {
                let json_res: Value = res.json().await.map_err(|e| format!("Lỗi parse JSON Gemini: {}", e))?;
                if let Some(txt) = json_res["candidates"][0]["content"]["parts"][0]["text"].as_str() {
                    content_output = txt.to_string();
                }
            } else {
                let status_code = res.status();
                let err_txt = res.text().await.unwrap_or_default();
                return Err(format!("Gemini từ chối dịch vụ: {} - {}", status_code, err_txt));
            }
        }
    }

    if content_output.is_empty() { 
        return Err("Mô hình AI trả về dữ liệu rỗng!".to_string()); 
    }

    let start_idx = content_output.find('{').unwrap_or(0);
    let end_idx = content_output.rfind('}').map(|i| i + 1).unwrap_or(content_output.len());
    let clean_content = &content_output[start_idx..end_idx];

    let parsed_data: AiResponseWrapper = serde_json::from_str(clean_content)
        .map_err(|e| format!("Sai cấu trúc kịch bản JSON từ [{}]: {}", provider.to_uppercase(), e))?;

    Ok(AiScriptResult {
        scenes: parsed_data.scenes,
        scraped_images,
        title: article_title,
    })
}