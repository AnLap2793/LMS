# Template Guide - Hướng dẫn Customize Template

Hướng dẫn chi tiết cách customize template này cho dự án của bạn.

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Core vs Examples](#core-vs-examples)
3. [Collections](#collections)
4. [Service Layer](#service-layer)
5. [Query Keys](#query-keys)
6. [React Query Hooks](#react-query-hooks)
7. [Components](#components)
8. [Pages](#pages)
9. [Routes](#routes)
10. [Theme](#theme)
11. [Authentication](#authentication)
12. [Validation](#validation)
13. [Testing](#testing)

---

## Tổng quan

Template này được thiết kế để bạn có thể clone và customize cho dự án của mình. Template chia thành 2 phần:

- **Core**: Infrastructure, config, utilities - Giữ nguyên hoặc customize cẩn thận
- **Examples**: Components, hooks, services - Tham khảo để tạo code của riêng bạn

---

## Core vs Examples

### ✅ Core Files (Giữ nguyên)

Những file này là infrastructure, **không nên sửa** trừ khi thực sự cần customize:

```
src/
├── config/
│   ├── queryClient.js    # React Query config với global error handling
│   └── theme.js          # Ant Design theme
├── services/
│   └── directus.js       # Directus SDK initialization
├── utils/
│   └── errorHandler.js   # Error handling utilities
├── constants/
│   ├── api.js            # API configuration
│   └── app.js            # App constants
├── context/
│   └── AuthContext.jsx   # Authentication context
├── hooks/
│   └── useUsers.js          # ⚠️ EXAMPLE - React Query hooks pattern
├── components/
│   ├── layout/           # Layout components
│   └── ErrorBoundary.jsx # Error boundary
├── validation/           # Validation utilities
└── __tests__/            # Test setup
```

### ⚠️ Example Files (Tham khảo)

Những file này là **examples** - tham khảo để tạo code của riêng bạn:

```
src/
├── services/
│   └── userService.js    # ⚠️ EXAMPLE - Service pattern
├── hooks/
│   └── useUsers.js       # ⚠️ EXAMPLE - React Query hooks pattern
├── components/
│   └── common/           # Common components (create your own here)
├── pages/
│   └── public/
│       └── HomePage.jsx  # ⚠️ EXAMPLE - Page pattern
└── constants/
    ├── collections.js    # ⚠️ Chỉ có USERS (system), thêm của bạn vào đây
    └── queryKeys.js      # ⚠️ users section là example
```

**Quan trọng**: Không sửa trực tiếp example files. Tạo file mới theo pattern tương tự.

---

## Collections

### File: `src/constants/collections.js`

**Mục đích**: Định nghĩa tên collections của Directus.

**Hiện tại**:
```javascript
export const COLLECTIONS = {
  USERS: 'directus_users', // System collection - giữ nguyên
};
```

**Cách thêm collections của bạn**:
```javascript
export const COLLECTIONS = {
  USERS: 'directus_users', // System collection
  PRODUCTS: 'products',    // Collection của bạn
  ORDERS: 'orders',         // Collection của bạn
  CATEGORIES: 'categories', // Collection của bạn
};
```

**Lưu ý**:
- Giữ `USERS` vì đây là system collection
- Thêm collections của bạn vào đây
- Sử dụng constants này trong services thay vì hardcode

---

## Service Layer

### File: `src/services/userService.js` (EXAMPLE)

**Mục đích**: Service layer pattern cho API calls với Directus.

**Pattern**:
```javascript
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const userService = {
  getAll: async (params = {}) => {
    return await directus.request(readItems(COLLECTIONS.USERS, params));
  },
  
  getById: async (id, params = {}) => {
    const result = await directus.request(readItems(COLLECTIONS.USERS, { 
      filter: { id: { _eq: id } },
      limit: 1,
      ...params
    }));
    return result[0] || null;
  },
  
  create: async (data) => {
    return await directus.request(createItem(COLLECTIONS.USERS, data));
  },
  
  update: async (id, data) => {
    return await directus.request(updateItem(COLLECTIONS.USERS, id, data));
  },
  
  delete: async (id) => {
    return await directus.request(deleteItem(COLLECTIONS.USERS, id));
  }
};
```

**Tạo service mới cho collection của bạn**:

1. Tạo file `src/services/productService.js`:
```javascript
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const productService = {
  getAll: async (params = {}) => {
    return await directus.request(readItems(COLLECTIONS.PRODUCTS, params));
  },
  
  getById: async (id, params = {}) => {
    const result = await directus.request(readItems(COLLECTIONS.PRODUCTS, { 
      filter: { id: { _eq: id } },
      limit: 1,
      ...params
    }));
    return result[0] || null;
  },
  
  create: async (data) => {
    return await directus.request(createItem(COLLECTIONS.PRODUCTS, data));
  },
  
  update: async (id, data) => {
    return await directus.request(updateItem(COLLECTIONS.PRODUCTS, id, data));
  },
  
  delete: async (id) => {
    return await directus.request(deleteItem(COLLECTIONS.PRODUCTS, id));
  }
};
```

**Quy tắc quan trọng**:
- ✅ Service chỉ làm API calls, không có side effects
- ✅ Không có try-catch (để React Query xử lý errors)
- ✅ Không hiển thị UI messages (để global error handler xử lý)
- ✅ Throw errors tự nhiên

---

## Query Keys

### File: `src/constants/queryKeys.js`

**Mục đích**: Quản lý tập trung tất cả query keys cho TanStack Query.

**Pattern hiện tại**:
```javascript
export const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
};
```

**Thêm query keys cho collection mới**:
```javascript
export const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
  
  // Thêm cho collection của bạn
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    list: (filters) => [...queryKeys.products.lists(), { filters }],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id) => [...queryKeys.products.details(), id],
  },
};
```

**Cách sử dụng**:
```javascript
// Trong hooks
queryKey: queryKeys.products.list(params)
queryKey: queryKeys.products.detail(id)

// Invalidate queries
queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
```

**Lợi ích**:
- Tránh typo
- Dễ invalidate queries liên quan
- Dễ maintain khi thay đổi structure

---

## React Query Hooks

### File: `src/hooks/useUsers.js` (EXAMPLE)

**Mục đích**: Custom hooks sử dụng React Query để fetch và mutate data.

**Pattern**:
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// Query hook
export function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getAll(params),
    staleTime: CACHE_TIME.STALE_TIME,
  });
}

// Detail hook
export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('Tạo user thành công!');
    },
  });
}
```

**Tạo hooks mới cho collection của bạn**:

1. Tạo file `src/hooks/useProducts.js`:
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.getAll(params),
    staleTime: CACHE_TIME.STALE_TIME,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showSuccess('Tạo sản phẩm thành công!');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      showSuccess('Cập nhật thành công!');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      showSuccess('Xóa thành công!');
    },
  });
}
```

**Quy tắc**:
- ✅ Sử dụng queryKeys từ constants
- ✅ Sử dụng `showSuccess` từ `utils/errorHandler` cho success messages
- ✅ Để global error handler xử lý errors (không cần onError)
- ✅ Invalidate queries sau mutations

---

## Components

**Mục đích**: Tạo reusable components với Ant Design.

**Tạo component mới**:

1. Tạo file `src/components/common/ProductCard.jsx`:
```javascript
import PropTypes from 'prop-types';
import { Card, Tag, Image } from 'antd';

function ProductCard({ name, price, image, onEdit }) {
  return (
    <Card
      hoverable
      cover={<Image src={image} alt={name} />}
      actions={[<Button onClick={onEdit}>Edit</Button>]}
    >
      <Card.Meta
        title={name}
        description={<Tag color="green">${price}</Tag>}
      />
    </Card>
  );
}

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string,
  onEdit: PropTypes.func,
};

export default ProductCard;
```

**Quy tắc**:
- ✅ Sử dụng PropTypes hoặc TypeScript
- ✅ Tách business logic ra hooks
- ✅ Co-locate tests với component

---

## Pages

### File: `src/pages/public/HomePage.jsx` (EXAMPLE)

**Mục đích**: Page component pattern.

**Pattern**:
```javascript
function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome</h1>
    </div>
  );
}

export default HomePage;
```

**Tạo page mới**:

1. Tạo file `src/pages/public/ProductsPage.jsx`:
```javascript
import { useProducts } from '../../hooks/useProducts';
import { Spin, Table } from 'antd';

function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  
  if (isLoading) return <Spin />;
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>
      <Table dataSource={products} />
    </div>
  );
}

export default ProductsPage;
```

**Quy tắc**:
- ✅ Sử dụng hooks để fetch data
- ✅ Handle loading và error states
- ✅ Export default component

---

## Routes

### File: `src/routes/index.jsx`

**Mục đích**: Định nghĩa routes cho ứng dụng.

**Pattern hiện tại**:
```javascript
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

const HomePage = lazy(() => import('../pages/public/HomePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><HomePage /></AppLayout>,
  },
]);
```

**Thêm routes mới**:
```javascript
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const ProductsPage = lazy(() => import('../pages/public/ProductsPage'));
const DashboardPage = lazy(() => import('../pages/private/DashboardPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><HomePage /></AppLayout>,
  },
  {
    path: '/products',
    element: <AppLayout><ProductsPage /></AppLayout>,
  },
  {
    path: '/dashboard',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
]);
```

**Quy tắc**:
- ✅ Sử dụng lazy loading cho code splitting
- ✅ Wrap protected routes với `<ProtectedRoute>`
- ✅ Wrap tất cả routes với `<AppLayout>`

---

## Theme

### File: `src/config/theme.js`

**Mục đích**: Cấu hình theme cho Ant Design.

**Hiện tại**:
```javascript
export const theme = {
  token: {
    colorPrimary: '#ea4544',
  },
};
```

**Customize theme**:
```javascript
export const theme = {
  token: {
    colorPrimary: '#your-color',        // Màu chủ đạo
    borderRadius: 8,                    // Border radius
    fontFamily: 'Your Font, sans-serif', // Font family
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 12,
    },
  },
};
```

**Xem thêm**: [Ant Design Theme](https://ant.design/docs/react/customize-theme)

---

## Authentication

### File: `src/context/AuthContext.jsx`

**Mục đích**: Quản lý authentication state.

**Sử dụng**:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <Spin />;
  if (!user) return <LoginForm />;
  
  return <div>Welcome {user.email}</div>;
}
```

**API**:
- `user` - User object (null nếu chưa login)
- `login(email, password)` - Login function
- `logout()` - Logout function
- `loading` - Loading state
- `refreshAuth()` - Refresh user data

**Protected Routes**:
```javascript
import ProtectedRoute from '../components/layout/ProtectedRoute';

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

---

## Validation

### File: `src/validation/formRules.js`

**Mục đích**: Reusable validation rules cho Ant Design Form. Tuân theo convention của Ant Design, các rules này được sử dụng trực tiếp với `Form.Item` rules prop.

**Pattern**:
```javascript
import { VALIDATION } from '../constants/app';

export const emailRules = [
  { required: true, message: 'Vui lòng nhập email' },
  { type: 'email', message: 'Email không hợp lệ' },
];

export const passwordRules = [
  { required: true, message: 'Vui lòng nhập mật khẩu' },
  { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
];
```

**Sử dụng trong Form**:
```javascript
import { Form, Input } from 'antd';
import { emailRules, passwordRules } from '../validation/formRules';

<Form>
  <Form.Item name="email" rules={emailRules}>
    <Input />
  </Form.Item>
  <Form.Item name="password" rules={passwordRules}>
    <Input.Password />
  </Form.Item>
</Form>
```

**Tạo validation rule mới**:
```javascript
export const productNameRules = [
  { required: true, message: 'Vui lòng nhập tên sản phẩm' },
  { min: 3, message: 'Tên sản phẩm tối thiểu 3 ký tự' },
  { max: 100, message: 'Tên sản phẩm tối đa 100 ký tự' },
];
```

**Lưu ý**: File này sử dụng naming convention `*Rules` để phù hợp với Ant Design Form API. Các export cũ (`*Schema`) vẫn được hỗ trợ để backward compatibility nhưng nên migrate sang `*Rules`.

---

## Testing

### File: `src/__tests__/setup.js`

**Mục đích**: Test setup cho Vitest.

**Cấu trúc**:
```
src/
├── __tests__/
│   └── setup.js          # Test setup
├── services/
│   └── __tests__/
│       └── userService.test.js    # ⚠️ EXAMPLE - Test service layer
├── hooks/
│   └── __tests__/
│       └── useUsers.test.js       # ⚠️ EXAMPLE - Test React Query hooks
├── components/
│   └── __tests__/
│       └── ErrorBoundary.test.jsx # ⚠️ EXAMPLE - Test components
└── utils/
    └── __tests__/
        └── errorHandler.test.js   # ⚠️ EXAMPLE - Test utilities
```

**Example Test Files**:

Template đã có sẵn các example test files để tham khảo:

1. **Service Layer Test** (`src/services/__tests__/userService.test.js`):
```javascript
import { describe, it, expect, vi } from 'vitest';
import { userService } from '../userService';

describe('userService', () => {
  it('should fetch all users', async () => {
    // Test implementation
  });
});
```

2. **React Query Hooks Test** (`src/hooks/__tests__/useUsers.test.js`):
```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../useUsers';

describe('useUsers', () => {
  it('should fetch users successfully', async () => {
    // Test implementation
  });
});
```

3. **Component Test** (`src/components/__tests__/ErrorBoundary.test.jsx`):
```javascript
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  it('should render error UI when error occurs', () => {
    // Test implementation
  });
});
```

**Tạo test mới**:
```javascript
// src/components/common/ProductCard.test.jsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard name="Test" price={100} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**Chạy tests**:
```bash
npm test
npm run test:coverage
```

---

## Checklist khi bắt đầu dự án mới

- [ ] Copy `.env.example` thành `.env` và config
- [ ] Thêm collections vào `src/constants/collections.js`
- [ ] Tạo services cho collections của bạn
- [ ] Thêm query keys vào `src/constants/queryKeys.js`
- [ ] Tạo hooks cho collections của bạn
- [ ] Tạo components cho UI của bạn
- [ ] Tạo pages cho ứng dụng của bạn
- [ ] Thêm routes vào `src/routes/index.jsx`
- [ ] Customize theme trong `src/config/theme.js`
- [ ] Customize menu trong `src/components/layout/AppLayout.jsx`
- [ ] Xóa example files nếu không dùng (sau khi đã hiểu pattern)

---

## Best Practices

### ✅ Nên làm
- Tạo file mới theo pattern của examples
- Sử dụng constants thay vì hardcode
- Sử dụng queryKeys từ constants
- Sử dụng `showSuccess` từ `utils/errorHandler` cho success messages
- Để global error handler xử lý errors
- Co-locate tests với source files

### ❌ Không nên làm
- Sửa trực tiếp example files
- Hardcode collections hoặc query keys
- Thêm side effects vào service layer
- Tạo try-catch trong service layer
- Tạo duplicate code thay vì reuse

---

## Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Ant Design](https://ant.design)
- [Directus SDK](https://docs.directus.io/sdk/javascript/)
- [React Router](https://reactrouter.com)

---

## FAQ

**Q: Có nên sửa trực tiếp example files không?**
A: Không. Tạo file mới theo pattern tương tự.

**Q: Có thể xóa example files không?**
A: Có, sau khi đã hiểu pattern và tạo code của riêng bạn.

**Q: Làm sao để thêm collection mới?**
A: Xem phần [Collections](#collections) và [Service Layer](#service-layer).

**Q: Error handling hoạt động như thế nào?**
A: Xem `src/config/queryClient.js` - có global error handler tự động xử lý tất cả errors.

**Q: Làm sao để customize theme?**
A: Xem phần [Theme](#theme).

