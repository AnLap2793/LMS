---
trigger: always_on
---

# 🎨 UI/UX & DESIGN SYSTEM

## 1. Ant Design Theme Configuration

- **Màu chủ đạo (Primary Color):** `#ea4544` (Đỏ thương hiệu).
- **Theme Config:** Đã thiết lập tại `src/config/theme.js`.
- **Locale:** `vi_VN` (Tiếng Việt).

## 2. Component Usage Guidelines

- **Import:** Luôn dùng named import để hỗ trợ Tree-shaking.
    ```javascript
    import { Button, Table, Form } from 'antd'; // ✅ GOOD
    ```
- **Form:**
    - Layout: `vertical` (mặc định).
    - Validation: Import rules từ `src/validation/formRules.js`.
- **Table:**
    - Luôn có phân trang (pagination).
    - Cột thao tác (Action) ghim bên phải (`fixed: 'right'`).
- **Feedback:**
    - Success: `message.success('Thao tác thành công')`
    - Error: `message.error('Mô tả lỗi')` (hoặc để Global Handler xử lý).

## 3. Responsive & Layout

- Sử dụng `Row`, `Col` của Ant Design cho Grid system.
- **Mobile First:** Kiểm tra hiển thị trên mobile cho các màn hình Admin.

## 4. Color Palette (Reference)

```javascript
const colors = {
    // Primary - Đỏ chủ đạo
    primary: '#ea4544',
    primaryHover: '#ff6b6a',
    primaryActive: '#d63938',
    primaryLight: '#fff1f0',

    // Semantic colors
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#ea4544',

    // Neutrals
    textPrimary: '#262626',
    textSecondary: '#595959',
    textDisabled: '#bfbfbf',
    border: '#d9d9d9',
    background: '#fafafa',

    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
    gradientDanger: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
};
```

### Styled Usage Example

```javascript
const StyledButton = styled(Button)`
    &.ant-btn-primary {
        background: ${colors.gradientPrimary};
        border: none;
        &:hover {
            background: ${colors.primaryHover};
        }
    }
`;
```
