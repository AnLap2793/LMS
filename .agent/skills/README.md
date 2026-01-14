# LMS Skills Directory

Bo skill cho du an LMS - React + Directus + Ant Design.

## Available Skills

| Skill                                     | Command             | Description                               |
| ----------------------------------------- | ------------------- | ----------------------------------------- |
| [Create Component](./create-component.md) | `/create-component` | Tao React component moi theo chuan du an  |
| [Create Service](./create-service.md)     | `/create-service`   | Tao Directus service layer                |
| [Create Hook](./create-hook.md)           | `/create-hook`      | Tao React Query hook                      |
| [Create Page](./create-page.md)           | `/create-page`      | Tao page component (admin/learner/public) |
| [Create Form](./create-form.md)           | `/create-form`      | Tao form modal voi Ant Design             |
| [Write Tests](./write-tests.md)           | `/write-tests`      | Viet unit tests voi Vitest                |
| [Code Review](./code-review.md)           | `/code-review`      | Review code theo chuan du an              |
| [Debug Issue](./debug-issue.md)           | `/debug`            | Phat hien va sua loi                      |

## Quick Start

### Tao feature moi (full stack)

1. **Tao collection** trong Directus Admin
2. **Them constant**: `src/constants/collections.js`
3. **Tao service**: `/create-service EntityService --collection entity_name`
4. **Them query keys**: `src/constants/queryKeys.js`
5. **Tao hook**: `/create-hook useEntities --service entityService`
6. **Tao form modal**: `/create-form EntityFormModal`
7. **Tao list page**: `/create-page EntityListPage --type admin`
8. **Them route**: `src/routes/index.jsx`
9. **Viet tests**: `/write-tests EntityListPage --type component`

### Workflow khi fix bugs

1. **Debug**: `/debug --error "Error message"`
2. **Review**: `/code-review --file path/to/file.jsx`
3. **Write tests**: `/write-tests ComponentName`

## Tech Stack Reference

- **React 19** + **Vite 7**
- **Ant Design 6** (Theme: #ea4544)
- **Directus SDK 20**
- **TanStack Query 5**
- **React Router 7**
- **Vitest** + Testing Library

## Project Conventions

### File Naming

- Components: `PascalCase.jsx`
- Services: `camelCaseService.js`
- Hooks: `useHookName.js`
- Constants: `camelCase.js`

### Import Order

1. React/external libraries
2. Internal services/hooks
3. Constants
4. Components
5. Styles

### Key Directories

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # React Query hooks
├── constants/      # IMPORTANT: All constants
├── validation/     # Form validation rules
└── utils/          # Helper functions
```

## Golden Rules

1. **NEVER hardcode** - Su dung constants
2. **No try-catch in services** - Global handler xu ly
3. **Query keys from constants** - `queryKeys.entity.list()`
4. **Validation from formRules** - `import { emailRules }`
5. **Theme color** - #ea4544
