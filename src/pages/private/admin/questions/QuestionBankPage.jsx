import { useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, Tooltip, Card, Row, Col, Statistic, Typography } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DatabaseOutlined,
    CheckCircleOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { QuestionBankFormModal, QuestionFilters } from '../../../../components/admin/questions';
import {
    useQuestionBank,
    useQuestionBankStats,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
} from '../../../../hooks/useQuestionBank';
import { QUESTION_TYPE_MAP, QUESTION_DIFFICULTY_MAP, QUESTION_CATEGORY_MAP } from '../../../../constants/lms';

const { Paragraph } = Typography;

const DEFAULT_FILTERS = {
    search: '',
    category: undefined,
    difficulty: undefined,
    type: undefined,
    status: undefined,
    page: 1,
    limit: 10,
};

/**
 * QuestionBankPage
 * Trang quản lý Ngân hàng câu hỏi
 */
function QuestionBankPage() {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Queries
    const { data: questionsData, isLoading } = useQuestionBank(filters);
    const { data: stats } = useQuestionBankStats();

    // Mutations
    const createQuestion = useCreateQuestion();
    const updateQuestion = useUpdateQuestion();
    const deleteQuestion = useDeleteQuestion();

    // Handlers
    const handleFilterChange = newFilters => {
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleTableChange = pagination => {
        setFilters(prev => ({
            ...prev,
            page: pagination.current,
            limit: pagination.pageSize,
        }));
    };

    const handleCreate = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleEdit = record => {
        setEditingQuestion(record);
        setIsModalOpen(true);
    };

    const handleDelete = async id => {
        await deleteQuestion.mutateAsync(id);
    };

    const handleFormSubmit = async values => {
        if (editingQuestion) {
            await updateQuestion.mutateAsync({ id: editingQuestion.id, data: values });
        } else {
            await createQuestion.mutateAsync(values);
        }
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    // Table columns
    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: '35%',
            render: (text, record) => (
                <div>
                    <Paragraph ellipsis={{ rows: 2, tooltip: text }} style={{ marginBottom: 4 }}>
                        {text}
                    </Paragraph>
                    <Space size={4}>
                        {record.tags?.slice(0, 3).map(tag => (
                            <Tag key={tag} style={{ fontSize: 10 }}>
                                {tag}
                            </Tag>
                        ))}
                        {record.tags?.length > 3 && (
                            <Tooltip title={record.tags.slice(3).join(', ')}>
                                <Tag style={{ fontSize: 10 }}>+{record.tags.length - 3}</Tag>
                            </Tooltip>
                        )}
                    </Space>
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: type => {
                const config = QUESTION_TYPE_MAP[type];
                return <Tag color={config?.color}>{config?.label || type}</Tag>;
            },
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 110,
            render: difficulty => {
                const config = QUESTION_DIFFICULTY_MAP[difficulty];
                return <Tag color={config?.color}>{config?.label || difficulty}</Tag>;
            },
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: category => {
                const config = QUESTION_CATEGORY_MAP[category];
                return <Tag color={config?.color}>{config?.label || category}</Tag>;
            },
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            key: 'points',
            width: 70,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: status => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status === 'active' ? 'Hoạt động' : 'Ẩn'}
                </Tag>
            ),
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
                        title="Xóa câu hỏi này?"
                        description="Hành động này không thể hoàn tác"
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
                title="Ngân hàng Câu hỏi"
                subtitle="Quản lý tập câu hỏi dùng chung cho các bài kiểm tra"
                breadcrumbs={[{ title: 'Ngân hàng Câu hỏi' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Câu hỏi
                    </Button>
                }
            />

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng câu hỏi"
                            value={stats?.total || 0}
                            prefix={<DatabaseOutlined />}
                            styles={{ content: { color: '#1890ff' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đang hoạt động"
                            value={stats?.active || 0}
                            prefix={<CheckCircleOutlined />}
                            styles={{ content: { color: '#52c41a' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Trắc nghiệm"
                            value={(stats?.byType?.single || 0) + (stats?.byType?.multiple || 0)}
                            prefix={<QuestionCircleOutlined />}
                            styles={{ content: { color: '#722ed1' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tự luận"
                            value={stats?.byType?.text || 0}
                            prefix={<EditOutlined />}
                            styles={{ content: { color: '#fa8c16' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <QuestionFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
            </Card>

            {/* Table */}
            <Card>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={questionsData?.data || []}
                    loading={isLoading}
                    pagination={{
                        current: filters.page,
                        pageSize: filters.limit,
                        total: questionsData?.total || 0,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} câu hỏi`,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Form Modal */}
            <QuestionBankFormModal
                open={isModalOpen}
                onCancel={handleModalCancel}
                onSubmit={handleFormSubmit}
                initialValues={editingQuestion}
                loading={createQuestion.isPending || updateQuestion.isPending}
            />
        </div>
    );
}

export default QuestionBankPage;
