import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Typography, Space, Tag, Button, Empty, Badge, Avatar, Tabs } from 'antd';
import {
    BellOutlined,
    BookOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock notifications
const mockNotifications = [
    {
        id: 'n1',
        type: 'enrollment',
        title: 'Khóa học mới được gán',
        message: 'Bạn được gán khóa học "React Advanced Patterns". Hạn hoàn thành: 01/04/2024',
        read: false,
        date: '2024-03-10T10:00:00Z',
        link: '/my-courses',
    },
    {
        id: 'n2',
        type: 'deadline',
        title: 'Sắp đến hạn hoàn thành',
        message: 'Khóa học "Onboarding cho Nhân viên mới" còn 3 ngày nữa là đến hạn',
        read: false,
        date: '2024-03-09T08:00:00Z',
        link: '/learn/1',
    },
    {
        id: 'n3',
        type: 'certificate',
        title: 'Chứng chỉ mới',
        message: 'Chúc mừng! Bạn đã nhận chứng chỉ hoàn thành khóa học "An toàn lao động"',
        read: true,
        date: '2024-03-08T15:30:00Z',
        link: '/my-certificates',
    },
    {
        id: 'n4',
        type: 'reminder',
        title: 'Nhắc nhở học tập',
        message: 'Bạn chưa học trong 5 ngày qua. Hãy quay lại để tiếp tục tiến độ!',
        read: true,
        date: '2024-03-05T09:00:00Z',
        link: '/my-courses',
    },
];

/**
 * Notifications Page
 * Trang thông báo
 */
function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(mockNotifications);
    const [activeTab, setActiveTab] = useState('all');

    // Get filtered notifications
    const filteredNotifications = activeTab === 'unread' ? notifications.filter(n => !n.read) : notifications;

    // Get unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Get icon by type
    const getIcon = type => {
        const iconMap = {
            enrollment: <BookOutlined style={{ color: '#1890ff' }} />,
            deadline: <ClockCircleOutlined style={{ color: '#faad14' }} />,
            certificate: <TrophyOutlined style={{ color: '#52c41a' }} />,
            reminder: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        };
        return iconMap[type] || <BellOutlined />;
    };

    // Get avatar color by type
    const getAvatarColor = type => {
        const colorMap = {
            enrollment: '#1890ff',
            deadline: '#faad14',
            certificate: '#52c41a',
            reminder: '#ff4d4f',
        };
        return colorMap[type] || '#999';
    };

    // Handle mark as read
    const handleMarkRead = id => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    };

    // Handle mark all as read
    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Handle delete
    const handleDelete = id => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Handle click notification
    const handleClick = notification => {
        handleMarkRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    // Tab items
    const tabItems = [
        {
            key: 'all',
            label: `Tất cả (${notifications.length})`,
        },
        {
            key: 'unread',
            label: (
                <Badge count={unreadCount} size="small" offset={[8, 0]}>
                    Chưa đọc
                </Badge>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        <BellOutlined style={{ color: '#ea4544', marginRight: 8 }} />
                        Thông báo
                    </Title>
                    <Text type="secondary">Cập nhật về khóa học và hoạt động của bạn</Text>
                </div>
                {unreadCount > 0 && (
                    <Button onClick={handleMarkAllRead}>
                        <CheckCircleOutlined /> Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <List
                        dataSource={filteredNotifications}
                        renderItem={item => (
                            <List.Item
                                style={{
                                    background: item.read ? 'transparent' : '#f6ffed',
                                    padding: '16px',
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    border: item.read ? '1px solid #f0f0f0' : '1px solid #b7eb8f',
                                }}
                                onClick={() => handleClick(item)}
                                actions={[
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                    />,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            style={{ backgroundColor: getAvatarColor(item.type) }}
                                            icon={getIcon(item.type)}
                                        />
                                    }
                                    title={
                                        <Space>
                                            <Text strong={!item.read}>{item.title}</Text>
                                            {!item.read && <Tag color="blue">Mới</Tag>}
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size={4}>
                                            <Text type="secondary">{item.message}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(item.date).toLocaleString('vi-VN')}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                    />
                )}
            </Card>
        </div>
    );
}

export default NotificationsPage;
