/** Tên cookie ghi nhớ quốc gia hoặc khu vực người đọc ưu tiên. */
export const PREFERRED_COUNTRY_COOKIE = 'wh-country';

/** Thời hạn ghi nhớ lựa chọn, tính bằng giây (một năm). */
export const PREFERRED_COUNTRY_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Lưu lựa chọn quốc gia vào cookie để máy chủ sắp xếp nội dung ở lần tải tiếp theo.
 * Giá trị rỗng sẽ xóa lựa chọn đã lưu.
 * @param countryKey Khóa chuẩn của quốc gia hoặc chuỗi rỗng để bỏ ưu tiên.
 * @returns Không trả về giá trị.
 */
export function writePreferredCountry(countryKey: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (!countryKey) {
    document.cookie = `${PREFERRED_COUNTRY_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${PREFERRED_COUNTRY_COOKIE}=${encodeURIComponent(countryKey)}; Max-Age=${PREFERRED_COUNTRY_MAX_AGE}; Path=/; SameSite=Lax`;
}

/**
 * Xóa lựa chọn quốc gia đã lưu.
 * @returns Không trả về giá trị.
 */
export function clearPreferredCountry(): void {
  writePreferredCountry('');
}

/**
 * Sắp xếp danh sách để sự kiện của quốc gia ưu tiên đứng trước nhưng vẫn giữ
 * thứ tự tương đối của các phần tử còn lại.
 * @param items Danh sách nguồn.
 * @param getCountry Hàm lấy khóa quốc gia của một phần tử.
 * @param preferred Khóa quốc gia ưu tiên; chuỗi rỗng nghĩa là không ưu tiên.
 * @returns Mảng mới đã sắp xếp.
 */
export function sortByPreferredCountry<T>(
  items: readonly T[],
  getCountry: (item: T) => string,
  preferred: string,
): T[] {
  if (!preferred) {
    return [...items];
  }

  return [...items].sort(
    (left, right) =>
      Number(getCountry(right) === preferred) - Number(getCountry(left) === preferred),
  );
}
