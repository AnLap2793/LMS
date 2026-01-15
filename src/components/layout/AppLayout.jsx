import { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Drawer, Button, theme } from 'antd';
import {
    BookOutlined,
    TrophyOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    DashboardOutlined,
    MenuOutlined,
    CloseOutlined,
    HomeOutlined,
    HistoryOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasAdminAccess } from '../../constants/roles';
import { NotificationPopover } from '../common';
import logoVuong from '../../assets/logo-vuong.svg';
import logoNgang from '../../assets/logo-ngang.svg';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Breakpoint for mobile (lg = 992px)
const MOBILE_BREAKPOINT = 992;

/**
 * App Layout Component
 * Layout chính cho học viên (Sidebar style giống Admin)
 * Hỗ trợ responsive: Mobile drawer + Desktop sidebar
 */
function AppLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

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

    // Menu items cho Learner
    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
        },
        {
            key: '/my-courses',
            icon: <BookOutlined />,
            label: 'Khóa học của tôi',
        },
        {
            key: '/courses',
            icon: <AppstoreOutlined />,
            label: 'Khóa học',
        },
        {
            key: '/learning-paths',
            icon: <RocketOutlined />,
            label: 'Lộ trình học tập',
        },
        {
            key: '/quiz-history',
            icon: <HistoryOutlined />,
            label: 'Lịch sử bài kiểm tra',
        },
        {
            key: '/my-certificates',
            icon: <TrophyOutlined />,
            label: 'Chứng chỉ',
        },
    ];

    // User dropdown menu - chỉ hiển thị "Trang quản trị" nếu user có quyền
    const userMenuItems = useMemo(() => {
        const items = [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Thông tin cá nhân',
            },
        ];

        // Chỉ thêm "Trang quản trị" nếu user có quyền admin
        if (hasAdminAccess(user)) {
            items.push({
                key: 'admin',
                icon: <DashboardOutlined />,
                label: 'Trang quản trị',
            });
        }

        items.push(
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
            }
        );

        return items;
    }, [user]);

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
        if (path.startsWith('/learning-paths')) return ['/learning-paths'];
        if (path.startsWith('/my-courses') || path.startsWith('/learn/')) return ['/my-courses'];
        if (path.startsWith('/courses')) return ['/courses'];
        if (path.startsWith('/quiz-history')) return ['/quiz-history'];
        if (path.startsWith('/my-certificates')) return ['/my-certificates'];
        // Default for home
        if (path === '/') return ['/'];
        return [path];
    };

    // Shared menu component for both Sider and Drawer
    const renderMenu = () => (
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
                cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
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
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                        onClick={() => {
                            navigate('/');
                            setMobileDrawerOpen(false);
                        }}
                    >
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
                        background: colorBgContainer,
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
                    )}

                    {/* Right Side */}
                    <Space size={isMobile ? 12 : 24}>
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
                                {!isMobile && (
                                    <Text className="header-user-name">{user?.first_name || 'Học viên'}</Text>
                                )}
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
