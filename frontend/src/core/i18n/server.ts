import 'server-only';

import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary, type Dictionary } from './dictionary';

/** Tên cookie ghi nhớ ngôn ngữ. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/**
 * Đọc ngôn ngữ hiện tại từ tiêu đề do middleware gắn vào hoặc từ cookie.
 * @returns Mã ngôn ngữ đang dùng.
 */
export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const fromHeader = headerStore.get('x-locale');

  if (isLocale(fromHeader)) {
    return fromHeader;
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;

  return isLocale(fromCookie) ? fromCookie : defaultLocale;
}

/**
 * Lấy cả ngôn ngữ và từ điển trong một lần gọi.
 * @returns Đối tượng chứa ngôn ngữ và từ điển tương ứng.
 */
export async function getI18n(): Promise<{ locale: Locale; dictionary: Dictionary }> {
  const locale = await getLocale();
  return { locale, dictionary: getDictionary(locale) };
}
