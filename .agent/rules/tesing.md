---
trigger: always_on
---

## 8. Testing Strategy

### Testing Structure

**Tập trung tất cả tests trong thư mục `src/__tests__/`** - giữ source code sạch sẽ:

```
src/__tests__/
├── setup.js                    # Test setup file (configured in vitest.config.js)
├── test-utils.jsx              # Custom render utilities với providers
├── mocks/                      # Shared mocks
│   ├── data.js                 # Mock data (users, courses, etc.)
│   ├── directus.js             # Mock Directus client
│   └── services.js             # Mock services
├── components/                 # Component tests (mirror src/components structure)
│   ├── common/
│   │   ├── StatusTag.test.jsx
│   │   ├── DifficultyTag.test.jsx
│   │   └── EmptyState.test.jsx
│   ├── layout/
│   │   ├── ProtectedRoute.test.jsx
│   │   ├── AppLayout.test.jsx
│   │   └── AdminLayout.test.jsx
│   └── admin/
│       ├── UserFormModal.test.jsx
│       └── LessonFormModal.test.jsx
├── pages/                      # Page tests (mirror src/pages structure)
│   ├── public/
│   │   ├── LoginPage.test.jsx
│   │   └── NotFoundPage.test.jsx
│   └── private/
│       ├── admin/
│       │   ├── DashboardPage.test.jsx
│       │   └── UserListPage.test.jsx
│       └── learner/
│           ├── CourseCatalogPage.test.jsx
│           └── QuizTakingPage.test.jsx
└── hooks/                      # Hook tests
    ├── useUsers.test.js
    └── useCourses.test.js
```

**Lợi ích của cấu trúc tập trung:**

- ✅ Source code sạch - thư mục components/pages chỉ chứa production code
- ✅ Dễ quản lý - tất cả tests ở một nơi
- ✅ Mirror structure - cấu trúc **tests** phản ánh cấu trúc src
- ✅ Dễ exclude khi build

### Testing Libraries Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/coverage-v8
```

### Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/__tests__/setup.js',
    },
});
```

### Import Paths trong Tests

```javascript
// Từ file: src/__tests__/components/common/StatusTag.test.jsx

// Import component cần test (đi lên 3 cấp từ __tests__)
import StatusTag from '../../../components/common/StatusTag';

// Import test utilities (cùng thư mục __tests__)
import { renderWithProviders } from '../../test-utils';

// Import mocks
import { mockUsers } from '../../mocks/data';
```

### Unit Test Example

```javascript
// src/__tests__/components/common/UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import UserCard from '../../../components/common/UserCard';

describe('UserCard', () => {
    const mockUser = {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'admin',
    };

    test('renders user information correctly', () => {
        render(<UserCard {...mockUser} />);

        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    test('calls onEdit when button is clicked', () => {
        const handleEdit = vi.fn();
        render(<UserCard {...mockUser} onEdit={handleEdit} />);

        const editButton = screen.getByText('Chỉnh sửa');
        fireEvent.click(editButton);

        expect(handleEdit).toHaveBeenCalledTimes(1);
    });
});
```

### Testing Hooks

```javascript
// src/__tests__/hooks/useUsers.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect } from 'vitest';
import { useUsers } from '../../hooks/useUsers';

describe('useUsers hook', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    test('fetches users successfully', async () => {
        const { result } = renderHook(() => useUsers(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
    });
});
```

### Test Utilities (Custom Render)

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

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });

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

### Coverage Goals

- **Unit tests**: 70%+ coverage cho business logic
- **Integration tests**: Critical user flows
- **E2E tests**: Main user journeys
- **Run tests**: `npm test` hoặc `npm run test:coverage`

### Quick Start Commands

```bash
# Tạo cấu trúc thư mục tests
mkdir -p src/__tests__/components/common
mkdir -p src/__tests__/components/layout
mkdir -p src/__tests__/components/admin
mkdir -p src/__tests__/pages/public
mkdir -p src/__tests__/pages/private/admin
mkdir -p src/__tests__/pages/private/learner
mkdir -p src/__tests__/hooks
mkdir -p src/__tests__/mocks

# Chạy tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy một file test cụ thể
npx vitest run src/__tests__/components/common/StatusTag.test.jsx
```

---
