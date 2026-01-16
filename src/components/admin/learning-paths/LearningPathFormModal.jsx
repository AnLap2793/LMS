import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Switch, Row, Col, Divider, Typography, InputNumber, Card, Space } from 'antd';
import { NodeIndexOutlined, BookOutlined, ClockCircleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { mockCourses, mockPositions, mockDepartments } from '../../../mocks';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Learning Path Form Modal
 * Form để tạo mới hoặc chỉnh sửa lộ trình học tập
 */
function LearningPathFormModal({ open, onCancel, onSave, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    // Get available courses (published only)
    const availableCourses = useMemo(() => {
        return mockCourses.filter(c => c.status === 'published');
    }, []);

    // Watch selected courses to calculate total duration
    const selectedCourseIds = Form.useWatch('course_ids', form) || [];
    const isMandatory = Form.useWatch('is_mandatory', form);

    const totalDuration = useMemo(() => {
        return selectedCourseIds.reduce((total, courseId) => {
            const course = mockCourses.find(c => c.id === courseId);
            return total + (course?.duration || 0);
        }, 0);
    }, [selectedCourseIds]);

    // Format duration
    const formatDuration = minutes => {
        if (!minutes) return '0 phút';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
        }
        return `${mins} phút`;
    };

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    description: initialValues.description || '',
                    course_ids: initialValues.courses?.map(c => c.id) || [],
                    is_mandatory: initialValues.is_mandatory || false,
                    status: initialValues.status || 'draft',
                    sort: initialValues.sort || 0,
                    department_filter: initialValues.department_filter || [],
                    position_filter: initialValues.position_filter || [],
                    duration_days: initialValues.duration_days || null,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    // Handle submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Transform values
            const submitData = {
                ...values,
                courses: values.course_ids.map((id, index) => {
                    const course = mockCourses.find(c => c.id === id);
                    return {
                        id,
                        title: course?.title,
                        sort: index + 1,
                    };
                }),
                total_duration: totalDuration,
                department_filter: values.department_filter || [],
                position_filter: values.position_filter || [],
            };
            onSave(submitData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <NodeIndexOutlined style={{ color: '#ea4544' }} />
                    {isEdit ? 'Chỉnh sửa Lộ trình' : 'Tạo Lộ trình mới'}
                </Space>
            }
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isEdit ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            width="90%"
            style={{ maxWidth: 700 }}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'draft',
                    is_mandatory: false,
                    sort: 0,
                    duration_days: null,
                }}
            >
                <Divider orientation="left" plain>
                    Thông tin cơ bản
                </Divider>

                <Form.Item
                    name="title"
                    label="Tên lộ trình"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên lộ trình' },
                        { min: 5, message: 'Tên phải có ít nhất 5 ký tự' },
                        { max: 200, message: 'Tên tối đa 200 ký tự' },
                    ]}
                >
                    <Input placeholder="VD: Lộ trình Onboarding cho Nhân viên mới" size="large" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả" rules={[{ max: 1000, message: 'Mô tả tối đa 1000 ký tự' }]}>
                    <TextArea placeholder="Mô tả ngắn gọn về lộ trình học tập..." rows={3} showCount maxLength={1000} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="status" label="Trạng thái">
                            <Select
                                options={[
                                    { value: 'draft', label: 'Nháp' },
                                    { value: 'published', label: 'Đã xuất bản' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="sort" label="Thứ tự hiển thị">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="is_mandatory" label="Bắt buộc" valuePropName="checked">
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="duration_days"
                            label="Thời hạn hoàn thành (ngày)"
                            extra="Số ngày học viên có để hoàn thành lộ trình kể từ khi được gán."
                        >
                            <InputNumber
                                min={1}
                                placeholder={isMandatory ? 'Nhập số ngày' : 'Không áp dụng'}
                                style={{ width: '100%' }}
                                disabled={!isMandatory}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" plain>
                    <Space>
                        <TeamOutlined />
                        Đối tượng áp dụng
                    </Space>
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="department_filter"
                            label="Phòng ban"
                            extra="Để trống = áp dụng tất cả phòng ban"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn phòng ban..."
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={mockDepartments.map(dept => ({
                                    value: dept.code,
                                    label: (
                                        <Space>
                                            <TeamOutlined />
                                            <span>{dept.name}</span>
                                        </Space>
                                    ),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="position_filter"
                            label="Vị trí / Chức danh"
                            extra="Để trống = áp dụng tất cả vị trí"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn vị trí..."
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={mockPositions.map(pos => ({
                                    value: pos.code,
                                    label: (
                                        <Space>
                                            <UserOutlined />
                                            <span>{pos.name}</span>
                                        </Space>
                                    ),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" plain>
                    Khóa học trong lộ trình
                </Divider>

                <Form.Item
                    name="course_ids"
                    label="Chọn khóa học"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một khóa học' }]}
                    extra={
                        <Text type="secondary">
                            Kéo thả để sắp xếp thứ tự khóa học. Học viên sẽ học theo thứ tự này.
                        </Text>
                    }
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn các khóa học"
                        showSearch
                        optionFilterProp="label"
                        options={availableCourses.map(c => ({
                            value: c.id,
                            label: (
                                <Space>
                                    <BookOutlined />
                                    <span>{c.title}</span>
                                    <Text type="secondary">({formatDuration(c.duration)})</Text>
                                </Space>
                            ),
                        }))}
                        optionRender={option => (
                            <Space>
                                <BookOutlined style={{ color: '#1890ff' }} />
                                <span>{mockCourses.find(c => c.id === option.value)?.title}</span>
                                <Text type="secondary">
                                    ({formatDuration(mockCourses.find(c => c.id === option.value)?.duration)})
                                </Text>
                            </Space>
                        )}
                    />
                </Form.Item>

                {/* Summary Card */}
                {selectedCourseIds.length > 0 && (
                    <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Space>
                                    <BookOutlined style={{ color: '#52c41a' }} />
                                    <Text>Số khóa học:</Text>
                                    <Text strong>{selectedCourseIds.length}</Text>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <Text>Tổng thời lượng:</Text>
                                    <Text strong>{formatDuration(totalDuration)}</Text>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Form>
        </Modal>
    );
}

LearningPathFormModal.propTypes = {
    open: PropTypes.bool,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    initialValues: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        courses: PropTypes.array,
        is_mandatory: PropTypes.bool,
        status: PropTypes.string,
        sort: PropTypes.number,
        department_filter: PropTypes.array,
        position_filter: PropTypes.array,
        duration_days: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

export default LearningPathFormModal;
