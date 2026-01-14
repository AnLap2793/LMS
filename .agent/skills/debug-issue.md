# Skill: Debug Issue

## Description

Phat hien va sua loi trong du an LMS, bao gom runtime errors, logic bugs, va performance issues.

## Usage

```
/debug [--error <error_message>] [--file <filePath>] [--type runtime|logic|performance]
```

## Parameters

- `--error`: Error message can debug
- `--file`: File can kiem tra
- `--type`: Loai loi (`runtime`, `logic`, `performance`)

## Debug Process

### Step 1: Thu thap thong tin

1. **Error message** day du
2. **Stack trace** (neu co)
3. **Buoc tai hien** loi
4. **Environment** (dev/prod, browser)
5. **Recent changes** lien quan

### Step 2: Phan loai loi

| Type          | Mo ta                    | Uu tien  |
| ------------- | ------------------------ | -------- |
| Runtime Error | App crash, exceptions    | Critical |
| API Error     | Network, Directus errors | High     |
| Logic Error   | Wrong behavior           | High     |
| UI Error      | Display issues           | Medium   |
| Performance   | Slow, lag                | Medium   |

### Step 3: Debug theo loai

---

## Common Errors & Solutions

### 1. React Query Errors

#### Error: "No QueryClient set"

```javascript
// Cause: Component render truoc khi wrap trong QueryClientProvider

// Solution: Check App.jsx
function App() {
    return <QueryClientProvider client={queryClient}>{/* App content */}</QueryClientProvider>;
}
```

#### Error: "Cannot read properties of undefined"

```javascript
// Cause: Data chua load xong

// Solution: Check loading state
function Component() {
    const { data, isLoading } = useQuery(...);

    if (isLoading) return <Spin />;
    if (!data) return null;

    return <div>{data.title}</div>;
}
```

### 2. Directus API Errors

#### Error: "401 Unauthorized"

```javascript
// Cause: Token het han hoac chua login

// Solution:
// 1. Check token trong localStorage
// 2. Verify directus client config
// 3. Re-login user

// Check trong AuthContext
const checkAuth = async () => {
    try {
        const userData = await directus.request(readMe());
        setUser(userData);
    } catch (error) {
        // Token invalid, redirect to login
        setUser(null);
        navigate('/login');
    }
};
```

#### Error: "403 Forbidden"

```javascript
// Cause: User khong co quyen

// Solution:
// 1. Check Directus permissions
// 2. Check user role
// 3. Update permissions trong Directus Admin

// Frontend: Check role truoc khi render
if (user.role !== 'admin') {
    return <Navigate to="/403" />;
}
```

#### Error: "404 Not Found"

```javascript
// Cause: Collection khong ton tai hoac wrong ID

// Solution:
// 1. Verify collection name trong COLLECTIONS constant
// 2. Check ID co dung format khong
// 3. Verify item ton tai trong database
```

### 3. React Errors

#### Error: "Too many re-renders"

```javascript
// Cause: State update trong render

// BAD
function Component() {
    const [count, setCount] = useState(0);
    setCount(count + 1); // Infinite loop!
    return <div>{count}</div>;
}

// GOOD
function Component() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(count + 1);
    }, []); // Run once

    return <div>{count}</div>;
}
```

#### Error: "Objects are not valid as React child"

```javascript
// Cause: Render object truc tiep

// BAD
<div>{user}</div>

// GOOD
<div>{user.name}</div>
// or
<div>{JSON.stringify(user)}</div>
```

#### Error: "Each child should have unique key"

```javascript
// Cause: Missing or duplicate keys

// BAD
{
    items.map(item => <Item {...item} />);
}
{
    items.map((item, index) => <Item key={index} {...item} />);
} // Index as key

// GOOD
{
    items.map(item => <Item key={item.id} {...item} />);
}
```

### 4. Ant Design Errors

#### Form validation not working

```javascript
// Cause: Missing form instance

// BAD
<Form>
    <Form.Item name="email" rules={[{ required: true }]}>
        <Input />
    </Form.Item>
</Form>;

// GOOD
const [form] = Form.useForm();

<Form form={form}>
    <Form.Item name="email" rules={[{ required: true }]}>
        <Input />
    </Form.Item>
</Form>;
```

#### Modal not closing

```javascript
// Cause: State khong update

// Check onCancel prop
<Modal
    open={visible}
    onCancel={() => setVisible(false)} // Must call setVisible
>
```

### 5. Performance Issues

#### Slow rendering

```javascript
// Solution 1: Memoize expensive calculations
const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Solution 2: Memoize callbacks
const handleClick = useCallback(() => {
    doSomething(id);
}, [id]);

// Solution 3: Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

#### Too many API calls

```javascript
// Solution: Check React Query config
useQuery({
    queryKey: queryKeys.items.list(params),
    queryFn: () => fetchItems(params),
    staleTime: CACHE_TIME.STALE_TIME, // Don't refetch immediately
    refetchOnWindowFocus: false, // Don't refetch on focus
});
```

---

## Debug Tools

### 1. React DevTools

- Component tree
- Props & state inspection
- Profiler for performance

### 2. React Query DevTools

```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>;
```

### 3. Console logging

```javascript
// Strategic logging
console.log('Component render:', { props, state });
console.log('API response:', data);
console.error('Error:', error);

// Remember to remove before production!
```

### 4. Network tab

- Check API requests/responses
- Verify headers, status codes
- Check request payload

---

## Debug Report Template

```markdown
## Debug Report

### Issue

[Mô tả vấn đề]

### Error Message
```

[Error message và stack trace]

````

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Root Cause
[Nguyên nhân gốc]

### Solution
[Cách sửa]

### Code Changes
```javascript
// Before
...

// After
...
````

### Verification

- [ ] Error không còn xuất hiện
- [ ] Các chức năng liên quan hoạt động bình thường
- [ ] Tests pass

```

## Related Files
- `src/config/queryClient.js` - Global error handler
- `src/utils/errorHandler.js` - Error utilities
- `src/context/AuthContext.jsx` - Auth state
```
