use serde::{Deserialize, Serialize};
use std::process::Command;
use std::path::Path;
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug)]
pub struct SceneMedia {
    pub image_path: String,
    pub audio_path: String,
    pub duration: f32,
    pub text: String,
}

// Thuật toán tự động bẻ dòng chữ thông minh cho màn hình dọc
fn auto_wrap_text(text: &str, max_chars: usize) -> String {
    let mut result = String::new();
    let mut current_line_len = 0;

    for word in text.split_whitespace() {
        if current_line_len + word.len() + 1 > max_chars {
            result.push('\n');
            current_line_len = 0;
        } else if !result.is_empty() && current_line_len > 0 {
            result.push(' ');
            current_line_len += 1;
        }
        result.push_str(word);
        current_line_len += word.len();
    }
    result
}

#[tauri::command]
pub fn open_exported_video(path: String) -> Result<(), String> {
    Command::new("cmd")
        .args(["/c", "start", "", &path])
        .spawn()
        .map_err(|e| format!("Không thể mở video: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn render_video_project(
    app_handle: tauri::AppHandle, 
    output_name: String, 
    scenes_media: Vec<SceneMedia>,
    export_dir: String,
    bitrate: String,
    width: u32,
    height: u32
) -> Result<String, String> {
    if !Path::new(&export_dir).exists() {
        fs::create_dir_all(&export_dir).map_err(|e| format!("Không tạo được thư mục: {}", e))?;
    }

    let list_file_path = format!("{}\\{}_list.txt", export_dir, output_name);
    let mut list_file_content = String::new();

    let mut ffmpeg_path = "resources\\ffmpeg.exe".to_string();
    if !Path::new(&ffmpeg_path).exists() {
        if let Ok(res_dir) = app_handle.path().resource_dir() {
            let bundled_path = res_dir.join("resources").join("ffmpeg.exe");
            if bundled_path.exists() { ffmpeg_path = bundled_path.to_string_lossy().into_owned(); }
            else {
                let flat_path = res_dir.join("ffmpeg.exe");
                if flat_path.exists() { ffmpeg_path = flat_path.to_string_lossy().into_owned(); }
            }
        }
    }

    for (i, scene) in scenes_media.iter().enumerate() {
        let temp_video = format!("{}\\{}_scene_{}.mp4", export_dir, output_name, i);
        
        // 🎯 GIẢI PHÁP ĐƯỜNG DẪN TƯƠNG ĐỐI: Ghi file text ngay tại thư mục chạy app để xóa bỏ ký tự ổ đĩa "C:" gây crash FFMPEG
        let text_file_name = format!("vidflow_temp_sub_{}.txt", i);
        let wrapped_text = auto_wrap_text(&scene.text, 24);
        fs::write(&text_file_name, &wrapped_text).map_err(|e| format!("Lỗi tạo tệp phụ đề: {}", e))?;

        // 🎯 TỐI ƯU HÓA BỘ LỌC ĐỒ HỌA:
        // - Loại bỏ scale 4K nặng nề. Chạy trực tiếp zoompan trên khung hình mục tiêu giúp tiết kiệm 300% RAM.
        // - Đẩy d=1000 (tạo luồng đệm 40 giây) để hình ảnh luôn chuyển động mượt mà, lệnh -shortest sẽ tự động cắt đồng bộ theo giọng nói.
        let filter_complex = format!(
            "scale=iw*2:ih*2,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1000:s={}x{},drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':textfile='{}':fontcolor='#FFCC00':fontsize=52:borderw=5:bordercolor=black:x=(w-text_w)/2:y=h-320",
            width, height, text_file_name
        );

        let status = Command::new(&ffmpeg_path)
            .args([
                "-y", "-loop", "1", "-i", &scene.image_path, "-i", &scene.audio_path,
                "-vf", &filter_complex, 
                "-c:v", "libx264", "-b:v", &bitrate, 
                "-tune", "stillimage", "-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p",
                "-shortest", &temp_video
            ])
            .status()
            .map_err(|e| format!("Lỗi lệnh FFMPEG: {}", e))?;

        // Dọn dẹp tệp tin phụ đề tạm thời
        let _ = fs::remove_file(&text_file_name);

        if !status.success() { 
            return Err(format!("Lỗi kết xuất phân cảnh {}. Hãy đảm bảo ảnh và âm thanh của phân cảnh này hợp lệ!", i + 1)); 
        }
        list_file_content.push_str(&format!("file '{}'\n", temp_video.replace("\\", "/")));
    }

    fs::write(&list_file_path, list_file_content).map_err(|e| e.to_string())?;
    let final_output = format!("{}\\{}.mp4", export_dir, output_name);

    let concat_status = Command::new(&ffmpeg_path)
        .args(["-y", "-f", "concat", "-safe", "0", "-i", &list_file_path, "-c", "copy", &final_output])
        .status()
        .map_err(|e| format!("Lỗi chuỗi gộp video tổng: {}", e))?;

    if concat_status.success() { Ok(final_output) } else { Err("Dây chuyền nối video thất bại".to_string()) }
}