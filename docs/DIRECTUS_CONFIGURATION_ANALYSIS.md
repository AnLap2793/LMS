# Phân tích và Hướng dẫn Cấu hình Directus cho LMS

## 1. Tổng quan Phân tích

### 1.1. Trạng thái hiện tại

| Component                                 | Trạng thái      | Ghi chú                |
| ----------------------------------------- | --------------- | ---------------------- |
| **userService.js**                        | Directus SDK    | Hoạt động với Directus |
| **courseService.js**                      | Mock Data       | Chưa kết nối Directus  |
| **enrollmentService.js**                  | Mock Data       | Chưa kết nối Directus  |
| **Tags, Modules, Lessons, Quizzes, etc.** | Chưa có service | Cần tạo mới            |

### 1.2. Collections đã định nghĩa vs Services đã tạo

| Collection               | Constant                             | Service                  | Hook                       | Trạng thái        |
| ------------------------ | ------------------------------------ | ------------------------ | -------------------------- | ----------------- |
| `directus_users`         | `COLLECTIONS.USERS`                  | `userService.js`         | `useUsers.js`              | Hoàn thành        |
| `tags`                   | `COLLECTIONS.TAGS`                   | Chưa có                  | Chưa có                    | Cần tạo           |
| `courses`                | `COLLECTIONS.COURSES`                | Mock                     | `useCourses.js` (mock)     | Cần cập nhật      |
| `courses_tags`           | `COLLECTIONS.COURSES_TAGS`           | Chưa có                  | Chưa có                    | Junction table    |
| `modules`                | `COLLECTIONS.MODULES`                | Chưa có                  | Chưa có                    | Cần tạo           |
| `lessons`                | `COLLECTIONS.LESSONS`                | Chưa có                  | Chưa có                    | Cần tạo           |
| `documents`              | `COLLECTIONS.DOCUMENTS`              | Chưa có                  | Chưa có                    | Cần tạo           |
| `lessons_documents`      | `COLLECTIONS.LESSONS_DOCUMENTS`      | Chưa có                  | Chưa có                    | Junction table    |
| `enrollments`            | `COLLECTIONS.ENROLLMENTS`            | Mock                     | `useEnrollments.js` (mock) | Cần cập nhật      |
| `lesson_progress`        | `COLLECTIONS.LESSON_PROGRESS`        | Chưa có                  | Chưa có                    | Cần tạo           |
| `quizzes`                | `COLLECTIONS.QUIZZES`                | Chưa có                  | Chưa có                    | Cần tạo           |
| `quiz_questions`         | `COLLECTIONS.QUIZ_QUESTIONS`         | Chưa có                  | Chưa có                    | Cần tạo           |
| `question_bank`          | `COLLECTIONS.QUESTION_BANK`          | `questionBankService.js` | `useQuestionBank.js`       | Hoàn thành (Mock) |
| `quiz_attempts`          | `COLLECTIONS.QUIZ_ATTEMPTS`          | `quizAttemptService.js`  | `useQuizAttempts.js`       | Hoàn thành (Mock) |
| `learning_paths`         | `COLLECTIONS.LEARNING_PATHS`         | Chưa có                  | Chưa có                    | Cần tạo           |
| `learning_paths_courses` | `COLLECTIONS.LEARNING_PATHS_COURSES` | Chưa có                  | Chưa có                    | Junction table    |
| `certificates`           | `COLLECTIONS.CERTIFICATES`           | Chưa có                  | Chưa có                    | Cần tạo           |
| `certificate_templates`  | `COLLECTIONS.CERTIFICATE_TEMPLATES`  | Chưa có                  | Chưa có                    | Cần tạo           |
| `user_notes`             | `COLLECTIONS.USER_NOTES`             | Chưa có                  | Chưa có                    | Cần tạo           |
| `lesson_comments`        | `COLLECTIONS.LESSON_COMMENTS`        | Chưa có                  | Chưa có                    | Cần tạo           |
| `course_reviews`         | `COLLECTIONS.COURSE_REVIEWS`         | Chưa có                  | Chưa có                    | Cần tạo           |
| `directus_notifications` | -                                    | -                        | -                          | System Extension  |

---

## 2. Cấu hình Collections trong Directus

### 2.1. Tags

```
Collection: tags
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface    | Options                    |
| -------------- | --------- | ------------ | -------------------------- |
| `id`           | uuid      | -            | Primary Key, Auto          |
| `name`         | string    | input        | Required, Max 100          |
| `color`        | string    | select-color | Default: `#3B82F6`         |
| `icon`         | string    | input        | Optional, lucide icon name |
| `date_created` | timestamp | datetime     | Auto, Hidden               |

**Lưu ý:**

- Thêm unique index cho `name`
- Permissions: Admin/Manager có full CRUD, Learner chỉ Read

---

### 2.2. Courses

```
Collection: courses
Primary Key: uuid (auto-generated)
```

| Field                 | Type        | Interface            | Options                                                     |
| --------------------- | ----------- | -------------------- | ----------------------------------------------------------- |
| `id`                  | uuid        | -                    | Primary Key, Auto                                           |
| `status`              | string      | select-dropdown      | Options: `draft`, `published`, `archived`. Default: `draft` |
| `title`               | string      | input                | Required, Max 255                                           |
| `description`         | text        | input-rich-text-html | Optional, WYSIWYG                                           |
| `learning_objectives` | text        | input-rich-text-md   | Optional, Markdown                                          |
| `duration`            | integer     | input                | Optional, Minutes                                           |
| `difficulty`          | string      | select-dropdown      | Options: `beginner`, `intermediate`, `advanced`             |
| `thumbnail`           | uuid (file) | file-image           | Optional, Image only                                        |
| `department_filter`   | json        | tags                 | Optional, Array of department codes                         |
| `sort`                | integer     | input                | Default: 0                                                  |
| `user_created`        | uuid        | user                 | Auto, M2O -> directus_users                                 |
| `date_created`        | timestamp   | datetime             | Auto                                                        |
| `user_updated`        | uuid        | user                 | Auto, M2O -> directus_users                                 |
| `date_updated`        | timestamp   | datetime             | Auto                                                        |

**Relations:**

- `tags`: M2M -> `tags` via `courses_tags`
- `modules`: O2M -> `modules`
- `enrollments`: O2M -> `enrollments`

---

### 2.3. Courses_Tags (Junction Table)

```
Collection: courses_tags
Primary Key: auto-increment integer
```

| Field        | Type    | Interface | Options           |
| ------------ | ------- | --------- | ----------------- |
| `id`         | integer | -         | Primary Key, Auto |
| `courses_id` | uuid    | -         | M2O -> courses    |
| `tags_id`    | uuid    | -         | M2O -> tags       |

**Lưu ý:** Đây là junction table tự động được tạo khi setup M2M relation.

---

### 2.4. Modules

```
Collection: modules
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface           | Options                                             |
| -------------- | --------- | ------------------- | --------------------------------------------------- |
| `id`           | uuid      | -                   | Primary Key, Auto                                   |
| `status`       | string    | select-dropdown     | Options: `draft`, `published`. Default: `published` |
| `course_id`    | uuid      | select-dropdown-m2o | Required, M2O -> courses                            |
| `title`        | string    | input               | Required, Max 255                                   |
| `description`  | text      | input-rich-text-md  | Optional                                            |
| `sort`         | integer   | input               | Default: 0, For drag-drop ordering                  |
| `user_created` | uuid      | user                | Auto                                                |
| `date_created` | timestamp | datetime            | Auto                                                |

**Relations:**

- `course_id`: M2O -> `courses`
- `lessons`: O2M -> `lessons`

---

### 2.5. Lessons

```
Collection: lessons
Primary Key: uuid (auto-generated)
```

| Field             | Type        | Interface           | Options                                                             |
| ----------------- | ----------- | ------------------- | ------------------------------------------------------------------- |
| `id`              | uuid        | -                   | Primary Key, Auto                                                   |
| `status`          | string      | select-dropdown     | Options: `draft`, `published`. Default: `published`                 |
| `module_id`       | uuid        | select-dropdown-m2o | Required, M2O -> modules                                            |
| `title`           | string      | input               | Required, Max 255                                                   |
| `type`            | string      | select-dropdown     | Required. Options: `video`, `article`, `file`, `link`, `quiz`       |
| `content`         | text        | input-rich-text-md  | Optional, For article type                                          |
| `video_url`       | string      | input               | Optional, YouTube hoặc Google Drive URL                             |
| `video_provider`  | string      | select-dropdown     | Options: `youtube`, `google_drive`                                  |
| `video_id`        | string      | input               | Optional, Extracted from URL (YouTube ID hoặc Google Drive File ID) |
| `external_link`   | string      | input               | Optional, For link type                                             |
| `file_attachment` | uuid (file) | file                | Optional, deprecated (use documents M2M via lessons_documents)      |
| `duration`        | integer     | input               | Optional, Minutes                                                   |
| `is_required`     | boolean     | boolean             | Default: true                                                       |
| `sort`            | integer     | input               | Default: 0                                                          |
| `user_created`    | uuid        | user                | Auto                                                                |
| `date_created`    | timestamp   | datetime            | Auto                                                                |

**Validation Rules (Conditional):**

- `type = 'video'`: `video_url` required
- `type = 'article'`: `content` required
- `type = 'file'`: Cần có ít nhất 1 document trong `lessons_documents` (M2M)
- `type = 'link'`: `external_link` required

**Relations:**

- `module_id`: M2O -> `modules`
- `documents`: M2M -> `documents` via `lessons_documents` (thư viện tài liệu)

---

### 2.6. Documents (Thư viện Tài liệu)

```
Collection: documents
Primary Key: uuid (auto-generated)
```

| Field          | Type        | Interface       | Options                                                     |
| -------------- | ----------- | --------------- | ----------------------------------------------------------- |
| `id`           | uuid        | -               | Primary Key, Auto                                           |
| `type`         | string      | select-dropdown | Required. Options: `file`, `url`. Default: `file`           |
| `title`        | string      | input           | Required, Max 255                                           |
| `description`  | text        | textarea        | Optional                                                    |
| `file`         | uuid (file) | file            | Conditional (required if type = 'file')                     |
| `url`          | string      | input           | Conditional (required if type = 'url')                      |
| `url_type`     | string      | select-dropdown | Options: `google_doc`, `google_sheet`, `notion`, `external` |
| `tags`         | json        | tags            | Optional, Array of strings for filtering                    |
| `status`       | string      | select-dropdown | Options: `active`, `archived`. Default: `active`            |
| `user_created` | uuid        | user            | Auto                                                        |
| `date_created` | timestamp   | datetime        | Auto                                                        |
| `date_updated` | timestamp   | datetime        | Auto                                                        |

**Relations:**

- `lessons`: M2M -> `lessons` via `lessons_documents`

**Validation Rules:**

- `type = 'file'`: `file` required
- `type = 'url'`: `url` required

**Business Rules:**

- Thư viện tài liệu tập trung cho toàn hệ thống LMS
- Một tài liệu có thể được tái sử dụng cho nhiều bài học khác nhau
- Hỗ trợ cả file upload và URL bên ngoài (Google Docs, Notion, etc.)
- `status = 'archived'`: Tài liệu bị ẩn khỏi thư viện nhưng vẫn hiển thị trong các bài học đã đính kèm
- `tags` dùng để filter và tìm kiếm tài liệu

**URL Types:**

| url_type       | Description      | Example URL                                       |
| -------------- | ---------------- | ------------------------------------------------- |
| `google_doc`   | Google Docs      | `https://docs.google.com/document/d/xxx/edit`     |
| `google_sheet` | Google Sheets    | `https://docs.google.com/spreadsheets/d/xxx/edit` |
| `notion`       | Notion page      | `https://notion.so/xxx`                           |
| `external`     | Any external URL | `https://example.com/resource`                    |

---

### 2.7. Lessons Documents (Junction Table)

```
Collection: lessons_documents
Primary Key: auto-increment integer
```

| Field          | Type    | Interface           | Options                                |
| -------------- | ------- | ------------------- | -------------------------------------- |
| `id`           | integer | -                   | Primary Key, Auto                      |
| `lessons_id`   | uuid    | select-dropdown-m2o | Required, M2O -> lessons               |
| `documents_id` | uuid    | select-dropdown-m2o | Required, M2O -> documents             |
| `sort`         | integer | input               | Default: 0, For ordering within lesson |

**Indexes:**

- `[lessons_id, documents_id]` (composite, unique)

**Relations:**

- `lessons_id`: M2O -> `lessons`
- `documents_id`: M2O -> `documents`

**Business Rules:**

- Junction table cho M2M relation giữa lessons và documents
- `sort` dùng để sắp xếp thứ tự tài liệu trong bài học
- Unique constraint: Mỗi document chỉ được đính kèm 1 lần/lesson

**Video URL Formats:**

| Provider     | URL Format                                                                  | Video ID   |
| ------------ | --------------------------------------------------------------------------- | ---------- |
| YouTube      | `https://www.youtube.com/watch?v=VIDEO_ID` hoặc `https://youtu.be/VIDEO_ID` | `VIDEO_ID` |
| Google Drive | `https://drive.google.com/file/d/FILE_ID/view`                              | `FILE_ID`  |

**Lưu ý Google Drive:**

- File video trên Google Drive cần được set permission là **"Anyone with the link can view"**
- Để embed video Google Drive, sử dụng URL: `https://drive.google.com/file/d/{FILE_ID}/preview`
- Google Drive hỗ trợ các định dạng: MP4, MOV, AVI, WMV, MKV

**Helper function để extract Video ID:**

```javascript
// utils/videoHelper.js
export const extractVideoId = (url, provider) => {
    if (!url) return null;

    if (provider === 'youtube') {
        // YouTube: youtube.com/watch?v=ID hoặc youtu.be/ID
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
    }

    if (provider === 'google_drive') {
        // Google Drive: drive.google.com/file/d/ID/view
        const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) return match[1];
    }

    return null;
};

export const getEmbedUrl = (videoId, provider) => {
    if (!videoId) return null;

    if (provider === 'youtube') {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    if (provider === 'google_drive') {
        return `https://drive.google.com/file/d/${videoId}/preview`;
    }

    return null;
};
```

---

### 2.6. Enrollments

```
Collection: enrollments
Primary Key: uuid (auto-generated)
```

| Field                 | Type      | Interface           | Options                                                                         |
| --------------------- | --------- | ------------------- | ------------------------------------------------------------------------------- |
| `id`                  | uuid      | -                   | Primary Key, Auto                                                               |
| `user_id`             | uuid      | select-dropdown-m2o | Required, M2O -> directus_users                                                 |
| `course_id`           | uuid      | select-dropdown-m2o | Required, M2O -> courses                                                        |
| `assigned_by`         | uuid      | select-dropdown-m2o | Optional, M2O -> directus_users                                                 |
| `assignment_type`     | string    | select-dropdown     | Options: `individual`, `department`, `auto`. Default: `individual`              |
| `status`              | string    | select-dropdown     | Options: `assigned`, `in_progress`, `completed`, `expired`. Default: `assigned` |
| `progress_percentage` | integer   | slider              | Default: 0, Range: 0-100                                                        |
| `started_at`          | timestamp | datetime            | Optional                                                                        |
| `completed_at`        | timestamp | datetime            | Optional                                                                        |
| `due_date`            | datetime  | datetime            | Optional                                                                        |
| `date_created`        | timestamp | datetime            | Auto                                                                            |

**Unique Constraint:** `(user_id, course_id)` - Mỗi user chỉ enroll 1 lần/course

---

### 2.7. Lesson_Progress

```
Collection: lesson_progress
Primary Key: uuid (auto-generated)
```

| Field                   | Type      | Interface           | Options                               |
| ----------------------- | --------- | ------------------- | ------------------------------------- |
| `id`                    | uuid      | -                   | Primary Key, Auto                     |
| `user_id`               | uuid      | select-dropdown-m2o | Required, M2O -> directus_users       |
| `lesson_id`             | uuid      | select-dropdown-m2o | Required, M2O -> lessons              |
| `enrollment_id`         | uuid      | select-dropdown-m2o | Required, M2O -> enrollments          |
| `completion_percentage` | integer   | slider              | Default: 0, Range: 0-100              |
| `is_completed`          | boolean   | boolean             | Default: false                        |
| `completed_at`          | timestamp | datetime            | Optional                              |
| `last_position`         | integer   | input               | Default: 0, Video position in seconds |
| `time_spent`            | integer   | input               | Default: 0, Total time in seconds     |
| `date_updated`          | timestamp | datetime            | Auto                                  |

**Unique Constraint:** `(user_id, lesson_id)` - Mỗi user chỉ có 1 progress record/lesson

---

### 2.8. Quizzes

```
Collection: quizzes
Primary Key: uuid (auto-generated)
```

| Field                 | Type      | Interface           | Options                             |
| --------------------- | --------- | ------------------- | ----------------------------------- |
| `id`                  | uuid      | -                   | Primary Key, Auto                   |
| `title`               | string    | input               | Required, Max 255                   |
| `description`         | text      | textarea            | Optional                            |
| `lesson_id`           | uuid      | select-dropdown-m2o | Optional, M2O -> lessons            |
| `course_id`           | uuid      | select-dropdown-m2o | Optional, M2O -> courses            |
| `pass_score`          | integer   | slider              | Required, Default: 70, Range: 0-100 |
| `time_limit`          | integer   | input               | Optional, Minutes                   |
| `randomize_questions` | boolean   | boolean             | Default: false                      |
| `max_attempts`        | integer   | input               | Default: 3. 0 = unlimited           |
| `user_created`        | uuid      | user                | Auto                                |
| `date_created`        | timestamp | datetime            | Auto                                |

---

### 2.9. Quiz_Questions

```
Collection: quiz_questions
Primary Key: uuid (auto-generated)
```

| Field         | Type    | Interface           | Options                                         |
| ------------- | ------- | ------------------- | ----------------------------------------------- |
| `id`          | uuid    | -                   | Primary Key, Auto                               |
| `quiz_id`     | uuid    | select-dropdown-m2o | Required, M2O -> quizzes                        |
| `question`    | text    | textarea            | Required                                        |
| `type`        | string  | select-dropdown     | Required. Options: `single`, `multiple`, `text` |
| `options`     | json    | code                | Required, See format below                      |
| `explanation` | text    | textarea            | Optional                                        |
| `points`      | integer | input               | Default: 1                                      |
| `sort`        | integer | input               | Default: 0                                      |

**Options JSON Format:**

```json
{
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text",
    "correct": ["A"] // Array of correct answer keys
}
```

---

### 2.10. Question_Bank

```
Collection: question_bank
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface       | Options                                                     |
| -------------- | --------- | --------------- | ----------------------------------------------------------- |
| `id`           | uuid      | -               | Primary Key, Auto                                           |
| `question`     | text      | textarea        | Required                                                    |
| `type`         | string    | select-dropdown | Required. Options: `single`, `multiple`, `text`             |
| `options`      | json      | code            | Required for non-text types                                 |
| `explanation`  | text      | textarea        | Optional                                                    |
| `points`       | integer   | input           | Default: 1                                                  |
| `difficulty`   | string    | select-dropdown | Options: `easy`, `medium`, `hard`                           |
| `category`     | string    | select-dropdown | Options: `programming`, `database`, `design`, `soft_skills` |
| `tags`         | json      | tags            | Optional                                                    |
| `status`       | string    | select-dropdown | Options: `active`, `inactive`. Default: `active`            |
| `user_created` | uuid      | user            | Auto                                                        |
| `date_created` | timestamp | datetime        | Auto                                                        |

**Lưu ý:**

- Collection này độc lập với `quizzes`.
- Khi thêm vào quiz, dữ liệu sẽ được copy sang `quiz_questions`.

---

### 2.11. Quiz_Attempts

```
Collection: quiz_attempts
Primary Key: uuid (auto-generated)
```

| Field           | Type      | Interface           | Options                           |
| --------------- | --------- | ------------------- | --------------------------------- |
| `id`            | uuid      | -                   | Primary Key, Auto                 |
| `user_id`       | uuid      | select-dropdown-m2o | Required, M2O -> directus_users   |
| `quiz_id`       | uuid      | select-dropdown-m2o | Required, M2O -> quizzes          |
| `enrollment_id` | uuid      | select-dropdown-m2o | Optional, M2O -> enrollments      |
| `answers`       | json      | code                | Required, User answers            |
| `score`         | integer   | input               | Optional, Calculated after submit |
| `is_passed`     | boolean   | boolean             | Optional, Calculated              |
| `started_at`    | timestamp | datetime            | Auto                              |
| `submitted_at`  | timestamp | datetime            | Optional, Set when submitted      |

---

### 2.12. Learning_Paths

```
Collection: learning_paths
Primary Key: uuid (auto-generated)
```

| Field               | Type      | Interface | Options           |
| ------------------- | --------- | --------- | ----------------- |
| `id`                | uuid      | -         | Primary Key, Auto |
| `title`             | string    | input     | Required          |
| `description`       | text      | textarea  | Optional          |
| `is_mandatory`      | boolean   | boolean   | Default: false    |
| `department_filter` | json      | tags      | Optional          |
| `position_filter`   | json      | tags      | Optional          |
| `user_created`      | uuid      | user      | Auto              |
| `date_created`      | timestamp | datetime  | Auto              |

---

### 2.13. Learning_Paths_Courses (Junction Table)

```
Collection: learning_paths_courses
Primary Key: auto-increment integer
```

| Field              | Type    | Interface | Options               |
| ------------------ | ------- | --------- | --------------------- |
| `id`               | integer | -         | Primary Key, Auto     |
| `learning_path_id` | uuid    | -         | M2O -> learning_paths |
| `course_id`        | uuid    | -         | M2O -> courses        |

---

### 2.14. Certificates

```
Collection: certificates
Primary Key: uuid (auto-generated)
```

| Field                | Type        | Interface           | Options                          |
| -------------------- | ----------- | ------------------- | -------------------------------- |
| `id`                 | uuid        | -                   | Primary Key, Auto                |
| `user_id`            | uuid        | select-dropdown-m2o | Required, M2O -> directus_users  |
| `course_id`          | uuid        | select-dropdown-m2o | Required, M2O -> courses         |
| `certificate_number` | string      | input               | Required, Auto-generated, Unique |
| `file`               | uuid (file) | file                | Required, PDF                    |
| `issued_at`          | timestamp   | datetime            | Auto                             |

**Unique Constraint:** `certificate_number`

---

### 2.15. Certificate_Templates

```
Collection: certificate_templates
Primary Key: uuid (auto-generated)
```

| Field       | Type        | Interface | Options                |
| ----------- | ----------- | --------- | ---------------------- |
| `id`        | uuid        | -         | Primary Key, Auto      |
| `name`      | string      | input     | Required               |
| `file`      | uuid (file) | file      | Required, PDF template |
| `is_active` | boolean     | boolean   | Default: true          |

---

### 2.16. User_Notes

```
Collection: user_notes
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface           | Options                              |
| -------------- | --------- | ------------------- | ------------------------------------ |
| `id`           | uuid      | -                   | Primary Key, Auto                    |
| `user_id`      | uuid      | select-dropdown-m2o | Required, M2O -> directus_users      |
| `lesson_id`    | uuid      | select-dropdown-m2o | Required, M2O -> lessons             |
| `content`      | text      | textarea            | Required                             |
| `timestamp`    | integer   | input               | Optional, Video timestamp in seconds |
| `date_created` | timestamp | datetime            | Auto                                 |
| `date_updated` | timestamp | datetime            | Auto                                 |

**Lưu ý:**

- Dùng để học viên ghi chú cá nhân trong bài học.
- `timestamp` dùng cho bài học dạng Video để jump đến đúng đoạn cần ghi chú.

---

### 2.17. Lesson_Comments

```
Collection: lesson_comments
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface           | Options                          |
| -------------- | --------- | ------------------- | -------------------------------- |
| `id`           | uuid      | -                   | Primary Key, Auto                |
| `user_id`      | uuid      | select-dropdown-m2o | Required, M2O -> directus_users  |
| `lesson_id`    | uuid      | select-dropdown-m2o | Required, M2O -> lessons         |
| `parent_id`    | uuid      | select-dropdown-m2o | Optional, M2O -> lesson_comments |
| `content`      | text      | textarea            | Required                         |
| `is_resolved`  | boolean   | boolean             | Default: false (For Q&A)         |
| `date_created` | timestamp | datetime            | Auto                             |
| `date_updated` | timestamp | datetime            | Auto                             |

**Relations:**

- `parent_id`: Self-reference để tạo threaded comments (trả lời comment).

---

### 2.18. Course_Reviews

```
Collection: course_reviews
Primary Key: uuid (auto-generated)
```

| Field          | Type      | Interface           | Options                         |
| -------------- | --------- | ------------------- | ------------------------------- |
| `id`           | uuid      | -                   | Primary Key, Auto               |
| `user_id`      | uuid      | select-dropdown-m2o | Required, M2O -> directus_users |
| `course_id`    | uuid      | select-dropdown-m2o | Required, M2O -> courses        |
| `rating`       | integer   | star-rating         | Required, Range: 1-5            |
| `comment`      | text      | textarea            | Optional                        |
| `is_public`    | boolean   | boolean             | Default: true                   |
| `date_created` | timestamp | datetime            | Auto                            |

**Unique Constraint:** `(user_id, course_id)` - Mỗi user chỉ review 1 lần/course.

---

### 2.19. Notifications (System Collection Extension)

```
Collection: directus_notifications
```

**Custom Fields (Add to existing system collection):**

| Field      | Type   | Interface       | Options                                                                   |
| ---------- | ------ | --------------- | ------------------------------------------------------------------------- |
| `app`      | string | select-dropdown | Required. Options: `lms`, `hr`, `project`. Default: `lms`                 |
| `type`     | string | select-dropdown | Options: `enrollment`, `deadline`, `certificate`, `info`. Default: `info` |
| `link`     | string | input           | Optional, URL for navigation                                              |
| `icon`     | string | input           | Optional, Lucide icon name                                                |
| `priority` | string | select-dropdown | Options: `low`, `normal`, `high`. Default: `normal`                       |

**Lưu ý:**

- Field `app` là bắt buộc để phân biệt notifications từ các hệ thống khác nhau (nếu dùng chung Directus).
- Sử dụng endpoint `/notifications` của Directus API.

---

## 3. Sự khác biệt giữa Mock Data và Directus API

### 3.1. Cấu trúc Relations

#### Mock Data (hiện tại):

```javascript
// courses.js - Tags được embed trực tiếp
{
  id: '1',
  title: 'Onboarding cho Nhân viên mới',
  tags: [{ id: '1', name: 'Onboarding', color: '#52c41a' }], // Embedded
}
```

#### Directus API (cần chuyển đổi):

```javascript
// Directus trả về M2M relations qua junction table
{
  id: '1',
  title: 'Onboarding cho Nhân viên mới',
  tags: [
    {
      id: 1,           // Junction table ID
      courses_id: '1', // Course UUID
      tags_id: {       // Related tag object (if expanded)
        id: '1',
        name: 'Onboarding',
        color: '#52c41a'
      }
    }
  ]
}
```

### 3.2. Cách Query đúng trong Directus SDK

```javascript
// Để lấy courses với tags đầy đủ:
const courses = await directus.request(
    readItems(COLLECTIONS.COURSES, {
        fields: [
            '*',
            'tags.tags_id.*', // M2M: courses -> courses_tags -> tags
            'user_created.first_name',
            'user_created.last_name',
        ],
        filter: { status: { _eq: 'published' } },
    })
);

// Transform response để match với UI expectations:
const transformedCourses = courses.map(course => ({
    ...course,
    tags: course.tags?.map(t => t.tags_id) || [], // Flatten M2M
}));
```

### 3.3. Enrollment với nested Course:

```javascript
// Mock data:
{
  id: 'e1',
  course: { id: '1', title: 'Onboarding' }, // Embedded
}

// Directus query:
const enrollments = await directus.request(
  readItems(COLLECTIONS.ENROLLMENTS, {
    fields: [
      '*',
      'course_id.*',     // M2O expansion
      'course_id.tags.tags_id.*', // Nested M2M
      'user_id.first_name',
      'user_id.last_name',
    ],
  })
);

// Transform:
const transformed = enrollments.map(e => ({
  ...e,
  course: e.course_id, // Rename for UI compatibility
}));
```

---

## 4. Các bước cần thực hiện

### 4.1. Cấu hình Directus (Backend)

#### Bước 1: Tạo Collections

1. Truy cập Directus Admin Panel
2. Vào **Settings > Data Model**
3. Tạo các collections theo thứ tự sau (để đảm bảo relations đúng):

```
1. tags (không có foreign keys)
2. courses (file relation cho thumbnail)
3. courses_tags (junction - M2M)
4. modules (M2O -> courses)
5. lessons (M2O -> modules)
6. documents (thư viện tài liệu tập trung - hỗ trợ file và URL)
7. lessons_documents (junction - M2M giữa lessons và documents)
8. enrollments (M2O -> users, courses)
9. lesson_progress (M2O -> users, lessons, enrollments)
10. quizzes (M2O -> lessons, courses)
11. quiz_questions (M2O -> quizzes)
12. question_bank (Standalone)
13. quiz_attempts (M2O -> users, quizzes, enrollments)
14. learning_paths
15. learning_paths_courses (junction - M2M)
16. certificate_templates
17. certificates (M2O -> users, courses)
18. user_notes (M2O -> users, lessons)
19. lesson_comments (M2O -> users, lessons, self-ref)
20. course_reviews (M2O -> users, courses)
```

#### Bước 2: Thiết lập Permissions

Xem file `docs/DIRECTUS_PERMISSIONS_BLUEPRINT.md` để cấu hình chi tiết.

#### Bước 3: Tạo Indexes

```sql
-- Tags
CREATE UNIQUE INDEX idx_tags_name ON tags(name);

-- Enrollments
CREATE UNIQUE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);

-- Lesson Progress
CREATE UNIQUE INDEX idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

-- Certificates
CREATE UNIQUE INDEX idx_certificates_number ON certificates(certificate_number);
```

### 4.2. Cập nhật Frontend

#### Bước 1: Tạo Service cho mỗi Collection

Tạo các files trong `src/services/`:

```
src/services/
├── directus.js       (có sẵn)
├── userService.js    (có sẵn)
├── tagService.js     (cần tạo)
├── courseService.js  (cần cập nhật - thay mock bằng Directus)
├── moduleService.js  (cần tạo)
├── lessonService.js  (cần tạo)
├── enrollmentService.js (cần cập nhật)
├── lessonProgressService.js (cần tạo)
├── quizService.js    (cần tạo)
├── quizQuestionService.js (cần tạo)
├── quizAttemptService.js (cần tạo)
├── learningPathService.js (cần tạo)
├── certificateService.js (cần tạo)
└── certificateTemplateService.js (cần tạo)
```

#### Bước 2: Tạo/Cập nhật Hooks

Tạo các files trong `src/hooks/`:

```
src/hooks/
├── useUsers.js       (có sẵn)
├── useTags.js        (cần tạo)
├── useCourses.js     (cần cập nhật)
├── useModules.js     (cần tạo)
├── useLessons.js     (cần tạo)
├── useEnrollments.js (cần cập nhật)
├── useLessonProgress.js (cần tạo)
├── useQuizzes.js     (cần tạo)
├── useQuizQuestions.js (cần tạo)
├── useQuizAttempts.js (cần tạo)
├── useLearningPaths.js (cần tạo)
└── useCertificates.js (cần tạo)
```

#### Bước 3: Cập nhật Pages

Thay thế mock data imports bằng hooks:

```javascript
// Trước (Mock):
import { mockCourses } from '../mocks/courses';
const courses = mockCourses;

// Sau (Real API):
import { usePublishedCourses } from '../hooks/useCourses';
const { data: courses, isLoading } = usePublishedCourses();
```

---

## 5. Template Code cho Services

### 5.1. tagService.js

```javascript
// src/services/tagService.js
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const tagService = {
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.TAGS, {
                sort: ['name'],
                ...params,
            })
        );
    },

    getById: async id => {
        const result = await directus.request(
            readItems(COLLECTIONS.TAGS, {
                filter: { id: { _eq: id } },
                limit: 1,
            })
        );
        return result[0] || null;
    },

    create: async data => {
        return await directus.request(createItem(COLLECTIONS.TAGS, data));
    },

    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.TAGS, id, data));
    },

    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.TAGS, id));
    },
};
```

### 5.2. courseService.js (Updated)

```javascript
// src/services/courseService.js
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

// Helper để transform M2M relations
const transformCourse = course => ({
    ...course,
    tags: course.tags?.map(t => t.tags_id) || [],
    user_created: course.user_created || null,
});

export const courseService = {
    getAll: async (params = {}) => {
        const courses = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                fields: ['*', 'tags.tags_id.*', 'user_created.id', 'user_created.first_name', 'user_created.last_name'],
                ...params,
            })
        );
        return courses.map(transformCourse);
    },

    getPublished: async (params = {}) => {
        return courseService.getAll({
            filter: { status: { _eq: 'published' } },
            ...params,
        });
    },

    getById: async (id, params = {}) => {
        const result = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                fields: ['*', 'tags.tags_id.*', 'user_created.id', 'user_created.first_name', 'user_created.last_name'],
                filter: { id: { _eq: id } },
                limit: 1,
                ...params,
            })
        );
        return result[0] ? transformCourse(result[0]) : null;
    },

    getWithModules: async id => {
        const course = await courseService.getById(id);
        if (!course) return null;

        // Lấy modules với lessons
        const modules = await directus.request(
            readItems(COLLECTIONS.MODULES, {
                fields: ['*'],
                filter: { course_id: { _eq: id } },
                sort: ['sort'],
            })
        );

        // Lấy lessons cho tất cả modules
        const moduleIds = modules.map(m => m.id);
        const lessons = await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                fields: ['*'],
                filter: { module_id: { _in: moduleIds } },
                sort: ['sort'],
            })
        );

        // Gắn lessons vào modules
        const modulesWithLessons = modules.map(module => ({
            ...module,
            lessons: lessons.filter(l => l.module_id === module.id),
        }));

        return {
            ...course,
            modules: modulesWithLessons,
        };
    },

    count: async (params = {}) => {
        const result = await directus.request(
            aggregate(COLLECTIONS.COURSES, {
                aggregate: { count: '*' },
                query: params,
            })
        );
        return result[0]?.count || 0;
    },

    create: async data => {
        // Transform tags array to M2M format
        const { tags, ...courseData } = data;

        const course = await directus.request(createItem(COLLECTIONS.COURSES, courseData));

        // Create M2M relations for tags
        if (tags?.length) {
            for (const tagId of tags) {
                await directus.request(
                    createItem(COLLECTIONS.COURSES_TAGS, {
                        courses_id: course.id,
                        tags_id: tagId,
                    })
                );
            }
        }

        return course;
    },

    update: async (id, data) => {
        const { tags, ...courseData } = data;

        // Update course
        const course = await directus.request(updateItem(COLLECTIONS.COURSES, id, courseData));

        // Update M2M relations if tags provided
        if (tags !== undefined) {
            // Delete existing relations
            const existing = await directus.request(
                readItems(COLLECTIONS.COURSES_TAGS, {
                    filter: { courses_id: { _eq: id } },
                })
            );
            for (const rel of existing) {
                await directus.request(deleteItem(COLLECTIONS.COURSES_TAGS, rel.id));
            }

            // Create new relations
            for (const tagId of tags) {
                await directus.request(
                    createItem(COLLECTIONS.COURSES_TAGS, {
                        courses_id: id,
                        tags_id: tagId,
                    })
                );
            }
        }

        return course;
    },

    delete: async id => {
        // Delete M2M relations first
        const existing = await directus.request(
            readItems(COLLECTIONS.COURSES_TAGS, {
                filter: { courses_id: { _eq: id } },
            })
        );
        for (const rel of existing) {
            await directus.request(deleteItem(COLLECTIONS.COURSES_TAGS, rel.id));
        }

        // Delete course
        return await directus.request(deleteItem(COLLECTIONS.COURSES, id));
    },
};
```

### 5.3. enrollmentService.js (Updated)

```javascript
// src/services/enrollmentService.js
import { directus } from './directus';
import { readItems, createItem, updateItem, readMe } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

const transformEnrollment = enrollment => ({
    ...enrollment,
    user: enrollment.user_id,
    course: enrollment.course_id,
});

export const enrollmentService = {
    getMyEnrollments: async (params = {}) => {
        const me = await directus.request(readMe());

        const enrollments = await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                fields: [
                    '*',
                    'course_id.*',
                    'course_id.tags.tags_id.*',
                    'user_id.id',
                    'user_id.first_name',
                    'user_id.last_name',
                ],
                filter: { user_id: { _eq: me.id } },
                ...params,
            })
        );

        return enrollments.map(transformEnrollment);
    },

    enrollCourse: async courseId => {
        const me = await directus.request(readMe());

        // Check existing enrollment
        const existing = await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter: {
                    user_id: { _eq: me.id },
                    course_id: { _eq: courseId },
                },
                limit: 1,
            })
        );

        if (existing.length > 0) {
            throw new Error('Already enrolled in this course');
        }

        return await directus.request(
            createItem(COLLECTIONS.ENROLLMENTS, {
                user_id: me.id,
                course_id: courseId,
                status: 'assigned',
                progress_percentage: 0,
            })
        );
    },

    updateProgress: async (enrollmentId, progressPercentage) => {
        const updateData = {
            progress_percentage: progressPercentage,
        };

        // Auto-update status based on progress
        if (progressPercentage > 0 && progressPercentage < 100) {
            updateData.status = 'in_progress';
            updateData.started_at = updateData.started_at || new Date().toISOString();
        } else if (progressPercentage >= 100) {
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
        }

        return await directus.request(updateItem(COLLECTIONS.ENROLLMENTS, enrollmentId, updateData));
    },
};
```

---

## 6. Checklist triển khai

### Phase 1: Backend Setup (Directus)

- [ ] Tạo tất cả collections theo schema ở Section 2
- [ ] Thiết lập M2M relations (courses_tags, learning_paths_courses)
- [ ] Tạo indexes cho performance
- [ ] Cấu hình permissions cho các roles

### Phase 2: Frontend Services

- [ ] Tạo `tagService.js`
- [ ] Cập nhật `courseService.js` (thay mock)
- [ ] Tạo `moduleService.js`
- [ ] Tạo `lessonService.js`
- [ ] Tạo `documentService.js` (thư viện tài liệu - hỗ trợ file và URL)
- [ ] Cập nhật `enrollmentService.js` (thay mock)
- [ ] Tạo `lessonProgressService.js`
- [ ] Tạo `quizService.js`
- [ ] Tạo `quizQuestionService.js`
- [ ] Tạo `quizAttemptService.js`
- [ ] Tạo `learningPathService.js`
- [ ] Tạo `certificateService.js`

### Phase 3: Frontend Hooks

- [ ] Tạo `useTags.js`
- [ ] Cập nhật `useCourses.js`
- [ ] Tạo `useModules.js`
- [ ] Tạo `useLessons.js`
- [ ] Tạo `useDocuments.js` (hooks cho thư viện tài liệu)
- [ ] Cập nhật `useEnrollments.js`
- [ ] Tạo `useLessonProgress.js`
- [ ] Tạo `useQuizzes.js`
- [ ] Tạo `useQuizQuestions.js`
- [ ] Tạo `useQuizAttempts.js`
- [ ] Tạo `useLearningPaths.js`
- [ ] Tạo `useCertificates.js`

### Phase 4: Update Pages

- [ ] Cập nhật Admin pages (thay mock imports bằng hooks)
- [ ] Cập nhật Learner pages
- [ ] Test tất cả CRUD operations
- [ ] Test relationships và nested queries

### Phase 5: Testing & Validation

- [ ] Verify data format matches UI expectations
- [ ] Test error handling
- [ ] Test loading states
- [ ] Performance testing

---

## 7. Lưu ý quan trọng

### 7.1. M2M Relations trong Directus

Khi query M2M relations, Directus trả về junction table records. Cần transform:

```javascript
// Directus response:
course.tags = [{ id: 1, courses_id: 'course-uuid', tags_id: { id: 'tag-uuid', name: 'Technical' } }];

// Transform cho UI:
course.tags = course.tags.map(t => t.tags_id);
// Result: [{ id: 'tag-uuid', name: 'Technical' }]
```

### 7.2. File Assets

Sử dụng helper function từ `directus.js`:

```javascript
import { getAssetUrl } from '../services/directus';

// Trong component:
<img src={getAssetUrl(course.thumbnail)} alt={course.title} />;
```

### 7.3. Giữ Mock Data cho Development/Testing

Mock data vẫn hữu ích cho:

- Unit testing
- Storybook components
- Offline development

Giữ files trong `src/mocks/` nhưng không import vào production code.

---

## 8. Tài liệu liên quan

- `docs/LMS.md` - Mô tả chi tiết hệ thống LMS
- `docs/DIRECTUS_PERMISSIONS_BLUEPRINT.md` - Cấu hình permissions
- `docs/FULL_AUTH_SSO_DOCUMENTATION.md` - Hướng dẫn authentication
- `AGENTS.md` - Coding standards và patterns
