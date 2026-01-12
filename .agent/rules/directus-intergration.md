---
trigger: always_on
---

## 2. Tích hợp Directus

### Setup Directus Client
```javascript
// src/services/directus.js
import { createDirectus, rest, authentication } from '@directus/sdk';

// Sử dụng environment variable (Vite: VITE_DIRECTUS_URL, CRA: REACT_APP_DIRECTUS_URL)
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || process.env.REACT_APP_DIRECTUS_URL;

// Custom storage implementation cho browser localStorage
const customStorage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  },
  delete: (key) => localStorage.removeItem(key),
};

export const directus = createDirectus(DIRECTUS_URL)
  .with(authentication('json', {
    storage: customStorage, // Custom localStorage implementation
    autoRefresh: true,        // Tự động refresh token khi cần
  }))
  .with(rest({
    onRequest: (options) => ({ ...options, credentials: 'include' }),
  }));
```

**Lưu ý:**
- `authentication('json')`: Sử dụng JSON authentication mode (token lưu trong localStorage)
- `authentication('cookie')`: Sử dụng cookie authentication mode (cho SSR/Next.js)
- `autoRefresh: true`: SDK tự động refresh token khi gần hết hạn
- `storage`: Custom storage implementation cho việc lưu trữ token

### Quy tắc làm việc với Directus
- ✅ **Luôn sử dụng** Directus SDK chính thức, không gọi REST API trực tiếp
- ✅ **Xử lý authentication**: Lưu token vào localStorage/sessionStorage
- ✅ **Error handling**: Bắt lỗi từ Directus và hiển thị message phù hợp
- ✅ **Typing**: Định nghĩa TypeScript interfaces cho collections
- ✅ **Permissions**: Kiểm tra quyền truy cập trước khi render UI

### Patterns cho API calls
```javascript
// services/userService.js
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { handleDirectusError } from '../utils/errorHandler';
import { COLLECTIONS } from '../constants/collections';

export const userService = {
  getAll: async (params = {}) => {
    try {
      return await directus.request(readItems(COLLECTIONS.USERS, params));
    } catch (error) {
      throw handleDirectusError(error);
    }
  },
  
  getById: async (id, params = {}) => {
    try {
      const result = await directus.request(readItems(COLLECTIONS.USERS, { 
        filter: { id: { _eq: id } },
        limit: 1,
        ...params
      }));
      return result[0] || null;
    } catch (error) {
      throw handleDirectusError(error);
    }
  },
  
  create: async (data) => {
    try {
      return await directus.request(createItem(COLLECTIONS.USERS, data));
    } catch (error) {
      throw handleDirectusError(error);
    }
  },
  
  update: async (id, data) => {
    try {
      return await directus.request(updateItem(COLLECTIONS.USERS, id, data));
    } catch (error) {
      throw handleDirectusError(error);
    }
  },
  
  delete: async (id) => {
    try {
      return await directus.request(deleteItem(COLLECTIONS.USERS, id));
    } catch (error) {
      throw handleDirectusError(error);
    }
  }
};
```

### Authentication Methods (Directus SDK v20)
```javascript
// Directus SDK v20 cung cấp các methods trực tiếp trên client instance

// 1. Login - SDK tự động lưu token vào storage đã config
await directus.login({ 
  email: 'user@example.com', 
  password: 'password123' 
});

// 2. Logout - SDK tự động xóa token khỏi storage
await directus.logout();

// 3. Lấy thông tin user hiện tại
import { readMe } from '@directus/sdk';
const currentUser = await directus.request(readMe());

// 4. Refresh token (tự động với autoRefresh: true)
// Hoặc thủ công:
import { refresh } from '@directus/sdk';
await directus.request(refresh({ mode: 'json' }));

// 5. Kiểm tra authentication status
try {
  const user = await directus.request(readMe());
  // User đã authenticated
} catch (error) {
  // User chưa authenticated hoặc token đã hết hạn
}
```

**Lưu ý quan trọng:**
- ✅ SDK tự động quản lý token trong storage (localStorage/sessionStorage/cookies)
- ✅ Không cần thủ công set/get `auth_token` từ localStorage
- ✅ Với `autoRefresh: true`, SDK tự động refresh token khi cần
- ✅ Sử dụng `directus.login()` và `directus.logout()` thay vì `directus.request(login(...))`

### Constants cho Collections
```javascript
// constants/collections.js
export const COLLECTIONS = {
  USERS: 'directus_users',
  HR_INFO: 'thong_tin_nhan_su',
  // Thêm các collections khác tại đây
};
```