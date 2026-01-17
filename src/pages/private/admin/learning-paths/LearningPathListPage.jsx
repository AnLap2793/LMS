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
    Spin,
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
import { useQuery } from '@tanstack/react-query';
import { PageHeader, EmptyState } from '../../../../components/common';
import LearningPathFormModal from '../../../../components/admin/learning-paths/LearningPathFormModal';
import {
    useLearningPaths,
    useCreateLearningPath,
    useUpdateLearningPath,
    useDeleteLearningPath,
    useLearningPathStats,
} from '../../../../hooks/useLearningPaths';
import { departmentService } from '../../../../services/departmentService';
import { positionService } from '../../../../services/positionService';
import { queryKeys } from '../../../../constants/queryKeys';

/**
 * Learning Path List Page
 * CRUD management for Learning Paths
 */
function LearningPathListPage() {
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPath, setEditingPath] = useState(null);

    // Data Hooks
    const {
        data: paths = [],
        isLoading: pathsLoading,
        refetch,
    } = useLearningPaths({
        search: searchText || undefined,
    });

    // Stats Hook
    const { data: statsData, isLoading: statsLoading } = useLearningPathStats();

    // Fetch departments and positions for tooltips
    const { data: departments = [] } = useQuery({
        queryKey: queryKeys.departments.lists(),
        queryFn: departmentService.getAll,
    });

    const { data: positions = [] } = useQuery({
        queryKey: queryKeys.positions.lists(),
        queryFn: positionService.getAll,
    });

    // Mutations
    const createPath = useCreateLearningPath();
    const updatePath = useUpdateLearningPath();
    const deletePath = useDeleteLearningPath();

    const loading = pathsLoading || createPath.isPending || updatePath.isPending || deletePath.isPending;

    // Default stats if loading or error
    const stats = statsData || {
        total: 0,
        published: 0,
        mandatory: 0,
        totalCourses: 0,
    };

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
    const handleModalSave = async values => {
        try {
            if (editingPath) {
                await updatePath.mutateAsync({ id: editingPath.id, data: values });
            } else {
                await createPath.mutateAsync(values);
            }
            setModalVisible(false);
        } catch {
            // Error handled globally
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách');
    };

    // Handle delete
    const handleDelete = async id => {
        try {
            await deletePath.mutateAsync(id);
        } catch {
            // Error handled globally
        }
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

    // Helper to get name
    const getDeptName = (code) => departments.find(d => (d.code || d.id) === code)?.name || code;
    const getPosName = (id) => {
        const pos = positions.find(p => p.id === id);
        return pos ? pos.ten_vi_tri : id;
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
                        <div style={{ fontSize: 12, color: '#999' }}>
                            {record.courses_count || record.courses?.length || 0} khóa học
                        </div>
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
                const departmentFilter = record.department_filter || [];
                const positionFilter = record.position_filter || [];
                const hasDept = departmentFilter.length > 0;
                const hasPos = positionFilter.length > 0;

                if (!hasDept && !hasPos) {
                    return <Tag color="green">Tất cả</Tag>;
                }

                return (
                    <Space size={[0, 4]} wrap>
                        {hasDept && (
                            <Tooltip title={departmentFilter.map(getDeptName).join(', ')}>
                                <Tag icon={<TeamOutlined />} color="blue">
                                    {departmentFilter.length} phòng ban
                                </Tag>
                            </Tooltip>
                        )}
                        {hasPos && (
                            <Tooltip title={positionFilter.map(getPosName).join(', ')}>
                                <Tag icon={<UserOutlined />} color="purple">
                                    {positionFilter.length} vị trí
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
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
                        {statsLoading ? (
                            <Spin />
                        ) : (
                            <Statistic
                                title="Tổng lộ trình"
                                value={stats.total}
                                prefix={<NodeIndexOutlined style={{ color: '#1890ff' }} />}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        {statsLoading ? (
                            <Spin />
                        ) : (
                            <Statistic
                                title="Đã xuất bản"
                                value={stats.published}
                                styles={{ content: { color: '#52c41a' } }}
                                prefix={<CheckCircleOutlined />}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        {statsLoading ? (
                            <Spin />
                        ) : (
                            <Statistic title="Bắt buộc" value={stats.mandatory} styles={{ content: { color: '#ea4544' } }} />
                        )}
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng học viên"
                            value={stats.totalEnrollments || 0}
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
            {paths.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={paths}
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
