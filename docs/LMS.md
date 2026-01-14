# Hệ thống Quản lý Đào tạo (LMS)

## 1. Mô tả ứng dụng

### 1.1. Giới thiệu tổng quan

Hệ thống Quản lý Đào tạo (LMS) là một nền tảng đào tạo nội bộ được thiết kế để:

- Đào tạo nội bộ: Onboarding, kỹ năng, quy trình
- Chuẩn hóa kiến thức cho nhân viên trong tổ chức
- Đánh giá hiệu quả học tập

### 1.2. Đối tượng người dùng

Hệ thống được chia theo 3 tác nhân chính là: **admin**, **manager**, **employees**.

Các tác nhân sẽ tương ứng với các vai trò trong hệ thống như bên dưới:

- **Admin**: Người quản trị hệ thống, Giám đốc
- **Manager**: Trưởng phòng
- **Employees**: Nhân viên cấp cao, nhân viên, thực tập sinh

### 1.3. Công nghệ sử dụng

Hệ thống được xây dựng trên các công nghệ hiện đại, đảm bảo tính linh hoạt và khả năng mở rộng:

- **Frontend**: React 19 kết hợp với Vite để tối ưu tốc độ phát triển và hiệu năng
- **UI/UX**: Sử dụng thư viện Ant Design 5 với bộ nhận diện thương hiệu màu đỏ đặc trưng (#ea4544)
- **Backend (Headless CMS)**: Directus 13 đóng vai trò là "trái tim" quản lý dữ liệu và API
- **State Management**: TanStack Query (React Query) xử lý việc đồng bộ và caching dữ liệu server
- **Authentication**: Tích hợp SAML Single Sign-On (SSO), cho phép đăng nhập tập trung và an toàn

## 2. Tính năng và triển khai

### 2.1. Authentication & User Management

**Đăng nhập đa phương thức:**

- Email/Password
- OAuth 2.0 (Google)

**User Profile:**

- Quản lý thông tin cá nhân (Avatar, Phone)
- Xem Phòng ban (Department) và Chức vụ của mình

**Password Policy:**

- Cấu hình policy trong Directus Project Settings

### 2.2. Quản lý Đào tạo (Training Management)

**Course Management**

- **Dữ liệu lõi**: Tên, Mô tả, Thời lượng (có thể nhập thủ công hoặc tự động tính từ tổng thời lượng các bài học), Độ khó, Thumbnail
- **Phân loại & Tìm kiếm:**
    - Tags: Gắn thẻ khóa học (Technical, Soft-skill...) qua quan hệ Many-to-Many
- **Department Filtering:**
    - Public Course: Trường `department_filter` rỗng → Tất cả nhân viên đều thấy
    - Private Course: Chỉ định cụ thể Departments được phép truy cập
- **Trạng thái**: Draft (soạn thảo) → Published (phát hành) → Archived (lưu trữ)

**Module & Lesson Structure**

- Tổ chức nội dung: Cấu trúc phân cấp Course → Modules → Lessons
- Sắp xếp: Kéo thả (Drag & Drop) để sắp xếp thứ tự bài học (Field `sort`)

**Lesson Types & Streaming**

- **Video Lesson:**
    - YouTube: Embed video từ YouTube (chỉ cần paste URL)
    - Google Drive: Embed video từ Google Drive (cần set permission "Anyone with the link can view")
- **Rich Content**: Soạn thảo bài học dạng Article với trình soạn thảo WYSIWYG của Directus
- **Resources**: Đính kèm file tài liệu (PDF, PPTX) từ thư viện file

### 2.3. Assessment & Testing

**Quizzes**

- **Cấu hình:**
    - Time Limit: Giới hạn thời gian làm bài
    - Pass Score: Điểm sàn để đạt (ví dụ: 80/100)
    - Max Attempts: Giới hạn số lần làm lại
    - Randomize: Trộn câu hỏi mỗi lần làm

- **Question Bank:**
    - Hỗ trợ Single Choice, Multiple Choice, Text Input
    - Quản lý đáp án đúng và giải thích (Explanation)

**Grading Logic**

- Tự động chấm điểm cho câu hỏi trắc nghiệm
- Lưu lịch sử từng lần làm bài (Attempt History)
- Tính trạng thái Passed / Failed dựa trên Pass Score

### 2.4. Learning Progress & Analytics

**Employee Dashboard**

- **My Learning**: Danh sách khóa học đang tham gia (Active Enrollments)
- **Progress Tracking:**
    - % hoàn thành khóa học
    - Trạng thái từng bài học (Completed/In-progress)
    - Resume: Nút "Học tiếp" đưa về đúng bài học đang xem dở

**Management Reporting (Directus Insights)**

Sử dụng Directus Insights để xây dựng Dashboard trực quan:

- **Department Overview**: Biểu đồ tiến độ học tập của từng phòng ban
- **Course Performance**: Top khóa học phổ biến, tỷ lệ hoàn thành thấp (cần cải thiện)
- **At-Risk Learners**: Danh sách nhân viên trễ hạn hoặc fail nhiều lần

### 2.5. Enrollment & Progress Tracking (Đăng ký & Theo dõi tiến độ)

**Đăng ký khóa học**

- Employee có thể tự đăng ký khóa học (nếu public hoặc được assign)
- Manager/Admin có thể assign khóa học cho nhân viên
- Hệ thống hỗ trợ deadline cho enrollment

**Theo dõi tiến độ**

- Hệ thống tự động theo dõi tiến độ học tập (% hoàn thành)
- Hệ thống lưu vị trí xem video (resume watching)
- Cập nhật trạng thái lesson (Completed/In-progress)

### 2.6. Certificate Management (Quản lý Chứng chỉ)

**Tự động tạo chứng chỉ:**

- Khi hoàn thành khóa học (100%) và pass quiz
- Lưu dạng PDF

**Xem và download:**

- Employee xem danh sách chứng chỉ
- Download PDF chứng chỉ

### 2.7. Automation & Notifications

Tận dụng Directus Flows cho các quy trình tự động:

**Enrollment Notification:**

- **Trigger**: Khi có Record mới trong `enrollments`
- **Action**: Gửi Email thông báo "Bạn được phân công khóa học mới"

**Deadline Reminder:**

- **Trigger**: Schedule (Cron) chạy hàng ngày
- **Condition**: Check `due_date` sắp đến
- **Action**: Gửi Email nhắc nhở

**Certificate Issuance:**

- **Trigger**: Khi `progress_percentage` đạt 100% VÀ `quiz_passed` = true
- **Action:**
    - Generate PDF chứng chỉ (từ Template)
    - Lưu vào collection `certificates`
    - Gửi Email đính kèm chứng chỉ cho User

**Course Duration Auto-Calculation:**

- **Trigger**: Khi có thay đổi trong `lessons` (create/update/delete) hoặc thay đổi `duration` của lesson
- **Condition**: `courses.duration` = null (chưa được nhập thủ công)
- **Action:**
    - Tính tổng: `SUM(lessons.duration WHERE lessons.module_id IN (SELECT id FROM modules WHERE course_id = {course_id}))`
    - Cập nhật `courses.duration` với giá trị tính được
    - Chỉ cập nhật nếu `courses.duration` = null (không ghi đè giá trị nhập thủ công)

### 2.8. Reporting & Analytics (Báo cáo & Phân tích)

**Manager**

- Xem báo cáo tiến độ phòng ban
- Xem tiến độ từng nhân viên trong team
- Assign khóa học cho team members

**Admin**

- Báo cáo toàn công ty
- Completion rate, average score
- At-risk learners
- Course performance analytics

### 2.9. System Admin & Configuration

**RBAC (Role-Based Access Control):**

- Cấu hình chi tiết quyền xem/sửa theo từng field
- Quy tắc Custom Permissions (như đã định nghĩa trong User Roles)

**File Management:**

- Quản lý tập trung tại Directus Files
- Phân quyền folder (VD: Folder "Internal Training" chỉ Admin thấy)

### 2.10. Learning Paths (Lộ trình học tập)

**Tạo lộ trình học tập:**

- Gộp nhiều khóa học thành một path
- Tự động enroll khi assign path
- Mandatory/Optional paths

### 2.11. Learner Engagement Features (Tính năng Tương tác)

**Hệ thống Ghi chú (My Notes):**

- Học viên ghi chú cá nhân khi học bài (Video/Article).
- Gắn timestamp với video để jump đến đúng đoạn cần nhớ.
- Xem lại toàn bộ ghi chú của mình ở trang Dashboard.

**Thảo luận Bài học (Lesson Discussions):**

- Q&A ngay trong bài học.
- Threaded comments (trả lời bình luận).
- Giảng viên/Mentor có thể mark "Resolved" cho câu hỏi.

**Đánh giá Khóa học (Course Reviews):**

- Học viên đánh giá 1-5 sao sau khi hoàn thành.
- Viết nhận xét công khai.
- Hiển thị rating trung bình trên Course Card.

## 3. Quy trình hoạt động

_(Phần này sẽ được bổ sung chi tiết trong tương lai)_

## 4. Cấu trúc CSDL

### 4.1. Users (Directus System)

Hệ thống sử dụng collection `directus_users` mặc định của Directus để quản lý người dùng.

### 4.2. Master Data Collections

#### Tags

Tags để phân loại và tìm kiếm khóa học.

| Field        | Type      | Required | Default   | Description                                           | Interface | Display  |
| ------------ | --------- | -------- | --------- | ----------------------------------------------------- | --------- | -------- |
| id           | uuid      | Yes      | Auto      | Primary key                                           | -         | -        |
| name         | string    | Yes      | -         | Tên tag (VD: "Technical", "Soft-skill", "Compliance") | input     | raw      |
| color        | string    | No       | "#3B82F6" | Màu hiển thị tag (hex color)                          | color     | color    |
| icon         | string    | No       | null      | Icon name (lucide-react icon)                         | icon      | icon     |
| date_created | timestamp | Yes      | Auto      | Ngày tạo                                              | datetime  | datetime |

**Indexes:**

- `name` (unique)

**Relations:**

- `courses.tags` → `tags` (Many-to-Many qua `courses_tags`)

**Business Rules:**

- `name` phải unique
- Chỉ Admin/HR mới có quyền Create/Update/Delete

### 4.3. Core LMS Collections

#### Courses

| Field               | Type                 | Required | Default | Description                                                                                       | Interface                 | Display        |
| ------------------- | -------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------- | -------------- |
| id                  | uuid                 | Yes      | Auto    | Primary key                                                                                       | -                         | -              |
| status              | string               | Yes      | "draft" | Trạng thái: "draft", "published", "archived"                                                      | select-dropdown           | labels         |
| title               | string               | Yes      | -       | Tên khóa học                                                                                      | input                     | raw            |
| description         | text                 | No       | null    | Mô tả khóa học (HTML/WYSIWYG)                                                                     | wysiwyg                   | formatted-text |
| learning_objectives | text                 | No       | null    | Mục tiêu học tập (Markdown)                                                                       | markdown                  | formatted-text |
| duration            | integer              | No       | null    | Thời lượng khóa học (phút). Có thể nhập thủ công hoặc tự động tính từ tổng thời lượng các bài học | input                     | raw            |
| difficulty          | string               | No       | null    | Độ khó: "beginner", "intermediate", "advanced"                                                    | select-dropdown           | labels         |
| thumbnail           | file (image)         | No       | null    | Ảnh đại diện khóa học                                                                             | file-image                | image          |
| department_filter   | JSON array           | No       | null    | Danh sách department codes (VD: ["it", "sales"])                                                  | tags hoặc input-multiline | raw            |
| sort                | integer              | No       | 0       | Thứ tự sắp xếp (manual sort)                                                                      | input                     | raw            |
| user_created        | M2O → directus_users | Yes      | Auto    | Người tạo                                                                                         | user                      | user           |
| date_created        | timestamp            | Yes      | Auto    | Ngày tạo                                                                                          | datetime                  | datetime       |
| user_updated        | M2O → directus_users | No       | null    | Người cập nhật                                                                                    | user                      | user           |
| date_updated        | timestamp            | Yes      | Auto    | Ngày cập nhật                                                                                     | datetime                  | datetime       |

**Indexes:**

- `status`
- `difficulty`
- `user_created`

**Relations:**

- `tags` → `tags` (Many-to-Many qua `courses_tags`)
- `modules` → `modules` (One-to-Many)
- `enrollments` → `enrollments` (One-to-Many)
- `quizzes` → `quizzes` (One-to-Many)

**Business Rules:**

- `status = "draft"`: Chỉ Admin/Manager tạo mới thấy, user không thấy
- `status = "published"`: User thấy (nếu thỏa department filter)
- `status = "archived"`: Không nhận enrollment mới, nhưng vẫn lưu lịch sử
- `department_filter = null` hoặc `[]`: Public (tất cả users thấy)
- `department_filter = ["it", "sales"]`: Chỉ users thuộc departments đó thấy
- Filter Logic: Frontend hoặc Custom Endpoint filter courses dựa trên department code của user
- Manager chỉ được tạo courses với `department_filter` chứa department của mình (validate ở Frontend/Custom Endpoint)
- **Duration Calculation:**
    - `duration` có thể được nhập thủ công hoặc tính tự động
    - **Tự động tính**: `duration = SUM(lessons.duration)` - Tổng thời lượng tất cả các bài học trong khóa học
    - Khi thêm/sửa/xóa lesson hoặc thay đổi `duration` của lesson, có thể tự động cập nhật `duration` của course (qua Directus Flow hoặc Custom Endpoint)
    - Nếu `duration` được nhập thủ công, giá trị này sẽ được ưu tiên và không bị ghi đè bởi tính toán tự động
    - Frontend có thể hiển thị cả hai: giá trị nhập thủ công (nếu có) hoặc giá trị tính tự động (nếu `duration = null`)

#### Modules

| Field        | Type                 | Required | Default     | Description                      | Interface       | Display        |
| ------------ | -------------------- | -------- | ----------- | -------------------------------- | --------------- | -------------- |
| id           | uuid                 | Yes      | Auto        | Primary key                      | -               | -              |
| status       | string               | Yes      | "published" | Trạng thái: "published", "draft" | select-dropdown | labels         |
| course_id    | M2O → courses        | Yes      | -           | Khóa học chứa module này         | select-dropdown | related-values |
| title        | string               | Yes      | -           | Tên module                       | input           | raw            |
| description  | text                 | No       | null        | Mô tả module (Markdown)          | markdown        | formatted-text |
| sort         | integer              | No       | 0           | Thứ tự hiển thị trong khóa học   | input           | raw            |
| user_created | M2O → directus_users | Yes      | Auto        | Người tạo                        | user            | user           |
| date_created | timestamp            | Yes      | Auto        | Ngày tạo                         | datetime        | datetime       |

**Indexes:**

- `course_id`
- `sort`

**Relations:**

- `course_id` → `courses` (Many-to-One)
- `lessons` → `lessons` (One-to-Many)

**Business Rules:**

- `sort` dùng để sắp xếp thứ tự modules trong khóa học
- Cascade delete: Xóa course → xóa tất cả modules

#### Lessons

| Field           | Type                 | Required | Default     | Description                                              | Interface       | Display        |
| --------------- | -------------------- | -------- | ----------- | -------------------------------------------------------- | --------------- | -------------- |
| id              | uuid                 | Yes      | Auto        | Primary key                                              | -               | -              |
| status          | string               | Yes      | "published" | Trạng thái: "published", "draft"                         | select-dropdown | labels         |
| module_id       | M2O → modules        | Yes      | -           | Module chứa lesson này                                   | select-dropdown | related-values |
| title           | string               | Yes      | -           | Tên bài học                                              | input           | raw            |
| type            | string               | Yes      | -           | Loại bài học: "video", "article", "file", "link", "quiz" | select-dropdown | labels         |
| content         | text (markdown)      | No       | null        | Nội dung bài học (nếu type = "article")                  | markdown        | formatted-text |
| video_url       | string               | No       | null        | URL video (YouTube hoặc Google Drive URL)                | input           | raw            |
| video_provider  | string               | No       | null        | Provider: "youtube", "google_drive"                      | select-dropdown | labels         |
| video_id        | string               | No       | null        | Video ID (YouTube ID hoặc Google Drive File ID)          | input           | raw            |
| external_link   | string               | No       | null        | Link ngoài (nếu type = "link")                           | input           | raw            |
| file_attachment | file                 | No       | null        | File đính kèm (PDF, PPTX, nếu type = "file")             | file            | file           |
| duration        | integer              | No       | null        | Thời lượng bài học (phút)                                | input           | raw            |
| is_required     | boolean              | No       | true        | Bài học bắt buộc hay không                               | boolean         | boolean        |
| sort            | integer              | No       | 0           | Thứ tự hiển thị trong module                             | input           | raw            |
| user_created    | M2O → directus_users | Yes      | Auto        | Người tạo                                                | user            | user           |
| date_created    | timestamp            | Yes      | Auto        | Ngày tạo                                                 | datetime        | datetime       |

**Indexes:**

- `module_id`
- `type`

**Relations:**

- `module_id` → `modules` (Many-to-One)
- `lesson_progress` → `lesson_progress` (One-to-Many)
- `quizzes` → `quizzes` (One-to-Many)

**Business Rules:**

- `type = "video"`: Cần có `video_url` và `video_provider`
- `type = "article"`: Cần có `content` (markdown)
- `type = "file"`: Cần có `file_attachment`
- `type = "link"`: Cần có `external_link`
- `sort` dùng để sắp xếp thứ tự lessons trong module
- Cascade delete: Xóa module → xóa tất cả lessons

### 4.4. Learning Progress Collections

#### Enrollments

| Field               | Type                 | Required | Default      | Description                                                   | Interface       | Display             |
| ------------------- | -------------------- | -------- | ------------ | ------------------------------------------------------------- | --------------- | ------------------- |
| id                  | uuid                 | Yes      | Auto         | Primary key                                                   | -               | -                   |
| user_id             | M2O → directus_users | Yes      | -            | User đăng ký                                                  | user            | user                |
| course_id           | M2O → courses        | Yes      | -            | Khóa học được đăng ký                                         | select-dropdown | related-values      |
| assigned_by         | M2O → directus_users | No       | null         | Người assign (nếu được assign)                                | user            | user                |
| assignment_type     | string               | No       | "individual" | Loại assign: "individual", "department", "auto"               | select-dropdown | labels              |
| status              | string               | Yes      | "assigned"   | Trạng thái: "assigned", "in_progress", "completed", "expired" | select-dropdown | labels              |
| progress_percentage | integer              | No       | 0            | % hoàn thành (0-100)                                          | input           | progress-bar        |
| started_at          | timestamp            | No       | null         | Thời điểm bắt đầu học                                         | datetime        | datetime            |
| completed_at        | timestamp            | No       | null         | Thời điểm hoàn thành                                          | datetime        | datetime            |
| due_date            | datetime             | No       | null         | Deadline hoàn thành                                           | datetime        | datetime (relative) |
| date_created        | timestamp            | Yes      | Auto         | Ngày tạo enrollment                                           | datetime        | datetime            |

**Indexes:**

- `[user_id, course_id]` (composite, unique) - Mỗi user chỉ enroll 1 lần/course
- `status`
- `due_date`

**Relations:**

- `user_id` → `directus_users` (Many-to-One)
- `course_id` → `courses` (Many-to-One)
- `assigned_by` → `directus_users` (Many-to-One)
- `lesson_progress` → `lesson_progress` (One-to-Many)

**Business Rules:**

- Unique constraint: `(user_id, course_id)` - Mỗi user chỉ enroll 1 lần/course
- `status = "assigned"`: Mới được assign, chưa bắt đầu
- `status = "in_progress"`: Đã bắt đầu học
- `status = "completed"`: Đã hoàn thành (`progress_percentage = 100`)
- `status = "expired"`: Quá deadline
- `progress_percentage` được tính tự động dựa trên `lesson_progress`
- `due_date` có thể được set khi assign hoặc tính tự động từ course duration

#### Lesson Progress

Tiến độ học tập của từng bài học.

| Field                 | Type                 | Required | Default | Description                       | Interface       | Display        |
| --------------------- | -------------------- | -------- | ------- | --------------------------------- | --------------- | -------------- |
| id                    | uuid                 | Yes      | Auto    | Primary key                       | -               | -              |
| user_id               | M2O → directus_users | Yes      | -       | User học bài                      | user            | user           |
| lesson_id             | M2O → lessons        | Yes      | -       | Bài học                           | select-dropdown | related-values |
| enrollment_id         | M2O → enrollments    | Yes      | -       | Enrollment liên quan              | select-dropdown | related-values |
| completion_percentage | integer              | No       | 0       | % hoàn thành bài học (0-100)      | input           | progress-bar   |
| is_completed          | boolean              | No       | false   | Đã hoàn thành chưa                | boolean         | boolean        |
| completed_at          | timestamp            | No       | null    | Thời điểm hoàn thành              | datetime        | datetime       |
| last_position         | integer              | No       | 0       | Vị trí xem video cuối cùng (giây) | input           | raw            |
| time_spent            | integer              | No       | 0       | Tổng thời gian học (giây)         | input           | raw            |
| date_updated          | timestamp            | Yes      | Auto    | Ngày cập nhật                     | datetime        | datetime       |

**Indexes:**

- `[user_id, lesson_id]` (composite, unique) - Mỗi user chỉ có 1 progress record/lesson
- `enrollment_id`
- `is_completed`

**Relations:**

- `user_id` → `directus_users` (Many-to-One)
- `lesson_id` → `lessons` (Many-to-One)
- `enrollment_id` → `enrollments` (Many-to-One)

**Business Rules:**

- Unique constraint: `(user_id, lesson_id)` - Mỗi user chỉ có 1 progress record/lesson
- `is_completed = true` khi `completion_percentage >= 100`
- `last_position` dùng để resume video (tiếp tục xem từ vị trí đã xem)
- `time_spent` được track tự động khi user xem video/article
- Khi `is_completed = true`, tự động update `enrollment.progress_percentage`

### 4.5. Assessment Collections

#### Quizzes

| Field               | Type                 | Required | Default | Description                               | Interface       | Display        |
| ------------------- | -------------------- | -------- | ------- | ----------------------------------------- | --------------- | -------------- |
| id                  | uuid                 | Yes      | Auto    | Primary key                               | -               | -              |
| title               | string               | Yes      | -       | Tên bài kiểm tra                          | input           | raw            |
| description         | text                 | No       | null    | Mô tả bài kiểm tra                        | input-multiline | formatted-text |
| lesson_id           | M2O → lessons        | No       | null    | Bài học liên quan (nếu quiz sau lesson)   | select-dropdown | related-values |
| course_id           | M2O → courses        | No       | null    | Khóa học liên quan (nếu quiz cuối course) | select-dropdown | related-values |
| pass_score          | integer              | Yes      | 70      | Điểm đạt (0-100)                          | slider (0-100)  | raw            |
| time_limit          | integer              | No       | null    | Giới hạn thời gian (phút)                 | input           | raw            |
| randomize_questions | boolean              | No       | false   | Trộn câu hỏi mỗi lần làm                  | boolean         | boolean        |
| max_attempts        | integer              | No       | 3       | Số lần làm tối đa                         | input           | raw            |
| user_created        | M2O → directus_users | Yes      | Auto    | Người tạo                                 | user            | user           |
| date_created        | timestamp            | Yes      | Auto    | Ngày tạo                                  | datetime        | datetime       |

**Indexes:**

- `lesson_id`
- `course_id`

**Relations:**

- `lesson_id` → `lessons` (Many-to-One)
- `course_id` → `courses` (Many-to-One)
- `quiz_questions` → `quiz_questions` (One-to-Many)
- `quiz_attempts` → `quiz_attempts` (One-to-Many)

**Business Rules:**

- Quiz có thể gắn với `lesson_id` (quiz sau lesson) hoặc `course_id` (quiz cuối course) hoặc cả hai
- `pass_score`: Điểm tối thiểu để đạt (VD: 70 = 70%)
- `time_limit = null`: Không giới hạn thời gian
- `max_attempts = 0`: Không giới hạn số lần làm
- `randomize_questions = true`: Trộn thứ tự câu hỏi mỗi lần làm

#### Quiz Questions

| Field    | Type          | Required | Default | Description                                | Interface                        | Display        |
| -------- | ------------- | -------- | ------- | ------------------------------------------ | -------------------------------- | -------------- |
| id       | uuid          | Yes      | Auto    | Primary key                                | -                                | -              |
| quiz_id  | M2O → quizzes | Yes      | -       | Bài kiểm tra                               | select-dropdown                  | related-values |
| question | text          | Yes      | -       | Nội dung câu hỏi                           | input-multiline                  | formatted-text |
| type     | string        | Yes      | -       | Loại câu hỏi: "single", "multiple", "text" | select-dropdown                  | labels         |
| options  | json          | Yes      | -       | Các lựa chọn (JSON format)                 | list (repeater) hoặc code-editor | raw            |
| points   | integer       | Yes      | 1       | Điểm số câu hỏi                            | input                            | raw            |
| sort     | integer       | No       | 0       | Thứ tự hiển thị                            | input                            | raw            |

**Indexes:**

- `quiz_id`
- `sort`

**Relations:**

- `quiz_id` → `quizzes` (Many-to-One)

**Business Rules:**

- `type = "single"`: Single choice (1 đáp án đúng)
- `type = "multiple"`: Multiple choice (nhiều đáp án đúng)
- `type = "text"`: Text input (tự do nhập)
- `options` format (JSON):
    ```json
    {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "correct": ["A"] // hoặc ["A", "B"] cho multiple choice
    }
    ```
- `sort` dùng để sắp xếp thứ tự câu hỏi
- Cascade delete: Xóa quiz → xóa tất cả questions

#### Question Bank

Ngân hàng câu hỏi dùng chung (độc lập với Quiz).

| Field        | Type                 | Required | Default  | Description                                | Interface       | Display        |
| ------------ | -------------------- | -------- | -------- | ------------------------------------------ | --------------- | -------------- |
| id           | uuid                 | Yes      | Auto     | Primary key                                | -               | -              |
| question     | text                 | Yes      | -        | Nội dung câu hỏi                           | input-multiline | formatted-text |
| type         | string               | Yes      | -        | Loại câu hỏi: "single", "multiple", "text" | select-dropdown | labels         |
| options      | json                 | Yes      | -        | Các lựa chọn (JSON format)                 | code-editor     | raw            |
| explanation  | text                 | No       | null     | Giải thích đáp án                          | textarea        | formatted-text |
| points       | integer              | Yes      | 1        | Điểm số mặc định                           | input           | raw            |
| difficulty   | string               | No       | "medium" | Độ khó: "easy", "medium", "hard"           | select-dropdown | labels         |
| category     | string               | No       | null     | Danh mục: "programming", "database", etc.  | select-dropdown | labels         |
| tags         | json                 | No       | null     | Tags (Array of strings)                    | tags            | tags           |
| status       | string               | Yes      | "active" | Trạng thái: "active", "inactive"           | select-dropdown | labels         |
| user_created | M2O → directus_users | Yes      | Auto     | Người tạo                                  | user            | user           |
| date_created | timestamp            | Yes      | Auto     | Ngày tạo                                   | datetime        | datetime       |

**Business Rules:**

- Collection này **độc lập** hoàn toàn với `quizzes`.
- Khi chọn câu hỏi từ Bank vào Quiz, hệ thống sẽ **copy** dữ liệu sang `quiz_questions` (không tham chiếu).
- `options` format giống như `quiz_questions`.

#### Quiz Attempts

Lần làm bài kiểm tra của user.

| Field         | Type                 | Required | Default | Description                       | Interface       | Display        |
| ------------- | -------------------- | -------- | ------- | --------------------------------- | --------------- | -------------- |
| id            | uuid                 | Yes      | Auto    | Primary key                       | -               | -              |
| user_id       | M2O → directus_users | Yes      | -       | User làm bài                      | user            | user           |
| quiz_id       | M2O → quizzes        | Yes      | -       | Bài kiểm tra                      | select-dropdown | related-values |
| enrollment_id | M2O → enrollments    | No       | null    | Enrollment liên quan              | select-dropdown | related-values |
| answers       | json                 | Yes      | -       | Câu trả lời (JSON format)         | code-editor     | raw            |
| score         | integer              | No       | null    | Điểm số (0-100)                   | input           | raw            |
| is_passed     | boolean              | No       | null    | Đã đạt chưa (score >= pass_score) | boolean         | boolean        |
| started_at    | timestamp            | Yes      | Auto    | Thời điểm bắt đầu                 | datetime        | datetime       |
| submitted_at  | timestamp            | No       | null    | Thời điểm nộp bài                 | datetime        | datetime       |

**Indexes:**

- `user_id`
- `quiz_id`
- `enrollment_id`
- `is_passed`

**Relations:**

- `user_id` → `directus_users` (Many-to-One)
- `quiz_id` → `quizzes` (Many-to-One)
- `enrollment_id` → `enrollments` (Many-to-One)

**Business Rules:**

- `answers` format (JSON):
    ```json
    {
        "question_id_1": "A",
        "question_id_2": ["A", "B"],
        "question_id_3": "Text answer"
    }
    ```
- `score` được tính tự động khi submit (dựa trên `quiz_questions.correct`)
- `is_passed = true` khi `score >= quiz.pass_score`
- `submitted_at = null`: Chưa nộp bài (đang làm)
- Mỗi user có thể có nhiều attempts cho cùng 1 quiz (tùy `max_attempts`)

### 4.6. Learning Paths Collections

#### Learning Paths

Lộ trình học tập (chuỗi khóa học).

| Field        | Type                 | Required | Default | Description                 | Interface       | Display        |
| ------------ | -------------------- | -------- | ------- | --------------------------- | --------------- | -------------- |
| id           | uuid                 | Yes      | Auto    | Primary key                 | -               | -              |
| title        | string               | Yes      | -       | Tên lộ trình                | input           | raw            |
| description  | text                 | No       | null    | Mô tả lộ trình              | input-multiline | formatted-text |
| is_mandatory | boolean              | No       | false   | Lộ trình bắt buộc hay không | boolean         | boolean        |
| user_created | M2O → directus_users | Yes      | Auto    | Người tạo                   | user            | user           |
| date_created | timestamp            | Yes      | Auto    | Ngày tạo                    | datetime        | datetime       |

**Indexes:**

- `is_mandatory`
- `user_created`

**Fields (Nếu cần filter theo department/position):**

| Field             | Type       | Required | Default | Description                                                          |
| ----------------- | ---------- | -------- | ------- | -------------------------------------------------------------------- |
| department_filter | JSON array | No       | null    | Danh sách department codes (VD: ["it", "sales"])                     |
| position_filter   | JSON array | No       | null    | Danh sách position codes (VD: ["intern-backend", "junior-frontend"]) |

**Relations:**

- `courses` → `courses` (Many-to-Many qua `learning_paths_courses`)

**Business Rules:**

- `is_mandatory = true`: Lộ trình bắt buộc, user phải hoàn thành
- `is_mandatory = false`: Lộ trình tự chọn
- `courses` (M2M): Danh sách khóa học trong lộ trình, có thể sắp xếp thứ tự
- Khi assign learning path cho user, tự động enroll tất cả courses trong path
- `department_filter` và `position_filter`: Dùng để auto-assign learning path khi tạo user mới (lấy từ External System)

### 4.7. Certificates & Notifications Collections

#### Certificates

Chứng chỉ hoàn thành khóa học.

| Field              | Type                 | Required | Default | Description           | Interface       | Display         |
| ------------------ | -------------------- | -------- | ------- | --------------------- | --------------- | --------------- |
| id                 | uuid                 | Yes      | Auto    | Primary key           | -               | -               |
| user_id            | M2O → directus_users | Yes      | -       | User nhận chứng chỉ   | user            | user            |
| course_id          | M2O → courses        | Yes      | -       | Khóa học              | select-dropdown | related-values  |
| certificate_number | string               | Yes      | Auto    | Số chứng chỉ (unique) | input           | formatted-value |
| file               | file (PDF)           | Yes      | -       | File PDF chứng chỉ    | file            | file            |
| issued_at          | timestamp            | Yes      | Auto    | Ngày cấp              | datetime        | datetime        |

**Indexes:**

- `user_id`
- `course_id`
- `certificate_number` (unique)

**Relations:**

- `user_id` → `directus_users` (Many-to-One)
- `course_id` → `courses` (Many-to-One)

**Business Rules:**

- `certificate_number` được generate tự động (format: "CERT-{year}-{uuid}")
- `file` được generate tự động từ template khi user hoàn thành course và pass quiz
- Unique constraint: `(user_id, course_id)` - Mỗi user chỉ nhận 1 chứng chỉ/course
- Chứng chỉ được tạo tự động qua Flow khi:
    - `enrollment.progress_percentage = 100`
    - VÀ `quiz_attempts.is_passed = true` (nếu có quiz)

#### Certificate Templates

Template PDF cho chứng chỉ.

| Field     | Type       | Required | Default | Description          | Interface | Display |
| --------- | ---------- | -------- | ------- | -------------------- | --------- | ------- |
| id        | uuid       | Yes      | Auto    | Primary key          | -         | -       |
| name      | string     | Yes      | -       | Tên template         | input     | raw     |
| file      | file (PDF) | Yes      | -       | File PDF template    | file      | file    |
| is_active | boolean    | Yes      | true    | Template đang active | boolean   | boolean |

**Indexes:**

- `is_active`

**Business Rules:**

- Chỉ 1 template có `is_active = true` tại một thời điểm
- Template PDF chứa placeholders (VD: `{user_name}`, `{course_title}`, `{date}`) để fill khi generate

#### Notifications

**Lưu ý**: Sử dụng Directus system collection `directus_notifications` thay vì tạo collection custom. Collection này đã được extend với các custom fields.

**Fields System (có sẵn, không thể sửa):**

| Field      | Type                 | Required | Default | Description                                              | Interface       | Display        |
| ---------- | -------------------- | -------- | ------- | -------------------------------------------------------- | --------------- | -------------- |
| id         | uuid                 | Yes      | Auto    | Primary key                                              | -               | -              |
| timestamp  | timestamp            | Yes      | Auto    | Thời điểm tạo thông báo                                  | datetime        | datetime       |
| status     | string               | Yes      | "inbox" | Trạng thái: "inbox" (chưa đọc), "archived" (đã đọc)      | select-dropdown | labels         |
| recipient  | M2O → directus_users | Yes      | -       | Người nhận thông báo                                     | user            | user           |
| sender     | M2O → directus_users | No       | null    | Người gửi (system user hoặc user gửi)                    | user            | user           |
| subject    | string               | Yes      | -       | Tiêu đề thông báo                                        | input           | raw            |
| message    | text                 | Yes      | -       | Nội dung thông báo                                       | input-multiline | formatted-text |
| collection | string               | No       | null    | Collection liên quan (VD: "enrollments", "certificates") | input           | raw            |
| item       | string               | No       | null    | ID của item trong collection đó                          | input           | raw            |

**Fields Custom (thêm mới để extend):**

| Field    | Type   | Required | Default  | Description                                                               | Interface       | Display |
| -------- | ------ | -------- | -------- | ------------------------------------------------------------------------- | --------------- | ------- |
| app      | string | Yes      | "lms"    | Nền tảng: "lms", "hr", "project", etc.                                    | select-dropdown | labels  |
| type     | string | No       | "info"   | Loại thông báo trong app: "enrollment", "deadline", "certificate", "info" | select-dropdown | labels  |
| link     | string | No       | null     | URL để navigate (VD: "/courses/123")                                      | input           | raw     |
| icon     | string | No       | null     | Icon name (lucide-react)                                                  | input           | raw     |
| priority | string | No       | "normal" | Mức độ ưu tiên: "low", "normal", "high"                                   | select-dropdown | labels  |

> **Lưu ý quan trọng**: Field `app` là bắt buộc để phân biệt notifications từ các nền tảng khác nhau khi Directus được dùng chung cho nhiều hệ thống.

**Indexes:**

- `recipient`
- `status`
- `collection`
- `app` (custom field) - Quan trọng: Để filter notifications theo nền tảng
- `[recipient, app, status]` (composite index) - Khuyến nghị: Tối ưu query performance
- `type` (custom field)

**Relations:**

- `recipient` → `directus_users` (Many-to-One)
- `sender` → `directus_users` (Many-to-One)

**Business Rules:**

**Status Management:**

- `status = "inbox"`: Thông báo chưa đọc (hiển thị badge)
- `status = "archived"`: Thông báo đã đọc
- Mark as read: Update `status = "archived"`

**Sender:**

- `sender = null` hoặc system user: Thông báo tự động từ hệ thống
- `sender = user_id`: Thông báo từ user cụ thể (VD: Manager assign course)

**Collection & Item:**

- `collection + item`: Link trực tiếp đến enrollment/certificate để navigate
- VD: `collection = "enrollments"`, `item = "enrollment-uuid"`

**Type:**

- `type` dùng để phân loại và filter thông báo
- Các loại: "enrollment", "deadline", "certificate", "info"

**Thông báo được tạo tự động qua Flow:**

- Khi có enrollment mới → `collection = "enrollments"`, `item = enrollment_id`, `app = "lms"`
- Khi deadline sắp đến → `type = "deadline"`, `app = "lms"`
- Khi nhận chứng chỉ → `collection = "certificates"`, `item = certificate_id`, `app = "lms"`

**Multi-Platform Support:**

- Field `app` bắt buộc để phân biệt notifications từ các nền tảng khác nhau
- Luôn filter theo `app = "lms"` trong mọi query của LMS
- Có thể query cross-platform nếu cần (bỏ filter app)

**API Endpoint:**

- Sử dụng `/notifications` thay vì `/items/notifications`
- Directus SDK: `directus.request(readNotifications({ filter: { app: { _eq: 'lms' }, ... } }))`

### 4.8. Engagement Collections

#### User Notes

Ghi chú cá nhân của học viên.

| Field        | Type                 | Required | Default | Description            | Interface | Display  |
| ------------ | -------------------- | -------- | ------- | ---------------------- | --------- | -------- |
| id           | uuid                 | Yes      | Auto    | Primary key            | -         | -        |
| user_id      | M2O → directus_users | Yes      | -       | User ghi chú           | user      | user     |
| lesson_id    | M2O → lessons        | Yes      | -       | Bài học                | select    | related  |
| content      | text                 | Yes      | -       | Nội dung ghi chú       | textarea  | raw      |
| timestamp    | integer              | No       | null    | Thời gian video (giây) | input     | raw      |
| date_created | timestamp            | Yes      | Auto    | Ngày tạo               | datetime  | datetime |
| date_updated | timestamp            | Yes      | Auto    | Ngày cập nhật          | datetime  | datetime |

**Indexes:**

- `user_id`
- `lesson_id`

#### Lesson Comments

Bình luận và thảo luận trong bài học.

| Field        | Type                  | Required | Default | Description             | Interface | Display  |
| ------------ | --------------------- | -------- | ------- | ----------------------- | --------- | -------- |
| id           | uuid                  | Yes      | Auto    | Primary key             | -         | -        |
| user_id      | M2O → directus_users  | Yes      | -       | User bình luận          | user      | user     |
| lesson_id    | M2O → lessons         | Yes      | -       | Bài học                 | select    | related  |
| parent_id    | M2O → lesson_comments | No       | null    | Comment cha (để reply)  | select    | related  |
| content      | text                  | Yes      | -       | Nội dung bình luận      | textarea  | raw      |
| is_resolved  | boolean               | No       | false   | Đã giải quyết (cho Q&A) | boolean   | boolean  |
| date_created | timestamp             | Yes      | Auto    | Ngày tạo                | datetime  | datetime |
| date_updated | timestamp             | Yes      | Auto    | Ngày cập nhật           | datetime  | datetime |

**Indexes:**

- `lesson_id`
- `parent_id`

#### Course Reviews

Đánh giá khóa học từ học viên.

| Field        | Type                 | Required | Default | Description         | Interface | Display  |
| ------------ | -------------------- | -------- | ------- | ------------------- | --------- | -------- |
| id           | uuid                 | Yes      | Auto    | Primary key         | -         | -        |
| user_id      | M2O → directus_users | Yes      | -       | User đánh giá       | user      | user     |
| course_id    | M2O → courses        | Yes      | -       | Khóa học            | select    | related  |
| rating       | integer              | Yes      | -       | Điểm đánh giá (1-5) | slider    | star     |
| comment      | text                 | No       | null    | Nhận xét            | textarea  | raw      |
| is_public    | boolean              | No       | true    | Hiển thị công khai  | boolean   | boolean  |
| date_created | timestamp            | Yes      | Auto    | Ngày tạo            | datetime  | datetime |

**Indexes:**

- `course_id`
- `[user_id, course_id]` (unique)
