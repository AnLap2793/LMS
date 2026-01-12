---
trigger: always_on
---

## 1. Kiến trúc và Cấu trúc Dự án

### Cấu trúc thư mục chuẩn
```
project-root/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   ├── common/         # Button, Input, Card...
│   │   ├── layout/         # Header, Footer, Sidebar...
│   │   └── business/       # Component logic nghiệp vụ
│   ├── pages/              # Các trang chính
│   ├── services/           # API calls và Directus client
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── validation/         # Validation schemas và sanitization utilities
│   │   ├── validationSchemas.js  # Form validation schemas
│   │   ├── sanitize.js     # HTML sanitization utilities
│   │   └── index.js        # Central export point
│   ├── constants/          # Application constants (collections, API configs, query keys, etc.)
│   │   ├── queryKeys.js    # Centralized TanStack Query keys
│   │   ├── collections.js  # Directus collection names
│   │   ├── api.js          # API configuration
│   │   ├── app.js          # App-wide constants
│   │   └── index.js        # Central export point
│   ├── config/             # Configuration files
│   ├── context/            # React Context (hoặc contexts/)
│   ├── routes/             # Route definitions
│   ├── assets/             # Images, fonts, static files
│   ├── styles/             # Global styles, theme overrides
│   └── __tests__/          # Test setup files và configuration
```

### Quy tắc đặt tên
- **Components**: PascalCase - `UserProfile.jsx`, `DataTable.jsx`
- **Files khác**: camelCase - `apiService.js`, `authUtils.js`
- **Constants**: UPPER_SNAKE_CASE - `API_BASE_URL`, `DEFAULT_PAGE_SIZE`
- **CSS Modules**: kebab-case - `user-profile.module.css`

### Constants Organization
- **Tập trung constants** trong thư mục `src/constants/`
- **Nhóm theo chức năng**: `collections.js`, `api.js`, `app.js`
- **Export tập trung** qua `constants/index.js`
- **Sử dụng constants** thay vì hardcode values trong code

### Validation Organization
- **Tập trung validation** trong thư mục `src/validation/`
- **Nhóm theo chức năng**: `validationSchemas.js` (form validation), `sanitize.js` (HTML sanitization)
- **Export tập trung** qua `validation/index.js`
- **Sử dụng validation schemas** để tái sử dụng validation rules cho Ant Design Form
- **Naming convention**: camelCase cho file names - `validationSchemas.js`, `sanitize.js`

### Query Keys Organization
- **Tập trung query keys** trong `src/constants/queryKeys.js`
- **Sử dụng query keys** từ constants thay vì hardcode trong hooks
- **Lợi ích**: Tránh typo, dễ invalidate queries, dễ maintain