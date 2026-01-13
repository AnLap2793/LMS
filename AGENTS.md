# AGENTS.md - LMS Directus Project

## Build, Lint, and Test Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build            # Production build
npm run build:prod       # Production build with VITE_APP_ENV=production
npm run preview          # Preview production build

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Testing (Vitest)
npm test                 # Run all tests in watch mode
npm run test:coverage    # Run tests with coverage

# Run a single test file
npx vitest run src/path/to/file.test.jsx

# Run tests matching a pattern
npx vitest run --testNamePattern="pattern"
```

## Tech Stack

- React 19 + Vite 7
- Ant Design 6 (theme color: #ea4544)
- Directus SDK 20 (backend)
- TanStack Query 5 (server state)
- React Router 7
- Vitest + Testing Library

## Project Structure

```
src/
├── components/          # Reusable components (common/, layout/, admin/)
├── pages/               # Page components (public/, private/admin/, private/learner/)
├── services/            # API services (Directus SDK calls)
├── hooks/               # Custom React hooks (useUsers, useCourses, etc.)
├── constants/           # CRITICAL: Collections, queryKeys, API config, app constants
├── validation/          # Form validation rules (formRules.js, sanitize.js)
├── config/              # Theme, queryClient
├── context/             # React Context (AuthContext)
├── utils/               # Helpers (errorHandler.js)
├── mocks/               # Mock data
└── __tests__/           # Test setup
```

## Code Style

### Formatting (Prettier)

- Single quotes, semicolons, trailing commas (es5)
- Print width: 120, Tab width: 4 spaces
- Arrow parens: avoid, End of line: LF

### Naming Conventions

- **Components**: PascalCase - `UserCard.jsx`, `StatusTag.jsx`
- **Files**: camelCase - `userService.js`, `errorHandler.js`
- **Constants**: UPPER_SNAKE_CASE - `COLLECTIONS`, `CACHE_TIME`
- **Query Keys**: camelCase object - `queryKeys.users.list(params)`

### Imports Order

1. React/external libraries
2. Internal services/hooks
3. Constants
4. Components
5. Styles

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';
```

## Critical Patterns

### 1. Always Use Constants (NEVER hardcode)

```javascript
// src/constants/collections.js
import { COLLECTIONS } from '../constants/collections';
directus.request(readItems(COLLECTIONS.USERS, params)); // GOOD
directus.request(readItems('directus_users', params)); // BAD - hardcoded
```

### 2. Centralized Query Keys

```javascript
// src/constants/queryKeys.js
import { queryKeys } from '../constants/queryKeys';
queryKey: queryKeys.users.list(params); // GOOD
queryKey: ['users', params]; // BAD - hardcoded
```

### 3. Service Layer Pattern (no try-catch, no side effects)

```javascript
// Services just call Directus - errors propagate to global handler
export const userService = {
    getAll: async (params = {}) => {
        return await directus.request(readItems(COLLECTIONS.USERS, params));
    },
};
```

### 4. React Query Hooks Pattern

```javascript
export function useUsers(params = {}) {
    return useQuery({
        queryKey: queryKeys.users.list(params),
        queryFn: () => userService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            showSuccess('Created successfully!');
        },
        // Error handled globally in queryClient config
    });
}
```

### 5. Component Pattern

```javascript
import PropTypes from 'prop-types';
import { Tag } from 'antd';

function StatusTag({ status }) {
    return <Tag color={config.color}>{config.label}</Tag>;
}

StatusTag.propTypes = {
    status: PropTypes.oneOf(['draft', 'published', 'archived']).isRequired,
};

export default StatusTag;
```

### 6. Form Validation (use validation/formRules.js)

```javascript
import { emailRules, passwordRules } from '../validation/formRules';

<Form.Item name="email" rules={emailRules}>
    <Input />
</Form.Item>;
```

## Error Handling

- Global error handler in `src/config/queryClient.js` handles all query/mutation errors
- Use `showSuccess()` and `showError()` from `utils/errorHandler.js`
- Services should NOT have try-catch (let errors propagate)

## Directus SDK Authentication

```javascript
// Login/logout use directus methods directly
await directus.login({ email, password });
await directus.logout();

// Get current user
import { readMe } from '@directus/sdk';
const user = await directus.request(readMe());
```

## Environment Variables

```bash
VITE_DIRECTUS_URL=https://your-directus-instance.com
```

Access via: `import.meta.env.VITE_DIRECTUS_URL`

## ESLint Rules

- `no-unused-vars`: error (ignore UPPER_CASE vars)
- `no-console`: warn (allow console.warn, console.error)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

## Testing

- Co-locate tests with source files: `Component.jsx` -> `Component.test.jsx`
- Use Testing Library + Vitest
- Setup file: `src/__tests__/setup.js`

```javascript
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

test('renders user name', () => {
    render(<UserCard name="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

## Do's and Don'ts

- Use functional components with hooks (no class components except ErrorBoundary)
- Use PropTypes for type checking
- Use constants from `src/constants/` (never hardcode values)
- Use `queryKeys` from constants for React Query
- Use validation rules from `src/validation/formRules.js`
- Use Ant Design components with the red theme (#ea4544)
- Keep files under 300 lines
- Avoid props drilling > 2-3 levels
