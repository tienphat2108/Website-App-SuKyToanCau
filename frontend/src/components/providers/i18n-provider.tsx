'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { defaultLocale, htmlLang, localeFromPath, localeLabels, type Locale } from '@/core/i18n/config';
import { getDictionary, type Dictionary } from '@/core/i18n/dictionary';

/** Giá trị ngữ cảnh đa ngôn ngữ dùng cho các thành phần tương tác. */
interface I18nContextValue {
  /** Ngôn ngữ hiện tại. */
  locale: Locale;
  /** Từ điển tương ứng. */
  dictionary: Dictionary;
  /** Mã ngôn ngữ dùng cho thuộc tính lang. */
  lang: string;
  /** Nhãn hiển thị của ngôn ngữ. */
  label: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Cung cấp ngôn ngữ và từ điển cho toàn bộ cây thành phần phía trình duyệt.
 * Từ điển được chọn từ mã ngôn ngữ nên không cần truyền qua nhiều tầng props.
 *
 * Ở phía trình duyệt, đường dẫn công khai là nguồn xác định ngôn ngữ: khi người đọc
 * đổi ngôn ngữ bằng điều hướng mềm, đường dẫn đổi ngay nên thanh điều hướng và các
 * thành phần tương tác đổi theo mà không phải tải lại toàn trang.
 * @param props.locale Ngôn ngữ do máy chủ xác định, dùng khi chưa đọc được đường dẫn.
 * @param props.children Cây giao diện con.
 */
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeLocale = pathname ? localeFromPath(pathname) : locale;

  // Đổi ngôn ngữ bằng điều hướng mềm không dựng lại thẻ html, nên cập nhật thuộc tính
  // lang theo ngôn ngữ đang hiển thị để trình đọc màn hình và công cụ tìm kiếm đọc đúng.
  useEffect(() => {
    document.documentElement.lang = htmlLang[activeLocale] ?? htmlLang[defaultLocale];
  }, [activeLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: activeLocale,
      dictionary: getDictionary(activeLocale),
      lang: htmlLang[activeLocale] ?? htmlLang[defaultLocale],
      label: localeLabels[activeLocale] ?? localeLabels[defaultLocale],
    }),
    [activeLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Đọc ngữ cảnh đa ngôn ngữ trong thành phần phía trình duyệt.
 * @returns Ngôn ngữ, từ điển và nhãn hiển thị.
 * @throws Error khi thành phần được dùng ngoài I18nProvider.
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n phải được dùng bên trong I18nProvider.');
  }

  return context;
}
