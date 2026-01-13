import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Cho phép truy cập từ network
    strictPort: false, // Tự động chọn port khác nếu 5173 đã được sử dụng
    cors: true, // Cho phép CORS để tránh lỗi khi truy cập từ thiết bị khác
  },
})
