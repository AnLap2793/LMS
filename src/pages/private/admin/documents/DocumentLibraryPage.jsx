import { useState, useMemo } from 'react';
import {
    Button,
    Table,
    Space,
    Tag,
    Popconfirm,
    Input,
    Select,
    Tooltip,
    Drawer,
    Descriptions,
    List,
    Typography,
    Badge,
    message,
    Modal,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FileOutlined,
    LinkOutlined,
    EyeOutlined,
    InboxOutlined,
    UndoOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    FileWordOutlined,
    FileZipOutlined,
    GoogleOutlined,
} from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import DocumentFormModal from '../../../../components/admin/documents/DocumentFormModal';

// Mock data for development
const mockDocuments = [
    {
        id: '1',
        type: 'file',
        title: 'Sổ tay nhân viên 2024',
        description: 'Tài liệu hướng dẫn cho nhân viên mới',
        file: { id: 'f1', filename_download: 'so-tay-nhan-vien-2024.pdf', type: 'application/pdf' },
        url: null,
        url_type: null,
        status: 'active',
        user_created: { first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-15T10:00:00Z',
        usageCount: 5,
    },
    {
        id: '2',
        type: 'url',
        title: 'Google Sheets - KPIs Template',
        description: 'Template theo dõi KPIs hàng tháng',
        file: null,
        url: 'https://docs.google.com/spreadsheets/d/xxx',
        url_type: 'google_sheet',
        status: 'active',
        user_created: { first_name: 'HR', last_name: 'Manager' },
        date_created: '2024-02-01T08:30:00Z',
        usageCount: 3,
    },
    {
        id: '3',
        type: 'file',
        title: 'Slide Đào tạo Kỹ năng Giao tiếp',
        description: 'Bài trình chiếu cho khóa học soft skills',
        file: { id: 'f2', filename_download: 'communication-skills.pptx', type: 'application/vnd.ms-powerpoint' },
        url: null,
        url_type: null,
        status: 'active',
        user_created: { first_name: 'Training', last_name: 'Team' },
        date_created: '2024-02-10T14:00:00Z',
        usageCount: 8,
    },
    {
        id: '4',
        type: 'file',
        title: 'Quy trình làm việc cũ',
        description: 'Đã được thay thế bằng quy trình mới',
        file: { id: 'f3', filename_download: 'old-process.pdf', type: 'application/pdf' },
        url: null,
        url_type: null,
        status: 'archived',
        user_created: { first_name: 'Admin', last_name: 'User' },
        date_created: '2023-06-01T10:00:00Z',
        usageCount: 0,
    },
];

// Mock usage data
const mockUsageData = [
    {
        lesson: { id: 'l1', title: 'Giới thiệu công ty' },
        module: { title: 'Module 1' },
        course: { title: 'Onboarding' },
    },
    {
        lesson: { id: 'l2', title: 'Quy trình làm việc' },
        module: { title: 'Module 2' },
        course: { title: 'Onboarding' },
    },
    {
        lesson: { id: 'l3', title: 'Chính sách công ty' },
        module: { title: 'Module 1' },
        course: { title: 'HR Policies' },
    },
];

const { Text } = Typography;

/**
 * Get file icon based on file type
 */
const getFileIcon = file => {
    if (!file) return <FileOutlined />;
    const type = file.type || '';
    if (type.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (type.includes('word') || type.includes('document')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    if (type.includes('excel') || type.includes('sheet')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    if (type.includes('powerpoint') || type.includes('presentation'))
        return <FilePptOutlined style={{ color: '#fa8c16' }} />;
    if (type.includes('zip') || type.includes('rar')) return <FileZipOutlined style={{ color: '#722ed1' }} />;
    return <FileTextOutlined />;
};

/**
 * Get URL type icon
 */
const getUrlIcon = urlType => {
    switch (urlType) {
        case 'google_doc':
        case 'google_sheet':
            return <GoogleOutlined style={{ color: '#4285f4' }} />;
        case 'notion':
            return <FileTextOutlined style={{ color: '#000' }} />;
        default:
            return <LinkOutlined style={{ color: '#1890ff' }} />;
    }
};

/**
 * Document Library Page
 * Quản lý thư viện tài liệu tập trung
 */
function DocumentLibraryPage() {
    const [documents, setDocuments] = useState(mockDocuments);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [usageDrawerOpen, setUsageDrawerOpen] = useState(false);
    const [selectedDocForUsage, setSelectedDocForUsage] = useState(null);

    // Filtered documents
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            // Search filter
            const matchSearch = !searchText.trim() || doc.title.toLowerCase().includes(searchText.toLowerCase());

            // Type filter
            const matchType = filterType === 'all' || doc.type === filterType;

            // Status filter
            const matchStatus = filterStatus === 'all' || doc.status === filterStatus;

            return matchSearch && matchType && matchStatus;
        });
    }, [documents, searchText, filterType, filterStatus]);

    // Handle create
    const handleCreate = () => {
        setEditingDocument(null);
        setIsModalOpen(true);
    };

    // Handle edit
    const handleEdit = record => {
        setEditingDocument(record);
        setIsModalOpen(true);
    };

    // Handle archive
    const handleArchive = id => {
        setLoading(true);
        setTimeout(() => {
            setDocuments(prev => prev.map(doc => (doc.id === id ? { ...doc, status: 'archived' } : doc)));
            message.success('Đã lưu trữ tài liệu');
            setLoading(false);
        }, 500);
    };

    // Handle restore
    const handleRestore = id => {
        setLoading(true);
        setTimeout(() => {
            setDocuments(prev => prev.map(doc => (doc.id === id ? { ...doc, status: 'active' } : doc)));
            message.success('Đã khôi phục tài liệu');
            setLoading(false);
        }, 500);
    };

    // Handle delete permanently
    const handleDelete = id => {
        setLoading(true);
        setTimeout(() => {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            message.success('Đã xóa tài liệu vĩnh viễn');
            setLoading(false);
        }, 500);
    };

    // Handle bulk archive
    const handleBulkArchive = () => {
        if (selectedRowKeys.length === 0) return;
        Modal.confirm({
            title: 'Lưu trữ tài liệu',
            content: `Bạn có chắc muốn lưu trữ ${selectedRowKeys.length} tài liệu đã chọn?`,
            okText: 'Lưu trữ',
            cancelText: 'Hủy',
            onOk: () => {
                setLoading(true);
                setTimeout(() => {
                    setDocuments(prev =>
                        prev.map(doc => (selectedRowKeys.includes(doc.id) ? { ...doc, status: 'archived' } : doc))
                    );
                    setSelectedRowKeys([]);
                    message.success(`Đã lưu trữ ${selectedRowKeys.length} tài liệu`);
                    setLoading(false);
                }, 500);
            },
        });
    };

    // Handle form submit
    const handleFormSubmit = values => {
        setLoading(true);
        setTimeout(() => {
            if (editingDocument) {
                setDocuments(prev => prev.map(doc => (doc.id === editingDocument.id ? { ...doc, ...values } : doc)));
                message.success('Đã cập nhật tài liệu thành công');
            } else {
                const newDoc = {
                    id: String(Date.now()),
                    ...values,
                    status: 'active',
                    user_created: { first_name: 'Current', last_name: 'User' },
                    date_created: new Date().toISOString(),
                    usageCount: 0,
                };
                setDocuments(prev => [newDoc, ...prev]);
                message.success('Đã tạo tài liệu thành công');
            }
            setIsModalOpen(false);
            setEditingDocument(null);
            setLoading(false);
        }, 500);
    };

    // View usage
    const handleViewUsage = record => {
        setSelectedDocForUsage(record);
        setUsageDrawerOpen(true);
    };

    // Table columns
    const columns = [
        {
            title: 'Tài liệu',
            key: 'title',
            width: '30%',
            render: (_, record) => (
                <Space>
                    {record.type === 'file' ? getFileIcon(record.file) : getUrlIcon(record.url_type)}
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.title}</div>
                        {record.description && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.description.length > 50
                                    ? record.description.substring(0, 50) + '...'
                                    : record.description}
                            </Text>
                        )}
                    </div>
                </Space>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
            render: type => <Tag color={type === 'file' ? 'blue' : 'green'}>{type === 'file' ? 'File' : 'URL'}</Tag>,
            filters: [
                { text: 'File', value: 'file' },
                { text: 'URL', value: 'url' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Đang sử dụng',
            dataIndex: 'usageCount',
            key: 'usageCount',
            width: '10%',
            align: 'center',
            render: (count, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="link" size="small" onClick={() => handleViewUsage(record)}>
                        <Badge count={count} showZero color={count > 0 ? '#1890ff' : '#d9d9d9'} />
                        <span style={{ marginLeft: 8 }}>bài học</span>
                    </Button>
                </Tooltip>
            ),
            sorter: (a, b) => a.usageCount - b.usageCount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render: status => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status === 'active' ? 'Hoạt động' : 'Lưu trữ'}
                </Tag>
            ),
        },
        {
            title: 'Người tạo',
            key: 'user_created',
            width: '15%',
            render: (_, record) =>
                record.user_created ? `${record.user_created.first_name} ${record.user_created.last_name}` : '-',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date_created',
            key: 'date_created',
            width: '10%',
            render: date => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a, b) => new Date(a.date_created) - new Date(b.date_created),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xem sử dụng">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewUsage(record)} />
                    </Tooltip>
                    {record.status === 'active' ? (
                        <Tooltip title="Lưu trữ">
                            <Popconfirm
                                title="Lưu trữ tài liệu này?"
                                description="Tài liệu vẫn hiển thị trong các bài học đã đính kèm."
                                onConfirm={() => handleArchive(record.id)}
                                okText="Lưu trữ"
                                cancelText="Hủy"
                            >
                                <Button type="text" icon={<InboxOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    ) : (
                        <>
                            <Tooltip title="Khôi phục">
                                <Button type="text" icon={<UndoOutlined />} onClick={() => handleRestore(record.id)} />
                            </Tooltip>
                            <Tooltip title="Xóa vĩnh viễn">
                                <Popconfirm
                                    title="Xóa vĩnh viễn?"
                                    description="Tài liệu sẽ bị xóa khỏi tất cả bài học."
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // Row selection
    const rowSelection = {
        selectedRowKeys,
        onChange: keys => setSelectedRowKeys(keys),
        getCheckboxProps: record => ({
            disabled: record.status === 'archived',
        }),
    };

    return (
        <div>
            <PageHeader
                title="Thư viện Tài liệu"
                subtitle="Quản lý tài liệu tập trung, có thể tái sử dụng cho nhiều bài học"
                breadcrumbs={[{ title: 'Tài liệu' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Tài liệu
                    </Button>
                }
            />

            {/* Filters */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Input
                    placeholder="Tìm kiếm theo tên..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: 120 }}
                    options={[
                        { value: 'all', label: 'Tất cả loại' },
                        { value: 'file', label: 'File' },
                        { value: 'url', label: 'URL' },
                    ]}
                />
                <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: 150 }}
                    options={[
                        { value: 'all', label: 'Tất cả trạng thái' },
                        { value: 'active', label: 'Hoạt động' },
                        { value: 'archived', label: 'Đã lưu trữ' },
                    ]}
                />
                {selectedRowKeys.length > 0 && (
                    <Button icon={<InboxOutlined />} onClick={handleBulkArchive}>
                        Lưu trữ ({selectedRowKeys.length})
                    </Button>
                )}
            </div>

            {/* Table */}
            {filteredDocuments.length > 0 ? (
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredDocuments}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} tài liệu`,
                    }}
                />
            ) : (
                <EmptyState
                    title="Chưa có tài liệu nào"
                    description="Thêm tài liệu đầu tiên vào thư viện"
                    actionText="Thêm Tài liệu"
                    onAction={handleCreate}
                />
            )}

            {/* Form Modal */}
            <DocumentFormModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingDocument(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingDocument}
                loading={loading}
            />

            {/* Usage Drawer */}
            <Drawer
                title={`Sử dụng: ${selectedDocForUsage?.title || ''}`}
                open={usageDrawerOpen}
                onClose={() => {
                    setUsageDrawerOpen(false);
                    setSelectedDocForUsage(null);
                }}
                width={500}
            >
                {selectedDocForUsage && (
                    <>
                        <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Loại">
                                <Tag color={selectedDocForUsage.type === 'file' ? 'blue' : 'green'}>
                                    {selectedDocForUsage.type === 'file' ? 'File' : 'URL'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedDocForUsage.status === 'active' ? 'success' : 'default'}>
                                    {selectedDocForUsage.status === 'active' ? 'Hoạt động' : 'Lưu trữ'}
                                </Tag>
                            </Descriptions.Item>
                            {selectedDocForUsage.description && (
                                <Descriptions.Item label="Mô tả">{selectedDocForUsage.description}</Descriptions.Item>
                            )}
                        </Descriptions>

                        <Typography.Title level={5}>
                            Đang sử dụng trong {mockUsageData.length} bài học:
                        </Typography.Title>
                        <List
                            dataSource={mockUsageData}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                                        title={item.lesson.title}
                                        description={
                                            <Space size={4}>
                                                <Text type="secondary">{item.course.title}</Text>
                                                <Text type="secondary">→</Text>
                                                <Text type="secondary">{item.module.title}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: 'Chưa được sử dụng trong bài học nào' }}
                        />
                    </>
                )}
            </Drawer>
        </div>
    );
}

export default DocumentLibraryPage;
