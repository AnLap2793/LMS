# Kế hoạch Triển khai Tiếp theo - LMS Project

**Ngày cập nhật:** 2026-01-15

---

## 📊 Tổng quan Hiện trạng

| Hạng mục | Trạng thái | Ghi chú |
|----------|-----------|---------|
| **Testing Infrastructure** | ❌ Chưa có | 0 test files, cần setup từ đầu |
| **Services (Mock → Directus)** | ⚠️ Một phần | Nhiều services đang dùng mock data |
| **Core Features** | ⚠️ Một phần | Course Management, Enrollment chưa hoàn thiện |
| **Advanced Features** | ❌ Chưa có | Learning Paths, Certificates, Engagement |

---

## 🎯 Ưu tiên Triển khai

### 🔴 Priority 1: Testing Infrastructure (CRITICAL)

**Mục tiêu:** Thiết lập testing framework và viết tests cho các components/hooks quan trọng

**Thời gian ước tính:** 2-3 tuần

#### Phase 1.1: Test Utilities Setup (2-3 ngày)

- [ ] Tạo `src/__tests__/test-utils.jsx` với renderWithProviders
- [ ] Tạo `src/__tests__/mocks/data.js` với factory functions
- [ ] Tạo `src/__tests__/mocks/services.js` với mock patterns
- [ ] Mở rộng `src/__tests__/setup.js` với global mocks

**Files cần tạo:**
```
src/__tests__/
├── test-utils.jsx          # Custom render với providers
├── mocks/
│   ├── data.js            # Mock data factories
│   └── services.js        # Service mocks
└── setup.js               # Mở rộng với global mocks
```

#### Phase 1.2: Hook Tests (1-2 tuần)

**Ưu tiên cao:**
- [ ] `usePermissions.test.js` - Logic hook, không phụ thuộc services
- [ ] `useUsers.test.js` - CRUD hooks với React Query
- [ ] `useCourses.test.js` - Course hooks với filters

**Ưu tiên trung bình:**
- [ ] `useModules.test.js`
- [ ] `useLessons.test.js`
- [ ] `useEnrollments.test.js`
- [ ] `useTags.test.js`
- [ ] `useDocuments.test.js`
- [ ] `useQuizzes.test.js`
- [ ] `useQuestionBank.test.js`

**Ưu tiên thấp:**
- [ ] `useQuizAttempts.test.js`
- [ ] `useLessonProgress.test.js`
- [ ] `useCertificates.test.js`
- [ ] `useComments.test.js`
- [ ] `useNotes.test.js`
- [ ] `useReviews.test.js`
- [ ] `useDashboard.test.js`
- [ ] `useSettings.test.js`

#### Phase 1.3: Component Tests (1 tuần)

**Common Components:**
- [ ] `StatusTag.test.jsx`
- [ ] `DifficultyTag.test.jsx`
- [ ] `LessonTypeTag.test.jsx`
- [ ] `EmptyState.test.jsx`
- [ ] `PageHeader.test.jsx`
- [ ] `ErrorBoundary.test.jsx`
- [ ] `NotificationPopover.test.jsx`

**Layout Components:**
- [ ] `ProtectedRoute.test.jsx`
- [ ] `AppLayout.test.jsx`
- [ ] `AdminLayout.test.jsx`

**Tài liệu tham khảo:** `docs/TEST_PLAN.md` và `docs/UI_TESTING_PLAN.md`

---

### 🟠 Priority 2: Chuyển Mock Services sang Directus (HIGH)

**Mục tiêu:** Kết nối các services đang dùng mock data với Directus backend

**Thời gian ước tính:** 2-3 tuần

#### Services cần cập nhật:

1. **Tags Service** ⚠️
   - [ ] Update `tagService.js` kết nối Directus
   - [ ] Test CRUD operations
   - [ ] Verify Many-to-Many với courses

2. **Courses Service** ⚠️
   - [ ] Update `courseService.js` kết nối Directus
   - [ ] Implement filters (status, difficulty, tags, department)
   - [ ] Implement search functionality
   - [ ] Test CRUD operations

3. **Modules Service** ❌
   - [ ] Tạo `moduleService.js` mới
   - [ ] Tạo `useModules.js` hook
   - [ ] Implement CRUD operations
   - [ ] Implement sort/drag-drop support

4. **Lessons Service** ❌
   - [ ] Tạo `lessonService.js` mới
   - [ ] Tạo `useLessons.js` hook
   - [ ] Implement CRUD operations
   - [ ] Support các lesson types (video, article, link, quiz)
   - [ ] Implement document attachment

5. **Enrollments Service** ⚠️
   - [ ] Update `enrollmentService.js` kết nối Directus
   - [ ] Implement assignment types (individual, department, auto)
   - [ ] Implement filters và search
   - [ ] Test enrollment flow

6. **Lesson Progress Service** ⚠️
   - [ ] Update `lessonProgressService.js` kết nối Directus
   - [ ] Implement progress tracking
   - [ ] Implement resume watching
   - [ ] Auto-calculate enrollment progress

7. **Quizzes Service** ⚠️
   - [ ] Update `quizService.js` kết nối Directus
   - [ ] Implement quiz CRUD
   - [ ] Implement question management
   - [ ] Test quiz operations

8. **Quiz Attempts Service** ⚠️
   - [ ] Update `quizAttemptService.js` kết nối Directus
   - [ ] Implement attempt tracking
   - [ ] Implement auto-grading
   - [ ] Test attempt flow

**Tài liệu tham khảo:** `docs/DEPLOYMENT_GUIDE.md` - Module 4, 6, 7

---

### 🟡 Priority 3: Hoàn thiện Core Features (MEDIUM)

**Thời gian ước tính:** 3-4 tuần

#### 3.1. Course Management (Module 4)

**Courses:**
- [ ] Hoàn thiện CourseListPage với filters (status, difficulty, tags)
- [ ] Hoàn thiện CourseFormPage với department filter
- [ ] Thêm drag & drop để sắp xếp courses
- [ ] Test CRUD operations

**Modules:**
- [ ] Hoàn thiện ModuleFormModal
- [ ] Thêm drag & drop để sắp xếp modules trong course
- [ ] Test module CRUD

**Lessons:**
- [ ] Hoàn thiện LessonFormModal với các loại:
  - Video (YouTube, Google Drive)
  - Article (Rich text editor)
  - Link (External link)
- [ ] Thêm document attachment cho lessons
- [ ] Thêm drag & drop để sắp xếp lessons
- [ ] Test lesson CRUD

**Course Content Management:**
- [ ] Hoàn thiện CourseContentPage với tree view
- [ ] Thêm preview lesson trong admin
- [ ] Thêm auto-calculate course duration

#### 3.2. Enrollment & Progress Tracking (Module 6)

- [ ] Hoàn thiện EnrollmentListPage với filters
- [ ] Hoàn thiện EnrollmentFormModal
- [ ] Thêm bulk assign courses cho users
- [ ] Implement auto-calculate progress percentage
- [ ] Thêm resume watching cho video lessons
- [ ] Track time spent cho lessons
- [ ] Thêm deadline reminder logic
- [ ] Test enrollment flow

#### 3.3. Quiz & Question Bank (Module 7)

**Question Bank:**
- [ ] Review và test question bank CRUD
- [ ] Hoàn thiện QuestionBankPage với filters
- [ ] Thêm support các loại câu hỏi (single, multiple, text)
- [ ] Thêm explanation và difficulty

**Quizzes:**
- [ ] Hoàn thiện QuizListPage
- [ ] Hoàn thiện QuizFormModal với config (time limit, pass score, etc.)
- [ ] Hoàn thiện QuizQuestionsPage với question selector từ bank
- [ ] Test quiz operations

**Quiz Taking Flow:**
- [ ] Implement QuizTakingPage cho learners
- [ ] Implement timer và auto-submit
- [ ] Implement answer tracking
- [ ] Implement QuizResultPage
- [ ] Test quiz taking flow

**Tài liệu tham khảo:** `docs/DEPLOYMENT_GUIDE.md`

---

### 🟢 Priority 4: Advanced Features (LOW)

**Thời gian ước tính:** 4-5 tuần

#### 4.1. Learning Paths (Module 5)

- [ ] Tạo `learningPathService.js` với CRUD
- [ ] Tạo `useLearningPaths.js` hook
- [ ] Hoàn thiện LearningPathListPage
- [ ] Hoàn thiện LearningPathFormModal
- [ ] Implement auto-enroll khi assign path
- [ ] Test learning path flow

#### 4.2. Certificate Management (Module 8)

- [ ] Tạo `certificateService.js`
- [ ] Tạo `useCertificates.js` hook
- [ ] Implement certificate generation (PDF)
- [ ] Implement certificate templates
- [ ] Auto-generate khi hoàn thành course
- [ ] Test certificate flow

#### 4.3. Notifications System (Module 9)

- [ ] Implement notification service
- [ ] Implement NotificationPopover component
- [ ] Implement notification list page
- [ ] Integrate với Directus Flows
- [ ] Test notification flow

#### 4.4. Engagement Features (Module 10)

**User Notes:**
- [ ] Tạo `noteService.js`
- [ ] Tạo `useNotes.js` hook
- [ ] Implement note CRUD
- [ ] Implement timestamp với video

**Lesson Comments:**
- [ ] Tạo `commentService.js`
- [ ] Tạo `useComments.js` hook
- [ ] Implement threaded comments
- [ ] Implement resolved status

**Course Reviews:**
- [ ] Tạo `reviewService.js`
- [ ] Tạo `useReviews.js` hook
- [ ] Implement review CRUD
- [ ] Display rating trên course card

**Tài liệu tham khảo:** `docs/DEPLOYMENT_GUIDE.md`

---

### 🔵 Priority 5: Reports & Analytics (LOW)

**Thời gian ước tính:** 2-3 tuần

- [ ] Implement DashboardPage với statistics
- [ ] Implement DepartmentReportPage
- [ ] Implement EmployeeProgressPage
- [ ] Implement course performance analytics
- [ ] Implement at-risk learners report

**Tài liệu tham khảo:** `docs/DEPLOYMENT_GUIDE.md` - Module 11

---

## 📋 Checklist Tổng quát

### Testing (Priority 1)
- [ ] Setup test utilities và mocks
- [ ] Viết tests cho 19 hooks
- [ ] Viết tests cho common components
- [ ] Viết tests cho layout components
- [ ] Đạt coverage 70%+

### Services Migration (Priority 2)
- [ ] Tags: Mock → Directus
- [ ] Courses: Mock → Directus
- [ ] Tạo Modules service
- [ ] Tạo Lessons service
- [ ] Enrollments: Mock → Directus
- [ ] Lesson Progress: Mock → Directus
- [ ] Quizzes: Mock → Directus
- [ ] Quiz Attempts: Mock → Directus

### Core Features (Priority 3)
- [ ] Hoàn thiện Course Management
- [ ] Hoàn thiện Enrollment & Progress
- [ ] Hoàn thiện Quiz & Question Bank
- [ ] Implement Quiz Taking Flow

### Advanced Features (Priority 4)
- [ ] Learning Paths
- [ ] Certificate Management
- [ ] Notifications System
- [ ] Engagement Features (Notes, Comments, Reviews)

### Reports (Priority 5)
- [ ] Dashboard với statistics
- [ ] Department Reports
- [ ] Employee Progress Reports
- [ ] Analytics & Insights

---

## 🚀 Quick Start - Bắt đầu từ đâu?

### Tuần 1-2: Testing Infrastructure

```bash
# 1. Tạo cấu trúc test files
mkdir -p src/__tests__/hooks
mkdir -p src/__tests__/components/common
mkdir -p src/__tests__/components/layout
mkdir -p src/__tests__/mocks

# 2. Tạo test utilities
touch src/__tests__/test-utils.jsx
touch src/__tests__/mocks/data.js
touch src/__tests__/mocks/services.js

# 3. Bắt đầu với usePermissions test
touch src/__tests__/hooks/usePermissions.test.js

# 4. Chạy tests
npm test
```

### Tuần 3-4: Services Migration

```bash
# 1. Bắt đầu với Tags service
# Update src/services/tagService.js

# 2. Test với Directus
npm run dev

# 3. Tiếp tục với Courses service
# Update src/services/courseService.js
```

### Tuần 5-6: Core Features

```bash
# 1. Hoàn thiện Course Management
# Update CourseListPage, CourseFormPage

# 2. Tạo Modules và Lessons services
# Tạo src/services/moduleService.js
# Tạo src/services/lessonService.js
```

---

## 📚 Tài liệu Tham khảo

- **Testing:** `docs/TEST_PLAN.md`, `docs/UI_TESTING_PLAN.md`
- **Deployment:** `docs/DEPLOYMENT_GUIDE.md`
- **Collections:** `docs/COLLECTIONS_ANALYSIS_REPORT.md`
- **Directus Config:** `docs/DIRECTUS_CONFIGURATION_ANALYSIS.md`

---

## ⏱️ Timeline Ước tính

| Phase | Thời gian | Mô tả |
|-------|-----------|-------|
| **Phase 1: Testing** | 2-3 tuần | Setup infrastructure + viết tests |
| **Phase 2: Services** | 2-3 tuần | Chuyển mock → Directus |
| **Phase 3: Core Features** | 3-4 tuần | Hoàn thiện Course, Enrollment, Quiz |
| **Phase 4: Advanced** | 4-5 tuần | Learning Paths, Certificates, Engagement |
| **Phase 5: Reports** | 2-3 tuần | Analytics & Reports |
| **Tổng cộng** | **13-18 tuần** | ~3-4.5 tháng |

---

**Lưu ý:** Timeline có thể thay đổi tùy theo độ phức tạp và số lượng người làm việc.
