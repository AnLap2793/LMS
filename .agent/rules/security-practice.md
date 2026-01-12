---
trigger: always_on
---

## 7. Security Best Practices

### Environment Variables
```bash
# Vite projects (.env)
VITE_DIRECTUS_URL=https://your-directus.com
VITE_APP_ENV=development

# Create React App projects (.env)
REACT_APP_DIRECTUS_URL=https://your-directus.com
REACT_APP_API_VERSION=v1
REACT_APP_ENV=production

# .env.local (không commit vào git)
VITE_DIRECTUS_URL=http://localhost:8055
# REACT_APP_DIRECTUS_URL=http://localhost:8055 (cho CRA)
```

**Lưu ý:**
- **Vite**: Sử dụng prefix `VITE_` và truy cập qua `import.meta.env.VITE_*`
- **Create React App**: Sử dụng prefix `REACT_APP_` và truy cập qua `process.env.REACT_APP_*`

### Security Checklist
- ✅ **Không commit** sensitive data (API keys, tokens, passwords)
- ✅ **Environment variables**: 
  - Vite: Sử dụng prefix `VITE_` và `import.meta.env.VITE_*`
  - CRA: Sử dụng prefix `REACT_APP_` và `process.env.REACT_APP_*`
- ✅ **Constants**: Tập trung constants trong `src/constants/` để tránh hardcode
- ✅ **XSS protection**: Sanitize user input với DOMPurify
- ✅ **CSRF protection**: Implement CSRF tokens với Directus
- ✅ **Authentication**: Token refresh mechanism với autoRefresh
- ✅ **CORS**: Config đúng trên Directus backend
- ✅ **Input validation**: Validate ở cả frontend và backend
- ✅ **HTTPS only**: Force HTTPS trong production
- ✅ **Content Security Policy**: Set CSP headers

### Input Sanitization
```javascript
import DOMPurify from 'dompurify';

// Sanitize HTML content
function SafeHTML({ content }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href', 'target']
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// Validate user input
function validateInput(value, rules = {}) {
  const { maxLength, pattern, required } = rules;
  
  if (required && !value) {
    return 'Trường này bắt buộc';
  }
  
  if (maxLength && value.length > maxLength) {
    return `Tối đa ${maxLength} ký tự`;
  }
  
  if (pattern && !pattern.test(value)) {
    return 'Định dạng không hợp lệ';
  }
  
  return null;
}
```

### Protected Routes
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spin size="large" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

---