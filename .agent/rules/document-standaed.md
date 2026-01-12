---
trigger: always_on
---

## 9. Documentation Standards

### Component Documentation
```javascript
/**
 * UserCard - Component hiển thị thông tin user dạng card
 * 
 * @component
 * @example
 * ```jsx
 * <UserCard
 *   name="Nguyễn Văn A"
 *   email="nguyenvana@example.com"
 *   role="admin"
 *   avatar="/avatar.jpg"
 *   onEdit={(user) => handleEdit(user)}
 * />
 * ```
 */
function UserCard({ name, email, role, avatar, onEdit }) {
  // Implementation
}

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - Họ tên
 * @property {string} email - Email
 * @property {string} role - Vai trò (admin, user, guest)
 */
```

### README.md Template
```markdown
# Tên Dự Án

Mô tả ngắn gọn về dự án.

## 🚀 Tech Stack

- React 18
- Ant Design 5
- Directus 10
- React Query
- React Router v6

## 📋 Yêu cầu

- Node.js >= 16
- npm hoặc yarn

## 🛠️ Cài đặt

\`\`\`bash
# Clone repo
git clone https://github.com/your-repo/project.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
\`\`\`

## 🔧 Environment Variables

\`\`\`
REACT_APP_DIRECTUS_URL=your-directus-url
REACT_APP_API_KEY=your-api-key
\`\`\`

## 📁 Cấu trúc dự án

\`\`\`
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # Custom hooks
├── utils/          # Helper functions
├── constants/      # Application constants
├── config/         # Configuration
└── context/        # React Context
\`\`\`

## 🧪 Testing

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## 🚢 Deployment

\`\`\`bash
npm run build
\`\`\`

## 👥 Contributors

- Your Name - [@yourhandle](https://github.com/yourhandle)
```

---