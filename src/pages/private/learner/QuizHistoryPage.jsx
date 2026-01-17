import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Space, Input, Select, Empty, Typography, Row, Col, Statistic, Spin, Pagination } from 'antd';
import {
    HistoryOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    TrophyOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useMyQuizAttempts } from '../../../hooks/useQuizAttempts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const DEFAULT_FILTERS = {
    search: '',
    passed: undefined,
    page: 1,
    limit: 10,
};

/**
 * Quiz History Page
 * Trang lịch sử làm bài kiểm tra cho Learner
 */
function QuizHistoryPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    // Query attempts
    const { data: attemptsData, isLoading } = useMyQuizAttempts(filters);

    // Handlers
    const handleSearch = value => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handlePassedFilter = value => {
        setFilters(prev => ({ ...prev, passed: value, page: 1 }));
    };

    const handlePageChange = (page, pageSize) => {
        setFilters(prev => ({ ...prev, page, limit: pageSize }));
    };

    const handleViewDetail = attemptId => {
        navigate(`/quiz-history/${attemptId}`);
    };

    const handleRetake = quizId => {
        navigate(`/quiz/${quizId}`);
    };

    // Format time duration
    const formatDuration = (startedAt, submittedAt) => {
        const start = dayjs(startedAt);
        const end = dayjs(submittedAt);
        const diffMinutes = end.diff(start, 'minute');
        const diffSeconds = end.diff(start, 'second') % 60;
        return `${diffMinutes} phút ${diffSeconds} giây`;
    };

    // Calculate stats
    const stats = {
        total: attemptsData?.total || 0,
        passed: attemptsData?.data?.filter(a => a.is_passed).length || 0,
        avgScore:
            attemptsData?.data?.length > 0
                ? Math.round(attemptsData.data.reduce((sum, a) => sum + a.score, 0) / attemptsData.data.length)
                : 0,
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    <HistoryOutlined style={{ marginRight: 12, color: '#ea4544' }} />
                    Lịch sử Bài kiểm tra
                </Title>
                <Text type="secondary">Xem lại kết quả các bài kiểm tra bạn đã làm</Text>
            </div>

            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={8}>
                    <Card size="small">
                        <Statistic
                            title="Tổng bài đã làm"
                            value={stats.total}
                            prefix={<HistoryOutlined />}
                            styles={{ content: { color: '#1890ff' } }}
                        />
                    </Card>
                </Col>
                <Col xs={8}>
                    <Card size="small">
                        <Statistic
                            title="Bài đạt"
                            value={stats.passed}
                            prefix={<TrophyOutlined />}
                            styles={{ content: { color: '#52c41a' } }}
                        />
                    </Card>
                </Col>
                <Col xs={8}>
                    <Card size="small">
                        <Statistic
                            title="Điểm trung bình"
                            value={stats.avgScore}
                            suffix="điểm"
                            prefix={<CheckCircleOutlined />}
                            styles={{ content: { color: '#722ed1' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Space wrap>
                    <Search
                        placeholder="Tìm kiếm bài kiểm tra..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        placeholder="Kết quả"
                        allowClear
                        value={filters.passed}
                        onChange={handlePassedFilter}
                        style={{ width: 150 }}
                        options={[
                            { value: 'true', label: 'Đạt' },
                            { value: 'false', label: 'Chưa đạt' },
                        ]}
                    />
                </Space>
            </Card>

            {/* Attempts List */}
            <Spin spinning={isLoading}>
                {attemptsData?.data?.length > 0 ? (
                    <div className="attempts-list">
                        {attemptsData.data.map(attempt => (
                            <Card key={attempt.id} style={{ marginBottom: 16 }} hoverable onClick={() => handleViewDetail(attempt.id)}>
                                <Row gutter={16} align="middle">
                                    {/* Quiz Info */}
                                    <Col xs={24} sm={12}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {attempt.quiz?.title || 'Bài kiểm tra'}
                                            </Text>
                                            <Space size={16}>
                                                <Text type="secondary">
                                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                    {formatDuration(attempt.started_at, attempt.submitted_at)}
                                                </Text>
                                                <Text type="secondary">
                                                    {dayjs(attempt.submitted_at).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                            </Space>
                                        </div>
                                    </Col>

                                    {/* Score */}
                                    <Col xs={12} sm={6} style={{ textAlign: 'center' }}>
                                        <div>
                                            <Text
                                                style={{
                                                    fontSize: 28,
                                                    fontWeight: 'bold',
                                                    color: attempt.is_passed ? '#52c41a' : '#ff4d4f',
                                                }}
                                            >
                                                {attempt.score}
                                            </Text>
                                            <Text type="secondary"> điểm</Text>
                                        </div>
                                        <Tag
                                            color={attempt.is_passed ? 'success' : 'error'}
                                            icon={attempt.is_passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                        >
                                            {attempt.is_passed ? 'Đạt' : 'Chưa đạt'}
                                        </Tag>
                                    </Col>

                                    {/* Actions */}
                                    <Col xs={12} sm={6} style={{ textAlign: 'right' }}>
                                        <Space>
                                            <Button
                                                icon={<EyeOutlined />}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleViewDetail(attempt.id);
                                                }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            <Button
                                                type="primary"
                                                ghost
                                                icon={<ReloadOutlined />}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleRetake(attempt.quiz_id);
                                                }}
                                            >
                                                Làm lại
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={filters.page}
                                pageSize={filters.limit}
                                total={attemptsData.total}
                                onChange={handlePageChange}
                                showSizeChanger
                                showTotal={total => `Tổng ${total} lượt làm bài`}
                            />
                        </div>
                    </div>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                {filters.search || filters.passed
                                    ? 'Không tìm thấy kết quả phù hợp'
                                    : 'Bạn chưa làm bài kiểm tra nào'}
                            </span>
                        }
                    >
                        {!filters.search && !filters.passed && (
                            <Button type="primary" onClick={() => navigate('/my-courses')}>
                                Khám phá khóa học
                            </Button>
                        )}
                    </Empty>
                )}
            </Spin>
        </div>
    );
}

export default QuizHistoryPage;
