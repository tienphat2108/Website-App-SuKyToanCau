'use client';

import { useEffect } from 'react';

/**
 * Chặn công cụ kiểm tra của trình duyệt ở lớp trang web.
 *
 * Phải ghi rõ: đây là rào cản mềm, không phải biện pháp bảo mật. F12,
 * Ctrl+Shift+I và Ctrl+U là phím tắt cấp trình duyệt, người biết nghề vẫn mở
 * được DevTools qua menu, qua cửa sổ khác hoặc bằng cách tắt JavaScript. Ở đây
 * chặn phím tắt khi có thể và tắt menu chuột phải trên toàn trang để người dùng
 * thường không mở nhầm công cụ kiểm tra. Đổi lại, chuột phải không còn dùng để
 * sao chép, lưu ảnh hay mở liên kết trong tab mới được nữa; bôi đen rồi Ctrl+C,
 * phím Tab/Enter và chuột giữa vẫn giữ nguyên.
 */
const DEV_TOOLS_KEYS = new Set(['i', 'j', 'c']);

export function DevToolsGuard() {
  useEffect(() => {
    const isDevToolsShortcut = (event: KeyboardEvent): boolean => {
      if (event.key === 'F12') return true;

      const key = event.key.toLowerCase();

      if (event.ctrlKey && event.shiftKey) return DEV_TOOLS_KEYS.has(key);

      // macOS dùng Cmd+Option+C/I/J cho công cụ kiểm tra.
      if (event.ctrlKey && !event.altKey && !event.shiftKey && key === 'u') return true;
      if (event.metaKey && event.altKey && DEV_TOOLS_KEYS.has(key)) return true;

      return false;
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isDevToolsShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, []);

  return null;
}
