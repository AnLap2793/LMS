import { createDirectus, rest, authentication } from "@directus/sdk";

// Sử dụng biến môi trường cho Directus URL
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

// Custom storage implementation cho browser localStorage
const customStorage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  },
  delete: (key) => localStorage.removeItem(key),
};

// Khởi tạo Directus client với localStorage persistence và hỗ trợ cross-origin credentials
export const directus = createDirectus(DIRECTUS_URL)
  .with(
    authentication("json", {
      storage: customStorage,
      autoRefresh: true,
    })
  )
  .with(
    rest({
      onRequest: (options) => ({ ...options, credentials: "include" }),
    })
  );

export const getAssetUrl = (id) => {
  if (!id) return "";
  return `${DIRECTUS_URL}/assets/${id}`;
};

