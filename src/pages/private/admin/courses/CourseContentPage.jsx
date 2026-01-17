import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Collapse, Tag, Tooltip, Popconfirm, Empty, Spin } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    HolderOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    FileOutlined,
    LinkOutlined,
    FormOutlined,
    DownOutlined,
    RightOutlined,
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
import { PageHeader } from '../../../../components/common';
import ModuleFormModal from '../../../../components/admin/courses/ModuleFormModal';
import LessonFormModal from '../../../../components/admin/courses/LessonFormModal';
import { useCourseInfo } from '../../../../hooks/useCourses';
import {
    useModulesWithLessons,
    useCreateModule,
    useUpdateModule,
    useDeleteModule,
    useUpdateModuleOrder,
} from '../../../../hooks/useModules';
import { useCreateLesson, useUpdateLesson, useDeleteLesson, useUpdateLessonOrder } from '../../../../hooks/useLessons';
import { LESSON_TYPE_MAP } from '../../../../constants/lms';
import { showError } from '../../../../utils/errorHandler';

const { Text } = Typography;

// Icon mapping for lesson types
const lessonIcons = {
    video: <PlayCircleOutlined style={{ color: '#1890ff' }} />,
    article: <FileTextOutlined style={{ color: '#52c41a' }} />,
    file: <FileOutlined style={{ color: '#faad14' }} />,
    link: <LinkOutlined style={{ color: '#722ed1' }} />,
    quiz: <FormOutlined style={{ color: '#eb2f96' }} />,
};

/**
 * Sortable Lesson Item Component
 */
function SortableLessonItem({ lesson, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const typeConfig = LESSON_TYPE_MAP[lesson.type] || { label: lesson.type };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                style={{
                    padding: '12px 16px',
                    background: '#fafafa',
                    marginBottom: 8,
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                {/* Drag handle and icon */}
                <Space>
                    <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
                        <HolderOutlined style={{ color: '#999' }} />
                    </span>
                    {lessonIcons[lesson.type]}
                </Space>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 4 }}>
                        <Text strong>{lesson.title}</Text>
                    </div>
                    <Space size="small">
                        <Tag>{typeConfig.label}</Tag>
                        {lesson.duration && <Text type="secondary">{lesson.duration} phút</Text>}
                    </Space>
                </div>

                {/* Actions */}
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(lesson)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa bài học này?"
                        onConfirm={() => onDelete(lesson.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            </div>
        </div>
    );
}

/**
 * Sortable Module Item Component
 */
function SortableModuleItem({
    module,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onAddLesson,
    onLessonDragEnd,
    sensors,
    onEditLesson,
    onDeleteLesson,
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 16,
        opacity: isDragging ? 0.5 : 1,
    };

    const lessons = module.lessons || [];

    return (
        <div ref={setNodeRef} style={style}>
            <Card
                size="small"
                style={{ borderRadius: 8 }}
                styles={{
                    header: {
                        background: isExpanded ? '#fff1f0' : '#fafafa',
                        borderBottom: isExpanded ? '1px solid #ffccc7' : '1px solid #f0f0f0',
                    },
                }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                            {...attributes}
                            {...listeners}
                            style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <HolderOutlined style={{ color: '#999' }} />
                        </span>
                        <span
                            onClick={() => onToggle(module.id)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}
                        >
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                            <Text strong>{module.title}</Text>
                            <Text type="secondary">({lessons.length} bài học)</Text>
                            {module.status === 'draft' && <Tag>Nháp</Tag>}
                        </span>
                    </div>
                }
                extra={
                    <Space onClick={e => e.stopPropagation()}>
                        <Tooltip title="Chỉnh sửa module">
                            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(module)} />
                        </Tooltip>
                        <Popconfirm
                            title="Xóa module này?"
                            description="Tất cả bài học trong module sẽ bị xóa."
                            onConfirm={() => onDelete(module.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Xóa module">
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                }
            >
                {isExpanded && (
                    <div style={{ padding: '8px 0' }}>
                        {module.description && (
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                {module.description}
                            </Text>
                        )}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => onAddLesson(module.id)}
                            style={{ marginBottom: 16 }}
                            block
                        >
                            Thêm bài học
                        </Button>

                        {lessons.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={event => onLessonDragEnd(event, module.id)}
                            >
                                <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                    {lessons.map(lesson => (
                                        <SortableLessonItem
                                            key={lesson.id}
                                            lesson={lesson}
                                            onEdit={onEditLesson}
                                            onDelete={lessonId => onDeleteLesson(lessonId, module.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <Empty description="Chưa có bài học" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}

/**
 * Course Content Page
 * Quản lý Modules và Lessons với drag-drop
 */
function CourseContentPage() {
    const { id: courseId } = useParams();
    const navigate = useNavigate();

    // Data Hooks
    const { data: course, isLoading: courseLoading } = useCourseInfo(courseId);
    // Sử dụng hook lấy modules kèm lessons
    const { data: modules = [], isLoading: modulesLoading } = useModulesWithLessons(courseId);

    // Mutation Hooks - Modules
    const createModule = useCreateModule();
    const updateModule = useUpdateModule();
    const deleteModule = useDeleteModule(courseId);
    const updateModuleOrder = useUpdateModuleOrder();

    // Mutation Hooks - Lessons
    const createLesson = useCreateLesson(courseId);
    const updateLesson = useUpdateLesson(courseId);
    const deleteLesson = useDeleteLesson(courseId);
    const updateLessonOrder = useUpdateLessonOrder();

    // State
    const [localModules, setLocalModules] = useState([]);
    const [expandedModules, setExpandedModules] = useState(new Set());

    // Use local state for optimistic updates
    const displayModules = useMemo(() => {
        if (localModules.length > 0) return localModules;
        return modules;
    }, [modules, localModules]);

    // Modal states
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Toggle module expand/collapse
    const handleToggleModule = useCallback(moduleId => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    }, []);

    // Handle module drag end
    const handleModuleDragEnd = event => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const previousModules = [...displayModules];
            const oldIndex = displayModules.findIndex(m => m.id === active.id);
            const newIndex = displayModules.findIndex(m => m.id === over.id);
            const newModules = arrayMove(displayModules, oldIndex, newIndex);

            // Optimistic update
            setLocalModules(newModules);

            // Call API
            const orderedIds = newModules.map(m => m.id);
            updateModuleOrder.mutate(
                { courseId, orderedIds },
                {
                    onSuccess: () => {
                        setLocalModules([]);
                    },
                    onError: () => {
                        setLocalModules(previousModules);
                        showError('Không thể cập nhật thứ tự module. Vui lòng thử lại.');
                    },
                }
            );
        }
    };

    // Handle lesson drag end
    const handleLessonDragEnd = (event, moduleId) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const currentModules = [...displayModules];
            const moduleIndex = currentModules.findIndex(m => m.id === moduleId);

            if (moduleIndex === -1) return;

            const module = currentModules[moduleIndex];
            const lessons = module.lessons || [];

            const oldIndex = lessons.findIndex(l => l.id === active.id);
            const newIndex = lessons.findIndex(l => l.id === over.id);

            // Create new lessons array
            const newLessons = arrayMove(lessons, oldIndex, newIndex);

            // Create new module object with updated lessons
            const updatedModule = { ...module, lessons: newLessons };

            // Create new modules array with updated module
            const updatedModules = [...currentModules];
            updatedModules[moduleIndex] = updatedModule;

            // Optimistic update
            setLocalModules(updatedModules);

            // Call API
            const orderedIds = newLessons.map(l => l.id);
            updateLessonOrder.mutate(
                { moduleId, orderedIds },
                {
                    onSuccess: () => {
                        setLocalModules([]);
                    },
                    onError: () => {
                        // Rollback logic could be implemented here, fetching clean data is easiest
                        setLocalModules([]);
                        showError('Không thể cập nhật thứ tự bài học. Vui lòng thử lại.');
                    },
                }
            );
        }
    };

    // Handle module operations
    const handleAddModule = () => {
        setEditingModule(null);
        setModuleModalOpen(true);
    };

    const handleEditModule = module => {
        setEditingModule(module);
        setModuleModalOpen(true);
    };

    const handleDeleteModule = async moduleId => {
        await deleteModule.mutateAsync(moduleId);
        setLocalModules([]);
        // Remove from expanded set
        setExpandedModules(prev => {
            const next = new Set(prev);
            next.delete(moduleId);
            return next;
        });
    };

    const handleModuleSubmit = async values => {
        if (editingModule) {
            await updateModule.mutateAsync({ id: editingModule.id, data: values });
        } else {
            await createModule.mutateAsync({
                course_id: courseId,
                ...values,
                sort: displayModules.length,
            });
        }
        setModuleModalOpen(false);
        setEditingModule(null);
        setLocalModules([]);
    };

    // Handle lesson operations
    const handleAddLesson = moduleId => {
        setSelectedModuleId(moduleId);
        setEditingLesson(null);
        setLessonModalOpen(true);
    };

    const handleEditLesson = lesson => {
        setEditingLesson(lesson);
        setLessonModalOpen(true);
    };

    const handleDeleteLesson = async (lessonId, moduleId) => {
        await deleteLesson.mutateAsync({ lessonId, moduleId });
        setLocalModules([]); // Clear local state to force refresh
    };

    const handleLessonSubmit = async values => {
        if (editingLesson) {
            await updateLesson.mutateAsync({ id: editingLesson.id, data: values });
        } else {
            await createLesson.mutateAsync({
                module_id: selectedModuleId,
                ...values,
            });
        }
        setLessonModalOpen(false);
        setEditingLesson(null);
        setSelectedModuleId(null);
        setLocalModules([]);
    };

    const isLoading = courseLoading || modulesLoading;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!course) {
        return (
            <Empty description="Không tìm thấy khóa học" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button onClick={() => navigate('/admin/courses')}>Quay lại danh sách</Button>
            </Empty>
        );
    }

    return (
        <div>
            <PageHeader
                title={`Nội dung: ${course.title}`}
                subtitle="Quản lý modules và bài học. Kéo thả để sắp xếp thứ tự."
                breadcrumbs={[
                    { title: 'Khóa học', path: '/admin/courses' },
                    { title: course.title, path: `/admin/courses/${courseId}` },
                    { title: 'Nội dung' },
                ]}
                actions={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/courses')}>
                            Quay lại
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddModule}>
                            Thêm Module
                        </Button>
                    </Space>
                }
            />

            <Card>
                {displayModules.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
                        <SortableContext items={displayModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            {displayModules.map(module => (
                                <SortableModuleItem
                                    key={module.id}
                                    module={module}
                                    isExpanded={expandedModules.has(module.id)}
                                    onToggle={handleToggleModule}
                                    onEdit={handleEditModule}
                                    onDelete={handleDeleteModule}
                                    onAddLesson={handleAddLesson}
                                    onLessonDragEnd={handleLessonDragEnd}
                                    sensors={sensors}
                                    onEditLesson={handleEditLesson}
                                    onDeleteLesson={handleDeleteLesson}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <Empty description="Chưa có module nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddModule}>
                            Thêm Module đầu tiên
                        </Button>
                    </Empty>
                )}
            </Card>

            {/* Module Form Modal */}
            <ModuleFormModal
                open={moduleModalOpen}
                onCancel={() => {
                    setModuleModalOpen(false);
                    setEditingModule(null);
                }}
                onSubmit={handleModuleSubmit}
                initialValues={editingModule}
            />

            {/* Lesson Form Modal */}
            <LessonFormModal
                open={lessonModalOpen}
                onCancel={() => {
                    setLessonModalOpen(false);
                    setEditingLesson(null);
                    setSelectedModuleId(null);
                }}
                onSubmit={handleLessonSubmit}
                initialValues={editingLesson}
            />
        </div>
    );
}

export default CourseContentPage;
