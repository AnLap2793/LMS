# Hướng dẫn Toàn diện: Tích hợp Xác thực (Auth), SSO và Deployment cho React + Directus

Tài liệu này tổng hợp toàn bộ quy trình, mã nguồn mẫu (Blueprint) và cấu hình hạ tầng (Docker) để triển khai hệ thống xác thực bảo mật cho các ứng dụng React sử dụng Directus làm backend.

## 1. Tổng quan Kiến trúc

Hệ thống sử dụng **Directus** làm Headless CMS quản lý người dùng và phiên làm việc, kết hợp với **React** ở Frontend.

-   **Cơ chế Authentication**: Sử dụng `Directus SDK` với `autoRefresh: true` để quản lý Access Token (RAM) và Refresh Token (Cookie/Storage).
-   **SSO Strategy**: Sử dụng giao thức **SAML 2.0** để kết nối với Identity Provider (ví dụ: Google Workspace, Microsoft Entra ID).
-   **Infrastructure**: Triển khai trên Docker với Redis (Cache/Sync) và PostgreSQL (Database).

---

## 2. Universal Auth Blueprint (Mã nguồn Mẫu)

Phần này cung cấp cấu trúc và code mẫu để tái sử dụng cho nhiều dự án.

### 2.1. Cấu trúc Dự án

```
src/
├── lib/
│   └── directus.js         # Khởi tạo Directus SDK (Singleton)
├── context/
│   └── AuthContext.jsx     # Quản lý trạng thái user toàn cục
├── hooks/
│   └── useAuth.js          # Custom hook để truy cập AuthContext
├── features/auth/          # UI Components
│   ├── LoginPage.jsx       # Trang đăng nhập
│   └── AuthCallback.jsx    # Trang xử lý redirect từ SSO
└── App.jsx                 # Setup Routing và Provider
```

### 2.2. Cấu hình Frontend `.env`

```env
VITE_DIRECTUS_URL=https://api.your-project.com
VITE_APP_URL=http://localhost:5173
```

### 2.3. Core Implementation

#### `src/lib/directus.js`
```javascript
import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

export const directus = createDirectus(DIRECTUS_URL)
    .with(authentication('json', { 
        autoRefresh: true, 
    }))
    .with(rest());

export const getAssetUrl = (id) => id ? `${DIRECTUS_URL}/assets/${id}` : '';
```

#### `src/context/AuthContext.jsx`
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { readMe } from '@directus/sdk';
import { directus } from '../lib/directus';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check Auth on Mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await directus.request(readMe());
                setUser(currentUser);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Login Standard
    const login = async (email, password) => {
        try {
            await directus.login(email, password);
            const currentUser = await directus.request(readMe());
            setUser(currentUser);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Login SSO (Redirect)
    const loginSSO = (provider = 'saml') => {
        const directusUrl = import.meta.env.VITE_DIRECTUS_URL;
        const redirectUrl = window.location.origin + '/auth/callback'; 
        window.location.href = `${directusUrl}/auth/login/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const logout = async () => {
        await directus.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginSSO, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
```

### 2.4. UI Templates

#### `src/features/auth/AuthCallback.jsx`
```jsx
// Trang xử lý khi Directus redirect ngược về Frontend
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    // Giả sử AuthContext có hàm refreshUser hoặc chỉ cần reload lại page
    useEffect(() => {
        window.location.href = '/'; // Reload để SDK nhận cookie mới
    }, []);
    return <div>Authenticating...</div>;
}
```

---

## 3. Cấu hình Hạ tầng (Production Docker)

Dưới đây là file `docker-compose.yml` chuẩn cho Production.

```yaml
version: '3'
services:
  directus:
    image: directus/directus:latest
    ports:
      - 8055:8055
    environment:
      # --- DIRECTUS BASIC ---
      - SERVICE_URL_DIRECTUS_8055
      - KEY=$SERVICE_BASE64_64_KEY
      - SECRET=$SERVICE_BASE64_64_SECRET
      - 'ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}'
      - ADMIN_PASSWORD=$SERVICE_PASSWORD_ADMIN
      
      # --- DATABASE ---
      - DB_CLIENT=postgres
      - DB_HOST=postgresql
      - DB_PORT=5432
      - 'DB_DATABASE=${POSTGRESQL_DATABASE:-directus}'
      - DB_USER=$SERVICE_USER_POSTGRESQL
      - DB_PASSWORD=$SERVICE_PASSWORD_POSTGRESQL
      
      # --- REDIS & CACHE ---
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - WEBSOCKETS_ENABLED=true
      - SYNCHRONIZATION_STORE=redis
      - 'SYNCHRONIZATION_REDIS=redis://redis:6379'
      - CACHE_ENABLED=true
      - CACHE_STORE=redis
      - 'CACHE_REDIS=redis://redis:6379'
      - CACHE_AUTO_PURGE=true
      - CACHE_TTL=30m
      
      # --- SECURITY & COOKIES (CRITICAL FOR SSO) ---
      - 'PUBLIC_URL=https://hvn.works'
      - CORS_ENABLED=true
      - CORS_ORIGIN=true
      - CORS_CREDENTIALS=true
      - SESSION_COOKIE_ONE_SITE=None
      - SESSION_COOKIE_SECURE=true
      - REFRESH_TOKEN_COOKIE_SAME_SITE=None
      - REFRESH_TOKEN_COOKIE_SECURE=true
      
      # --- SSO: GOOGLE WORKSPACE (SAML) ---
      - AUTH_PROVIDERS=google
      - AUTH_GOOGLE_DRIVER=saml
      - AUTH_GOOGLE_MODE=session
      - 'AUTH_GOOGLE_IDP_metadata='    # Paste Metadata XML here
      - 'AUTH_GOOGLE_SP_metadata='
      - AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION=true
      - AUTH_GOOGLE_DEFAULT_ROLE_ID=683ae7c7-e984-4041-9f27-195e031dc698
      - AUTH_GOOGLE_IDENTIFIER_KEY=email
      - AUTH_GOOGLE_EMAIL_KEY=email
      - AUTH_GOOGLE_ICON=google
      - 'AUTH_GOOGLE_LABEL=HVN Group'
      # Phải khớp với URL thực tế của App Frontend
      - 'AUTH_GOOGLE_REDIRECT_ALLOW_LIST=https://accounts.hvn.works,https://accounts.hvn.works/,http://localhost:5173/'
      - AUTH_GOOGLE_GIVEN_NAME_KEY=first_name
      - AUTH_GOOGLE_FAMILY_NAME_KEY=last_name
```

## 4. Checklist Triển khai

1.  **Server**: Setup Docker, Postgres, Redis. Cập nhật `.env` với các biến trên.
2.  **SAML Config**: Lấy file Metadata từ Google Admin Console -> Apps -> SAML Apps -> Add App -> Services Directus.
3.  **Frontend**: 
    -   Tích hợp `AuthContext`.
    -   Đảm bảo `AUTH_GOOGLE_REDIRECT_ALLOW_LIST` trên server bao gồm URL frontend.
    -   Kiểm tra `CORS_ORIGIN` nếu frontend và backend khác domain.
