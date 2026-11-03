/**
 * Cấu hình đa ngôn ngữ dùng chung cho phía máy chủ và trình duyệt.
 * Tiếng Việt là ngôn ngữ mặc định, tiếng Anh được truy cập qua tiền tố /en.
 */

export const locales = ['vi', 'en'] as const;

/** Kiểu ngôn ngữ được hỗ trợ. */
export type Locale = (typeof locales)[number];

/** Ngôn ngữ mặc định của website. */
export const defaultLocale: Locale = 'vi';

/** Nhãn hiển thị của từng ngôn ngữ. */
export const localeLabels: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

/** Thẻ ngôn ngữ dùng cho thuộc tính lang của HTML. */
export const htmlLang: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en',
};

/**
 * Kiểm tra một giá trị có phải mã ngôn ngữ hợp lệ hay không.
 * @param value Giá trị cần kiểm tra.
 * @returns Đúng nếu là 'vi' hoặc 'en'.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/**
 * Ghép đường dẫn với tiền tố ngôn ngữ.
 * Tiếng Việt giữ đường dẫn gốc, tiếng Anh thêm /en.
 * @param locale Ngôn ngữ đích.
 * @param path Đường dẫn nội bộ bắt đầu bằng dấu gạch chéo.
 * @returns Đường dẫn đã bản địa hóa.
 */
export function localizePath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (locale === defaultLocale) {
    return normalized;
  }

  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}

/**
 * Bỏ tiền tố ngôn ngữ khỏi đường dẫn hiện tại.
 * @param pathname Đường dẫn đầy đủ trên trình duyệt.
 * @returns Đường dẫn không có tiền tố /en.
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') {
    return '/';
  }

  if (pathname.startsWith('/en/')) {
    return pathname.slice(3);
  }

  return pathname;
}

/**
 * Xác định ngôn ngữ từ đường dẫn.
 * @param pathname Đường dẫn cần xét.
 * @returns Ngôn ngữ tương ứng.
 */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : defaultLocale;
}
