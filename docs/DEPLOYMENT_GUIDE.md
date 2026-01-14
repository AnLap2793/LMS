# Hướng dẫn Triển khai và Commit Module cho LMS

## Mục lục

1. [Nguyên tắc Commit](#nguyên-tắc-commit)
2. [Thứ tự Triển khai Module](#thứ-tự-triển-khai-module)
3. [Chi tiết từng Module](#chi-tiết-từng-module)
4. [Git Workflow](#git-workflow)
5. [Checklist Tổng quát](#checklist-tổng-quát)

---

## Nguyên tắc Commit

### Conventional Commits Format

Sử dụng format: `type(scope): description`

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Formatting, không ảnh hưởng logic
- `refactor`: Refactor code
- `test`: Thêm/sửa test
- `chore`: Công việc maintenance (dependencies, config)

**Scopes (theo module):**
- `auth`: Authentication & User Management
- `course`: Course Management
- `enrollment`: Enrollment & Progress
- `quiz`: Quiz & Assessment
- `document`: Document Library
- `certificate`: Certificate Management
- `notification`: Notifications
- `engagement`: Notes, Comments, Reviews
- `report`: Reports & Analytics
- `config`: Configuration & Settings
- `ui`: UI Components (common)
- `layout`: Layout Components

**Ví dụ:**
```bash
feat(course): thêm CRUD operations cho courses
feat(quiz): implement quiz taking flow
fix(enrollment): sửa lỗi tính progress percentage
docs(config): cập nhật hướng dẫn setup Directus
refactor(ui): tách StatusTag thành component riêng
```

### Commit Message Best Practices

1. **Một commit = một thay đổi logic hoàn chỉnh**
   - ✅ Tốt: `feat(course): thêm create course với validation`
   - ❌ Xấu: `feat: update many files` (quá chung chung)

2. **Commit message ngắn gọn nhưng mô tả rõ**
   - ✅ Tốt: `feat(enrollment): tự động tính progress khi lesson completed`
   - ❌ Xấu: `update` hoặc `fix bug`

3. **Commit thường xuyên, không tích lũy quá nhiều thay đổi**
   - Mỗi module nên có nhiều commits nhỏ thay vì 1 commit lớn

---

## Thứ tự Triển khai Module

### Phase 1: Foundation (Tuần 1-2)
1. **Authentication & User Management** (Đã có, chỉ cần review)
2. **Configuration & Constants** (Đã có, chỉ cần review)
3. **Common UI Components** (Đã có một phần, bổ sung)

### Phase 2: Core Content Management (Tuần 3-5)
4. **Tags Management**
5. **Document Library**
6. **Course Management** (Courses, Modules, Lessons)
7. **Learning Paths**

### Phase 3: Learning Flow (Tuần 6-8)
8. **Enrollment & Progress Tracking**
9. **Quiz & Question Bank**
10. **Quiz Taking Flow**

### Phase 4: Advanced Features (Tuần 9-11)
11. **Certificate Management**
12. **Notifications System**
13. **Engagement Features** (Notes, Comments, Reviews)

### Phase 5: Analytics & Reports (Tuần 12-13)
14. **Reports & Analytics**
15. **Dashboard Enhancements**

### Phase 6: Polish & Optimization (Tuần 14+)
16. **Performance Optimization**
17. **Testing & Bug Fixes**
18. **Documentation**

---

## Chi tiết từng Module

### Module 1: Authentication & User Management

**Trạng thái:** Đã có cơ bản, cần review và hoàn thiện

**Files liên quan:**
- `src/services/userService.js`
- `src/hooks/useUsers.js`
- `src/pages/public/LoginPage.jsx`
- `src/pages/private/admin/users/UserListPage.jsx`
- `src/context/AuthContext.jsx`

**Checklist:**
- [ ] Review và test authentication flow
- [ ] Hoàn thiện user profile management
- [ ] Thêm OAuth 2.0 (Google) nếu chưa có
- [ ] Test permissions và role-based access

**Commit Strategy:**
```bash
# Commit 1: Review và fix authentication
fix(auth): sửa lỗi token refresh
feat(auth): thêm OAuth 2.0 Google login

# Commit 2: User management
feat(auth): hoàn thiện user profile page
feat(auth): thêm user CRUD operations cho admin
```

---

### Module 2: Tags Management

**Trạng thái:** Chưa có

**Dependencies:** Không có (foundation module)

**Files cần tạo:**
- `src/services/tagService.js`
- `src/hooks/useTags.js`
- `src/pages/private/admin/tags/TagListPage.jsx` (đã có structure)
- `src/components/admin/tags/TagFormModal.jsx` (đã có structure)

**Checklist:**
- [ ] Tạo `tagService.js` với CRUD operations
- [ ] Tạo `useTags.js` hook với React Query
- [ ] Hoàn thiện `TagListPage.jsx`
- [ ] Hoàn thiện `TagFormModal.jsx`
- [ ] Thêm validation cho tag name (unique)
- [ ] Test CRUD operations

**Commit Strategy:**
```bash
# Commit 1: Service layer
feat(tags): tạo tagService với CRUD operations
feat(tags): thêm COLLECTIONS.TAGS vào constants

# Commit 2: React Query hooks
feat(tags): tạo useTags hook với query keys
feat(tags): thêm useCreateTag, useUpdateTag, useDeleteTag hooks

# Commit 3: UI Components
feat(tags): hoàn thiện TagListPage với table và filters
feat(tags): hoàn thiện TagFormModal với validation
feat(ui): thêm Tag component để hiển thị tag với màu

# Commit 4: Integration
feat(tags): tích hợp tags vào course form
test(tags): thêm test cases cho tag operations
```

---

### Module 3: Document Library

**Trạng thái:** Đã có một phần

**Dependencies:** Không có

**Files liên quan:**
- `src/services/documentService.js` (đã có)
- `src/hooks/useDocuments.js` (đã có)
- `src/pages/private/admin/documents/DocumentLibraryPage.jsx` (đã có)
- `src/components/admin/documents/DocumentFormModal.jsx` (đã có)
- `src/components/admin/documents/DocumentSelectorModal.jsx` (đã có)

**Checklist:**
- [ ] Review và test document CRUD
- [ ] Hoàn thiện upload file với progress
- [ ] Thêm support cho URL documents (Google Docs, Notion)
- [ ] Test file permissions và storage
- [ ] Thêm document preview

**Commit Strategy:**
```bash
# Commit 1: Review và fix
fix(document): sửa lỗi upload file lớn
feat(document): thêm support URL documents (Google Docs, Notion)

# Commit 2: Enhancements
feat(document): thêm document preview modal
feat(document): thêm file type icons và indicators
feat(document): cải thiện DocumentSelectorModal UX

# Commit 3: Integration
feat(document): tích hợp document selector vào lesson form
test(document): thêm test cases cho document operations
```

---

### Module 4: Course Management

**Trạng thái:** Đã có một phần (mock data)

**Dependencies:** Tags, Documents

**Files liên quan:**
- `src/services/courseService.js` (mock, cần update)
- `src/hooks/useCourses.js` (mock, cần update)
- `src/pages/private/admin/courses/CourseListPage.jsx`
- `src/pages/private/admin/courses/CourseFormPage.jsx`
- `src/pages/private/admin/courses/CourseContentPage.jsx`
- `src/components/admin/courses/ModuleFormModal.jsx`
- `src/components/admin/courses/LessonFormModal.jsx`

**Checklist:**

**4.1. Courses:**
- [ ] Update `courseService.js` để kết nối Directus
- [ ] Update `useCourses.js` với React Query
- [ ] Hoàn thiện CourseListPage với filters (status, difficulty, tags)
- [ ] Hoàn thiện CourseFormPage với department filter
- [ ] Thêm drag & drop để sắp xếp courses
- [ ] Test CRUD operations

**4.2. Modules:**
- [ ] Tạo `moduleService.js`
- [ ] Tạo `useModules.js` hook
- [ ] Hoàn thiện ModuleFormModal
- [ ] Thêm drag & drop để sắp xếp modules trong course
- [ ] Test module CRUD

**4.3. Lessons:**
- [ ] Tạo `lessonService.js`
- [ ] Tạo `useLessons.js` hook
- [ ] Hoàn thiện LessonFormModal với các loại:
  - Video (YouTube, Google Drive)
  - Article (Rich text editor)
  - Link (External link)
- [ ] Thêm document attachment cho lessons
- [ ] Thêm drag & drop để sắp xếp lessons
- [ ] Test lesson CRUD

**4.4. Course Content Management:**
- [ ] Hoàn thiện CourseContentPage với tree view
- [ ] Thêm preview lesson trong admin
- [ ] Thêm auto-calculate course duration
- [ ] Test toàn bộ flow

**Commit Strategy:**
```bash
# Commit 1: Courses Service Layer
feat(course): update courseService kết nối Directus
feat(course): thêm filters và search cho courses
feat(course): thêm department filter logic

# Commit 2: Courses UI
feat(course): hoàn thiện CourseListPage với filters
feat(course): hoàn thiện CourseFormPage với validation
feat(course): thêm drag & drop sắp xếp courses

# Commit 3: Modules
feat(course): tạo moduleService và useModules hook
feat(course): hoàn thiện ModuleFormModal
feat(course): thêm drag & drop sắp xếp modules

# Commit 4: Lessons Service Layer
feat(course): tạo lessonService và useLessons hook
feat(course): thêm support video YouTube và Google Drive
feat(course): thêm document attachment cho lessons

# Commit 5: Lessons UI
feat(course): hoàn thiện LessonFormModal với các loại lesson
feat(course): thêm video URL parser và validator
feat(course): thêm drag & drop sắp xếp lessons

# Commit 6: Course Content Page
feat(course): hoàn thiện CourseContentPage với tree view
feat(course): thêm preview lesson trong admin
feat(course): thêm auto-calculate course duration

# Commit 7: Integration & Testing
feat(course): tích hợp tags và documents vào course
test(course): thêm test cases cho course operations
docs(course): cập nhật documentation
```

---

### Module 5: Learning Paths

**Trạng thái:** Chưa có

**Dependencies:** Courses

**Files cần tạo:**
- `src/services/learningPathService.js`
- `src/hooks/useLearningPaths.js`
- `src/pages/private/admin/learning-paths/LearningPathListPage.jsx` (đã có structure)
- `src/components/admin/learning-paths/LearningPathFormModal.jsx` (đã có structure)

**Checklist:**
- [ ] Tạo `learningPathService.js` với CRUD
- [ ] Tạo `useLearningPaths.js` hook
- [ ] Hoàn thiện LearningPathListPage
- [ ] Hoàn thiện LearningPathFormModal với course selector
- [ ] Thêm drag & drop để sắp xếp courses trong path
- [ ] Thêm mandatory/optional flag
- [ ] Test CRUD operations

**Commit Strategy:**
```bash
# Commit 1: Service Layer
feat(learning-path): tạo learningPathService với CRUD
feat(learning-path): thêm COLLECTIONS.LEARNING_PATHS vào constants

# Commit 2: React Query Hooks
feat(learning-path): tạo useLearningPaths hook
feat(learning-path): thêm useCreatePath, useUpdatePath hooks

# Commit 3: UI Components
feat(learning-path): hoàn thiện LearningPathListPage
feat(learning-path): hoàn thiện LearningPathFormModal với course selector
feat(learning-path): thêm drag & drop sắp xếp courses trong path

# Commit 4: Features
feat(learning-path): thêm mandatory/optional flag
feat(learning-path): thêm department filter cho paths
test(learning-path): thêm test cases
```

---

### Module 6: Enrollment & Progress Tracking

**Trạng thái:** Đã có một phần (mock data)

**Dependencies:** Courses, Users

**Files liên quan:**
- `src/services/enrollmentService.js` (mock, cần update)
- `src/hooks/useEnrollments.js` (mock, cần update)
- `src/pages/private/admin/enrollments/EnrollmentListPage.jsx`
- `src/components/admin/enrollments/EnrollmentFormModal.jsx`

**Checklist:**
- [ ] Update `enrollmentService.js` kết nối Directus
- [ ] Update `useEnrollments.js` với React Query
- [ ] Tạo `lessonProgressService.js`
- [ ] Tạo `useLessonProgress.js` hook
- [ ] Hoàn thiện EnrollmentListPage với filters
- [ ] Hoàn thiện EnrollmentFormModal
- [ ] Implement auto-calculate progress percentage
- [ ] Thêm deadline reminder logic
- [ ] Test enrollment flow

**Commit Strategy:**
```bash
# Commit 1: Enrollment Service
feat(enrollment): update enrollmentService kết nối Directus
feat(enrollment): thêm filters và search cho enrollments
feat(enrollment): thêm assignment types (individual, department, auto)

# Commit 2: Enrollment UI
feat(enrollment): hoàn thiện EnrollmentListPage với filters
feat(enrollment): hoàn thiện EnrollmentFormModal
feat(enrollment): thêm bulk assign courses cho users

# Commit 3: Lesson Progress Service
feat(enrollment): tạo lessonProgressService
feat(enrollment): tạo useLessonProgress hook
feat(enrollment): implement track lesson completion

# Commit 4: Progress Calculation
feat(enrollment): implement auto-calculate progress percentage
feat(enrollment): thêm resume watching cho video lessons
feat(enrollment): track time spent cho lessons

# Commit 5: Features
feat(enrollment): thêm deadline reminder logic
feat(enrollment): thêm enrollment status management
test(enrollment): thêm test cases
```

---

### Module 7: Quiz & Question Bank

**Trạng thái:** Đã có một phần

**Dependencies:** Courses, Lessons

**Files liên quan:**
- `src/services/questionBankService.js` (đã có)
- `src/hooks/useQuestionBank.js` (đã có)
- `src/pages/private/admin/questions/QuestionBankPage.jsx`
- `src/pages/private/admin/quizzes/QuizListPage.jsx`
- `src/pages/private/admin/quizzes/QuizQuestionsPage.jsx`
- `src/components/admin/quizzes/QuizFormModal.jsx`
- `src/components/admin/quizzes/QuestionFormModal.jsx`

**Checklist:**

**7.1. Question Bank:**
- [ ] Review và test question bank CRUD
- [ ] Hoàn thiện QuestionBankPage với filters
- [ ] Thêm support các loại câu hỏi (single, multiple, text)
- [ ] Thêm explanation và difficulty
- [ ] Test question operations

**7.2. Quizzes:**
- [ ] Tạo `quizService.js`
- [ ] Tạo `useQuizzes.js` hook
- [ ] Hoàn thiện QuizListPage
- [ ] Hoàn thiện QuizFormModal với config (time limit, pass score, etc.)
- [ ] Hoàn thiện QuizQuestionsPage với question selector từ bank
- [ ] Thêm drag & drop để sắp xếp questions
- [ ] Test quiz CRUD

**Commit Strategy:**
```bash
# Commit 1: Question Bank Review
fix(quiz): review và fix question bank operations
feat(quiz): thêm filters cho question bank (difficulty, category, tags)
feat(quiz): hoàn thiện question form với explanation

# Commit 2: Quiz Service Layer
feat(quiz): tạo quizService với CRUD operations
feat(quiz): tạo useQuizzes hook với React Query
feat(quiz): thêm COLLECTIONS.QUIZZES vào constants

# Commit 3: Quiz UI
feat(quiz): hoàn thiện QuizListPage với filters
feat(quiz): hoàn thiện QuizFormModal với config options
feat(quiz): thêm quiz analysis page

# Commit 4: Quiz Questions
feat(quiz): hoàn thiện QuizQuestionsPage
feat(quiz): thêm question selector từ question bank
feat(quiz): thêm drag & drop sắp xếp questions
feat(quiz): implement copy questions từ bank vào quiz

# Commit 5: Integration
feat(quiz): tích hợp quiz vào course và lesson
test(quiz): thêm test cases cho quiz operations
```

---

### Module 8: Quiz Taking Flow

**Trạng thái:** Chưa có

**Dependencies:** Quizzes, Enrollments

**Files cần tạo:**
- `src/services/quizAttemptService.js` (đã có structure)
- `src/hooks/useQuizAttempts.js` (đã có structure)
- `src/pages/private/learner/QuizTakingPage.jsx`
- `src/pages/private/learner/QuizResultPage.jsx`
- `src/pages/private/learner/QuizHistoryPage.jsx`

**Checklist:**
- [ ] Review `quizAttemptService.js` và update nếu cần
- [ ] Review `useQuizAttempts.js` và update nếu cần
- [ ] Tạo QuizTakingPage với timer và question display
- [ ] Implement auto-save answers
- [ ] Implement grading logic
- [ ] Tạo QuizResultPage với score và review
- [ ] Tạo QuizHistoryPage để xem lịch sử attempts
- [ ] Test quiz taking flow

**Commit Strategy:**
```bash
# Commit 1: Quiz Attempt Service
feat(quiz): review và update quizAttemptService
feat(quiz): implement save quiz attempt
feat(quiz): implement grading logic

# Commit 2: Quiz Taking Page
feat(quiz): tạo QuizTakingPage với timer
feat(quiz): implement question display và navigation
feat(quiz): implement auto-save answers

# Commit 3: Quiz Result
feat(quiz): tạo QuizResultPage với score display
feat(quiz): thêm review answers sau khi submit
feat(quiz): hiển thị passed/failed status

# Commit 4: Quiz History
feat(quiz): tạo QuizHistoryPage
feat(quiz): hiển thị lịch sử attempts của user
feat(quiz): thêm filter và sort cho history

# Commit 5: Features
feat(quiz): implement max attempts check
feat(quiz): implement randomize questions
feat(quiz): thêm quiz completion tracking
test(quiz): thêm test cases cho quiz taking flow
```

---

### Module 9: Certificate Management

**Trạng thái:** Chưa có

**Dependencies:** Courses, Enrollments, Quizzes

**Files cần tạo:**
- `src/services/certificateService.js`
- `src/hooks/useCertificates.js`
- `src/pages/private/admin/certificates/CertificateTemplatesPage.jsx` (đã có structure)
- `src/pages/private/learner/MyCertificatesPage.jsx`

**Checklist:**
- [ ] Tạo `certificateService.js`
- [ ] Tạo `useCertificates.js` hook
- [ ] Hoàn thiện CertificateTemplatesPage
- [ ] Implement PDF certificate generation (hoặc tích hợp với Directus Flow)
- [ ] Tạo MyCertificatesPage cho learners
- [ ] Implement auto-generate certificate khi hoàn thành course
- [ ] Test certificate flow

**Commit Strategy:**
```bash
# Commit 1: Certificate Service
feat(certificate): tạo certificateService với CRUD
feat(certificate): thêm COLLECTIONS.CERTIFICATES vào constants
feat(certificate): implement generate certificate number

# Commit 2: Certificate Templates
feat(certificate): hoàn thiện CertificateTemplatesPage
feat(certificate): thêm upload và manage templates
feat(certificate): implement template selection

# Commit 3: Certificate Generation
feat(certificate): implement PDF certificate generation
feat(certificate): implement auto-generate khi hoàn thành course
feat(certificate): tích hợp với Directus Flow

# Commit 4: Learner Certificates
feat(certificate): tạo MyCertificatesPage
feat(certificate): thêm download certificate PDF
feat(certificate): hiển thị certificate list với filters

# Commit 5: Integration
feat(certificate): tích hợp certificate vào enrollment flow
test(certificate): thêm test cases
```

---

### Module 10: Notifications System

**Trạng thái:** Chưa có

**Dependencies:** Users, Enrollments, Certificates

**Files cần tạo:**
- `src/services/notificationService.js`
- `src/hooks/useNotifications.js`
- `src/components/common/NotificationPopover.jsx` (đã có structure)
- `src/pages/private/learner/NotificationsPage.jsx`

**Checklist:**
- [ ] Tạo `notificationService.js` sử dụng Directus notifications
- [ ] Tạo `useNotifications.js` hook
- [ ] Hoàn thiện NotificationPopover component
- [ ] Tạo NotificationsPage với inbox
- [ ] Implement mark as read/unread
- [ ] Implement notification types (enrollment, deadline, certificate)
- [ ] Tích hợp với Directus Flows để auto-create notifications
- [ ] Test notification flow

**Commit Strategy:**
```bash
# Commit 1: Notification Service
feat(notification): tạo notificationService
feat(notification): implement read/unread notifications
feat(notification): thêm filter theo app và type

# Commit 2: Notification Hook
feat(notification): tạo useNotifications hook
feat(notification): implement real-time updates
feat(notification): thêm unread count

# Commit 3: Notification UI
feat(notification): hoàn thiện NotificationPopover
feat(notification): tạo NotificationsPage với inbox
feat(notification): thêm notification types và icons

# Commit 4: Integration
feat(notification): tích hợp với enrollment flow
feat(notification): tích hợp với certificate flow
feat(notification): thêm deadline reminder notifications

# Commit 5: Features
feat(notification): implement mark all as read
feat(notification): thêm notification settings
test(notification): thêm test cases
```

---

### Module 11: Engagement Features

**Trạng thái:** Chưa có

**Dependencies:** Lessons, Courses, Users

**Files cần tạo:**
- `src/services/noteService.js`
- `src/services/commentService.js`
- `src/services/reviewService.js`
- `src/hooks/useNotes.js`
- `src/hooks/useComments.js`
- `src/hooks/useReviews.js`

**Checklist:**

**11.1. User Notes:**
- [ ] Tạo `noteService.js`
- [ ] Tạo `useNotes.js` hook
- [ ] Thêm note editor trong lesson page
- [ ] Thêm timestamp cho video notes
- [ ] Tạo notes dashboard

**11.2. Lesson Comments:**
- [ ] Tạo `commentService.js`
- [ ] Tạo `useComments.js` hook
- [ ] Thêm comment section trong lesson page
- [ ] Implement threaded comments (reply)
- [ ] Thêm resolved status cho Q&A

**11.3. Course Reviews:**
- [ ] Tạo `reviewService.js`
- [ ] Tạo `useReviews.js` hook
- [ ] Thêm review form sau khi hoàn thành course
- [ ] Hiển thị reviews và rating trên course card
- [ ] Thêm review moderation

**Commit Strategy:**
```bash
# Commit 1: User Notes
feat(engagement): tạo noteService và useNotes hook
feat(engagement): thêm note editor trong lesson page
feat(engagement): implement timestamp cho video notes

# Commit 2: Lesson Comments
feat(engagement): tạo commentService và useComments hook
feat(engagement): thêm comment section trong lesson page
feat(engagement): implement threaded comments

# Commit 3: Course Reviews
feat(engagement): tạo reviewService và useReviews hook
feat(engagement): thêm review form sau khi hoàn thành course
feat(engagement): hiển thị reviews và rating trên course card

# Commit 4: Features
feat(engagement): thêm resolved status cho comments
feat(engagement): thêm notes dashboard
feat(engagement): thêm review moderation
test(engagement): thêm test cases
```

---

### Module 12: Reports & Analytics

**Trạng thái:** Đã có một phần

**Dependencies:** Enrollments, Courses, Quizzes, Users

**Files liên quan:**
- `src/pages/private/admin/reports/ReportsPage.jsx`
- `src/pages/private/admin/reports/EmployeeProgressPage.jsx`
- `src/pages/private/admin/reports/DepartmentReportPage.jsx`

**Checklist:**
- [ ] Hoàn thiện ReportsPage với dashboard overview
- [ ] Hoàn thiện EmployeeProgressPage với filters
- [ ] Hoàn thiện DepartmentReportPage với charts
- [ ] Thêm export reports (PDF, Excel)
- [ ] Implement at-risk learners detection
- [ ] Thêm course performance analytics
- [ ] Test reports và analytics

**Commit Strategy:**
```bash
# Commit 1: Reports Overview
feat(report): hoàn thiện ReportsPage với dashboard
feat(report): thêm key metrics và charts
feat(report): implement date range filters

# Commit 2: Employee Progress
feat(report): hoàn thiện EmployeeProgressPage
feat(report): thêm filters và search
feat(report): thêm progress visualization

# Commit 3: Department Reports
feat(report): hoàn thiện DepartmentReportPage
feat(report): thêm department comparison charts
feat(report): thêm completion rate analytics

# Commit 4: Advanced Analytics
feat(report): implement at-risk learners detection
feat(report): thêm course performance analytics
feat(report): thêm quiz performance analytics

# Commit 5: Export
feat(report): thêm export reports (PDF, Excel)
feat(report): thêm scheduled reports
test(report): thêm test cases
```

---

## Git Workflow

### Quick Reference - Các Lệnh Thường Dùng

**Tạo branch mới cho module:**
```bash
git checkout develop && git pull origin develop
git checkout -b feat/module-name
git push -u origin feat/module-name
```

**Commit và push:**
```bash
git add .
git commit -m "feat(scope): description"
git push origin feat/module-name
```

**Sync với develop:**
```bash
git checkout feat/module-name
git fetch origin
git rebase origin/develop
git push origin feat/module-name --force-with-lease
```

**Merge vào develop (sau khi hoàn thành module):**
```bash
git checkout develop
git pull origin develop
git merge feat/module-name --no-ff -m "feat(scope): implement module"
git push origin develop
git branch -d feat/module-name  # Xóa local branch
git push origin --delete feat/module-name  # Xóa remote branch
```

---

### Branch Strategy

**Main Branches:**
- `main`: Production-ready code (chỉ merge từ develop khi release)
- `develop`: Integration branch cho tất cả features (branch chính để phát triển)

**Feature Branches:**
- `feat/module-name`: Feature branches cho từng module
- Ví dụ: `feat/tags-management`, `feat/course-management`, `feat/quiz-taking`

**Hotfix Branches:**
- `fix/critical-bug-description`: Sửa lỗi critical trên production
- Ví dụ: `fix/auth-token-expiry`, `fix/enrollment-progress-calculation`

**Naming Convention:**
```
feat/module-name              # Feature mới
fix/module-name-bug-description  # Bug fix
refactor/module-name          # Refactor code
docs/module-name              # Documentation
test/module-name              # Testing
```

**Mapping Module → Branch Name:**

| Module | Branch Name | Phase |
|--------|-------------|-------|
| Authentication & User Management | `feat/auth-review` hoặc `feat/auth` | Phase 1 |
| Common UI Components | `feat/common-ui-components` | Phase 1 |
| Tags Management | `feat/tags-management` | Phase 2 |
| Document Library | `feat/document-library` | Phase 2 |
| Course Management | `feat/course-management` | Phase 2 |
| Learning Paths | `feat/learning-paths` | Phase 2 |
| Enrollment & Progress | `feat/enrollment-tracking` | Phase 3 |
| Quiz & Question Bank | `feat/quiz-management` | Phase 3 |
| Quiz Taking Flow | `feat/quiz-taking` | Phase 3 |
| Certificate Management | `feat/certificate-management` | Phase 4 |
| Notifications System | `feat/notifications` | Phase 4 |
| Engagement Features | `feat/engagement` | Phase 4 |
| Reports & Analytics | `feat/reports-analytics` | Phase 5 |
| Dashboard Enhancements | `feat/dashboard` | Phase 5 |

**Lưu ý:** Tên branch có thể linh hoạt, miễn tuân theo convention `feat/module-name`.

### Setup Ban đầu (Nếu chưa có develop branch)

**Bước 1: Tạo develop branch từ main:**
```bash
# Đảm bảo đang ở main và code đã commit
git checkout main
git pull origin main

# Tạo develop branch
git checkout -b develop
git push -u origin develop
```

**Bước 2: Setup branch protection (nếu dùng GitHub/GitLab):**
- Protect `main` branch: Require pull request, require review
- Protect `develop` branch: Require pull request (optional review)

### Workflow Steps Chi tiết

#### 1. Tạo Feature Branch cho Module

**Ví dụ: Tạo branch cho Module Tags Management**

```bash
# Bước 1: Đảm bảo develop branch đã update
git checkout develop
git pull origin develop

# Bước 2: Tạo feature branch mới
git checkout -b feat/tags-management

# Bước 3: Push branch lên remote (để backup và có thể làm việc trên nhiều máy)
git push -u origin feat/tags-management
```

**Ví dụ: Tạo branch cho Module Course Management**

```bash
git checkout develop
git pull origin develop
git checkout -b feat/course-management
git push -u origin feat/course-management
```

#### 2. Develop và Commit thường xuyên

```bash
# Sau khi code xong một phần nhỏ
git add .
git commit -m "feat(tags): tạo tagService với CRUD operations"

# Push lên remote
git push origin feat/tags-management
```

**Lưu ý:** Commit thường xuyên, mỗi commit là một thay đổi logic hoàn chỉnh.

#### 3. Sync với develop (Quan trọng!)

**Khi develop có thay đổi mới, cần sync feature branch:**

```bash
# Cách 1: Rebase (khuyến nghị - giữ history sạch)
git checkout feat/tags-management
git fetch origin
git rebase origin/develop

# Nếu có conflicts, giải quyết và tiếp tục:
git add .
git rebase --continue

# Push sau khi rebase (force push vì đã rewrite history)
git push origin feat/tags-management --force-with-lease
```

```bash
# Cách 2: Merge (đơn giản hơn nhưng tạo merge commit)
git checkout feat/tags-management
git fetch origin
git merge origin/develop

# Giải quyết conflicts nếu có
git add .
git commit -m "merge: sync với develop"

git push origin feat/tags-management
```

**Khuyến nghị:** Sync với develop ít nhất 1 lần/ngày hoặc trước khi bắt đầu làm việc mới.

#### 4. Khi hoàn thành Module

**Bước 1: Final sync với develop:**
```bash
git checkout feat/tags-management
git fetch origin
git rebase origin/develop
# Giải quyết conflicts nếu có
git push origin feat/tags-management --force-with-lease
```

**Bước 2: Test và verify:**
```bash
# Chạy tests
npm test

# Chạy linter
npm run lint

# Build để đảm bảo không có lỗi
npm run build
```

**Bước 3: Merge vào develop:**

**Option A: Merge qua Pull Request (Khuyến nghị)**
```bash
# Tạo Pull Request trên GitHub/GitLab:
# - Base: develop
# - Compare: feat/tags-management
# - Title: feat(tags): implement tags management module
# - Description: Mô tả những gì đã làm
```

**Option B: Merge trực tiếp (nếu làm việc solo)**
```bash
git checkout develop
git pull origin develop
git merge feat/tags-management --no-ff -m "feat(tags): implement tags management module"
git push origin develop
```

**Bước 4: Cleanup (xóa branch local và remote):**
```bash
# Xóa local branch
git branch -d feat/tags-management

# Xóa remote branch
git push origin --delete feat/tags-management
```

#### 5. Khi Release

```bash
# Bước 1: Đảm bảo develop đã stable
git checkout develop
git pull origin develop

# Bước 2: Merge vào main
git checkout main
git pull origin main
git merge develop --no-ff -m "release: v1.0.0"
git push origin main

# Bước 3: Tạo tag
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial release"
git push origin main --tags

# Bước 4: Tạo release branch (optional, để hotfix sau này)
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```

### Ví dụ Workflow cho từng Phase

#### Phase 1: Foundation

```bash
# Module 1: Review Authentication
git checkout develop
git checkout -b feat/auth-review
# ... làm việc ...
git commit -m "fix(auth): sửa lỗi token refresh"
git commit -m "feat(auth): thêm OAuth 2.0 Google login"
git push origin feat/auth-review
# Merge vào develop

# Module 2: Common UI Components
git checkout develop
git checkout -b feat/common-ui-components
# ... làm việc ...
git commit -m "feat(ui): thêm StatusTag component"
git commit -m "feat(ui): thêm EmptyState component"
git push origin feat/common-ui-components
# Merge vào develop
```

#### Phase 2: Core Content Management

```bash
# Module 4: Tags Management
git checkout develop
git checkout -b feat/tags-management
# ... làm việc theo checklist ...
git commit -m "feat(tags): tạo tagService với CRUD operations"
git commit -m "feat(tags): tạo useTags hook với query keys"
git commit -m "feat(tags): hoàn thiện TagListPage với table và filters"
git commit -m "feat(tags): hoàn thiện TagFormModal với validation"
git push origin feat/tags-management
# Sync với develop nếu có thay đổi
git fetch origin
git rebase origin/develop
git push origin feat/tags-management --force-with-lease
# Merge vào develop khi hoàn thành

# Module 5: Document Library
git checkout develop
git checkout -b feat/document-library
# ... làm việc ...
# Merge vào develop

# Module 6: Course Management (Module lớn, có thể chia nhỏ)
git checkout develop
git checkout -b feat/course-management
# ... làm việc ...
# Có thể chia thành nhiều commits nhỏ
git commit -m "feat(course): update courseService kết nối Directus"
git commit -m "feat(course): hoàn thiện CourseListPage với filters"
git commit -m "feat(course): tạo moduleService và useModules hook"
git commit -m "feat(course): tạo lessonService và useLessons hook"
# ... tiếp tục ...
# Merge vào develop khi hoàn thành
```

### Xử lý Conflicts

**Khi rebase/merge có conflicts:**

```bash
# 1. Git sẽ báo file nào có conflict
# 2. Mở file và tìm các markers:
#    <<<<<<< HEAD
#    code từ branch hiện tại
#    =======
#    code từ branch đang merge
#    >>>>>>> branch-name

# 3. Giải quyết conflict (giữ code đúng, xóa markers)
# 4. Stage file đã giải quyết:
git add path/to/file.js

# 5. Tiếp tục rebase/merge:
git rebase --continue
# hoặc
git commit
```

**Lưu ý:** 
- Luôn test sau khi giải quyết conflict
- Nếu conflict phức tạp, có thể abort và merge lại sau:
  ```bash
  git rebase --abort  # Hoặc
  git merge --abort
  ```

### Quản lý Multiple Branches

**Làm việc song song nhiều modules:**

```bash
# Branch 1: Tags Management
git checkout feat/tags-management
# ... làm việc ...
git commit -m "feat(tags): ..."
git push origin feat/tags-management

# Chuyển sang Branch 2: Document Library
git checkout feat/document-library
# ... làm việc ...
git commit -m "feat(document): ..."
git push origin feat/document-library

# Sync cả 2 branches với develop
git checkout feat/tags-management
git rebase origin/develop
git push origin feat/tags-management --force-with-lease

git checkout feat/document-library
git rebase origin/develop
git push origin feat/document-library --force-with-lease
```

**Lưu ý:** Không nên làm việc trên quá nhiều branches cùng lúc (tối đa 2-3 branches).

### Best Practices

1. **Luôn sync với develop trước khi bắt đầu làm việc mới:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feat/your-branch
   git rebase origin/develop
   ```

2. **Commit thường xuyên, push thường xuyên:**
   - Commit mỗi khi hoàn thành một phần nhỏ
   - Push để backup code và có thể làm việc trên nhiều máy

3. **Giữ branch name ngắn gọn và mô tả rõ:**
   - ✅ Tốt: `feat/course-management`, `fix/enrollment-progress`
   - ❌ Xấu: `feature`, `fix`, `new-stuff`

4. **Cleanup branches sau khi merge:**
   - Xóa local và remote branches đã merge
   - Giữ repository sạch sẽ

5. **Không force push vào main/develop:**
   - Chỉ force push vào feature branches của mình
   - Luôn dùng `--force-with-lease` thay vì `--force`

6. **Tạo backup branch nếu cần:**
   ```bash
   git branch backup/feat/course-management-2024-01-15
   ```

### Commit Frequency

- **Mỗi feature nhỏ:** 1 commit
- **Mỗi component hoàn chỉnh:** 1 commit
- **Mỗi service/hook:** 1 commit riêng
- **Mỗi bug fix:** 1 commit riêng

**Không commit:**
- Code chưa test
- Code có lỗi linter
- Nhiều thay đổi không liên quan trong 1 commit

### Các Lệnh Git Hữu ích

#### Xem trạng thái và lịch sử

```bash
# Xem trạng thái hiện tại
git status

# Xem các branch
git branch -a

# Xem commit history
git log --oneline --graph --all

# Xem thay đổi trong file
git diff

# Xem thay đổi đã staged
git diff --staged

# Xem commit của một file
git log -- path/to/file.js
```

#### Quản lý Changes

```bash
# Unstage file (giữ thay đổi)
git reset HEAD path/to/file.js

# Discard thay đổi trong file (mất thay đổi!)
git checkout -- path/to/file.js

# Discard tất cả thay đổi chưa commit
git reset --hard HEAD

# Xem file đã thay đổi
git status --short
```

#### Sửa Commit Message hoặc thêm file vào commit cuối

```bash
# Sửa commit message của commit cuối
git commit --amend -m "feat(course): new commit message"

# Thêm file vào commit cuối
git add forgotten-file.js
git commit --amend --no-edit
```

#### Stash (Tạm lưu thay đổi)

```bash
# Lưu thay đổi tạm thời
git stash

# Xem danh sách stash
git stash list

# Lấy lại thay đổi từ stash
git stash pop

# Xóa stash
git stash drop
```

**Ví dụ sử dụng:**
```bash
# Đang làm việc trên feat/course-management
# Cần chuyển sang fix bug trên develop
git stash
git checkout develop
git checkout -b fix/critical-bug
# ... fix bug ...
git commit -m "fix: ..."
git checkout feat/course-management
git stash pop  # Lấy lại code đang làm
```

#### Xem và so sánh Branches

```bash
# Xem khác biệt giữa 2 branches
git diff develop..feat/course-management

# Xem commits có trong branch này nhưng không có trong develop
git log develop..feat/course-management

# Xem files thay đổi giữa 2 branches
git diff --name-only develop..feat/course-management
```

### Troubleshooting

#### 1. Commit nhầm vào wrong branch

```bash
# Giả sử commit nhầm vào develop thay vì feature branch
git checkout develop
git log  # Tìm commit hash (ví dụ: abc123)

# Tạo branch mới từ commit đó
git checkout -b feat/correct-branch

# Xóa commit khỏi develop
git checkout develop
git reset --hard HEAD~1  # Xóa commit cuối
# hoặc
git reset --hard abc122  # Reset về commit trước đó
```

#### 2. Muốn undo commit nhưng giữ thay đổi

```bash
# Undo commit cuối, giữ thay đổi trong working directory
git reset --soft HEAD~1

# Undo commit cuối, giữ thay đổi nhưng unstage
git reset HEAD~1
```

#### 3. Muốn undo push (chưa ai pull)

```bash
# Xóa commit cuối trên remote
git reset --hard HEAD~1
git push origin branch-name --force-with-lease
```

**⚠️ Cảnh báo:** Chỉ làm khi chắc chắn chưa ai pull code đó!

#### 4. Rebase bị lỗi, muốn abort

```bash
git rebase --abort
```

#### 5. Merge bị lỗi, muốn abort

```bash
git merge --abort
```

#### 6. Xóa branch đã merge

```bash
# Xóa local branch
git branch -d feat/tags-management

# Force delete nếu chưa merge (cẩn thận!)
git branch -D feat/tags-management

# Xóa remote branch
git push origin --delete feat/tags-management
```

#### 7. Tìm commit đã xóa file

```bash
git log --all --full-history -- path/to/deleted-file.js
```

#### 8. Xem ai đã sửa file và khi nào

```bash
git blame path/to/file.js
```

### Git Aliases (Tùy chọn - Để làm việc nhanh hơn)

Thêm vào `~/.gitconfig` hoặc `.git/config`:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

Sau đó có thể dùng:
```bash
git st    # thay vì git status
git co develop  # thay vì git checkout develop
git ci -m "message"  # thay vì git commit -m "message"
```

---

## Checklist Tổng quát

### Trước khi commit:

- [ ] Code đã được test (manual hoặc unit test)
- [ ] Không có lỗi linter (`npm run lint`)
- [ ] Code đã được format (`npm run format`)
- [ ] Đã review code của chính mình
- [ ] Commit message rõ ràng và đúng format
- [ ] Chỉ commit những thay đổi liên quan đến feature hiện tại

### Trước khi merge vào develop:

- [ ] Tất cả tests pass (`npm test`)
- [ ] Không có lỗi build (`npm run build`)
- [ ] Đã test trên local environment
- [ ] Đã review với team (nếu có)
- [ ] Documentation đã được cập nhật (nếu cần)

### Trước khi release:

- [ ] Tất cả modules đã hoàn thành
- [ ] Integration tests pass
- [ ] Performance testing đã được thực hiện
- [ ] Security review đã được thực hiện
- [ ] Documentation đã đầy đủ
- [ ] Changelog đã được cập nhật

---

## Ví dụ Git Log cho một Module

```bash
# Module: Course Management
feat(course): update courseService kết nối Directus
feat(course): thêm filters và search cho courses
feat(course): hoàn thiện CourseListPage với filters
feat(course): hoàn thiện CourseFormPage với validation
feat(course): tạo moduleService và useModules hook
feat(course): hoàn thiện ModuleFormModal
feat(course): tạo lessonService và useLessons hook
feat(course): hoàn thiện LessonFormModal với các loại lesson
feat(course): hoàn thiện CourseContentPage với tree view
feat(course): thêm auto-calculate course duration
fix(course): sửa lỗi department filter không hoạt động
test(course): thêm test cases cho course operations
docs(course): cập nhật documentation cho course module
```

---

## Lưu ý Quan trọng

1. **Luôn test trước khi commit:** Đảm bảo code hoạt động đúng trước khi commit
2. **Commit nhỏ và thường xuyên:** Dễ review và rollback nếu có lỗi
3. **Commit message rõ ràng:** Giúp team hiểu được thay đổi
4. **Không commit sensitive data:** API keys, passwords, etc.
5. **Review code trước khi merge:** Tự review hoặc nhờ team review
6. **Giữ branch sync với develop:** Rebase thường xuyên để tránh conflicts

---

## Tài liệu Tham khảo

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [AGENTS.md](./AGENTS.md) - Project coding standards
- [LMS.md](./LMS.md) - System documentation
