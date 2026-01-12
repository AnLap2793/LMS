import { message, notification } from 'antd';

/**
 * Xử lý lỗi API từ Directus và hiển thị thông báo phù hợp
 * @param {Error} error - Đối tượng lỗi từ Directus SDK
 * @returns {Object} Đối tượng với status và message
 */
export function handleDirectusError(error) {
  const { response, message: errorMessage } = error;
  const status = response?.status;
  
  const errorMap = {
    400: 'Dữ liệu không hợp lệ',
    401: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
    403: 'Bạn không có quyền thực hiện thao tác này',
    404: 'Không tìm thấy dữ liệu',
    422: 'Dữ liệu không đúng định dạng',
    500: 'Lỗi server, vui lòng thử lại sau',
    503: 'Dịch vụ tạm thời không khả dụng',
  };
  
  const displayMessage = errorMap[status] || errorMessage || 'Có lỗi xảy ra';
  
  // Hiển thị thông báo lỗi
  if (status === 401) {
    notification.error({
      message: 'Phiên đăng nhập hết hạn',
      description: 'Vui lòng đăng nhập lại để tiếp tục',
      duration: 5,
    });
    // Chuyển hướng đến trang đăng nhập
    window.location.href = '/login';
  } else {
    message.error(displayMessage);
  }
  
  // Log vào console trong môi trường development
  if (import.meta.env.DEV) {
    console.error('Directus Error:', error);
  }
  
  // Log vào monitoring service (Sentry, LogRocket, etc.)
  // logErrorToService(error);
  
  return { status, message: displayMessage };
}

/**
 * Helper xử lý lỗi toàn cục - hiển thị thông báo lỗi
 * @param {string|Error} error - Thông báo lỗi hoặc đối tượng Error
 */
export function showError(error) {
  if (typeof error === 'string') {
    message.error(error);
  } else if (error?.message) {
    message.error(error.message);
  } else {
    message.error('Có lỗi xảy ra');
  }
}

/**
 * Hiển thị thông báo thành công
 * @param {string} msg - Thông báo thành công
 */
export function showSuccess(msg = 'Thành công!') {
  message.success(msg);
}

