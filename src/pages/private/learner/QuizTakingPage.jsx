import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Radio,
    Checkbox,
    Space,
    Typography,
    Progress,
    Tag,
    Modal,
    Result,
    message,
    Spin,
    Row,
    Col,
    Affix,
} from 'antd';
import {
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
    CheckOutlined,
    ExclamationCircleOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { mockQuizzes } from '../../../mocks';

const { Title, Text, Paragraph } = Typography;

/**
 * Quiz Taking Page
 * Giao diện làm bài kiểm tra với countdown timer
 */
function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Get quiz data
    const quiz = useMemo(() => {
        return mockQuizzes.find(q => q.id === quizId);
    }, [quizId]);

    // Mock questions for this quiz
    const questions = useMemo(() => {
        return [
            {
                id: 'q1',
                question: 'React là gì?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Một thư viện JavaScript để xây dựng giao diện người dùng' },
                    { id: 'b', text: 'Một framework backend' },
                    { id: 'c', text: 'Một cơ sở dữ liệu' },
                    { id: 'd', text: 'Một ngôn ngữ lập trình mới' },
                ],
                correctAnswer: 'a',
            },
            {
                id: 'q2',
                question: 'Hook nào được sử dụng để quản lý state trong functional component?',
                type: 'single',
                options: [
                    { id: 'a', text: 'useEffect' },
                    { id: 'b', text: 'useState' },
                    { id: 'c', text: 'useContext' },
                    { id: 'd', text: 'useRef' },
                ],
                correctAnswer: 'b',
            },
            {
                id: 'q3',
                question: 'Chọn các hook hợp lệ trong React (chọn nhiều đáp án):',
                type: 'multiple',
                options: [
                    { id: 'a', text: 'useState' },
                    { id: 'b', text: 'useEffect' },
                    { id: 'c', text: 'useClass' },
                    { id: 'd', text: 'useMemo' },
                ],
                correctAnswer: ['a', 'b', 'd'],
            },
            {
                id: 'q4',
                question: 'Virtual DOM trong React giúp tối ưu hiệu suất bằng cách nào?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Loại bỏ hoàn toàn DOM thực' },
                    { id: 'b', text: 'So sánh và chỉ cập nhật các phần thay đổi' },
                    { id: 'c', text: 'Tăng tốc độ mạng' },
                    { id: 'd', text: 'Giảm kích thước file' },
                ],
                correctAnswer: 'b',
            },
            {
                id: 'q5',
                question: 'JSX là gì?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Một ngôn ngữ lập trình mới' },
                    { id: 'b', text: 'Cú pháp mở rộng cho JavaScript cho phép viết HTML trong JS' },
                    { id: 'c', text: 'Một framework CSS' },
                    { id: 'd', text: 'Một thư viện animation' },
                ],
                correctAnswer: 'b',
            },
        ];
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / totalQuestions) * 100);

    // Initialize timer
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            // Set time limit (in seconds)
            if (quiz?.time_limit) {
                setTimeLeft(quiz.time_limit * 60);
            } else {
                setTimeLeft(30 * 60); // Default 30 minutes
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [quiz]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Format time
    const formatTime = seconds => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get time color
    const getTimeColor = () => {
        if (timeLeft === null) return '#1890ff';
        if (timeLeft <= 60) return '#ff4d4f';
        if (timeLeft <= 300) return '#faad14';
        return '#52c41a';
    };

    // Handle answer change
    const handleAnswerChange = value => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value,
        }));
    };

    // Navigation
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleGoToQuestion = index => {
        setCurrentQuestionIndex(index);
    };

    // Submit
    const handleAutoSubmit = () => {
        message.warning('Hết thời gian! Bài làm đã được nộp tự động.');
        doSubmit();
    };

    const handleSubmit = () => {
        const unanswered = totalQuestions - answeredCount;
        if (unanswered > 0) {
            setShowConfirmSubmit(true);
        } else {
            doSubmit();
        }
    };

    const doSubmit = () => {
        setIsSubmitting(true);

        // Calculate score
        let correctCount = 0;
        questions.forEach(q => {
            const userAnswer = answers[q.id];
            if (q.type === 'multiple') {
                const isCorrect =
                    Array.isArray(userAnswer) &&
                    userAnswer.length === q.correctAnswer.length &&
                    userAnswer.every(a => q.correctAnswer.includes(a));
                if (isCorrect) correctCount++;
            } else {
                if (userAnswer === q.correctAnswer) correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= (quiz?.pass_score || 70);

        // Navigate to result page
        setTimeout(() => {
            navigate(`/quiz/${quizId}/result`, {
                state: {
                    score,
                    passed,
                    correctCount,
                    totalQuestions,
                    answers,
                    questions,
                    timeTaken: quiz?.time_limit ? quiz.time_limit * 60 - timeLeft : 0,
                },
            });
        }, 500);
    };

    if (!quiz) {
        return (
            <Result
                status="404"
                title="Không tìm thấy bài kiểm tra"
                extra={
                    <Button type="primary" onClick={() => navigate('/my-courses')}>
                        Quay lại khóa học
                    </Button>
                }
            />
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" tip="Đang tải bài kiểm tra..." />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
            <Row gutter={24}>
                {/* Main content */}
                <Col xs={24} lg={18}>
                    {/* Header */}
                    <Card style={{ marginBottom: 16 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 16,
                            }}
                        >
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {quiz.title}
                                </Title>
                                <Text type="secondary">
                                    Câu {currentQuestionIndex + 1} / {totalQuestions}
                                </Text>
                            </div>
                            <Space size="large">
                                {/* Timer */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 16px',
                                        background: timeLeft <= 60 ? '#fff1f0' : '#f6ffed',
                                        borderRadius: 8,
                                        border: `1px solid ${getTimeColor()}`,
                                    }}
                                >
                                    <ClockCircleOutlined style={{ color: getTimeColor(), fontSize: 20 }} />
                                    <Text
                                        strong
                                        style={{
                                            fontSize: 24,
                                            color: getTimeColor(),
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {formatTime(timeLeft)}
                                    </Text>
                                </div>
                            </Space>
                        </div>
                        <Progress
                            percent={progress}
                            strokeColor="#ea4544"
                            style={{ marginTop: 16 }}
                            format={() => `${answeredCount}/${totalQuestions} đã trả lời`}
                        />
                    </Card>

                    {/* Question */}
                    <Card style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {/* Question text */}
                            <div>
                                <Tag color={currentQuestion.type === 'multiple' ? 'purple' : 'blue'}>
                                    {currentQuestion.type === 'multiple' ? 'Chọn nhiều' : 'Chọn một'}
                                </Tag>
                                <Title level={4} style={{ marginTop: 12 }}>
                                    {currentQuestionIndex + 1}. {currentQuestion.question}
                                </Title>
                            </div>

                            {/* Options */}
                            {currentQuestion.type === 'single' ? (
                                <Radio.Group
                                    value={answers[currentQuestion.id]}
                                    onChange={e => handleAnswerChange(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        {currentQuestion.options.map(option => (
                                            <Radio
                                                key={option.id}
                                                value={option.id}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 8,
                                                    background:
                                                        answers[currentQuestion.id] === option.id ? '#fff1f0' : '#fff',
                                                }}
                                            >
                                                <Text strong>{option.id.toUpperCase()}.</Text> {option.text}
                                            </Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                            ) : (
                                <Checkbox.Group
                                    value={answers[currentQuestion.id] || []}
                                    onChange={handleAnswerChange}
                                    style={{ width: '100%' }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        {currentQuestion.options.map(option => (
                                            <Checkbox
                                                key={option.id}
                                                value={option.id}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 8,
                                                    background: answers[currentQuestion.id]?.includes(option.id)
                                                        ? '#fff1f0'
                                                        : '#fff',
                                                }}
                                            >
                                                <Text strong>{option.id.toUpperCase()}.</Text> {option.text}
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                            )}
                        </Space>
                    </Card>

                    {/* Navigation buttons */}
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                            <Button
                                size="large"
                                icon={<LeftOutlined />}
                                disabled={currentQuestionIndex === 0}
                                onClick={handlePrevious}
                            >
                                Câu trước
                            </Button>

                            {currentQuestionIndex === totalQuestions - 1 ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckOutlined />}
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                >
                                    Nộp bài
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<RightOutlined />}
                                    iconPosition="end"
                                    onClick={handleNext}
                                >
                                    Câu tiếp theo
                                </Button>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Question navigation sidebar */}
                <Col xs={24} lg={6}>
                    <Affix offsetTop={24}>
                        <Card title="Danh sách câu hỏi" size="small">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: 8,
                                }}
                            >
                                {questions.map((q, index) => {
                                    const isAnswered = answers[q.id] !== undefined;
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <Button
                                            key={q.id}
                                            size="small"
                                            type={isCurrent ? 'primary' : isAnswered ? 'default' : 'dashed'}
                                            onClick={() => handleGoToQuestion(index)}
                                            style={{
                                                background: isCurrent ? '#ea4544' : isAnswered ? '#f6ffed' : undefined,
                                                borderColor: isAnswered && !isCurrent ? '#52c41a' : undefined,
                                                color: isAnswered && !isCurrent ? '#52c41a' : undefined,
                                            }}
                                        >
                                            {index + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <Space size="small">
                                    <Tag color="success">Đã trả lời</Tag>
                                    <Tag>Chưa trả lời</Tag>
                                </Space>
                            </div>

                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<CheckOutlined />}
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                style={{ marginTop: 16 }}
                            >
                                Nộp bài
                            </Button>
                        </Card>
                    </Affix>
                </Col>
            </Row>

            {/* Confirm submit modal */}
            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        <span>Xác nhận nộp bài</span>
                    </Space>
                }
                open={showConfirmSubmit}
                onCancel={() => setShowConfirmSubmit(false)}
                onOk={doSubmit}
                okText="Nộp bài"
                cancelText="Tiếp tục làm"
                okButtonProps={{ danger: true }}
            >
                <Paragraph>
                    Bạn còn{' '}
                    <Text strong style={{ color: '#ff4d4f' }}>
                        {totalQuestions - answeredCount}
                    </Text>{' '}
                    câu chưa trả lời.
                </Paragraph>
                <Paragraph>Bạn có chắc chắn muốn nộp bài không?</Paragraph>
            </Modal>
        </div>
    );
}

export default QuizTakingPage;
