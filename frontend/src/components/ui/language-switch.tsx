'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/i18n-provider';
import { localeLabels, locales, stripLocalePrefix, type Locale } from '@/core/i18n/config';
import { cn } from '@/utils/format';

/**
 * Tạo đường dẫn công khai cho một ngôn ngữ từ đường dẫn nội bộ.
 * @param locale Ngôn ngữ đích.
 * @param path Đường dẫn nội bộ không có tiền tố /en.
 * @returns Đường dẫn đầy đủ để điều hướng.
 */
function buildLocaleHref(locale: Locale, path: string): string {
  if (locale === 'vi') {
    return path || '/';
  }

  return path === '/' ? '/en' : `/en${path}`;
}

/**
 * Cụm liên kết chuyển ngôn ngữ.
 * Đường dẫn hiện tại được giữ nguyên, chỉ thay đổi tiền tố ngôn ngữ.
 * @param props.compact Hiển thị gọn cho thanh điều hướng trên thiết bị di động.
 */
export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, dictionary } = useI18n();
  const pathname = usePathname();
  const internalPath = stripLocalePrefix(pathname || '/');

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1',
        compact && 'justify-center',
      )}
      role="group"
      aria-label={dictionary.a11y.changeLanguage}
    >
      {locales.map((item) => {
        const isActive = item === locale;
        const href = buildLocaleHref(item, internalPath);

        return (
          <Link
            key={item}
            href={href}
            hrefLang={item}
            scroll={false}
            // Tắt tải trước: middleware viết lại /en về cùng cây trang, nên bản tải trước
            // có thể dính nội dung ngôn ngữ cũ và hiện lẫn hai thứ tiếng khi bấm.
            prefetch={false}
            aria-current={isActive ? 'true' : undefined}
            // Giữ vị trí cuộn khi đổi ngôn ngữ để người đọc không bị đưa về đầu trang.
            onClick={(event) => {
              if (isActive) {
                event.preventDefault();
              }
            }}
            className={cn(
              'press rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold',
              isActive ? 'bg-accent text-white' : 'text-muted hover:text-ink',
            )}
            title={localeLabels[item]}
          >
            {item.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
