import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Cấu hình kiểm thử phía giao diện.
 * Môi trường jsdom cho phép kiểm tra thành phần React và bộ nhớ cục bộ;
 * bí danh @ trỏ về thư mục src giống cấu hình TypeScript.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
