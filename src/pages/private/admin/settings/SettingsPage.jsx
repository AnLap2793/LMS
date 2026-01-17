import {
    Card,
    Form,
    Input,
    InputNumber,
    Switch,
    Button,
    Divider,
    Row,
    Col,
    Space,
    message,
    Typography,
    Select,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';

const { Title, Text } = Typography;

/**
 * Settings Page
 * Cài đặt hệ thống LMS
 */
function SettingsPage() {
    const [form] = Form.useForm();

    const handleSave = () => {
        message.success('Đã lưu cài đặt');
    };

    return (
        <div>
            <PageHeader
                title="Cài đặt Hệ thống"
                subtitle="Cấu hình các thông số cho hệ thống LMS"
                breadcrumbs={[{ title: 'Hệ thống' }, { title: 'Cài đặt' }]}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                    // Quiz settings
                    defaultPassScore: 70,
                    defaultMaxAttempts: 3,
                    defaultTimeLimit: 30,
                    randomizeQuestions: true,

                    // Enrollment settings
                    autoEnrollNewEmployees: true,
                    defaultDeadlineDays: 30,
                    sendEnrollmentEmail: true,
                    sendDeadlineReminder: true,
                    reminderDaysBefore: 3,

                    // Certificate settings
                    autoGenerateCertificate: true,
                    certificatePrefix: 'CERT',

                    // General
                    allowSelfEnrollment: true,
                    showCourseProgress: true,
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        {/* Quiz Settings */}
                        <Card title="Cài đặt Bài kiểm tra" style={{ marginBottom: 24 }}>
                            <Form.Item
                                name="defaultPassScore"
                                label="Điểm đạt mặc định (%)"
                                extra="Điểm tối thiểu để vượt qua bài kiểm tra"
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                    style={{ width: 150 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="defaultMaxAttempts"
                                label="Số lần làm bài tối đa"
                                extra="0 = không giới hạn"
                            >
                                <InputNumber min={0} max={10} style={{ width: 150 }} />
                            </Form.Item>

                            <Form.Item
                                name="defaultTimeLimit"
                                label="Thời gian làm bài mặc định"
                                extra="Để trống = không giới hạn"
                            >
                                <InputNumber
                                    min={0}
                                    formatter={value => `${value} phút`}
                                    parser={value => value.replace(' phút', '')}
                                    style={{ width: 150 }}
                                />
                            </Form.Item>

                            <Form.Item name="randomizeQuestions" label="Trộn câu hỏi" valuePropName="checked">
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>
                        </Card>

                        {/* Certificate Settings */}
                        <Card title="Cài đặt Chứng chỉ" style={{ marginBottom: 24 }}>
                            <Form.Item
                                name="autoGenerateCertificate"
                                label="Tự động tạo chứng chỉ"
                                extra="Tạo chứng chỉ khi hoàn thành khóa học"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>

                            <Form.Item name="certificatePrefix" label="Prefix số chứng chỉ" extra="VD: CERT-2024-00001">
                                <Input style={{ width: 150 }} />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        {/* Enrollment Settings */}
                        <Card title="Cài đặt Đăng ký" style={{ marginBottom: 24 }}>
                            <Form.Item
                                name="autoEnrollNewEmployees"
                                label="Tự động đăng ký cho nhân viên mới"
                                extra="Đăng ký các khóa học onboarding bắt buộc"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>

                            <Form.Item
                                name="defaultDeadlineDays"
                                label="Deadline mặc định"
                                extra="Số ngày để hoàn thành khóa học"
                            >
                                <InputNumber
                                    min={1}
                                    formatter={value => `${value} ngày`}
                                    parser={value => value.replace(' ngày', '')}
                                    style={{ width: 150 }}
                                />
                            </Form.Item>

                            <Divider />

                            <Form.Item name="sendEnrollmentEmail" label="Gửi email khi đăng ký" valuePropName="checked">
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>

                            <Form.Item name="sendDeadlineReminder" label="Nhắc nhở deadline" valuePropName="checked">
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>

                            <Form.Item name="reminderDaysBefore" label="Nhắc trước deadline">
                                <InputNumber
                                    min={1}
                                    max={14}
                                    formatter={value => `${value} ngày`}
                                    parser={value => value.replace(' ngày', '')}
                                    style={{ width: 150 }}
                                />
                            </Form.Item>
                        </Card>

                        {/* General Settings */}
                        <Card title="Cài đặt Chung" style={{ marginBottom: 24 }}>
                            <Form.Item
                                name="allowSelfEnrollment"
                                label="Cho phép tự đăng ký"
                                extra="Nhân viên có thể tự đăng ký các khóa học public"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>

                            <Form.Item
                                name="showCourseProgress"
                                label="Hiển thị tiến độ"
                                extra="Hiển thị progress bar cho học viên"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                {/* Save Button */}
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                        Lưu cài đặt
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default SettingsPage;
