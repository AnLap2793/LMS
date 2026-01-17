# 🤖 Hướng dẫn sử dụng Agent Skills: React Best Practices

Dự án **LMS Directus** đã được tích hợp bộ kỹ năng **React Best Practices** (được tinh chỉnh từ Vercel Engineering cho kiến trúc Vite/SPA). Tài liệu này hướng dẫn cách sử dụng AI Agent để tối ưu hóa code theo các chuẩn mực này.

## 1. Skill này nằm ở đâu?

- **Vị trí:** `.opencode/skills/react-best-practices/`
- **Trạng thái:** Tự động kích hoạt (Auto-loaded). Bạn không cần cài đặt gì thêm.
- **Phạm vi:** Tập trung vào **React Client-side (Vite)**, bỏ qua các quy tắc của Next.js (SSR/RSC).

---

## 2. Cách ra lệnh cho Agent (Prompts)

Bạn có thể sử dụng ngôn ngữ tự nhiên để yêu cầu Agent áp dụng skill này. Dưới đây là 3 trường hợp sử dụng phổ biến nhất:

### 🛡️ Trường hợp 1: Code Review (Kiểm tra chất lượng)

Dùng khi bạn vừa viết xong một Component hoặc Hook và muốn kiểm tra hiệu năng.

- **Câu lệnh mẫu:**
    > "Review file `src/components/UserTable.jsx` theo chuẩn React Best Practices."
    > "Kiểm tra xem file `useCourses.js` có vấn đề gì về Waterfall Promises không?"
    > "Code này có vi phạm quy tắc về Bundle Size không?"

### 🛠️ Trường hợp 2: Refactoring (Tối ưu hóa Code cũ)

Dùng khi bạn thấy trang web chạy chậm hoặc code quá rối.

- **Câu lệnh mẫu:**
    > "Refactor file `DashboardPage.jsx` để tối ưu render, áp dụng React.memo và tách component con."
    > "Sửa lỗi Waterfall Promises trong hàm `fetchData` của service này giúp tôi."
    > "Chuyển các import Barrel (`import { X } from 'antd'`) thành Direct Import để giảm bundle size."

### 📚 Trường hợp 3: Hỏi đáp kiến thức (Learning)

Dùng khi bạn muốn hiểu "Tại sao lại code thế này?"

- **Câu lệnh mẫu:**
    > "Tại sao dự án này lại cấm dùng Barrel Imports?"
    > "Giải thích quy tắc `async-parallel` và cho ví dụ áp dụng trong dự án này."

---

## 3. Các quy tắc quan trọng (Top Rules)

Dưới đây là các quy tắc "Vàng" mà Agent sẽ ưu tiên kiểm tra:

### 🚀 Performance (Critical)

1.  **`async-parallel` (Loại bỏ Waterfall):**
    - ❌ **Sai:** `await A(); await B();` (Chạy tuần tự, tốn thời gian).
    - ✅ **Đúng:** `await Promise.all([A(), B()]);` (Chạy song song).
2.  **`bundle-barrel-imports` (Giảm Bundle Size):**
    - ❌ **Sai:** `import { Button, Modal } from 'antd';`
    - ✅ **Đúng:** `import Button from 'antd/es/button';` (Hoặc để Vite xử lý nếu config tốt, nhưng explicit vẫn an toàn hơn).
3.  **`bundle-preload`:** Preload các tài nguyên quan trọng (ảnh, script) khi user hover chuột.

### ♻️ Re-renders (React Core)

4.  **`rerender-memo`:**
    - Sử dụng `React.memo` cho các component con trong danh sách lớn.
    - Sử dụng `useMemo` cho các tính toán nặng (như `columns` của Table Antd).
5.  **`rerender-functional-setstate`:**
    - ❌ **Sai:** `setCount(count + 1)` (Dễ bị stale closure).
    - ✅ **Đúng:** `setCount(prev => prev + 1)` (Luôn đúng).

### 📡 Data Fetching

6.  **`client-swr-dedup` (React Query):**
    - Không gọi cùng một API request nhiều lần ở nhiều component khác nhau. Hãy dùng `staleTime` và cache của React Query.

---

## 4. Ví dụ thực tế

**Code gốc (Có vấn đề):**

```javascript
// Dashboard.jsx
import { Table, Button } from 'antd'; // ❌ Barrel import

function Dashboard() {
    // ❌ Waterfall promises
    const loadData = async () => {
        const users = await userService.getAll();
        const courses = await courseService.getAll();
        setData({ users, courses });
    };

    // ❌ Object created on every render
    const columns = [{ title: 'Name', dataIndex: 'name' }];

    return <Table columns={columns} />;
}
```

**Sau khi Agent Refactor (Sử dụng Skill):**

```javascript
// Dashboard.jsx
import Table from 'antd/es/table'; // ✅ Direct import
import Button from 'antd/es/button'; // ✅ Direct import
import { useMemo } from 'react';

function Dashboard() {
    // ✅ Parallel execution
    const loadData = async () => {
        const [users, courses] = await Promise.all([userService.getAll(), courseService.getAll()]);
        setData({ users, courses });
    };

    // ✅ Memoized
    const columns = useMemo(() => [{ title: 'Name', dataIndex: 'name' }], []);

    return <Table columns={columns} />;
}
```

---

_Tài liệu này được cập nhật tự động theo cấu hình tại `.opencode/skills/react-best-practices/`._
