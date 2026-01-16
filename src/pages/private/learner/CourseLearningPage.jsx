import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Layout,
    Menu,
    Card,
    Button,
    Progress,
    Typography,
    Space,
    Tag,
    Drawer,
    message,
    Spin,
    Result,
    Tooltip,
    Collapse,
    Badge,
    Tabs,
    List,
    Avatar,
    Input,
    Divider,
    Empty,
} from 'antd';
import {
    MenuOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    FileOutlined,
    LinkOutlined,
    FormOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    MessageOutlined,
    EditOutlined,
    DeleteOutlined,
    SendOutlined,
    LikeOutlined,
    DownloadOutlined,
    UserOutlined,
    LockOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useCourseDetail } from '../../../hooks/useCourses';
import { useEnrollmentByCourse } from '../../../hooks/useEnrollments';
import { useLessonProgressByEnrollment, useCompleteLesson, useStartLesson } from '../../../hooks/useLessonProgress';
import { useNotesByLesson, useCreateNote, useDeleteNote } from '../../../hooks/useNotes';
import { useCommentsByLesson, useCreateComment } from '../../../hooks/useComments';
import { LESSON_TYPE_MAP } from '../../../constants/lms';
import { getAssetUrl } from '../../../utils/directusHelpers';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Course Learning Page
 * Giao diện học bài với sidebar hiển thị module/lesson
 */
function CourseLearningPage() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Notes state
    const [currentNote, setCurrentNote] = useState('');

    // Discussion state
    const [newComment, setNewComment] = useState('');

    // Data Hooks
    const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
    const { data: enrollment, isLoading: enrollmentLoading } = useEnrollmentByCourse(courseId);

    // Only fetch progress if enrollment exists
    const { data: progressList = [], isLoading: progressLoading } = useLessonProgressByEnrollment(enrollment?.id);

    // Mutations
    const startLessonMutation = useStartLesson();
    const completeLessonMutation = useCompleteLesson();
    const createNoteMutation = useCreateNote();
    const deleteNoteMutation = useDeleteNote();
    const createCommentMutation = useCreateComment();

    // Derived Data
    const modules = useMemo(() => {
        if (!course?.modules) return [];
        return [...course.modules].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }, [course]);

    const allLessons = useMemo(() => {
        const lessons = [];
        modules.forEach(module => {
            const moduleLessons = module.lessons || [];
            moduleLessons.forEach(lesson => {
                lessons.push({
                    ...lesson,
                    moduleId: module.id,
                    moduleTitle: module.title,
                });
            });
        });
        return lessons;
    }, [modules]);

    const completedLessonIds = useMemo(() => {
        return progressList.filter(p => p.status === 'completed').map(p => p.lesson?.id || p.lesson); // Handle object or ID
    }, [progressList]);

    const overallProgress = useMemo(() => {
        if (allLessons.length === 0) return 0;
        return Math.round((completedLessonIds.length / allLessons.length) * 100);
    }, [allLessons, completedLessonIds]);

    const currentLesson = useMemo(() => {
        if (!lessonId) return null;
        return allLessons.find(l => l.id === lessonId);
    }, [lessonId, allLessons]);

    const currentLessonIndex = useMemo(() => {
        if (!currentLesson) return -1;
        return allLessons.findIndex(l => l.id === currentLesson.id);
    }, [currentLesson, allLessons]);

    // Lesson specific hooks (Notes & Comments)
    const { data: notes = [] } = useNotesByLesson(lessonId);
    const { data: comments = [] } = useCommentsByLesson(lessonId);

    // Helpers
    const isLessonLocked = targetLessonId => {
        const lessonIndex = allLessons.findIndex(l => l.id === targetLessonId);
        if (lessonIndex <= 0) return false;

        // Check if previous lesson is completed
        const prevLessonId = allLessons[lessonIndex - 1].id;
        return !completedLessonIds.includes(prevLessonId);
    };

    const hasPrevious = currentLessonIndex > 0;
    const hasNext = currentLessonIndex < allLessons.length - 1;
    const previousLesson = hasPrevious ? allLessons[currentLessonIndex - 1] : null;
    const nextLesson = hasNext ? allLessons[currentLessonIndex + 1] : null;
    const isNextLessonLocked = nextLesson ? isLessonLocked(nextLesson.id) : false;

    // Effects
    useEffect(() => {
        // If no lessonId in URL, redirect to first unlocked lesson
        if (!lessonId && allLessons.length > 0 && !courseLoading && !enrollmentLoading) {
            let firstUnlocked = allLessons[0];
            for (let i = 0; i < allLessons.length; i++) {
                if (!completedLessonIds.includes(allLessons[i].id)) {
                    if (!isLessonLocked(allLessons[i].id)) {
                        firstUnlocked = allLessons[i];
                        break;
                    }
                }
            }
            navigate(`/learn/${courseId}/${firstUnlocked.id}`, { replace: true });
        }
    }, [lessonId, allLessons, courseId, completedLessonIds, courseLoading, enrollmentLoading, navigate]);

    useEffect(() => {
        // Start lesson (create progress) when accessing
        if (lessonId && enrollment?.id && currentLesson) {
            // Check if progress exists locally first to avoid spamming
            const hasProgress = progressList.some(p => (p.lesson?.id || p.lesson) === lessonId);
            if (!hasProgress) {
                startLessonMutation.mutate({
                    enrollmentId: enrollment.id,
                    lessonId: lessonId,
                });
            }
        }
    }, [lessonId, enrollment, progressList, currentLesson]); // Removed startLessonMutation from deps to avoid loop

    // Handlers
    const handleLessonClick = lesson => {
        if (isLessonLocked(lesson.id)) {
            message.warning('Vui lòng hoàn thành bài học trước để mở khóa!');
            return;
        }
        navigate(`/learn/${courseId}/${lesson.id}`);
        setMobileSidebarVisible(false);
        setActiveTab('overview');
    };

    const handleMarkComplete = async () => {
        if (!currentLesson || !enrollment) return;

        try {
            await completeLessonMutation.mutateAsync({
                enrollmentId: enrollment.id,
                lessonId: currentLesson.id,
            });

            if (hasNext && !isNextLessonLocked) {
                // Auto advance after short delay
                setTimeout(() => {
                    handleLessonClick(nextLesson);
                }, 1500);
            }
        } catch {
            // Error handled by global handler
        }
    };

    const handleSaveNote = async () => {
        if (!currentNote.trim()) return;
        try {
            await createNoteMutation.mutateAsync({
                lesson_id: lessonId,
                content: currentNote,
                // video_timestamp: currentVideoTime // Todo: Get from video player
            });
            setCurrentNote('');
        } catch {
            // Error handled
        }
    };

    const handleDeleteNote = async id => {
        try {
            await deleteNoteMutation.mutateAsync(id);
        } catch {
            // Error handled
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        try {
            await createCommentMutation.mutateAsync({
                lesson_id: lessonId,
                content: newComment,
            });
            setNewComment('');
        } catch {
            // Error handled
        }
    };

    // Render Helpers
    const getLessonIcon = type => {
        const config = LESSON_TYPE_MAP[type];
        const iconMap = {
            video: <PlayCircleOutlined style={{ color: config?.color }} />,
            article: <FileTextOutlined style={{ color: config?.color }} />,
            file: <FileOutlined style={{ color: config?.color }} />,
            quiz: <FormOutlined style={{ color: config?.color }} />,
        };
        return iconMap[type] || <FileOutlined />;
    };

    // Loading State
    if (courseLoading || enrollmentLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang tải khóa học..." />
            </div>
        );
    }

    if (!course || !enrollment) {
        return (
            <Result
                status="404"
                title="Không tìm thấy khóa học"
                subTitle="Khóa học không tồn tại hoặc bạn chưa đăng ký."
                extra={
                    <Button type="primary" onClick={() => navigate('/my-courses')}>
                        Quay lại
                    </Button>
                }
            />
        );
    }

    const renderSidebarContent = () => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                <Button
                    type="text"
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/my-courses')}
                    style={{ marginBottom: 8 }}
                >
                    Quay lại
                </Button>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }} ellipsis={{ tooltip: course.title }}>
                    {course.title}
                </Title>
                <Progress percent={overallProgress} size="small" strokeColor="#52c41a" />
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {completedLessonIds.length}/{allLessons.length} bài học hoàn thành
                </Text>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
                <Collapse defaultActiveKey={modules.map(m => m.id)} ghost expandIconPosition="end">
                    {modules.map((module, index) => (
                        <Collapse.Panel
                            key={module.id}
                            header={
                                <Space style={{ width: '100%', overflow: 'hidden' }}>
                                    <Badge count={index + 1} style={{ backgroundColor: '#ea4544', flexShrink: 0 }} />
                                    <Text strong ellipsis>
                                        {module.title}
                                    </Text>
                                </Space>
                            }
                        >
                            <Menu
                                mode="inline"
                                selectedKeys={currentLesson ? [currentLesson.id] : []}
                                style={{ border: 'none' }}
                            >
                                {module.lessons?.map(lesson => {
                                    const isCompleted = completedLessonIds.includes(lesson.id);
                                    const isCurrent = currentLesson?.id === lesson.id;
                                    const isLocked = isLessonLocked(lesson.id);

                                    return (
                                        <Menu.Item
                                            key={lesson.id}
                                            icon={
                                                isLocked ? (
                                                    <LockOutlined />
                                                ) : isCompleted ? (
                                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                ) : (
                                                    getLessonIcon(lesson.type)
                                                )
                                            }
                                            onClick={() => handleLessonClick(lesson)}
                                            disabled={isLocked}
                                            style={{
                                                height: 'auto',
                                                whiteSpace: 'normal',
                                                lineHeight: 1.5,
                                                padding: '8px 16px',
                                                background: isCurrent ? '#fff1f0' : undefined,
                                                borderRight: isCurrent ? '3px solid #ea4544' : undefined,
                                            }}
                                        >
                                            <div>
                                                <Text style={{ color: isLocked ? '#999' : undefined }}>
                                                    {lesson.title}
                                                </Text>
                                                {lesson.duration_minutes && (
                                                    <div style={{ fontSize: 11, color: '#999' }}>
                                                        <ClockCircleOutlined /> {lesson.duration_minutes} phút
                                                    </div>
                                                )}
                                            </div>
                                        </Menu.Item>
                                    );
                                })}
                            </Menu>
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </div>
        </div>
    );

    const renderLessonContent = () => {
        if (!currentLesson) return <Empty description="Chọn bài học để bắt đầu" />;

        const isCompleted = completedLessonIds.includes(currentLesson.id);

        return (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <Space>
                        <Tag color={LESSON_TYPE_MAP[currentLesson.type]?.color}>
                            {LESSON_TYPE_MAP[currentLesson.type]?.label}
                        </Tag>
                        {isCompleted && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                                Đã hoàn thành
                            </Tag>
                        )}
                    </Space>
                    <Title level={3} style={{ marginTop: 8 }}>
                        {currentLesson.title}
                    </Title>
                </div>

                <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 24, overflow: 'hidden' }}>
                    {currentLesson.type === 'video' && currentLesson.video_url ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                                title={currentLesson.title}
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    ) : currentLesson.type === 'article' ? (
                        <div style={{ padding: 24 }}>
                            <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                        </div>
                    ) : (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            {getLessonIcon(currentLesson.type)}
                            <Title level={4} style={{ marginTop: 16 }}>
                                Nội dung bài học
                            </Title>
                            <Text type="secondary">Nội dung này chưa được hỗ trợ hiển thị trực tiếp.</Text>
                        </div>
                    )}
                </Card>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                        background: '#fff',
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        disabled={!hasPrevious}
                        onClick={() => handleLessonClick(previousLesson)}
                    >
                        Bài trước
                    </Button>
                    <Button
                        type={isCompleted ? 'default' : 'primary'}
                        size="large"
                        icon={isCompleted ? <CheckCircleOutlined /> : <CheckOutlined />}
                        onClick={handleMarkComplete}
                        loading={completeLessonMutation.isPending}
                        style={{ minWidth: 200 }}
                    >
                        {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </Button>
                    <Tooltip title={isNextLessonLocked ? 'Bị khóa' : ''}>
                        <Button
                            type="primary"
                            ghost
                            size="large"
                            disabled={!hasNext || isNextLessonLocked}
                            onClick={() => handleLessonClick(nextLesson)}
                        >
                            Bài tiếp theo <ArrowRightOutlined />
                        </Button>
                    </Tooltip>
                </div>

                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'overview',
                                label: 'Tổng quan',
                                children: (
                                    <div>
                                        <Title level={5}>Mô tả</Title>
                                        <Paragraph>{currentLesson.description || 'Không có mô tả.'}</Paragraph>
                                    </div>
                                ),
                            },
                            {
                                key: 'notes',
                                label: `Ghi chú (${notes.length})`,
                                children: (
                                    <div>
                                        <div style={{ marginBottom: 16 }}>
                                            <TextArea
                                                rows={3}
                                                placeholder="Thêm ghi chú..."
                                                value={currentNote}
                                                onChange={e => setCurrentNote(e.target.value)}
                                            />
                                            <Button
                                                type="primary"
                                                onClick={handleSaveNote}
                                                style={{ marginTop: 8 }}
                                                loading={createNoteMutation.isPending}
                                            >
                                                Lưu ghi chú
                                            </Button>
                                        </div>
                                        <List
                                            dataSource={notes}
                                            renderItem={item => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteNote(item.id)}
                                                        />,
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        title={
                                                            <Text type="secondary">
                                                                {new Date(item.date_created).toLocaleString()}
                                                            </Text>
                                                        }
                                                        description={item.content}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: 'qa',
                                label: `Hỏi đáp (${comments.length})`,
                                children: (
                                    <div>
                                        <div style={{ marginBottom: 16 }}>
                                            <TextArea
                                                rows={3}
                                                placeholder="Đặt câu hỏi..."
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                            />
                                            <Button
                                                type="primary"
                                                onClick={handleSubmitComment}
                                                style={{ marginTop: 8 }}
                                                loading={createCommentMutation.isPending}
                                            >
                                                Gửi
                                            </Button>
                                        </div>
                                        <List
                                            dataSource={comments}
                                            renderItem={item => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar src={getAssetUrl(item.user_created?.avatar)}>
                                                                {item.user_created?.first_name?.[0]}
                                                            </Avatar>
                                                        }
                                                        title={
                                                            <Space>
                                                                <Text strong>
                                                                    {item.user_created?.first_name}{' '}
                                                                    {item.user_created?.last_name}
                                                                </Text>
                                                                <Text type="secondary">
                                                                    {new Date(item.date_created).toLocaleDateString()}
                                                                </Text>
                                                            </Space>
                                                        }
                                                        description={item.content}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Card>
            </div>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                width={320}
                collapsible
                collapsed={sidebarCollapsed}
                onCollapse={setSidebarCollapsed}
                breakpoint="lg"
                theme="light"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                }}
                className="desktop-sidebar"
            >
                {renderSidebarContent()}
            </Sider>

            <Drawer
                placement="left"
                onClose={() => setMobileSidebarVisible(false)}
                open={mobileSidebarVisible}
                width={300}
                className="mobile-sidebar"
                bodyStyle={{ padding: 0 }}
            >
                {renderSidebarContent()}
            </Drawer>

            <Layout style={{ marginLeft: sidebarCollapsed ? 0 : 320, transition: 'all 0.2s' }}>
                <div
                    style={{
                        padding: '16px 24px',
                        background: '#fff',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => {
                                if (window.innerWidth < 992) setMobileSidebarVisible(true);
                                else setSidebarCollapsed(!sidebarCollapsed);
                            }}
                        />
                        <Text strong>
                            {currentLessonIndex + 1}. {currentLesson?.title}
                        </Text>
                    </Space>
                    <Space>
                        <Button onClick={() => navigate('/my-courses')}>Thoát</Button>
                    </Space>
                </div>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>{renderLessonContent()}</Content>
            </Layout>
            <style>{`
                @media (max-width: 992px) {
                    .desktop-sidebar { display: none !important; }
                    .ant-layout { margin-left: 0 !important; }
                }
                @media (min-width: 993px) {
                    .mobile-sidebar { display: none !important; }
                }
            `}</style>
        </Layout>
    );
}

export default CourseLearningPage;
