/**
 * Mock Data - Quizzes & Quiz Questions
 * Bài kiểm tra và câu hỏi
 */
export const mockQuizzes = [
    {
        id: 'q1',
        title: 'Kiểm tra Module 1: Giới thiệu công ty',
        description: 'Bài kiểm tra kiến thức về lịch sử và văn hóa công ty',
        lesson_id: null,
        course_id: '1',
        pass_score: 70,
        time_limit: 15, // minutes
        randomize_questions: true,
        max_attempts: 3,
        questions_count: 5,
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'q2',
        title: 'Kiểm tra Module 2: Quy trình làm việc',
        description: 'Bài kiểm tra về các quy trình cơ bản trong công ty',
        lesson_id: 'l6',
        course_id: '1',
        pass_score: 80,
        time_limit: 10,
        randomize_questions: false,
        max_attempts: 2,
        questions_count: 4,
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-16T10:00:00Z',
    },
    {
        id: 'q3',
        title: 'Bài kiểm tra cuối khóa: An toàn lao động',
        description: 'Kiểm tra tổng hợp kiến thức về an toàn lao động và PCCC',
        lesson_id: null,
        course_id: '2',
        pass_score: 80,
        time_limit: 30,
        randomize_questions: true,
        max_attempts: 3,
        questions_count: 10,
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-20T10:00:00Z',
    },
    {
        id: 'q4',
        title: 'Quiz: React Hooks',
        description: 'Kiểm tra hiểu biết về React Hooks',
        lesson_id: null,
        course_id: '4',
        pass_score: 70,
        time_limit: 20,
        randomize_questions: true,
        max_attempts: 5,
        questions_count: 8,
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-02-10T10:00:00Z',
    },
];

export const mockQuizQuestions = [
    // Quiz 1: Giới thiệu công ty
    {
        id: 'qq1',
        quiz_id: 'q1',
        question: 'Công ty được thành lập vào năm nào?',
        type: 'single',
        options: {
            A: '2010',
            B: '2015',
            C: '2018',
            D: '2020',
            correct: ['B'],
        },
        explanation: 'Công ty được thành lập vào năm 2015 bởi nhóm sáng lập.',
        points: 1,
        sort: 1,
    },
    {
        id: 'qq2',
        quiz_id: 'q1',
        question: 'Giá trị cốt lõi nào KHÔNG thuộc về công ty?',
        type: 'single',
        options: {
            A: 'Đổi mới sáng tạo',
            B: 'Khách hàng là trung tâm',
            C: 'Lợi nhuận trên hết',
            D: 'Phát triển bền vững',
            correct: ['C'],
        },
        explanation:
            'Công ty đề cao giá trị đổi mới, khách hàng và phát triển bền vững, không đặt lợi nhuận làm giá trị cốt lõi.',
        points: 1,
        sort: 2,
    },
    {
        id: 'qq3',
        quiz_id: 'q1',
        question: 'Chọn các sản phẩm/dịch vụ mà công ty cung cấp:',
        type: 'multiple',
        options: {
            A: 'Phát triển phần mềm',
            B: 'Tư vấn chuyển đổi số',
            C: 'Sản xuất phần cứng',
            D: 'Đào tạo công nghệ',
            correct: ['A', 'B', 'D'],
        },
        explanation: 'Công ty cung cấp dịch vụ phát triển phần mềm, tư vấn và đào tạo. Không sản xuất phần cứng.',
        points: 2,
        sort: 3,
    },
    {
        id: 'qq4',
        quiz_id: 'q1',
        question: 'Sứ mệnh của công ty là gì?',
        type: 'single',
        options: {
            A: 'Trở thành công ty lớn nhất Việt Nam',
            B: 'Mang công nghệ tiên tiến đến mọi doanh nghiệp',
            C: 'Tối đa hóa lợi nhuận cho cổ đông',
            D: 'Cạnh tranh với các công ty nước ngoài',
            correct: ['B'],
        },
        explanation: 'Sứ mệnh của công ty là mang công nghệ tiên tiến đến mọi doanh nghiệp.',
        points: 1,
        sort: 4,
    },
    {
        id: 'qq5',
        quiz_id: 'q1',
        question: 'Mô tả ngắn gọn tầm nhìn của công ty trong 3-5 năm tới:',
        type: 'text',
        options: {
            correct: [], // Text questions are graded manually or with keywords
            keywords: ['đổi mới', 'công nghệ', 'khách hàng', 'phát triển'],
        },
        explanation:
            'Câu trả lời nên đề cập đến các yếu tố: đổi mới công nghệ, phục vụ khách hàng, phát triển bền vững.',
        points: 2,
        sort: 5,
    },
    // Quiz 2: Quy trình làm việc
    {
        id: 'qq6',
        quiz_id: 'q2',
        question: 'Để xin nghỉ phép, nhân viên cần thực hiện bước nào đầu tiên?',
        type: 'single',
        options: {
            A: 'Gọi điện cho HR',
            B: 'Đăng nhập vào Portal HR và tạo đơn',
            C: 'Gửi email cho quản lý trực tiếp',
            D: 'Điền form giấy và nộp lên phòng HR',
            correct: ['B'],
        },
        explanation: 'Quy trình nghỉ phép bắt đầu bằng việc tạo đơn trên Portal HR.',
        points: 1,
        sort: 1,
    },
    {
        id: 'qq7',
        quiz_id: 'q2',
        question: 'Thời gian tối thiểu để xin nghỉ phép có kế hoạch là bao nhiêu ngày?',
        type: 'single',
        options: {
            A: '1 ngày',
            B: '3 ngày',
            C: '5 ngày',
            D: '7 ngày',
            correct: ['B'],
        },
        explanation: 'Nghỉ phép có kế hoạch cần được đăng ký trước ít nhất 3 ngày làm việc.',
        points: 1,
        sort: 2,
    },
    {
        id: 'qq8',
        quiz_id: 'q2',
        question: 'Ai là người phê duyệt đơn nghỉ phép?',
        type: 'single',
        options: {
            A: 'Phòng HR',
            B: 'Quản lý trực tiếp',
            C: 'Giám đốc',
            D: 'Tự động phê duyệt',
            correct: ['B'],
        },
        explanation: 'Quản lý trực tiếp là người phê duyệt đơn nghỉ phép.',
        points: 1,
        sort: 3,
    },
    {
        id: 'qq9',
        quiz_id: 'q2',
        question: 'Chọn các quy trình có trên Portal HR:',
        type: 'multiple',
        options: {
            A: 'Nghỉ phép',
            B: 'Đăng ký làm thêm giờ',
            C: 'Đăng ký khóa học',
            D: 'Báo cáo chi phí',
            correct: ['A', 'B', 'D'],
        },
        explanation:
            'Portal HR có các chức năng: nghỉ phép, làm thêm giờ, báo cáo chi phí. Đăng ký khóa học trên hệ thống LMS.',
        points: 2,
        sort: 4,
    },
    // Quiz 3: An toàn lao động (sample questions)
    {
        id: 'qq10',
        quiz_id: 'q3',
        question: 'Khi phát hiện đám cháy, bước đầu tiên cần làm là gì?',
        type: 'single',
        options: {
            A: 'Cố gắng dập tắt đám cháy',
            B: 'Gọi điện cho sếp',
            C: 'Bấm nút báo cháy và hô hoán',
            D: 'Chạy ra ngoài ngay lập tức',
            correct: ['C'],
        },
        explanation: 'Bước đầu tiên là bấm nút báo cháy để thông báo cho tất cả mọi người trong tòa nhà.',
        points: 1,
        sort: 1,
    },
    {
        id: 'qq11',
        quiz_id: 'q3',
        question: 'Bình chữa cháy CO2 được sử dụng cho loại đám cháy nào?',
        type: 'multiple',
        options: {
            A: 'Cháy điện',
            B: 'Cháy chất lỏng (xăng, dầu)',
            C: 'Cháy gỗ, giấy',
            D: 'Cháy kim loại',
            correct: ['A', 'B'],
        },
        explanation: 'Bình CO2 phù hợp cho cháy điện và chất lỏng. Không dùng cho cháy gỗ/giấy hay kim loại.',
        points: 2,
        sort: 2,
    },
    // Quiz 4: React Hooks (sample questions)
    {
        id: 'qq12',
        quiz_id: 'q4',
        question: 'useState trả về gì?',
        type: 'single',
        options: {
            A: 'Một giá trị duy nhất',
            B: 'Một object với state và setState',
            C: 'Một mảng gồm [state, setState]',
            D: 'Một function để cập nhật state',
            correct: ['C'],
        },
        explanation: 'useState trả về một mảng gồm 2 phần tử: giá trị state hiện tại và function để cập nhật state.',
        points: 1,
        sort: 1,
    },
    {
        id: 'qq13',
        quiz_id: 'q4',
        question: 'useEffect với dependency array rỗng [] sẽ chạy khi nào?',
        type: 'single',
        options: {
            A: 'Mỗi lần render',
            B: 'Chỉ một lần sau lần render đầu tiên',
            C: 'Không bao giờ chạy',
            D: 'Khi component unmount',
            correct: ['B'],
        },
        explanation:
            'Dependency array rỗng [] nghĩa là effect chỉ chạy một lần sau lần mount đầu tiên, giống componentDidMount.',
        points: 1,
        sort: 2,
    },
    {
        id: 'qq14',
        quiz_id: 'q4',
        question: 'Khi nào nên sử dụng useCallback?',
        type: 'multiple',
        options: {
            A: 'Khi truyền callback xuống component con được memo',
            B: 'Cho tất cả các function',
            C: 'Khi function là dependency của useEffect',
            D: 'Khi muốn tối ưu re-render',
            correct: ['A', 'C', 'D'],
        },
        explanation:
            'useCallback hữu ích khi truyền callback cho memo components, làm dependency của hooks, và tối ưu re-render.',
        points: 2,
        sort: 3,
    },
];

export const mockQuizAttempts = [
    {
        id: 'qa1',
        user_id: 'u1',
        user: { id: 'u1', first_name: 'Nguyễn', last_name: 'Văn A' },
        quiz_id: 'q1',
        quiz: { id: 'q1', title: 'Kiểm tra Module 1: Giới thiệu công ty' },
        enrollment_id: 'e1',
        answers: {
            qq1: 'B',
            qq2: 'C',
            qq3: ['A', 'B', 'D'],
            qq4: 'B',
            qq5: 'Công ty hướng đến đổi mới công nghệ để phục vụ khách hàng tốt hơn.',
        },
        score: 85,
        is_passed: true,
        started_at: '2024-02-10T10:00:00Z',
        submitted_at: '2024-02-10T10:12:30Z',
    },
    {
        id: 'qa2',
        user_id: 'u2',
        user: { id: 'u2', first_name: 'Trần', last_name: 'Thị B' },
        quiz_id: 'q1',
        quiz: { id: 'q1', title: 'Kiểm tra Module 1: Giới thiệu công ty' },
        enrollment_id: 'e3',
        answers: {
            qq1: 'B',
            qq2: 'C',
            qq3: ['A', 'B', 'D'],
            qq4: 'B',
            qq5: 'Phát triển bền vững cùng khách hàng.',
        },
        score: 100,
        is_passed: true,
        started_at: '2024-01-25T14:00:00Z',
        submitted_at: '2024-01-25T14:10:15Z',
    },
    {
        id: 'qa3',
        user_id: 'u3',
        user: { id: 'u3', first_name: 'Lê', last_name: 'Văn C' },
        quiz_id: 'q4',
        quiz: { id: 'q4', title: 'Quiz: React Hooks' },
        enrollment_id: 'e5',
        answers: {
            qq12: 'B', // Wrong
            qq13: 'B',
            qq14: ['A', 'B'], // Partially correct
        },
        score: 50,
        is_passed: false,
        started_at: '2024-02-01T09:00:00Z',
        submitted_at: '2024-02-01T09:15:45Z',
    },
    {
        id: 'qa4',
        user_id: 'u3',
        user: { id: 'u3', first_name: 'Lê', last_name: 'Văn C' },
        quiz_id: 'q4',
        quiz: { id: 'q4', title: 'Quiz: React Hooks' },
        enrollment_id: 'e5',
        answers: {
            qq12: 'C',
            qq13: 'B',
            qq14: ['A', 'C', 'D'],
        },
        score: 100,
        is_passed: true,
        started_at: '2024-02-02T10:00:00Z',
        submitted_at: '2024-02-02T10:18:20Z',
    },
    {
        id: 'qa5',
        user_id: 'u5',
        user: { id: 'u5', first_name: 'Hoàng', last_name: 'Văn E' },
        quiz_id: 'q4',
        quiz: { id: 'q4', title: 'Quiz: React Hooks' },
        enrollment_id: 'e9',
        answers: {
            qq12: 'C',
            qq13: 'B',
            qq14: ['A', 'C', 'D'],
        },
        score: 100,
        is_passed: true,
        started_at: '2024-02-25T11:00:00Z',
        submitted_at: '2024-02-25T11:14:00Z',
    },
];

/**
 * Helper to get questions by quiz ID
 */
export const getQuestionsByQuizId = quizId => {
    return mockQuizQuestions.filter(q => q.quiz_id === quizId);
};

/**
 * Helper to get attempts by user ID
 */
export const getAttemptsByUserId = userId => {
    return mockQuizAttempts.filter(a => a.user_id === userId);
};

/**
 * Helper to get attempts by quiz ID
 */
export const getAttemptsByQuizId = quizId => {
    return mockQuizAttempts.filter(a => a.quiz_id === quizId);
};
