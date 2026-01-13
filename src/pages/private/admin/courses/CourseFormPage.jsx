import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Button,
    Card,
    Row,
    Col,
    Upload,
    Space,
    Tabs,
    message,
    Divider,
    Result,
    Spin,
} from 'antd';
import { PlusOutlined, SaveOutlined, ArrowLeftOutlined, InboxOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { PageHeader, LexicalEditor } from '../../../../components/common';
import { mockTags, mockCourses } from '../../../../mocks';
import { COURSE_STATUS_OPTIONS, COURSE_DIFFICULTY_OPTIONS } from '../../../../constants/lms';

const { Dragger } = Upload;

/**
 * Course Form Page
 * Tạo mới hoặc chỉnh sửa khóa học
 */
function CourseFormPage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [autoCalculateDuration, setAutoCalculateDuration] = useState(true);
    const [courseData, setCourseData] = useState(null);

    // State for Lexical editors (since Lexical doesn't work directly with Form.Item)
    const [description, setDescription] = useState('');
    const [learningObjectives, setLearningObjectives] = useState('');

    // Load course data if editing
    useEffect(() => {
        if (isEdit && id) {
            setFetching(true);
            // Simulate API call
            setTimeout(() => {
                const foundCourse = mockCourses.find(c => c.id === id);
                if (foundCourse) {
                    setCourseData(foundCourse);
                    // Transform tags to array of IDs
                    const tagIds = foundCourse.tags?.map(t => t.id) || [];

                    form.setFieldsValue({
                        ...foundCourse,
                        tags: tagIds,
                    });

                    // Set Lexical editor values
                    setDescription(foundCourse.description || '');
                    setLearningObjectives(foundCourse.learning_objectives || '');

                    // Check if duration is auto calculated (mock logic)
                    // In real app, this might be a flag from DB
                    if (foundCourse.duration && foundCourse.duration > 0) {
                        setAutoCalculateDuration(false);
                    }
                } else {
                    message.error('Không tìm thấy khóa học');
                }
                setFetching(false);
            }, 500);
        }
    }, [isEdit, id, form]);

    // Handle form submit
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            // Add Lexical editor values
            values.description = description;
            values.learning_objectives = learningObjectives;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // TODO: Replace with actual API call
            message.success(isEdit ? 'Đã cập nhật khóa học' : 'Đã tạo khóa học mới');
            navigate('/admin/courses');
        } catch {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Handle save draft
    const handleSaveDraft = async () => {
        try {
            const values = await form.validateFields();
            values.status = 'draft';
            values.description = description;
            values.learning_objectives = learningObjectives;
            // In real app, we would call API here directly
            // For now, we reuse handleSubmit which simulates API
            setLoading(true);
            setTimeout(() => {
                message.success('Đã lưu bản nháp');
                navigate('/admin/courses');
                setLoading(false);
            }, 1000);
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    // Handle publish
    const handlePublish = async () => {
        try {
            const values = await form.validateFields();
            values.status = 'published';
            values.description = description;
            values.learning_objectives = learningObjectives;
            // In real app, we would call API here directly
            setLoading(true);
            setTimeout(() => {
                message.success(isEdit ? 'Đã cập nhật và xuất bản' : 'Đã tạo và xuất bản');
                navigate('/admin/courses');
                setLoading(false);
            }, 1000);
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    // Upload props
    const uploadProps = {
        name: 'thumbnail',
        multiple: false,
        accept: 'image/*',
        maxCount: 1,
        listType: 'picture-card',
        beforeUpload: file => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
            }
            // Prevent actual upload, just store locally
            return false;
        },
        onChange: () => {
            // TODO: Handle file change when connecting to Directus
        },
    };

    // Tab items
    const tabItems = [
        {
            key: 'basic',
            label: 'Thông tin cơ bản',
            children: (
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        {/* Title */}
                        <Form.Item
                            name="title"
                            label="Tên khóa học"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên khóa học' },
                                { min: 5, message: 'Tên phải có ít nhất 5 ký tự' },
                                { max: 200, message: 'Tên tối đa 200 ký tự' },
                            ]}
                        >
                            <Input placeholder="VD: Onboarding cho Nhân viên mới" size="large" />
                        </Form.Item>

                        {/* Description - Using LexicalEditor */}
                        <Form.Item label="Mô tả khóa học" help="Sử dụng toolbar để định dạng văn bản">
                            <LexicalEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="Mô tả ngắn gọn về khóa học..."
                                size="default"
                            />
                        </Form.Item>

                        {/* Learning Objectives - Using LexicalEditor */}
                        <Form.Item
                            label="Mục tiêu học tập"
                            help="Liệt kê những gì học viên sẽ đạt được sau khi hoàn thành khóa học"
                        >
                            <LexicalEditor
                                value={learningObjectives}
                                onChange={setLearningObjectives}
                                placeholder="- Hiểu về...&#10;- Biết cách...&#10;- Có thể..."
                                size="default"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        {/* Thumbnail */}
                        <Form.Item name="thumbnail" label="Ảnh đại diện">
                            <Dragger {...uploadProps} style={{ padding: 20 }}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click hoặc kéo thả ảnh</p>
                                <p className="ant-upload-hint">Hỗ trợ: JPG, PNG. Tối đa 5MB</p>
                            </Dragger>
                        </Form.Item>

                        {/* Tags */}
                        <Form.Item name="tags" label="Tags">
                            <Select
                                mode="multiple"
                                placeholder="Chọn tags"
                                options={mockTags.map(tag => ({
                                    value: tag.id,
                                    label: tag.name,
                                }))}
                            />
                        </Form.Item>

                        {/* Difficulty */}
                        <Form.Item name="difficulty" label="Độ khó">
                            <Select placeholder="Chọn độ khó" options={COURSE_DIFFICULTY_OPTIONS} allowClear />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'content',
            label: 'Nội dung',
            children: (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    {isEdit ? (
                        <Result
                            icon={<UnorderedListOutlined style={{ color: '#ea4544' }} />}
                            title="Quản lý nội dung khóa học"
                            subTitle="Chuyển đến trang quản lý Modules và Bài học để thêm nội dung chi tiết."
                            extra={
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate(`/admin/courses/${id}/content`)}
                                >
                                    Đi đến Quản lý Nội dung
                                </Button>
                            }
                        />
                    ) : (
                        <Result
                            status="info"
                            title="Vui lòng lưu khóa học trước"
                            subTitle="Bạn cần tạo khóa học trước khi có thể thêm nội dung (modules và bài học)."
                        />
                    )}
                </div>
            ),
        },
        {
            key: 'settings',
            label: 'Cài đặt',
            children: (
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        {/* Duration */}
                        <Form.Item label="Thời lượng">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    <Switch checked={autoCalculateDuration} onChange={setAutoCalculateDuration} />
                                    <span>Tự động tính từ tổng thời lượng bài học</span>
                                </Space>
                                {!autoCalculateDuration && (
                                    <Form.Item name="duration" noStyle>
                                        <InputNumber
                                            placeholder="Nhập thời lượng"
                                            min={0}
                                            addonAfter="phút"
                                            style={{ width: 200 }}
                                        />
                                    </Form.Item>
                                )}
                            </Space>
                        </Form.Item>

                        {/* Status */}
                        <Form.Item name="status" label="Trạng thái" initialValue="draft">
                            <Select options={COURSE_STATUS_OPTIONS} style={{ width: 200 }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        {/* Department Filter */}
                        <Form.Item
                            name="department_filter"
                            label="Phòng ban được xem"
                            extra="Để trống nếu cho phép tất cả phòng ban xem"
                        >
                            <Select mode="tags" placeholder="VD: it, sales, hr" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
    ];

    if (fetching) {
        return (
            <div style={{ padding: 50, textAlign: 'center' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                breadcrumbs={[
                    { title: 'Khóa học', path: '/admin/courses' },
                    { title: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
                ]}
                actions={
                    <Space>
                        {isEdit && (
                            <Button
                                icon={<UnorderedListOutlined />}
                                onClick={() => navigate(`/admin/courses/${id}/content`)}
                            >
                                Nội dung
                            </Button>
                        )}
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/courses')}>
                            Quay lại
                        </Button>
                    </Space>
                }
            />

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'draft',
                    difficulty: null,
                    tags: [],
                    department_filter: [],
                }}
                onFinish={handleSubmit}
            >
                <Card>
                    <Tabs items={tabItems} />

                    <Divider />

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button onClick={() => navigate('/admin/courses')}>Hủy</Button>
                        <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading}>
                            Lưu nháp
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handlePublish} loading={loading}>
                            {isEdit ? 'Cập nhật & Xuất bản' : 'Tạo & Xuất bản'}
                        </Button>
                    </div>
                </Card>
            </Form>
        </div>
    );
}

export default CourseFormPage;
