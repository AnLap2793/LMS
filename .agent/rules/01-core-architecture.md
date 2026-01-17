---
trigger: always_on
---

# 🏗️ CORE ARCHITECTURE & DATA FLOW

## 1. Cấu trúc dự án

```
src/
├── components/          # UI Components (common, layout, features)
├── constants/           # Centralized configuration (QUAN TRỌNG)
│   ├── collections.js   # Tên bảng DB: 'directus_users', etc.
│   ├── queryKeys.js     # Keys cho React Query
│   ├── api.js           # Timeout, retry config
│   └── index.js         # Export point
├── hooks/               # React Query wrappers (useUsers, useAuth)
├── services/            # Directus SDK instances
├── context/             # Global client state (Auth, Theme)
├── utils/               # Pure functions (errorHandler, formatters)
└── __tests__/           # Centralized testing folder
```

## 2. Directus Integration (SDK v20)

- **Client Setup:** `src/services/directus.js`
- **Auth Mode:** JSON (Auto refresh token).
- **Pattern:**
    ```javascript
    // ✅ GOOD: Service thuần túy, không side-effect
    export const userService = {
        getAll: async params => directus.request(readItems(COLLECTIONS.USERS, params)),
    };
    ```

## 3. State Management (TanStack Query v5)

- **Query Keys:** Phải lấy từ `src/constants/queryKeys.js`.
- **Error Handling:** Global handler trong `queryClient` (tự động toast lỗi).
- **Config:**
    ```javascript
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000    // 10 phút
    ```

## 4. Constants Organization

Tất cả các giá trị tĩnh phải đưa vào `src/constants/`:

- `COLLECTIONS`: Tên bảng Directus.
- `VALIDATION`: Độ dài password, regex email...
- `FILE_LIMITS`: Kích thước file upload tối đa.

## 5. Coding Standards

- **Naming:**
    - Components: `PascalCase` (UserCard.jsx)
    - Files/Functions: `camelCase` (userService.js)
    - Constants: `UPPER_SNAKE_CASE` (MAX_RETRY)
- **Imports:** Group theo thứ tự: External Libs -> Internal Services/Hooks -> Constants -> Components -> Styles.
