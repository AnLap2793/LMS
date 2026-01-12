# Template ReactJS + Directus

Template mẫu để triển khai cho nhiều dự án khác nhau với React, Vite, Ant Design và Directus.

## 🚀 Tech Stack

- React 19
- Vite 7
- Ant Design 6
- Directus SDK 20
- React Query (TanStack Query) 5
- React Router v7

## 📋 Yêu cầu

- Node.js >= 18
- npm hoặc yarn
- Directus instance (local hoặc remote)

## 🛠️ Cài đặt

```bash
# Clone repo
git clone <your-repo-url>
cd Template-ReactJS

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Chỉnh sửa .env với thông tin Directus của bạn
# VITE_DIRECTUS_URL=https://your-directus-instance.com

# Start development server
npm run dev
```

## 🔧 Environment Variables

Tạo file `.env` trong thư mục gốc với các biến sau:

```env
VITE_DIRECTUS_URL=https://your-directus-instance.com
VITE_APP_ENV=development
```

## 📁 Cấu trúc dự án

```
src/
├── components/          # Reusable components
│   ├── common/         # Common components
│   │   ├── ExampleForm.jsx   # ⚠️ EXAMPLE - Form với validation
│   │   └── ExampleTable.jsx  # ⚠️ EXAMPLE - Table với pagination
│   ├── layout/         # Layout components (Header, Footer, Sidebar...)
│   └── ErrorBoundary.jsx  # Error boundary component
├── pages/              # Page components
│   ├── private/        # Protected pages
│   └── public/         # Public pages
│       └── HomePage.jsx    # ⚠️ EXAMPLE - Simple placeholder page
├── services/           # API services và Directus client
│   ├── directus.js     # Directus SDK initialization
│   └── userService.js  # ⚠️ EXAMPLE - Service layer pattern
├── hooks/              # Custom React hooks
│   └── useUsers.js     # ⚠️ EXAMPLE - React Query hooks pattern
├── utils/              # Helper functions
│   └── errorHandler.js # ✅ Core - Error handling utilities
├── constants/          # Application constants
│   ├── queryKeys.js    # ✅ Core - Centralized TanStack Query keys
│   ├── api.js          # ✅ Core - API configuration
│   ├── app.js          # ✅ Core - App constants
│   └── collections.js  # ✅ Core - Directus collections (add your own)
├── validation/         # Validation rules và sanitization
│   ├── formRules.js    # ✅ Core - Ant Design form validation rules
│   └── sanitize.js     # ✅ Core - HTML sanitization utilities
├── config/             # Configuration files
│   ├── queryClient.js  # ✅ Core - TanStack Query client với global error handling
│   └── theme.js        # ✅ Core - Ant Design theme configuration
├── context/            # React Context
│   └── AuthContext.jsx # ✅ Core - Authentication context
├── routes/             # Route definitions
├── __tests__/          # Test setup và configuration
│   ├── setup.js        # ✅ Core - Vitest setup file
│   └── README.md       # Testing guidelines
├── assets/             # Images, fonts, static files
└── styles/             # Global styles, theme overrides
```

**Legend:**
- ✅ **Core** - Infrastructure, giữ nguyên hoặc customize cẩn thận
- ⚠️ **EXAMPLE** - Tham khảo để tạo code của riêng bạn, không sửa trực tiếp

## 🧪 Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚢 Deployment

```bash
# Build for production
npm run build

# Build with production environment
npm run build:prod

# Preview production build
npm run preview
```

### 🐳 Docker Deployment

#### Option 1: Docker Compose (Recommended cho local testing)

```bash
# Chạy với docker-compose (tự động build và run)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng và xóa containers
docker-compose down
```

**Lưu ý**: `docker-compose.yml` chỉ dùng cho **local development/testing**. Với Coolify, bạn không cần file này vì Coolify quản lý deployment tự động.

#### Option 2: Docker commands trực tiếp

```bash
# Build Docker image
docker build -t template-reactjs .

# Run container
docker run -p 8989:8989 template-reactjs

# Run với environment variables
docker run -p 8989:8989 \
  -e VITE_DIRECTUS_URL=https://your-directus-instance.com \
  template-reactjs
```

### 🔄 CI/CD với GitHub Actions và Coolify

Template đã được cấu hình sẵn với GitHub Actions để tự động build và push Docker image lên Docker Hub. Coolify sẽ tự động detect và deploy image mới.

#### Bước 1: Tạo Docker Hub Access Token

1. Đăng nhập vào [Docker Hub](https://hub.docker.com/)
2. Click vào **Account Settings** (icon profile ở góc trên bên phải)
3. Vào **Security** → **New Access Token**
4. Đặt tên cho token (ví dụ: `github-actions-template-reactjs`)
5. Chọn quyền **Read & Write** (hoặc **Read, Write & Delete** nếu cần)
6. Click **Generate**
7. **QUAN TRỌNG**: Copy token ngay lập tức và lưu ở nơi an toàn (bạn sẽ không thể xem lại token sau khi đóng cửa sổ)

#### Bước 2: Cấu hình GitHub Secrets

1. Vào GitHub repository của bạn
2. Click **Settings** (tab ở trên cùng)
3. Trong menu bên trái, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

   **Secret 1: DOCKERHUB_USERNAME**
   - **Name**: `DOCKERHUB_USERNAME`
   - **Secret**: Nhập tên đăng nhập Docker Hub của bạn (ví dụ: `yourusername`)
   - Click **Add secret**

   **Secret 2: DOCKERHUB_TOKEN**
   - **Name**: `DOCKERHUB_TOKEN`
   - **Secret**: Paste Docker Hub access token đã tạo ở Bước 1
   - Click **Add secret**

5. Verify: Bạn sẽ thấy 2 secrets trong danh sách (không thể xem giá trị, chỉ thấy tên)

#### Bước 3: Kiểm tra Workflow File

Workflow file đã được tạo sẵn tại `.github/workflows/docker-build-push.yml`. File này sẽ:

- **Trigger**: Tự động chạy khi có push/merge vào `main` branch
- **Build**: Sử dụng Docker Buildx với cache để tối ưu tốc độ build
- **Tag**: Tạo các tags sau:
  - `latest` - Tag mới nhất cho main branch
  - `main-<commit-sha>` - Tag với commit SHA cụ thể
- **Push**: Tự động push lên Docker Hub với format: `your-username/template-reactjs:<tag>`

#### Bước 4: Test Workflow

1. Commit và push code lên `main` branch:
   ```bash
   git add .
   git commit -m "Setup CI/CD workflow"
   git push origin main
   ```

2. Kiểm tra workflow đang chạy:
   - Vào GitHub repository
   - Click tab **Actions** (ở trên cùng)
   - Bạn sẽ thấy workflow "Build and Push Docker Image" đang chạy
   - Click vào workflow run để xem chi tiết từng step

3. Xem logs nếu có lỗi:
   - Click vào từng step để xem logs chi tiết
   - Các lỗi thường gặp:
     - **Authentication failed**: Kiểm tra lại `DOCKERHUB_USERNAME` và `DOCKERHUB_TOKEN`
     - **Build failed**: Kiểm tra Dockerfile và code có lỗi không
     - **Push failed**: Kiểm tra quyền của Docker Hub token

4. Verify image đã được push:
   - Vào [Docker Hub](https://hub.docker.com/)
   - Tìm repository `your-username/template-reactjs`
   - Bạn sẽ thấy image với tag `latest` và các tags khác

#### Bước 5: Cấu hình Coolify

1. **Tạo Application mới trong Coolify**:
   - Đăng nhập vào Coolify dashboard
   - Click **New Resource** → **Application**
   - Chọn **Docker Image** làm source

2. **Cấu hình Application**:
   - **Name**: `template-reactjs` (hoặc tên bạn muốn)
   - **Docker Image**: `your-dockerhub-username/template-reactjs:latest`
   - **Port**: `8989`
   - **Restart Policy**: `unless-stopped` hoặc `always`

3. **Environment Variables** (quan trọng):
   ```
   VITE_DIRECTUS_URL=https://your-directus-instance.com
   VITE_APP_ENV=production
   ```
   **Lưu ý**: Vite embed environment variables vào build tại build time, nhưng bạn vẫn cần set trong Coolify để ứng dụng có thể truy cập runtime config nếu cần.

4. **Deploy**:
   - Click **Deploy** hoặc **Save**
   - Coolify sẽ tự động pull image và deploy
   - Sau khi deploy xong, bạn có thể truy cập ứng dụng qua URL được cung cấp

5. **Auto-deploy khi có image mới**:
   - Coolify có thể tự động detect khi có image mới với tag `latest`
   - Hoặc bạn có thể cấu hình webhook trong Coolify để trigger deploy khi GitHub Actions push image mới

#### Workflow hoạt động chi tiết

Khi bạn push code lên `main` branch, workflow sẽ thực hiện các bước sau:

1. **Checkout code**: Clone repository về runner
2. **Set up Docker Buildx**: Setup Docker Buildx với các tính năng nâng cao
3. **Log in to Docker Hub**: Đăng nhập vào Docker Hub sử dụng secrets
4. **Extract metadata**: Tạo tags và labels cho image
5. **Build and push**: 
   - Build Docker image với cache từ registry (tăng tốc độ)
   - Tag image với các tags đã tạo
   - Push image lên Docker Hub
   - Lưu cache để build lần sau nhanh hơn

#### Troubleshooting

**Lỗi: "Error: Cannot perform an interactive login from a non TTY device"**
- Nguyên nhân: Docker Hub credentials không đúng
- Giải pháp: Kiểm tra lại `DOCKERHUB_USERNAME` và `DOCKERHUB_TOKEN` trong GitHub Secrets

**Lỗi: "denied: requested access to the resource is denied"**
- Nguyên nhân: Token không có quyền push hoặc username không đúng
- Giải pháp: Tạo lại token với quyền **Read & Write**, kiểm tra lại username

**Lỗi: "Build failed"**
- Nguyên nhân: Lỗi trong Dockerfile hoặc code
- Giải pháp: Xem logs chi tiết trong GitHub Actions để tìm lỗi cụ thể

**Image không xuất hiện trên Docker Hub**
- Kiểm tra workflow đã chạy thành công chưa (green checkmark)
- Kiểm tra logs của step "Build and push Docker image"
- Verify image name format: `username/template-reactjs:tag`

**Coolify không pull image mới**
- Kiểm tra Coolify có cấu hình đúng image name không
- Thử manual pull trong Coolify
- Kiểm tra Coolify logs để xem lỗi

#### Lưu ý quan trọng

- **Environment Variables**: Vite embed env vars vào build tại build time. Nếu bạn cần thay đổi env vars, bạn cần rebuild image (push code mới lên GitHub)
- **Build Cache**: Workflow sử dụng Docker registry cache để tăng tốc độ build. Lần build đầu tiên sẽ lâu hơn các lần sau
- **Image Tags**: Mỗi commit sẽ tạo một tag mới với format `main-<commit-sha>`, giúp bạn có thể rollback về version cũ nếu cần
- **Security**: Không bao giờ commit Docker Hub token vào code. Luôn sử dụng GitHub Secrets
- **Workflow File**: File workflow tại `.github/workflows/docker-build-push.yml` có thể được customize nếu cần thay đổi behavior

## 📚 Documentation

### 🎯 Getting Started & Customization Guide

**Mới bắt đầu?** Xem **[`TEMPLATE_GUIDE.md`](documentation/TEMPLATE_GUIDE.md)** - Hướng dẫn chi tiết cách customize từng phần của template:
- Collections
- Service Layer
- Query Keys
- React Query Hooks
- Components (Form, Table examples)
- Pages
- Routes
- Theme
- Authentication
- Validation
- Testing (với example test files)

### Best Practices & Improvements

Template đã được tối ưu với các best practices:
- Centralized error handling với global handlers
- Centralized query keys cho TanStack Query
- Service layer pattern không có side effects
- Validation schemas tái sử dụng
- Code splitting với lazy loading

### Rules & Guidelines

Xem thêm các quy tắc và best practices trong thư mục `.agent/rules/`:

- `structure-project.md` - Cấu trúc dự án
- `state-management.md` - Quản lý state
- `error-handling.md` - Xử lý lỗi
- `security-practice.md` - Bảo mật
- `directus-intergration.md` - Tích hợp Directus
- `design-system.md` - Design system với Ant Design
- `code-quality-rule.md` - Quy tắc code quality
- `document-standaed.md` - Tiêu chuẩn documentation
- `tesing.md` - Testing strategy
- `deployment-checklist.md` - Checklist deployment

## 🎨 Theme

Template sử dụng màu chủ đạo **#ea4544** (đỏ) với Ant Design. Theme được cấu hình trong `src/config/theme.js`.

## 🔐 Authentication

Template đã tích hợp sẵn:
- Directus Authentication với auto-refresh token
- AuthContext để quản lý user state
- ProtectedRoute component cho các trang cần authentication
- Permission checking có thể được implement khi cần

## 📝 Code Quality

- ESLint configured với React hooks rules
- Prettier configured cho code formatting (`npm run format`)
- Code splitting với lazy loading
- Error Boundary để catch errors
- **Centralized error handling** - Global error handlers trong QueryClient
- **Centralized query keys** - Quản lý TanStack Query keys tập trung trong `constants/queryKeys.js`
- **Error handling utilities** - Các hàm xử lý lỗi trong `utils/errorHandler.js`
- **Validation schemas** - Reusable validation schemas cho Ant Design forms
- **Example components** - Form và Table examples với best practices

## 👥 Contributors

- Your Name - [@yourhandle](https://github.com/yourhandle)

## 📄 License

MIT
