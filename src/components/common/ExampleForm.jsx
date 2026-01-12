/**
 * VÍ DỤ: Form Component với Validation
 * 
 * Đây là ví dụ form component sử dụng Ant Design Form với validation rules.
 * Tạo form components của bạn theo pattern này.
 */
import { Form, Input, Button, Card } from 'antd';
import { emailRules, passwordRules, nameRules } from '../../validation/formRules';
import { useCreateUser } from '../../hooks/useUsers';

function ExampleForm() {
  const [form] = Form.useForm();
  const createUser = useCreateUser();

  const onFinish = async (values) => {
    try {
      await createUser.mutateAsync(values);
      form.resetFields();
    } catch (error) {
      // Error đã được xử lý bởi global error handler
      console.error('Form submission error:', error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Validation failed:', errorInfo);
  };

  return (
    <Card title="VÍ DỤ: Form tạo User" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={nameRules}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={emailRules}
        >
          <Input type="email" placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={passwordRules}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createUser.isPending}
            block
          >
            {createUser.isPending ? 'Đang tạo...' : 'Tạo User'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default ExampleForm;

