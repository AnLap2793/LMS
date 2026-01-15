import { createDirectus, rest, authentication } from '@directus/sdk';

// Sử dụng biến môi trường cho Directus URL
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

// Storage key cho localStorage
const STORAGE_KEY = 'directus-auth';

/**
 * Custom Storage class cho Directus SDK v20
 * Theo documentation: https://docs.directus.io/guides/connect/sdk.html
 * - get() trả về AuthData object (không có key parameter)
 * - set(data) lưu AuthData object (không có key parameter)
 */
class AuthStorage {
    get() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    set(data) {
        if (data === null) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }
}

// Khởi tạo Directus client với localStorage persistence
export const directus = createDirectus(DIRECTUS_URL)
    .with(
        authentication('json', {
            storage: new AuthStorage(),
            autoRefresh: true,
        })
    )
    .with(
        rest({
            onRequest: options => ({ ...options, credentials: 'include' }),
        })
    );

export const getAssetUrl = id => {
    if (!id) return '';
    return `${DIRECTUS_URL}/assets/${id}`;
};
