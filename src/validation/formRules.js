import { VALIDATION, VALIDATION_PATTERNS } from '../constants/app';

/**
 * Form validation rules cho Ant Design Form
 *
 * Các rules này tuân theo định dạng của Ant Design Form.Item rules prop.
 * Tham khảo: https://ant.design/components/form#Rule
 *
 * Pattern sử dụng:
 * ```jsx
 * import { emailRules, passwordRules } from '../validation/formRules';
 *
 * <Form.Item name="email" rules={emailRules}>
 *   <Input />
 * </Form.Item>
 * ```
 */

/**
 * Validation rules cho email
 */
export const emailRules = [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email', message: 'Email không hợp lệ' },
    { max: VALIDATION.MAX_EMAIL_LENGTH, message: `Email tối đa ${VALIDATION.MAX_EMAIL_LENGTH} ký tự` },
];

/**
 * Validation rules cho mật khẩu
 */
export const passwordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu' },
    {
        min: VALIDATION.MIN_PASSWORD_LENGTH,
        message: `Mật khẩu tối thiểu ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`,
    },
    {
        max: VALIDATION.MAX_PASSWORD_LENGTH,
        message: `Mật khẩu tối đa ${VALIDATION.MAX_PASSWORD_LENGTH} ký tự`,
    },
];

/**
 * Validation rules cho tên
 */
export const nameRules = [
    { required: true, message: 'Vui lòng nhập họ tên' },
    {
        min: VALIDATION.MIN_NAME_LENGTH,
        message: `Họ tên phải có ít nhất ${VALIDATION.MIN_NAME_LENGTH} ký tự`,
    },
    {
        max: VALIDATION.MAX_NAME_LENGTH,
        message: `Họ tên tối đa ${VALIDATION.MAX_NAME_LENGTH} ký tự`,
    },
];

/**
 * Validation rules cho số điện thoại
 */
export const phoneRules = [
    { required: true, message: 'Vui lòng nhập số điện thoại' },
    {
        pattern: VALIDATION_PATTERNS.PHONE,
        message: 'Số điện thoại không hợp lệ (10-11 chữ số)',
    },
];

/**
 * Validation rules cho URL
 */
export const urlRules = [
    { required: true, message: 'Vui lòng nhập URL' },
    {
        pattern: VALIDATION_PATTERNS.URL,
        message: 'URL không hợp lệ (phải bắt đầu với http:// hoặc https://)',
    },
];

/**
 * Validation rules cho form đăng nhập
 */
export const loginRules = {
    email: emailRules,
    password: passwordRules,
};

/**
 * Validation rules cho xác nhận mật khẩu (dùng trong form đăng ký)
 * @param {string} fieldName - Tên field mật khẩu gốc để so sánh (mặc định: 'password')
 */
export const confirmPasswordRules = (fieldName = 'password') => [
    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
    ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue(fieldName) === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
        },
    }),
];

/**
 * Validation rules cho form đăng ký
 */
export const registerRules = {
    firstName: [
        { required: true, message: 'Vui lòng nhập họ' },
        {
            min: VALIDATION.MIN_NAME_LENGTH,
            message: `Họ phải có ít nhất ${VALIDATION.MIN_NAME_LENGTH} ký tự`,
        },
        {
            max: VALIDATION.MAX_NAME_LENGTH,
            message: `Họ tối đa ${VALIDATION.MAX_NAME_LENGTH} ký tự`,
        },
    ],
    lastName: [
        { required: true, message: 'Vui lòng nhập tên' },
        {
            min: VALIDATION.MIN_NAME_LENGTH,
            message: `Tên phải có ít nhất ${VALIDATION.MIN_NAME_LENGTH} ký tự`,
        },
        {
            max: VALIDATION.MAX_NAME_LENGTH,
            message: `Tên tối đa ${VALIDATION.MAX_NAME_LENGTH} ký tự`,
        },
    ],
    email: emailRules,
    password: passwordRules,
    confirmPassword: confirmPasswordRules('password'),
};

/**
 * Validation rules cho form quên mật khẩu
 */
export const forgotPasswordRules = {
    email: emailRules,
};

/**
 * Validation rules cho form đặt lại mật khẩu
 */
export const resetPasswordRules = {
    password: passwordRules,
    confirmPassword: confirmPasswordRules('password'),
};

/**
 * Validation rules cho form user
 */
export const userRules = {
    name: nameRules,
    email: emailRules,
    phone: phoneRules,
};

/**
 * Validation rules cho form Course
 */
export const courseRules = {
    title: [
        { required: true, message: 'Vui lòng nhập tên khóa học' },
        { min: 5, message: 'Tên khóa học phải có ít nhất 5 ký tự' },
        { max: 200, message: 'Tên khóa học tối đa 200 ký tự' },
    ],
    // Các trường khác có thể thêm sau nếu cần
};

// Export các rules cũ để backward compatibility (có thể xóa sau)
export const emailSchema = emailRules;
export const passwordSchema = passwordRules;
export const nameSchema = nameRules;
export const phoneSchema = phoneRules;
export const urlSchema = urlRules;
export const loginSchema = loginRules;
export const userSchema = userRules;
