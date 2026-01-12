---
trigger: always_on
---

## 11. Quick Reference Commands

### Project Setup
```bash
# Tạo project mới
npx create-react-app my-app
cd my-app

# Cài đặt dependencies
npm install antd @directus/sdk @tanstack/react-query react-router-dom

# Cài đặt dev dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Start development
npm start
```

### Common Tasks
```bash
# Development
npm start                    # Start dev server
npm test                     # Run tests
npm run test:coverage        # Test với coverage

# Build
npm run build               # Production build
npm run build:prod          # Build với env production

# Code Quality
npm run lint                # Run ESLint
npm run format              # Format với Prettier

# Analysis
npm run analyze             # Analyze bundle size
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/user-management
git add .
git commit -m "feat: add user CRUD functionality"
git push origin feature/user-management

# Commit conventions
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

---

## 12. Best Practices Checklist

### Code Organization
- [ ] ✅ Components có single responsibility
- [ ] ✅ Tách business logic ra khỏi UI components
- [ ] ✅ Sử dụng custom hooks cho reusable logic
- [ ] ✅ Props drilling không quá 2-3 levels
- [ ] ✅ File size không quá 300 lines

### Performance
- [ ] ✅ Lazy load routes và heavy components
- [ ] ✅ Optimize re-renders với memo, useMemo, useCallback
- [ ] ✅ Virtualize long lists (react-window)
- [ ] ✅ Debounce search và input events
- [ ] ✅ Optimize images (WebP, lazy loading)

### User Experience
- [ ] ✅ Loading states cho async operations
- [ ] ✅ Error messages rõ ràng, hữu ích
- [ ] ✅ Success feedback sau actions
- [ ] ✅ Disable buttons khi processing
- [ ] ✅ Form validation real-time
- [ ] ✅ Responsive trên mobile
- [ ] ✅ Keyboard navigation support

### Code Quality
- [ ] ✅ No console.logs trong production
- [ ] ✅ PropTypes hoặc TypeScript
- [ ] ✅ Consistent naming conventions
- [ ] ✅ Meaningful variable names
- [ ] ✅ Comments cho complex logic
- [ ] ✅ Unit tests cho critical functions

---

## 📚 Resources & Documentation

### Official Docs
- [React Documentation](https://react.dev)
- [Ant Design Documentation](https://ant.design)
- [Directus Documentation](https://docs.directus.io)
- [TanStack Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com)

### Ant Design Resources
- [Ant Design Charts](https://charts.ant.design)
- [Ant Design Pro](https://pro.ant.design) - Enterprise UI solution
- [Ant Design Mobile](https://mobile.ant.design) - Mobile components
- [Ant Design Icons](https://ant.design/components/icon)

### Learning Resources
- [React Patterns](https://reactpatterns.com)
- [JavaScript.info](https://javascript.info)
- [Web.dev](https://web.dev) - Performance & best practices

### Tools & Extensions
- VS Code Extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Import
  - GitLens

---

## 🎨 Color System với #ea4544

### Palette mở rộng
```javascript
const colors = {
  // Primary - Đỏ chủ đạo
  primary: '#ea4544',
  primaryHover: '#ff6b6a',
  primaryActive: '#d63938',
  primaryLight: '#fff1f0',
  
  // Semantic colors
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#ea4544',
  
  // Neutrals
  textPrimary: '#262626',
  textSecondary: '#595959',
  textDisabled: '#bfbfbf',
  border: '#d9d9d9',
  background: '#fafafa',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
  gradientDanger: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
};
```

### Usage trong Components
```javascript
// Styled component example
const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background: ${colors.gradientPrimary};
    border: none;
    
    &:hover {
      background: ${colors.primaryHover};
    }
  }
`;
```

---

**🔴 Lưu ý quan trọng**: 
- Luôn tham khảo documentation chính thức khi có thắc mắc
- Test kỹ trước khi deploy lên production
- Backup database trước khi thực hiện migration
- Monitor performance và errors sau deployment
- Keep dependencies updated thường xuyên

**Color Theme**: #ea4544 (Red Primary)