import { useState, useMemo } from 'react';
import { Button, Table, Space, Tag, Popconfirm, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import TagFormModal from '../../../../components/admin/tags/TagFormModal';
import { mockTags } from '../../../../mocks';

/**
 * Tag List Page
 * CRUD management for Tags
 */
function TagListPage() {
    const [tags, setTags] = useState(mockTags);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [loading, setLoading] = useState(false);

    // Filtered tags based on search
    const filteredTags = useMemo(() => {
        if (!searchText.trim()) return tags;
        return tags.filter(tag => tag.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [tags, searchText]);

    // Handle create new tag
    const handleCreate = () => {
        setEditingTag(null);
        setIsModalOpen(true);
    };

    // Handle edit tag
    const handleEdit = record => {
        setEditingTag(record);
        setIsModalOpen(true);
    };

    // Handle delete tag
    const handleDelete = id => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setTags(prev => prev.filter(tag => tag.id !== id));
            message.success('Đã xóa tag thành công');
            setLoading(false);
        }, 500);
    };

    // Handle form submit
    const handleFormSubmit = values => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            if (editingTag) {
                // Update existing tag
                setTags(prev => prev.map(tag => (tag.id === editingTag.id ? { ...tag, ...values } : tag)));
                message.success('Đã cập nhật tag thành công');
            } else {
                // Create new tag
                const newTag = {
                    id: String(Date.now()),
                    ...values,
                    date_created: new Date().toISOString(),
                };
                setTags(prev => [...prev, newTag]);
                message.success('Đã tạo tag thành công');
            }
            setIsModalOpen(false);
            setEditingTag(null);
            setLoading(false);
        }, 500);
    };

    // Table columns
    const columns = [
        {
            title: 'Tag',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Tag color={record.color} style={{ fontSize: 14 }}>
                    {name}
                </Tag>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            key: 'color',
            width: 120,
            render: color => (
                <Space>
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            backgroundColor: color,
                            borderRadius: 4,
                            border: '1px solid #d9d9d9',
                        }}
                    />
                    <span>{color}</span>
                </Space>
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            width: 120,
            render: icon => icon || '-',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date_created',
            key: 'date_created',
            width: 180,
            render: date => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a, b) => new Date(a.date_created) - new Date(b.date_created),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Xóa tag này?"
                        description="Các khóa học liên kết sẽ mất tag này."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Quản lý Tags"
                subtitle="Tạo và quản lý các tags để phân loại khóa học"
                breadcrumbs={[{ title: 'Tags' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Tag
                    </Button>
                }
            />

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm tag..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            {/* Table */}
            {filteredTags.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredTags}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} tags`,
                    }}
                />
            ) : (
                <EmptyState
                    title="Chưa có tag nào"
                    description="Tạo tag đầu tiên để phân loại khóa học"
                    actionText="Thêm Tag"
                    onAction={handleCreate}
                />
            )}

            {/* Form Modal */}
            <TagFormModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingTag(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingTag}
                loading={loading}
            />
        </div>
    );
}

export default TagListPage;
