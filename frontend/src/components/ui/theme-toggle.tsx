'use client';

import { useEffect, useRef } from 'react';
import { THEME_STORAGE_KEY } from '@/components/providers/theme-script';
import { useI18n } from '@/components/providers/i18n-provider';

/**
 * Nút chuyển giữa giao diện sáng và tối.
 *
 * Trạng thái thật nằm ở lớp `dark` trên thẻ html do đoạn mã khởi tạo gắn sẵn.
 * Nhờ đọc trực tiếp lớp này khi bấm, nút không cần trạng thái React và tránh
 * hiện tượng lệch giao diện giữa máy chủ và trình duyệt.
 *
 * Hai biểu tượng mặt trăng và mặt trời xếp chồng trong một ô nên pha đổi chỗ chạy
 * bằng chuyển động thuần CSS (lớp theme-toggle-glyph trong tệp kiểu chung), không cần
 * thêm trạng thái nào cho hoạt ảnh.
 */
export function ThemeToggle() {
  const { dictionary } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Gán trạng thái sáng/tối cho nút để trình đọc màn hình đọc được.
   * @param isDark Lớp `dark` có đang bật trên thẻ html hay không.
   * @returns Không trả về giá trị.
   */
  const syncPressed = (isDark: boolean): void => {
    buttonRef.current?.setAttribute('aria-pressed', String(isDark));
  };

  // Lớp `dark` do đoạn mã khởi tạo gắn trước khi React kịp tải, nên trạng thái
  // được đọc trực tiếp từ DOM ngay sau khi nạp để không lệch với hình đang thấy.
  useEffect(() => {
    syncPressed(document.documentElement.classList.contains('dark'));
  }, []);

  /**
   * Đảo giao diện hiện tại, cập nhật lớp html và ghi lựa chọn vào bộ nhớ cục bộ.
   * @returns Không trả về giá trị.
   */
  const handleToggle = (): void => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    root.dataset.theme = isDark ? 'dark' : 'light';
    syncPressed(isDark);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Trình duyệt chặn lưu trữ: giao diện vẫn đổi trong phiên hiện tại.
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-accent/50 hover:bg-raised"
      aria-label={dictionary.a11y.toggleTheme}
      title={dictionary.common.theme}
    >
      <span className="theme-toggle-stack h-[18px] w-[18px]" aria-hidden="true">
        <svg
          className="theme-toggle-glyph theme-toggle-glyph--moon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg
          className="theme-toggle-glyph theme-toggle-glyph--sun"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  );
}
