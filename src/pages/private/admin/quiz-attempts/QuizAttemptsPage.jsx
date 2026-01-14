import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Tag, Space, Input, Select, Row, Col, Statistic, Typography, Button, Tooltip } from 'antd';
import {
    HistoryOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TrophyOutlined,
    PercentageOutlined,
    EyeOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { useQuizAttempts, useQuizAttemptsStats, useQuizzesForFilter } from '../../../../hooks/useQuizAttempts';
import dayjs from 'dayjs';

const { Search } = Input;
const { Text } = Typography;

const DEFAULT_FILTERS = {
    search: '',
    quizId: undefined,
    passed: undefined,
    page: 1,
    limit: 10,
};

/**
 * Quiz Attempts Page (Admin)
 * Trang quản lý lịch sử làm bài kiểm tra
 */
function QuizAttemptsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    // Queries
    const { data: attemptsData, isLoading } = useQuizAttempts(filters);
    const { data: stats } = useQuizAttemptsStats();
    const { data: quizzes } = useQuizzesForFilter();

    // Handlers
    const handleSearch = value => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    const handleTableChange = pagination => {
        setFilters(prev => ({
            ...prev,
            page: pagination.current,
            limit: pagination.pageSize,
        }));
    };

    const handleViewDetail = attemptId => {
        // Navigate to learner detail page (admin can view too)
        navigate(`/quiz-history/${attemptId}`);
    };

    // Format time duration
    const formatDuration = (startedAt, submittedAt) => {
        if (!startedAt || !submittedAt) return 'N/A';
        const start = dayjs(startedAt);
        const end = dayjs(submittedAt);
        const diffMinutes = end.diff(start, 'minute');
        return `${diffMinutes} phút`;
    };

    // Table columns
    const columns = [
        {
            title: 'Người dùng',
            dataIndex: 'user',
            key: 'user',
            width: 180,
            render: user => (
                <Text strong>
                    {user?.first_name} {user?.last_name}
                </Text>
            ),
        },
        {
            title: 'Bài kiểm tra',
            dataIndex: 'quiz',
            key: 'quiz',
            width: 250,
            ellipsis: true,
            render: quiz => quiz?.title || 'N/A',
        },
        {
            title: 'Điểm',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.score - b.score,
            render: score => (
                <Text strong style={{ fontSize: 16, color: score >= 70 ? '#52c41a' : '#ff4d4f' }}>
                    {score}
                </Text>
            ),
        },
        {
            title: 'Kết quả',
            dataIndex: 'is_passed',
            key: 'is_passed',
            width: 100,
            align: 'center',
            render: isPassed => (
                <Tag
                    color={isPassed ? 'success' : 'error'}
                    icon={isPassed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                    {isPassed ? 'Đạt' : 'Chưa đạt'}
                </Tag>
            ),
        },
        {
            title: 'Thời gian làm',
            key: 'duration',
            width: 120,
            align: 'center',
            render: (_, record) => formatDuration(record.started_at, record.submitted_at),
        },
        {
            title: 'Ngày làm',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            width: 150,
            sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
            defaultSortOrder: 'descend',
            render: date => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
                </Tooltip>
            ),
        },
    ];

    // Quiz options for filter
    const quizOptions =
        quizzes?.map(q => ({
            value: q.id,
            label: q.title,
        })) || [];

    return (
        <div>
            <PageHeader
                title="Lịch sử Bài kiểm tra"
                subtitle="Quản lý và theo dõi kết quả làm bài của học viên"
                breadcrumbs={[{ title: 'Lịch sử Bài kiểm tra' }]}
            />

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng lượt làm"
                            value={stats?.totalAttempts || 0}
                            prefix={<HistoryOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đạt yêu cầu"
                            value={stats?.passedAttempts || 0}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Điểm trung bình"
                            value={stats?.averageScore || 0}
                            suffix="điểm"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tỷ lệ đạt"
                            value={stats?.passRate || 0}
                            suffix="%"
                            prefix={<PercentageOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Search
                        placeholder="Tìm kiếm tên học viên, bài kiểm tra..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 280 }}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        placeholder="Bài kiểm tra"
                        allowClear
                        value={filters.quizId}
                        onChange={value => handleFilterChange('quizId', value)}
                        options={quizOptions}
                        style={{ width: 200 }}
                        showSearch
                        optionFilterProp="label"
                    />
                    <Select
                        placeholder="Kết quả"
                        allowClear
                        value={filters.passed}
                        onChange={value => handleFilterChange('passed', value)}
                        style={{ width: 130 }}
                        options={[
                            { value: 'true', label: 'Đạt' },
                            { value: 'false', label: 'Chưa đạt' },
                        ]}
                    />
                </Space>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={attemptsData?.data || []}
                    loading={isLoading}
                    pagination={{
                        current: filters.page,
                        pageSize: filters.limit,
                        total: attemptsData?.total || 0,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} lượt làm bài`,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1100 }}
                />
            </Card>
        </div>
    );
}

export default QuizAttemptsPage;
