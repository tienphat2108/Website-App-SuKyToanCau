'use client';

import { useEffect } from 'react';

/**
 * Đăng ký service worker để đọc lại được những trang đã mở khi mất mạng.
 * Chỉ chạy ở bản phát hành: chế độ phát triển tải lại liên tục sẽ bị bộ nhớ đệm
 * của worker chen ngang.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    const register = (): void => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Trình duyệt chặn hoặc không hỗ trợ: website vẫn chạy bình thường.
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
