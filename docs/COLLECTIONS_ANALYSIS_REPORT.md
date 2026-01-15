# Báo cáo Phân tích Collections và Chức năng LMS

## Tổng quan

Báo cáo này phân tích sự phù hợp giữa các Collections được định nghĩa trong `DIRECTUS_CONFIGURATION_ANALYSIS.md` với các chức năng hiện tại của dự án LMS.

**Ngày phân tích:** $(date)

---

## 1. So sánh Collections: Tài liệu vs Code hiện tại

### 1.1. Collections đã có đầy đủ (Có trong cả tài liệu và constants)

| Collection | Trong Tài liệu | Trong Constants | Service | Hook | Trạng thái |
|------------|----------------|-----------------|---------|------|------------|
| `directus_users` | ✅ | ✅ USERS | ✅ userService.js (Directus) | ✅ useUsers.js | ✅ Hoàn thành |
| `tags` | ✅ | ✅ TAGS | ✅ tagService.js (Mock) | ✅ useTags.js | ⚠️ Cần chuyển sang Directus |
| `courses` | ✅ | ✅ COURSES | ✅ courseService.js (Mock) | ✅ useCourses.js | ⚠️ Cần chuyển sang Directus |
| `courses_tags` | ✅ | ✅ COURSES_TAGS | ❌ | ❌ | ⚠️ Junction table, chưa có service riêng |
| `modules` | ✅ | ✅ MODULES | ❌ | ❌ | ❌ Chưa có service/hook |
| `lessons` | ✅ | ✅ LESSONS | ❌ | ❌ | ❌ Chưa có service/hook |
| `documents` | ✅ | ✅ DOCUMENTS | ✅ documentService.js (Directus) | ✅ useDocuments.js | ✅ Hoàn thành |
| `lessons_documents` | ✅ | ✅ LESSONS_DOCUMENTS | ✅ (trong documentService.js) | ✅ (trong useDocuments.js) | ✅ Hoàn thành |
| `enrollments` | ✅ | ✅ ENROLLMENTS | ✅ enrollmentService.js (Mock) | ✅ useEnrollments.js | ⚠️ Cần chuyển sang Directus |
| `lesson_progress` | ✅ | ✅ LESSON_PROGRESS | ✅ lessonProgressService.js (Mock) | ✅ useLessonProgress.js | ⚠️ Cần chuyển sang Directus |
| `quizzes` | ✅ | ✅ QUIZZES | ✅ quizService.js (Mock) | ✅ useQuizzes.js | ⚠️ Cần chuyển sang Directus |
| `quiz_questions` | ✅ | ✅ QUIZ_QUESTIONS | ✅ (trong quizService.js) | ✅ (trong useQuizzes.js) | ⚠️ Cần chuyển sang Directus |
| `quiz_attempts` | ✅ | ✅ QUIZ_ATTEMPTS | ✅ quizAttemptService.js (Mock) | ✅ useQuizAttempts.js | ⚠️ Cần chuyển sang Directus |
| `learning_paths` | ✅ | ✅ LEARNING_PATHS | ✅ learningPathService.js (Mock) | ✅ useLearningPaths.js | ⚠️ Cần chuyển sang Directus |
| `learning_paths_courses` | ✅ | ✅ LEARNING_PATHS_COURSES | ✅ (trong learningPathService.js) | ✅ (trong useLearningPaths.js) | ⚠️ Cần chuyển sang Directus |
| `certificates` | ✅ | ✅ CERTIFICATES | ✅ certificateService.js (Mock) | ✅ useCertificates.js | ⚠️ Cần chuyển sang Directus |
| `certificate_templates` | ✅ | ✅ CERTIFICATE_TEMPLATES | ✅ (trong certificateService.js) | ✅ (trong useCertificates.js) | ⚠️ Cần chuyển sang Directus |

**Tổng kết:** 18/20 collections cốt lõi đã có trong constants, nhưng phần lớn đang dùng Mock data.

---

### 1.2. Collections THIẾU trong Constants (Có trong tài liệu nhưng chưa có trong code)

| Collection | Trong Tài liệu | Trong Constants | Service | Hook | Mức độ ưu tiên |
|------------|----------------|-----------------|---------|------|----------------|
| `question_bank` | ✅ | ❌ | ✅ questionBankService.js (Mock) | ✅ useQuestionBank.js | 🔴 **CAO** - Đã có service/hook nhưng thiếu constant |
| `user_notes` | ✅ | ❌ | ❌ | ❌ | 🟡 **TRUNG BÌNH** - Tính năng đã có UI (local state) |
| `lesson_comments` | ✅ | ❌ | ❌ | ❌ | 🟡 **TRUNG BÌNH** - Tính năng đã có UI (local state) |
| `course_reviews` | ✅ | ✅ | ❌ | ❌ | 🟡 **TRUNG BÌNH** - Chưa có service/hook |
| `app_settings` | ✅ | ❌ | ❌ | ❌ | 🔴 **CAO** - Cần cho cấu hình hệ thống |

**Tổng kết:** 5 collections quan trọng đang thiếu trong constants.

---

### 1.3. Collections System Extension (Không cần constant riêng)

| Collection | Trong Tài liệu | Trong Constants | Ghi chú |
|------------|----------------|-----------------|---------|
| `directus_notifications` | ✅ | ❌ | System collection, không cần constant (dùng trực tiếp) |

---

## 2. Phân tích chi tiết từng Collection thiếu

### 2.1. `question_bank` - 🔴 **CAO ƯU TIÊN**

**Tình trạng:**
- ✅ Đã có trong tài liệu
- ✅ Đã có `questionBankService.js` (Mock)
- ✅ Đã có `useQuestionBank.js` hook
- ❌ **THIẾU** trong `src/constants/collections.js`

**Tác động:**
- Service đang dùng hardcode string `'question_bank'` thay vì constant
- Vi phạm quy tắc "Always Use Constants" trong AGENTS.md

**Hành động cần thiết:**
```javascript
// Thêm vào src/constants/collections.js
QUESTION_BANK: 'question_bank',
```

---

### 2.2. `user_notes` - 🟡 **TRUNG BÌNH ƯU TIÊN**

**Tình trạng:**
- ✅ Đã có trong tài liệu với schema đầy đủ
- ✅ UI đã có trong `CourseLearningPage.jsx` (dùng local state)
- ❌ Chưa có service
- ❌ Chưa có hook
- ❌ Chưa có constant

**Chức năng hiện tại:**
- Notes được lưu trong component state (không persist)
- Có UI để thêm/sửa/xóa notes
- Có timestamp cho video notes

**Hành động cần thiết:**
1. Thêm constant: `USER_NOTES: 'user_notes'`
2. Tạo `noteService.js` với Directus SDK
3. Tạo `useNotes.js` hook
4. Cập nhật `CourseLearningPage.jsx` để dùng hook thay vì local state

---

### 2.3. `lesson_comments` - 🟡 **TRUNG BÌNH ƯU TIÊN**

**Tình trạng:**
- ✅ Đã có trong tài liệu với schema đầy đủ (hỗ trợ threaded comments)
- ✅ UI đã có trong `CourseLearningPage.jsx` (dùng local state)
- ❌ Chưa có service
- ❌ Chưa có hook
- ❌ Chưa có constant

**Chức năng hiện tại:**
- Comments được lưu trong component state (không persist)
- Có UI để thêm comments
- Chưa có tính năng reply (threaded comments)
- Chưa có tính năng mark resolved

**Hành động cần thiết:**
1. Thêm constant: `LESSON_COMMENTS: 'lesson_comments'`
2. Tạo `commentService.js` với Directus SDK
3. Tạo `useComments.js` hook
4. Cập nhật `CourseLearningPage.jsx` để dùng hook
5. Implement threaded comments (parent_id)
6. Implement resolved status

---

### 2.4. `course_reviews` - 🟡 **TRUNG BÌNH ƯU TIÊN**

**Tình trạng:**
- ✅ Đã có trong tài liệu với schema đầy đủ
- ✅ Đã có trong constants (cần kiểm tra lại)
- ❌ Chưa có service
- ❌ Chưa có hook
- ❌ Chưa có UI

**Chức năng cần thiết:**
- Học viên đánh giá khóa học sau khi hoàn thành (1-5 sao)
- Hiển thị rating trung bình trên Course Card
- Unique constraint: mỗi user chỉ review 1 lần/course

**Hành động cần thiết:**
1. Kiểm tra lại constants (có thể đã có nhưng chưa thấy trong file)
2. Tạo `reviewService.js` với Directus SDK
3. Tạo `useReviews.js` hook
4. Tạo UI review form (sau khi hoàn thành course)
5. Hiển thị reviews và rating trên CourseDetailPage

---

### 2.5. `app_settings` - 🔴 **CAO ƯU TIÊN**

**Tình trạng:**
- ✅ Đã có trong tài liệu (Singleton collection)
- ✅ Đã có `SettingsPage.jsx` trong admin
- ❌ Chưa có constant
- ❌ Chưa có service
- ❌ Chưa có hook

**Chức năng cần thiết:**
- Cấu hình toàn hệ thống (Singleton - chỉ có 1 record)
- Các settings: default_pass_score, default_max_attempts, auto_enroll_new_employees, etc.

**Hành động cần thiết:**
1. Thêm constant: `APP_SETTINGS: 'app_settings'`
2. Tạo `settingsService.js` với Directus SDK (Singleton pattern)
3. Tạo `useSettings.js` hook
4. Cập nhật `SettingsPage.jsx` để dùng hook

---

## 3. Phân tích Collections chưa có Service/Hook

### 3.1. `modules` - ❌ **THIẾU HOÀN TOÀN**

**Tình trạng:**
- ✅ Có trong tài liệu
- ✅ Có trong constants
- ❌ Chưa có service riêng
- ❌ Chưa có hook riêng

**Hiện tại:**
- Modules được lấy qua `courseService.getCourseDetail()` hoặc mock data
- Chưa có CRUD operations riêng cho modules

**Hành động cần thiết:**
1. Tạo `moduleService.js`
2. Tạo `useModules.js` hook
3. Tách logic modules ra khỏi courseService

---

### 3.2. `lessons` - ❌ **THIẾU HOÀN TOÀN**

**Tình trạng:**
- ✅ Có trong tài liệu
- ✅ Có trong constants
- ❌ Chưa có service riêng
- ❌ Chưa có hook riêng

**Hiện tại:**
- Lessons được lấy qua `courseService.getLessonDetail()` hoặc mock data
- Chưa có CRUD operations riêng cho lessons

**Hành động cần thiết:**
1. Tạo `lessonService.js`
2. Tạo `useLessons.js` hook
3. Tách logic lessons ra khỏi courseService

---

## 4. Phân tích Collections đang dùng Mock Data

### 4.1. Collections cần chuyển sang Directus SDK

| Collection | Service hiện tại | Ưu tiên |
|------------|------------------|---------|
| `tags` | Mock | 🔴 CAO - Core feature |
| `courses` | Mock | 🔴 CAO - Core feature |
| `enrollments` | Mock | 🔴 CAO - Core feature |
| `lesson_progress` | Mock | 🔴 CAO - Core feature |
| `quizzes` | Mock | 🟡 TRUNG BÌNH |
| `quiz_attempts` | Mock | 🟡 TRUNG BÌNH |
| `learning_paths` | Mock | 🟡 TRUNG BÌNH |
| `certificates` | Mock | 🟡 TRUNG BÌNH |
| `question_bank` | Mock | 🟡 TRUNG BÌNH |

**Lưu ý:** Tất cả các service Mock đều cần được chuyển sang Directus SDK để đảm bảo tính nhất quán và khả năng mở rộng.

---

## 5. Đánh giá tổng thể

### 5.1. Điểm mạnh

✅ **Collections cốt lõi đã được định nghĩa đầy đủ:**
- 18/20 collections chính đã có trong constants
- Hầu hết đã có service và hook (dù đang dùng Mock)

✅ **Cấu trúc code tốt:**
- Tuân thủ pattern Service → Hook → Component
- Có constants tập trung

✅ **Tài liệu chi tiết:**
- Schema rõ ràng trong DIRECTUS_CONFIGURATION_ANALYSIS.md
- Business rules được mô tả đầy đủ

---

### 5.2. Điểm yếu và Rủi ro

❌ **Thiếu Collections quan trọng:**
- `question_bank`: Đã có service/hook nhưng thiếu constant
- `user_notes`, `lesson_comments`: Tính năng đã có UI nhưng chưa có backend
- `app_settings`: Cần cho cấu hình hệ thống

❌ **Mock Data phổ biến:**
- 9/13 services đang dùng Mock data
- Rủi ro: Data không persist, không sync giữa sessions

❌ **Thiếu Service/Hook cho Modules và Lessons:**
- Logic đang nằm trong courseService
- Khó maintain và mở rộng

---

## 6. Khuyến nghị và Kế hoạch hành động

### 6.1. Ưu tiên CAO (Làm ngay)

1. **Thêm constants thiếu:**
   ```javascript
   // src/constants/collections.js
   QUESTION_BANK: 'question_bank',
   USER_NOTES: 'user_notes',
   LESSON_COMMENTS: 'lesson_comments',
   COURSE_REVIEWS: 'course_reviews',
   APP_SETTINGS: 'app_settings',
   ```

2. **Tạo Service/Hook cho App Settings:**
   - `settingsService.js` (Singleton pattern)
   - `useSettings.js` hook
   - Cập nhật `SettingsPage.jsx`

3. **Chuyển Core Services sang Directus:**
   - `tagService.js` → Directus SDK
   - `courseService.js` → Directus SDK
   - `enrollmentService.js` → Directus SDK
   - `lessonProgressService.js` → Directus SDK

---

### 6.2. Ưu tiên TRUNG BÌNH (Làm sau)

1. **Tạo Service/Hook cho Engagement Features:**
   - `noteService.js` + `useNotes.js`
   - `commentService.js` + `useComments.js`
   - `reviewService.js` + `useReviews.js`

2. **Tách Modules và Lessons:**
   - `moduleService.js` + `useModules.js`
   - `lessonService.js` + `useLessons.js`

3. **Chuyển các Service còn lại sang Directus:**
   - `quizService.js`
   - `quizAttemptService.js`
   - `learningPathService.js`
   - `certificateService.js`
   - `questionBankService.js`

---

### 6.3. Ưu tiên THẤP (Có thể làm sau)

1. **Tối ưu hóa:**
   - Tạo service riêng cho junction tables nếu cần
   - Refactor code để giảm duplication

---

## 7. Checklist triển khai

### Phase 1: Bổ sung Constants và Core Services (Tuần 1-2)

- [ ] Thêm 5 constants thiếu vào `collections.js`
- [ ] Tạo `settingsService.js` và `useSettings.js`
- [ ] Chuyển `tagService.js` sang Directus SDK
- [ ] Chuyển `courseService.js` sang Directus SDK
- [ ] Chuyển `enrollmentService.js` sang Directus SDK
- [ ] Chuyển `lessonProgressService.js` sang Directus SDK

### Phase 2: Engagement Features (Tuần 3-4)

- [ ] Tạo `noteService.js` và `useNotes.js`
- [ ] Tạo `commentService.js` và `useComments.js`
- [ ] Tạo `reviewService.js` và `useReviews.js`
- [ ] Cập nhật UI để dùng hooks thay vì local state

### Phase 3: Tách Modules và Lessons (Tuần 5)

- [ ] Tạo `moduleService.js` và `useModules.js`
- [ ] Tạo `lessonService.js` và `useLessons.js`
- [ ] Refactor `courseService.js` để tách logic

### Phase 4: Hoàn thiện Services (Tuần 6-7)

- [ ] Chuyển `quizService.js` sang Directus SDK
- [ ] Chuyển `quizAttemptService.js` sang Directus SDK
- [ ] Chuyển `learningPathService.js` sang Directus SDK
- [ ] Chuyển `certificateService.js` sang Directus SDK
- [ ] Chuyển `questionBankService.js` sang Directus SDK

---

## 8. Kết luận

### Tổng kết

**Collections trong tài liệu:** 20 collections chính + 1 system extension

**Collections trong constants:** 18/20 (90%)

**Collections có Service:** 13/20 (65%)

**Collections có Hook:** 13/20 (65%)

**Collections dùng Directus SDK:** 3/13 (23%) ⚠️

### Đánh giá tổng thể: **7/10**

**Điểm mạnh:**
- Cấu trúc code tốt, tuân thủ patterns
- Tài liệu chi tiết và đầy đủ
- Hầu hết collections đã được định nghĩa

**Điểm cần cải thiện:**
- Thiếu 5 constants quan trọng
- Quá nhiều Mock data (cần chuyển sang Directus)
- Thiếu service/hook cho modules và lessons
- Engagement features chưa có backend

### Khuyến nghị

Dự án đã có nền tảng tốt nhưng cần hoàn thiện:
1. **Ngay lập tức:** Thêm constants thiếu và tạo app_settings service
2. **Ngắn hạn:** Chuyển core services sang Directus SDK
3. **Trung hạn:** Implement engagement features (notes, comments, reviews)
4. **Dài hạn:** Tối ưu hóa và refactor code

---

**Người phân tích:** AI Assistant  
**Ngày:** $(date)  
**Version:** 1.0
