# Build và cài Learn English trên iPhone

## Build trên Codemagic (Windows không cần Xcode)

Ứng dụng cần build trên macOS để tạo và ký ứng dụng iOS. Workflow Codemagic đã được khai báo trong [`codemagic.yaml`](./codemagic.yaml); nó tự tạo phần Xcode còn thiếu, chạy `flutter pub get`, analyzer và tests, cài CocoaPods, áp iOS deployment target 15.5, ký bằng App Store provisioning profile, build IPA, lưu artifact, upload lên App Store Connect và yêu cầu gửi build vào TestFlight. Workflow không tự gán tester hoặc gửi app đi App Review.

Đã chạy `flutter pub get`, `flutter analyze` và toàn bộ `flutter test` bằng Flutter 3.47.7 / Dart 3.13.5 trên Windows. Windows không có macOS/Xcode nên chưa thể chạy workflow iOS, ký ứng dụng hoặc tạo IPA. Chưa có IPA được build/ký hoặc tải lên.

### 1. Chuẩn bị tài khoản Apple

1. Tham gia **Apple Developer Program** để tạo chứng chỉ phân phối và provisioning profile. Apple tính phí thành viên theo quốc gia/khu vực; kiểm tra mức phí và điều kiện hiện hành trên [trang đăng ký Apple Developer Program](https://developer.apple.com/programs/enroll/). Cá nhân đăng ký bằng thông tin pháp lý của mình; tổ chức cần xác minh pháp nhân và thường cần D‑U‑N‑S Number.
2. Trong Apple Developer account, đăng ký một **App ID** với Bundle ID duy nhất của bạn, ví dụ `com.tencongty.learnenglish`. Trong Codemagic, mở phần **Environment variables** của ứng dụng, thêm `APP_BUNDLE_ID` với đúng Bundle ID này. Biến phải được đặt trước khi build; không commit giá trị giả định vào source. Đây không phải bí mật.
3. Tạo app record trong [App Store Connect](https://appstoreconnect.apple.com/) với cùng Bundle ID và SKU tùy chọn. Có thể tạo record sau khi bật quyền truy cập Developer Portal trong Codemagic nhưng phải tồn tại trước khi upload.

### 2. Kết nối mã nguồn và Codemagic

1. Đưa toàn bộ thư mục `Learn_English_iOS_App` lên một repository Git (GitHub, GitLab hoặc Bitbucket); giữ `codemagic.yaml` ở thư mục gốc repository. Nếu đây là repository riêng, thư mục dự án này là root.
2. Đăng nhập Codemagic, kết nối Git provider và import repository. Chọn workflow **Learn English iOS (TestFlight)** rồi chạy thủ công.
3. Trong **Team integrations → Developer Portal**, kết nối một App Store Connect API key:
   - Trong App Store Connect, tạo API key dành riêng cho Codemagic ở **Users and Access → Integrations → App Store Connect API**. Vai trò **App Manager** được khuyến nghị cho upload.
   - Ghi lại **Key ID** và **Issuer ID**, tải tệp `.p8` (Apple chỉ cho tải private key một lần).
   - Trong Codemagic, thêm Key ID, Issuer ID và tệp `.p8` vào Developer Portal integration. Tên của integration/key phải đúng `LearnEnglishASC` như trong YAML; nếu chọn tên khác, cập nhật `integrations.app_store_connect` trong `codemagic.yaml` tương ứng.
4. Bật automatic code signing cho app: trong Codemagic **Code signing identities**, tạo hoặc lấy **Apple Distribution** certificate và **App Store** provisioning profile cho đúng Bundle ID. Dùng cùng Developer Portal integration để Codemagic tạo/lấy signing assets tự động. Với workflow này, `distribution_type: app_store` là loại phù hợp cho TestFlight/App Store; không cần commit certificate, profile hay `.p8` vào repository.

> Không chia sẻ Apple ID/password, certificate private key hoặc tệp `.p8`; chỉ lưu credentials trong Codemagic. Apple Developer Program membership là cần thiết cho signing và TestFlight; Apple Account miễn phí không thay thế membership này.

### 3. Chạy build và lấy IPA

1. Chạy workflow trong Codemagic. Build sẽ dừng nếu analyzer/tests thất bại, credentials không hợp lệ, `APP_BUNDLE_ID` chưa được đặt hoặc Bundle ID/signing profile không khớp.
2. Chỉ khi workflow thành công, tải IPA từ **Artifacts → `build/ios/ipa/`** trong build đó. Đây là IPA đã được ký cho phân phối App Store/TestFlight; không phải IPA Ad Hoc để cài tùy ý bằng cách nhấn vào tệp.
3. Sau khi App Store Connect hoàn tất xử lý build (thường cần chờ), mở **App Store Connect → app → TestFlight**:
   - Với tester nội bộ trong tổ chức, thêm họ vào **Internal Testing** và cấp quyền phù hợp.
   - Với tester bên ngoài, tạo nhóm **External Testing**, thêm tester và gửi build qua Beta App Review khi App Store Connect yêu cầu.
4. Trên iPhone, cài ứng dụng **TestFlight** từ App Store, chấp nhận lời mời tester và nhấn **Install** cho Learn English. Sau đó mở app và kiểm tra lưu từ vựng offline, nhập file/OCR và giọng đọc.

Nếu cần cài IPA trực tiếp không qua TestFlight, phải tạo một bản **Ad Hoc** riêng, đăng ký UDID từng iPhone và dùng Ad Hoc provisioning profile; đây không phải mục tiêu của workflow hiện tại. Phân phối công khai cuối cùng cần hoàn tất metadata, privacy details, screenshots và App Review trong App Store Connect.

## Build thủ công trên Mac

1. Cài Flutter stable có Dart 3.12 trở lên (phù hợp constraint trong `pubspec.yaml`), Xcode và CocoaPods; chấp nhận license Xcode.
2. Từ thư mục dự án, tạo project native nếu chưa có:

   ```sh
   flutter create --platforms=ios --org com.learnenglish .
   flutter pub get
   cd ios && pod install && cd ..
   ```

3. Đặt Bundle ID của bạn cho target Runner và deployment target iOS thành `15.5`. Cấu hình Apple Developer Team/signing trong Xcode. Chạy `flutter analyze` và `flutter test`, sau đó:

   ```sh
   flutter build ipa --release
   ```

   IPA chỉ tồn tại nếu lệnh build và ký thành công; đường dẫn mặc định là `build/ios/ipa/`.

## Chạy và kiểm thử trên iPhone

Để chạy từ Xcode/Flutter trên thiết bị thử nghiệm:

```sh
flutter devices
flutter run -d <device-id>
```

## Khác biệt/chưa được xác minh

- Máy Windows hiện tại không thể build hoặc ký iOS; chưa có IPA. Cần chạy Codemagic với Apple credentials và Bundle ID riêng để xác minh build thật.
- Chưa xác nhận hành vi plugin trên iPhone thực. TTS, quyền truy cập file, PDF rasterization, OCR và cài đặt giọng cần kiểm tra trên Mac/iOS trước khi phát hành.
- Bộ sửa chính tả offline là danh sách từ thông dụng gọn, chỉ đưa đề xuất gần đúng để người dùng tự chấp nhận; không tự thay từ.
- Tệp văn bản/TXT tự do chỉ trích xuất dòng/cột có cấu trúc dễ nhận diện. CSV nên có các cột `word`, `meaning`, `ipa`, `part_of_speech`, `example`, `example_translation`.
