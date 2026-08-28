## Hướng dẫn Phát triển & Đóng Góp

### Yêu cầu môi trường
- Node.js >= 20
- npm >= 10
- Flutter >= 3.47.x (nếu phát triển iOS App)
- Android Studio / Xcode (nếu build native)

### Quy ước đặt tên commit (Conventional Commits)

| Tiền tố | Ý nghĩa |
| :--- | :--- |
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa lỗi |
| `style:` | Chỉnh sửa giao diện, không ảnh hưởng logic |
| `refactor:` | Tái cấu trúc code, không thêm tính năng |
| `docs:` | Cập nhật tài liệu |
| `chore:` | Cấu hình, build, không ảnh hưởng code chính |
| `test:` | Thêm hoặc sửa test |
| `perf:` | Cải thiện hiệu suất |

### Quy ước nhánh (Branch Strategy)
- `main` — Nhánh chính, luôn ổn định, sẵn sàng deploy.
- `feature/<tên>` — Nhánh phát triển tính năng mới.
- `fix/<tên>` — Nhánh sửa lỗi.

### Cấu trúc thư mục `src/`
```text
src/
├── components/   # Các thành phần UI dùng lại (Header, Sidebar, WordModal...)
├── context/      # React Context quản lý trạng thái toàn cục (AppContext)
├── data/         # Dữ liệu mẫu ban đầu (initialData.ts)
├── layouts/      # Bố cục trang chính (MainLayout)
├── pages/        # Các trang chính (Dashboard, VocabularyBank, FlashcardStudy...)
├── services/     # Logic nghiệp vụ (OCR, Speech, Storage, SpacedRepetition...)
├── types/        # Định nghĩa kiểu TypeScript dùng toàn app
└── utils/        # Hàm tiện ích (textUtils, Levenshtein...)
```
