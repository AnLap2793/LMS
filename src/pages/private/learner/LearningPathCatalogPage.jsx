import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Tag, Button, Input, Empty, Divider, Skeleton } from 'antd';
import {
    SearchOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    NodeIndexOutlined,
    TeamOutlined,
    ArrowRightOutlined,
    FlagOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { learningPathService } from '../../../services/learningPathService';
import { queryKeys } from '../../../constants/queryKeys';

const { Title, Text, Paragraph } = Typography;

/**
 * Learning Path Catalog Page
 * Duyệt tất cả lộ trình học tập có sẵn
 */
function LearningPathCatalogPage() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');

    const { data: paths = [], isLoading } = useQuery({
        queryKey: queryKeys.learningPaths.list({ status: 'published', search: searchText }),
        queryFn: () => learningPathService.getPublished({ search: searchText }),
    });

    // Format duration
    const formatDuration = hours => {
        if (!hours) return '';
        if (hours < 1) {
            return `${Math.round(hours * 60)} phút`;
        }
        return `${hours} giờ`;
    };

    // Handle path click
    const handlePathClick = pathId => {
        navigate(`/learning-paths/${pathId}`);
    };

    // Render learning path card
    const renderPathCard = path => {
        const courseCount = path.courses_count || path.courses?.length || 0;

        return (
            <Col xs={24} sm={12} lg={8} key={path.id}>
                <Card
                    hoverable
                    onClick={() => handlePathClick(path.id)}
                    style={{ height: '100%' }}
                    cover={
                        <div
                            style={{
                                height: 160,
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <NodeIndexOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />

                            {path.is_mandatory && (
                                <Tag color="red" style={{ position: 'absolute', top: 12, left: 12 }}>
                                    <FlagOutlined /> Bắt buộc
                                </Tag>
                            )}

                            <Tag color="gold" style={{ position: 'absolute', top: 12, right: 12 }}>
                                {courseCount} khóa học
                            </Tag>
                        </div>
                    }
                    actions={[
                        <Button type="link" onClick={() => handlePathClick(path.id)}>
                            Xem chi tiết <ArrowRightOutlined />
                        </Button>,
                    ]}
                >
                    <Card.Meta
                        title={
                            <Text
                                strong
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {path.title}
                            </Text>
                        }
                        description={
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 13 }}>
                                    {path.description}
                                </Paragraph>

                                <Space split={<Divider type="vertical" />}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <ClockCircleOutlined /> {formatDuration(path.total_duration)}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <TeamOutlined /> {path.enrollments_count || 0} học viên
                                    </Text>
                                </Space>

                                {/* Progress indicator logic would go here if we tracked progress on catalog */}
                            </Space>
                        }
                    />
                </Card>
            </Col>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    <RocketOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
                    Lộ trình học tập
                </Title>
                <Text type="secondary">
                    Các lộ trình học tập được thiết kế giúp bạn phát triển kỹ năng một cách bài bản
                </Text>
            </div>

            {/* Search for Paths */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm lộ trình..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col flex="auto">
                        <Text type="secondary">
                            Lộ trình học tập giúp bạn xây dựng kỹ năng một cách có hệ thống thông qua chuỗi các khóa học
                            liên quan.
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* Path Grid */}
            {isLoading ? (
                <Skeleton active />
            ) : paths.length > 0 ? (
                <Row gutter={[16, 16]}>{paths.map(path => renderPathCard(path))}</Row>
            ) : (
                <Card>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lộ trình học tập nào" />
                </Card>
            )}
        </div>
    );
}

export default LearningPathCatalogPage;
