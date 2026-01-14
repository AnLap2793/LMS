import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Table, Space, Tag, Button, Empty, Tooltip } from 'antd';
import {
    SearchOutlined,
    FileOutlined,
    LinkOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    FileZipOutlined,
    FileTextOutlined,
    GoogleOutlined,
    PlusOutlined,
    CheckOutlined,
} from '@ant-design/icons';

// Mock data - will be replaced with real API call
const mockDocuments = [
    {
        id: '1',
        type: 'file',
        title: 'Sổ tay nhân viên 2024',
        description: 'Tài liệu hướng dẫn cho nhân viên mới',
        file: { id: 'f1', filename_download: 'so-tay-nhan-vien-2024.pdf', type: 'application/pdf' },
        tags: ['onboarding', 'hr'],
        status: 'active',
    },
    {
        id: '2',
        type: 'url',
        title: 'Google Sheets - KPIs Template',
        description: 'Template theo dõi KPIs hàng tháng',
        url: 'https://docs.google.com/spreadsheets/d/xxx',
        url_type: 'google_sheet',
        tags: ['template', 'kpi'],
        status: 'active',
    },
    {
        id: '3',
        type: 'file',
        title: 'Slide Đào tạo Kỹ năng Giao tiếp',
        description: 'Bài trình chiếu cho khóa học soft skills',
        file: { id: 'f2', filename_download: 'communication-skills.pptx', type: 'application/vnd.ms-powerpoint' },
        tags: ['soft-skills', 'training'],
        status: 'active',
    },
    {
        id: '4',
        type: 'file',
        title: 'Chính sách bảo mật',
        description: 'Quy định về bảo mật thông tin công ty',
        file: { id: 'f4', filename_download: 'security-policy.pdf', type: 'application/pdf' },
        tags: ['policy', 'security'],
        status: 'active',
    },
    {
        id: '5',
        type: 'url',
        title: 'Notion - Quy trình làm việc',
        description: 'Hướng dẫn quy trình làm việc chi tiết',
        url: 'https://notion.so/workflow',
        url_type: 'notion',
        tags: ['process', 'guide'],
        status: 'active',
    },
];

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
 * DocumentSelectorModal - Modal để chọn tài liệu từ thư viện
 */
function DocumentSelectorModal({ open, onCancel, onSelect, selectedIds, onCreateNew }) {
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState(selectedIds || []);

    // Filter documents based on search
    const filteredDocuments = useMemo(() => {
        const activeDocuments = mockDocuments.filter(doc => doc.status === 'active');
        if (!searchText.trim()) return activeDocuments;
        return activeDocuments.filter(
            doc =>
                doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText]);

    // Handle confirm selection
    const handleConfirm = () => {
        const selectedDocs = mockDocuments.filter(doc => selectedRowKeys.includes(doc.id));
        onSelect(selectedDocs);
    };

    // Table columns
    const columns = [
        {
            title: 'Tài liệu',
            key: 'title',
            render: (_, record) => (
                <Space>
                    {record.type === 'file' ? getFileIcon(record.file) : getUrlIcon(record.url_type)}
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.title}</div>
                        {record.description && (
                            <div style={{ fontSize: 12, color: '#999' }}>
                                {record.description.length > 60
                                    ? record.description.substring(0, 60) + '...'
                                    : record.description}
                            </div>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: type => (
                <Tag color={type === 'file' ? 'blue' : 'green'} style={{ margin: 0 }}>
                    {type === 'file' ? 'File' : 'URL'}
                </Tag>
            ),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: 180,
            render: tags =>
                tags?.length > 0 ? (
                    <Space wrap size={[0, 4]}>
                        {tags.slice(0, 2).map(tag => (
                            <Tag key={tag} style={{ margin: 0 }}>
                                {tag}
                            </Tag>
                        ))}
                        {tags.length > 2 && <Tag style={{ margin: 0 }}>+{tags.length - 2}</Tag>}
                    </Space>
                ) : (
                    '-'
                ),
        },
    ];

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: keys => setSelectedRowKeys(keys),
        getCheckboxProps: record => ({
            disabled: selectedIds?.includes(record.id), // Disable already selected
        }),
    };

    return (
        <Modal
            title="Chọn Tài liệu từ Thư viện"
            open={open}
            onCancel={onCancel}
            onOk={handleConfirm}
            okText={
                <Space>
                    <CheckOutlined />
                    Chọn ({selectedRowKeys.length})
                </Space>
            }
            cancelText="Hủy"
            width={700}
            styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
        >
            {/* Search and Create New */}
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Tìm kiếm theo tên hoặc tags..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                {onCreateNew && (
                    <Tooltip title="Tạo tài liệu mới và thêm vào thư viện">
                        <Button type="dashed" icon={<PlusOutlined />} onClick={onCreateNew}>
                            Tạo mới
                        </Button>
                    </Tooltip>
                )}
            </Space>

            {/* Table */}
            {filteredDocuments.length > 0 ? (
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredDocuments}
                    rowKey="id"
                    size="small"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        showTotal: total => `${total} tài liệu`,
                    }}
                />
            ) : (
                <Empty
                    description={searchText ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào trong thư viện'}
                />
            )}
        </Modal>
    );
}

DocumentSelectorModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    onCreateNew: PropTypes.func,
};

DocumentSelectorModal.defaultProps = {
    selectedIds: [],
    onCreateNew: null,
};

export default DocumentSelectorModal;
