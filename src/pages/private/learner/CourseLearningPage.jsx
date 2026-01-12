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
    Form,
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
} from '@ant-design/icons';
import { mockCourses, mockDiscussions, getModulesWithLessons } from '../../../mocks';
import { LESSON_TYPE_MAP } from '../../../constants/lms';

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
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState(['l1', 'l2']); // Mock completed (first 2 lessons)
    const [currentLesson, setCurrentLesson] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Notes state
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState('');

    // Discussion state
    const [discussions, setDiscussions] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Get course data
    const course = useMemo(() => {
        return mockCourses.find(c => c.id === courseId);
    }, [courseId]);

    // Get modules for this course (with lessons nested)
    const modules = useMemo(() => {
        return getModulesWithLessons(courseId);
    }, [courseId]);

    // Flatten all lessons
    const allLessons = useMemo(() => {
        const lessons = [];
        modules.forEach(module => {
            module.lessons?.forEach(lesson => {
                lessons.push({
                    ...lesson,
                    moduleId: module.id,
                    moduleTitle: module.title,
                });
            });
        });
        return lessons;
    }, [modules]);

    // Calculate progress
    const progress = useMemo(() => {
        if (allLessons.length === 0) return 0;
        return Math.round((completedLessons.length / allLessons.length) * 100);
    }, [allLessons, completedLessons]);

    // Get current lesson index
    const currentLessonIndex = useMemo(() => {
        if (!currentLesson) return -1;
        return allLessons.findIndex(l => l.id === currentLesson.id);
    }, [currentLesson, allLessons]);

    // Navigation helpers
    const hasPrevious = currentLessonIndex > 0;
    const hasNext = currentLessonIndex < allLessons.length - 1;
    const previousLesson = hasPrevious ? allLessons[currentLessonIndex - 1] : null;
    const nextLesson = hasNext ? allLessons[currentLessonIndex + 1] : null;

    // Check if a lesson is locked (must complete previous lessons first)
    const isLessonLocked = lessonId => {
        const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
        if (lessonIndex <= 0) return false; // First lesson is never locked

        // Check if all previous lessons are completed
        for (let i = 0; i < lessonIndex; i++) {
            if (!completedLessons.includes(allLessons[i].id)) {
                return true; // Previous lesson not completed, so this one is locked
            }
        }
        return false;
    };

    // Get the first unlocked incomplete lesson
    const getFirstUnlockedLesson = () => {
        for (let i = 0; i < allLessons.length; i++) {
            if (!completedLessons.includes(allLessons[i].id)) {
                return allLessons[i];
            }
        }
        return allLessons[0];
    };

    // Load current lesson & discussions
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (lessonId) {
                const lesson = allLessons.find(l => l.id === lessonId);
                // If lesson is locked, redirect to first unlocked lesson
                if (lesson && isLessonLocked(lesson.id)) {
                    const unlockedLesson = getFirstUnlockedLesson();
                    setCurrentLesson(unlockedLesson);
                    message.warning('Bài học này đang bị khóa. Vui lòng hoàn thành các bài trước!');
                } else {
                    setCurrentLesson(lesson || allLessons[0]);
                }
            } else {
                // Find first unlocked incomplete lesson
                const firstUnlocked = getFirstUnlockedLesson();
                setCurrentLesson(firstUnlocked || allLessons[0]);
            }

            // Load mock discussions (randomly pick from mock for demo)
            setDiscussions(mockDiscussions);

            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [lessonId, allLessons, completedLessons]);

    // Handle lesson click
    const handleLessonClick = lesson => {
        // Check if lesson is locked
        if (isLessonLocked(lesson.id)) {
            message.warning('Vui lòng hoàn thành các bài học trước để mở khóa bài này!');
            return;
        }

        setCurrentLesson(lesson);
        navigate(`/learn/${courseId}/${lesson.id}`, { replace: true });
        setMobileSidebarVisible(false);
        setActiveTab('overview'); // Reset tab
    };

    // Handle mark complete
    const handleMarkComplete = () => {
        if (!currentLesson) return;

        if (completedLessons.includes(currentLesson.id)) {
            setCompletedLessons(prev => prev.filter(id => id !== currentLesson.id));
            message.info('Đã bỏ đánh dấu hoàn thành');
        } else {
            setCompletedLessons(prev => [...prev, currentLesson.id]);
            message.success('Đã đánh dấu hoàn thành!');

            if (hasNext) {
                setTimeout(() => {
                    handleLessonClick(nextLesson);
                }, 1000);
            }
        }
    };

    // Handle navigation
    const handlePrevious = () => {
        if (previousLesson && !isLessonLocked(previousLesson.id)) {
            handleLessonClick(previousLesson);
        }
    };

    const handleNext = () => {
        if (nextLesson && !isLessonLocked(nextLesson.id)) {
            handleLessonClick(nextLesson);
        } else if (nextLesson && isLessonLocked(nextLesson.id)) {
            message.warning('Vui lòng hoàn thành bài học hiện tại trước!');
        }
    };

    // Note handlers
    const handleSaveNote = () => {
        if (!currentNote.trim()) return;
        const newNote = {
            id: Date.now(),
            content: currentNote,
            timestamp: new Date().toISOString(),
            lessonId: currentLesson.id,
            timeInVideo: '05:30', // Mock timestamp
        };
        setNotes([newNote, ...notes]);
        setCurrentNote('');
        message.success('Đã lưu ghi chú');
    };

    const handleDeleteNote = id => {
        setNotes(notes.filter(n => n.id !== id));
        message.success('Đã xóa ghi chú');
    };

    // Discussion handlers
    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now(),
            user_id: 'u1',
            user_name: 'Tôi (User)',
            user_avatar: null,
            content: newComment,
            date: new Date().toISOString(),
            likes: 0,
            replies: [],
        };
        setDiscussions([comment, ...discussions]);
        setNewComment('');
        message.success('Đã gửi câu hỏi');
    };

    // Get lesson icon
    const getLessonIcon = type => {
        const iconMap = {
            video: <PlayCircleOutlined style={{ color: '#1890ff' }} />,
            article: <FileTextOutlined style={{ color: '#52c41a' }} />,
            file: <FileOutlined style={{ color: '#faad14' }} />,
            link: <LinkOutlined style={{ color: '#722ed1' }} />,
            quiz: <FormOutlined style={{ color: '#eb2f96' }} />,
        };
        return iconMap[type] || <FileOutlined />;
    };

    // Render sidebar content
    const renderSidebarContent = () => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Course header */}
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                <Button
                    type="text"
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/my-courses')}
                    style={{ marginBottom: 8 }}
                >
                    Quay lại
                </Button>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    {course?.title}
                </Title>
                <Progress percent={progress} size="small" strokeColor="#52c41a" format={p => `${p}%`} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {completedLessons.length}/{allLessons.length} bài học hoàn thành
                </Text>
            </div>

            {/* Modules & Lessons */}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
                <Collapse
                    defaultActiveKey={modules.map(m => m.id)}
                    ghost
                    expandIconPosition="end"
                    style={{ width: '100%' }}
                >
                    {modules.map((module, moduleIndex) => (
                        <Collapse.Panel
                            key={module.id}
                            header={
                                <Space style={{ width: '100%', overflow: 'hidden' }}>
                                    <Badge
                                        count={moduleIndex + 1}
                                        style={{ backgroundColor: '#ea4544', flexShrink: 0 }}
                                    />
                                    <Text
                                        strong
                                        style={{
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'normal',
                                        }}
                                        ellipsis={{ tooltip: module.title }}
                                    >
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
                                    const isCompleted = completedLessons.includes(lesson.id);
                                    const isCurrent = currentLesson?.id === lesson.id;
                                    const isLocked = isLessonLocked(lesson.id);

                                    return (
                                        <Tooltip
                                            key={lesson.id}
                                            title={isLocked ? 'Hoàn thành bài trước để mở khóa' : ''}
                                            placement="right"
                                        >
                                            <Menu.Item
                                                key={lesson.id}
                                                icon={
                                                    isLocked ? (
                                                        <LockOutlined style={{ color: '#999' }} />
                                                    ) : isCompleted ? (
                                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                    ) : (
                                                        getLessonIcon(lesson.type)
                                                    )
                                                }
                                                onClick={() => handleLessonClick(lesson)}
                                                disabled={isLocked}
                                                style={{
                                                    background: isCurrent
                                                        ? '#fff1f0'
                                                        : isLocked
                                                          ? '#fafafa'
                                                          : undefined,
                                                    borderRight: isCurrent ? '3px solid #ea4544' : undefined,
                                                    padding: '8px 16px',
                                                    margin: '4px 0',
                                                    height: 'auto',
                                                    minHeight: 'auto',
                                                    lineHeight: '1.5',
                                                    whiteSpace: 'normal',
                                                    opacity: isLocked ? 0.6 : 1,
                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4,
                                                        width: '100%',
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            textDecoration: isCompleted ? 'none' : 'none',
                                                            color: isLocked
                                                                ? '#999'
                                                                : isCompleted
                                                                  ? '#52c41a'
                                                                  : undefined,
                                                            display: 'block',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word',
                                                            whiteSpace: 'normal',
                                                            lineHeight: '1.4',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        {lesson.title}
                                                        {isLocked && (
                                                            <Tag
                                                                color="default"
                                                                style={{ marginLeft: 8, fontSize: 10 }}
                                                            >
                                                                Đang khóa
                                                            </Tag>
                                                        )}
                                                    </Text>
                                                    {lesson.duration && (
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize: 11,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                whiteSpace: 'nowrap',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <ClockCircleOutlined /> {lesson.duration} phút
                                                        </Text>
                                                    )}
                                                </div>
                                            </Menu.Item>
                                        </Tooltip>
                                    );
                                })}
                            </Menu>
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </div>
        </div>
    );

    // Tab Contents
    const items = [
        {
            key: 'overview',
            label: 'Tổng quan',
            icon: <FileTextOutlined />,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <Title level={4}>Giới thiệu bài học</Title>
                    <Paragraph>
                        {currentLesson?.description ||
                            'Chào mừng bạn đến với bài học này. Hãy tập trung theo dõi nội dung và ghi chép lại những ý chính quan trọng.'}
                    </Paragraph>
                    {currentLesson?.learning_objectives && (
                        <>
                            <Title level={5}>Mục tiêu bài học</Title>
                            <ul>
                                {currentLesson.learning_objectives.split('\n').map((line, i) => (
                                    <li key={i}>{line.replace('-', '').trim()}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ),
        },
        {
            key: 'qa',
            label: 'Hỏi đáp',
            icon: <MessageOutlined />,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Avatar icon={<UserOutlined />} />
                            <div style={{ flex: 1 }}>
                                <TextArea
                                    rows={3}
                                    placeholder="Bạn có thắc mắc gì về bài học này?"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                />
                                <Button type="primary" onClick={handleSubmitComment} icon={<SendOutlined />}>
                                    Gửi câu hỏi
                                </Button>
                            </div>
                        </div>
                    </div>

                    <List
                        itemLayout="horizontal"
                        dataSource={discussions}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Space key="list-op">
                                        <LikeOutlined /> {item.likes}
                                    </Space>,
                                    <span key="reply">Trả lời</span>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={item.user_avatar}>{item.user_name[0]}</Avatar>}
                                    title={
                                        <Space>
                                            <Text strong>{item.user_name}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(item.date).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Paragraph style={{ marginBottom: 8 }}>{item.content}</Paragraph>
                                            {item.replies?.length > 0 && (
                                                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                                                    {item.replies.map(reply => (
                                                        <div
                                                            key={reply.id}
                                                            style={{ display: 'flex', gap: 8, marginBottom: 8 }}
                                                        >
                                                            <Avatar size="small" src={reply.user_avatar}>
                                                                {reply.user_name[0]}
                                                            </Avatar>
                                                            <div>
                                                                <Space>
                                                                    <Text
                                                                        strong
                                                                        style={{
                                                                            color:
                                                                                reply.role === 'instructor'
                                                                                    ? '#ea4544'
                                                                                    : undefined,
                                                                        }}
                                                                    >
                                                                        {reply.user_name}
                                                                        {reply.role === 'instructor' && (
                                                                            <Tag color="red" style={{ marginLeft: 8 }}>
                                                                                Giảng viên
                                                                            </Tag>
                                                                        )}
                                                                    </Text>
                                                                </Space>
                                                                <div>{reply.content}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            ),
        },
        {
            key: 'notes',
            label: 'Ghi chú',
            icon: <EditOutlined />,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Thêm ghi chú mới</Title>
                        <TextArea
                            rows={4}
                            placeholder="Ghi lại những ý chính..."
                            value={currentNote}
                            onChange={e => setCurrentNote(e.target.value)}
                            style={{ marginBottom: 12 }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Tag color="blue" icon={<ClockCircleOutlined />}>
                                05:30
                            </Tag>
                            <Button type="primary" onClick={handleSaveNote}>
                                Lưu ghi chú
                            </Button>
                        </div>
                    </div>

                    <Divider />

                    <List
                        dataSource={notes}
                        locale={{ emptyText: 'Chưa có ghi chú nào cho bài học này' }}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="del"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteNote(item.id)}
                                    />,
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Tag color="blue">{item.timeInVideo}</Tag>
                                            <Text type="secondary">
                                                {new Date(item.timestamp).toLocaleTimeString()}
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
        {
            key: 'resources',
            label: 'Tài liệu',
            icon: <FileOutlined />,
            children: (
                <div style={{ padding: '24px 0' }}>
                    <List
                        dataSource={[
                            { id: 1, name: 'Slide bài giảng.pdf', size: '2.5 MB' },
                            { id: 2, name: 'Source code mẫu.zip', size: '15 MB' },
                        ]}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button key="download" type="link" icon={<DownloadOutlined />}>
                                        Tải xuống
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                    }
                                    title={item.name}
                                    description={item.size}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            ),
        },
    ];

    // Render lesson content based on type
    const renderLessonContent = () => {
        if (!currentLesson) {
            return (
                <Result
                    status="404"
                    title="Không tìm thấy bài học"
                    extra={
                        <Button type="primary" onClick={() => navigate('/my-courses')}>
                            Quay lại khóa học
                        </Button>
                    }
                />
            );
        }

        const isCompleted = completedLessons.includes(currentLesson.id);

        return (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Lesson header */}
                <div style={{ marginBottom: 24 }}>
                    <Space style={{ marginBottom: 8 }}>
                        <Tag color={LESSON_TYPE_MAP[currentLesson.type]?.color}>
                            {LESSON_TYPE_MAP[currentLesson.type]?.label}
                        </Tag>
                        {isCompleted && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                                Đã hoàn thành
                            </Tag>
                        )}
                        {currentLesson.duration && (
                            <Text type="secondary">
                                <ClockCircleOutlined /> {currentLesson.duration} phút
                            </Text>
                        )}
                    </Space>
                    <Title level={3}>{currentLesson.title}</Title>
                </div>

                {/* Main Content Area (Video/Article/Quiz) */}
                <Card style={{ marginBottom: 24, overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
                    {currentLesson.type === 'video' && (
                        <div
                            style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                background: '#000',
                            }}
                        >
                            {currentLesson.video_url ? (
                                <iframe
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                    src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                                    title={currentLesson.title}
                                    allowFullScreen
                                />
                            ) : (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: '#fff',
                                        textAlign: 'center',
                                    }}
                                >
                                    <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                                    <div>Video player</div>
                                    <Text type="secondary" style={{ color: '#999' }}>
                                        (Demo - Sẽ hiển thị video thực tế khi tích hợp)
                                    </Text>
                                </div>
                            )}
                        </div>
                    )}

                    {currentLesson.type === 'article' && (
                        <div style={{ padding: 24, minHeight: 300 }}>
                            <Paragraph>
                                {currentLesson.content || (
                                    <>
                                        <Title level={4}>Nội dung bài viết</Title>
                                        <Paragraph>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                                            consequat.
                                        </Paragraph>
                                    </>
                                )}
                            </Paragraph>
                        </div>
                    )}

                    {currentLesson.type === 'file' && (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <FileOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
                            <Title level={4}>Tài liệu đính kèm</Title>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                {currentLesson.file?.filename || 'document.pdf'}
                            </Text>
                            <Button type="primary" icon={<DownloadOutlined />}>
                                Tải xuống tài liệu
                            </Button>
                        </div>
                    )}

                    {currentLesson.type === 'link' && (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <LinkOutlined style={{ fontSize: 64, color: '#722ed1', marginBottom: 16 }} />
                            <Title level={4}>Liên kết bên ngoài</Title>
                            <Button
                                type="primary"
                                icon={<LinkOutlined />}
                                onClick={() => window.open(currentLesson.external_url || '#', '_blank')}
                            >
                                Mở liên kết
                            </Button>
                        </div>
                    )}

                    {currentLesson.type === 'quiz' && (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <FormOutlined style={{ fontSize: 64, color: '#eb2f96', marginBottom: 16 }} />
                            <Title level={4}>Bài kiểm tra</Title>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                Hoàn thành bài kiểm tra để tiếp tục
                            </Text>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate(`/quiz/${currentLesson.quiz_id || 'q1'}`)}
                            >
                                Bắt đầu làm bài
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Action & Navigation Bar */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                        background: '#fff',
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <Button size="large" icon={<ArrowLeftOutlined />} disabled={!hasPrevious} onClick={handlePrevious}>
                        Bài trước
                    </Button>

                    <Button
                        type={isCompleted ? 'default' : 'primary'}
                        size="large"
                        icon={isCompleted ? <CheckCircleOutlined /> : <CheckOutlined />}
                        onClick={handleMarkComplete}
                        className={isCompleted ? 'ant-btn-success' : ''}
                        style={{
                            background: isCompleted ? '#f6ffed' : undefined,
                            borderColor: isCompleted ? '#52c41a' : undefined,
                            color: isCompleted ? '#52c41a' : undefined,
                            minWidth: 200,
                        }}
                    >
                        {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </Button>

                    <Button
                        type="primary"
                        ghost
                        size="large"
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                        disabled={!hasNext}
                        onClick={handleNext}
                    >
                        Bài tiếp theo
                    </Button>
                </div>

                {/* Tabs Area */}
                <Card>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
                </Card>
            </div>
        );
    };

    if (!course) {
        return (
            <Result
                status="404"
                title="Không tìm thấy khóa học"
                extra={
                    <Button type="primary" onClick={() => navigate('/my-courses')}>
                        Quay lại khóa học của tôi
                    </Button>
                }
            />
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Desktop Sidebar */}
            <Sider
                width={320}
                collapsible
                collapsed={sidebarCollapsed}
                onCollapse={setSidebarCollapsed}
                collapsedWidth={0}
                trigger={null}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    zIndex: 100,
                    overflow: 'hidden',
                }}
                className="desktop-sidebar"
                breakpoint="lg"
                onBreakpoint={broken => {
                    setSidebarCollapsed(broken);
                }}
            >
                {renderSidebarContent()}
            </Sider>

            {/* Mobile Drawer */}
            <Drawer
                title="Nội dung khóa học"
                placement="left"
                onClose={() => setMobileSidebarVisible(false)}
                open={mobileSidebarVisible}
                bodyStyle={{ padding: 0 }}
                width={320}
                className="mobile-sidebar"
            >
                {renderSidebarContent()}
            </Drawer>

            {/* Main Content */}
            <Layout
                style={{
                    marginLeft: sidebarCollapsed ? 0 : 320,
                    transition: 'margin-left 0.2s',
                    minHeight: '100vh',
                }}
            >
                {/* Top bar */}
                <div
                    style={{
                        background: '#fff',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f0f0f0',
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
                                if (window.innerWidth <= 992) {
                                    setMobileSidebarVisible(true);
                                } else {
                                    setSidebarCollapsed(!sidebarCollapsed);
                                }
                            }}
                        />
                        <Text strong>
                            {currentLessonIndex + 1}. {currentLesson?.title}
                        </Text>
                    </Space>
                    <Progress percent={progress} size="small" style={{ width: 150, margin: 0 }} strokeColor="#52c41a" />
                </div>

                {/* Content */}
                <Content style={{ padding: 24 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 100 }}>
                            <Spin size="large" tip="Đang tải bài học..." />
                        </div>
                    ) : (
                        renderLessonContent()
                    )}
                </Content>
            </Layout>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 992px) {
                    .desktop-sidebar {
                        display: none !important;
                    }
                }
                @media (min-width: 993px) {
                    .mobile-sidebar {
                        display: none !important;
                    }
                }
                
                /* Fix Menu.Item overflow issues */
                .ant-menu-inline .ant-menu-item {
                    white-space: normal !important;
                    height: auto !important;
                    min-height: 40px !important;
                    line-height: 1.5 !important;
                    padding: 8px 16px !important;
                    overflow: visible !important;
                    margin: 4px 0 !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                
                .ant-menu-inline .ant-menu-item > .ant-menu-title-content {
                    width: 100% !important;
                    overflow: visible !important;
                    display: block !important;
                    min-width: 0 !important;
                }
                
                .ant-menu-inline .ant-menu-item-selected {
                    background-color: #fff1f0 !important;
                }
                
                .ant-menu-inline .ant-menu-item-selected::after {
                    display: none !important;
                }
                
                /* Custom border for active lesson */
                .ant-menu-inline .ant-menu-item[style*="border-right"] {
                    border-right: 3px solid #ea4544 !important;
                    margin-right: 0 !important;
                }
                
                /* Ensure icon doesn't cause layout issues */
                .ant-menu-inline .ant-menu-item .anticon {
                    flex-shrink: 0 !important;
                    margin-right: 12px !important;
                }
                
                /* Fix Menu layout */
                .ant-menu-inline {
                    width: 100% !important;
                }
                
                /* Fix Collapse header overflow */
                .ant-collapse-header {
                    padding: 12px 16px !important;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }
                
                .ant-collapse-content-box {
                    padding: 8px 0 !important;
                }
            `}</style>
        </Layout>
    );
}

export default CourseLearningPage;
