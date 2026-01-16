import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    Divider,
} from 'antd';
import {
    TrophyOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    HomeOutlined,
    RightOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * Quiz Result Page
 * Hiển thị kết quả sau khi hoàn thành bài kiểm tra
 */
function QuizResultPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get result data from navigation state
    const resultData = location.state || {
        score: 80,
        passed: true,
        correctCount: 4,
        totalQuestions: 5,
        timeTaken: 600,
        answers: {},
        questions: [],
    };

    const { score, passed, correctCount, totalQuestions, timeTaken, answers, questions } = resultData;

    // Format time
    const formatTime = seconds => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} phút ${secs} giây`;
    };

    // Get result status
    const getResultStatus = () => {
        if (score >= 90) return { icon: '🎉', text: 'Xuất sắc!', color: '#52c41a' };
        if (score >= 70) return { icon: '👍', text: 'Tốt lắm!', color: '#52c41a' };
        if (score >= 50) return { icon: '💪', text: 'Cần cố gắng thêm!', color: '#faad14' };
        return { icon: '📚', text: 'Hãy ôn tập và thử lại!', color: '#ff4d4f' };
    };

    const resultStatus = getResultStatus();

    // Check answer correctness
    const isCorrect = (question, userAnswer) => {
        let options = question.options;
        if (typeof options === 'string') {
            try {
                options = JSON.parse(options);
            } catch (e) {
                options = {};
            }
        }

        // Handle options wrapper if necessary
        if (!Array.isArray(options) && options?.options) {
            options = options; // it's the wrapper
        }

        const correctArr = options.correct; // Might be array or string

        if (question.type === 'multiple') {
            const correctIds = Array.isArray(correctArr) ? correctArr : [correctArr];
            return (
                Array.isArray(userAnswer) &&
                userAnswer.length === correctIds.length &&
                userAnswer.every(a => correctIds.includes(a))
            );
        }

        // Single
        const correctId = Array.isArray(correctArr) ? correctArr[0] : correctArr;
        return userAnswer === correctId;
    };

    // Helper to get options array from question
    const getOptions = question => {
        let opts = question.options;
        if (typeof opts === 'string') {
            try {
                opts = JSON.parse(opts);
            } catch (e) {
                opts = [];
            }
        }
        // Handle wrapper
        if (!Array.isArray(opts) && opts?.options) return opts.options;
        if (Array.isArray(opts)) return opts;
        return [];
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Result Card */}
                <Card style={{ marginBottom: 24, textAlign: 'center' }}>
                    <Result
                        icon={<div style={{ fontSize: 80 }}>{passed ? '🎊' : '📖'}</div>}
                        status={passed ? 'success' : 'warning'}
                        title={
                            <Space direction="vertical" size={0}>
                                <Text style={{ fontSize: 24, color: resultStatus.color }}>
                                    {resultStatus.icon} {resultStatus.text}
                                </Text>
                                <Title level={2} style={{ margin: '16px 0' }}>
                                    {passed ? 'Bạn đã vượt qua bài kiểm tra!' : 'Chưa đạt điểm yêu cầu'}
                                </Title>
                            </Space>
                        }
                        subTitle={
                            passed
                                ? 'Chúc mừng bạn đã hoàn thành bài kiểm tra!'
                                : 'Đừng nản lòng, hãy ôn tập và thử lại nhé!'
                        }
                    />

                    {/* Score display */}
                    <div style={{ marginBottom: 32 }}>
                        <Progress
                            type="circle"
                            percent={score}
                            size={180}
                            strokeColor={passed ? '#52c41a' : '#ff4d4f'}
                            format={percent => (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 48,
                                            fontWeight: 'bold',
                                            color: passed ? '#52c41a' : '#ff4d4f',
                                        }}
                                    >
                                        {percent}
                                    </div>
                                    <div style={{ fontSize: 16, color: '#999' }}>điểm</div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Stats */}
                    <Row gutter={24} justify="center" style={{ marginBottom: 24 }}>
                        <Col xs={12} sm={8}>
                            <Statistic
                                title="Câu đúng"
                                value={correctCount}
                                suffix={`/ ${totalQuestions}`}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Col>
                        <Col xs={12} sm={8}>
                            <Statistic
                                title="Câu sai"
                                value={totalQuestions - correctCount}
                                suffix={`/ ${totalQuestions}`}
                                valueStyle={{ color: '#ff4d4f' }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Col>
                        <Col xs={12} sm={8}>
                            <Statistic
                                title="Thời gian"
                                value={formatTime(timeTaken)}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Col>
                    </Row>

                    {/* Action buttons */}
                    <Space size="large" wrap>
                        <Button size="large" icon={<HomeOutlined />} onClick={() => navigate('/my-courses')}>
                            Quay lại khóa học
                        </Button>
                        {!passed && (
                            <Button
                                type="primary"
                                size="large"
                                icon={<ReloadOutlined />}
                                onClick={() => navigate(`/quiz/${quizId}`)}
                            >
                                Làm lại bài kiểm tra
                            </Button>
                        )}
                        {passed && (
                            <Button
                                type="primary"
                                size="large"
                                icon={<RightOutlined />}
                                onClick={() => navigate('/my-courses')}
                            >
                                Tiếp tục học
                            </Button>
                        )}
                    </Space>
                </Card>

                {/* Answer Review */}
                {questions.length > 0 && (
                    <Card title="Xem lại đáp án" style={{ marginBottom: 24 }}>
                        <Collapse accordion>
                            {questions.map((question, index) => {
                                const userAnswer = answers[question.id];
                                const correct = isCorrect(question, userAnswer);

                                const optionsList = getOptions(question);
                                const correctArr = question.options?.correct || question.options?.options?.correct; // handle wrapper
                                const correctIds = Array.isArray(correctArr) ? correctArr : [correctArr];

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
                                                <Text>{question.question}</Text>
                                                <Tag color={correct ? 'success' : 'error'}>
                                                    {correct ? 'Đúng' : 'Sai'}
                                                </Tag>
                                            </Space>
                                        }
                                    >
                                        <List
                                            dataSource={optionsList}
                                            renderItem={option => {
                                                const isUserAnswer =
                                                    question.type === 'multiple'
                                                        ? userAnswer?.includes(option.id)
                                                        : userAnswer === option.id;
                                                const isCorrectAnswer = correctIds.includes(option.id);

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
                                                            <Text strong>{option.id.toUpperCase()}.</Text>
                                                            <Text>{option.text}</Text>
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
                                    </Collapse.Panel>
                                );
                            })}
                        </Collapse>
                    </Card>
                )}

                {/* Tips */}
                {!passed && (
                    <Card title="💡 Gợi ý cải thiện">
                        <Paragraph>
                            <ul>
                                <li>Xem lại các bài học liên quan đến những câu bạn trả lời sai</li>
                                <li>Ghi chú những điểm quan trọng để nhớ lâu hơn</li>
                                <li>Thử làm lại bài kiểm tra sau khi đã ôn tập kỹ</li>
                                <li>Không vội vàng - hãy đọc kỹ câu hỏi trước khi trả lời</li>
                            </ul>
                        </Paragraph>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default QuizResultPage;
