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
import { COURSE_STATUS_OPTIONS, COURSE_DIFFICULTY_OPTIONS } from '../../../../constants/lms';
import { useCourseDetail, useTags, useCreateCourse, useUpdateCourse } from '../../../../hooks/useCourses';
import { fileService } from '../../../../services/fileService';
import { getAssetUrl } from '../../../../services/directus';

const { Dragger } = Upload;

/**
 * Course Form Page
 * Tạo mới hoặc chỉnh sửa khóa học
 */
function CourseFormPage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [autoCalculateDuration, setAutoCalculateDuration] = useState(true);

    // File upload state
    const [fileList, setFileList] = useState([]);

    // State for Lexical editors (since Lexical doesn't work directly with Form.Item)
    const [description, setDescription] = useState('');
    const [learningObjectives, setLearningObjectives] = useState('');

    // Hooks
    const { data: courseData, isLoading: fetching } = useCourseDetail(id);
    const { data: tags = [] } = useTags();
    const createCourse = useCreateCourse();
    const updateCourse = useUpdateCourse();

    const [uploading, setUploading] = useState(false);
    const loading = createCourse.isPending || updateCourse.isPending || uploading;

    // Load course data if editing
    useEffect(() => {
        if (isEdit && courseData) {
            // Transform tags to array of IDs
            const tagIds = courseData.tags?.map(t => t.tags_id?.id || t.tags_id || t.id) || [];

            form.setFieldsValue({
                ...courseData,
                tags: tagIds,
                duration: courseData.duration_minutes || courseData.duration || 0,
            });

            // Set thumbnail preview
            if (courseData.thumbnail) {
                setFileList([
                    {
                        uid: '-1',
                        name: 'thumbnail.png',
                        status: 'done',
                        url: getAssetUrl(courseData.thumbnail),
                    },
                ]);
            }

            // Set Lexical editor values
            setDescription(courseData.description || '');
            setLearningObjectives(courseData.learning_objectives || '');

            // Check if duration is auto calculated
            if ((courseData.duration_minutes || courseData.duration) > 0) {
                setAutoCalculateDuration(false);
            }
        }
    }, [isEdit, courseData, form]);

    // Handle form submit
    const handleSubmit = async values => {
        setUploading(true);
        try {
            let thumbnailId = courseData?.thumbnail; // Default to existing thumbnail

            // Handle File Upload if changed
            const file = fileList[0];
            if (file && file.originFileObj) {
                // New file selected
                const uploadedFile = await fileService.upload(file.originFileObj);
                thumbnailId = uploadedFile.id;
            } else if (!file) {
                // File removed
                thumbnailId = null;
            }

            // Add Lexical editor values & thumbnail
            const submitData = {
                ...values,
                thumbnail: thumbnailId,
                description,
                learning_objectives: learningObjectives,
            };

            if (isEdit) {
                await updateCourse.mutateAsync({ id, data: submitData });
            } else {
                await createCourse.mutateAsync(submitData);
            }
            navigate('/admin/courses');
        } catch (error) {
            // Error handled by global handler
            console.error('Submit error:', error);
        } finally {
            setUploading(false);
        }
    };

    // Wrapper for Save Draft (status = draft)
    const handleSaveDraft = async () => {
        try {
            const values = await form.validateFields();
            values.status = 'draft';
            await handleSubmit(values);
        } catch {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
    };

    // Wrapper for Publish (status = published)
    const handlePublish = async () => {
        try {
            const values = await form.validateFields();
            values.status = 'published';
            await handleSubmit(values);
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
        fileList: fileList,
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
            return false; // Prevent auto upload
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        onPreview: async file => {
            let src = file.url;
            if (!src) {
                src = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve(reader.result);
                });
            }
            const image = new Image();
            image.src = src;
            const imgWindow = window.open(src);
            imgWindow?.document.write(image.outerHTML);
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
                                options={tags.map(tag => ({
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
