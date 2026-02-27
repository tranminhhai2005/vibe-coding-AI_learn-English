# 🎓 Vibe Code AI - Ứng Dụng Học Tiếng Anh Thông Minh

Ứng dụng hỗ trợ học từ vựng tiếng Anh đa nền tảng (Web, Android & iOS) tích hợp công nghệ nhận diện chữ từ hình ảnh (**OCR - Tesseract.js**), chuyển văn bản thành giọng nói (**Text-to-Speech**) và kho từ vựng phong phú.

---

## ✨ Tính Năng Nổi Bật

- 🔍 **Nhận diện chữ qua ảnh (OCR):** Tự động trích xuất từ vựng tiếng Anh từ tài liệu hoặc hình ảnh bằng mô hình offline `eng.traineddata` & `vie.traineddata`.
- 🔊 **Phát âm chuẩn (Text-to-Speech):** Hỗ trợ luyện nghe và phát âm từ vựng chuẩn giọng bản ngữ.
- 📱 **Hỗ trợ đa nền tảng:**
  - **Web Application:** Xây dựng với React 18, Vite, TypeScript & Tailwind CSS.
  - **Android App:** Đóng gói nguyên bản bằng Capacitor.
  - **iOS App:** Ứng dụng Flutter độc lập với cơ sở dữ liệu SQLite học offline.
- 🗂️ **Học qua Flashcard & Trắc nghiệm:** Hệ thống ghi nhớ từ vựng thông minh kèm hiệu ứng động trực quan.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Build Tool:** Vite, PostCSS, Autoprefixer
- **Mobile Hybrid:** Capacitor (Android)
- **Mobile Native/Cross-platform:** Flutter 3.x, SQLite (iOS App)
- **AI & OCR:** Tesseract.js (Offline Trained Data)

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chạy bản Web (Local Development)
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

### 2. Build & Đồng bộ sang Android (Capacitor)
```bash
# Build mã nguồn và đồng bộ với Android
npm run cap:sync

# Mở dự án trong Android Studio
npm run cap:open
```

### 3. Khởi chạy ứng dụng iOS (Flutter)
```bash
cd Learn_English_iOS_App
flutter pub get
flutter run -d ios
```

---

## 👨‍💻 Tác giả
- GitHub: [@tranminhhai2005](https://github.com/tranminhhai2005)
