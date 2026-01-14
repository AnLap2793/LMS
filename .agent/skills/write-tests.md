# Skill: Write Unit Tests

## Description

Viet unit tests su dung Vitest va Testing Library theo chuan cua du an LMS.

## Usage

```
/write-tests <ComponentOrHookName> [--type component|hook|service|util]
```

## Parameters

- `ComponentOrHookName`: Ten component/hook/function can test - **bat buoc**
- `--type`: Loai test (`component`, `hook`, `service`, `util`)

## Instructions

### 1. Test Setup

```javascript
// src/__tests__/setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
```

### 2. Component Test Template

```javascript
// src/components/common/StatusTag.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatusTag from './StatusTag';

describe('StatusTag', () => {
    test('renders with draft status', () => {
        render(<StatusTag status="draft" />);

        expect(screen.getByText('Nhap')).toBeInTheDocument();
    });

    test('renders with published status', () => {
        render(<StatusTag status="published" />);

        expect(screen.getByText('Da xuat ban')).toBeInTheDocument();
    });

    test('renders with correct color for each status', () => {
        const { rerender } = render(<StatusTag status="draft" />);
        expect(screen.getByText('Nhap').closest('.ant-tag')).toHaveClass('ant-tag-default');

        rerender(<StatusTag status="published" />);
        expect(screen.getByText('Da xuat ban').closest('.ant-tag')).toHaveClass('ant-tag-success');
    });
});
```

### 3. Component with User Interaction

```javascript
// src/components/common/ActionButton.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import ActionButton from './ActionButton';

describe('ActionButton', () => {
    test('calls onClick when clicked', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<ActionButton onClick={handleClick}>Click me</ActionButton>);

        await user.click(screen.getByRole('button', { name: /click me/i }));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('is disabled when loading', () => {
        render(<ActionButton loading>Submit</ActionButton>);

        expect(screen.getByRole('button')).toBeDisabled();
    });

    test('shows loading spinner when loading', () => {
        render(<ActionButton loading>Submit</ActionButton>);

        expect(screen.getByRole('button')).toHaveClass('ant-btn-loading');
    });
});
```

### 4. Hook Test Template

```javascript
// src/hooks/useUsers.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useUsers, useCreateUser } from './useUsers';
import { userService } from '../services/userService';

// Mock service
vi.mock('../services/userService', () => ({
    userService: {
        getAll: vi.fn(),
        create: vi.fn(),
    },
}));

describe('useUsers', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    test('fetches users successfully', async () => {
        const mockUsers = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' },
        ];
        userService.getAll.mockResolvedValue(mockUsers);

        const { result } = renderHook(() => useUsers(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockUsers);
        expect(userService.getAll).toHaveBeenCalledTimes(1);
    });

    test('handles error', async () => {
        userService.getAll.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useUsers(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error.message).toBe('Network error');
    });
});

describe('useCreateUser', () => {
    // Similar setup...

    test('creates user and invalidates queries', async () => {
        const newUser = { id: 3, name: 'New User' };
        userService.create.mockResolvedValue(newUser);

        const { result } = renderHook(() => useCreateUser(), { wrapper });

        await result.current.mutateAsync({ name: 'New User' });

        expect(userService.create).toHaveBeenCalledWith({ name: 'New User' });
    });
});
```

### 5. Service Test Template

```javascript
// src/services/userService.test.js
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { userService } from './userService';
import { directus } from './directus';

// Mock directus
vi.mock('./directus', () => ({
    directus: {
        request: vi.fn(),
    },
}));

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        test('returns users from API', async () => {
            const mockUsers = [{ id: 1, name: 'User 1' }];
            directus.request.mockResolvedValue(mockUsers);

            const result = await userService.getAll();

            expect(result).toEqual(mockUsers);
            expect(directus.request).toHaveBeenCalledTimes(1);
        });

        test('passes params to API', async () => {
            const params = { filter: { status: { _eq: 'active' } } };
            directus.request.mockResolvedValue([]);

            await userService.getAll(params);

            expect(directus.request).toHaveBeenCalledWith(expect.objectContaining(params));
        });
    });

    describe('create', () => {
        test('creates user with data', async () => {
            const userData = { name: 'New User', email: 'new@example.com' };
            const createdUser = { id: 1, ...userData };
            directus.request.mockResolvedValue(createdUser);

            const result = await userService.create(userData);

            expect(result).toEqual(createdUser);
        });
    });
});
```

### 6. Utility Function Test

```javascript
// src/utils/formatters.test.js
import { describe, test, expect } from 'vitest';
import { formatCurrency, formatDate, truncateText } from './formatters';

describe('formatCurrency', () => {
    test('formats number to VND currency', () => {
        expect(formatCurrency(1000000)).toBe('1.000.000 VND');
    });

    test('handles zero', () => {
        expect(formatCurrency(0)).toBe('0 VND');
    });

    test('handles negative numbers', () => {
        expect(formatCurrency(-1000)).toBe('-1.000 VND');
    });
});

describe('truncateText', () => {
    test('truncates long text', () => {
        const text = 'This is a very long text that should be truncated';
        expect(truncateText(text, 20)).toBe('This is a very long...');
    });

    test('does not truncate short text', () => {
        const text = 'Short text';
        expect(truncateText(text, 20)).toBe('Short text');
    });
});
```

### 7. Testing Patterns

#### Testing Async Components

```javascript
test('shows loading state then data', async () => {
    render(<UserList />);

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument();
    });
});
```

#### Testing Forms

```javascript
test('submits form with correct values', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<UserForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });
});
```

### 8. Checklist sau khi viet test

- [ ] Test renders correctly
- [ ] Test user interactions
- [ ] Test loading/error states
- [ ] Test edge cases
- [ ] Mock external dependencies
- [ ] Clean up after each test
- [ ] Run `npm test` de verify

## Commands

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run src/components/common/StatusTag.test.jsx

# Run tests matching pattern
npx vitest run --testNamePattern="StatusTag"

# Run with coverage
npm run test:coverage
```

## Related Files

- `src/__tests__/setup.js` - Test setup
- `vitest.config.js` - Vitest configuration
