# Triển khai Tính Thời gian Học Thực tế (Real-time Study Tracking)

Tài liệu này mô tả giải pháp kỹ thuật để tính toán thời gian học thực tế của người dùng (dựa trên thời gian on-screen) thay vì chỉ dựa vào thời lượng lý thuyết của video/bài học.

## 1. Nguyên lý hoạt động (Heartbeat Mechanism)

Hệ thống sẽ sử dụng cơ chế **"Heartbeat"** (Nhịp tim).

- Frontend sẽ gửi tín hiệu (ping) lên Server theo chu kỳ cố định (ví dụ: mỗi **30 giây**).
- Server sẽ ghi nhận hoặc cộng dồn thời gian này vào cơ sở dữ liệu.
- Thời gian chỉ được tính khi người dùng thực sự đang học (Tab trình duyệt Active + Có tương tác hoặc Video đang chạy).

---

## 2. Thiết kế Cơ sở dữ liệu (Directus Schema)

Cần tạo một Collection mới để lưu trữ phiên học.

### Collection: `study_sessions`

Lưu trữ thời gian học được gom nhóm theo **Ngày** và **Khóa học**.

| Field Name         | Type                 | Note                           |
| :----------------- | :------------------- | :----------------------------- |
| `id`               | UUID                 | Primary Key                    |
| `user_id`          | M2O (directus_users) | Người học                      |
| `course_id`        | M2O (courses)        | Khóa học đang học              |
| `date`             | Date                 | Ngày học (Format: YYYY-MM-DD)  |
| `duration_seconds` | Integer              | Tổng số giây đã học trong ngày |
| `last_updated`     | Timestamp            | Thời điểm cập nhật cuối cùng   |

---

## 3. Giải pháp Backend (Chọn 1 trong 2)

### Cách 1: Logic tại Frontend (Sử dụng API CRUD Chuẩn)

_Dễ triển khai, không cần cấu hình Directus Flow._

**Quy trình:**

1. Frontend định kỳ (30s) gọi API `GET /items/study_sessions`.
    - Filter: `{"user_id": "CURRENT_USER", "course_id": "CURRENT_COURSE", "date": "TODAY"}`
2. Kiểm tra kết quả:
    - **Nếu có bản ghi:** Gọi API `PATCH /items/study_sessions/:id` để cộng thêm 30 vào `duration_seconds`.
    - **Nếu chưa có:** Gọi API `POST /items/study_sessions` để tạo mới với `duration_seconds = 30`.

### Cách 2: Logic tại Backend (Sử dụng Directus Flows) - **Khuyên dùng**

_An toàn hơn, tránh logic phức tạp ở Client, tránh race condition._

**Cấu hình Flow trong Admin:**

1. **Trigger:** Webhook (`POST /flows/trigger/track-time`).
2. **Operation (Read Data):** Đọc `study_sessions` khớp User + Course + Date.
3. **Operation (Condition):** Kiểm tra dữ liệu có tồn tại không?
    - **True:** Update bản ghi cũ (`duration_seconds` + 30).
    - **False:** Create bản ghi mới (`duration_seconds` = 30).

---

## 4. Triển khai Frontend (React)

### 4.1. Tạo Custom Hook: `useStudyTimer`

Hook này sẽ chịu trách nhiệm gửi heartbeat lên server.

```javascript
// src/hooks/useStudyTimer.js
import { useEffect, useRef } from 'react';
import { directus } from '../services/directus';
// Import các constants và helpers cần thiết

const HEARTBEAT_INTERVAL = 30000; // 30 giây

export const useStudyTimer = (courseId, isPlaying) => {
    const timerRef = useRef(null);

    useEffect(() => {
        // Chỉ chạy khi video đang play hoặc trang đang active
        if (!courseId || !isPlaying) return;

        const sendHeartbeat = async () => {
            try {
                // Logic gọi API (theo Cách 1 hoặc Cách 2 ở trên)
                // Ví dụ gọi Service: await studySessionService.trackTime(courseId);
                console.log('Heartbeat sent for course:', courseId);
            } catch (error) {
                console.error('Track time failed:', error);
            }
        };

        // Gửi ngay lần đầu
        sendHeartbeat();

        // Setup interval
        timerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [courseId, isPlaying]);
};
```

### 4.2. Tích hợp vào Trang học (`CoursePlayer`)

Sử dụng hook này tại component hiển thị bài học. Có thể kết hợp với `Page Visibility API` để ngừng đếm khi user switch tab.

```javascript
// src/pages/private/learner/CoursePlayer.jsx
import { usePageVisibility } from 'react-page-visibility';
import { useStudyTimer } from '../../../hooks/useStudyTimer';

const CoursePlayer = ({ courseId }) => {
    const isPageVisible = usePageVisibility();
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Timer chỉ chạy khi Page Visible VÀ Video đang Play
    const isTracking = isPageVisible && isVideoPlaying;

    useStudyTimer(courseId, isTracking);

    return (
        // ... Render Video Player
        <VideoPlayer onPlay={() => setIsVideoPlaying(true)} onPause={() => setIsVideoPlaying(false)} />
    );
};
```

---

## 5. Hiển thị trên Dashboard

Để hiển thị biểu đồ thời gian học:

1. **Query API:**
   Lấy dữ liệu `study_sessions` của user, filter theo range ngày (ví dụ: 7 ngày qua).

    ```javascript
    // GET /items/study_sessions
    {
        filter: {
            user_id: { _eq: CURRENT_USER_ID },
            date: { _gte: "2023-10-01" } // 7 ngày trước
        },
        aggregate: {
            sum: "duration_seconds"
        },
        groupBy: ["date"]
    }
    ```

2. **Xử lý dữ liệu:**
   Chuyển đổi giây sang giờ để hiển thị lên biểu đồ cột (Bar Chart).
    ```javascript
    const chartData = apiData.map(item => ({
        date: item.date,
        hours: (item.sum.duration_seconds / 3600).toFixed(1),
    }));
    ```
