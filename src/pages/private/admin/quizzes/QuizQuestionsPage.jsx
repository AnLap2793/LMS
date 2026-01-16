import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Tag, Popconfirm, message } from 'antd';
import {
    PlusOutlined,
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    HolderOutlined,
    CheckCircleOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, EmptyState } from '../../../../components/common';
import QuestionFormModal from '../../../../components/admin/quizzes/QuestionFormModal';
import { QuestionSelectionModal } from '../../../../components/admin/questions';
import { quizService } from '../../../../services/quizService';
import { questionBankService } from '../../../../services/questionBankService';
import { queryKeys } from '../../../../constants/queryKeys';
import { showSuccess, showError } from '../../../../utils/errorHandler';

const { Text } = Typography;

// Sortable Question Item
function SortableQuestionItem({ question, index, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: 16,
    };

    const renderOptions = () => {
        if (question.type === 'text') {
            return (
                <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4, marginTop: 8 }}>
                    <Text type="secondary">Câu trả lời tự luận</Text>
                </div>
            );
        }

        return (
            <div style={{ marginTop: 8 }}>
                {Object.entries(question.options || {})
                    .filter(([key]) => key !== 'correct')
                    .map(([key, value]) => {
                        const isCorrect = question.options.correct?.includes(key);
                        return (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    background: isCorrect ? '#f6ffed' : 'transparent',
                                    border: isCorrect ? '1px solid #b7eb8f' : '1px solid transparent',
                                    borderRadius: 4,
                                    marginBottom: 4,
                                }}
                            >
                                <span style={{ fontWeight: 'bold', width: 24 }}>{key}.</span>
                                <span style={{ flex: 1 }}>{value}</span>
                                {isCorrect && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            </div>
                        );
                    })}
            </div>
        );
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card
                size="small"
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8 }}>
                            <HolderOutlined style={{ color: '#999' }} />
                        </span>
                        <Text strong>Câu {index + 1}</Text>
                        <Tag style={{ marginLeft: 8 }}>
                            {question.type === 'single'
                                ? 'Một đáp án'
                                : question.type === 'multiple'
                                  ? 'Nhiều đáp án'
                                  : 'Tự luận'}
                        </Tag>
                        <Tag color="blue">{question.points} điểm</Tag>
                        {question.source_question_id && (
                            <Tag color="purple" icon={<DatabaseOutlined />}>
                                Từ ngân hàng
                            </Tag>
                        )}
                    </div>
                }
                extra={
                    <Space>
                        <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(question)} />
                        <Popconfirm
                            title="Xóa câu hỏi này?"
                            onConfirm={() => onDelete(question.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                }
            >
                <div style={{ marginBottom: 12, fontSize: 16 }}>{question.question}</div>
                {renderOptions()}
                {question.explanation && (
                    <div style={{ marginTop: 12, padding: 8, background: '#e6f7ff', borderRadius: 4 }}>
                        <Text type="secondary" strong>
                            Giải thích:{' '}
                        </Text>
                        <Text type="secondary">{question.explanation}</Text>
                    </div>
                )}
            </Card>
        </div>
    );
}

/**
 * Quiz Questions Page
 * Quản lý câu hỏi của bài kiểm tra
 */
function QuizQuestionsPage() {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch quiz info
    const { data: quiz = { title: 'Bài kiểm tra' } } = useQuery({
        queryKey: queryKeys.quizzes.detail(quizId),
        queryFn: () => quizService.getById(quizId),
    });

    // Fetch questions
    const { data: questions = [] } = useQuery({
        queryKey: queryKeys.quizQuestions.byQuiz(quizId),
        queryFn: () => quizService.getQuestions(quizId),
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Get IDs of questions already in quiz (to exclude from selection)
    const existingQuestionIds = useMemo(() => {
        return questions.filter(q => q.source_question_id).map(q => q.source_question_id);
    }, [questions]);

    // Mutations
    const addQuestion = useMutation({
        mutationFn: data => quizService.addQuestion(quizId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizQuestions.byQuiz(quizId));
            showSuccess('Đã thêm câu hỏi mới');
            setIsModalOpen(false);
            setEditingQuestion(null);
        },
        onError: showError,
    });

    const updateQuestion = useMutation({
        mutationFn: ({ id, data }) => quizService.updateQuestion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizQuestions.byQuiz(quizId));
            showSuccess('Đã cập nhật câu hỏi');
            setIsModalOpen(false);
            setEditingQuestion(null);
        },
        onError: showError,
    });

    const deleteQuestion = useMutation({
        mutationFn: quizService.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.quizQuestions.byQuiz(quizId));
            showSuccess('Đã xóa câu hỏi');
        },
        onError: showError,
    });

    const copyQuestions = useMutation({
        mutationFn: ids => questionBankService.copyToQuiz(ids, quizId),
        onSuccess: data => {
            queryClient.invalidateQueries(queryKeys.quizQuestions.byQuiz(quizId));
            showSuccess(`Đã thêm ${data.length} câu hỏi từ Ngân hàng`);
            setIsSelectionModalOpen(false);
        },
        onError: showError,
    });

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = event => {
        const { active, over } = event;
        if (active.id !== over.id) {
            // Optimistic update
            const oldIndex = questions.findIndex(q => q.id === active.id);
            const newIndex = questions.findIndex(q => q.id === over.id);
            const newItems = arrayMove(questions, oldIndex, newIndex);

            // In a real implementation, we need to call API to update sort order for all affected items
            // For now, we'll just show a message as Directus sort update usually requires updating items
            // Ideally call mutation here
            message.info('Cập nhật thứ tự câu hỏi (Logic sắp xếp cần API update batch)');
        }
    };

    const handleCreate = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleOpenSelectionModal = () => {
        setIsSelectionModalOpen(true);
    };

    const handleEdit = question => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleDelete = id => {
        deleteQuestion.mutate(id);
    };

    const handleFormSubmit = values => {
        if (editingQuestion) {
            updateQuestion.mutate({ id: editingQuestion.id, data: values });
        } else {
            addQuestion.mutate(values);
        }
    };

    // Handle questions selected from Question Bank
    const handleSelectFromBank = selectedQuestions => {
        const ids = selectedQuestions.map(q => q.id);
        copyQuestions.mutate(ids);
    };

    return (
        <div>
            <PageHeader
                title={`Câu hỏi: ${quiz.title}`}
                subtitle={`${questions.length} câu hỏi - Tổng điểm: ${questions.reduce((sum, q) => sum + (q.points || 0), 0)}`}
                breadcrumbs={[{ title: 'Bài kiểm tra', path: '/admin/quizzes' }, { title: 'Câu hỏi' }]}
                actions={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/quizzes')}>
                            Quay lại
                        </Button>
                        <Button icon={<DatabaseOutlined />} onClick={handleOpenSelectionModal}>
                            Chọn từ Ngân hàng
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Thêm Câu hỏi
                        </Button>
                    </Space>
                }
            />

            {questions.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                        <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            {questions.map((question, index) => (
                                <SortableQuestionItem
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <EmptyState
                    title="Chưa có câu hỏi nào"
                    description="Thêm câu hỏi mới hoặc chọn từ Ngân hàng câu hỏi"
                    actionText="Thêm Câu hỏi"
                    onAction={handleCreate}
                    extra={
                        <Button icon={<DatabaseOutlined />} onClick={handleOpenSelectionModal} style={{ marginTop: 8 }}>
                            Chọn từ Ngân hàng
                        </Button>
                    }
                />
            )}

            {/* Form Modal - Tạo câu hỏi mới */}
            <QuestionFormModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingQuestion(null);
                }}
                onSubmit={handleFormSubmit}
                initialValues={editingQuestion}
                loading={addQuestion.isPending || updateQuestion.isPending}
            />

            {/* Selection Modal - Chọn từ Ngân hàng */}
            <QuestionSelectionModal
                open={isSelectionModalOpen}
                onCancel={() => setIsSelectionModalOpen(false)}
                onSelect={handleSelectFromBank}
                excludeIds={existingQuestionIds}
                loading={copyQuestions.isPending}
            />
        </div>
    );
}

export default QuizQuestionsPage;
