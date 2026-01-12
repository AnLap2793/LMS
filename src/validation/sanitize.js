/**
 * Sanitize nội dung HTML để ngăn chặn XSS attacks
 * 
 * Sử dụng DOMPurify nếu có, fallback về basic sanitization nếu không có.
 * 
 * Để sử dụng DOMPurify trong production:
 * npm install dompurify
 * 
 * @param {string} content - Nội dung HTML cần sanitize
 * @param {Object} options - Tùy chọn sanitization
 * @param {Array<string>} options.allowedTags - Danh sách tags được phép (chỉ khi dùng DOMPurify)
 * @param {Array<string>} options.allowedAttributes - Danh sách attributes được phép (chỉ khi dùng DOMPurify)
 * @returns {string} HTML đã được sanitize
 */
export function sanitizeHTML(content, options = {}) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Thử sử dụng DOMPurify nếu có
  try {
    // Dynamic import để tránh lỗi nếu DOMPurify chưa được cài đặt
    const DOMPurify = require('dompurify');
    
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      const sanitizeOptions = {
        ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: options.allowedAttributes || ['href', 'target', 'rel'],
      };
      
      return DOMPurify.sanitize(content, sanitizeOptions);
    }
  } catch (error) {
    // DOMPurify không có sẵn, fallback về basic sanitization
    console.warn('DOMPurify not available, using basic sanitization:', error.message);
  }
  
  // Fallback: Basic sanitization - Escape tất cả HTML tags bằng cách chuyển thành text
  // Đây là an toàn nhưng loại bỏ tất cả định dạng HTML
  const div = document.createElement('div');
  div.textContent = content;
  return div.innerHTML;
}

