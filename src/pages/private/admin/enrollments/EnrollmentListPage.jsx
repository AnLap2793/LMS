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
    DatePicker,
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
import { PageHeader, EmptyState } from '../../../../components/common';
import { mockEnrollments, mockCourses, mockUsers, getUserFullName } from '../../../../mocks';
import { ENROLLMENT_STATUS_OPTIONS } from '../../../../constants/lms';
import EnrollmentFormModal from '../../../../components/admin/enrollments/EnrollmentFormModal';
import { getAvatarUrl, getAssetUrl } from '../../../../utils/directusHelpers';

/**
 * Enrollment List Page
 * Quản lý đăng ký khóa học cho nhân viên
 */
function EnrollmentListPage() {
    const [enrollments, setEnrollments] = useState(mockEnrollments);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [courseFilter, setCourseFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Statistics
    const stats = useMemo(() => {
        const total = enrollments.length;
        const completed = enrollments.filter(e => e.status === 'completed').length;
        const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
        const expired = enrollments.filter(e => e.status === 'expired').length;
        const assigned = enrollments.filter(e => e.status === 'assigned').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, expired, assigned, completionRate };
    }, [enrollments]);

    // Enrich enrollments with user and course data (avatar, thumbnail)
    const enrichedEnrollments = useMemo(() => {
        return enrollments.map(enrollment => {
            const fullUser = mockUsers.find(u => u.id === enrollment.user_id) || enrollment.user;
            const fullCourse = mockCourses.find(c => c.id === enrollment.course_id) || enrollment.course;

            return {
                ...enrollment,
                user: {
                    ...enrollment.user,
                    avatar: fullUser?.avatar || enrollment.user?.avatar,
                },
                course: {
                    ...enrollment.course,
                    thumbnail: fullCourse?.thumbnail || enrollment.course?.thumbnail,
                },
            };
        });
    }, [enrollments]);

    // Filtered enrollments
    const filteredEnrollments = useMemo(() => {
        return enrichedEnrollments.filter(enrollment => {
            const userName = `${enrollment.user?.first_name} ${enrollment.user?.last_name}`.toLowerCase();
            const courseName = enrollment.course?.title?.toLowerCase() || '';

            const matchSearch =
                !searchText.trim() ||
                userName.includes(searchText.toLowerCase()) ||
                courseName.includes(searchText.toLowerCase()) ||
                enrollment.user?.email?.toLowerCase().includes(searchText.toLowerCase());

            const matchStatus = !statusFilter || enrollment.status === statusFilter;
            const matchCourse = !courseFilter || enrollment.course_id === courseFilter;

            return matchSearch && matchStatus && matchCourse;
        });
    }, [enrichedEnrollments, searchText, statusFilter, courseFilter]);

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
        setLoading(true);
        setTimeout(() => {
            setEnrollments(prev => prev.filter(e => e.id !== id));
            message.success('Đã xóa đăng ký');
            setLoading(false);
        }, 500);
    };

    // Handle send reminder
    const handleSendReminder = enrollment => {
        message.success(`Đã gửi nhắc nhở đến ${enrollment.user?.first_name} ${enrollment.user?.last_name}`);
    };

    // Handle modal save
    const handleModalSave = values => {
        setLoading(true);
        setTimeout(() => {
            if (editingEnrollment) {
                // Update existing enrollment
                setEnrollments(prev =>
                    prev.map(e =>
                        e.id === editingEnrollment.id
                            ? {
                                  ...e,
                                  ...values,
                                  course: mockCourses.find(c => c.id === values.course_id),
                                  user: mockUsers.find(u => u.id === values.user_id),
                              }
                            : e
                    )
                );
                message.success('Đã cập nhật đăng ký');
            } else {
                // Create new enrollment(s)
                const newEnrollments = values.user_ids.map(userId => ({
                    id: `e${Date.now()}-${userId}`,
                    user_id: userId,
                    user: mockUsers.find(u => u.id === userId),
                    course_id: values.course_id,
                    course: mockCourses.find(c => c.id === values.course_id),
                    assigned_by: { id: 'admin', first_name: 'Admin', last_name: 'User' },
                    assignment_type: 'individual',
                    status: 'assigned',
                    progress_percentage: 0,
                    started_at: null,
                    completed_at: null,
                    due_date: values.due_date?.toISOString() || null,
                    date_created: new Date().toISOString(),
                }));
                setEnrollments(prev => [...newEnrollments, ...prev]);
                message.success(`Đã gán khóa học cho ${newEnrollments.length} người`);
            }
            setModalVisible(false);
            setLoading(false);
        }, 500);
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        setLoading(true);
        setTimeout(() => {
            setEnrollments(prev => prev.filter(e => !selectedRowKeys.includes(e.id)));
            setSelectedRowKeys([]);
            message.success(`Đã xóa ${selectedRowKeys.length} đăng ký`);
            setLoading(false);
        }, 500);
    };

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setEnrollments(mockEnrollments);
            message.success('Đã làm mới danh sách');
            setLoading(false);
        }, 500);
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
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={stats.inProgress}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic title="Chờ bắt đầu" value={stats.assigned} valueStyle={{ color: '#722ed1' }} />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Quá hạn"
                            value={stats.expired}
                            valueStyle={{ color: '#ff4d4f' }}
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
                            valueStyle={{ color: stats.completionRate >= 70 ? '#52c41a' : '#faad14' }}
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
                                { value: null, label: 'Tất cả khóa học' },
                                ...mockCourses.map(c => ({ value: c.id, label: c.title })),
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
                            options={[{ value: null, label: 'Tất cả trạng thái' }, ...ENROLLMENT_STATUS_OPTIONS]}
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
            {filteredEnrollments.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredEnrollments}
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
                loading={loading}
            />
        </div>
    );
}

export default EnrollmentListPage;
