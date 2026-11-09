'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { CountryPreference } from '@/components/preferences/country-preference';
import { BrandMark } from '@/components/ui/brand-mark';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { localizePath, stripLocalePrefix } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { cn } from '@/utils/format';

/** Một mục trong thanh điều hướng chính. */
interface NavItem {
  /** Khóa từ điển của nhãn. */
  key:
    | 'home'
    | 'timeline'
    | 'collections'
    | 'onThisDay'
    | 'stories'
    | 'updates'
    | 'about'
    | 'faq'
    | 'contribute'
    | 'study';
  /** Đường dẫn nội bộ. */
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'timeline', href: '/timeline' },
  { key: 'collections', href: '/collections' },
  { key: 'onThisDay', href: '/on-this-day' },
  { key: 'stories', href: '/stories' },
  { key: 'updates', href: '/updates' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
];

/**
 * Thanh điều hướng chính.
 *
 * Thanh gồm dải thông tin mỏng phía trên, hàng điều hướng dính đầu trang và bảng
 * mở rộng cho thiết bị nhỏ. Một đường tiến trình màu son chạy dưới chân thanh để
 * người đọc biết mình đã đi được bao xa trong trang.
 * @param props.preferredCountry Quốc gia hoặc khu vực người đọc đã chọn, đọc từ cookie ở máy chủ.
 * @param props.eventCount Số sự kiện đang có trong kho dữ liệu.
 * @param props.countryCount Số quốc gia và khu vực xuất hiện trong kho dữ liệu.
 */
export function Navbar({
  preferredCountry = '',
  eventCount,
  countryCount,
}: {
  preferredCountry?: string;
  eventCount: number;
  countryCount: number;
}) {
  const { locale, dictionary } = useI18n();
  const pathname = usePathname();
  const internalPath = stripLocalePrefix(pathname || '/');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);

  const timelineHref = localizePath(locale, '/timeline');

  // Đóng bảng điều hướng mỗi khi chuyển trang.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Khóa cuộn nền khi bảng điều hướng đang mở và đóng bằng phím Escape.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Theo dõi vị trí cuộn để đổ bóng thanh điều hướng và vẽ đường tiến trình.
  useEffect(() => {
    const update = (): void => {
      frameRef.current = 0;
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(scrollTop > 6);
      setProgress(max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0);
    };

    const handleScroll = (): void => {
      if (frameRef.current === 0) {
        frameRef.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  /**
   * Kiểm tra một mục có đang được chọn hay không.
   * Trang chi tiết sự kiện được xem là thuộc dòng thời gian, trang chi tiết
   * tuyến bài học thuộc mục chủ đề.
   * @param href Đường dẫn nội bộ của mục.
   * @returns Đúng nếu mục đang hoạt động.
   */
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return internalPath === '/';
    }

    if (href === '/timeline') {
      return internalPath === '/timeline' || internalPath.startsWith('/event/');
    }

    if (href === '/collections') {
      return internalPath === '/collections' || internalPath.startsWith('/collections/');
    }

    return internalPath === href;
  };

  const navLabel = (key: NavItem['key']): string => dictionary.nav[key];

  return (
    <header className="sticky top-0 z-50">
      {/* Dải thông tin mỏng, chỉ hiện trên màn hình rộng. */}
      <div className="hidden bg-night text-white/60 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.8125rem] font-medium">
          <p className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gold" aria-hidden="true" />
            {dictionary.nav.ribbon}
          </p>
          <div className="flex items-center gap-3">
            <p className="hidden whitespace-nowrap text-white/55 lg:block">
              {formatMessage(dictionary.home.hero.note, { suKien: eventCount, quocGia: countryCount })}
            </p>
            <CountryPreference value={preferredCountry} tone="night" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'relative border-b bg-background/85 backdrop-blur-xl transition-colors duration-300',
          scrolled ? 'border-line/80 shadow-[0_8px_20px_-18px_rgba(10,16,24,0.35)]' : 'border-transparent',
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-3">
          <Link
            href={localizePath(locale, '/')}
            className="group flex shrink-0 items-center gap-3"
            aria-label={dictionary.a11y.logo}
          >
            <BrandMark className="transition duration-500 group-hover:rotate-[10deg]" />
            <span className="leading-tight">
              <span className="block whitespace-nowrap font-display text-[1.0625rem] font-bold tracking-tight text-ink">
                Sử Ký Toàn Cầu
              </span>
              <span className="hidden whitespace-nowrap text-[0.75rem] tracking-[0.01em] text-muted sm:block">
                {locale === 'en' ? 'World History Archive' : 'Bách khoa lịch sử mở'}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 whitespace-nowrap xl:flex" aria-label={dictionary.a11y.mainNav}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={localizePath(locale, item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                data-active={isActive(item.href)}
                className="nav-link"
              >
                {navLabel(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {/* Biểu mẫu tìm kiếm thật, hoạt động cả khi JavaScript chưa tải xong. */}
            <form
              action={timelineHref}
              method="get"
              role="search"
              className="search-pill hidden items-center rounded-full border border-line bg-surface/70 pl-3 transition focus-within:border-accent/50 2xl:flex"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
                className="shrink-0 text-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                name="q"
                maxLength={120}
                placeholder={dictionary.common.search}
                aria-label={dictionary.a11y.search}
                className="h-10 w-36 border-0 bg-transparent px-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/80"
              />
            </form>

            <Link
              href={timelineHref}
              aria-label={dictionary.a11y.searchOnTimeline}
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-gold/50 hover:bg-raised 2xl:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {/* Góc cá nhân: sự kiện đã lưu và tiến độ ôn tập, giữ trong bộ nhớ trình duyệt. */}
              <Link
                href={localizePath(locale, '/study')}
                aria-label={dictionary.a11y.studyLink}
                aria-current={isActive('/study') ? 'page' : undefined}
                className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-gold/50 hover:bg-raised"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <LanguageSwitch />
              <ThemeToggle />
            </div>

            <Link
              href={localizePath(locale, '/contribute')}
              className="btn-primary hidden whitespace-nowrap !min-h-10 !px-4 !py-2 text-sm sm:inline-flex"
            >
              {dictionary.nav.contribute}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-raised xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? dictionary.common.closeMenu : dictionary.common.openMenu}
            >
              <span aria-hidden="true">
                {open ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Đường tiến trình đọc trang. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-gold via-accent to-accent-strong transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />

        {open ? (
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-background px-5 pb-8 pt-5 shadow-lift xl:hidden"
          >
            <form action={timelineHref} method="get" role="search" className="mb-5">
              <label htmlFor="mobile-search" className="sr-only">
                {dictionary.timeline.searchLabel}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="mobile-search"
                  type="search"
                  name="q"
                  maxLength={120}
                  placeholder={dictionary.timeline.searchPlaceholder}
                  className="field pl-11"
                />
              </div>
            </form>

            <div className="mb-5 rounded-2xl border border-line bg-surface/60 p-4">
              <label htmlFor="mobile-country" className="field-label">
                {dictionary.preferences.countryLabel}
              </label>
              <CountryPreference id="mobile-country" value={preferredCountry} />
              <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                {dictionary.preferences.countryHint}
              </p>
            </div>

            <nav aria-label={dictionary.a11y.mobileNav} className="grid gap-1">
              {[
                ...NAV_ITEMS,
                { key: 'study' as const, href: '/study' },
                { key: 'contribute' as const, href: '/contribute' },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={localizePath(locale, item.href)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[3.25rem] items-center justify-between rounded-2xl px-4 text-base font-medium transition',
                    isActive(item.href)
                      ? 'bg-raised text-ink'
                      : 'text-muted hover:bg-raised/70 hover:text-ink',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-[0.75rem] text-gold">0{index + 1}</span>
                    {navLabel(item.key)}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </nav>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
              <LanguageSwitch compact />
              <ThemeToggle />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
