---
trigger: always_on
---

## Constants Organization

### Cấu trúc Constants

Tập trung tất cả constants trong thư mục `src/constants/` để dễ quản lý và maintain.

```
src/constants/
├── queryKeys.js      # Centralized TanStack Query keys
├── collections.js    # Directus collection names
├── api.js            # API-related constants (cache times, retries, pagination)
├── app.js            # App-wide constants (file limits, validation, date formats)
└── index.js          # Central export point
```

### Quy tắc đặt tên Constants

- **UPPER_SNAKE_CASE** cho tất cả constants
- **Nhóm constants** trong objects để dễ quản lý
- **Export named** thay vì default export

### Ví dụ

```javascript
// constants/collections.js
export const COLLECTIONS = {
  USERS: 'directus_users',
  HR_INFO: 'thong_tin_nhan_su',
};

// constants/api.js
export const CACHE_TIME = {
  STALE_TIME: 5 * 60 * 1000,      // 5 minutes
  GC_TIME: 10 * 60 * 1000,        // 10 minutes
};

export const RETRY_CONFIG = {
  QUERY_RETRY: 1,
  MUTATION_RETRY: 1,
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};

// constants/app.js
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
};

// constants/queryKeys.js
export const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
};

// constants/index.js
export * from './queryKeys';
export * from './collections';
export * from './api';
export * from './app';
```

### Sử dụng Constants

```javascript
// ✅ Good: Sử dụng constants
import { COLLECTIONS } from '../constants/collections';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';

const users = await directus.request(readItems(COLLECTIONS.USERS));
const staleTime = CACHE_TIME.STALE_TIME;

// ✅ Good: Sử dụng queryKeys trong React Query hooks
useQuery({
  queryKey: queryKeys.users.list(params),
  queryFn: () => userService.getAll(params),
});

// ❌ Bad: Hardcode values
const users = await directus.request(readItems('directus_users'));
const staleTime = 5 * 60 * 1000;

// ❌ Bad: Hardcode query keys
useQuery({
  queryKey: ['users', params], // ❌ Khó maintain, dễ typo
  queryFn: () => userService.getAll(params),
});
```

### Lợi ích

- ✅ Tránh typo và lỗi chính tả
- ✅ Dễ refactor khi cần thay đổi
- ✅ Tập trung quản lý, dễ maintain
- ✅ Type-safe với TypeScript (nếu sử dụng)
- ✅ Tự động complete trong IDE

---

