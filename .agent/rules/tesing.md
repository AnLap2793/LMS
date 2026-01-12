---
trigger: always_on
---

## 8. Testing Strategy

### Testing Structure

Tests được tổ chức trong thư mục `src/__tests__/`:

```
src/__tests__/
├── setup.js       # Test setup file (configured in vitest.config.js)
└── README.md      # Testing guidelines
```

**Khuyến nghị**: Co-locate tests với source files (best practice)
- `src/components/Button.jsx` → `src/components/Button.test.jsx`
- `src/hooks/useUsers.js` → `src/hooks/useUsers.test.js`

**Alternative**: Đặt tests trong `__tests__/` nếu muốn tách riêng

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

### Unit Test Example
```javascript
// UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';

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
    const handleEdit = jest.fn();
    render(<UserCard {...mockUser} onEdit={handleEdit} />);
    
    const editButton = screen.getByText('Chỉnh sửa');
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Hooks
```javascript
// useUsers.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';

describe('useUsers hook', () => {
  const queryClient = new QueryClient();
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  test('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Coverage Goals
- **Unit tests**: 70%+ coverage cho business logic
- **Integration tests**: Critical user flows
- **E2E tests**: Main user journeys
- **Run tests**: `npm test` hoặc `npm run test:coverage`

---