import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Result,
    Button,
    Progress,
    Typography,
    Space,
    Tag,
    Collapse,
    List,
    Row,
    Col,
    Statistic,
    Spin,
    Skeleton,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    ArrowLeftOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useQuizAttemptDetail } from '../../../hooks/useQuizAttempts';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/**
 * Quiz Attempt Detail Page
 * Trang xem chi tiết lượt làm bài từ lịch sử
 */
function QuizAttemptDetailPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    // Query attempt detail
    const { data: attempt, isLoading, isError } = useQuizAttemptDetail(attemptId);

    // Format time duration
    const formatDuration = (startedAt, submittedAt) => {
        if (!startedAt || !submittedAt) return 'N/A';
        const start = dayjs(startedAt);
        const end = dayjs(submittedAt);
        const diffMinutes = end.diff(start, 'minute');
        const diffSeconds = end.diff(start, 'second') % 60;
        return `${diffMinutes} phút ${diffSeconds} giây`;
    };

    // Get result status
    const getResultStatus = score => {
        if (score >= 90) return { icon: '🎉', text: 'Xuất sắc!', color: '#52c41a' };
        if (score >= 70) return { icon: '👍', text: 'Tốt lắm!', color: '#52c41a' };
        if (score >= 50) return { icon: '💪', text: 'Cần cố gắng thêm!', color: '#faad14' };
        return { icon: '📚', text: 'Hãy ôn tập và thử lại!', color: '#ff4d4f' };
    };

    // Check answer correctness
    const isAnswerCorrect = (question, userAnswer) => {
        if (!question.options?.correct) return false;
        const correctAnswers = question.options.correct;

        if (question.type === 'multiple') {
            if (!Array.isArray(userAnswer)) return false;
            return userAnswer.length === correctAnswers.length && userAnswer.every(a => correctAnswers.includes(a));
        }
        return correctAnswers.includes(userAnswer);
    };

    // Count correct answers
    const countCorrectAnswers = () => {
        if (!attempt?.questions || !attempt?.answers) return 0;
        return attempt.questions.filter(q => isAnswerCorrect(q, attempt.answers[q.id])).length;
    };

    if (isLoading) {
        return (
            <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    if (isError || !attempt) {
        return (
            <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
                <Result
                    status="404"
                    title="Không tìm thấy"
                    subTitle="Lượt làm bài này không tồn tại hoặc bạn không có quyền xem."
                    extra={
                        <Button type="primary" onClick={() => navigate('/quiz-history')}>
                            Quay lại lịch sử
                        </Button>
                    }
                />
            </div>
        );
    }

    const resultStatus = getResultStatus(attempt.score);
    const correctCount = countCorrectAnswers();
    const totalQuestions = attempt.questions?.length || 0;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Back Button */}
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/quiz-history')}
                    style={{ marginBottom: 16 }}
                >
                    Quay lại lịch sử
                </Button>

                {/* Result Card */}
                <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
                    <Row gutter={[24, 16]} align="middle">
                        {/* Score Circle */}
                        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                            <Progress
                                type="circle"
                                percent={attempt.score}
                                size={80}
                                strokeColor={attempt.is_passed ? '#52c41a' : '#ff4d4f'}
                                format={percent => (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 'bold',
                                                color: attempt.is_passed ? '#52c41a' : '#ff4d4f',
                                            }}
                                        >
                                            {percent}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#999' }}>điểm</div>
                                    </div>
                                )}
                            />
                        </Col>

                        {/* Status and Info */}
                        <Col xs={24} sm={10}>
                            <Space direction="vertical" size={4}>
                                <Text style={{ fontSize: 16, fontWeight: 500, color: resultStatus.color }}>
                                    {resultStatus.icon} {resultStatus.text}
                                </Text>
                                <Text strong style={{ fontSize: 14 }}>
                                    {attempt.quiz?.title || 'Bài kiểm tra'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Làm bài: {dayjs(attempt.submitted_at).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            </Space>
                        </Col>

                        {/* Stats */}
                        <Col xs={24} sm={8}>
                            <Row gutter={[16, 8]}>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title={<span style={{ fontSize: 12 }}>Đúng</span>}
                                        value={correctCount}
                                        suffix={`/${totalQuestions}`}
                                        valueStyle={{ fontSize: 18, color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title={<span style={{ fontSize: 12 }}>Sai</span>}
                                        value={totalQuestions - correctCount}
                                        suffix={`/${totalQuestions}`}
                                        valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                                    />
                                </Col>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Thời gian</div>
                                        <div style={{ fontSize: 16, fontWeight: 500 }}>
                                            {formatDuration(attempt.started_at, attempt.submitted_at)}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Action buttons */}
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Space size="middle" wrap>
                            <Button icon={<HistoryOutlined />} onClick={() => navigate('/quiz-history')}>
                                Xem lịch sử khác
                            </Button>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => navigate(`/quiz/${attempt.quiz_id}`)}
                            >
                                Làm lại bài kiểm tra
                            </Button>
                        </Space>
                    </div>
                </Card>

                {/* Answer Review */}
                {attempt.questions && attempt.questions.length > 0 && (
                    <Card title="Xem lại đáp án" style={{ marginBottom: 24 }}>
                        <Collapse accordion>
                            {attempt.questions.map((question, index) => {
                                const userAnswer = attempt.answers?.[question.id];
                                const correct = isAnswerCorrect(question, userAnswer);

                                return (
                                    <Collapse.Panel
                                        key={question.id}
                                        header={
                                            <Space>
                                                {correct ? (
                                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                ) : (
                                                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                )}
                                                <Text strong>Câu {index + 1}:</Text>
                                                <Text ellipsis style={{ maxWidth: 400 }}>
                                                    {question.question}
                                                </Text>
                                                <Tag color={correct ? 'success' : 'error'}>
                                                    {correct ? 'Đúng' : 'Sai'}
                                                </Tag>
                                            </Space>
                                        }
                                    >
                                        {/* Question text */}
                                        <Paragraph strong style={{ marginBottom: 16 }}>
                                            {question.question}
                                        </Paragraph>

                                        {/* Options */}
                                        {question.type !== 'text' && question.options && (
                                            <List
                                                dataSource={Object.entries(question.options).filter(
                                                    ([key]) => key !== 'correct'
                                                )}
                                                renderItem={([key, value]) => {
                                                    const isUserAnswer = Array.isArray(userAnswer)
                                                        ? userAnswer.includes(key)
                                                        : userAnswer === key;
                                                    const isCorrectAnswer = question.options.correct?.includes(key);

                                                    let background = '#fff';
                                                    let borderColor = '#d9d9d9';

                                                    if (isCorrectAnswer) {
                                                        background = '#f6ffed';
                                                        borderColor = '#52c41a';
                                                    }
                                                    if (isUserAnswer && !isCorrectAnswer) {
                                                        background = '#fff1f0';
                                                        borderColor = '#ff4d4f';
                                                    }

                                                    return (
                                                        <List.Item
                                                            style={{
                                                                padding: '12px 16px',
                                                                marginBottom: 8,
                                                                border: `1px solid ${borderColor}`,
                                                                borderRadius: 8,
                                                                background,
                                                            }}
                                                        >
                                                            <Space>
                                                                <Text strong>{key}.</Text>
                                                                <Text>{value}</Text>
                                                                {isCorrectAnswer && (
                                                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                                                        Đáp án đúng
                                                                    </Tag>
                                                                )}
                                                                {isUserAnswer && !isCorrectAnswer && (
                                                                    <Tag color="error">Bạn đã chọn</Tag>
                                                                )}
                                                                {isUserAnswer && isCorrectAnswer && (
                                                                    <Tag color="success">Bạn đã chọn đúng</Tag>
                                                                )}
                                                            </Space>
                                                        </List.Item>
                                                    );
                                                }}
                                            />
                                        )}

                                        {/* Text answer */}
                                        {question.type === 'text' && (
                                            <div
                                                style={{
                                                    padding: 16,
                                                    background: '#f5f5f5',
                                                    borderRadius: 8,
                                                    marginBottom: 16,
                                                }}
                                            >
                                                <Text strong>Câu trả lời của bạn:</Text>
                                                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                                                    {userAnswer || '(Không trả lời)'}
                                                </Paragraph>
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        {question.explanation && (
                                            <div
                                                style={{
                                                    padding: 16,
                                                    background: '#e6f7ff',
                                                    borderRadius: 8,
                                                    marginTop: 16,
                                                }}
                                            >
                                                <Text strong>Giải thích: </Text>
                                                <Text>{question.explanation}</Text>
                                            </div>
                                        )}
                                    </Collapse.Panel>
                                );
                            })}
                        </Collapse>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default QuizAttemptDetailPage;
