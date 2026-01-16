import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, Popconfirm, Input, Select, message, Tooltip, Empty } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UnorderedListOutlined,
    TrophyOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, EmptyState } from '../../../../components/common';
import QuizFormModal from '../../../../components/admin/quizzes/QuizFormModal';
import { quizService } from '../../../../services/quizService';
import { courseService } from '../../../../services/courseService';
import { queryKeys } from '../../../../constants/queryKeys';
import { showSuccess, showError } from '../../../../utils/errorHandler';

/**
 * Quiz List Page
 * Quản lý danh sách bài kiểm tra
 */
function QuizListPage() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [courseFilter, setCourseFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const queryClient = useQueryClient();

    // Data Hooks
    const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
        queryKey: queryKeys.quizzes.list({ search: searchText, course: courseFilter }),
        queryFn: () =>
            quizService.getAll({
                search: searchText,
                course_id: courseFilter,
            }),
    });

    const { data: courses = [] } = useQuery({
        queryKey: queryKeys.courses.list({ fields: ['id', 'title'] }),
        queryFn: () => courseService.getAll({ limit: -1, fields: ['id', 'title'] }),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: quizService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizzes.all);
            showSuccess('Đã tạo bài kiểm tra mới');
            setIsModalOpen(false);
            setEditingQuiz(null);
        },
        onError: showError,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => quizService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizzes.all);
            showSuccess('Đã cập nhật bài kiểm tra');
            setIsModalOpen(false);
            setEditingQuiz(null);
        },
        onError: showError,
    });

    const deleteMutation = useMutation({
        mutationFn: quizService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizzes.all);
            showSuccess('Đã xóa bài kiểm tra');
        },
        onError: showError,
    });

    // Handle operations
    const handleCreate = () => {
        setEditingQuiz(null);
        setIsModalOpen(true);
    };

    const handleEdit = record => {
        setEditingQuiz(record);
        setIsModalOpen(true);
    };

    const handleDelete = id => {
        deleteMutation.mutate(id);
    };

    const handleFormSubmit = values => {
        if (editingQuiz) {
            updateMutation.mutate({ id: editingQuiz.id, data: values });
        } else {
            createMutation.mutate({
                ...values,
                questions_count: 0,
                // date_created will be auto-set by Directus usually, but we can set specific fields if needed
            });
        }
    };

    const handleManageQuestions = id => {
        navigate(`/admin/quizzes/${id}/questions`);
    };

    // Get course title helper
    const getCourseTitle = courseId => {
        return courses.find(c => c.id === courseId)?.title || 'Unknown Course';
    };

    // Columns
    const columns = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: 'title',
            key: 'title',
            render: text => (
                <Space>
                    <TrophyOutlined style={{ color: '#faad14' }} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Khóa học',
            dataIndex: 'course_id',
            key: 'course',
            render: courseId => <Tag color="blue">{getCourseTitle(courseId)}</Tag>,
        },
        {
            title: 'Điểm đạt',
            dataIndex: 'pass_score',
            key: 'pass_score',
            render: score => `${score}%`,
        },
        {
            title: 'Thời gian',
            dataIndex: 'time_limit',
            key: 'time_limit',
            render: time => (time ? `${time} phút` : 'Không giới hạn'),
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'questions_count',
            key: 'questions',
            render: count => <Tag>{count || 0}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Quản lý câu hỏi">
                        <Button
                            type="text"
                            icon={<UnorderedListOutlined />}
                            onClick={() => handleManageQuestions(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Phân tích">
                        <Button
                            type="text"
                            icon={<BarChartOutlined />}
                            onClick={() => navigate(`/admin/quizzes/${record.id}/analysis`)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa bài kiểm tra này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Quản lý Bài kiểm tra"
                subtitle="Danh sách các bài kiểm tra và ngân hàng câu hỏi"
                breadcrumbs={[{ title: 'Bài kiểm tra' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Bài kiểm tra
                    </Button>
                }
            />

            {/* Filters */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Input
                    placeholder="Tìm kiếm bài kiểm tra..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                <Select
                    placeholder="Lọc theo khóa học"
                    value={courseFilter}
                    onChange={setCourseFilter}
                    style={{ width: 250 }}
                    allowClear
                    options={courses.map(c => ({ value: c.id, label: c.title }))}
                />
            </div>

            {/* Table */}
            {quizzes.length > 0 || quizzesLoading ? (
                <Table
                    columns={columns}
                    dataSource={quizzes}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={quizzesLoading}
                />
            ) : (
                <EmptyState
                    title="Chưa có bài kiểm tra nào"
                    description="Tạo bài kiểm tra đầu tiên để đánh giá học viên"
                    actionText="Thêm Bài kiểm tra"
                    onAction={handleCreate}
                />
            )}

            {/* Form Modal */}
            <QuizFormModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingQuiz(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingQuiz}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

export default QuizListPage;
