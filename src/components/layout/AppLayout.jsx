import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Badge, Button, theme } from 'antd';
import {
    BookOutlined,
    TrophyOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ReadOutlined,
    AppstoreOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationPopover } from '../common';
import logoVuong from '../../assets/logo-vuong.svg';
import logoNgang from '../../assets/logo-ngang.svg';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * App Layout Component
 * Layout chính cho học viên (Sidebar style giống Admin)
 */
function AppLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Menu items cho Learner
    const menuItems = [
        {
            key: '/my-courses',
            icon: <BookOutlined />,
            label: 'Khóa học của tôi',
        },
        {
            key: '/courses',
            icon: <AppstoreOutlined />,
            label: 'Khám phá',
        },
        {
            key: '/my-certificates',
            icon: <TrophyOutlined />,
            label: 'Chứng chỉ',
        },
    ];

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: 'Trang quản trị',
            // Trong thực tế nên check role
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key.startsWith('/')) {
            navigate(key);
        }
    };

    const handleUserMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
            navigate('/login');
        } else if (key === 'profile') {
            navigate('/profile');
        } else if (key === 'admin') {
            navigate('/admin');
        }
    };

    // Get selected keys
    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path.startsWith('/my-courses') || path.startsWith('/learn')) return ['/my-courses'];
        if (path.startsWith('/courses')) return ['/courses'];
        if (path.startsWith('/my-certificates')) return ['/my-certificates'];
        // Default for home
        if (path === '/') return [];
        return [path];
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth={80}
                width={260}
                onBreakpoint={broken => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #f0f0f0',
                        padding: '0 16px',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/')}
                >
                    {collapsed ? <img src={logoVuong} alt="LMS Logo" /> : <img src={logoNgang} alt="LMS Logo" />}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    items={menuItems}
                    selectedKeys={getSelectedKeys()}
                    onClick={handleMenuClick}
                    style={{
                        border: 'none',
                        padding: '8px 0',
                    }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                {/* Header */}
                <Header
                    style={{
                        background: colorBgContainer,
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    {/* Toggle Button */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    {/* Right Side */}
                    <Space size={24}>
                        {/* Notifications */}
                        <NotificationPopover />

                        {/* User Dropdown */}
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: handleUserMenuClick,
                            }}
                            placement="bottomRight"
                            arrow
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#ea4544' }} />
                                <Text>{user?.first_name || 'Học viên'}</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: 8,
                        minHeight: 'calc(100vh - 64px - 48px)',
                    }}
                >
                    {children || <Outlet />}
                </Content>
            </Layout>
        </Layout>
    );
}

export default AppLayout;
