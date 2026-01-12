import { useState, useMemo } from 'react';
import {
    Button,
    Table,
    Space,
    Tag,
    Popconfirm,
    Input,
    message,
    Tooltip,
    Avatar,
    Card,
    Row,
    Col,
    Statistic,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    NodeIndexOutlined,
    BookOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import { mockLearningPaths, mockPositions, mockDepartments } from '../../../../mocks';
import LearningPathFormModal from '../../../../components/admin/learning-paths/LearningPathFormModal';

/**
 * Learning Path List Page
 * CRUD management for Learning Paths
 */
function LearningPathListPage() {
    const [paths, setPaths] = useState(mockLearningPaths);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPath, setEditingPath] = useState(null);

    // Statistics
    const stats = useMemo(() => {
        const total = paths.length;
        const published = paths.filter(p => p.status === 'published').length;
        const mandatory = paths.filter(p => p.is_mandatory).length;
        const totalCourses = paths.reduce((sum, p) => sum + (p.courses?.length || 0), 0);
        return { total, published, mandatory, totalCourses };
    }, [paths]);

    // Handle add
    const handleAdd = () => {
        setEditingPath(null);
        setModalVisible(true);
    };

    // Handle edit
    const handleEdit = path => {
        setEditingPath(path);
        setModalVisible(true);
    };

    // Handle modal save
    const handleModalSave = values => {
        setLoading(true);
        setTimeout(() => {
            if (editingPath) {
                // Update
                setPaths(prev =>
                    prev.map(p =>
                        p.id === editingPath.id ? { ...p, ...values, date_updated: new Date().toISOString() } : p
                    )
                );
                message.success('Đã cập nhật lộ trình');
            } else {
                // Create
                const newPath = {
                    id: `lp${Date.now()}`,
                    ...values,
                    enrollments_count: 0,
                    date_created: new Date().toISOString(),
                };
                setPaths(prev => [newPath, ...prev]);
                message.success('Đã tạo lộ trình mới');
            }
            setModalVisible(false);
            setLoading(false);
        }, 500);
    };

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setPaths(mockLearningPaths);
            message.success('Đã làm mới danh sách');
            setLoading(false);
        }, 500);
    };

    // Filtered paths based on search
    const filteredPaths = useMemo(() => {
        if (!searchText.trim()) return paths;
        return paths.filter(path => path.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [paths, searchText]);

    // Handle delete
    const handleDelete = id => {
        setLoading(true);
        setTimeout(() => {
            setPaths(prev => prev.filter(p => p.id !== id));
            message.success('Đã xóa lộ trình học tập');
            setLoading(false);
        }, 500);
    };

    // Format duration
    const formatDuration = minutes => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
        }
        return `${mins}p`;
    };

    // Table columns
    const columns = [
        {
            title: 'Lộ trình',
            key: 'path',
            width: 350,
            render: (_, record) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={48}
                        icon={<NodeIndexOutlined />}
                        style={{ backgroundColor: record.is_mandatory ? '#ea4544' : '#1890ff' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.title}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{record.courses?.length || 0} khóa học</div>
                    </div>
                </Space>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Bắt buộc',
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            width: 100,
            render: is_mandatory => (
                <Tag color={is_mandatory ? 'red' : 'default'}>{is_mandatory ? 'Bắt buộc' : 'Tự chọn'}</Tag>
            ),
            filters: [
                { text: 'Bắt buộc', value: true },
                { text: 'Tự chọn', value: false },
            ],
            onFilter: (value, record) => record.is_mandatory === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: status => (
                <Tag color={status === 'published' ? 'success' : 'default'}>
                    {status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                </Tag>
            ),
        },
        {
            title: 'Đối tượng áp dụng',
            key: 'target',
            width: 200,
            render: (_, record) => {
                const departments = record.department_filter || [];
                const positions = record.position_filter || [];
                const hasDept = departments.length > 0;
                const hasPos = positions.length > 0;

                if (!hasDept && !hasPos) {
                    return <Tag color="green">Tất cả</Tag>;
                }

                return (
                    <Space size={[0, 4]} wrap>
                        {hasDept && (
                            <Tooltip
                                title={departments
                                    .map(code => mockDepartments.find(d => d.code === code)?.name || code)
                                    .join(', ')}
                            >
                                <Tag icon={<TeamOutlined />} color="blue">
                                    {departments.length} phòng ban
                                </Tag>
                            </Tooltip>
                        )}
                        {hasPos && (
                            <Tooltip
                                title={positions
                                    .map(code => mockPositions.find(p => p.code === code)?.name || code)
                                    .join(', ')}
                            >
                                <Tag icon={<UserOutlined />} color="purple">
                                    {positions.length} vị trí
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Khóa học',
            key: 'courses',
            width: 250,
            render: (_, record) => (
                <Space size={[0, 4]} wrap>
                    {record.courses?.slice(0, 2).map(course => (
                        <Tag key={course.id} icon={<BookOutlined />}>
                            {course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}
                        </Tag>
                    ))}
                    {record.courses?.length > 2 && <Tag>+{record.courses.length - 2}</Tag>}
                </Space>
            ),
        },
        {
            title: 'Thời lượng',
            dataIndex: 'total_duration',
            key: 'total_duration',
            width: 100,
            render: formatDuration,
        },
        {
            title: 'Học viên',
            dataIndex: 'enrollments_count',
            key: 'enrollments_count',
            width: 100,
            render: count => count || 0,
            sorter: (a, b) => (a.enrollments_count || 0) - (b.enrollments_count || 0),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa lộ trình này?"
                        description="Các enrollment liên quan sẽ bị ảnh hưởng."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Lộ trình Học tập"
                subtitle="Tạo và quản lý các lộ trình đào tạo gồm nhiều khóa học"
                breadcrumbs={[{ title: 'Lộ trình học tập' }]}
                actions={
                    <Space>
                        <Tooltip title="Làm mới">
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
                        </Tooltip>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm Lộ trình
                        </Button>
                    </Space>
                }
            />

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng lộ trình"
                            value={stats.total}
                            prefix={<NodeIndexOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đã xuất bản"
                            value={stats.published}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic title="Bắt buộc" value={stats.mandatory} valueStyle={{ color: '#ea4544' }} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng khóa học"
                            value={stats.totalCourses}
                            prefix={<BookOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm lộ trình..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            {/* Table */}
            {filteredPaths.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredPaths}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: total => `Tổng ${total} lộ trình`,
                    }}
                    scroll={{ x: 1400 }}
                />
            ) : (
                <EmptyState
                    title="Chưa có lộ trình nào"
                    description="Tạo lộ trình đầu tiên để gom nhóm các khóa học"
                    actionText="Thêm Lộ trình"
                    onAction={handleAdd}
                />
            )}

            {/* Modal */}
            <LearningPathFormModal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSave={handleModalSave}
                initialValues={editingPath}
                loading={loading}
            />
        </div>
    );
}

export default LearningPathListPage;
