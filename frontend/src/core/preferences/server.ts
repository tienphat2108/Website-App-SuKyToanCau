import 'server-only';

import { cookies } from 'next/headers';
import { COUNTRY_KEYS } from '@/data/countries';
import { PREFERRED_COUNTRY_COOKIE } from '@/utils/preferred-country';

/**
 * Đọc quốc gia hoặc khu vực người đọc đã chọn từ cookie.
 * Giá trị chỉ được chấp nhận khi khớp danh mục quốc gia trong dữ liệu,
 * nhờ đó cookie bị sửa thủ công không thể làm sai lệch thứ tự hiển thị.
 * @returns Khóa quốc gia hợp lệ hoặc chuỗi rỗng.
 */
export async function getPreferredCountry(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PREFERRED_COUNTRY_COOKIE)?.value;

  if (!raw) {
    return '';
  }

  try {
    const decoded = decodeURIComponent(raw);
    return COUNTRY_KEYS.has(decoded) ? decoded : '';
  } catch {
    return '';
  }
}
