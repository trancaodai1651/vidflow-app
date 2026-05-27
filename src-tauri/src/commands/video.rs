use serde::{Deserialize, Serialize};
use std::process::Command;
use std::path::Path;
use std::fs;
use std::io::Write;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SceneMedia {
    pub path: String,
    pub media_type: String,
    pub audio_path: String,
    pub duration: f32,
    pub text: String,
}

fn to_srt_time_format(seconds: f32) -> String {
    let hours = (seconds / 3600.0) as i32;
    let minutes = ((seconds % 3600.0) / 60.0) as i32;
    let secs = (seconds % 60.0) as i32;
    let millis = ((seconds % 1.0) * 1000.0) as i32;
    format!("{:02}:{:02}:{:02},{:03}", hours, minutes, secs, millis)
}

fn get_media_duration(ffmpeg_path: &str, path: &str) -> f32 {
    if let Ok(output) = Command::new(ffmpeg_path).args(["-i", path]).output() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if let Some(dur_idx) = stderr.find("Duration: ") {
            let dur_substr = &stderr[dur_idx + 10..];
            if let Some(comma_idx) = dur_substr.find(',') {
                let dur_str = &dur_substr[..comma_idx].trim();
                let parts: Vec<&str> = dur_str.split(':').collect();
                if parts.len() == 3 {
                    let h: f32 = parts[0].parse().unwrap_or(0.0);
                    let m: f32 = parts[1].parse().unwrap_or(0.0);
                    let s: f32 = parts[2].parse().unwrap_or(0.0);
                    return h * 3600.0 + m * 60.0 + s;
                }
            }
        }
    }
    5.0
}

#[tauri::command]
pub fn open_exported_video(path: String) -> Result<(), String> {
    Command::new("cmd").args(["/c", "start", "", &path]).spawn().map_err(|e| format!("Không thể mở video: {}", e))?;
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
    height: u32,
    encoder: String,
    use_subtitles: bool,
) -> Result<String, String> {
    
    if !Path::new(&export_dir).exists() {
        fs::create_dir_all(&export_dir).map_err(|e| format!("Không tạo được thư mục: {}", e))?;
    }

    let mut ffmpeg_path = "resources\\ffmpeg.exe".to_string();
    if Path::new(&ffmpeg_path).exists() {
        if let Ok(abs) = fs::canonicalize(&ffmpeg_path) { ffmpeg_path = abs.to_string_lossy().into_owned(); }
    } else if let Ok(res_dir) = app_handle.path().resource_dir() {
        let bundled_path = res_dir.join("resources").join("ffmpeg.exe");
        if bundled_path.exists() { ffmpeg_path = bundled_path.to_string_lossy().into_owned(); }
        else {
            let flat_path = res_dir.join("ffmpeg.exe");
            if flat_path.exists() { ffmpeg_path = flat_path.to_string_lossy().into_owned(); }
        }
    }
    ffmpeg_path = ffmpeg_path.replace("\\\\?\\", "");

    let video_list_name = format!("{}_video_list.txt", output_name);
    let video_list_path = Path::new(&export_dir).join(&video_list_name);
    let mut video_list_content = String::new();

    let video_codec = if encoder.trim().to_lowercase() == "gpu" { "h264_nvenc" } else { "libx264" };

    for (i, scene) in scenes_media.iter().enumerate() {
        if !Path::new(&scene.path).exists() { return Err(format!("Cảnh {}: Không tìm thấy file Hình/Video.", i + 1)); }
        if !Path::new(&scene.audio_path).exists() { return Err(format!("Cảnh {}: Không tìm thấy file Âm thanh.", i + 1)); }

        let audio_dur = get_media_duration(&ffmpeg_path, &scene.audio_path);
        let video_dur = get_media_duration(&ffmpeg_path, &scene.path);
        
        let fast_audio_dur = audio_dur / 1.25; 
        let padded_audio_dur = fast_audio_dur + 0.3;
        let frames = (padded_audio_dur * 30.0).round() as u32;
        let exact_dur = frames as f32 / 30.0;

        let temp_video_name = format!("{}_scene_{}.mp4", output_name, i);
        let local_srt_name = format!("{}_scene_{}.srt", output_name, i);
        let target_srt_path = Path::new(&export_dir).join(&local_srt_name);
        
        // =====================================================================
        // 🎯 TỐI ƯU CỤM CHỮ ĐỂ XẾP KHỐI VUÔNG VỨC (BLOCK TEXT)
        // =====================================================================
        if use_subtitles {
            let mut srt_content = String::new();
            let words: Vec<&str> = scene.text.split_whitespace().collect();
            
            if !words.is_empty() {
                let mut chunks_mutable: Vec<(String, usize)> = Vec::new();
                let mut current_chunk = Vec::new();
                let mut current_chars = 0;
                
                // 🎯 ĐÃ SỬA: Giảm xuống 22 ký tự. Chữ to mà dài quá sẽ rớt dòng xấu. 22 là con số vàng!
                let max_chars_per_sub = 22; 

                for word in &words {
                    let word_len = word.chars().count();
                    let ends_with_punct = word.ends_with(',') || word.ends_with('.') || word.ends_with('!') || word.ends_with('?') || word.ends_with(':');

                    if !current_chunk.is_empty() && (current_chars + 1 + word_len > max_chars_per_sub) {
                        chunks_mutable.push((current_chunk.join(" "), current_chunk.len()));
                        current_chunk.clear();
                        current_chars = 0;
                    }

                    current_chunk.push(*word);
                    current_chars += word_len;
                    if current_chunk.len() > 1 { current_chars += 1; }

                    if ends_with_punct {
                        chunks_mutable.push((current_chunk.join(" "), current_chunk.len()));
                        current_chunk.clear();
                        current_chars = 0;
                    }
                }
                
                if !current_chunk.is_empty() {
                    chunks_mutable.push((current_chunk.join(" "), current_chunk.len()));
                }

                let total_words = words.len().max(1) as f32;
                let time_per_word = exact_dur / total_words;
                let mut current_start_time = 0.0f32;

                for (c_idx, (chunk_text, word_count)) in chunks_mutable.iter().enumerate() {
                    let chunk_dur = *word_count as f32 * time_per_word;
                    let end_time = current_start_time + chunk_dur;

                    srt_content.push_str(&format!("{}\n", c_idx + 1));
                    srt_content.push_str(&format!("{} --> {}\n", to_srt_time_format(current_start_time), to_srt_time_format(end_time)));
                    srt_content.push_str(&format!("{}\n\n", chunk_text));

                    current_start_time = end_time;
                }
            }
            
            fs::write(&target_srt_path, &srt_content).map_err(|e| format!("Lỗi tạo SRT: {}", e))?;
        }

        // =====================================================================
        // 🎨 THIẾT KẾ PHỤ ĐỀ: SIÊU ĐẬM - KHÓA TÂM TUYỆT ĐỐI (DEAD CENTER)
        // =====================================================================
        let subtitle_filter = if use_subtitles {
            let safe_srt_path = target_srt_path.to_string_lossy().replace("\\", "/").replace(":", "\\:");
            // 🎯 CẬP NHẬT CỐT LÕI:
            // - Fontname=Impact: Font siêu dày, đậm chất điện ảnh Shorts.
            // - FontSize=28: To rõ ràng.
            // - Outline=5: Viền đen cực bự chống chìm chữ.
            // - MarginL=30, MarginR=30: Ép lề hai bên để chữ gom lại thành khối đứng.
            // - WrapStyle=1: Cân bằng hai bên (Symmetrical wrap).
            format!(
                ",subtitles='{}':force_style='Fontname=Impact,FontSize=28,PrimaryColour=&H00FFFF,OutlineColour=&H000000,BorderStyle=1,Outline=5,Shadow=0,Alignment=5,MarginL=30,MarginR=30,MarginV=0,WrapStyle=1'",
                safe_srt_path
            )
        } else {
            "".to_string()
        };

        let filter_complex = if scene.media_type == "video" {
            let speed_factor = if video_dur < exact_dur && video_dur > 0.0 { exact_dur / video_dur } else { 1.0 };
            if speed_factor > 1.0 {
                format!(
                    "[0:v]setpts={:.4}*PTS,scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,format=yuv420p{sub}[vout];\
                    [1:a]atempo=1.25,aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=0.3[aout]",
                    speed_factor, w = width, h = height, sub = subtitle_filter
                )
            } else {
                format!(
                    "[0:v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,format=yuv420p{sub}[vout];\
                    [1:a]atempo=1.25,aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=0.3[aout]",
                    w = width, h = height, sub = subtitle_filter
                )
            }
        } else {
            let z_frames = frames + 30;
            format!(
                "[0:v]scale={w}*2:{h}*2:force_original_aspect_ratio=increase,crop={w}*2:{h}*2,setsar=1,format=yuv420p[c];\
                [c]zoompan=z='min(zoom+0.0015,1.15)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':fps=30:d={z_frames}:s={w}x{h}{sub}[vout];\
                [1:a]atempo=1.25,aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=0.3[aout]",
                w = width, h = height, z_frames = z_frames, sub = subtitle_filter
            )
        };

        let mut cmd = Command::new(&ffmpeg_path);
        cmd.current_dir(&export_dir);
        cmd.args(["-hide_banner", "-loglevel", "error", "-y", "-fflags", "+genpts"]);
        
        if scene.media_type == "image" { cmd.args(["-loop", "1"]); }
        
        cmd.args(["-i", &scene.path, "-i", &scene.audio_path, "-filter_complex", &filter_complex, "-map", "[vout]", "-map", "[aout]", "-t", &exact_dur.to_string()]);
        
        cmd.args(["-c:v", video_codec, "-r", "30"]);
        if encoder.to_lowercase() == "gpu" {
            cmd.args(["-b:v", &bitrate, "-preset", "fast"]); 
        } else {
            cmd.args(["-crf", "18", "-b:v", &bitrate, "-preset", "ultrafast"]); 
        }
        cmd.args(["-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p", &temp_video_name]);

        let output = cmd.output().map_err(|e| format!("Không thể gọi FFMPEG: {}", e))?;
        
        if use_subtitles { let _ = fs::remove_file(&target_srt_path); }

        if !output.status.success() { 
            let err_log = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Lỗi kết xuất phân cảnh {}: {}", i + 1, err_log.trim())); 
        }
        
        video_list_content.push_str(&format!("file '{}'\n", temp_video_name));
    }

    fs::write(&video_list_path, video_list_content).map_err(|e| e.to_string())?;

    let final_output_name = format!("{}.mp4", output_name);
    let final_output_path = format!("{}\\{}", export_dir, final_output_name);

    let mut concat_cmd = Command::new(&ffmpeg_path);
    concat_cmd.current_dir(&export_dir);
    
    let concat_output = concat_cmd.args([
        "-hide_banner", "-loglevel", "error", "-y", 
        "-f", "concat", "-safe", "0", "-i", &video_list_name,
        "-c", "copy",
        &final_output_name
    ]).output().map_err(|e| format!("Lỗi gộp siêu luồng: {}", e))?;

    let _ = fs::remove_file(&video_list_path);

    if concat_output.status.success() { Ok(final_output_path) } else { Err("Lỗi Muxing chuỗi tổng".to_string()) }
}