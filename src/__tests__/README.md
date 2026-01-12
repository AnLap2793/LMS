# Test Structure

This directory contains test setup and configuration for the application.

## Directory Structure

```
__tests__/
├── setup.js       # Test setup file (configured in vitest.config.js)
└── README.md      # This file
```

## Writing Tests

- Use Vitest as the test runner
- Use React Testing Library for component tests
- Follow the naming convention: `*.test.js` or `*.test.jsx`
- **Recommended**: Place test files next to the source files they test (co-located)
  - Example: `src/components/Button.jsx` → `src/components/Button.test.jsx`
- **Alternative**: Create test files in `__tests__/` directory if preferred

## Example Test File

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

