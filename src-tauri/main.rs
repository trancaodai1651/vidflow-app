#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Scene {
    pub scene_number: usize,
    pub text: String,
    pub keyword: String,
    pub image_prompt: String,
    pub duration: f32,
}

// 1. COMMAND: Phân tích Kịch bản bằng AI (Thêm _ để tắt cảnh báo unused)
#[tauri::command]
async fn process_script_with_ai(script: String, _api_key: String) -> Result<Vec<Scene>, String> {
    if script.trim().is_empty() {
        return Err("Vui lòng nhập kịch bản hoặc link tin tức!".to_string());
    }

    sleep(Duration::from_millis(2500)).await;

    let mock_scenes = vec![
        Scene {
            scene_number: 1,
            text: "Chào mừng các bạn đến với công nghệ AI tự động hóa video của VidFlow.".to_string(),
            keyword: "AI Technology".to_string(),
            image_prompt: "Cinematic shot of neon cyber tech lab, high details, 8k resolution, glowing blue lights".to_string(),
            duration: 4.5,
        },
        Scene {
            scene_number: 2,
            text: "Chỉ với một cú click, hàng loạt hình ảnh và giọng nói sẽ được tạo ra.".to_string(),
            keyword: "One Click Magic".to_string(),
            image_prompt: "A glowing futuristic button being pressed by a robot hand, holographic interface".to_string(),
            duration: 5.2,
        },
        Scene {
            scene_number: 3,
            text: "Hãy theo dõi chúng tôi để cập nhật những công cụ đỉnh cao nhất.".to_string(),
            keyword: "Subscribe".to_string(),
            image_prompt: "Modern safe clean minimalist neon notification subscribe button glowing in dark".to_string(),
            duration: 3.8,
        }
    ];

    Ok(mock_scenes)
}

// 2. COMMAND: Render Video (Đã lược bỏ import thừa Path)
#[tauri::command]
async fn render_video_project(output_name: String) -> Result<String, String> {
    sleep(Duration::from_secs(4)).await;
    
    let output_path = format!("C:\\VidFlow_Exports\\{}.mp4", output_name);
    Ok(format!("🎉 Render thành công! Video đã lưu tại:\n{}", output_path))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            process_script_with_ai,
            render_video_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}