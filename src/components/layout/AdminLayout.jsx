import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    TagsOutlined,
    NodeIndexOutlined,
    BarChartOutlined,
    TeamOutlined,
    FileProtectOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * Admin Layout Component
 * Layout với Sidebar cho Admin LMS
 */
function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Menu items cho Admin LMS
    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'training',
            icon: <BookOutlined />,
            label: 'Quản lý Đào tạo',
            children: [
                {
                    key: '/admin/courses',
                    icon: <BookOutlined />,
                    label: 'Khóa học',
                },
                {
                    key: '/admin/quizzes',
                    icon: <FormOutlined />,
                    label: 'Bài kiểm tra',
                },
                {
                    key: '/admin/tags',
                    icon: <TagsOutlined />,
                    label: 'Tags',
                },
                {
                    key: '/admin/learning-paths',
                    icon: <NodeIndexOutlined />,
                    label: 'Lộ trình học tập',
                },
            ],
        },
        {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Báo cáo',
            children: [
                {
                    key: '/admin/reports',
                    icon: <BarChartOutlined />,
                    label: 'Tổng quan',
                },
                {
                    key: '/admin/reports/employees',
                    icon: <TeamOutlined />,
                    label: 'Tiến độ nhân viên',
                },
            ],
        },
        {
            key: 'system',
            icon: <SettingOutlined />,
            label: 'Hệ thống',
            children: [
                {
                    key: '/admin/certificates/templates',
                    icon: <FileProtectOutlined />,
                    label: 'Mẫu chứng chỉ',
                },
                {
                    key: '/admin/settings',
                    icon: <SettingOutlined />,
                    label: 'Cài đặt',
                },
            ],
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
        }
    };

    // Get selected keys based on current path
    const getSelectedKeys = () => {
        const path = location.pathname;
        // Handle nested routes
        if (path.startsWith('/admin/courses')) return ['/admin/courses'];
        if (path.startsWith('/admin/quizzes')) return ['/admin/quizzes'];
        if (path.startsWith('/admin/tags')) return ['/admin/tags'];
        if (path.startsWith('/admin/learning-paths')) return ['/admin/learning-paths'];
        if (path.startsWith('/admin/reports/employees')) return ['/admin/reports/employees'];
        if (path.startsWith('/admin/reports')) return ['/admin/reports'];
        if (path.startsWith('/admin/certificates')) return ['/admin/certificates/templates'];
        if (path.startsWith('/admin/settings')) return ['/admin/settings'];
        return [path];
    };

    // Get open keys for submenus
    const getOpenKeys = () => {
        const path = location.pathname;
        if (
            path.includes('/courses') ||
            path.includes('/quizzes') ||
            path.includes('/tags') ||
            path.includes('/learning-paths')
        ) {
            return ['training'];
        }
        if (path.includes('/reports')) {
            return ['reports'];
        }
        if (path.includes('/certificates') || path.includes('/settings')) {
            return ['system'];
        }
        return [];
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
                    }}
                >
                    <BookOutlined style={{ fontSize: 24, color: '#ea4544' }} />
                    {!collapsed && (
                        <Text strong style={{ marginLeft: 12, fontSize: 18, color: '#ea4544' }}>
                            LMS Admin
                        </Text>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    items={menuItems}
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={getOpenKeys()}
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
                        background: '#fff',
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
                    {/* Collapse button */}
                    <div
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            cursor: 'pointer',
                            fontSize: 18,
                            padding: '0 12px',
                        }}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>

                    {/* User dropdown */}
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
                            <Text>{user?.first_name || 'Admin'}</Text>
                        </Space>
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: '#fff',
                        borderRadius: 8,
                        minHeight: 'calc(100vh - 64px - 48px)',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;
