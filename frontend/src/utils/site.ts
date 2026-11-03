/**
 * Cấu hình địa chỉ công khai của website.
 * Giá trị được cung cấp qua biến môi trường khi triển khai thật.
 */

const fallbackUrl = 'http://localhost:3000';

/** Địa chỉ gốc, không có dấu gạch chéo ở cuối. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl).replace(/\/+$/, '');

/** Hộp thư công khai nhận đóng góp của website. */
export const CONTACT_EMAIL = 'sukytoancau@gmail.com';

/**
 * Tạo liên kết soạn thư với tiêu đề điền sẵn.
 * @param subject Tiêu đề thư theo ngôn ngữ hiện tại.
 * @returns Địa chỉ `mailto:` đã mã hóa.
 */
export function contactMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Tạo địa chỉ tuyệt đối từ một đường dẫn nội bộ.
 * @param path Đường dẫn bắt đầu bằng dấu gạch chéo.
 * @returns Địa chỉ đầy đủ dùng cho thẻ meta, sơ đồ trang và JSON-LD.
 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
