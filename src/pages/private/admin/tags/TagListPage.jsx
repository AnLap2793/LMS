import { useState } from 'react';
import { Button, Table, Space, Tag, Popconfirm, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import TagFormModal from '../../../../components/admin/tags/TagFormModal';
import { useTagsList, useCreateTag, useUpdateTag, useDeleteTag } from '../../../../hooks/useTags';

/**
 * Tag List Page
 * CRUD management for Tags
 */
function TagListPage() {
    // Search state
    const [searchText, setSearchText] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null);

    // React Query Hooks
    const { data: tags = [], isLoading: tagsLoading } = useTagsList({
        search: searchText,
        limit: -1, // Fetch all for now, or implement pagination
    });

    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const deleteTag = useDeleteTag();

    const loading = createTag.isPending || updateTag.isPending || deleteTag.isPending || tagsLoading;

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
    const handleDelete = async id => {
        await deleteTag.mutateAsync(id);
    };

    // Handle form submit
    const handleFormSubmit = async values => {
        try {
            if (editingTag) {
                // Update existing tag
                await updateTag.mutateAsync({ id: editingTag.id, data: values });
            } else {
                // Create new tag
                await createTag.mutateAsync(values);
            }
            setIsModalOpen(false);
            setEditingTag(null);
        } catch (error) {
            // Error handled by global handler
        }
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
            render: date => (date ? new Date(date).toLocaleDateString('vi-VN') : '-'),
            sorter: (a, b) => new Date(a.date_created || 0) - new Date(b.date_created || 0),
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
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deleteTag.isPending && deleteTag.variables === record.id}
                        />
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
            {tags.length > 0 || loading ? (
                <Table
                    columns={columns}
                    dataSource={tags}
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
                    title={searchText ? 'Không tìm thấy tag' : 'Chưa có tag nào'}
                    description={searchText ? 'Thử từ khóa khác' : 'Tạo tag đầu tiên để phân loại khóa học'}
                    actionText={searchText ? undefined : 'Thêm Tag'}
                    onAction={searchText ? undefined : handleCreate}
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
                loading={createTag.isPending || updateTag.isPending}
            />
        </div>
    );
}

export default TagListPage;
