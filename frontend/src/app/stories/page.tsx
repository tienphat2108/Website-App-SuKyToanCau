import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { CASE_STUDY_SLUGS } from '@/data/case-studies';
import type { HistoricalEvent } from '@/core/models/HistoricalEvent';
import { historicalService } from '@/services/historical.service';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { cn } from '@/utils/format';

/**
 * Siêu dữ liệu trang hồ sơ chuyên sâu.
 * @returns Tiêu đề và mô tả riêng cho ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.stories.title,
    description: dictionary.meta.stories.description,
  });
}

/**
 * Trang hồ sơ chuyên sâu.
 *
 * Nội dung được lấy trực tiếp từ các bài viết đã biên soạn: mỗi hồ sơ giữ nguyên
 * đoạn mở đầu, nguồn tham khảo và liên kết tới trang chi tiết. Cách này giúp trang
 * có góc nhìn sâu hơn mà không sinh ra dữ liệu mới chưa được kiểm chứng.
 */
export default async function StoriesPage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const storiesHref = localizePath(locale, '/stories');
  const timelineHref = localizePath(locale, '/timeline');

  // Danh sách API được rút gọn nên không kèm nguồn tham khảo.
  // Đọc chi tiết từng hồ sơ để giữ nguyên yêu cầu giảm dữ liệu ở điểm cuối danh sách.
  const details = await Promise.all(
    CASE_STUDY_SLUGS.map((slug) => historicalService.getBySlug(slug)),
  );
  const caseStudies = details.filter(
    (event): event is HistoricalEvent => event !== null,
  );

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.stories.title, url: absoluteUrl(storiesHref) },
  ]);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dictionary.meta.stories.title,
    description: dictionary.meta.stories.description,
    url: absoluteUrl(storiesHref),
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: caseStudies.length,
      itemListElement: caseStudies.map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(event.href(locale)),
        name: event.title(locale),
      })),
    },
  };

  return (
    <>
      <PageHero
        title={dictionary.stories.title}
        description={dictionary.stories.subtitle}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.stories.title },
        ]}
        action={
          <Link href={timelineHref} className="btn-secondary">
            {dictionary.nav.timeline}
          </Link>
        }
      />

      <section className="container-page section-y">
        <p className="font-ui text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-accent">
          {dictionary.stories.eyebrow}
        </p>
        <span className="gold-rule mt-3 block max-w-xs" aria-hidden="true" />
      </section>

      <div className="container-page space-y-14 pb-16 sm:space-y-20 sm:pb-20">
        {caseStudies.map((event, index) => {
          const paragraphs = event.content(locale).slice(0, 2);
          const sources = event.sources.slice(0, 2);
          const isReversed = index % 2 === 1;

          return (
            <article
              key={event.slug}
              className="card relative overflow-hidden"
              aria-labelledby={`case-${event.slug}-title`}
            >
              <span
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                aria-hidden="true"
              />

              <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                <div
                  className={cn(
                    'relative min-h-[16rem] overflow-hidden bg-raised lg:min-h-full',
                    isReversed && 'lg:order-2',
                  )}
                >
                  <Image
                    src={event.imagePath}
                    alt={event.imageAlt(locale)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gold">
                      {dictionary.stories.caseLabel} {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold leading-snug">
                      {event.dateLabel(locale)}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-white/75">
                      {event.location(locale)} · {event.countryName(locale)}
                    </p>
                  </div>
                </div>

                <div className={cn('p-6 sm:p-8', isReversed && 'lg:order-1')}>
                  <p className="font-ui text-[0.8125rem] font-medium text-muted">
                    {event.eraName(locale)}
                  </p>
                  <h2
                    id={`case-${event.slug}-title`}
                    className="mt-2 font-display text-[1.7rem] font-bold leading-tight text-ink sm:text-[2rem]"
                  >
                    {event.title(locale)}
                  </h2>

                  <div className="mt-4 rounded-xl border border-gold/25 bg-gold/[0.06] p-4">
                    <p className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-accent">
                      {dictionary.stories.whyTitle}
                    </p>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink">
                      {dictionary.stories.reasons[event.slug as keyof typeof dictionary.stories.reasons]}
                    </p>
                  </div>

                  <p className="mt-4 text-[1.0625rem] leading-[1.75] text-muted">{event.summary(locale)}</p>

                  {paragraphs.length > 0 ? (
                    <div className="prose-history mt-4 space-y-3 text-[1rem] leading-[1.8] text-ink/90">
                      {paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}

                  {sources.length > 0 ? (
                    <div className="mt-5 border-t border-line pt-4">
                      <p className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
                        {dictionary.stories.sourcesTitle}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {sources.map((source) => (
                          <li key={source.url}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-start gap-2 text-[0.875rem] leading-relaxed text-muted transition hover:text-accent"
                            >
                              <span
                                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold"
                                aria-hidden="true"
                              />
                              <span>
                                <span className="font-medium text-ink group-hover:text-accent">
                                  {source.title}
                                  <span className="sr-only">
                                    {' '}
                                    {dictionary.a11y.externalLink}
                                  </span>
                                </span>
                                <span className="text-muted"> — {source.publisher}</span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href={event.href(locale)} className="btn-primary">
                      {dictionary.stories.readCase}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <span className="font-ui text-[0.8125rem] text-muted">
                      {sources.length > 0
                        ? `${event.sources.length} ${dictionary.stories.sourcesTitle.toLowerCase()}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <JsonLd data={[collectionJsonLd, breadcrumbJsonLd]} />
    </>
  );
}
