/**
 * Directus Helper Functions
 * Các hàm tiện ích để làm việc với Directus
 */
// Lấy DIRECTUS_URL từ environment (Vite)
const DIRECTUS_URL = import.meta.env?.VITE_DIRECTUS_URL || '';
/**
 * Tạo URL cho asset từ Directus hoặc trả về URL đầy đủ nếu là URL từ internet
 * @param {string|object} asset - Asset ID, URL đầy đủ, hoặc object chứa id
 * @param {object} options - Tùy chọn transform (width, height, quality, fit, format) - chỉ áp dụng cho Directus assets
 * @returns {string|null} URL của asset hoặc null
 *
 * @example
 * // Basic usage với Directus asset
 * getAssetUrl('abc-123') // => https://directus.example.com/assets/abc-123
 *
 * // Với URL từ internet
 * getAssetUrl('https://images.unsplash.com/photo-123') // => https://images.unsplash.com/photo-123
 *
 * // With transforms (chỉ cho Directus assets)
 * getAssetUrl('abc-123', { width: 200, height: 200, fit: 'cover' })
 *
 * // With object
 * getAssetUrl({ id: 'abc-123' })
 */
export function getAssetUrl(asset, options = {}) {
    if (!asset) return null;

    // Nếu asset là object, lấy id
    const assetId = typeof asset === 'object' ? asset.id : asset;

    if (!assetId) return null;

    // Kiểm tra nếu là URL đầy đủ (http:// hoặc https://)
    if (typeof assetId === 'string' && (assetId.startsWith('http://') || assetId.startsWith('https://'))) {
        // Trả về URL trực tiếp, không áp dụng transforms
        return assetId;
    }

    // Xử lý Directus asset
    // Base URL
    let url = `${DIRECTUS_URL}/assets/${assetId}`;

    // Thêm query params nếu có options
    const params = new URLSearchParams();

    if (options.width) params.append('width', options.width);
    if (options.height) params.append('height', options.height);
    if (options.quality) params.append('quality', options.quality);
    if (options.fit) params.append('fit', options.fit); // cover, contain, inside, outside
    if (options.format) params.append('format', options.format); // webp, jpg, png

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}

/**
 * Tạo thumbnail URL với kích thước cố định
 * @param {string|object} asset - Asset ID hoặc object
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg' | 'xl'
 * @returns {string|null} URL của thumbnail
 */
export function getThumbnailUrl(asset, size = 'md') {
    const sizes = {
        sm: { width: 100, height: 100 },
        md: { width: 300, height: 200 },
        lg: { width: 600, height: 400 },
        xl: { width: 1200, height: 800 },
    };

    return getAssetUrl(asset, {
        ...sizes[size],
        fit: 'cover',
        quality: 80,
    });
}

/**
 * Tạo avatar URL
 * @param {string|object} asset - Asset ID hoặc object
 * @param {number} size - Kích thước avatar (default: 80)
 * @returns {string|null} URL của avatar
 */
export function getAvatarUrl(asset, size = 80) {
    return getAssetUrl(asset, {
        width: size,
        height: size,
        fit: 'cover',
    });
}

/**
 * Format tên đầy đủ từ first_name và last_name
 * @param {object} user - User object với first_name, last_name
 * @returns {string} Tên đầy đủ
 */
export function getFullName(user) {
    if (!user) return '';

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';

    return `${firstName} ${lastName}`.trim() || user.email || 'Người dùng';
}

// Alias for backward compatibility
export const getUserFullName = getFullName;

/**
 * Format thời lượng từ phút sang định dạng đọc được
 * @param {number} minutes - Số phút
 * @returns {string} Chuỗi định dạng (VD: "1h 30m" hoặc "45m")
 */
export function formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0m';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

/**
 * Format ngày tháng sang định dạng Việt Nam
 * @param {string|Date} date - Ngày cần format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Ngày đã format
 */
export function formatDate(date, options = {}) {
    if (!date) return '';

    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
    };

    try {
        return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(new Date(date));
    } catch {
        return '';
    }
}

/**
 * Format ngày giờ sang định dạng Việt Nam
 * @param {string|Date} date - Ngày cần format
 * @returns {string} Ngày giờ đã format
 */
export function formatDateTime(date) {
    return formatDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format thời gian tương đối (VD: "2 giờ trước")
 * @param {string|Date} date - Ngày cần format
 * @returns {string} Thời gian tương đối
 */
export function formatRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatDate(date);
}
