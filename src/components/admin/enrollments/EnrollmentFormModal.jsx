import { useEffect, useMemo } from 'react';
import { Modal, Form, Select, DatePicker, Row, Col, Divider, Alert, Typography } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { mockCourses, mockUsers, getUserFullName } from '../../../mocks';
import { ENROLLMENT_STATUS_OPTIONS } from '../../../constants/lms';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * Enrollment Form Modal
 * Form để gán khóa học cho nhân viên
 */
function EnrollmentFormModal({ open, onCancel, onSave, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    // Get available courses (published only)
    const availableCourses = useMemo(() => {
        return mockCourses.filter(c => c.status === 'published');
    }, []);

    // Get available users (active only)
    const availableUsers = useMemo(() => {
        return mockUsers.filter(u => u.status === 'active');
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    user_id: initialValues.user_id,
                    course_id: initialValues.course_id,
                    status: initialValues.status,
                    due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
                });
            } else {
                form.resetFields();
                // Set default due date to 30 days from now
                form.setFieldsValue({
                    due_date: dayjs().add(30, 'day'),
                });
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
                user_ids: isEdit ? [values.user_id] : values.user_ids,
            };
            onSave(submitData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Chỉnh sửa Đăng ký' : 'Gán Khóa học'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isEdit ? 'Cập nhật' : 'Gán khóa học'}
            cancelText="Hủy"
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'assigned',
                }}
            >
                {!isEdit && (
                    <Alert
                        message="Bạn có thể chọn nhiều nhân viên để gán cùng một khóa học"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Divider orientation="left" plain>
                    Thông tin đăng ký
                </Divider>

                {/* Course Selection */}
                <Form.Item
                    name="course_id"
                    label="Khóa học"
                    rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
                >
                    <Select
                        placeholder="Chọn khóa học"
                        showSearch
                        optionFilterProp="label"
                        disabled={isEdit}
                        options={availableCourses.map(c => ({
                            value: c.id,
                            label: c.title,
                        }))}
                        suffixIcon={<BookOutlined />}
                    />
                </Form.Item>

                {/* User Selection - Multiple for new, Single for edit */}
                {isEdit ? (
                    <Form.Item
                        name="user_id"
                        label="Học viên"
                        rules={[{ required: true, message: 'Vui lòng chọn học viên' }]}
                    >
                        <Select
                            placeholder="Chọn học viên"
                            showSearch
                            optionFilterProp="label"
                            disabled={isEdit}
                            options={availableUsers.map(u => ({
                                value: u.id,
                                label: `${getUserFullName(u)} - ${u.email}`,
                            }))}
                            suffixIcon={<UserOutlined />}
                        />
                    </Form.Item>
                ) : (
                    <Form.Item
                        name="user_ids"
                        label="Học viên"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một học viên' }]}
                        extra={
                            <Text type="secondary">Có thể chọn nhiều người. Gõ để tìm kiếm theo tên hoặc email.</Text>
                        }
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn học viên"
                            showSearch
                            optionFilterProp="label"
                            options={availableUsers.map(u => ({
                                value: u.id,
                                label: `${getUserFullName(u)} - ${u.email}`,
                            }))}
                            maxTagCount={3}
                            maxTagPlaceholder={omittedValues => `+${omittedValues.length} người khác`}
                        />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="due_date" label="Hạn hoàn thành" extra="Để trống nếu không giới hạn thời gian">
                            <DatePicker
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                                style={{ width: '100%' }}
                                disabledDate={current => current && current < dayjs().startOf('day')}
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {isEdit && (
                            <Form.Item name="status" label="Trạng thái">
                                <Select
                                    options={ENROLLMENT_STATUS_OPTIONS.map(s => ({
                                        value: s.value,
                                        label: s.label,
                                    }))}
                                />
                            </Form.Item>
                        )}
                    </Col>
                </Row>

                {isEdit && initialValues && (
                    <>
                        <Divider orientation="left" plain>
                            Thông tin bổ sung
                        </Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Tiến độ hiện tại: </Text>
                                <Text strong>{initialValues.progress_percentage || 0}%</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Ngày gán: </Text>
                                <Text strong>
                                    {initialValues.date_created
                                        ? new Date(initialValues.date_created).toLocaleDateString('vi-VN')
                                        : '-'}
                                </Text>
                            </Col>
                        </Row>
                        {initialValues.completed_at && (
                            <Row style={{ marginTop: 8 }}>
                                <Col span={12}>
                                    <Text type="secondary">Ngày hoàn thành: </Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {new Date(initialValues.completed_at).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Col>
                            </Row>
                        )}
                    </>
                )}
            </Form>
        </Modal>
    );
}

export default EnrollmentFormModal;
