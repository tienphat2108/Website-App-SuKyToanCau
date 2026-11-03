import credits from './image-credits.json';
import type { Locale } from '@/core/i18n/config';

/**
 * Thông tin ghi nguồn của một ảnh tư liệu.
 * Các trường này do quá trình thu thập ảnh điền vào và không nằm trong dữ liệu
 * sự kiện của máy chủ, nên được tách riêng để tránh làm thay đổi hợp đồng API.
 */
export type ImageCredit = {
  /** Tên tệp trong thư mục `public/images/events`. */
  file: string;
  /** Tác giả hoặc tổ chức tạo ra ảnh. */
  author: string;
  /** Tên giấy phép như Wikimedia ghi nhận. */
  license: string;
  /** Địa chỉ trang giải thích giấy phép, có thể rỗng. */
  licenseUrl: string;
  /** Địa chỉ trang mô tả tệp trên Wikimedia Commons. */
  sourceUrl: string;
};

const CREDITS = credits as Record<string, ImageCredit>;

/**
 * Lấy thông tin ghi nguồn theo khóa sự kiện.
 * @param slug Khóa sự kiện, ví dụ `nha-nuoc-van-lang`.
 * @returns Thông tin ghi nguồn hoặc undefined nếu chưa có.
 */
export function getImageCredit(slug: string): ImageCredit | undefined {
  return CREDITS[slug];
}

/**
 * Đổi tên giấy phép sang dạng thân thiện với người đọc.
 * Các giấy phép Creative Commons giữ nguyên ký hiệu quốc tế; riêng "Public domain"
 * được dịch để người đọc tiếng Việt hiểu ngay.
 * @param credit Thông tin ghi nguồn.
 * @param locale Ngôn ngữ hiển thị.
 * @returns Nhãn giấy phép.
 */
export function licenseLabel(credit: ImageCredit, locale: Locale): string {
  if (credit.license === 'Public domain') {
    return locale === 'vi' ? 'Phạm vi công cộng' : 'Public domain';
  }

  return credit.license;
}
