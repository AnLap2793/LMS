# LMS Directus - CRUD Collections Documentation

Tài liệu mô tả toàn bộ các collection và CRUD operations trong dự án LMS Directus, bao gồm cả System Collections và Business Collections.

---

## 1. Tổng quan Collections

### System Collections (Directus Core)

| Collection             | Constant                  | Service                | Hook                | Data Source  | Mô tả                               |
| :--------------------- | :------------------------ | :--------------------- | :------------------ | :----------- | :---------------------------------- |
| `directus_users`       | `COLLECTIONS.USERS`       | `userService.js`       | `useUsers.js`       | Directus API | Quản lý người dùng                  |
| `directus_roles`       | `COLLECTIONS.ROLES`       | `roleService.js` (TBA) | `useRoles.js` (TBA) | Directus API | Quản lý vai trò & phân quyền        |
| `directus_files`       | `COLLECTIONS.FILES`       | `documentService.js`   | `useDocuments.js`   | Directus API | Quản lý file/tài liệu gốc           |
| `directus_activity`    | `COLLECTIONS.ACTIVITY`    | -                      | -                   | Directus API | Nhật ký hoạt động hệ thống          |
| `directus_permissions` | `COLLECTIONS.PERMISSIONS` | -                      | `usePermissions.js` | Directus API | Quản lý quyền hạn (Read-only on FE) |

### Business Collections (LMS)

| Collection       | Constant                     | Service                  | Hook                  | Data Source     |
| :--------------- | :--------------------------- | :----------------------- | :-------------------- | :-------------- |
| `courses`        | `COLLECTIONS.COURSES`        | `courseService.js`       | `useCourses.js`       | Mock Data → API |
| `modules`        | `COLLECTIONS.MODULES`        | `courseService.js`       | `useCourses.js`       | Mock Data → API |
| `lessons`        | `COLLECTIONS.LESSONS`        | `courseService.js`       | `useCourses.js`       | Mock Data → API |
| `enrollments`    | `COLLECTIONS.ENROLLMENTS`    | `enrollmentService.js`   | `useEnrollments.js`   | Mock Data → API |
| `quiz_questions` | `COLLECTIONS.QUIZ_QUESTIONS` | `questionBankService.js` | `useQuestionBank.js`  | Mock Data → API |
| `quiz_attempts`  | `COLLECTIONS.QUIZ_ATTEMPTS`  | `quizAttemptService.js`  | `useQuizAttempts.js`  | Mock Data → API |
| `quizzes`        | `COLLECTIONS.QUIZZES`        | `quizService.js`         | `useQuizzes.js`       | Mock Data → API |
| `documents`      | `COLLECTIONS.DOCUMENTS`      | `documentService.js`     | `useDocuments.js`     | Directus API    |
| `tags`           | `COLLECTIONS.TAGS`           | `tagService.js`          | `useTags.js`          | Mock Data → API |
| `learning_paths` | `COLLECTIONS.LEARNING_PATHS` | `learningPathService.js` | `useLearningPaths.js` | Mock Data → API |
| `certificates`   | `COLLECTIONS.CERTIFICATES`   | `certificateService.js`  | `useCertificates.js`  | Mock Data → API |

---

## 2. Chi tiết CRUD System Collections

### 2.1 Users (`directus_users`)

**Status:** ✅ Production Ready

- **Read:** List, Detail, Me
- **Create:** Register, Admin Create
- **Update:** Profile, Status, Password
- **Delete:** Admin Delete (Soft/Hard)

### 2.2 Roles (`directus_roles`)

**Status:** ⚠️ Partial (Cần cấu hình quyền Read cho FE)

- **Read:** Lấy tên Role để hiển thị (Admin Dashboard, Profile).
- **Lưu ý:** Cần cấp quyền Read `directus_roles` cho các custom roles (Giám đốc, Trưởng phòng...) để hook `useAuth` hoạt động đúng.

### 2.3 Files (`directus_files`)

**Status:** ✅ Production Ready

- **Create:** Upload file (Image, PDF, Doc)
- **Read:** Stream file, Download, Get Metadata
- **Update:** Rename, Move folder
- **Delete:** Delete file

---

## 3. Chi tiết CRUD Business Collections

### 3.1 Courses Ecosystem

Bao gồm: `courses`, `modules`, `lessons`, `tags`, `courses_tags`
**Status:** 🔄 Migrating to API (Hiện tại Mock)

| Method                | Collection | Mô tả                         |
| :-------------------- | :--------- | :---------------------------- |
| `getPublishedCourses` | `courses`  | Lấy danh sách khóa học public |
| `getCourseModules`    | `modules`  | Lấy chương trình học          |
| `getLessonDetail`     | `lessons`  | Nội dung bài học              |
| `getAllTags`          | `tags`     | Danh mục/Thẻ                  |

### 3.2 Assessment Ecosystem

Bao gồm: `quizzes`, `quiz_questions`, `quiz_attempts`
**Status:** 🔄 Migrating to API (Hiện tại Mock)

| Method            | Collection       | Mô tả                     |
| :---------------- | :--------------- | :------------------------ |
| `getQuizDetail`   | `quizzes`        | Thông tin bài kiểm tra    |
| `submitAttempt`   | `quiz_attempts`  | Nộp bài làm               |
| `getQuestionBank` | `quiz_questions` | Ngân hàng câu hỏi (Admin) |

### 3.3 Document Library

Bao gồm: `documents`, `lessons_documents`
**Status:** ✅ Production Ready (Directus API)

| Method            | Collection          | Mô tả                    |
| :---------------- | :------------------ | :----------------------- |
| `searchDocuments` | `documents`         | Tìm kiếm tài liệu        |
| `addToLesson`     | `lessons_documents` | Gán tài liệu vào bài học |

---

## 4. Permission Mapping (Frontend Requirement)

Để Frontend hoạt động đầy đủ, cần cấu hình Permissions trên Directus như sau:

### System Permissions

1. **Directus Roles**: `Read` (All Fields) -> Cho phép FE hiển thị tên Role.
2. **Directus Users**:
    - `Read` (Public Profile Fields): Cho phép xem thông tin giảng viên/học viên.
    - `Update` (Own Profile): Cho phép user tự sửa hồ sơ.
3. **Directus Files**: `Create`, `Read` -> Cho phép upload avatar, bài tập.

### Business Permissions (Role: Learner)

- **Courses**: `Read` (Status = Published)
- **Lessons**: `Read` (Nếu đã enroll khóa học)
- **Enrollments**: `Create` (Đăng ký học), `Read` (Của chính mình)
- **Quiz Attempts**: `Create` (Làm bài), `Read` (Xem kết quả của mình)

### Business Permissions (Role: Admin/Manager)

- **All Collections**: `Full Access`

---

_Cập nhật lần cuối: January 2026_
