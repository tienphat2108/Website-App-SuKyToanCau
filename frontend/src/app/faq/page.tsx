import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/**
 * Siêu dữ liệu trang câu hỏi thường gặp.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.faq.title,
    description: dictionary.meta.faq.description,
  });
}

/**
 * Trang giải đáp năm câu hỏi thường gặp.
 * Dùng thẻ details/summary để phần trả lời vẫn hoạt động khi JavaScript bị tắt,
 * đồng thời tạo dữ liệu có cấu trúc FAQPage cho công cụ tìm kiếm.
 */
export default async function FaqPage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const faqHref = localizePath(locale, '/faq');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.faq.title, url: absoluteUrl(faqHref) },
  ]);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dictionary.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const exploreLinks = [
    { href: localizePath(locale, '/timeline'), label: dictionary.nav.timeline },
    { href: localizePath(locale, '/about'), label: dictionary.nav.about },
    { href: localizePath(locale, '/privacy'), label: dictionary.nav.privacy },
  ];

  return (
    <>
      <PageHero
        title={dictionary.faq.title}
        description={dictionary.faq.subtitle}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.faq.title },
        ]}
        aside={
          <aside className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-7">
            <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />

            <h2 className="relative font-display text-xl font-semibold leading-snug">{dictionary.faq.moreTitle}</h2>
            <p className="relative mt-2.5 text-[0.9375rem] leading-relaxed text-white/70">{dictionary.faq.moreText}</p>
            <Link
              href={localizePath(locale, '/contribute')}
              className="btn-gold relative mt-5 w-full"
            >
              {dictionary.faq.contactCta}
            </Link>
          </aside>
        }
      />

      <section className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
        <div className="space-y-4">
          {dictionary.faq.items.map((item, index) => (
            <details
              key={item.question}
              className="group card overflow-hidden transition open:border-gold/45"
              open={index === 0}
            >
              <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 p-5 text-left sm:p-6 [&::-webkit-details-marker]:hidden">
                <span className="pt-1 font-display text-[0.75rem] font-bold tracking-[0.06em] text-accent/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {item.question}
                </h2>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>

              <div className="border-t border-line/80 px-5 pb-6 pt-4 sm:px-6 sm:pl-[3.9rem]">
                <p className="text-[0.9375rem] leading-[1.8] text-muted">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={dictionary.footer.exploreTitle} className="card p-5">
            <h2 className="text-[0.8125rem] font-semibold text-muted">
              {dictionary.footer.exploreTitle}
            </h2>

            <ul className="mt-4 space-y-1">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[0.9375rem] text-muted transition hover:bg-raised hover:text-accent"
                  >
                    {link.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      className="text-gold transition group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rounded-2xl border border-line bg-raised/60 p-5">
            <p className="text-[0.875rem] leading-relaxed text-muted">{dictionary.contribute.privacy}</p>
            <Link
              href={localizePath(locale, '/privacy')}
              className="mt-3 inline-flex text-[0.8125rem] font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
            >
              {dictionary.nav.privacy}
            </Link>
          </div>
        </aside>
      </section>

      <JsonLd data={[faqJsonLd, breadcrumbJsonLd]} />
    </>
  );
}
