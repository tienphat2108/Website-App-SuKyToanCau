/**
 * Các tiện ích định dạng dùng chung cho giao diện.
 */

import type { Locale } from '@/core/i18n/config';

/**
 * Ghép các lớp CSS, bỏ qua giá trị rỗng.
 * @param classes Danh sách lớp.
 * @returns Chuỗi lớp đã ghép.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Định dạng số theo ngôn ngữ.
 * @param value Số cần định dạng.
 * @param locale Ngôn ngữ hiển thị.
 * @returns Chuỗi số có phân cách.
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(value);
}

/**
 * Định dạng năm lịch sử, bao gồm năm trước Công nguyên.
 * @param year Năm, giá trị âm là trước Công nguyên.
 * @param locale Ngôn ngữ hiển thị.
 * @returns Chuỗi năm thân thiện.
 */
export function formatHistoricalYear(year: number, locale: Locale): string {
  if (year < 0) {
    return locale === 'vi' ? `${Math.abs(year)} TCN` : `${Math.abs(year)} BCE`;
  }

  return String(year);
}

/**
 * Định dạng khoảng thời gian của một sự kiện.
 * @param startYear Năm bắt đầu.
 * @param endYear Năm kết thúc, có thể null.
 * @param locale Ngôn ngữ hiển thị.
 * @returns Chuỗi năm hoặc khoảng năm.
 */
export function formatYearRange(
  startYear: number,
  endYear: number | null,
  locale: Locale,
): string {
  const start = formatHistoricalYear(startYear, locale);

  if (!endYear || endYear === startYear) {
    return start;
  }

  return `${start} – ${formatHistoricalYear(endYear, locale)}`;
}

/**
 * Chuẩn hóa văn bản tiếng Việt để tìm kiếm không phân biệt chữ hoa và dấu thanh.
 *
 * Chuỗi được tách dấu theo dạng Unicode tổ hợp (NFD), bỏ các dấu kết hợp và quy đổi
 * chữ đ/Đ về d. Nhờ vậy người đọc có thể gõ "bach dang" và vẫn tìm được "Bạch Đằng".
 * @param value Văn bản gốc.
 * @returns Văn bản đã bỏ dấu và chuyển thành chữ thường.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi');
}

/**
 * Ước lượng thời gian đọc dựa trên số từ.
 * @param paragraphs Các đoạn nội dung.
 * @returns Số phút đọc tối thiểu là một.
 */
export function readingTime(paragraphs: string[]): number {
  const words = paragraphs.join(' ').trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Rút gọn văn bản theo số ký tự, cắt ở ranh giới từ.
 * @param text Văn bản gốc.
 * @param maxLength Độ dài tối đa.
 * @returns Văn bản đã rút gọn.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

/**
 * Lấy chữ cái đầu của tên để làm ảnh đại diện dự phòng.
 * @param name Họ tên.
 * @returns Tối đa hai chữ cái đầu.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Mã hóa nội dung JSON-LD để tránh chèn thẻ đóng script.
 * @param data Đối tượng cần tuần tự hóa.
 * @returns Chuỗi JSON an toàn.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Tạo liên kết chia sẻ mạng xã hội cho một bài viết.
 * @param url Địa chỉ tuyệt đối của bài viết.
 * @param title Tiêu đề bài viết.
 * @returns Liên kết Facebook và X.
 */
export function createShareLinks(url: string, title: string): {
  facebook: string;
  x: string;
} {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };
}
