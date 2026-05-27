#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::ai::process_script_with_ai,
            commands::video::render_video_project,
            commands::video::open_exported_video,
            commands::media::generate_audio,
            commands::media::prepare_hybrid_scene_media // 🎯 ĐÃ FIX: Chỉ giữ lại duy nhất hàm lai ghép mới này, loại bỏ hoàn toàn hàm cũ
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}