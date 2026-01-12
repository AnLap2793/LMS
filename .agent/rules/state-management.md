---
trigger: always_on
---

## 4. State Management

### Quy tắc chọn giải pháp
- **Local state**: useState cho component state đơn giản
- **Context API**: Cho global state không phức tạp (theme, auth, language)
- **React Query/TanStack Query**: ⭐ **Khuyến nghị** cho server state và caching
- **Zustand/Redux**: Chỉ khi cần complex state logic

### React Query Configuration
```javascript
// config/queryClient.js
import { QueryClient } from '@tanstack/react-query';
import { CACHE_TIME, RETRY_CONFIG } from '../constants/api';
import { handleDirectusError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.STALE_TIME,  // 5 phút - thời gian data được coi là "fresh"
      gcTime: CACHE_TIME.GC_TIME,        // 10 phút - thời gian data được giữ trong cache (v5: gcTime, v4: cacheTime)
      retry: RETRY_CONFIG.QUERY_RETRY,
      refetchOnWindowFocus: false,
      // Global error handler - tự động xử lý tất cả query errors
      onError: (error) => {
        handleDirectusError(error);
      },
    },
    mutations: {
      retry: RETRY_CONFIG.MUTATION_RETRY,
      // Global error handler - tự động xử lý tất cả mutation errors
      onError: (error) => {
        handleDirectusError(error);
      },
    },
  },
});
```

**Lưu ý về React Query v5:**
- ✅ `gcTime` (garbage collection time) thay thế `cacheTime` từ v4
- ✅ `staleTime`: Thời gian data được coi là "fresh", không refetch tự động
- ✅ `gcTime`: Thời gian data được giữ trong cache sau khi không còn component nào sử dụng

### React Query với Directus

**Sử dụng Query Keys tập trung:**

```javascript
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
```

**Custom hooks với Query Keys:**

```javascript
// hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// Custom hook: Lấy danh sách users
function useUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params), // ✅ Sử dụng queryKeys từ constants
    queryFn: () => userService.getAll(params),
    staleTime: CACHE_TIME.STALE_TIME,
  });
}

// Custom hook: Lấy chi tiết user
function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id), // ✅ Sử dụng queryKeys từ constants
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

// Custom hook: Tạo user mới
function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('Tạo user thành công!'); // ✅ Sử dụng trực tiếp từ utils
    },
    // ✅ Error được xử lý tự động bởi global handler trong queryClient
  });
}

// Custom hook: Cập nhật user
function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      showSuccess('Cập nhật thành công!'); // ✅ Sử dụng trực tiếp từ utils
    },
    // ✅ Error được xử lý tự động bởi global handler
  });
}

// Custom hook: Xóa user
function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('Xóa thành công!'); // ✅ Sử dụng trực tiếp từ utils
    },
    // ✅ Error được xử lý tự động bởi global handler
  });
}

// Sử dụng trong component
function UserList() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreate = async (values) => {
    await createUser.mutateAsync(values);
  };

  const handleUpdate = async (id, values) => {
    await updateUser.mutateAsync({ id, data: values });
  };

  const handleDelete = async (id) => {
    await deleteUser.mutateAsync(id);
  };

  return (
    <div>
      <UsersTable 
        data={users} 
        loading={isLoading}
        onEdit={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### Context API cho Authentication
```javascript
// context/AuthContext.jsx (hoặc contexts/AuthContext.jsx)
import { createContext, useContext, useState, useEffect } from 'react';
import { directus } from '../services/directus';
import { readMe } from '@directus/sdk';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Directus SDK tự động quản lý token trong storage
      // Chỉ cần gọi readMe() để verify authentication
      const userData = await directus.request(readMe());
      setUser(userData);
    } catch (error) {
      // Token không hợp lệ hoặc đã hết hạn
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Directus SDK v20: Sử dụng directus.login() method
      // SDK tự động lưu token vào storage đã config
      await directus.login({ email, password });
      
      // Lấy thông tin user sau khi login thành công
      const currentUser = await directus.request(readMe());
      setUser(currentUser);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Directus SDK v20: Sử dụng directus.logout() method
      // SDK tự động xóa token khỏi storage
      await directus.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn set user về null ngay cả khi logout fail
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---