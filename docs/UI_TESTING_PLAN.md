# UI Testing Plan - LMS Project

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Cấu trúc Testing](#2-cấu-trúc-testing)
3. [Testing Patterns](#3-testing-patterns)
4. [Phase 1: Common Components](#4-phase-1-common-components)
5. [Phase 2: Layout Components](#5-phase-2-layout-components)
6. [Phase 3: Admin Form Modals](#6-phase-3-admin-form-modals)
7. [Phase 4: Public & Auth Pages](#7-phase-4-public--auth-pages)
8. [Phase 5: Learner Pages](#8-phase-5-learner-pages)
9. [Phase 6: Admin Pages](#9-phase-6-admin-pages)
10. [Mocking Strategies](#10-mocking-strategies)
11. [Test Utilities](#11-test-utilities)
12. [Checklist & Timeline](#12-checklist--timeline)

---

## 1. Tổng quan

### 1.1 Hiện trạng

| Metric             | Giá trị                        |
| ------------------ | ------------------------------ |
| Tổng số Components | 27                             |
| Tổng số Pages      | 41                             |
| Tests hiện có      | 0                              |
| Framework          | Vitest + React Testing Library |
| Coverage hiện tại  | 0%                             |
| Coverage mục tiêu  | 70%+                           |

### 1.2 Tech Stack Testing

```json
{
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1"
}
```

### 1.3 Commands

```bash
# Chạy tests trong watch mode
npm test

# Chạy tests với coverage report
npm run test:coverage

# Chạy một file test cụ thể
npx vitest run src/__tests__/components/common/StatusTag.test.jsx

# Chạy tests matching pattern
npx vitest run --testNamePattern="renders correctly"
```

---

## 2. Cấu trúc Testing

### 2.1 Tổ chức Test Files

**Tập trung tất cả tests trong thư mục `src/__tests__/`** - giữ source code sạch sẽ và dễ quản lý:

```
src/
├── components/              # Source code ONLY - không có test files
│   ├── common/
│   │   ├── StatusTag.jsx
│   │   ├── DifficultyTag.jsx
│   │   └── ...
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   └── AdminLayout.jsx
│   └── admin/
│       └── UserFormModal.jsx
├── pages/                   # Source code ONLY
│   ├── public/
│   │   └── LoginPage.jsx
│   └── private/
│       └── ...
├── hooks/                   # Source code ONLY
│   └── useUsers.js
├── __tests__/               # TẤT CẢ TESTS TẬP TRUNG TẠI ĐÂY
│   ├── setup.js             # Test setup (đã có)
│   ├── test-utils.jsx       # Custom render utilities
│   ├── mocks/               # Shared mocks
│   │   ├── handlers.js      # MSW handlers (nếu dùng)
│   │   ├── directus.js      # Mock Directus client
│   │   └── data.js          # Mock data
│   ├── components/          # Component tests (mirror structure)
│   │   ├── common/
│   │   │   ├── StatusTag.test.jsx
│   │   │   ├── DifficultyTag.test.jsx
│   │   │   ├── LessonTypeTag.test.jsx
│   │   │   ├── EmptyState.test.jsx
│   │   │   ├── PageHeader.test.jsx
│   │   │   ├── ErrorBoundary.test.jsx
│   │   │   └── NotificationPopover.test.jsx
│   │   ├── layout/
│   │   │   ├── ProtectedRoute.test.jsx
│   │   │   ├── AppLayout.test.jsx
│   │   │   └── AdminLayout.test.jsx
│   │   └── admin/
│   │       ├── UserFormModal.test.jsx
│   │       ├── LessonFormModal.test.jsx
│   │       └── ...
│   ├── pages/               # Page tests (mirror structure)
│   │   ├── public/
│   │   │   ├── LoginPage.test.jsx
│   │   │   ├── RegisterPage.test.jsx
│   │   │   └── NotFoundPage.test.jsx
│   │   └── private/
│   │       ├── admin/
│   │       │   ├── DashboardPage.test.jsx
│   │       │   └── UserListPage.test.jsx
│   │       └── learner/
│   │           ├── CourseCatalogPage.test.jsx
│   │           └── QuizTakingPage.test.jsx
│   └── hooks/               # Hook tests
│       ├── useUsers.test.js
│       ├── useCourses.test.js
│       └── useAuth.test.js
```

### 2.2 Lợi ích của cấu trúc tập trung

| Lợi ích              | Mô tả                                             |
| -------------------- | ------------------------------------------------- |
| **Source code sạch** | Thư mục components/pages chỉ chứa production code |
| **Dễ quản lý**       | Tất cả tests ở một nơi, dễ tìm kiếm               |
| **Mirror structure** | Cấu trúc **tests** phản ánh cấu trúc src          |
| **Dễ exclude**       | Dễ dàng exclude tests khi build                   |
| **Team friendly**    | Rõ ràng cho team members mới                      |

### 2.3 Naming Convention

```
ComponentName.test.jsx    # Unit tests cho component
PageName.test.jsx         # Integration tests cho page
hookName.test.js          # Tests cho custom hooks
```

### 2.4 Import Paths trong Tests

```javascript
// Từ file: src/__tests__/components/common/StatusTag.test.jsx

// Import component cần test (đi lên 3 cấp từ __tests__)
import StatusTag from '../../../components/common/StatusTag';

// Import test utilities (cùng cấp với __tests__)
import { renderWithProviders } from '../../test-utils';

// Import mocks
import { mockUsers } from '../../mocks/data';
```

---

## 3. Testing Patterns

### 3.1 Test Structure (AAA Pattern)

```javascript
// src/__tests__/components/common/StatusTag.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusTag from '../../../components/common/StatusTag';

describe('StatusTag', () => {
    // Arrange: Setup chung cho group tests
    const defaultProps = {
        status: 'draft',
    };

    test('renders draft status correctly', () => {
        // Arrange
        render(<StatusTag {...defaultProps} />);

        // Act (nếu cần)
        // Không cần action cho test này

        // Assert
        expect(screen.getByText('Bản nháp')).toBeInTheDocument();
    });

    test('handles click event', async () => {
        // Arrange
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<StatusTag {...defaultProps} onClick={handleClick} />);

        // Act
        await user.click(screen.getByRole('button'));

        // Assert
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### 3.2 Component Test Categories

| Category            | Mô tả                           | Ví dụ                            |
| ------------------- | ------------------------------- | -------------------------------- |
| Render Tests        | Component render đúng với props | StatusTag hiển thị đúng text/màu |
| Interaction Tests   | User interactions hoạt động     | Click, type, submit form         |
| State Tests         | State changes đúng              | Loading, error, success states   |
| Prop Tests          | Props được áp dụng đúng         | disabled, className, style       |
| Accessibility Tests | A11y compliance                 | Role, aria-label, keyboard nav   |

### 3.3 Query Priority

Sử dụng queries theo thứ tự ưu tiên (theo RTL best practices):

```javascript
// 1. Queries accessible to everyone
screen.getByRole('button', { name: 'Submit' }); // Ưu tiên nhất
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');
screen.getByText('Hello World');

// 2. Semantic queries
screen.getByAltText('Logo');
screen.getByTitle('Close');

// 3. Test IDs (fallback cuối cùng)
screen.getByTestId('custom-element'); // Tránh dùng nếu có thể
```

---

## 4. Phase 1: Common Components

**Ưu tiên: CAO** | **Thời gian: 2-3 ngày** | **Test cases: ~25-30**

### 4.1 StatusTag

**File:** `src/__tests__/components/common/StatusTag.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatusTag from '../../../components/common/StatusTag';

describe('StatusTag', () => {
    describe('renders correct label', () => {
        test('displays "Bản nháp" for draft status', () => {
            render(<StatusTag status="draft" />);
            expect(screen.getByText('Bản nháp')).toBeInTheDocument();
        });

        test('displays "Đã xuất bản" for published status', () => {
            render(<StatusTag status="published" />);
            expect(screen.getByText('Đã xuất bản')).toBeInTheDocument();
        });

        test('displays "Đã lưu trữ" for archived status', () => {
            render(<StatusTag status="archived" />);
            expect(screen.getByText('Đã lưu trữ')).toBeInTheDocument();
        });
    });

    describe('renders correct color', () => {
        test('uses default color for draft', () => {
            const { container } = render(<StatusTag status="draft" />);
            const tag = container.querySelector('.ant-tag');
            expect(tag).toHaveClass('ant-tag-default');
        });

        test('uses success color for published', () => {
            const { container } = render(<StatusTag status="published" />);
            const tag = container.querySelector('.ant-tag');
            expect(tag).toHaveClass('ant-tag-success');
        });

        test('uses warning color for archived', () => {
            const { container } = render(<StatusTag status="archived" />);
            const tag = container.querySelector('.ant-tag');
            expect(tag).toHaveClass('ant-tag-warning');
        });
    });

    test('handles unknown status gracefully', () => {
        render(<StatusTag status="unknown" />);
        // Should render something, not crash
        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
```

### 4.2 DifficultyTag

**File:** `src/__tests__/components/common/DifficultyTag.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import DifficultyTag from '../../../components/common/DifficultyTag';

describe('DifficultyTag', () => {
    const testCases = [
        { level: 'beginner', label: 'Cơ bản', color: 'green' },
        { level: 'intermediate', label: 'Trung bình', color: 'blue' },
        { level: 'advanced', label: 'Nâng cao', color: 'red' },
    ];

    test.each(testCases)('renders "$label" with $color color for $level', ({ level, label }) => {
        render(<DifficultyTag level={level} />);
        expect(screen.getByText(label)).toBeInTheDocument();
    });

    test('renders nothing for invalid level', () => {
        const { container } = render(<DifficultyTag level="invalid" />);
        expect(container.firstChild).toBeNull();
    });
});
```

### 4.3 LessonTypeTag

**File:** `src/__tests__/components/common/LessonTypeTag.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import LessonTypeTag from '../../../components/common/LessonTypeTag';

describe('LessonTypeTag', () => {
    const types = [
        { type: 'video', icon: 'PlayCircleOutlined' },
        { type: 'article', icon: 'FileTextOutlined' },
        { type: 'link', icon: 'LinkOutlined' },
        { type: 'quiz', icon: 'FormOutlined' },
    ];

    test.each(types)('renders icon for $type type', ({ type }) => {
        render(<LessonTypeTag type={type} />);
        // Check that tag is rendered
        expect(screen.getByText(type, { exact: false })).toBeInTheDocument();
    });
});
```

### 4.4 EmptyState

**File:** `src/__tests__/components/common/EmptyState.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import EmptyState from '../../../components/common/EmptyState';

describe('EmptyState', () => {
    test('renders default message', () => {
        render(<EmptyState />);
        expect(screen.getByText(/không có dữ liệu/i)).toBeInTheDocument();
    });

    test('renders custom message', () => {
        render(<EmptyState message="Chưa có khóa học nào" />);
        expect(screen.getByText('Chưa có khóa học nào')).toBeInTheDocument();
    });

    test('renders action button when provided', () => {
        render(<EmptyState message="Chưa có khóa học" actionText="Tạo khóa học" onAction={() => {}} />);
        expect(screen.getByRole('button', { name: 'Tạo khóa học' })).toBeInTheDocument();
    });

    test('does not render action button when not provided', () => {
        render(<EmptyState message="Chưa có khóa học" />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('calls onAction when button clicked', async () => {
        const user = userEvent.setup();
        const handleAction = vi.fn();

        render(<EmptyState message="Chưa có khóa học" actionText="Tạo khóa học" onAction={handleAction} />);

        await user.click(screen.getByRole('button', { name: 'Tạo khóa học' }));
        expect(handleAction).toHaveBeenCalledTimes(1);
    });
});
```

### 4.5 PageHeader

**File:** `src/__tests__/components/common/PageHeader.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';

// Wrapper for Router context
const renderWithRouter = ui => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PageHeader', () => {
    test('renders title', () => {
        renderWithRouter(<PageHeader title="Quản lý người dùng" />);
        expect(screen.getByText('Quản lý người dùng')).toBeInTheDocument();
    });

    test('renders subtitle when provided', () => {
        renderWithRouter(
            <PageHeader title="Quản lý người dùng" subtitle="Danh sách tất cả người dùng trong hệ thống" />
        );
        expect(screen.getByText('Danh sách tất cả người dùng trong hệ thống')).toBeInTheDocument();
    });

    test('renders breadcrumbs when provided', () => {
        const breadcrumbs = [
            { label: 'Trang chủ', path: '/' },
            { label: 'Người dùng', path: '/users' },
        ];

        renderWithRouter(<PageHeader title="Chi tiết" breadcrumbs={breadcrumbs} />);

        expect(screen.getByText('Trang chủ')).toBeInTheDocument();
        expect(screen.getByText('Người dùng')).toBeInTheDocument();
    });

    test('renders action buttons when provided', async () => {
        const user = userEvent.setup();
        const handleAdd = vi.fn();

        renderWithRouter(
            <PageHeader title="Người dùng" actions={[{ label: 'Thêm mới', onClick: handleAdd, type: 'primary' }]} />
        );

        const addButton = screen.getByRole('button', { name: 'Thêm mới' });
        expect(addButton).toBeInTheDocument();

        await user.click(addButton);
        expect(handleAdd).toHaveBeenCalledTimes(1);
    });
});
```

### 4.6 ErrorBoundary

**File:** `src/__tests__/components/common/ErrorBoundary.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();
    });
    afterAll(() => {
        console.error = originalError;
    });

    test('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <div>Child content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    test('renders fallback UI when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/có lỗi xảy ra/i)).toBeInTheDocument();
    });

    test('renders reload button in fallback UI', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /tải lại/i })).toBeInTheDocument();
    });
});
```

### 4.7 NotificationPopover

**File:** `src/__tests__/components/common/NotificationPopover.test.jsx`

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import NotificationPopover from '../../../components/common/NotificationPopover';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderWithProviders = ui => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('NotificationPopover', () => {
    test('renders notification bell icon', () => {
        renderWithProviders(<NotificationPopover />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('shows unread count badge when has notifications', () => {
        renderWithProviders(<NotificationPopover unreadCount={5} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('opens popover on click', async () => {
        const user = userEvent.setup();
        renderWithProviders(<NotificationPopover />);

        await user.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText(/thông báo/i)).toBeInTheDocument();
        });
    });
});
```

---

## 5. Phase 2: Layout Components

**Ưu tiên: CAO** | **Thời gian: 1-2 ngày** | **Test cases: ~15-20**

### 5.1 ProtectedRoute

**File:** `src/__tests__/components/layout/ProtectedRoute.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../components/layout/ProtectedRoute';
import { AuthContext } from '../../../context/AuthContext';

const renderWithAuth = (ui, { user = null, loading = false } = {}) => {
    return render(
        <AuthContext.Provider value={{ user, loading }}>
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/403" element={<div>Unauthorized</div>} />
                    <Route path="/protected" element={ui} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProtectedRoute', () => {
    test('shows loading spinner when loading', () => {
        renderWithAuth(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { loading: true }
        );

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    test('redirects to login when not authenticated', () => {
        renderWithAuth(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { user: null }
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('renders children when authenticated', () => {
        renderWithAuth(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { user: { id: 1, role: 'user' } }
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('redirects to 403 when role not allowed', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Content</div>
            </ProtectedRoute>,
            { user: { id: 1, role: 'user' } }
        );

        expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });

    test('renders children when role is allowed', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Content</div>
            </ProtectedRoute>,
            { user: { id: 1, role: 'admin' } }
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
});
```

### 5.2 AppLayout

**File:** `src/__tests__/components/layout/AppLayout.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../../context/AuthContext';
import AppLayout from '../../../components/layout/AppLayout';

const queryClient = new QueryClient();

const renderWithProviders = (ui, { user = { id: 1, name: 'Test User' } } = {}) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ user, logout: vi.fn() }}>
                <BrowserRouter>{ui}</BrowserRouter>
            </AuthContext.Provider>
        </QueryClientProvider>
    );
};

describe('AppLayout', () => {
    test('renders sidebar navigation', () => {
        renderWithProviders(
            <AppLayout>
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('renders header with user info', () => {
        renderWithProviders(
            <AppLayout>
                <div>Content</div>
            </AppLayout>,
            { user: { id: 1, name: 'Nguyễn Văn A' } }
        );

        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });

    test('renders children in content area', () => {
        renderWithProviders(
            <AppLayout>
                <div>Main Content Here</div>
            </AppLayout>
        );

        expect(screen.getByText('Main Content Here')).toBeInTheDocument();
    });

    test('toggles mobile drawer on menu button click', async () => {
        const user = userEvent.setup();

        // Mock window.innerWidth for mobile view
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        window.dispatchEvent(new Event('resize'));

        renderWithProviders(
            <AppLayout>
                <div>Content</div>
            </AppLayout>
        );

        const menuButton = screen.getByRole('button', { name: /menu/i });
        await user.click(menuButton);

        // Drawer should be visible
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
```

### 5.3 AdminLayout

**File:** `src/__tests__/components/layout/AdminLayout.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../../context/AuthContext';
import AdminLayout from '../../../components/layout/AdminLayout';

const queryClient = new QueryClient();

const renderWithProviders = ui => {
    const user = { id: 1, name: 'Admin', role: 'admin' };
    return render(
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ user, logout: vi.fn() }}>
                <BrowserRouter>{ui}</BrowserRouter>
            </AuthContext.Provider>
        </QueryClientProvider>
    );
};

describe('AdminLayout', () => {
    test('renders admin sidebar with menu items', () => {
        renderWithProviders(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText(/người dùng/i)).toBeInTheDocument();
        expect(screen.getByText(/khóa học/i)).toBeInTheDocument();
    });

    test('collapses sidebar on trigger click', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        await user.click(collapseButton);

        // Sidebar should be collapsed
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('ant-layout-sider-collapsed');
    });

    test('expands nested menu items on click', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Click on a parent menu item that has children
        const coursesMenu = screen.getByText(/khóa học/i);
        await user.click(coursesMenu);

        // Child items should be visible
        expect(screen.getByText(/danh sách khóa học/i)).toBeInTheDocument();
    });
});
```

---

## 6. Phase 3: Admin Form Modals

**Ưu tiên: TRUNG BÌNH** | **Thời gian: 4-5 ngày** | **Test cases: ~50-60**

### 6.1 Test Template cho Form Modals

**File:** `src/__tests__/components/admin/FormModal.test.jsx` (template)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import FormModal from '../../../components/admin/FormModal';

// Mock services
vi.mock('../../../services/someService', () => ({
    someService: {
        create: vi.fn().mockResolvedValue({ id: 1 }),
        update: vi.fn().mockResolvedValue({ id: 1 }),
    },
}));

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

const renderWithProviders = (ui, queryClient = createQueryClient()) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={viVN}>{ui}</ConfigProvider>
        </QueryClientProvider>
    );
};

describe('FormModal', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        test('renders modal when open is true', () => {
            renderWithProviders(<FormModal {...defaultProps} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        test('does not render modal when open is false', () => {
            renderWithProviders(<FormModal {...defaultProps} open={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        test('renders create title when no initialData', () => {
            renderWithProviders(<FormModal {...defaultProps} />);
            expect(screen.getByText(/thêm mới/i)).toBeInTheDocument();
        });

        test('renders edit title when has initialData', () => {
            renderWithProviders(<FormModal {...defaultProps} initialData={{ id: 1, name: 'Test' }} />);
            expect(screen.getByText(/chỉnh sửa/i)).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        test('shows error when required fields are empty', async () => {
            const user = userEvent.setup();
            renderWithProviders(<FormModal {...defaultProps} />);

            await user.click(screen.getByRole('button', { name: /lưu/i }));

            await waitFor(() => {
                expect(screen.getByText(/vui lòng nhập/i)).toBeInTheDocument();
            });
        });
    });

    describe('Cancel Action', () => {
        test('calls onClose when cancel button clicked', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            renderWithProviders(<FormModal {...defaultProps} onClose={onClose} />);

            await user.click(screen.getByRole('button', { name: /hủy/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
```

### 6.2 UserFormModal Test Cases

| Test Case                       | Mô tả                                      |
| ------------------------------- | ------------------------------------------ |
| renders all form fields         | Email, tên, phòng ban, chức vụ, trạng thái |
| validates required email        | Error message khi email trống              |
| validates email format          | Error message khi email sai format         |
| validates required name         | Error message khi tên trống                |
| populates form with initialData | Edit mode hiển thị đúng data               |
| calls create on new user        | mutationFn được gọi với data đúng          |
| calls update on existing user   | mutationFn được gọi với id và data         |
| disables submit while loading   | Button disabled khi đang submit            |
| shows loading spinner on submit | Loading indicator hiển thị                 |

### 6.3 LessonFormModal Test Cases

| Test Case                            | Mô tả                              |
| ------------------------------------ | ---------------------------------- |
| switches form based on type          | Video/Article/Link/Quiz forms      |
| shows video URL field for video type | URL input hiển thị                 |
| shows rich editor for article type   | LexicalEditor hiển thị             |
| shows link URL field for link type   | URL input hiển thị                 |
| shows quiz selector for quiz type    | Quiz dropdown hiển thị             |
| validates required fields per type   | Validation khác nhau cho từng type |

---

## 7. Phase 4: Public & Auth Pages

**Ưu tiên: CAO** | **Thời gian: 2-3 ngày** | **Test cases: ~25-30**

### 7.1 LoginPage

**File:** `src/__tests__/pages/public/LoginPage.test.jsx`

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../../context/AuthContext';
import LoginPage from '../../../pages/public/LoginPage';

const queryClient = new QueryClient();

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderLoginPage = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <AuthContext.Provider value={{ login: mockLogin, user: null }}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </AuthContext.Provider>
        </QueryClientProvider>
    );
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        test('renders login form', () => {
            renderLoginPage();

            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
        });

        test('renders forgot password link', () => {
            renderLoginPage();
            expect(screen.getByText(/quên mật khẩu/i)).toBeInTheDocument();
        });

        test('renders register link', () => {
            renderLoginPage();
            expect(screen.getByText(/đăng ký/i)).toBeInTheDocument();
        });
    });

    describe('Validation', () => {
        test('shows error when email is empty', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

            await waitFor(() => {
                expect(screen.getByText(/vui lòng nhập email/i)).toBeInTheDocument();
            });
        });

        test('shows error when email is invalid', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText(/email/i), 'invalid-email');
            await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

            await waitFor(() => {
                expect(screen.getByText(/email không hợp lệ/i)).toBeInTheDocument();
            });
        });
    });

    describe('Login Flow', () => {
        test('calls login with credentials on submit', async () => {
            const user = userEvent.setup();
            mockLogin.mockResolvedValue({ success: true });

            renderLoginPage();

            await user.type(screen.getByLabelText(/email/i), 'test@example.com');
            await user.type(screen.getByLabelText(/mật khẩu/i), 'password123');
            await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            });
        });

        test('navigates to dashboard on successful login', async () => {
            const user = userEvent.setup();
            mockLogin.mockResolvedValue({ success: true });

            renderLoginPage();

            await user.type(screen.getByLabelText(/email/i), 'test@example.com');
            await user.type(screen.getByLabelText(/mật khẩu/i), 'password123');
            await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });

        test('shows error message on failed login', async () => {
            const user = userEvent.setup();
            mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });

            renderLoginPage();

            await user.type(screen.getByLabelText(/email/i), 'test@example.com');
            await user.type(screen.getByLabelText(/mật khẩu/i), 'wrongpassword');
            await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });
    });
});
```

### 7.2 NotFoundPage

**File:** `src/__tests__/pages/public/NotFoundPage.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '../../../pages/public/NotFoundPage';

describe('NotFoundPage', () => {
    test('renders 404 status', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );

        expect(screen.getByText('404')).toBeInTheDocument();
    });

    test('renders error message', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/không tìm thấy trang/i)).toBeInTheDocument();
    });

    test('renders link to home page', () => {
        render(
            <BrowserRouter>
                <NotFoundPage />
            </BrowserRouter>
        );

        const homeLink = screen.getByRole('link', { name: /trang chủ/i });
        expect(homeLink).toHaveAttribute('href', '/');
    });
});
```

---

## 8. Phase 5: Learner Pages

**Ưu tiên: TRUNG BÌNH** | **Thời gian: 3-4 ngày** | **Test cases: ~40-50**

### 8.1 CourseCatalogPage Test Cases

| Test Case                  | Mô tả                           |
| -------------------------- | ------------------------------- |
| renders course list        | Danh sách khóa học hiển thị     |
| shows loading state        | Spinner khi đang load           |
| shows empty state          | EmptyState khi không có courses |
| filters by category        | Lọc theo danh mục               |
| filters by difficulty      | Lọc theo độ khó                 |
| searches by keyword        | Tìm kiếm theo từ khóa           |
| paginates results          | Phân trang hoạt động            |
| navigates to course detail | Click vào course                |

### 8.2 QuizTakingPage Test Cases

| Test Case                      | Mô tả                   |
| ------------------------------ | ----------------------- |
| renders quiz title             | Tiêu đề quiz hiển thị   |
| displays question count        | Số câu hỏi hiển thị     |
| shows current question         | Câu hỏi hiện tại        |
| navigates to next question     | Button next hoạt động   |
| navigates to previous question | Button prev hoạt động   |
| selects answer option          | Chọn đáp án             |
| shows timer if timed           | Đồng hồ đếm ngược       |
| submits quiz                   | Nộp bài hoạt động       |
| confirms before submit         | Xác nhận trước khi nộp  |
| handles timeout                | Tự động nộp khi hết giờ |

---

## 9. Phase 6: Admin Pages

**Ưu tiên: THẤP** | **Thời gian: 5-7 ngày** | **Test cases: ~70-80**

### 9.1 CRUD Page Test Template

```javascript
// src/__tests__/pages/private/admin/EntityListPage.test.jsx
describe('EntityListPage', () => {
    describe('List View', () => {
        test('renders table with data');
        test('shows loading state');
        test('shows empty state');
        test('sorts by columns');
        test('filters data');
        test('paginates data');
    });

    describe('Create', () => {
        test('opens create modal on add button click');
        test('creates new entity');
        test('shows success message');
        test('refreshes list after create');
    });

    describe('Update', () => {
        test('opens edit modal with data');
        test('updates entity');
        test('shows success message');
        test('refreshes list after update');
    });

    describe('Delete', () => {
        test('shows confirmation dialog');
        test('deletes entity on confirm');
        test('cancels delete on cancel');
        test('shows success message');
        test('refreshes list after delete');
    });
});
```

### 9.2 DashboardPage Test Cases

| Test Case               | Mô tả             |
| ----------------------- | ----------------- |
| renders dashboard title | Tiêu đề trang     |
| shows statistics cards  | Các card thống kê |
| renders charts          | Biểu đồ hiển thị  |
| shows recent activities | Hoạt động gần đây |
| handles loading state   | Loading states    |
| handles error state     | Error handling    |

---

## 10. Mocking Strategies

### 10.1 Mock Directus Client

**File:** `src/__tests__/mocks/directus.js`

```javascript
import { vi } from 'vitest';

export const mockDirectus = {
    login: vi.fn().mockResolvedValue({}),
    logout: vi.fn().mockResolvedValue({}),
    request: vi.fn().mockResolvedValue([]),
};

vi.mock('../../services/directus', () => ({
    directus: mockDirectus,
}));
```

### 10.2 Mock Services

**File:** `src/__tests__/mocks/services.js`

```javascript
import { vi } from 'vitest';

// User Service Mock
export const mockUserService = {
    getAll: vi.fn().mockResolvedValue([
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
    ]),
    getById: vi.fn().mockResolvedValue({ id: 1, name: 'User 1' }),
    create: vi.fn().mockResolvedValue({ id: 3, name: 'New User' }),
    update: vi.fn().mockResolvedValue({ id: 1, name: 'Updated User' }),
    delete: vi.fn().mockResolvedValue({}),
};

// Course Service Mock
export const mockCourseService = {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
    delete: vi.fn().mockResolvedValue({}),
};

// Apply mocks
vi.mock('../../services/userService', () => ({
    userService: mockUserService,
}));

vi.mock('../../services/courseService', () => ({
    courseService: mockCourseService,
}));
```

### 10.3 Mock Data

**File:** `src/__tests__/mocks/data.js`

```javascript
export const mockUsers = [
    {
        id: '1',
        first_name: 'Nguyễn',
        last_name: 'Văn A',
        email: 'nguyenvana@example.com',
        role: 'admin',
        status: 'active',
    },
    {
        id: '2',
        first_name: 'Trần',
        last_name: 'Thị B',
        email: 'tranthib@example.com',
        role: 'user',
        status: 'active',
    },
];

export const mockCourses = [
    {
        id: '1',
        title: 'React Fundamentals',
        description: 'Learn React basics',
        status: 'published',
        difficulty: 'beginner',
        thumbnail: '/images/react.jpg',
    },
    {
        id: '2',
        title: 'Advanced TypeScript',
        description: 'Master TypeScript',
        status: 'draft',
        difficulty: 'advanced',
        thumbnail: '/images/typescript.jpg',
    },
];

export const mockQuizzes = [
    {
        id: '1',
        title: 'JavaScript Basics Quiz',
        description: 'Test your JS knowledge',
        time_limit: 30,
        passing_score: 70,
        questions_count: 10,
    },
];
```

---

## 11. Test Utilities

### 11.1 Custom Render

**File:** `src/__tests__/test-utils.jsx`

```javascript
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../config/theme';
import { vi } from 'vitest';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
    new QueryClient({
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

// Default auth context value
const defaultAuthValue = {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
};

/**
 * Custom render function with all providers
 */
export function renderWithProviders(
    ui,
    { authValue = defaultAuthValue, queryClient = createTestQueryClient(), route = '/', ...renderOptions } = {}
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

    return {
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
        queryClient,
    };
}

/**
 * Render with router only (for simple components)
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingToFinish() {
    const loadingSpinners = document.querySelectorAll('.ant-spin');
    if (loadingSpinners.length > 0) {
        await waitFor(() => {
            expect(document.querySelector('.ant-spin')).not.toBeInTheDocument();
        });
    }
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
```

### 11.2 Usage Example

```javascript
// src/__tests__/pages/private/admin/UserListPage.test.jsx
import { renderWithProviders, screen, userEvent, waitFor } from '../../test-utils';
import UserListPage from '../../../pages/private/admin/UserListPage';

describe('UserListPage', () => {
    test('renders user list', async () => {
        renderWithProviders(<UserListPage />, {
            authValue: {
                user: { id: 1, role: 'admin' },
                loading: false,
            },
        });

        await waitFor(() => {
            expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
        });
    });
});
```

---

## 12. Checklist & Timeline

### 12.1 Phase Checklist

#### Phase 1: Common Components (2-3 ngày)

- [ ] `src/__tests__/components/common/StatusTag.test.jsx`
- [ ] `src/__tests__/components/common/DifficultyTag.test.jsx`
- [ ] `src/__tests__/components/common/LessonTypeTag.test.jsx`
- [ ] `src/__tests__/components/common/EmptyState.test.jsx`
- [ ] `src/__tests__/components/common/PageHeader.test.jsx`
- [ ] `src/__tests__/components/common/ErrorBoundary.test.jsx`
- [ ] `src/__tests__/components/common/NotificationPopover.test.jsx`

#### Phase 2: Layout Components (1-2 ngày)

- [ ] `src/__tests__/components/layout/ProtectedRoute.test.jsx`
- [ ] `src/__tests__/components/layout/AppLayout.test.jsx`
- [ ] `src/__tests__/components/layout/AdminLayout.test.jsx`

#### Phase 3: Admin Form Modals (4-5 ngày)

- [ ] `src/__tests__/components/admin/UserFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/LessonFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/ModuleFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/DocumentFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/TagFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/QuizFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/QuestionFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/QuestionBankFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/LearningPathFormModal.test.jsx`
- [ ] `src/__tests__/components/admin/EnrollmentFormModal.test.jsx`

#### Phase 4: Public & Auth Pages (2-3 ngày)

- [ ] `src/__tests__/pages/public/LoginPage.test.jsx`
- [ ] `src/__tests__/pages/public/RegisterPage.test.jsx`
- [ ] `src/__tests__/pages/public/ForgotPasswordPage.test.jsx`
- [ ] `src/__tests__/pages/public/ResetPasswordPage.test.jsx`
- [ ] `src/__tests__/pages/public/NotFoundPage.test.jsx`
- [ ] `src/__tests__/pages/public/UnauthorizedPage.test.jsx`

#### Phase 5: Learner Pages (3-4 ngày)

- [ ] `src/__tests__/pages/private/learner/CourseCatalogPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/CourseDetailPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/CourseLearningPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/QuizTakingPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/QuizResultPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/MyCoursesPage.test.jsx`
- [ ] `src/__tests__/pages/private/learner/ProfilePage.test.jsx`

#### Phase 6: Admin Pages (5-7 ngày)

- [ ] `src/__tests__/pages/private/admin/DashboardPage.test.jsx`
- [ ] `src/__tests__/pages/private/admin/UserListPage.test.jsx`
- [ ] `src/__tests__/pages/private/admin/CourseListPage.test.jsx`
- [ ] `src/__tests__/pages/private/admin/CourseFormPage.test.jsx`
- [ ] `src/__tests__/pages/private/admin/QuizListPage.test.jsx`
- [ ] ... (các pages còn lại)

### 12.2 Timeline Summary

| Phase             | Duration       | Coverage Target | Priority   |
| ----------------- | -------------- | --------------- | ---------- |
| Setup & Utilities | 0.5 ngày       | -               | Cao        |
| Phase 1           | 2-3 ngày       | 20%             | Cao        |
| Phase 2           | 1-2 ngày       | 30%             | Cao        |
| Phase 3           | 4-5 ngày       | 45%             | Trung bình |
| Phase 4           | 2-3 ngày       | 55%             | Cao        |
| Phase 5           | 3-4 ngày       | 70%             | Trung bình |
| Phase 6           | 5-7 ngày       | 80%+            | Thấp       |
| **Total**         | **18-24 ngày** | **70-80%**      |            |

### 12.3 Coverage Goals

```bash
# Chạy coverage report
npm run test:coverage

# Target coverage
# Statements: 70%
# Branches: 60%
# Functions: 70%
# Lines: 70%
```

### 12.4 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    test:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'npm'

            - name: Install dependencies
              run: npm ci

            - name: Run tests
              run: npm run test:coverage

            - name: Upload coverage
              uses: codecov/codecov-action@v3
              with:
                  files: ./coverage/lcov.info
                  fail_ci_if_error: true
```

---

## Quick Start

```bash
# 1. Tạo cấu trúc thư mục tests
mkdir -p src/__tests__/components/common
mkdir -p src/__tests__/components/layout
mkdir -p src/__tests__/components/admin
mkdir -p src/__tests__/pages/public
mkdir -p src/__tests__/pages/private/admin
mkdir -p src/__tests__/pages/private/learner
mkdir -p src/__tests__/hooks
mkdir -p src/__tests__/mocks

# 2. Copy test-utils.jsx vào src/__tests__/

# 3. Tạo mock files
touch src/__tests__/mocks/data.js
touch src/__tests__/mocks/directus.js
touch src/__tests__/mocks/services.js

# 4. Bắt đầu với Phase 1 - Common Components
touch src/__tests__/components/common/StatusTag.test.jsx

# 5. Chạy test
npm test

# 6. Xem coverage
npm run test:coverage
```

---

**Tài liệu được tạo bởi:** AI Assistant  
**Ngày tạo:** 2026-01-15  
**Version:** 2.0 - Centralized Test Structure
