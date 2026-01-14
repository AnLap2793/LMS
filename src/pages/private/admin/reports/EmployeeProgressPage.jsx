import { useState, useMemo } from 'react';
import {
    Table,
    Card,
    Input,
    Select,
    Tag,
    Progress,
    Space,
    Avatar,
    Typography,
    Row,
    Col,
    Statistic,
    Slider,
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { mockEnrollments, getEnrollmentStats } from '../../../../mocks';

const { Text } = Typography;

/**
 * Employee Progress Page
 * Báo cáo tiến độ học tập của nhân viên
 */
function EmployeeProgressPage() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [progressRange, setProgressRange] = useState([0, 100]);

    const enrollmentStats = getEnrollmentStats();

    // Filtered enrollments
    const filteredEnrollments = useMemo(() => {
        let result = mockEnrollments;

        if (searchText.trim()) {
            result = result.filter(
                e =>
                    `${e.user.first_name} ${e.user.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
                    e.course.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (statusFilter) {
            result = result.filter(e => e.status === statusFilter);
        }

        if (progressRange) {
            result = result.filter(
                e => e.progress_percentage >= progressRange[0] && e.progress_percentage <= progressRange[1]
            );
        }

        return result;
    }, [searchText, statusFilter, progressRange]);

    // Get status tag
    const getStatusTag = status => {
        const statusMap = {
            assigned: { color: 'default', text: 'Đã giao' },
            in_progress: { color: 'processing', text: 'Đang học' },
            completed: { color: 'success', text: 'Hoàn thành' },
            expired: { color: 'error', text: 'Quá hạn' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // Format deadline
    const formatDeadline = dueDate => {
        if (!dueDate) return '-';
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <Text type="danger">Quá hạn {Math.abs(diffDays)} ngày</Text>;
        } else if (diffDays <= 3) {
            return <Text type="warning">Còn {diffDays} ngày</Text>;
        } else if (diffDays <= 7) {
            return <Text>Còn {diffDays} ngày</Text>;
        }
        return new Date(dueDate).toLocaleDateString('vi-VN');
    };

    // Table columns
    const columns = [
        {
            title: 'Nhân viên',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ea4544' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.user.first_name} {record.user.last_name}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>{record.user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Khóa học',
            dataIndex: ['course', 'title'],
            key: 'course',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: getStatusTag,
            filters: [
                { text: 'Đã giao', value: 'assigned' },
                { text: 'Đang học', value: 'in_progress' },
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Quá hạn', value: 'expired' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Tiến độ',
            dataIndex: 'progress_percentage',
            key: 'progress',
            width: 150,
            render: (progress, record) => (
                <Progress
                    percent={progress}
                    size="small"
                    status={record.status === 'expired' ? 'exception' : undefined}
                    strokeColor={record.status === 'completed' ? '#52c41a' : '#ea4544'}
                />
            ),
            sorter: (a, b) => a.progress_percentage - b.progress_percentage,
        },
        {
            title: 'Deadline',
            dataIndex: 'due_date',
            key: 'due_date',
            width: 150,
            render: formatDeadline,
            sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date),
        },
        {
            title: 'Loại giao',
            dataIndex: 'assignment_type',
            key: 'assignment_type',
            width: 120,
            render: type => {
                const typeMap = {
                    individual: 'Cá nhân',
                    department: 'Phòng ban',
                    auto: 'Tự động',
                };
                return <Tag>{typeMap[type] || type}</Tag>;
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="Tiến độ Nhân viên"
                subtitle="Theo dõi tiến độ học tập của từng nhân viên"
                breadcrumbs={[{ title: 'Báo cáo', path: '/admin/reports' }, { title: 'Tiến độ nhân viên' }]}
            />

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic title="Tổng enrollment" value={enrollmentStats.total} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={enrollmentStats.inProgress}
                            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Hoàn thành"
                            value={enrollmentStats.completed}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Quá hạn"
                            value={enrollmentStats.expired}
                            prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong>Tìm kiếm</Text>
                    </div>
                    <Input
                        placeholder="Tên nhân viên, khóa học..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong>Trạng thái</Text>
                    </div>
                    <Select
                        placeholder="Chọn trạng thái"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: '100%' }}
                        allowClear
                        options={[
                            { value: 'assigned', label: 'Đã giao' },
                            { value: 'in_progress', label: 'Đang học' },
                            { value: 'completed', label: 'Hoàn thành' },
                            { value: 'expired', label: 'Quá hạn' },
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={10}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>Khoảng tiến độ</Text>
                        <Text type="secondary">
                            {progressRange[0]}% - {progressRange[1]}%
                        </Text>
                    </div>
                    <Slider
                        range
                        defaultValue={[0, 100]}
                        value={progressRange}
                        onChange={setProgressRange}
                        min={0}
                        max={100}
                        allowCross={false}
                        trackStyle={[{ backgroundColor: '#ea4544' }]}
                        handleStyle={[{ borderColor: '#ea4544' }, { borderColor: '#ea4544' }]}
                    />
                </Col>
            </Row>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredEnrollments}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} bản ghi`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
}

export default EmployeeProgressPage;
