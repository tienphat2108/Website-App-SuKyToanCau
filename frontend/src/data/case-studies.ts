/**
 * Danh sách hồ sơ chuyên sâu được tuyển chọn từ kho sự kiện.
 * Mỗi hồ sơ dùng lại nội dung và nguồn tham khảo thật của bài viết gốc,
 * không tạo dữ liệu riêng để tránh sai lệch với phần chi tiết.
 */
export const CASE_STUDY_SLUGS = [
  'cach-mang-thang-tam-1945',
  'chien-dich-dien-bien-phu',
  'doi-moi-1986',
] as const;

/** Khóa của một hồ sơ chuyên sâu. */
export type CaseStudySlug = (typeof CASE_STUDY_SLUGS)[number];
