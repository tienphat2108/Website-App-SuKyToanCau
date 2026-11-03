/**
 * Mã khóa lưu lựa chọn giao diện trong bộ nhớ cục bộ.
 * Giá trị hợp lệ: 'light' hoặc 'dark'.
 */
export const THEME_STORAGE_KEY = 'wh-theme';

/**
 * Đoạn mã chạy trước khi React khởi tạo để áp dụng giao diện đã lưu.
 * Nhờ vậy trang không bị nháy sáng khi người đọc chọn giao diện tối.
 * Đoạn mã được đặt trong thẻ script nội tuyến, đã được CSP cho phép.
 */
export function ThemeScript() {
  const script = `(function(){try{var key='${THEME_STORAGE_KEY}';var saved=localStorage.getItem(key);var dark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var root=document.documentElement;root.classList.toggle('dark',dark);root.dataset.theme=dark?'dark':'light';}catch(error){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
