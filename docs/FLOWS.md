# Directus Flows & Automations (LMS Logic)

Tài liệu này mô tả các luồng tự động hóa (Flows) cần cấu hình trong Directus để xử lý logic nghiệp vụ cho hệ thống LMS.

## 🟢 Legend

- **Trigger**: Sự kiện kích hoạt Flow.
- **Operation**: Các bước xử lý (Read, Create, Update, Condition...).
- **Scope**: Phạm vi ảnh hưởng.

---

## 1. User & Onboarding Logic

### Flow 1.1: Auto-Assign Learning Paths (User Onboarding)

**Recommended Trigger:** `Event Hook (Action)`

Tự động gán các Lộ trình học tập **Bắt buộc** khi có nhân viên mới được tạo hoặc cập nhật phòng ban.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`, `items.update`
- **Collection:** `directus_users`

**Bước 2: Operation - Read User (Read Data)**

- **Permissions:** Full Access
- **Collection:** `directus_users` (Nhập thủ công nếu không thấy trong list)
- **IDs:** `{{ $trigger.keys[0] }}`
- **Query:** `{"fields": ["id", "department", "title"]}`

**Bước 3: Operation - Find Paths (Read Data)**

- **Permissions:** Full Access
- **Collection:** `learning_paths`
- **Filter:**
    ```json
    {
        "_and": [
            { "status": { "_eq": "published" } },
            { "is_mandatory": { "_eq": true } },
            {
                "_or": [
                    { "department_filter": { "_contains": "{{ get_user.department }}" } },
                    { "position_filter": { "_contains": "{{ get_user.title }}" } }
                ]
            }
        ]
    }
    ```

**Bước 4: Operation - Fetch Courses (Read Data)**

- **Permissions:** Full Access
- **Collection:** `learning_paths_courses`
- **Filter:** `{"learning_path_id": {"_in": "{{ find_paths.map(p => p.id) }}"}}`
- **Query:** `{"fields": ["learning_path_id", "course_id"]}`

**Bước 5: Operation - Prepare Data (Run Script)**

- **Code:** (Như trên)

**Bước 6: Operation - Create Enrollments (Create Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **Payload:** `{{ prepare_data }}`
- **Emit Events:** False (Tránh loop)

### Flow 1.2: Bulk Assign (Learning Path Published)

**Recommended Trigger:** `Event Hook (Action)`

Khi Admin tạo/sửa một Lộ trình bắt buộc, tự động gán cho các user hiện tại phù hợp.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`, `items.update`
- **Collection:** `learning_paths`

**Bước 2: Condition - Check Mandatory**

- **Rule:** `{{ $trigger.payload.is_mandatory }} == true` OR `{{ $last.is_mandatory }} == true`

**Bước 3: Operation - Find Target Users (Read Data)**

- **Permissions:** Full Access
- **Collection:** `directus_users` (Nhập thủ công)
- **Filter:**
    ```json
    {
        "_or": [
            { "department": { "_in": "{{ $trigger.payload.department_filter }}" } },
            { "title": { "_in": "{{ $trigger.payload.position_filter }}" } }
        ]
    }
    ```

**Bước 4: Operation - Get Path Courses (Read Data)**

- **Permissions:** Full Access
- **Collection:** `learning_paths_courses`
- **Filter:** `{"learning_path_id": {"_eq": "{{ $trigger.keys[0] }}"}}`

**Bước 5: Operation - Prepare Enrollments (Run Script)**

- **Code:** (Logic tương tự Flow 1.1 nhưng loop qua Users thay vì Paths)

**Bước 6: Operation - Create Enrollments (Create Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **Payload:** `{{ prepare_data }}`
- **Emit Events:** False

---

## 2. Learning Process Logic

### Flow 2.1: Start Course Tracking

**Recommended Trigger:** `Event Hook (Action)`

Chuyển trạng thái từ `assigned` sang `in_progress` khi học viên bắt đầu học.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`
- **Collection:** `lesson_progress`

**Bước 2: Operation - Read Enrollment (Read Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **IDs:** `{{ $trigger.payload.enrollment_id }}`
- **Query:** `{"fields": ["id", "status"]}`

**Bước 3: Condition - Check Status**

- **Rule:** `{{ get_enrollment.status }} == 'assigned'`

**Bước 4: Operation - Update Status (Update Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **IDs:** `{{ get_enrollment.id }}`
- **Payload:**
    ```json
    {
        "status": "in_progress",
        "started_at": "{{ $NOW }}"
    }
    ```
- **Emit Events:** False

### Flow 2.2: Course Completion Check

**Recommended Trigger:** `Event Hook (Action)`

Tự động đánh dấu hoàn thành khóa học khi tiến độ đạt 100%.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`, `items.update`
- **Collection:** `lesson_progress`

**Bước 2: Operation - Calculate Progress (Run Script)**

- **Key:** `calc_progress`
- **Code:** (Query đếm số bài học đã xong / tổng số bài học -> trả về %)

**Bước 3: Operation - Update Enrollment (Update Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **IDs:** `{{ $trigger.payload.enrollment_id }}`
- **Payload:** `{"progress_percentage": "{{ calc_progress }}"}`
- **Emit Events:** True (Cần True để kích hoạt Flow Certificate 4.1)

**Bước 4: Condition - Is 100%?**

- **Rule:** `{{ calc_progress }} == 100`

**Bước 5: Operation - Mark Completed (Update Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **Payload:** `{"status": "completed", "completed_at": "{{ $NOW }}"}`
- **Emit Events:** True (Kích hoạt Flow Certificate)

### Flow 2.3: Real-time Learning Tracking (Heartbeat)

**Recommended Trigger:** `Webhook`

Theo dõi thời gian học thực tế để tránh gian lận và tính KPI chính xác.

**Bước 1: Trigger (Webhook)**

- **Method:** POST
- **Path:** `/track-time`

**Bước 2: Operation - Read Current Progress (Read Data)**

- **Permissions:** Full Access
- **Collection:** `lesson_progress`
- **IDs:** `{{ $trigger.body.lesson_progress_id }}`

**Bước 3: Operation - Update Time (Update Data)**

- **Permissions:** Full Access
- **Collection:** `lesson_progress`
- **IDs:** `{{ current.id }}`
- **Payload:**
    ```json
    {
        "time_spent": "{{ current.time_spent + $trigger.body.seconds }}",
        "last_position": "{{ $trigger.body.last_position }}"
    }
    ```
- **Emit Events:** False (Tránh loop vô tận vì update liên tục)

---

## 3. Quiz & Assessment Logic

### Flow 3.1: Auto-Grade Quiz (Trắc nghiệm)

**Recommended Trigger:** `Event Hook (Action)`

Chấm điểm tự động ngay khi User nộp bài (submit).

### Flow 3.1: Auto-Grade Quiz (Trắc nghiệm)

**Recommended Trigger:** `Event Hook (Action)`

Chấm điểm tự động ngay khi User nộp bài (submit).

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.update`
- **Collection:** `quiz_attempts`
- **Filter:** `submitted_at` IS NOT NULL

**Bước 2: Operation - Fetch Quiz Key (Read Data)**

- **Permissions:** Full Access
- **Collection:** `quizzes`
- **IDs:** `{{ $trigger.payload.quiz_id }}`
- **Query:** `{"fields": ["*", "questions.*"]}`

**Bước 3: Operation - Grade Logic (Run Script)**

- **Code:** (Logic chấm điểm)

**Bước 4: Operation - Save Result (Update Data)**

- **Permissions:** Full Access
- **Collection:** `quiz_attempts`
- **IDs:** `{{ $trigger.keys[0] }}`
- **Payload:** `{{ grading }}`
- **Emit Events:** False

**Bước 5: Condition - Is Passed?**

- **Rule:** `{{ grading.is_passed }} == true`

**Bước 6: Operation - Update Lesson Progress (Update Data)**

- **Permissions:** Full Access
- **Collection:** `lesson_progress`
- **Filter:** `{"quiz_id": ...}`
- **Payload:** `{"is_completed": true}`
- **Emit Events:** True (Kích hoạt Flow 2.2)

---

## 4. Certificates & Notifications

### Flow 4.1: Generate Certificate

**Recommended Trigger:** `Event Hook (Action)`

Tạo chứng chỉ PDF và gửi email khi hoàn thành khóa học.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.update`
- **Collection:** `enrollments`
- **Filter:** `{"status": {"_eq": "completed"}}`

**Bước 2: Operation - Check Settings (Read Data)**

- **Permissions:** Full Access
- **Collection:** `app_settings`
- **Query:** `{"limit": 1}`

**Bước 3: Condition - Auto Generate?**

- **Rule:** `{{ settings.auto_generate_certificate }} == true`

**Bước 4: Operation - Get Template (Read Data)**

- **Permissions:** Full Access
- **Collection:** `certificate_templates`
- **Filter:** `{"is_active": {"_eq": true}}`
- **Query:** `{"limit": 1}`

**Bước 5: Operation - Generate PDF (Request/Webhook)**

- **Method:** POST
- **URL:** (External Service URL)
- **Body:** `{ "user": "{{ $trigger.payload.user_id }}", "course": "{{ $trigger.payload.course_id }}" }`

**Bước 6: Operation - Save Certificate (Create Data)**

- **Permissions:** Full Access
- **Collection:** `certificates`
- **Payload:** `{ "file": "{{ generate_pdf.file_id }}", "user_id": "{{ $trigger.payload.user_id }}", ... }`
- **Emit Events:** False

**Bước 7: Operation - Send Email (Send Email)**

- **To:** `{{ user_email }}`
- **Subject:** "Chúc mừng bạn đã hoàn thành khóa học!"

### Flow 4.2: Enrollment Notification

**Recommended Trigger:** `Event Hook (Action)`

Thông báo khi được gán khóa học mới.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`
- **Collection:** `enrollments`
- **Filter:** `{"assigned_by": {"_nnull": true}, "status": {"_eq": "assigned"}}`

**Bước 2: Operation - Get Info (Read Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **IDs:** `{{ $trigger.key }}`
- **Query:** `{"fields": ["*", "user_id.email", "course_id.title"]}`

**Bước 3: Operation - Send Email (Send Email)**

- **To:** `{{ info.user_id.email }}`
- **Subject:** "Bạn có khóa học mới: {{ info.course_id.title }}"

**Bước 4: Operation - In-App Notify (Create Data)**

- **Permissions:** Full Access
- **Collection:** `directus_notifications`
- **Payload:** `{ "recipient": "{{ info.user_id.id }}", "subject": "New Course Assigned", "collection": "enrollments", "item": "{{ info.id }}" }`
- **Emit Events:** False

### Flow 4.3: Deadline Reminder (Scheduled)

**Recommended Trigger:** `Schedule (Cron)`

Nhắc nhở học tập.

**Bước 1: Trigger (Schedule)**

- **Cron:** `0 8 * * *` (8:00 AM daily)

**Bước 2: Operation - Find Expiring (Read Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **Filter:**
    ```json
    {
        "status": { "_in": ["assigned", "in_progress"] },
        "due_date": { "_between": ["{{ $NOW }}", "{{ $NOW | date_add(3, 'days') }}"] }
    }
    ```

**Bước 3: Operation - Loop & Email (Run Script / Flow)**

- **Code:** (Loop qua danh sách `expiring` và gửi email cho từng người)

---

## 5. System Maintenance

### Flow 5.1: Expired Status Update

**Recommended Trigger:** `Schedule (Cron)`

Cập nhật trạng thái quá hạn.

**Bước 1: Trigger (Schedule)**

- **Cron:** `0 0 * * *` (Midnight daily)

**Bước 2: Operation - Update Status (Update Data)**

- **Permissions:** Full Access
- **Collection:** `enrollments`
- **Filter:**
    ```json
    {
        "status": { "_neq": "completed" },
        "due_date": { "_lt": "{{ $NOW }}" }
    }
    ```
- **Payload:** `{"status": "expired"}`
- **Emit Events:** False

---

## 6. Data Aggregation Logic (Tính toán tổng hợp)

### Flow 6.1: Auto-Calculate Course Duration

**Recommended Trigger:** `Event Hook (Action)`

Tự động tính tổng thời lượng khóa học dựa trên tổng thời lượng các bài học con.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`, `items.update`, `items.delete`
- **Collection:** `lessons`

**Bước 2: Operation - Read Module (Read Data)**

- **Permissions:** Full Access
- **Collection:** `modules`
- **IDs:** `{{ $trigger.payload.module_id }}` (hoặc lấy từ `$last` nếu là delete)
- **Query:** `{"fields": ["course_id"]}`

**Bước 3: Operation - Aggregate Duration (Read Data)**

- **Permissions:** Full Access
- **Collection:** `lessons`
- **Filter:** `{"module_id": {"course_id": {"_eq": "{{ get_module.course_id }}"}}}`
- **Aggregation:** `{"sum": "duration"}`

**Bước 4: Operation - Update Course (Update Data)**

- **Permissions:** Full Access
- **Collection:** `courses`
- **IDs:** `{{ get_module.course_id }}`
- **Payload:** `{"duration": "{{ aggregate_duration[0].sum.duration }}"}`
- **Emit Events:** False

### Flow 6.2: Auto-Calculate Course Rating

**Recommended Trigger:** `Event Hook (Action)`

Tự động tính điểm đánh giá trung bình của khóa học.

**Bước 1: Trigger (Event Hook)**

- **Scope:** `items.create`, `items.update`, `items.delete`
- **Collection:** `course_reviews`

**Bước 2: Operation - Aggregate Rating (Read Data)**

- **Permissions:** Full Access
- **Collection:** `course_reviews`
- **Filter:** `{"course_id": {"_eq": "{{ $trigger.payload.course_id }}"}, "status": {"_eq": "published"}}`
- **Aggregation:** `{"avg": "rating", "count": "*"}`

**Bước 3: Operation - Update Course (Update Data)**

- **Permissions:** Full Access
- **Collection:** `courses`
- **IDs:** `{{ $trigger.payload.course_id }}`
- **Payload:**
    ```json
    {
        "avg_rating": "{{ aggregate_rating[0].avg.rating }}",
        "reviews_count": "{{ aggregate_rating[0].count }}"
    }
    ```
- **Emit Events:** False

---

## 7. Hướng dẫn Setup Flow trong Directus Admin

### 6.1. Quy trình tạo Flow

1.  Vào **Settings > Flows**.
2.  Bấm **Create Flow** (+).
3.  Đặt tên gợi nhớ (VD: `LMS - Auto Assign Path`).
4.  Chọn **Trigger Type** phù hợp (Xem mục 6.3).
5.  Thêm các **Operation** (Bước xử lý) theo logic đã thiết kế.

### 6.2. Hiểu về Data Chain (Quan trọng)

Trong Directus Flow, dữ liệu được truyền qua các bước thông qua các biến hệ thống. Bạn có thể truy cập chúng trong các trường cấu hình bằng cú pháp `{{ variable }}`.

| Biến                     | Ý nghĩa                                                | Ví dụ sử dụng                                                  |
| :----------------------- | :----------------------------------------------------- | :------------------------------------------------------------- |
| `{{ $trigger }}`         | Toàn bộ dữ liệu từ sự kiện kích hoạt                   | `{ "payload": {...}, "keys": ["123"], "collection": "users" }` |
| `{{ $trigger.payload }}` | Dữ liệu vừa được gửi lên (chỉ chứa các field thay đổi) | `{{ $trigger.payload.status }}`                                |
| `{{ $trigger.keys }}`    | Mảng các ID của bản ghi bị tác động                    | `{{ $trigger.keys[0] }}` (Lấy ID đầu tiên)                     |
| `{{ $last }}`            | Kết quả của bước (Operation) ngay trước đó             | Dùng để chain dữ liệu liên tục                                 |
| `{{ operation_key }}`    | Kết quả của một bước cụ thể (theo Key bạn đặt)         | `{{ read_user.first_name }}`                                   |
| `{{ $accountability }}`  | Thông tin về người/hệ thống kích hoạt Flow             | `{{ $accountability.user }}` (User ID)                         |

### 6.3. Ví dụ Cấu hình: Flow 1.1 (Auto-Assign)

**Bước 1: Trigger (Event Hook)**

- **Type:** Action (Non-blocking)
- **Scope:** `items.create`, `items.update`
- **Collection:** `directus_users`

**Bước 2: Operation - Read User (Read Data)**

- **Key:** `get_user`
- **Collection:** `directus_users`
- **IDs:** `{{ $trigger.keys[0] }}`
- _Mục đích: Lấy đầy đủ thông tin department, title (vì payload update có thể thiếu)._

**Bước 3: Operation - Find Paths (Read Data)**

- **Key:** `find_paths`
- **Collection:** `learning_paths`
- **Filter:**
    ```json
    {
        "_and": [
            { "status": { "_eq": "published" } },
            { "is_mandatory": { "_eq": true } },
            {
                "_or": [
                    { "department_filter": { "_contains": "{{ get_user.department }}" } },
                    { "position_filter": { "_contains": "{{ get_user.title }}" } }
                ]
            }
        ]
    }
    ```

**Bước 4: Operation - Assign Logic (Run Script)**

- **Key:** `prepare_enrollments`
- **Code:**

    ```javascript
    const paths = data.find_paths; // Kết quả từ bước 3
    const userId = data.get_user.id;
    const enrollments = [];

    paths.forEach(path => {
        // Calculate Due Date
        let dueDate = null;
        if (path.duration_days) {
            const d = new Date();
            d.setDate(d.getDate() + path.duration_days);
            dueDate = d.toISOString();
        }

        // Loop courses (giả sử đã fetch courses trong bước 3 hoặc tách bước riêng)
        // ... logic push to enrollments array
    });
    return enrollments;
    ```

**Bước 5: Operation - Create Enrollments (Create Data)**

- **Collection:** `enrollments`
- **Payload:** `{{ prepare_enrollments }}` (Mảng các bản ghi từ bước Script)

### 6.4. Debugging (Gỡ lỗi)

- Luôn kiểm tra tab **Logs** trong sidebar bên phải của màn hình Flow.
- Bấm vào từng dòng log để xem **Payload** (Input) và **Output** (Result) để biết data chain đang chạy như thế nào.
- Nếu Flow không chạy: Kiểm tra **Status** của Flow đã là `Active` chưa.

1.  Đăng nhập **Directus Admin Panel**.
2.  Ở thanh sidebar bên trái, chọn **Settings** (biểu tượng bánh răng).
3.  Chọn **Flows**.

### 6.2. Tạo Flow mới

1.  Bấm nút **Create Flow** (+) ở góc phải.
2.  Nhập **Name** (VD: "Auto Assign Learning Path").
3.  Chọn **Status**: `Active` (Để chạy ngay) hoặc `Inactive` (Nháp).
4.  Chọn **Trigger** (Xem chi tiết bên dưới).

### 6.3. Các loại Trigger (Hướng dẫn chọn)

- **Event Hook (Action / Filter):** Dùng khi dữ liệu thay đổi **BÊN TRONG** Directus.
    - **Action (Non-blocking):** Chạy ngầm sau khi lưu. Dùng cho: Gửi mail, Tạo thông báo, Auto-enroll. (90% use case).
    - **Filter (Blocking):** Chặn dữ liệu trước khi lưu. Dùng cho: Validation phức tạp.
- **Schedule (Cron):** Dùng cho tác vụ định kỳ (VD: Quét deadline, Gửi mail nhắc nhở hàng ngày).
- **Webhook:** Dùng cho tích hợp **BÊN NGOÀI** (VD: Frontend gửi Heartbeat tracking, Payment Gateway báo tin).
- **Manual:** Dùng cho Admin kích hoạt thủ công trên từng item.
- **Another Flow:** Dùng để tái sử dụng logic (DRY).

### 6.4. Thêm Operation (Các bước xử lý)

Sau khi có Trigger, bấm nút `+` để thêm các bước xử lý tiếp theo.

- **Read Data:** Lấy dữ liệu từ DB để xử lý.
    - _Tip:_ Dùng `Filter` để lọc đúng bản ghi cần lấy.
- **Create Data / Update Data:** Thêm/Sửa dữ liệu trong DB.
- **Condition (Rẽ nhánh):** Kiểm tra điều kiện (IF/ELSE).
    - VD: Nếu `status == 'published'` thì làm tiếp, không thì dừng.
- **Run Script:** Viết code JavaScript (Node.js) để xử lý logic phức tạp (tính toán điểm, xử lý mảng).
- **Send Email:** Gửi email thông báo.

### 6.5. Debugging (Gỡ lỗi)

- Khi Flow chạy lỗi, vào tab **Logs** trong màn hình chi tiết Flow để xem lịch sử chạy.
- Bấm vào từng dòng log để xem **Payload** (dữ liệu đầu vào) và **Output** (kết quả) của từng bước.
