# Learn English iOS

Ứng dụng Flutter học từ vựng Anh–Việt, ưu tiên lưu trữ và học offline.

## Chạy và kiểm tra

Yêu cầu Flutter 3.47.x / Dart 3.12.x trở lên. Cấu hình Xcode và build iPhone được mô tả trong [BUILD_IOS.md](./BUILD_IOS.md).

```sh
flutter pub get
flutter analyze
flutter test
```

Trên iOS Simulator hoặc iPhone đã kết nối:

```sh
flutter run -d ios
```

Ứng dụng không cần đăng nhập, API key, mạng Internet hay camera. Từ vựng và lịch sử học được lưu trong SQLite trên thiết bị. TTS dùng giọng Apple có sẵn trên máy; kết quả OCR cần người dùng kiểm tra trước khi lưu.

## Nội dung

- Tổng quan thống kê, chuỗi ngày học và hoạt động 7 ngày.
- Kho từ có tìm kiếm, bộ từ, thêm/sửa/xóa và phát âm.
- Flashcard, luyện viết hai chiều, trắc nghiệm bốn dạng và ôn lặp lại ngắt quãng.
- Nhập ảnh/PDF/TXT/CSV và sửa kết quả OCR; xuất CSV hoặc sao lưu/khôi phục JSON.
- Chủ đề sáng/tối và bộ từ mẫu có nhãn.

Không hỗ trợ DOCX trong bản này. Từ điển sửa lỗi OCR ngoại tuyến là danh sách từ thông dụng gọn đi kèm ứng dụng, không thay thế từ điển đầy đủ.
