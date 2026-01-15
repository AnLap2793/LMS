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

## Phân loại Hooks theo Pattern

| Pattern               | Hooks                                                                                                                                                                                                                                                 | Testing Strategy                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **React Query Hooks** | useUsers, useCourses, useModules, useLessons, useQuizzes, useEnrollments, useCertificates, useDocuments, useTags, useLearningPaths, useQuestionBank, useQuizAttempts, useLessonProgress, useNotes, useComments, useReviews, useDashboard, useSettings | Mock services + renderHook + waitFor |
| **Logic Hooks**       | usePermissions                                                                                                                                                                                                                                        | Mock AuthContext + renderHook        |

---

## Kế hoạch triển khai

### Phase 1: Chuẩn bị Test Utilities (Priority: Critical)

**Mục tiêu:** Tạo các utilities dùng chung cho tất cả tests

| Task | File                                   | Mô tả                              |
| ---- | -------------------------------------- | ---------------------------------- |
| 1.1  | `src/__tests__/setup.js`               | Mở rộng setup với global mocks     |
| 1.2  | `src/__tests__/utils/testUtils.js`     | Tạo render wrapper với QueryClient |
| 1.3  | `src/__tests__/utils/mockFactories.js` | Factory functions tạo mock data    |
| 1.4  | `src/__tests__/mocks/serviceMocks.js`  | Mock patterns cho services         |

**Ví dụ testUtils.js:**

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';

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
```

**Ví dụ mockFactories.js:**

```javascript
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

**File:** `src/hooks/usePermissions.test.js`

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
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { createWrapper } from '../__tests__/utils/testUtils';
import { mockPermissions } from '../__tests__/utils/mockFactories';

describe('usePermissions', () => {
    describe('canRead', () => {
        it('should return true when user has full read access', () => {
            const user = {
                all_permissions: mockPermissions(),
            };
            const wrapper = createWrapper({ user });

            const { result } = renderHook(() => usePermissions(), { wrapper });

            expect(result.current.canRead('courses')).toBe(true);
        });

        it('should return false when user has no permissions', () => {
            const wrapper = createWrapper({ user: null });

            const { result } = renderHook(() => usePermissions(), { wrapper });

            expect(result.current.canRead('courses')).toBe(false);
        });
    });

    describe('hasFieldPermission', () => {
        it('should return true for wildcard fields', () => {
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

**File:** `src/hooks/useUsers.test.js`

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
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers, useUser, useCreateUser } from './useUsers';
import { userService } from '../services/userService';
import { createWrapper, createTestQueryClient } from '../__tests__/utils/testUtils';
import { mockUser } from '../__tests__/utils/mockFactories';

// Mock service
vi.mock('../services/userService', () => ({
    userService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock showSuccess
vi.mock('../utils/errorHandler', () => ({
    showSuccess: vi.fn(),
}));

describe('useUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useUsers', () => {
        it('should fetch users successfully', async () => {
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

        it('should pass params to service', async () => {
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
        it('should fetch single user when id provided', async () => {
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

        it('should not fetch when id is null', () => {
            const { result } = renderHook(() => useUser(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.isFetching).toBe(false);
            expect(userService.getById).not.toHaveBeenCalled();
        });
    });

    describe('useCreateUser', () => {
        it('should create user and invalidate queries', async () => {
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

**File:** `src/hooks/useCourses.test.js`

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

| File                       | Hooks                                                                 | Est. Time |
| -------------------------- | --------------------------------------------------------------------- | --------- |
| `useModules.test.js`       | useModules, useCreateModule, useUpdateModule, useDeleteModule         | ~40 phút  |
| `useLessons.test.js`       | useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson         | ~40 phút  |
| `useEnrollments.test.js`   | useEnrollments, useCreateEnrollment, useUpdateEnrollment              | ~40 phút  |
| `useTags.test.js`          | useTags, useCreateTag, useUpdateTag, useDeleteTag                     | ~40 phút  |
| `useDocuments.test.js`     | useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument | ~40 phút  |
| `useLearningPaths.test.js` | useLearningPaths, useCreateLearningPath, useUpdateLearningPath        | ~40 phút  |

**Est. Time:** ~4 giờ

---

### Phase 6: Test Quiz & Progress Hooks (Priority: Medium)

| File                        | Hooks                                                             | Est. Time |
| --------------------------- | ----------------------------------------------------------------- | --------- |
| `useQuizzes.test.js`        | useQuizzes, useQuiz, useCreateQuiz, useUpdateQuiz                 | ~40 phút  |
| `useQuestionBank.test.js`   | useQuestionBank, useCreateQuestion, useUpdateQuestion             | ~40 phút  |
| `useQuizAttempts.test.js`   | useQuizAttempts, useMyAttempts, useStartAttempt, useSubmitAttempt | ~40 phút  |
| `useLessonProgress.test.js` | useLessonProgress, useMarkComplete, useUpdateProgress             | ~30 phút  |
| `useCertificates.test.js`   | useCertificates, useMyCertificates                                | ~30 phút  |

**Est. Time:** ~3 giờ

---

### Phase 7: Test Remaining Hooks (Priority: Lower)

| File                   | Hooks                                                   | Est. Time |
| ---------------------- | ------------------------------------------------------- | --------- |
| `useComments.test.js`  | useComments, useCreateComment, useDeleteComment         | ~25 phút  |
| `useNotes.test.js`     | useNotes, useCreateNote, useUpdateNote, useDeleteNote   | ~25 phút  |
| `useReviews.test.js`   | useReviews, useCreateReview, useUpdateReview            | ~25 phút  |
| `useDashboard.test.js` | useDashboardStats, usePopularCourses, useAtRiskLearners | ~25 phút  |
| `useSettings.test.js`  | useSettings, useUpdateSettings                          | ~20 phút  |

**Est. Time:** ~2 giờ

---

## Cấu trúc thư mục sau khi hoàn thành

```
src/
├── __tests__/
│   ├── setup.js                    # Mở rộng với global mocks
│   ├── utils/
│   │   ├── testUtils.js            # Render wrappers
│   │   └── mockFactories.js        # Mock data factories
│   └── mocks/
│       └── serviceMocks.js         # Service mock patterns
├── hooks/
│   ├── useUsers.js
│   ├── useUsers.test.js            # ✅ Co-located test
│   ├── useCourses.js
│   ├── useCourses.test.js          # ✅ Co-located test
│   ├── usePermissions.js
│   ├── usePermissions.test.js      # ✅ Co-located test
│   ├── useModules.js
│   ├── useModules.test.js          # ✅ Co-located test
│   └── ... (các hook và test khác)
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
npx vitest run src/hooks/useUsers.test.js

# Chạy tests matching pattern
npx vitest run --testNamePattern="usePermissions"

# Watch mode cho một file
npx vitest src/hooks/useUsers.test.js
```

---

## Checklist

### Phase 1: Test Utilities

- [ ] Mở rộng `src/__tests__/setup.js`
- [ ] Tạo `src/__tests__/utils/testUtils.js`
- [ ] Tạo `src/__tests__/utils/mockFactories.js`
- [ ] Tạo `src/__tests__/mocks/serviceMocks.js`

### Phase 2: usePermissions

- [ ] `src/hooks/usePermissions.test.js`

### Phase 3: useUsers

- [ ] `src/hooks/useUsers.test.js`

### Phase 4: useCourses

- [ ] `src/hooks/useCourses.test.js`

### Phase 5: CRUD Hooks

- [ ] `src/hooks/useModules.test.js`
- [ ] `src/hooks/useLessons.test.js`
- [ ] `src/hooks/useEnrollments.test.js`
- [ ] `src/hooks/useTags.test.js`
- [ ] `src/hooks/useDocuments.test.js`
- [ ] `src/hooks/useLearningPaths.test.js`

### Phase 6: Quiz & Progress

- [ ] `src/hooks/useQuizzes.test.js`
- [ ] `src/hooks/useQuestionBank.test.js`
- [ ] `src/hooks/useQuizAttempts.test.js`
- [ ] `src/hooks/useLessonProgress.test.js`
- [ ] `src/hooks/useCertificates.test.js`

### Phase 7: Remaining

- [ ] `src/hooks/useComments.test.js`
- [ ] `src/hooks/useNotes.test.js`
- [ ] `src/hooks/useReviews.test.js`
- [ ] `src/hooks/useDashboard.test.js`
- [ ] `src/hooks/useSettings.test.js`

---

## Ghi chú

- **Mock Strategy:** Sử dụng `vi.mock()` của Vitest (native, hiệu quả)
- **Co-located Tests:** Đặt test files cùng thư mục với source files
- **Coverage Target:** 70%+ cho business logic
- **Test Pattern:** Arrange → Act → Assert
- **Naming Convention:** `describe` cho nhóm, `it`/`test` cho cases
