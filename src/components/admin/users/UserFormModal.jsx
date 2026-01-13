import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { mockDepartments, mockPositions } from '../../../mocks';

/**
 * User Form Modal
 * Form để tạo mới hoặc chỉnh sửa người dùng
 */
function UserFormModal({ open, onCancel, onSave, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    first_name: initialValues.first_name,
                    last_name: initialValues.last_name,
                    email: initialValues.email,
                    phone: initialValues.phone || '',
                    department: initialValues.department?.code,
                    position: initialValues.position?.code,
                    status: initialValues.status || 'active',
                    employee_id: initialValues.employee_id || '',
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
            onSave(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isEdit ? 'Cập nhật' : 'Thêm mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            width="90%"
            style={{ maxWidth: 600 }}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'active',
                }}
            >
                <Divider orientation="left" plain>
                    Thông tin cá nhân
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="first_name"
                            label="Họ"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ' },
                                { min: 1, message: 'Họ phải có ít nhất 1 ký tự' },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="last_name"
                            label="Tên"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên' },
                                { min: 1, message: 'Tên phải có ít nhất 1 ký tự' },
                            ]}
                        >
                            <Input placeholder="Văn A" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="nguyenvana@company.com" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                {
                                    pattern: /^[0-9]{10,11}$/,
                                    message: 'Số điện thoại không hợp lệ',
                                },
                            ]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="employee_id" label="Mã nhân viên" extra="Mã định danh trong hệ thống nhân sự">
                    <Input prefix={<IdcardOutlined />} placeholder="NV001" />
                </Form.Item>

                <Divider orientation="left" plain>
                    Thông tin công việc
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="department"
                            label="Phòng ban"
                            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
                        >
                            <Select
                                placeholder="Chọn phòng ban"
                                options={mockDepartments.map(d => ({
                                    value: d.code,
                                    label: d.name,
                                }))}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="position"
                            label="Vị trí"
                            rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
                        >
                            <Select
                                placeholder="Chọn vị trí"
                                options={mockPositions.map(p => ({
                                    value: p.code,
                                    label: p.name,
                                }))}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="status" label="Trạng thái">
                    <Select
                        options={[
                            { value: 'active', label: 'Hoạt động' },
                            { value: 'inactive', label: 'Đã khóa' },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default UserFormModal;
