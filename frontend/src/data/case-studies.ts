import type { HistoricalEvent } from '@/core/models/HistoricalEvent';

/** Khóa chuẩn của Việt Nam trong kho dữ liệu sự kiện. */
export const VIETNAM_COUNTRY_KEY = 'Việt Nam';

/** Số hồ sơ hiển thị tối đa trên trang. */
const CASE_STUDY_LIMIT = 3;

/**
 * Danh sách hồ sơ chuyên sâu về Việt Nam, hiển thị khi người đọc chưa chọn
 * quốc gia nào hoặc chọn chính Việt Nam. Mỗi hồ sơ dùng lại nội dung và nguồn
 * tham khảo thật của bài viết gốc, không tạo dữ liệu riêng để tránh sai lệch
 * với phần chi tiết.
 */
export const VIETNAM_CASE_STUDY_SLUGS = [
  'cach-mang-thang-tam-1945',
  'chien-dich-dien-bien-phu',
  'xe-tang-tien-vao-dinh-doc-lap-1975',
  'doi-moi-1986',
] as const;

/** Khóa của một hồ sơ chuyên sâu về Việt Nam. */
export type CaseStudySlug = (typeof VIETNAM_CASE_STUDY_SLUGS)[number];

/**
 * Chọn danh sách hồ sơ hiển thị trên trang dựa trên quốc gia người đọc ưu tiên.
 * Không chọn quốc gia (hoặc chọn Việt Nam) thì luôn hiển thị các mốc quan trọng
 * của Việt Nam. Chọn quốc gia khác thì chỉ hiển thị sự kiện nổi bật của quốc
 * gia đó, không trộn với hồ sơ Việt Nam.
 * @param events Toàn bộ sự kiện trong kho dữ liệu.
 * @param preferredCountry Khóa quốc gia ưu tiên; chuỗi rỗng nghĩa là không chọn.
 * @returns Danh sách khóa hồ sơ theo thứ tự hiển thị.
 */
export function selectCaseStudySlugs(
  events: readonly HistoricalEvent[],
  preferredCountry: string,
): string[] {
  if (!preferredCountry || preferredCountry === VIETNAM_COUNTRY_KEY) {
    return [...VIETNAM_CASE_STUDY_SLUGS];
  }

  const preferred = events
    .filter((event) => event.country === preferredCountry)
    .sort(
      (left, right) =>
        Number(right.featured) - Number(left.featured) || left.startYear - right.startYear,
    )
    .slice(0, CASE_STUDY_LIMIT)
    .map((event) => event.slug);

  // Kho luôn có ít nhất một sự kiện cho mỗi quốc gia trong bộ chọn; nhánh này
  // chỉ giữ an toàn khi dữ liệu chưa đủ.
  if (preferred.length === 0) {
    return [...VIETNAM_CASE_STUDY_SLUGS];
  }

  return preferred;
}
