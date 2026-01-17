---
trigger: always_on
priority: high
---

# 🤖 AI CORE BEHAVIOR & CRITICAL RULES

**MỤC TIÊU:** Đảm bảo tính nhất quán, an toàn và hiệu suất cho dự án LMS Directus.

## 1. ⛔ NON-NEGOTIABLES (Tuyệt đối tuân thủ)

- **Directus SDK:** BẮT BUỘC dùng `@directus/sdk`. KHÔNG dùng `axios` hay `fetch` gọi API trực tiếp.
- **Constants:** KHÔNG hardcode chuỗi (collection names, query keys). BẮT BUỘC import từ `src/constants/`.
- **State Management:** Ưu tiên `React Query` cho server state. KHÔNG dùng Redux trừ khi được yêu cầu rõ ràng.
- **Styling:** KHÔNG tạo file CSS/SCSS mới. BẮT BUỘC dùng `Ant Design` components và prop `style` hoặc styled-components nếu cần thiết.
- **Màu chủ đạo:** `#ea4544` (Red).

## 2. 🏗️ KIẾN TRÚC FLOW CHUẨN (The 4-Layer Pattern)

Mọi tính năng mới phải tuân theo luồng dữ liệu sau:

1.  **Constants:** Định nghĩa Collection Name & Query Key (`src/constants/`).
2.  **Service:** Viết hàm gọi API dùng Directus SDK (`src/services/`). _Lưu ý: Service không handle error, chỉ throw._
3.  **Hooks:** Wrap service bằng `useQuery` hoặc `useMutation` (`src/hooks/`).
4.  **UI Component:** Gọi hook và render Ant Design component (`src/components/`).

## 3. 🛡️ SECURITY & SAFETY

- **Environment:** Dùng `import.meta.env.VITE_*`. Không bao giờ commit secrets.
- **Validation:** Validate form bằng rules trong `src/validation/formRules.js` trước khi gửi API.
- **Revert:** Nếu sửa code gây lỗi build, tự động đề xuất revert về trạng thái ổn định gần nhất.

## 4. 🧪 TESTING STRATEGY

- Viết test song song với code (Unit Test cho logic khó, Integration Test cho UI Flow).
- File test đặt tại `src/__tests__/` với cấu trúc mirror thư mục `src/`.
