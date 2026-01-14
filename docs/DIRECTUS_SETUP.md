# Hướng Dẫn Cấu Hình Directus cho LMS Project

Tài liệu này hướng dẫn chi tiết cách cấu hình Directus Backend (Headless CMS) để tương thích hoàn toàn với LMS Frontend (React/Vite).

## 1. Yêu Cầu Hệ Thống

- **Directus Version**: Khuyến nghị v10.x hoặc mới hơn (SDK v20 được sử dụng ở frontend).
- **Database**: PostgreSQL / MySQL (Tùy chọn theo Directus).

## 2. Cấu Hình Environment Variables (.env)

Tại phía **Directus (Backend)**, cần cấu hình các biến môi trường sau trong file `.env` của server Directus:

```bash
# Security & CORS
CORS_ENABLED=true
CORS_ORIGIN=true  # Hoặc set cụ thể domain frontend: https://lms-app.com
CORS_METHODS=GET,POST,PATCH,DELETE
CORS_HEADERS=Content-Type,Authorization

# Authentication
AUTH_DISABLE_DEFAULT=false
# Đảm bảo token có thời gian sống phù hợp
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="7d"
```

## 3. Cấu Hình Collections (Database Schema)

### 3.1. System & Users

#### `directus_users`

- Frontend sử dụng các field mặc định: `first_name`, `last_name`, `email`, `password`, `avatar`, `title`.

#### `thong_tin_nhan_su` (Profile mở rộng)

- **Fields**: `ho_ten` (String), `ngay_sinh` (Date), `so_dien_thoai` (String), `chuc_vu` (String), `phong_ban` (String), `user` (M2O -> directus_users).

### 3.2. Core LMS Collections (Khóa học)

#### `tags` (Nhãn)

- **Name**: `tags`
- **Fields**:
    - `name` (String) - Required, Unique
    - `color` (String) - Color picker (hex)

#### `courses` (Khóa học)

- **Name**: `courses`
- **Fields**:
    - `title` (String) - Required
    - `slug` (String) - Unique (Auto-generate from title)
    - `description` (Text) - WYSIWYG
    - `thumbnail` (Image)
    - `difficulty` (String) - Dropdown: `beginner`, `intermediate`, `advanced`
    - `duration` (Integer) - Tổng phút
    - `status` (String) - Dropdown: `published`, `draft`, `archived`
    - `tags` (M2M) - Many-to-Many tới `tags`
    - `user_created` (M2O -> directus_users) - System field (Giảng viên)

#### `modules` (Chương học)

- **Name**: `modules`
- **Fields**:
    - `title` (String) - Required
    - `description` (Text)
    - `course_id` (M2O -> courses) - Chọn "Show Interface" trong Course
    - `sort` (Integer) - Để sắp xếp thứ tự
    - `status` (String) - `published`, `draft`

#### `lessons` (Bài học)

- **Name**: `lessons`
- **Fields**:
    - `title` (String) - Required
    - `type` (String) - Dropdown: `video`, `text`, `quiz`
    - `content` (Text) - WYSIWYG (Cho bài học dạng text)
    - `video_url` (String) - (Cho bài học dạng video)
    - `duration` (Integer) - Phút
    - `module_id` (M2O -> modules)
    - `sort` (Integer)
    - `status` (String) - `published`, `draft`
    - `is_preview` (Boolean) - Cho phép học thử

### 3.3. Learning Process (Quá trình học)

#### `enrollments` (Đăng ký học)

- **Name**: `enrollments`
- **Fields**:
    - `user_id` (M2O -> directus_users)
    - `course_id` (M2O -> courses)
    - `status` (String) - `active`, `completed`, `dropped`
    - `progress` (Integer) - % hoàn thành (0-100)
    - `completed_at` (DateTime)

#### `lesson_progress` (Tiến độ bài học)

- **Name**: `lesson_progress`
- **Fields**:
    - `user_id` (M2O -> directus_users)
    - `lesson_id` (M2O -> lessons)
    - `is_completed` (Boolean)
    - `last_watched_position` (Integer) - Giây (cho video)

### 3.4. Quiz & Exam System (Thi & Trắc nghiệm)

#### `questions` (Ngân hàng câu hỏi gốc)

- **Name**: `questions`
- **Fields**:
    - `content` (Text) - Câu hỏi (WYSIWYG)
    - `type` (String) - `single`, `multiple`, `text`
    - `options` (JSON) - Lưu mảng các lựa chọn (VD: `[{id: 1, text: "A", is_correct: true}]`)
    - `explanation` (Text) - Giải thích đáp án
    - `difficulty` (String) - `easy`, `medium`, `hard`
    - `category` (String) - Dropdown/Tag
    - `tags` (M2M -> tags)

#### `quizzes` (Bài kiểm tra)

- **Name**: `quizzes`
- **Fields**:
    - `title` (String)
    - `description` (Text)
    - `pass_score` (Integer) - Điểm đạt (VD: 80%)
    - `time_limit` (Integer) - Phút (0 = không giới hạn)
    - `lesson_id` (M2O -> lessons) - Nếu bài kiểm tra gắn vào bài học
    - `course_id` (M2O -> courses) - Nếu là bài thi cuối khóa

#### `quiz_questions` (Câu hỏi trong bài thi)

- **Name**: `quiz_questions`
- **Fields**:
    - `quiz_id` (M2O -> quizzes)
    - `question` (Text) - Copy từ ngân hàng câu hỏi
    - `options` (JSON)
    - `points` (Integer) - Điểm số cho câu này
    - `sort` (Integer)

#### `quiz_attempts` (Lịch sử làm bài)

- **Name**: `quiz_attempts`
- **Fields**:
    - `user_id` (M2O -> directus_users)
    - `quiz_id` (M2O -> quizzes)
    - `score` (Integer) - Điểm đạt được
    - `is_passed` (Boolean)
    - `started_at` (DateTime)
    - `finished_at` (DateTime)
    - `answers` (JSON) - Lưu câu trả lời của user

### 3.5. Certificates (Chứng chỉ)

#### `certificate_templates` (Mẫu chứng chỉ)

- **Name**: `certificate_templates`
- **Fields**:
    - `name` (String)
    - `background_image` (Image)
    - `config` (JSON) - Tọa độ in tên, ngày tháng...

#### `certificates` (Chứng chỉ đã cấp)

- **Name**: `certificates`
- **Fields**:
    - `code` (String) - Mã chứng chỉ (Unique)
    - `user_id` (M2O -> directus_users)
    - `course_id` (M2O -> courses)
    - `issued_at` (DateTime)
    - `file_url` (String) - Link file PDF (nếu generate static)

## 4. Roles & Permissions (Quyền hạn)

### 1. Admin

- Full Access.

### 2. Learner (Học viên)

- **Read Access**: `courses` (published), `modules`, `lessons`, `quizzes` (khi đã enroll).
- **Create/Update**:
    - `enrollments`: Create (Đăng ký học).
    - `lesson_progress`: Create/Update (Của chính mình).
    - `quiz_attempts`: Create (Nộp bài).
    - `directus_users`: Update (Profile bản thân).

## 5. Kết Nối Frontend

Sau khi tạo các collection, hãy cập nhật file `src/constants/collections.js` nếu tên collection bạn đặt khác với mặc định.

**File `.env` (Vite):**

```bash
VITE_DIRECTUS_URL=https://your-directus-domain.com
```
