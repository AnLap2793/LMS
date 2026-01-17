import { useState, useMemo } from 'react';
import {
    Button,
    Table,
    Space,
    Tag,
    Popconfirm,
    Input,
    Select,
    message,
    Tooltip,
    Avatar,
    Progress,
    Card,
    Row,
    Col,
    Statistic,
    Dropdown,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UserOutlined,
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    ExportOutlined,
    MoreOutlined,
    SendOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, EmptyState } from '../../../../components/common';
import { ENROLLMENT_STATUS_OPTIONS } from '../../../../constants/lms';
import EnrollmentFormModal from '../../../../components/admin/enrollments/EnrollmentFormModal';
import { getAvatarUrl, getAssetUrl } from '../../../../utils/directusHelpers';
import { enrollmentService } from '../../../../services/enrollmentService';
import { courseService } from '../../../../services/courseService';
import { queryKeys } from '../../../../constants/queryKeys';
import { showSuccess, showError } from '../../../../utils/errorHandler';

/**
 * Enrollment List Page
 * Quản lý đăng ký khóa học cho nhân viên
 */
function EnrollmentListPage() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [courseFilter, setCourseFilter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const queryClient = useQueryClient();

    // Fetch Enrollments
    const { data: enrollments = [], isLoading: loading } = useQuery({
        queryKey: [...queryKeys.enrollments.all, 'list', { search: searchText, status: statusFilter, course: courseFilter }],
        queryFn: () =>
            enrollmentService.getAll({
                search: searchText,
                status: statusFilter,
                courseId: courseFilter,
            }),
    });

    // Fetch Courses (for filter)
    const { data: courses = [] } = useQuery({
        queryKey: queryKeys.courses.adminList({ fields: ['id', 'title'] }),
        queryFn: () => courseService.getAll({ limit: -1, fields: ['id', 'title'] }),
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: enrollmentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.enrollments.all);
            showSuccess('Đã xóa đăng ký');
        },
        onError: showError,
    });

    const createMutation = useMutation({
        mutationFn: enrollmentService.assignCourse,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.enrollments.all);
            showSuccess('Đã gán khóa học thành công');
            setModalVisible(false);
        },
        onError: showError,
    });

    // Note: Update not fully implemented in service yet for admin, but we can add it later or use specific methods
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => enrollmentService.update(id, data), // Assuming generic update exists or add it
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.enrollments.all);
            showSuccess('Đã cập nhật đăng ký');
            setModalVisible(false);
        },
        onError: showError,
    });

    // Statistics (Client-side calculation for now, ideally server-side)
    const stats = useMemo(() => {
        const total = enrollments.length;
        const completed = enrollments.filter(e => e.status === 'completed').length;
        const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
        const expired = enrollments.filter(e => e.status === 'expired').length;
        const assigned = enrollments.filter(e => e.status === 'assigned').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, expired, assigned, completionRate };
    }, [enrollments]);

    // Handle add new enrollment
    const handleAdd = () => {
        setEditingEnrollment(null);
        setModalVisible(true);
    };

    // Handle edit enrollment
    const handleEdit = enrollment => {
        setEditingEnrollment(enrollment);
        setModalVisible(true);
    };

    // Handle delete enrollment
    const handleDelete = id => {
        deleteMutation.mutate(id);
    };

    // Handle send reminder
    const handleSendReminder = enrollment => {
        // Implement reminder logic (e.g., call notification service)
        message.success(`Đã gửi nhắc nhở đến ${enrollment.user?.first_name} ${enrollment.user?.last_name}`);
    };

    // Handle modal save
    const handleModalSave = values => {
        if (editingEnrollment) {
            // For update, we might need to handle single update
            // This part depends on backend implementation of update
            // updateMutation.mutate({ id: editingEnrollment.id, data: values });
            message.info('Chức năng cập nhật đang phát triển');
        } else {
            // For create (assign)
            // Handle multiple users assignment sequentially or batch if API supports
            // Here we assume service.assignCourse takes one object, loop for multiple users
            const promises = values.user_ids.map(userId =>
                createMutation.mutateAsync({
                    user_id: userId,
                    course_id: values.course_id,
                    due_date: values.due_date,
                    assignment_type: 'individual',
                })
            );

            Promise.all(promises)
                .then(() => {
                    setModalVisible(false);
                    queryClient.invalidateQueries(queryKeys.enrollments.all);
                })
                .catch(showError);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        // Sequentially delete or use deleteMany if available
        const promises = selectedRowKeys.map(id => deleteMutation.mutateAsync(id));
        Promise.all(promises)
            .then(() => {
                setSelectedRowKeys([]);
                queryClient.invalidateQueries(queryKeys.enrollments.all);
                showSuccess(`Đã xóa ${selectedRowKeys.length} đăng ký`);
            })
            .catch(showError);
    };

    // Handle refresh
    const handleRefresh = () => {
        queryClient.invalidateQueries(queryKeys.enrollments.all);
        message.success('Đã làm mới danh sách');
    };

    // Get status color
    const getStatusConfig = status => {
        const config = ENROLLMENT_STATUS_OPTIONS.find(s => s.value === status);
        return config || { label: status, color: 'default' };
    };

    // Get days until deadline
    const getDaysUntilDeadline = dueDate => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Row actions dropdown
    const getRowActions = record => [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa',
            onClick: () => handleEdit(record),
        },
        {
            key: 'remind',
            icon: <SendOutlined />,
            label: 'Gửi nhắc nhở',
            onClick: () => handleSendReminder(record),
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            danger: true,
            onClick: () => handleDelete(record.id),
        },
    ];

    // Table columns
    const columns = [
        {
            title: 'Học viên',
            key: 'user',
            width: 220,
            fixed: 'left',
            render: (_, record) => {
                const avatarUrl = getAvatarUrl(record.user?.avatar, 36);
                return (
                    <Space>
                        <Avatar
                            size={36}
                            src={avatarUrl}
                            icon={!avatarUrl && <UserOutlined />}
                            style={{ backgroundColor: !avatarUrl ? '#ea4544' : undefined }}
                        />
                        <div>
                            <div style={{ fontWeight: 500 }}>
                                {record.user?.first_name} {record.user?.last_name}
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>{record.user?.email}</div>
                        </div>
                    </Space>
                );
            },
            sorter: (a, b) =>
                `${a.user?.first_name} ${a.user?.last_name}`.localeCompare(
                    `${b.user?.first_name} ${b.user?.last_name}`
                ),
        },
        {
            title: 'Khóa học',
            key: 'course',
            width: 250,
            render: (_, record) => {
                const thumbnailUrl = getAssetUrl(record.course?.thumbnail, { width: 36, height: 36, fit: 'cover' });
                return (
                    <Space>
                        <Avatar
                            size={36}
                            src={thumbnailUrl}
                            icon={!thumbnailUrl && <BookOutlined />}
                            shape="square"
                            style={{
                                backgroundColor: !thumbnailUrl ? '#1890ff' : undefined,
                                borderRadius: 4,
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: 500 }}>
                                {record.course?.title?.length > 30
                                    ? `${record.course?.title.substring(0, 30)}...`
                                    : record.course?.title}
                            </div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Tiến độ',
            dataIndex: 'progress_percentage',
            key: 'progress',
            width: 150,
            render: progress => (
                <Progress percent={progress || 0} size="small" strokeColor={progress === 100 ? '#52c41a' : '#ea4544'} />
            ),
            sorter: (a, b) => (a.progress_percentage || 0) - (b.progress_percentage || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: status => {
                const config = getStatusConfig(status);
                return <Tag color={config.color}>{config.label}</Tag>;
            },
            filters: ENROLLMENT_STATUS_OPTIONS.map(s => ({ text: s.label, value: s.value })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Hạn hoàn thành',
            dataIndex: 'due_date',
            key: 'due_date',
            width: 140,
            render: (dueDate, record) => {
                if (!dueDate) return '-';
                const days = getDaysUntilDeadline(dueDate);
                const dateStr = new Date(dueDate).toLocaleDateString('vi-VN');

                if (record.status === 'completed') {
                    return <span style={{ color: '#52c41a' }}>{dateStr}</span>;
                }

                if (days < 0) {
                    return (
                        <Tooltip title={`Quá hạn ${Math.abs(days)} ngày`}>
                            <span style={{ color: '#ff4d4f' }}>
                                <ExclamationCircleOutlined /> {dateStr}
                            </span>
                        </Tooltip>
                    );
                }
                if (days <= 3) {
                    return (
                        <Tooltip title={`Còn ${days} ngày`}>
                            <span style={{ color: '#faad14' }}>
                                <ClockCircleOutlined /> {dateStr}
                            </span>
                        </Tooltip>
                    );
                }
                return dateStr;
            },
            sorter: (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0),
        },
        {
            title: 'Loại gán',
            dataIndex: 'assignment_type',
            key: 'assignment_type',
            width: 100,
            render: type => {
                const typeMap = {
                    individual: { label: 'Cá nhân', color: 'blue' },
                    department: { label: 'Phòng ban', color: 'green' },
                    auto: { label: 'Tự động', color: 'purple' },
                    self: { label: 'Tự đăng ký', color: 'orange' },
                };
                const config = typeMap[type] || { label: type, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Ngày gán',
            dataIndex: 'date_created',
            key: 'date_created',
            width: 110,
            render: date => (date ? new Date(date).toLocaleDateString('vi-VN') : '-'),
            sorter: (a, b) => new Date(a.date_created) - new Date(b.date_created),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Dropdown menu={{ items: getRowActions(record) }} trigger={['click']} placement="bottomRight">
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    // Row selection
    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    return (
        <div>
            <PageHeader
                title="Quản lý Đăng ký"
                subtitle="Gán và theo dõi tiến độ học tập của nhân viên"
                breadcrumbs={[{ title: 'Đăng ký khóa học' }]}
                actions={
                    <Space>
                        <Button icon={<ExportOutlined />}>Xuất báo cáo</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Gán Khóa học
                        </Button>
                    </Space>
                }
            />

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Tổng đăng ký"
                            value={stats.total}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            styles={{ content: { color: '#52c41a' } }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={stats.inProgress}
                            styles={{ content: { color: '#1890ff' } }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic title="Chờ bắt đầu" value={stats.assigned} styles={{ content: { color: '#722ed1' } }} />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Quá hạn"
                            value={stats.expired}
                            styles={{ content: { color: '#ff4d4f' } }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={stats.completionRate}
                            suffix="%"
                            styles={{ content: { color: stats.completionRate >= 70 ? '#52c41a' : '#faad14' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tìm kiếm học viên, khóa học..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Select
                            placeholder="Khóa học"
                            value={courseFilter}
                            onChange={setCourseFilter}
                            options={[
                                { value: '', label: 'Tất cả khóa học' },
                                ...courses.map(c => ({ value: c.id, label: c.title })),
                            ]}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[{ value: '', label: 'Tất cả trạng thái' }, ...ENROLLMENT_STATUS_OPTIONS]}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <Popconfirm
                                    title={`Xóa ${selectedRowKeys.length} đăng ký?`}
                                    onConfirm={handleBulkDelete}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button danger icon={<DeleteOutlined />}>
                                        Xóa đã chọn ({selectedRowKeys.length})
                                    </Button>
                                </Popconfirm>
                            )}
                            <Tooltip title="Làm mới">
                                <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            {enrollments.length > 0 || loading ? (
                <Table
                    columns={columns}
                    dataSource={enrollments}
                    rowKey="id"
                    loading={loading}
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} đăng ký`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    scroll={{ x: 1400 }}
                />
            ) : (
                <EmptyState
                    title="Chưa có đăng ký nào"
                    description="Gán khóa học cho nhân viên để bắt đầu"
                    actionText="Gán Khóa học"
                    onAction={handleAdd}
                />
            )}

            {/* Modal */}
            <EnrollmentFormModal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSave={handleModalSave}
                initialValues={editingEnrollment}
                loading={createMutation.isPending || deleteMutation.isPending}
            />
        </div>
    );
}

export default EnrollmentListPage;
