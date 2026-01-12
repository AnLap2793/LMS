import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, Popconfirm, Input, Select, message, Tooltip } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UnorderedListOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { PageHeader, EmptyState } from '../../../../components/common';
import QuizFormModal from '../../../../components/admin/quizzes/QuizFormModal';
import { mockQuizzes, mockCourses } from '../../../../mocks';

/**
 * Quiz List Page
 * Quản lý danh sách bài kiểm tra
 */
function QuizListPage() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState(mockQuizzes);
    const [searchText, setSearchText] = useState('');
    const [courseFilter, setCourseFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    // Filtered quizzes
    const filteredQuizzes = useMemo(() => {
        let result = quizzes;

        if (searchText.trim()) {
            result = result.filter(q => q.title.toLowerCase().includes(searchText.toLowerCase()));
        }

        if (courseFilter) {
            result = result.filter(q => q.course_id === courseFilter);
        }

        return result;
    }, [quizzes, searchText, courseFilter]);

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
        setQuizzes(prev => prev.filter(q => q.id !== id));
        message.success('Đã xóa bài kiểm tra');
    };

    const handleFormSubmit = values => {
        if (editingQuiz) {
            setQuizzes(prev => prev.map(q => (q.id === editingQuiz.id ? { ...q, ...values } : q)));
            message.success('Đã cập nhật bài kiểm tra');
        } else {
            const newQuiz = {
                id: `q${Date.now()}`,
                ...values,
                questions_count: 0,
                date_created: new Date().toISOString(),
            };
            setQuizzes(prev => [...prev, newQuiz]);
            message.success('Đã tạo bài kiểm tra mới');
        }
        setIsModalOpen(false);
        setEditingQuiz(null);
    };

    const handleManageQuestions = id => {
        navigate(`/admin/quizzes/${id}/questions`);
    };

    // Get course title
    const getCourseTitle = courseId => {
        return mockCourses.find(c => c.id === courseId)?.title || 'Unknown Course';
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
                    options={mockCourses.map(c => ({ value: c.id, label: c.title }))}
                />
            </div>

            {/* Table */}
            {filteredQuizzes.length > 0 ? (
                <Table columns={columns} dataSource={filteredQuizzes} rowKey="id" pagination={{ pageSize: 10 }} />
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
            />
        </div>
    );
}

export default QuizListPage;
