# Skill: Create Page Component

## Description

Tao page component moi cho LMS (admin panel, learner portal, hoac public pages).

## Usage

```
/create-page <PageName> [--type admin|learner|public] [--feature <featureName>]
```

## Parameters

- `PageName`: Ten page (PascalCase, ket thuc bang `Page`) - **bat buoc**
- `--type`: Loai page (`admin`, `learner`, `public`)
- `--feature`: Ten feature/folder chua page

## Instructions

### 1. Xac dinh duong dan

| Type    | Path                                 |
| ------- | ------------------------------------ |
| admin   | `src/pages/private/admin/<feature>/` |
| learner | `src/pages/private/learner/`         |
| public  | `src/pages/public/`                  |

### 2. Page Types va Templates

#### 2.1 List Page (CRUD)

```jsx
// src/pages/private/admin/<feature>/<Entity>ListPage.jsx
import { useState, useMemo } from 'react';
import { Button, Table, Space, Input, Select, Card, Row, Col, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageHeader, EmptyState, StatusTag } from '../../../../components/common';
import EntityFormModal from '../../../../components/admin/<feature>/EntityFormModal';
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity } from '../../../../hooks/useEntities';
import { PAGINATION } from '../../../../constants/api';

/**
 * Entity List Page
 * Quan ly danh sach entities
 */
function EntityListPage() {
    // State
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEntity, setEditingEntity] = useState(null);

    // React Query hooks
    const { data: entities = [], isLoading, refetch } = useEntities();
    const createEntity = useCreateEntity();
    const updateEntity = useUpdateEntity();
    const deleteEntity = useDeleteEntity();

    // Filtered data
    const filteredData = useMemo(() => {
        return entities.filter(entity => {
            const matchSearch = !searchText.trim() || entity.title.toLowerCase().includes(searchText.toLowerCase());
            const matchStatus = !statusFilter || entity.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [entities, searchText, statusFilter]);

    // Handlers
    const handleAdd = () => {
        setEditingEntity(null);
        setModalVisible(true);
    };

    const handleEdit = record => {
        setEditingEntity(record);
        setModalVisible(true);
    };

    const handleDelete = async id => {
        await deleteEntity.mutateAsync(id);
    };

    const handleModalSave = async values => {
        if (editingEntity) {
            await updateEntity.mutateAsync({ id: editingEntity.id, data: values });
        } else {
            await createEntity.mutateAsync(values);
        }
        setModalVisible(false);
    };

    // Table columns
    const columns = [
        {
            title: 'Tieu de',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Trang thai',
            dataIndex: 'status',
            key: 'status',
            render: status => <StatusTag status={status} />,
        },
        {
            title: 'Thao tac',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chinh sua">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Ban co chac muon xoa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xoa"
                        cancelText="Huy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const isSubmitting = createEntity.isPending || updateEntity.isPending;

    return (
        <div>
            <PageHeader
                title="Quan ly Entity"
                subtitle="Mo ta page"
                breadcrumbs={[{ title: 'Entity' }]}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Them moi
                    </Button>
                }
            />

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tim kiem..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Select
                            placeholder="Trang thai"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: null, label: 'Tat ca' },
                                { value: 'draft', label: 'Nhap' },
                                { value: 'published', label: 'Da xuat ban' },
                            ]}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                        <Tooltip title="Lam moi">
                            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
                        </Tooltip>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            {filteredData.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading || deleteEntity.isPending}
                    pagination={{
                        pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
                        showSizeChanger: true,
                        showTotal: total => `Tong ${total} ban ghi`,
                        pageSizeOptions: PAGINATION.PAGE_SIZE_OPTIONS,
                    }}
                />
            ) : (
                <EmptyState
                    title="Khong co du lieu"
                    description="Them moi de bat dau"
                    actionText="Them moi"
                    onAction={handleAdd}
                />
            )}

            {/* Modal */}
            <EntityFormModal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSave={handleModalSave}
                initialValues={editingEntity}
                loading={isSubmitting}
            />
        </div>
    );
}

export default EntityListPage;
```

#### 2.2 Detail Page

```jsx
// src/pages/private/admin/<feature>/<Entity>DetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Card, Descriptions, Button, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { PageHeader, StatusTag } from '../../../../components/common';
import { useEntity } from '../../../../hooks/useEntities';

/**
 * Entity Detail Page
 * Hien thi chi tiet entity
 */
function EntityDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: entity, isLoading } = useEntity(id);

    if (isLoading) {
        return <Spin size="large" />;
    }

    if (!entity) {
        return <div>Khong tim thay du lieu</div>;
    }

    return (
        <div>
            <PageHeader
                title={entity.title}
                breadcrumbs={[{ title: 'Entity', path: '/admin/entities' }, { title: entity.title }]}
                extra={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                            Quay lai
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/entities/${id}/edit`)}
                        >
                            Chinh sua
                        </Button>
                    </Space>
                }
            />

            <Card>
                <Descriptions column={2}>
                    <Descriptions.Item label="Tieu de">{entity.title}</Descriptions.Item>
                    <Descriptions.Item label="Trang thai">
                        <StatusTag status={entity.status} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Mo ta" span={2}>
                        {entity.description}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
}

export default EntityDetailPage;
```

### 3. Them route

```jsx
// src/routes/index.jsx
{
    path: 'entities',
    element: <EntityListPage />,
},
{
    path: 'entities/:id',
    element: <EntityDetailPage />,
},
```

### 4. Checklist sau khi tao

- [ ] Import dung components tu dung path
- [ ] Su dung PageHeader component
- [ ] Su dung hooks tu `hooks/`
- [ ] Su dung constants tu `constants/`
- [ ] Loading states
- [ ] Error handling
- [ ] Empty state
- [ ] Responsive layout
- [ ] Them route vao router config

## Related Files

- `src/components/common/PageHeader.jsx`
- `src/components/common/EmptyState.jsx`
- `src/hooks/` - React Query hooks
- `src/routes/` - Route configuration
