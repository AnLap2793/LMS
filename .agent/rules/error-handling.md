---
trigger: always_on
---

## 6. Error Handling và Logging

### ⚠️ Quan trọng: Service Layer không nên có Side Effects

**Service layer chỉ nên throw errors, KHÔNG nên xử lý UI:**

```javascript
// ✅ Good: Service chỉ throw error, không có side effects
// services/userService.js
export const userService = {
  getAll: async (params = {}) => {
    // Không có try-catch, để error tự nhiên propagate
    return await directus.request(readItems(COLLECTIONS.USERS, params));
  },
};

// ❌ Bad: Service có side effects (hiển thị UI)
export const userService = {
  getAll: async (params = {}) => {
    try {
      return await directus.request(readItems(COLLECTIONS.USERS, params));
    } catch (error) {
      handleDirectusError(error); // ❌ Side effect trong service
      throw error;
    }
  },
};
```

**Lý do:**
- Service layer không nên biết về UI (separation of concerns)
- Error handling tập trung ở một nơi (QueryClient global handler)
- Tránh duplicate error messages

### Global Error Handler trong React Query

```javascript
// config/queryClient.js
import { QueryClient } from '@tanstack/react-query';
import { handleDirectusError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global error handler cho queries
      onError: (error) => {
        handleDirectusError(error);
      },
    },
    mutations: {
      // Global error handler cho mutations
      onError: (error) => {
        handleDirectusError(error);
      },
    },
  },
});
```

**Lợi ích:**
- Tất cả errors được xử lý tự động
- Không cần viết `onError` cho từng mutation
- Có thể override với `onError` riêng nếu cần

### Sử dụng Error Handler Utilities

**Sử dụng trực tiếp các hàm từ `utils/errorHandler.js`:**

```javascript
// Import trực tiếp từ utils
import { showError, showSuccess } from '../utils/errorHandler';

// Trong mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('Tạo user thành công!'); // ✅ Sử dụng trực tiếp
    },
  });
}
```

**Lưu ý:** Không cần wrapper hook, sử dụng trực tiếp `showSuccess` và `showError` từ utils.

### Centralized Error Handler
```javascript
// utils/errorHandler.js
import { message, notification } from 'antd';

export function handleDirectusError(error) {
  const { response, message: errorMessage } = error;
  const status = response?.status;
  
  const errorMap = {
    400: 'Dữ liệu không hợp lệ',
    401: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
    403: 'Bạn không có quyền thực hiện thao tác này',
    404: 'Không tìm thấy dữ liệu',
    422: 'Dữ liệu không đúng định dạng',
    500: 'Lỗi server, vui lòng thử lại sau',
    503: 'Dịch vụ tạm thời không khả dụng',
  };
  
  const displayMessage = errorMap[status] || errorMessage || 'Có lỗi xảy ra';
  
  // Show error message
  if (status === 401) {
    notification.error({
      message: 'Phiên đăng nhập hết hạn',
      description: 'Vui lòng đăng nhập lại để tiếp tục',
      duration: 5,
    });
    // Redirect to login
    window.location.href = '/login';
  } else {
    message.error(displayMessage);
  }
  
  // Log to console in development
  // Vite: import.meta.env.DEV, CRA: process.env.NODE_ENV === 'development'
  if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
    console.error('Directus Error:', error);
  }
  
  // Log to monitoring service (Sentry, LogRocket, etc.)
  // logErrorToService(error);
  
  return { status, message: displayMessage };
}

// Global error helper
export function showError(error) {
  if (typeof error === 'string') {
    message.error(error);
  } else if (error?.message) {
    message.error(error.message);
  } else {
    message.error('Có lỗi xảy ra');
  }
}

export function showSuccess(msg = 'Thành công!') {
  message.success(msg);
}
```

### Error Boundary Component
```javascript
// components/ErrorBoundary.jsx
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error('Error Boundary caught:', error, errorInfo);
    
    // Send to monitoring service
    // logErrorToService({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Oops! Có lỗi xảy ra"
          subTitle="Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại."
          extra={
            <Button type="primary" onClick={this.handleReset}>
              Tải lại trang
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Usage in App
```javascript
// App.js
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
```

---