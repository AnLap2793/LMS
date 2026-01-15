# Test Automation Plan - LMS Directus

## Tổng quan

| Item                       | Status                                 |
| -------------------------- | -------------------------------------- |
| **Testing Infrastructure** | ✅ Sẵn sàng (Vitest + Testing Library) |
| **Setup File**             | ✅ Cơ bản (cần mở rộng)                |
| **Existing Tests**         | ❌ 0 files - cần tạo từ đầu            |
| **Target**                 | Hooks (19 hooks)                       |
| **Target Coverage**        | 70%+                                   |
| **Mock Strategy**          | vi.mock() (Vitest native)              |
| **Test Structure**         | Centralized trong `src/__tests__/`     |

---

## Testing Dependencies (Đã cài đặt)

| Package                       | Version | Purpose                     |
| ----------------------------- | ------- | --------------------------- |
| `vitest`                      | ^2.1.0  | Test runner                 |
| `@vitest/coverage-v8`         | ^2.1.0  | Code coverage               |
| `@testing-library/react`      | ^16.3.1 | React component testing     |
| `@testing-library/jest-dom`   | ^6.9.1  | DOM matchers                |
| `@testing-library/user-event` | ^14.5.2 | User interaction simulation |
| `jsdom`                       | ^25.0.1 | DOM environment             |

---

## Cấu trúc Test Files

**Tập trung tất cả tests trong thư mục `src/__tests__/`** - giữ source code sạch sẽ:

```
src/
├── hooks/                      # Source code ONLY - không có test files
│   ├── useUsers.js
│   ├── useCourses.js
│   ├── usePermissions.js
│   └── ...
├── __tests__/                  # TẤT CẢ TESTS TẬP TRUNG TẠI ĐÂY
│   ├── setup.js                # Test setup (global mocks)
│   ├── test-utils.jsx          # Custom render utilities
│   ├── mocks/                  # Shared mocks
│   │   ├── data.js             # Mock data factories
│   │   ├── directus.js         # Mock Directus client
│   │   └── services.js         # Mock services
│   ├── hooks/                  # Hook tests (mirror src/hooks)
│   │   ├── useUsers.test.js
│   │   ├── useCourses.test.js
│   │   ├── usePermissions.test.js
│   │   ├── useModules.test.js
│   │   ├── useLessons.test.js
│   │   ├── useEnrollments.test.js
│   │   ├── useTags.test.js
│   │   ├── useDocuments.test.js
│   │   ├── useLearningPaths.test.js
│   │   ├── useQuizzes.test.js
│   │   ├── useQuestionBank.test.js
│   │   ├── useQuizAttempts.test.js
│   │   ├── useLessonProgress.test.js
│   │   ├── useCertificates.test.js
│   │   ├── useComments.test.js
│   │   ├── useNotes.test.js
│   │   ├── useReviews.test.js
│   │   ├── useDashboard.test.js
│   │   └── useSettings.test.js
│   ├── components/             # Component tests
│   │   ├── common/
│   │   ├── layout/
│   │   └── admin/
│   └── pages/                  # Page tests
│       ├── public/
│       └── private/
```

**Lợi ích của cấu trúc tập trung:**

- ✅ Source code sạch - thư mục hooks/components/pages chỉ chứa production code
- ✅ Dễ quản lý - tất cả tests ở một nơi
- ✅ Mirror structure - cấu trúc **tests** phản ánh cấu trúc src
- ✅ Dễ exclude khi build

---

## Phân loại Hooks theo Pattern

| Pattern               | Hooks                                                                                                                                                                                                                                                 | Testing Strategy                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **React Query Hooks** | useUsers, useCourses, useModules, useLessons, useQuizzes, useEnrollments, useCertificates, useDocuments, useTags, useLearningPaths, useQuestionBank, useQuizAttempts, useLessonProgress, useNotes, useComments, useReviews, useDashboard, useSettings | Mock services + renderHook + waitFor |
| **Logic Hooks**       | usePermissions                                                                                                                                                                                                                                        | Mock AuthContext + renderHook        |

---

## Kế hoạch triển khai

### Phase 1: Chuẩn bị Test Utilities (Priority: Critical)

**Mục tiêu:** Tạo các utilities dùng chung cho tất cả tests

| Task | File                              | Mô tả                              |
| ---- | --------------------------------- | ---------------------------------- |
| 1.1  | `src/__tests__/setup.js`          | Mở rộng setup với global mocks     |
| 1.2  | `src/__tests__/test-utils.jsx`    | Tạo render wrapper với QueryClient |
| 1.3  | `src/__tests__/mocks/data.js`     | Factory functions tạo mock data    |
| 1.4  | `src/__tests__/mocks/services.js` | Mock patterns cho services         |

**Ví dụ test-utils.jsx:**

```javascript
// src/__tests__/test-utils.jsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../config/theme';
import { vi } from 'vitest';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export function createWrapper(options = {}) {
    const { user = null } = options;
    const queryClient = createTestQueryClient();

    return function Wrapper({ children }) {
        return (
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={{ user, loading: false }}>{children}</AuthContext.Provider>
            </QueryClientProvider>
        );
    };
}

// Default auth context value
const defaultAuthValue = {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
};

export function renderWithProviders(
    ui,
    { authValue = defaultAuthValue, queryClient = createTestQueryClient(), route = '/' } = {}
) {
    function Wrapper({ children }) {
        return (
            <QueryClientProvider client={queryClient}>
                <ConfigProvider theme={theme} locale={viVN}>
                    <AuthContext.Provider value={authValue}>
                        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
                    </AuthContext.Provider>
                </ConfigProvider>
            </QueryClientProvider>
        );
    }

    return { ...render(ui, { wrapper: Wrapper }), queryClient };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
```

**Ví dụ mocks/data.js:**

```javascript
// src/__tests__/mocks/data.js
export const mockUser = (overrides = {}) => ({
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    ...overrides,
});

export const mockCourse = (overrides = {}) => ({
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    status: 'published',
    ...overrides,
});

export const mockPermissions = (overrides = {}) => ({
    courses: {
        read: { access: 'full', fields: ['*'] },
        create: { access: 'full', fields: ['*'] },
        update: { access: 'partial', fields: ['title', 'description'] },
        delete: { access: 'none', fields: [] },
    },
    ...overrides,
});
```

**Est. Time:** ~2 giờ

---

### Phase 2: Test usePermissions Hook (Priority: High)

**File:** `src/__tests__/hooks/usePermissions.test.js`

Hook này không phụ thuộc services, chỉ cần mock AuthContext.

| Test Case                                  | Mô tả                                       |
| ------------------------------------------ | ------------------------------------------- |
| `canRead()` returns true                   | Khi user có permission read với access=full |
| `canRead()` returns false                  | Khi user không có permission                |
| `canCreate()` with partial access          | Khi access=partial                          |
| `canUpdate()` returns false                | Khi access=none                             |
| `hasFieldPermission()` với wildcard        | Khi fields=["*"]                            |
| `hasFieldPermission()` với specific fields | Khi fields=["name", "email"]                |
| Edge case: null permissions                | Khi user.all_permissions undefined          |
| Edge case: empty user                      | Khi user là null                            |

**Ví dụ test:**

```javascript
// src/__tests__/hooks/usePermissions.test.js
import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { usePermissions } from '../../hooks/usePermissions';
import { createWrapper } from '../test-utils';
import { mockPermissions } from '../mocks/data';

describe('usePermissions', () => {
    describe('canRead', () => {
        test('should return true when user has full read access', () => {
            const user = {
                all_permissions: mockPermissions(),
            };
            const wrapper = createWrapper({ user });

            const { result } = renderHook(() => usePermissions(), { wrapper });

            expect(result.current.canRead('courses')).toBe(true);
        });

        test('should return false when user has no permissions', () => {
            const wrapper = createWrapper({ user: null });

            const { result } = renderHook(() => usePermissions(), { wrapper });

            expect(result.current.canRead('courses')).toBe(false);
        });
    });

    describe('hasFieldPermission', () => {
        test('should return true for wildcard fields', () => {
            const user = {
                all_permissions: {
                    courses: {
                        read: { access: 'full', fields: ['*'] },
                    },
                },
            };
            const wrapper = createWrapper({ user });

            const { result } = renderHook(() => usePermissions(), { wrapper });

            expect(result.current.canReadField('courses', 'title')).toBe(true);
        });
    });
});
```

**Est. Time:** ~1 giờ

---

### Phase 3: Test useUsers Hooks (Priority: High)

**File:** `src/__tests__/hooks/useUsers.test.js`

| Test Case                | Hook                 | Mô tả                                        |
| ------------------------ | -------------------- | -------------------------------------------- |
| Fetch users successfully | `useUsers`           | Mock service trả về data, kiểm tra isSuccess |
| Fetch với params         | `useUsers({filter})` | Verify queryFn được gọi với params           |
| Fetch single user        | `useUser(id)`        | enabled khi có id                            |
| Skip fetch khi id null   | `useUser(null)`      | enabled=false, không gọi service             |
| Create user success      | `useCreateUser`      | invalidateQueries được gọi                   |
| Update user success      | `useUpdateUser`      | invalidate cả list và detail                 |
| Delete user success      | `useDeleteUser`      | invalidateQueries được gọi                   |
| Mutation loading state   | All mutations        | isLoading = true during mutation             |

**Ví dụ test:**

```javascript
// src/__tests__/hooks/useUsers.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useUsers, useUser, useCreateUser } from '../../hooks/useUsers';
import { userService } from '../../services/userService';
import { createWrapper } from '../test-utils';
import { mockUser } from '../mocks/data';

// Mock service
vi.mock('../../services/userService', () => ({
    userService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock showSuccess
vi.mock('../../utils/errorHandler', () => ({
    showSuccess: vi.fn(),
}));

describe('useUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useUsers', () => {
        test('should fetch users successfully', async () => {
            const mockUsers = [mockUser(), mockUser({ id: '2' })];
            userService.getAll.mockResolvedValue(mockUsers);

            const { result } = renderHook(() => useUsers(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockUsers);
            expect(userService.getAll).toHaveBeenCalledWith({});
        });

        test('should pass params to service', async () => {
            const params = { filter: { role: { _eq: 'admin' } } };
            userService.getAll.mockResolvedValue([]);

            renderHook(() => useUsers(params), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(userService.getAll).toHaveBeenCalledWith(params);
            });
        });
    });

    describe('useUser', () => {
        test('should fetch single user when id provided', async () => {
            const user = mockUser();
            userService.getById.mockResolvedValue(user);

            const { result } = renderHook(() => useUser('1'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(user);
        });

        test('should not fetch when id is null', () => {
            const { result } = renderHook(() => useUser(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.isFetching).toBe(false);
            expect(userService.getById).not.toHaveBeenCalled();
        });
    });

    describe('useCreateUser', () => {
        test('should create user and invalidate queries', async () => {
            const newUser = mockUser();
            userService.create.mockResolvedValue(newUser);

            const { result } = renderHook(() => useCreateUser(), {
                wrapper: createWrapper(),
            });

            await result.current.mutateAsync({ email: 'new@test.com' });

            expect(userService.create).toHaveBeenCalled();
        });
    });
});
```

**Est. Time:** ~1.5 giờ

---

### Phase 4: Test useCourses Hooks (Priority: High)

**File:** `src/__tests__/hooks/useCourses.test.js`

| Test Case               | Hook                         | Mô tả                   |
| ----------------------- | ---------------------------- | ----------------------- |
| Fetch published courses | `usePublishedCourses`        | Với filters             |
| Count courses           | `useCoursesCount`            | Pagination support      |
| Fetch course detail     | `useCourseDetail(id)`        | enabled khi có id       |
| Skip fetch khi id null  | `useCourseDetail(null)`      | enabled=false           |
| Fetch featured courses  | `useFeaturedCourses`         | Với limit param         |
| Fetch popular courses   | `usePopularCourses`          | Với limit param         |
| Fetch course modules    | `useCourseModules(courseId)` | enabled khi có courseId |
| Fetch lesson detail     | `useLessonDetail(lessonId)`  | enabled khi có lessonId |
| Fetch tags              | `useTags`                    | staleTime x2            |

**Est. Time:** ~1.5 giờ

---

### Phase 5: Test CRUD Hooks (Priority: Medium)

Áp dụng pattern tương tự useUsers cho các hooks còn lại:

| File                                           | Hooks                                                                 | Est. Time |
| ---------------------------------------------- | --------------------------------------------------------------------- | --------- |
| `src/__tests__/hooks/useModules.test.js`       | useModules, useCreateModule, useUpdateModule, useDeleteModule         | ~40 phút  |
| `src/__tests__/hooks/useLessons.test.js`       | useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson         | ~40 phút  |
| `src/__tests__/hooks/useEnrollments.test.js`   | useEnrollments, useCreateEnrollment, useUpdateEnrollment              | ~40 phút  |
| `src/__tests__/hooks/useTags.test.js`          | useTags, useCreateTag, useUpdateTag, useDeleteTag                     | ~40 phút  |
| `src/__tests__/hooks/useDocuments.test.js`     | useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument | ~40 phút  |
| `src/__tests__/hooks/useLearningPaths.test.js` | useLearningPaths, useCreateLearningPath, useUpdateLearningPath        | ~40 phút  |

**Est. Time:** ~4 giờ

---

### Phase 6: Test Quiz & Progress Hooks (Priority: Medium)

| File                                            | Hooks                                                             | Est. Time |
| ----------------------------------------------- | ----------------------------------------------------------------- | --------- |
| `src/__tests__/hooks/useQuizzes.test.js`        | useQuizzes, useQuiz, useCreateQuiz, useUpdateQuiz                 | ~40 phút  |
| `src/__tests__/hooks/useQuestionBank.test.js`   | useQuestionBank, useCreateQuestion, useUpdateQuestion             | ~40 phút  |
| `src/__tests__/hooks/useQuizAttempts.test.js`   | useQuizAttempts, useMyAttempts, useStartAttempt, useSubmitAttempt | ~40 phút  |
| `src/__tests__/hooks/useLessonProgress.test.js` | useLessonProgress, useMarkComplete, useUpdateProgress             | ~30 phút  |
| `src/__tests__/hooks/useCertificates.test.js`   | useCertificates, useMyCertificates                                | ~30 phút  |

**Est. Time:** ~3 giờ

---

### Phase 7: Test Remaining Hooks (Priority: Lower)

| File                                       | Hooks                                                   | Est. Time |
| ------------------------------------------ | ------------------------------------------------------- | --------- |
| `src/__tests__/hooks/useComments.test.js`  | useComments, useCreateComment, useDeleteComment         | ~25 phút  |
| `src/__tests__/hooks/useNotes.test.js`     | useNotes, useCreateNote, useUpdateNote, useDeleteNote   | ~25 phút  |
| `src/__tests__/hooks/useReviews.test.js`   | useReviews, useCreateReview, useUpdateReview            | ~25 phút  |
| `src/__tests__/hooks/useDashboard.test.js` | useDashboardStats, usePopularCourses, useAtRiskLearners | ~25 phút  |
| `src/__tests__/hooks/useSettings.test.js`  | useSettings, useUpdateSettings                          | ~20 phút  |

**Est. Time:** ~2 giờ

---

## Import Paths trong Tests

```javascript
// Từ file: src/__tests__/hooks/useUsers.test.js

// Import hook cần test (đi lên 2 cấp từ __tests__/hooks)
import { useUsers } from '../../hooks/useUsers';

// Import service để mock (đi lên 2 cấp)
import { userService } from '../../services/userService';

// Import test utilities (đi lên 1 cấp từ hooks/)
import { createWrapper } from '../test-utils';

// Import mocks (cùng cấp với test-utils)
import { mockUser } from '../mocks/data';
```

---

## Tổng kết Effort

| Phase                    | Số files      | Est. Time   |
| ------------------------ | ------------- | ----------- |
| Phase 1: Test Utilities  | 4 files       | ~2 giờ      |
| Phase 2: usePermissions  | 1 file        | ~1 giờ      |
| Phase 3: useUsers        | 1 file        | ~1.5 giờ    |
| Phase 4: useCourses      | 1 file        | ~1.5 giờ    |
| Phase 5: CRUD Hooks      | 6 files       | ~4 giờ      |
| Phase 6: Quiz & Progress | 5 files       | ~3 giờ      |
| Phase 7: Remaining       | 5 files       | ~2 giờ      |
| **Tổng**                 | **23+ files** | **~15 giờ** |

---

## Commands

```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy test cho một file cụ thể
npx vitest run src/__tests__/hooks/useUsers.test.js

# Chạy tests matching pattern
npx vitest run --testNamePattern="usePermissions"

# Watch mode cho một file
npx vitest src/__tests__/hooks/useUsers.test.js
```

---

## Checklist

### Phase 1: Test Utilities

- [ ] Mở rộng `src/__tests__/setup.js`
- [ ] Tạo `src/__tests__/test-utils.jsx`
- [ ] Tạo `src/__tests__/mocks/data.js`
- [ ] Tạo `src/__tests__/mocks/services.js`

### Phase 2: usePermissions

- [ ] `src/__tests__/hooks/usePermissions.test.js`

### Phase 3: useUsers

- [ ] `src/__tests__/hooks/useUsers.test.js`

### Phase 4: useCourses

- [ ] `src/__tests__/hooks/useCourses.test.js`

### Phase 5: CRUD Hooks

- [ ] `src/__tests__/hooks/useModules.test.js`
- [ ] `src/__tests__/hooks/useLessons.test.js`
- [ ] `src/__tests__/hooks/useEnrollments.test.js`
- [ ] `src/__tests__/hooks/useTags.test.js`
- [ ] `src/__tests__/hooks/useDocuments.test.js`
- [ ] `src/__tests__/hooks/useLearningPaths.test.js`

### Phase 6: Quiz & Progress

- [ ] `src/__tests__/hooks/useQuizzes.test.js`
- [ ] `src/__tests__/hooks/useQuestionBank.test.js`
- [ ] `src/__tests__/hooks/useQuizAttempts.test.js`
- [ ] `src/__tests__/hooks/useLessonProgress.test.js`
- [ ] `src/__tests__/hooks/useCertificates.test.js`

### Phase 7: Remaining

- [ ] `src/__tests__/hooks/useComments.test.js`
- [ ] `src/__tests__/hooks/useNotes.test.js`
- [ ] `src/__tests__/hooks/useReviews.test.js`
- [ ] `src/__tests__/hooks/useDashboard.test.js`
- [ ] `src/__tests__/hooks/useSettings.test.js`

---

## Quick Start

```bash
# 1. Tạo cấu trúc thư mục tests
mkdir -p src/__tests__/hooks
mkdir -p src/__tests__/mocks

# 2. Tạo các file utilities
touch src/__tests__/test-utils.jsx
touch src/__tests__/mocks/data.js
touch src/__tests__/mocks/services.js

# 3. Bắt đầu với Phase 2 - usePermissions
touch src/__tests__/hooks/usePermissions.test.js

# 4. Chạy test
npm test

# 5. Xem coverage
npm run test:coverage
```

---

## Ghi chú

- **Mock Strategy:** Sử dụng `vi.mock()` của Vitest (native, hiệu quả)
- **Centralized Tests:** Tập trung tất cả tests trong thư mục `src/__tests__/`
- **Mirror Structure:** Cấu trúc tests phản ánh cấu trúc source code
- **Coverage Target:** 70%+ cho business logic
- **Test Pattern:** Arrange → Act → Assert
- **Naming Convention:** `describe` cho nhóm, `test` cho cases

---

**Tài liệu cập nhật:** 2026-01-15  
**Version:** 2.0 - Centralized Test Structure
