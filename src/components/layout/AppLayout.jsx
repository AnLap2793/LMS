import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

/**
 * App Layout Component
 * Xem TEMPLATE_GUIDE.md để biết hướng dẫn tùy chỉnh
 */
function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

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
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Nội dung Header */}
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
          Template ReactJS ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AppLayout;

