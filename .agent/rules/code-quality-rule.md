---
trigger: always_on
---

## 5. Code Quality Rules

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Component Guidelines
✅ **DO's:**
- Functional components với hooks
- Props destructuring trong parameter
- PropTypes hoặc TypeScript cho type checking
- Mỗi component một file
- Export default cho main component
- Sử dụng constants thay vì hardcode values
- Tập trung constants trong `src/constants/`

❌ **DON'Ts:**
- Class components (trừ Error Boundaries)
- Inline styles phức tạp
- Logic phức tạp trong JSX
- Quá nhiều props (> 5-7 props)
- Hardcode collection names, magic numbers, hoặc config values

```javascript
import PropTypes from 'prop-types';
import { Card, Avatar } from 'antd';

// ✅ Good: Clean, typed, focused component
function UserCard({ name, email, avatar, role, onEdit }) {
  return (
    <Card
      hoverable
      actions={[
        <Button onClick={onEdit}>Chỉnh sửa</Button>
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={avatar} />}
        title={name}
        description={
          <>
            <div>{email}</div>
            <Tag color="blue">{role}</Tag>
          </>
        }
      />
    </Card>
  );
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  role: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
};

UserCard.defaultProps = {
  avatar: '/default-avatar.png',
  onEdit: () => {},
};

export default UserCard;
```

### Performance Optimization
```javascript
import { memo, useMemo, useCallback } from 'react';

// ✅ Memo cho component render nhiều lần
const ExpensiveComponent = memo(({ data }) => {
  // Component logic
  return <div>{/* Render */}</div>;
});

// ✅ useMemo cho computed values
function UserList({ users }) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  return <Table dataSource={sortedUsers} />;
}

// ✅ useCallback cho callback functions
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Dependencies empty vì dùng functional update

  return <ChildComponent onClick={handleClick} />;
}
```

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// ✅ Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

---