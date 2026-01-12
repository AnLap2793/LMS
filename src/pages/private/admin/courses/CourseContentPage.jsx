import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Collapse, List, Tag, Tooltip, Popconfirm, Empty, message } from 'antd';
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
import { mockCourses, getModulesWithLessons } from '../../../../mocks';
import { LESSON_TYPE_MAP } from '../../../../constants/lms';

const { Text } = Typography;

// Icon mapping for lesson types
const lessonIcons = {
    video: <PlayCircleOutlined style={{ color: '#1890ff' }} />,
    article: <FileTextOutlined style={{ color: '#52c41a' }} />,
    file: <FileOutlined style={{ color: '#faad14' }} />,
    link: <LinkOutlined style={{ color: '#722ed1' }} />,
    quiz: <FormOutlined style={{ color: '#eb2f96' }} />,
};

// Sortable Module Item Component
function SortableModuleItem({ module, isActive, onToggle, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 16,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Collapse
                activeKey={isActive ? [module.id] : []}
                onChange={() => onToggle(module.id)}
                items={[
                    {
                        key: module.id,
                        label: (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space>
                                    <span
                                        {...attributes}
                                        {...listeners}
                                        style={{ cursor: 'grab' }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <HolderOutlined style={{ color: '#999' }} />
                                    </span>
                                    <Text strong>{module.title}</Text>
                                    <Text type="secondary">({module.lessons?.length || 0} bài học)</Text>
                                    {module.status === 'draft' && <Tag>Nháp</Tag>}
                                </Space>
                                {children.actions}
                            </div>
                        ),
                        children: children.content,
                    },
                ]}
            />
        </div>
    );
}

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
            <List.Item
                style={{
                    padding: '12px 16px',
                    background: '#fafafa',
                    marginBottom: 8,
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                }}
                actions={[
                    <Tooltip title="Chỉnh sửa" key="edit">
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(lesson)} />
                    </Tooltip>,
                    <Popconfirm
                        key="delete"
                        title="Xóa bài học này?"
                        onConfirm={() => onDelete(lesson.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>,
                ]}
            >
                <List.Item.Meta
                    avatar={
                        <Space>
                            <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
                                <HolderOutlined style={{ color: '#999' }} />
                            </span>
                            {lessonIcons[lesson.type]}
                        </Space>
                    }
                    title={lesson.title}
                    description={
                        <Space size="small">
                            <Tag>{typeConfig.label}</Tag>
                            {lesson.duration && <Text type="secondary">{lesson.duration} phút</Text>}
                            {lesson.is_required && <Tag color="red">Bắt buộc</Tag>}
                        </Space>
                    }
                />
            </List.Item>
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

    // Find course
    const course = mockCourses.find(c => c.id === courseId) || { title: 'Khóa học' };

    // State
    const [modules, setModules] = useState(() => getModulesWithLessons(courseId));
    const [activeModuleId, setActiveModuleId] = useState(null);

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

    // Handle module drag end
    const handleModuleDragEnd = event => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setModules(items => {
                const oldIndex = items.findIndex(m => m.id === active.id);
                const newIndex = items.findIndex(m => m.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            message.success('Đã cập nhật thứ tự module');
        }
    };

    // Handle lesson drag end
    const handleLessonDragEnd = (event, moduleId) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setModules(prevModules =>
                prevModules.map(module => {
                    if (module.id !== moduleId) return module;

                    const oldIndex = module.lessons.findIndex(l => l.id === active.id);
                    const newIndex = module.lessons.findIndex(l => l.id === over.id);

                    return {
                        ...module,
                        lessons: arrayMove(module.lessons, oldIndex, newIndex).map((lesson, index) => ({
                            ...lesson,
                            sort: index + 1,
                        })),
                    };
                })
            );
            message.success('Đã cập nhật thứ tự bài học');
        }
    };

    const handleToggleModule = id => {
        setActiveModuleId(activeModuleId === id ? null : id);
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

    const handleDeleteModule = moduleId => {
        setModules(prev => prev.filter(m => m.id !== moduleId));
        message.success('Đã xóa module');
    };

    const handleModuleSubmit = values => {
        if (editingModule) {
            setModules(prev => prev.map(m => (m.id === editingModule.id ? { ...m, ...values } : m)));
            message.success('Đã cập nhật module');
        } else {
            const newModule = {
                id: `m${Date.now()}`,
                course_id: courseId,
                ...values,
                sort: modules.length + 1,
                lessons: [],
                date_created: new Date().toISOString(),
            };
            setModules(prev => [...prev, newModule]);
            setActiveModuleKeys(prev => [...prev, newModule.id]);
            message.success('Đã thêm module mới');
        }
        setModuleModalOpen(false);
        setEditingModule(null);
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

    const handleDeleteLesson = lessonId => {
        setModules(prev =>
            prev.map(module => ({
                ...module,
                lessons: module.lessons.filter(l => l.id !== lessonId),
            }))
        );
        message.success('Đã xóa bài học');
    };

    const handleLessonSubmit = values => {
        if (editingLesson) {
            setModules(prev =>
                prev.map(module => ({
                    ...module,
                    lessons: module.lessons.map(l => (l.id === editingLesson.id ? { ...l, ...values } : l)),
                }))
            );
            message.success('Đã cập nhật bài học');
        } else {
            const targetModule = modules.find(m => m.id === selectedModuleId);
            const newLesson = {
                id: `l${Date.now()}`,
                module_id: selectedModuleId,
                ...values,
                sort: (targetModule?.lessons?.length || 0) + 1,
                date_created: new Date().toISOString(),
            };
            setModules(prev =>
                prev.map(module =>
                    module.id === selectedModuleId ? { ...module, lessons: [...module.lessons, newLesson] } : module
                )
            );
            message.success('Đã thêm bài học mới');
        }
        setLessonModalOpen(false);
        setEditingLesson(null);
        setSelectedModuleId(null);
    };

    // Render module panel logic removed as it's now handled by SortableModuleItem

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
                {modules.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
                        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            {modules.map(module => (
                                <SortableModuleItem
                                    key={module.id}
                                    module={module}
                                    isActive={activeModuleId === module.id}
                                    onToggle={handleToggleModule}
                                >
                                    {{
                                        actions: (
                                            <Space onClick={e => e.stopPropagation()}>
                                                <Tooltip title="Chỉnh sửa module">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEditModule(module)}
                                                    />
                                                </Tooltip>
                                                <Popconfirm
                                                    title="Xóa module này?"
                                                    description="Tất cả bài học trong module sẽ bị xóa."
                                                    onConfirm={() => handleDeleteModule(module.id)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Tooltip title="Xóa module">
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        />
                                                    </Tooltip>
                                                </Popconfirm>
                                            </Space>
                                        ),
                                        content: (
                                            <div>
                                                {module.description && (
                                                    <Text
                                                        type="secondary"
                                                        style={{ display: 'block', marginBottom: 16 }}
                                                    >
                                                        {module.description}
                                                    </Text>
                                                )}

                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleAddLesson(module.id)}
                                                    style={{ marginBottom: 16 }}
                                                    block
                                                >
                                                    Thêm bài học
                                                </Button>

                                                {module.lessons && module.lessons.length > 0 ? (
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={event => handleLessonDragEnd(event, module.id)}
                                                    >
                                                        <SortableContext
                                                            items={module.lessons.map(l => l.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            {module.lessons.map(lesson => (
                                                                <SortableLessonItem
                                                                    key={lesson.id}
                                                                    lesson={lesson}
                                                                    onEdit={handleEditLesson}
                                                                    onDelete={handleDeleteLesson}
                                                                />
                                                            ))}
                                                        </SortableContext>
                                                    </DndContext>
                                                ) : (
                                                    <Empty
                                                        description="Chưa có bài học"
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    />
                                                )}
                                            </div>
                                        ),
                                    }}
                                </SortableModuleItem>
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
