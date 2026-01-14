import { useState } from 'react';
import { Table, Tag, Button, Tooltip, Input, Select, Space, Typography } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQuizAttempts } from '../../../../../hooks/useQuizAttempts';

const { Text } = Typography;
const { Search } = Input;

function QuizAttemptList({ quizId }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        quizId,
        search: '',
        passed: undefined,
        page: 1,
        limit: 10,
    });

    // Query attempts for this specific quiz
    const { data: attemptsData, isLoading } = useQuizAttempts(filters);

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
        // Navigate to the admin detail page
        navigate(`/admin/quiz-attempts/${attemptId}`);
    };

    const formatDuration = (startedAt, submittedAt) => {
        if (!startedAt || !submittedAt) return 'N/A';
        const start = dayjs(startedAt);
        const end = dayjs(submittedAt);
        const diffMinutes = end.diff(start, 'minute');
        return `${diffMinutes} phút`;
    };

    const columns = [
        {
            title: 'Học viên',
            dataIndex: 'user',
            key: 'user',
            render: user => (
                <Text strong>
                    {user?.first_name} {user?.last_name}
                </Text>
            ),
        },
        {
            title: 'Điểm số',
            dataIndex: 'score',
            key: 'score',
            align: 'center',
            sorter: (a, b) => a.score - b.score,
            render: score => (
                <Text strong style={{ color: score >= 70 ? '#52c41a' : '#ff4d4f' }}>
                    {score}
                </Text>
            ),
        },
        {
            title: 'Kết quả',
            dataIndex: 'is_passed',
            key: 'is_passed',
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
            align: 'center',
            render: (_, record) => formatDuration(record.started_at, record.submitted_at),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
            render: date => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm tên học viên..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                    prefix={<SearchOutlined />}
                />
                <Select
                    placeholder="Kết quả"
                    allowClear
                    onChange={value => handleFilterChange('passed', value)}
                    style={{ width: 150 }}
                    options={[
                        { value: 'true', label: 'Đạt' },
                        { value: 'false', label: 'Chưa đạt' },
                    ]}
                />
            </Space>

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
                }}
                onChange={handleTableChange}
            />
        </div>
    );
}

export default QuizAttemptList;
