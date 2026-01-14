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
    Dropdown,
    Badge,
    Card,
    Row,
    Col,
    Statistic,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UserOutlined,
    MailOutlined,
    MoreOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import { mockUsers, mockDepartments, getUserFullName } from '../../../../mocks';
import UserFormModal from '../../../../components/admin/users/UserFormModal';

/**
 * User List Page
 * Quản lý danh sách người dùng/nhân viên
 */
function UserListPage() {
    const [users, setUsers] = useState(mockUsers);
    const [searchText, setSearchText] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Statistics
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.status === 'active').length;
        const inactive = users.filter(u => u.status === 'inactive').length;
        const departments = [...new Set(users.map(u => u.department?.code))].length;
        return { total, active, inactive, departments };
    }, [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const fullName = getUserFullName(user).toLowerCase();
            const matchSearch =
                !searchText.trim() ||
                fullName.includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase());

            const matchDepartment = !departmentFilter || user.department?.code === departmentFilter;

            const matchStatus = !statusFilter || user.status === statusFilter;

            return matchSearch && matchDepartment && matchStatus;
        });
    }, [users, searchText, departmentFilter, statusFilter]);

    // Handle add new user
    const handleAdd = () => {
        setEditingUser(null);
        setModalVisible(true);
    };

    // Handle edit user
    const handleEdit = user => {
        setEditingUser(user);
        setModalVisible(true);
    };

    // Handle delete user
    const handleDelete = id => {
        setLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.filter(u => u.id !== id));
            message.success('Đã xóa người dùng');
            setLoading(false);
        }, 500);
    };

    // Handle toggle status
    const handleToggleStatus = user => {
        setLoading(true);
        setTimeout(() => {
            setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
            );
            message.success(`Đã ${user.status === 'active' ? 'khóa' : 'kích hoạt'} tài khoản`);
            setLoading(false);
        }, 500);
    };

    // Handle modal save
    const handleModalSave = values => {
        setLoading(true);
        setTimeout(() => {
            if (editingUser) {
                // Update existing user
                setUsers(prev =>
                    prev.map(u =>
                        u.id === editingUser.id
                            ? {
                                  ...u,
                                  ...values,
                                  department: mockDepartments.find(d => d.code === values.department),
                              }
                            : u
                    )
                );
                message.success('Đã cập nhật thông tin người dùng');
            } else {
                // Create new user
                const newUser = {
                    id: `u${Date.now()}`,
                    ...values,
                    department: mockDepartments.find(d => d.code === values.department),
                    position: { code: values.position, name: values.position },
                    avatar: null,
                    date_created: new Date().toISOString(),
                };
                setUsers(prev => [newUser, ...prev]);
                message.success('Đã thêm người dùng mới');
            }
            setModalVisible(false);
            setLoading(false);
        }, 500);
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        setLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.filter(u => !selectedRowKeys.includes(u.id)));
            setSelectedRowKeys([]);
            message.success(`Đã xóa ${selectedRowKeys.length} người dùng`);
            setLoading(false);
        }, 500);
    };

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setUsers(mockUsers);
            message.success('Đã làm mới danh sách');
            setLoading(false);
        }, 500);
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
            key: 'toggle',
            icon: record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt',
            onClick: () => handleToggleStatus(record),
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
            title: 'Người dùng',
            key: 'user',
            width: 280,
            fixed: 'left',
            render: (_, record) => (
                <Space>
                    <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        src={record.avatar}
                        style={{ backgroundColor: record.status === 'active' ? '#ea4544' : '#999' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{getUserFullName(record)}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                            <MailOutlined style={{ marginRight: 4 }} />
                            {record.email}
                        </div>
                    </div>
                </Space>
            ),
            sorter: (a, b) => getUserFullName(a).localeCompare(getUserFullName(b)),
        },
        {
            title: 'Phòng ban',
            dataIndex: ['department', 'name'],
            key: 'department',
            width: 180,
            render: name => name || '-',
            filters: mockDepartments.map(d => ({ text: d.name, value: d.code })),
            onFilter: (value, record) => record.department?.code === value,
        },
        {
            title: 'Vị trí',
            dataIndex: ['position', 'name'],
            key: 'position',
            width: 180,
            render: name => name || '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: status => (
                <Badge
                    status={status === 'active' ? 'success' : 'default'}
                    text={status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                />
            ),
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Đã khóa', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date_created',
            key: 'date_created',
            width: 120,
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
                title="Quản lý Người dùng"
                subtitle="Quản lý tài khoản nhân viên trong hệ thống"
                breadcrumbs={[{ title: 'Người dùng' }]}
            />

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng người dùng"
                            value={stats.total}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đã khóa"
                            value={stats.inactive}
                            valueStyle={{ color: '#999' }}
                            prefix={<StopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Phòng ban"
                            value={stats.departments}
                            prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tìm kiếm theo tên, email..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Select
                            placeholder="Phòng ban"
                            value={departmentFilter}
                            onChange={setDepartmentFilter}
                            options={[
                                { value: null, label: 'Tất cả phòng ban' },
                                ...mockDepartments.map(d => ({ value: d.code, label: d.name })),
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
                            options={[
                                { value: null, label: 'Tất cả trạng thái' },
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'inactive', label: 'Đã khóa' },
                            ]}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <Popconfirm
                                    title={`Xóa ${selectedRowKeys.length} người dùng?`}
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
            {filteredUsers.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} người dùng`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    scroll={{ x: 1200 }}
                />
            ) : (
                <EmptyState
                    title="Không tìm thấy người dùng"
                    description="Thử thay đổi bộ lọc hoặc thêm người dùng mới"
                    actionText="Thêm Người dùng"
                    onAction={handleAdd}
                />
            )}

            {/* Modal */}
            <UserFormModal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSave={handleModalSave}
                initialValues={editingUser}
                loading={loading}
            />
        </div>
    );
}

export default UserListPage;
