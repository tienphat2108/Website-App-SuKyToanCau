import vi from '@/locales/vi.json';
import en from '@/locales/en.json';
import { defaultLocale, isLocale, type Locale } from './config';

/**
 * Cấu trúc từ điển được suy ra từ tệp tiếng Việt.
 * Tệp tiếng Anh được kiểm tra có cùng khóa trong bộ kiểm thử.
 */
export type Dictionary = typeof vi;

const dictionaries: Record<Locale, Dictionary> = {
  vi,
  en: en as Dictionary,
};

/**
 * Lấy từ điển của một ngôn ngữ.
 * @param locale Mã ngôn ngữ; nếu không hợp lệ sẽ dùng tiếng Việt.
 * @returns Từ điển tương ứng.
 */
export function getDictionary(locale: Locale | string | undefined): Dictionary {
  return isLocale(locale) ? dictionaries[locale] : dictionaries[defaultLocale];
}

/**
 * Thay thế các biến dạng {ten} trong một chuỗi dịch.
 * @param template Chuỗi gốc có chứa biến.
 * @param values Bản đồ giá trị thay thế.
 * @returns Chuỗi đã thay thế, giữ nguyên biến nếu thiếu giá trị.
 */
export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
