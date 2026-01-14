import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Typography, Space, Progress, Tag, Button, Statistic, Row, Col, Tooltip, Tabs } from 'antd';
import {
    ArrowLeftOutlined,
    BarChartOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    UserOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { useQuizAnalysis } from '../../../../hooks/useQuizAttempts';
import { mockQuizzes } from '../../../../mocks';
import QuizAttemptList from './components/QuizAttemptList';

const { Text, Paragraph } = Typography;

/**
 * Quiz Analysis Page
 * Trang phân tích chi tiết câu hỏi của một bài kiểm tra
 */
function QuizAnalysisPage() {
    const { id: quizId } = useParams();
    const navigate = useNavigate();

    // Get quiz info (mock)
    const quiz = mockQuizzes.find(q => q.id === quizId);

    // Get analysis data
    const { data: analysisData, isLoading } = useQuizAnalysis(quizId);

    if (!quiz) {
        return <div>Quiz not found</div>;
    }

    const { summary, questions } = analysisData || {};

    // Columns for analysis table
    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: '40%',
            render: (text, record) => (
                <div>
                    <Paragraph ellipsis={{ rows: 2, tooltip: text }} style={{ marginBottom: 4 }}>
                        <Text strong>{text}</Text>
                    </Paragraph>
                    <Space size={4}>
                        <Tag>{record.type === 'multiple' ? 'Nhiều đáp án' : 'Một đáp án'}</Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: 'Độ khó (Tỷ lệ đúng)',
            dataIndex: ['stats', 'correctRate'],
            key: 'correctRate',
            width: 200,
            sorter: (a, b) => (a.stats?.correctRate || 0) - (b.stats?.correctRate || 0),
            render: (rate, record) => {
                if (!record.stats) return <Text type="secondary">Chưa có dữ liệu</Text>;

                let status = 'normal';
                let color = '#1890ff';

                if (rate < 40) {
                    status = 'exception';
                    color = '#ff4d4f';
                } else if (rate > 90) {
                    status = 'success';
                    color = '#52c41a';
                }

                return (
                    <div style={{ width: 150 }}>
                        <Progress percent={rate} status={status} strokeColor={color} />
                    </div>
                );
            },
        },
        {
            title: 'Phân phối chọn',
            key: 'distribution',
            width: 300,
            render: (_, record) => {
                if (!record.stats) return <Text type="secondary">Chưa có dữ liệu</Text>;

                const { distribution, totalAnswers } = record.stats;
                if (!distribution || totalAnswers === 0) return null;

                // Sort keys A, B, C, D...
                const keys = Object.keys(distribution).sort();

                return (
                    <div style={{ display: 'flex', height: 24, gap: 2, alignItems: 'flex-end' }}>
                        {keys.map(key => {
                            const count = distribution[key];
                            const percent = Math.round((count / totalAnswers) * 100);
                            const isCorrect = record.options?.correct?.includes(key); // Check if this option is correct

                            // Determine color: Green if correct, Red if wrong but selected often (>20%), Grey otherwise
                            let color = '#d9d9d9';
                            if (isCorrect) color = '#52c41a';
                            else if (percent > 20) color = '#ff4d4f';

                            return (
                                <Tooltip
                                    key={key}
                                    title={`${key}: ${count} lượt (${percent}%) ${isCorrect ? '- ĐÚNG' : ''}`}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${percent || 5}%`,
                                                background: color,
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Text type="secondary" style={{ fontSize: 10 }}>
                                            {key}
                                        </Text>
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Đánh giá',
            key: 'status',
            width: 120,
            render: (_, record) => {
                if (!record.stats) return null;
                const { status } = record.stats;

                if (status === 'hard') {
                    return (
                        <Tag color="error" icon={<WarningOutlined />}>
                            Cần chú ý
                        </Tag>
                    );
                }
                if (status === 'easy') {
                    return <Tag color="success">Quá dễ</Tag>;
                }
                return <Tag color="blue">Ổn định</Tag>;
            },
        },
    ];

    const tabItems = [
        {
            key: 'stats',
            label: (
                <span>
                    <BarChartOutlined />
                    Thống kê chung
                </span>
            ),
            children: (
                <>
                    {/* Summary Cards */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Tổng lượt làm bài"
                                    value={summary?.totalAttempts || 0}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Điểm trung bình"
                                    value={summary?.averageScore || 0}
                                    prefix={<BarChartOutlined />}
                                    suffix="/ 100"
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Tỷ lệ đạt"
                                    value={summary?.passRate || 0}
                                    prefix={<CheckCircleOutlined />}
                                    suffix="%"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Analysis Table */}
                    <Card title="Chi tiết câu hỏi">
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={questions || []}
                            loading={isLoading}
                            pagination={false}
                        />
                    </Card>
                </>
            ),
        },
        {
            key: 'attempts',
            label: (
                <span>
                    <UnorderedListOutlined />
                    Danh sách bài làm
                </span>
            ),
            children: (
                <Card>
                    <QuizAttemptList quizId={quizId} />
                </Card>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title={`Phân tích: ${quiz.title}`}
                subtitle="Chi tiết hiệu quả từng câu hỏi và danh sách bài làm"
                breadcrumbs={[{ title: 'Bài kiểm tra', path: '/admin/quizzes' }, { title: 'Phân tích' }]}
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/quizzes')}>
                        Quay lại
                    </Button>
                }
            />

            <Tabs defaultActiveKey="stats" items={tabItems} />
        </div>
    );
}

export default QuizAnalysisPage;
