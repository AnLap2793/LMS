import React from 'react';
import { Result, Button } from 'antd';

/**
 * Error Boundary Component
 * Bắt các lỗi JavaScript ở bất kỳ đâu trong cây component con
 * và hiển thị UI dự phòng thay vì làm crash toàn bộ ứng dụng
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log vào error reporting service
    console.error('Error Boundary caught:', error, errorInfo);
    
    // Gửi đến monitoring service (Sentry, LogRocket, etc.)
    // logErrorToService({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Oops! Có lỗi xảy ra"
          subTitle="Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại."
          extra={
            <Button type="primary" onClick={this.handleReset}>
              Tải lại trang
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

