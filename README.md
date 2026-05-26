# 🎬 VidFlow Industrial - AI Short Video Automation Studio

**VidFlow Industrial** là một hệ thống (Automation Engine) chạy trên Desktop được xây dựng trên kiến trúc lai cao cấp **Tauri v2 (Rust Core)** và **React (TypeScript/Tailwind CSS)**. Ứng dụng cho phép tự động hóa quy trình cào dữ liệu tin tức báo chí trực tuyến hoặc kịch bản thô, sử dụng trí tuệ nhân tạo để biên tập, bóc tách thực thể và kết xuất thành video ngắn (9:16, 16:9, 1:1) độ phân giải cao kèm phụ đề và âm thanh tự động hoàn toàn miễn phí.

---

## 💎 Tính Năng Cốt Lõi (Advanced Features)

* **Batch Queue Processing (Hàng đợi hàng loạt):** Quản lý và xử lý tuần tự nhiều tác vụ cùng lúc. Tự động kích hoạt luồng công việc nối tiếp mà không cần can thiệp thủ công.
* **Engine Trí Tuệ Đa Lõi:** Tích hợp sâu và tối ưu hóa Endpoint thương mại ổn định cho **Google Gemini 3.5 Flash** và **OpenRouter Cluster**.
* **Hybrid Image Strategy (Đồ họa đa tầng):** Tự động cào và trích xuất kho ảnh thời sự có dấu trực tiếp từ các trang báo lớn (VnExpress, Tuổi Trẻ...). Tự động kích hoạt AI vẽ ảnh độc bản (`Pollinations API`) khi thiếu hụt tài nguyên.
* **TikTok Style Subtitles (Auto-Wrap):** Thuật toán tự động bẻ dòng chữ thông minh dưới 24 ký tự phù hợp với màn hình dọc. Phụ đề kích thước lớn, font chữ vàng viền đen đổ bóng nghệ thuật tăng tỷ lệ giữ chân người xem.
* **Cinematic Ken Burns Effect:** Áp dụng bộ lọc nội suy `Lanczos` cao cấp và cơ chế `zoompan` 1000 khung đệm của FFMPEG giúp ảnh tĩnh chuyển động mượt mà như những thước phim điện ảnh chuyên nghiệp.
* **Portable FFMPEG Pack:** Đóng gói độc lập file cấu hình `ffmpeg.exe` trực tiếp vào thư mục `resources` của hệ thống, chạy mì ăn liền không cần cài đặt môi trường PATH phức tạp lên Windows.
* **Private Credentials Hub:** Mã hóa dữ liệu Token API và lưu tĩnh tĩnh tại `LocalStorage` máy khách, bảo mật tuyệt đối 100%.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React (Giao diện Neo-Cyberpunk Glassmorphic).
* **Backend Core:** Rust (Tauri v2 Framework), `reqwest` (Luồng tải byte đồ họa), `scraper` (Lõi cào cấu trúc HTML trang báo), `serde_json` (Mã hóa thực thể dữ liệu liên thông `camelCase`).
* **Media Compiler:** FFMPEG Portable Core Pack.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống trước khi cài đặt
* Đã cài đặt [Node.js](https://nodejs.org/) (Phiên bản mới nhất).
* Đã cài đặt môi trường lập trình Rust thông qua [Rustup](https://rustup.rs/).

### 2. Chuẩn bị tài nguyên Portable FFMPEG
Tải file `ffmpeg.exe` về máy tính và đặt chính xác vào cấu trúc thư mục sau để hệ thống nhận diện:
```text
vidflow-app/
└── src-tauri/
    └── resources/
        └── ffmpeg.exe  <=== ĐẶT FILE TẠI ĐÂY