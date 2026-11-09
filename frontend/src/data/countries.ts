import type { Locale } from '@/core/i18n/config';

/**
 * Một quốc gia hoặc khu vực có sự kiện trong kho dữ liệu.
 * Trường key dùng tên chuẩn tiếng Việt để lưu lựa chọn của người đọc,
 * nhờ đó lựa chọn không phụ thuộc vào ngôn ngữ đang xem.
 */
export interface CountryOption {
  /** Khóa chuẩn, trùng với tên tiếng Việt trong dữ liệu sự kiện. */
  key: string;
  /** Tên hiển thị tiếng Việt. */
  vi: string;
  /** Tên hiển thị tiếng Anh. */
  en: string;
}

/** Danh mục quốc gia và khu vực, sắp xếp theo tên tiếng Việt. */
export const COUNTRY_OPTIONS: CountryOption[] = [
  { key: 'Ả Rập Xê Út', vi: 'Ả Rập Xê Út', en: 'Saudi Arabia' },
  { key: 'Afghanistan', vi: 'Afghanistan', en: 'Afghanistan' },
  { key: 'Ai Cập', vi: 'Ai Cập', en: 'Egypt' },
  { key: 'Anh', vi: 'Anh', en: 'United Kingdom' },
  { key: 'Argentina', vi: 'Argentina', en: 'Argentina' },
  { key: 'Ấn Độ', vi: 'Ấn Độ', en: 'India' },
  { key: 'Ba Lan', vi: 'Ba Lan', en: 'Poland' },
  { key: 'Babylon', vi: 'Babylon', en: 'Babylonia' },
  { key: 'Bồ Đào Nha', vi: 'Bồ Đào Nha', en: 'Portugal' },
  { key: 'Brasil', vi: 'Brasil', en: 'Brazil' },
  { key: 'Campuchia', vi: 'Campuchia', en: 'Cambodia' },
  { key: 'Canada', vi: 'Canada', en: 'Canada' },
  { key: 'Chile', vi: 'Chile', en: 'Chile' },
  { key: 'Cuba', vi: 'Cuba', en: 'Cuba' },
  { key: 'Đức', vi: 'Đức', en: 'Germany' },
  { key: 'Ethiopia', vi: 'Ethiopia', en: 'Ethiopia' },
  { key: 'Ghana', vi: 'Ghana', en: 'Ghana' },
  { key: 'Hà Lan', vi: 'Hà Lan', en: 'Netherlands' },
  { key: 'Haiti', vi: 'Haiti', en: 'Haiti' },
  { key: 'Hàn Quốc', vi: 'Hàn Quốc', en: 'South Korea' },
  { key: 'Hoa Kỳ', vi: 'Hoa Kỳ', en: 'United States' },
  { key: 'Hy Lạp', vi: 'Hy Lạp', en: 'Greece' },
  { key: 'Indonesia', vi: 'Indonesia', en: 'Indonesia' },
  { key: 'Iran', vi: 'Iran', en: 'Iran' },
  { key: 'Iraq', vi: 'Iraq', en: 'Iraq' },
  { key: 'Ireland', vi: 'Ireland', en: 'Ireland' },
  { key: 'Israel', vi: 'Israel', en: 'Israel' },
  { key: 'Kenya', vi: 'Kenya', en: 'Kenya' },
  { key: 'Liên Xô', vi: 'Liên Xô', en: 'Soviet Union' },
  { key: 'Mali', vi: 'Mali', en: 'Mali' },
  { key: 'Mexico', vi: 'Mexico', en: 'Mexico' },
  { key: 'Mông Cổ', vi: 'Mông Cổ', en: 'Mongolia' },
  { key: 'Myanmar', vi: 'Myanmar', en: 'Myanmar' },
  { key: 'Nam Phi', vi: 'Nam Phi', en: 'South Africa' },
  { key: 'New Zealand', vi: 'New Zealand', en: 'New Zealand' },
  { key: 'Nga', vi: 'Nga', en: 'Russia' },
  { key: 'Nhật Bản', vi: 'Nhật Bản', en: 'Japan' },
  { key: 'Nigeria', vi: 'Nigeria', en: 'Nigeria' },
  { key: 'Panama', vi: 'Panama', en: 'Panama' },
  { key: 'Peru', vi: 'Peru', en: 'Peru' },
  { key: 'Pháp', vi: 'Pháp', en: 'France' },
  { key: 'Philippines', vi: 'Philippines', en: 'Philippines' },
  { key: 'Rwanda', vi: 'Rwanda', en: 'Rwanda' },
  { key: 'Singapore', vi: 'Singapore', en: 'Singapore' },
  { key: 'Syria', vi: 'Syria', en: 'Syria' },
  { key: 'Tây Á', vi: 'Tây Á', en: 'West Asia' },
  { key: 'Tây Ban Nha', vi: 'Tây Ban Nha', en: 'Spain' },
  { key: 'Thái Lan', vi: 'Thái Lan', en: 'Thailand' },
  { key: 'Thổ Nhĩ Kỳ', vi: 'Thổ Nhĩ Kỳ', en: 'Türkiye' },
  { key: 'Thụy Điển', vi: 'Thụy Điển', en: 'Sweden' },
  { key: 'Toàn cầu', vi: 'Toàn cầu', en: 'Global' },
  { key: 'Trung Quốc', vi: 'Trung Quốc', en: 'China' },
  { key: 'Úc', vi: 'Úc', en: 'Australia' },
  { key: 'Ukraina', vi: 'Ukraina', en: 'Ukraine' },
  { key: 'Việt Nam', vi: 'Việt Nam', en: 'Vietnam' },
  { key: 'Vùng Đất Thánh', vi: 'Vùng Đất Thánh', en: 'Holy Land' },
  { key: 'Ý', vi: 'Ý', en: 'Italy' },
];

/** Tra cứu nhanh một quốc gia theo khóa chuẩn. */
export const COUNTRY_BY_KEY: Map<string, CountryOption> = new Map(
  COUNTRY_OPTIONS.map((country) => [country.key, country]),
);

/** Tập khóa hợp lệ dùng để kiểm tra cookie lựa chọn quốc gia. */
export const COUNTRY_KEYS: Set<string> = new Set(COUNTRY_OPTIONS.map((country) => country.key));

/**
 * Lấy tên hiển thị của một quốc gia theo ngôn ngữ.
 * @param key Khóa chuẩn của quốc gia.
 * @param locale Ngôn ngữ cần hiển thị.
 * @returns Tên quốc gia hoặc chuỗi rỗng nếu khóa không hợp lệ.
 */
export function countryLabel(key: string | undefined | null, locale: Locale): string {
  if (!key) {
    return '';
  }

  const country = COUNTRY_BY_KEY.get(key);

  if (!country) {
    return '';
  }

  return locale === 'en' ? country.en : country.vi;
}
