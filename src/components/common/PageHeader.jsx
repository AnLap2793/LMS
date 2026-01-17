import PropTypes from 'prop-types';
import { Typography, Space, Breadcrumb, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * PageHeader Component
 * Header cho các trang admin với breadcrumb và actions
 * Responsive: Stack title/actions trên mobile
 */
function PageHeader({ title, subtitle, breadcrumbs, actions, style }) {
    return (
        <div style={{ marginBottom: 24, ...style }}>
            {/* Breadcrumb */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb
                    style={{ marginBottom: 8 }}
                    items={[
                        {
                            title: (
                                <Link to="/admin">
                                    <HomeOutlined />
                                </Link>
                            ),
                            key: 'home',
                        },
                        ...breadcrumbs.map((item, index) => ({
                            title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
                            key: index,
                        })),
                    ]}
                />
            )}

            {/* Title and Actions - Responsive layout */}
            <Row gutter={[16, 12]} align="middle" justify="space-between" wrap className="page-header-responsive">
                <Col xs={24} sm={24} md="auto">
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            {title}
                        </Title>
                        {subtitle && (
                            <Typography.Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                                {subtitle}
                            </Typography.Text>
                        )}
                    </div>
                </Col>

                {actions && (
                    <Col xs={24} sm={24} md="auto" className="page-header-actions">
                        <Space wrap size={[8, 8]} style={{ width: '100%', justifyContent: 'flex-start' }}>
                            {actions}
                        </Space>
                    </Col>
                )}
            </Row>
        </div>
    );
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            path: PropTypes.string,
        })
    ),
    actions: PropTypes.node,
    style: PropTypes.object,
};

PageHeader.defaultProps = {
    subtitle: null,
    breadcrumbs: [],
    actions: null,
    style: {},
};

export default PageHeader;
