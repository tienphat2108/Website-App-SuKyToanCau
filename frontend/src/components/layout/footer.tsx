'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';
import { formatMessage } from '@/core/i18n/dictionary';
import { localizePath } from '@/core/i18n/config';
import { BrandMark } from '@/components/ui/brand-mark';

/** Nhóm liên kết chân trang. */
interface FooterLink {
  label: string;
  href: string;
}

/**
 * Chân trang dùng chung cho mọi trang.
 *
 * Nền xanh đêm tạo nhịp kết thúc cho hệ màu giấy ấm, các cột liên kết gọn lại
 * và một thẻ kêu gọi đóng góp kiểu kính mờ để giữ sự chú ý ở bước cuối.
 * Đọc ngôn ngữ từ ngữ cảnh để đổi ngôn ngữ bằng điều hướng mềm không cần dựng lại trang.
 */
export function Footer() {
  const { locale, dictionary } = useI18n();

  const exploreLinks: FooterLink[] = [
    { label: dictionary.nav.home, href: localizePath(locale, '/') },
    { label: dictionary.nav.timeline, href: localizePath(locale, '/timeline') },
    { label: dictionary.nav.stories, href: localizePath(locale, '/stories') },
    { label: dictionary.nav.about, href: localizePath(locale, '/about') },
    { label: dictionary.nav.faq, href: localizePath(locale, '/faq') },
  ];

  const projectLinks: FooterLink[] = [
    { label: dictionary.nav.contribute, href: localizePath(locale, '/contribute') },
    {
      label: dictionary.footer.security,
      href: `${localizePath(locale, '/privacy')}#bao-mat`,
    },
    { label: dictionary.nav.privacy, href: localizePath(locale, '/privacy') },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-night text-white/70">
      <div className="gold-rule" aria-hidden="true" />

      {/* Ánh sáng và lưới mảnh giúp nền tối có chiều sâu như bìa một cuốn sách. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="surface-grid absolute inset-0 opacity-[0.07]" />
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="container-page relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.15fr]">
          <div>
            <Link
              href={localizePath(locale, '/')}
              className="group inline-flex items-center gap-3"
              aria-label={dictionary.a11y.logo}
            >
              <BrandMark tone="night" className="transition duration-500 group-hover:rotate-[10deg]" />
              <span className="leading-tight">
                <span className="block font-display text-lg font-bold tracking-tight text-white">
                  Sử Ký Toàn Cầu
                </span>
                <span className="text-[0.75rem] text-white/60">
                  {locale === 'en' ? 'World History Archive' : 'Bách khoa lịch sử mở'}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/70">{dictionary.footer.tagline}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.75rem] font-medium text-gold">
                {dictionary.footer.languageNote}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.75rem] font-medium text-white/60">
                EST. 2026
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[0.8125rem] font-semibold text-white/90">
              {dictionary.footer.exploreTitle}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[0.9375rem] text-white/70 transition hover:text-white"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.8125rem] font-semibold text-white/90">
              {dictionary.footer.aboutTitle}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {projectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[0.9375rem] text-white/70 transition hover:text-white"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/20 blur-2xl" aria-hidden="true" />
            <p className="relative text-[0.8125rem] font-medium text-gold">
              {dictionary.footer.exploreTitle}
            </p>
            <h2 className="relative mt-2 font-display text-xl font-semibold text-white">
              {dictionary.footer.contributeTitle}
            </h2>
            <p className="relative mt-2 text-[0.9375rem] leading-relaxed text-white/70">
              {dictionary.footer.contributeText}
            </p>
            <Link
              href={localizePath(locale, '/contribute')}
              className="btn-gold relative mt-5 w-full"
            >
              {dictionary.footer.contributeButton}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 gold-rule" aria-hidden="true" />

        <div className="mt-6 flex flex-col gap-4 text-[0.8125rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p>{dictionary.footer.copyright}</p>
            <p>{formatMessage(dictionary.footer.owner, { owner: dictionary.privacy.ownerName })}</p>
          </div>
          <p className="max-w-md leading-relaxed sm:text-right">{dictionary.footer.license}</p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 self-start text-[0.8125rem] font-medium text-white/70 transition hover:text-gold sm:self-auto"
          >
            {dictionary.common.backToTop}
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 transition group-hover:border-gold/60 group-hover:bg-white/5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
