import { useEffect, useMemo } from 'react';
import { Modal, Form, Select, DatePicker, Row, Col, Divider, Alert, Typography, Avatar, Space } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { ENROLLMENT_STATUS_OPTIONS } from '../../../constants/lms';
import { courseService } from '../../../services/courseService';
import { userService } from '../../../services/userService';
import { queryKeys } from '../../../constants/queryKeys';
import { getAvatarUrl, getAssetUrl, getUserFullName } from '../../../utils/directusHelpers';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * Enrollment Form Modal
 * Form để gán khóa học cho nhân viên
 */
function EnrollmentFormModal({ open, onCancel, onSave, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    // Fetch available courses (published only)
    const { data: availableCourses = [] } = useQuery({
        queryKey: queryKeys.courses.adminList({ status: 'published' }),
        queryFn: () =>
            courseService.getAll({
                filter: { status: { _eq: 'published' } },
                limit: -1,
                fields: ['id', 'title', 'thumbnail', 'duration'],
            }),
        enabled: open,
    });

    // Fetch available users (active only)
    const { data: availableUsers = [] } = useQuery({
        queryKey: queryKeys.users.list({ status: 'active' }),
        queryFn: () =>
            userService.getAll({
                filter: { status: { _eq: 'active' } },
                limit: -1,
                fields: ['id', 'first_name', 'last_name', 'email', 'avatar'],
            }),
        enabled: open,
    });

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

    // Custom option render for courses with thumbnail
    const renderCourseOption = course => (
        <Space>
            <Avatar
                size={32}
                src={getAssetUrl(course.thumbnail)}
                icon={!course.thumbnail && <BookOutlined />}
                shape="square"
                style={{
                    backgroundColor: !course.thumbnail ? '#1890ff' : undefined,
                    borderRadius: 4,
                }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span style={{ fontWeight: 500 }}>{course.title}</span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {course.duration} phút
                </Text>
            </div>
        </Space>
    );

    // Custom option render for users with avatar
    const renderUserOption = user => (
        <Space>
            <Avatar
                size={32}
                src={getAvatarUrl(user.avatar)}
                icon={!user.avatar && <UserOutlined />}
                style={{ backgroundColor: !user.avatar ? '#ea4544' : undefined }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span style={{ fontWeight: 500 }}>{getUserFullName(user)}</span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.email}
                </Text>
            </div>
        </Space>
    );

    // Custom tag render for selected users (multiple mode)
    const tagRender = props => {
        const { value, closable, onClose } = props;
        const user = availableUsers.find(u => u.id === value);
        if (!user) return null;

        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px 2px 4px',
                    background: '#f5f5f5',
                    borderRadius: 4,
                    marginRight: 4,
                    marginBottom: 4,
                }}
            >
                <Avatar
                    size={20}
                    src={getAvatarUrl(user.avatar)}
                    icon={!user.avatar && <UserOutlined />}
                    style={{ backgroundColor: !user.avatar ? '#ea4544' : undefined }}
                />
                <span style={{ fontSize: 13 }}>{getUserFullName(user)}</span>
                {closable && (
                    <span onClick={onClose} style={{ cursor: 'pointer', marginLeft: 4, color: '#999' }}>
                        ×
                    </span>
                )}
            </span>
        );
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
            width="90%"
            style={{ maxWidth: 600 }}
            centered
            destroyOnHidden
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

                {/* Course Selection with thumbnail */}
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
                            course: c,
                        }))}
                        optionRender={option => renderCourseOption(option.data.course)}
                        suffixIcon={<BookOutlined />}
                        listHeight={300}
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
                                user: u,
                            }))}
                            optionRender={option => renderUserOption(option.data.user)}
                            suffixIcon={<UserOutlined />}
                            listHeight={300}
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
                                user: u,
                            }))}
                            optionRender={option => renderUserOption(option.data.user)}
                            tagRender={tagRender}
                            listHeight={300}
                            maxTagCount="responsive"
                        />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
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
                    <Col xs={24} sm={12}>
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
