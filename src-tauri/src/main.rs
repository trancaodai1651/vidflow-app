#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::ai::process_script_with_ai,
            commands::video::render_video_project,
            commands::video::open_exported_video, // Đăng ký tính năng kích mở file tại đây
            commands::media::generate_audio,
            commands::media::prepare_scene_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}