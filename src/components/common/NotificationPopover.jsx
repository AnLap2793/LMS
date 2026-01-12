import { useState } from 'react';
import { Popover, Badge, Button, List, Avatar, Typography, Space, Empty, Divider } from 'antd';
import {
    BellOutlined,
    BookOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// Mock notifications (tạm thời để ở đây, sau này có thể move ra service/context)
const initialNotifications = [
    {
        id: 'n1',
        type: 'enrollment',
        title: 'Khóa học mới',
        message: 'Bạn được gán khóa học "React Advanced Patterns"',
        read: false,
        date: '2024-03-10T10:00:00Z',
        link: '/my-courses',
    },
    {
        id: 'n2',
        type: 'deadline',
        title: 'Sắp đến hạn',
        message: 'Khóa học "Onboarding" còn 3 ngày nữa',
        read: false,
        date: '2024-03-09T08:00:00Z',
        link: '/learn/1',
    },
    {
        id: 'n3',
        type: 'certificate',
        title: 'Chứng chỉ mới',
        message: 'Đã nhận chứng chỉ "An toàn lao động"',
        read: true,
        date: '2024-03-08T15:30:00Z',
        link: '/my-certificates',
    },
    {
        id: 'n4',
        type: 'reminder',
        title: 'Nhắc nhở',
        message: 'Bạn chưa học trong 5 ngày qua',
        read: true,
        date: '2024-03-05T09:00:00Z',
        link: '/my-courses',
    },
];

function NotificationPopover() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);

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

    const handleItemClick = item => {
        // Mark as read
        setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, read: true } : n)));
        setVisible(false);
        if (item.link) {
            navigate(item.link);
        }
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const content = (
        <div className="notification-list-container" style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
            <style>
                {`
                    .notification-list-container::-webkit-scrollbar {
                        display: none;
                    }
                    .notification-list-container {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                <Text strong style={{ fontSize: 16 }}>
                    Thông báo
                </Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
                        Đánh dấu đã đọc
                    </Button>
                )}
            </div>

            <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                    <List.Item
                        onClick={() => handleItemClick(item)}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: item.read ? '#fff' : '#f9f9f9',
                            transition: 'background 0.3s',
                            borderBottom: '1px solid #f0f0f0',
                        }}
                        className="notification-item"
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={getIcon(item.type)} style={{ backgroundColor: 'transparent' }} />}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text strong={!item.read} style={{ fontSize: 14 }}>
                                        {item.title}
                                    </Text>
                                    {!item.read && <Badge status="processing" />}
                                </div>
                            }
                            description={
                                <div style={{ fontSize: 13, color: '#666' }}>
                                    <div style={{ marginBottom: 4, lineHeight: '1.4' }}>{item.message}</div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {new Date(item.date).toLocaleDateString('vi-VN')}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Không có thông báo"
                            style={{ margin: '20px 0' }}
                        />
                    ),
                }}
            />

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        setVisible(false);
                        navigate('/notifications');
                    }}
                >
                    Xem tất cả
                </Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
            arrow={false}
            overlayInnerStyle={{ padding: 0 }}
        >
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 20 }} />}
                    style={{ width: 40, height: 40 }}
                />
            </Badge>
        </Popover>
    );
}

export default NotificationPopover;
