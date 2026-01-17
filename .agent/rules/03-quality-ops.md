---
trigger: always_on
---

# 🛡️ QUALITY, SECURITY & OPS

## 1. Code Quality & Linting

- **ESLint/Prettier:** Chạy `npm run lint` trước khi commit.
- **Functional Components:** 100% Functional Components + Hooks. Không dùng Class Component (trừ ErrorBoundary).
- **Prop Types:** Bắt buộc khai báo `PropTypes` cho mọi component nhận props.
- **Clean Code:** File không quá 300 dòng. Tách nhỏ component nếu phức tạp.

## 2. Security Best Practices

- **Input Sanitization:** Dùng `DOMPurify` khi render HTML từ Directus (Rich Text).
- **Auth Guard:** Mọi route private phải bọc trong `<ProtectedRoute />`.
- **Directus:** Luôn kiểm tra quyền (Permissions) trước khi render nút bấm nhạy cảm (Xóa/Sửa).

## 3. Error Handling

- **Nguyên tắc:** "Fail loudly in Service, Handle gracefully in UI".
- **Global Handler:** Sử dụng `src/utils/errorHandler.js` được tích hợp trong QueryClient.
- **Boundary:** Bọc toàn bộ App bằng `<ErrorBoundary />` để bắt lỗi crash runtime.

## 4. Testing Strategy (Vitest + Testing Library)

### Directory Structure

Tất cả tests tập trung trong `src/__tests__/`:

```
src/__tests__/
├── setup.js                    # Vitest setup
├── test-utils.jsx              # Custom render với Providers
├── mocks/                      # Shared mocks (data.js, directus.js)
├── components/                 # Mirror src/components
├── pages/                      # Mirror src/pages
└── hooks/                      # Mirror src/hooks
```

### Test Utils Pattern

Sử dụng `renderWithProviders` để bọc component trong AuthContext, QueryClient, Theme:

```javascript
// src/__tests__/test-utils.jsx
export function renderWithProviders(ui, { authValue, ...options } = {}) {
    return render(
        <QueryClientProvider client={testClient}>
            <ConfigProvider theme={theme}>
                <AuthContext.Provider value={authValue}>
                    <MemoryRouter>{ui}</MemoryRouter>
                </AuthContext.Provider>
            </ConfigProvider>
        </QueryClientProvider>
    );
}
```

### Coverage Goals

- **Unit tests:** 70%+ coverage cho business logic.
- **Run:** `npm run test:coverage`.

## 5. Documentation Standards

- **JSDoc:** Dùng cho utility functions phức tạp.
    ```javascript
    /**
     * Format currency to VND
     * @param {number} value - Amount
     * @returns {string} Formatted string
     */
    ```
- **README:** Mỗi module lớn nên có README giải thích business logic.

## 6. Best Practices Checklist

- [ ] **Performance:** Lazy load routes, Debounce search, Virtualize long lists.
- [ ] **UX:** Loading states, Disable button khi submit, Error feedback rõ ràng.
- [ ] **Code:** No console.log, Meaningful variable names, Tách logic ra khỏi UI.

## 7. Deployment Checklist

- [ ] Remove `console.log`.
- [ ] Verify `VITE_DIRECTUS_URL` môi trường Production.
- [ ] Build command: `npm run build:prod`.
