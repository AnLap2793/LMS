# Directus v10+ Permission Blueprint for React

Tài liệu này hướng dẫn cách triển khai hệ thống phân quyền (Permission System) tối giản và hiệu quả nhất cho các dự án React sử dụng Directus v10+.

## 1. Tổng quan phương pháp

Phương pháp này sử dụng hàm `readUserPermissions()` có sẵn trong Directus SDK (@directus/sdk). 

### Ưu điểm:
- **Tối giản**: Chỉ cần 1 API call duy nhất để lấy toàn bộ quyền của user hiện tại.
- **Chính xác**: Backend Directus tự động giải quyết (resolve) tất cả Policies (M2M), Roles, và User-level permissions.
- **Hiệu năng**: Không cần fetch thủ công qua nhiều tầng (Role -> Policy -> Permission).

---

## 2. Cấu trúc dữ liệu (Data Structure)

Dữ liệu trả về từ `readUserPermissions()` có cấu trúc dạng Object (Dictionary):

```json
{
  "thong_tin_nhan_su": {
    "read": {
      "access": "full",
      "fields": ["*"]
    },
    "update": {
      "access": "partial",
      "fields": ["first_name", "last_name", "so_dien_thoai"]
    }
  },
  "bo_phan": {
    "read": { "access": "full", "fields": ["*"] }
  }
}
```

---

## 3. Triển khai Frontend

### Bước 1: Hydration trong AuthContext

Trong hàm xử lý Authentication (sau khi login hoặc khi init app), gọi API để lấy và lưu trữ quyền.

```javascript
import { readUserPermissions } from '@directus/sdk';
// ...

const hydratePermissions = async () => {
  try {
    const response = await directus.request(readUserPermissions());
    // Lưu ý: response của SDK thường bọc trong key 'data'
    const permissions = response?.data || response || {};
    return permissions;
  } catch (error) {
    console.error("Permission Hydration Error:", error);
    return {};
  }
};

// Lưu vào Auth state
const userPermissions = await hydratePermissions();
setUser({ ...userData, all_permissions: userPermissions });
```

### Bước 2: Tạo Custom Hook `usePermissions`

Hook này dùng để kiểm tra quyền ở cấp độ từng trường (field-level).

```javascript
import { useAuth } from '../context/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const canEditField = (collection, fieldName) => {
    const perms = user?.all_permissions;
    if (!perms || typeof perms !== 'object') return false;

    const collectionPerms = perms[collection];
    if (!collectionPerms || !collectionPerms.update) return false;

    const update = collectionPerms.update;
    
    // 1. Kiểm tra access level
    if (update.access === 'none') return false;

    // 2. Kiểm tra danh sách allowed fields
    const allowedFields = update.fields;
    if (!allowedFields || allowedFields === '*') return true;
    
    if (Array.isArray(allowedFields)) {
      return allowedFields.includes('*') || allowedFields.includes(fieldName);
    }

    return false;
  };

  return { canEditField };
}
```

### Bước 3: Áp dụng vào UI

Sử dụng hook để `disable` các input tương ứng.

```jsx
const { canEditField } = usePermissions();

<Input 
  placeholder="Họ và tên" 
  disabled={!canEditField('thong_tin_nhan_su', 'first_name')} 
/>
```

---

## 4. Cấu hình Backend (Directus)

Để phương pháp này hoạt động, user cần có quyền tối thiểu trên Directus:

1. **Quyền trên Collection hệ thống**: Đảm bảo Role của user có quyền **Read** trên các bảng `Directus Permissions` và `Directus Policies` (nếu cần xem thông tin metadata).
2. **Quyền trên Collection nghiệp vụ**: Cấu hình chi tiết Field Permissions trong tab **Permissions** của từng Policy.

---

## 5. Lưu ý quan trọng
- Luôn kiểm tra cấu trúc response của SDK (có thể là `{ data: { ... } }` tùy phiên bản).
- Khi user thay đổi quyền trên Backend, cần cơ chế `refresh` lại permissions trên Frontend (hoặc yêu cầu relogin).
