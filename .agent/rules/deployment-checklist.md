---
trigger: always_on
---

## 10. Deployment Checklist

### Pre-deployment
- [ ] ✅ Environment variables configured
- [ ] ✅ Build optimization (production mode)
- [ ] ✅ Remove console.logs
- [ ] ✅ Compress images và assets
- [ ] ✅ Enable gzip compression
- [ ] ✅ Configure CDN
- [ ] ✅ Setup error tracking (Sentry)
- [ ] ✅ Setup analytics (Google Analytics)
- [ ] ✅ SEO meta tags (React Helmet)
- [ ] ✅ Performance monitoring
- [ ] ✅ Security headers (CSP, HSTS)
- [ ] ✅ Test on multiple browsers
- [ ] ✅ Mobile responsive check
- [ ] ✅ Accessibility audit (WCAG)

### Build Configuration
```javascript
// package.json - Vite
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:prod": "VITE_APP_ENV=production vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}

// package.json - Create React App
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:prod": "REACT_APP_ENV=production npm run build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false"
  }
}
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/app/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Constants Organization
```javascript
// src/constants/collections.js - Collection names
export const COLLECTIONS = {
  USERS: 'directus_users',
  HR_INFO: 'thong_tin_nhan_su',
};

// src/constants/api.js - API configuration
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

// src/constants/app.js - App-wide constants
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

// src/constants/index.js - Central export
export * from './collections';
export * from './api';
export * from './app';
```

**Lưu ý:** 
- Sử dụng constants thay vì hardcode values
- Environment variables được truy cập trực tiếp qua `import.meta.env.VITE_*` (Vite) hoặc `process.env.REACT_APP_*` (CRA)
- Không cần file `environment.js` riêng nếu chỉ có một vài env vars