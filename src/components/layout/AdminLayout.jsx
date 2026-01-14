import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Drawer, Button } from 'antd';
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
    ScheduleOutlined,
    MenuOutlined,
    CloseOutlined,
    DatabaseOutlined,
    HistoryOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationPopover } from '../common';
import logoVuong from '../../assets/logo-vuong.svg';
import logoNgang from '../../assets/logo-ngang.svg';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Breakpoint for mobile (lg = 992px)
const MOBILE_BREAKPOINT = 992;

/**
 * Admin Layout Component
 * Layout với Sidebar cho Admin LMS
 * Hỗ trợ responsive: Mobile drawer + Desktop sidebar
 */
function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Check screen size on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile drawer when route changes
    useEffect(() => {
        setMobileDrawerOpen(false);
    }, [location.pathname]);

    // Menu items cho Admin LMS
    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'users',
            icon: <TeamOutlined />,
            label: 'Quản lý Người dùng',
            children: [
                {
                    key: '/admin/users',
                    icon: <UserOutlined />,
                    label: 'Người dùng',
                },
                {
                    key: '/admin/enrollments',
                    icon: <ScheduleOutlined />,
                    label: 'Đăng ký khóa học',
                },
            ],
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
                    key: '/admin/questions',
                    icon: <DatabaseOutlined />,
                    label: 'Ngân hàng câu hỏi',
                },
                {
                    key: '/admin/documents',
                    icon: <FolderOutlined />,
                    label: 'Thư viện Tài liệu',
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
                {
                    key: '/admin/reports/departments',
                    icon: <TeamOutlined />,
                    label: 'Theo phòng ban',
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
        if (path.startsWith('/admin/users')) return ['/admin/users'];
        if (path.startsWith('/admin/enrollments')) return ['/admin/enrollments'];
        if (path.startsWith('/admin/courses')) return ['/admin/courses'];
        if (path.startsWith('/admin/quizzes')) return ['/admin/quizzes'];
        if (path.startsWith('/admin/questions')) return ['/admin/questions'];
        if (path.startsWith('/admin/documents')) return ['/admin/documents'];
        if (path.startsWith('/admin/quiz-attempts')) return ['/admin/quiz-attempts'];
        if (path.startsWith('/admin/tags')) return ['/admin/tags'];
        if (path.startsWith('/admin/learning-paths')) return ['/admin/learning-paths'];
        if (path.startsWith('/admin/reports/employees')) return ['/admin/reports/employees'];
        if (path.startsWith('/admin/reports/departments')) return ['/admin/reports/departments'];
        if (path.startsWith('/admin/reports')) return ['/admin/reports'];
        if (path.startsWith('/admin/certificates')) return ['/admin/certificates/templates'];
        if (path.startsWith('/admin/settings')) return ['/admin/settings'];
        return [path];
    };

    // Get open keys for submenus
    const getOpenKeys = () => {
        const path = location.pathname;
        if (path.includes('/users') || path.includes('/enrollments')) {
            return ['users'];
        }
        if (
            path.includes('/courses') ||
            path.includes('/quizzes') ||
            path.includes('/questions') ||
            path.includes('/tags') ||
            path.includes('/documents') ||
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

    // Shared menu component for both Sider and Drawer
    const renderMenu = () => (
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
    );

    // Logo component
    const renderLogo = (isCollapsed = false) => (
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
            {isCollapsed ? <img src={logoVuong} alt="LMS Logo" /> : <img src={logoNgang} alt="LMS Logo" />}
        </div>
    );

    // Calculate content margin based on device and sidebar state
    const getContentMargin = () => {
        if (isMobile) return 0;
        return collapsed ? 80 : 260;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar - Hidden on mobile */}
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    collapsedWidth={80}
                    width={260}
                    className="desktop-sider"
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
                    {renderLogo(collapsed)}
                    {renderMenu()}
                </Sider>
            )}

            {/* Mobile Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={logoNgang} alt="LMS Logo" style={{ height: 32 }} />
                    </div>
                }
                placement="left"
                onClose={() => setMobileDrawerOpen(false)}
                open={mobileDrawerOpen}
                width={280}
                className="mobile-drawer"
                styles={{
                    body: { padding: 0 },
                    header: { borderBottom: '1px solid #f0f0f0' },
                }}
                closeIcon={<CloseOutlined />}
            >
                {renderMenu()}
            </Drawer>

            <Layout
                style={{
                    marginLeft: getContentMargin(),
                    transition: 'margin-left 0.2s',
                }}
            >
                {/* Header */}
                <Header
                    className="app-header"
                    style={{
                        background: '#fff',
                        padding: isMobile ? '0 12px' : '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    {/* Left side - Menu toggle */}
                    {isMobile ? (
                        // Mobile: Hamburger menu
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMobileDrawerOpen(true)}
                            style={{
                                fontSize: 18,
                                width: 48,
                                height: 48,
                            }}
                        />
                    ) : (
                        // Desktop: Collapse toggle
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
                    )}

                    {/* Right Side */}
                    <Space size={isMobile ? 12 : 24}>
                        {/* Notifications */}
                        <NotificationPopover />

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
                                {!isMobile && <Text className="header-user-name">{user?.first_name || 'Admin'}</Text>}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content
                    className="content-area"
                    style={{
                        margin: isMobile ? 12 : 24,
                        padding: isMobile ? 16 : 24,
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
