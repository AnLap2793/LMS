---
trigger: always_on
---

## 3. Ant Design Guidelines với Theme Đỏ #ea4544

### Import Components
```javascript
// ✅ Ưu tiên: Named imports để tree-shaking
import { Button, Table, Form, Input } from 'antd';

// ❌ Không dùng: Default import toàn bộ
// import antd from 'antd';
```

### Theme Customization (Màu đỏ #ea4544)
```javascript
// src/config/theme.js
export const theme = {
  token: {
    colorPrimary: '#ea4544',        // Màu chủ đạo - Đỏ
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#ea4544',
    colorLink: '#ea4544',
    colorTextBase: '#262626',
    
    borderRadius: 6,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 36,
      colorPrimaryHover: '#ff6b6a',
      colorPrimaryActive: '#d63938',
      borderRadius: 6,
      fontWeight: 500,
    },
    Table: {
      headerBg: '#fff1f0',
      headerColor: '#ea4544',
      rowHoverBg: '#fff1f0',
    },
    Menu: {
      itemSelectedBg: '#fff1f0',
      itemSelectedColor: '#ea4544',
    },
    Input: {
      activeBorderColor: '#ea4544',
      hoverBorderColor: '#ff6b6a',
    },
    Form: {
      labelColor: '#262626',
      labelFontSize: 14,
    },
  },
};
```

### App.js với ConfigProvider
```javascript
// src/App.js
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { theme } from './config/theme';

function App() {
  return (
    <ConfigProvider 
      theme={theme}
      locale={viVN}
    >
      {/* Your app components */}
    </ConfigProvider>
  );
}

export default App;
```

### Layout chuẩn với Ant Design
```javascript
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

function AppLayout({ children }) {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Người dùng',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h2 style={{ color: '#ea4544', margin: 0 }}>Logo</h2>
        </div>
        <Menu 
          mode="inline" 
          items={menuItems}
          defaultSelectedKeys={['dashboard']}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Header content */}
        </Header>
        
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          borderRadius: 8,
        }}>
          {children}
        </Content>
        
        <Footer style={{ textAlign: 'center' }}>
          Your Company ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}
```

### Form Handling
```javascript
import { Form, Input, Button, message } from 'antd';

function UserForm({ onSubmit, initialValues }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success('Lưu thành công!');
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form 
      form={form} 
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={initialValues}
      autoComplete="off"
    >
      <Form.Item 
        name="name" 
        label="Họ tên"
        rules={[
          { required: true, message: 'Vui lòng nhập họ tên' },
          { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
        ]}
      >
        <Input placeholder="Nguyễn Văn A" size="large" />
      </Form.Item>

      <Form.Item 
        name="email" 
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <Input placeholder="email@example.com" size="large" />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          loading={loading}
          size="large"
          block
        >
          Lưu thông tin
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Table Best Practices
```javascript
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

function UsersTable({ data, loading, onEdit, onDelete }) {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} bản ghi`,
      }}
      scroll={{ x: 1000 }}
    />
  );
}
```

---