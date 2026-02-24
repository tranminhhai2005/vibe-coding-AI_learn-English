# iOS project scaffolding

Flutter SDK/Xcode không có trên máy tạo source. Runner đã có AppDelegate, Info.plist (tên hiển thị Learn English, không khai báo quyền camera) và Podfile với iOS 15.5; các project file Xcode/Flutter còn thiếu được tạo trên Mac. Workflow Codemagic trong [codemagic.yaml](../codemagic.yaml) tự tạo scaffold và áp cấu hình ký. Để scaffold thủ công, từ thư mục gốc của ứng dụng, chạy:

```sh
flutter create --platforms=ios --org com.learnenglish .
```

Sau đó làm theo [BUILD_IOS.md](../BUILD_IOS.md), đặt iOS deployment target tối thiểu 15.5 và chọn Bundle Identifier/Team của chủ ứng dụng. Không thêm quyền camera. Chưa có IPA cho đến khi build/sign thành công trên macOS.
