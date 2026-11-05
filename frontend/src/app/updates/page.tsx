import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { loadRecentUpdates, type RecentUpdateItem } from '@/data/recent-updates';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/**
 * Khu cập nhật được làm mới mỗi giờ để phản ánh tệp dữ liệu quét gần nhất.
 * Tệp do bộ quét sinh theo lệnh, không tự thay đổi khi website chạy.
 */
export const revalidate = 3600;

/**
 * Siêu dữ liệu trang cập nhật từ nguồn mở.
 * @returns Tiêu đề và mô tả riêng cho ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.updates.title,
    description: dictionary.meta.updates.description,
  });
}

/**
 * Trang cập nhật từ nguồn mở.
 *
 * Mỗi mục là một sự kiện do cộng đồng Wikidata và Wikipedia ghi nhận, kèm mốc
 * sửa đổi và nguồn trỏ thẳng bài viết gốc. Khu này tách khỏi kho sự kiện đã
 * biên tập: độc giả thấy rõ dữ liệu được sưu tầm tự động và còn giấy phép mở.
 */
export default async function UpdatesPage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const updatesHref = localizePath(locale, '/updates');
  const timelineHref = localizePath(locale, '/timeline');
  const feed = await loadRecentUpdates();

  const dateFormat = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatDate = (iso: string | null): string | null => {
    if (!iso) return null;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : dateFormat.format(parsed);
  };

  const titleOf = (item: RecentUpdateItem) => (locale === 'vi' ? item.titleVi : item.titleEn);
  const summaryOf = (item: RecentUpdateItem) => (locale === 'vi' ? item.summaryVi : item.summaryEn);
  const articleOf = (item: RecentUpdateItem) =>
    item.sources.find((source) => source.language === locale) ?? item.sources[0];

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.updates.title, url: absoluteUrl(updatesHref) },
  ]);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dictionary.meta.updates.title,
    description: dictionary.meta.updates.description,
    url: absoluteUrl(updatesHref),
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: feed.items.length,
      itemListElement: feed.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: articleOf(item)?.url ?? absoluteUrl(updatesHref),
        name: titleOf(item),
      })),
    },
  };

  return (
    <>
      <PageHero
        title={dictionary.updates.title}
        description={dictionary.updates.subtitle}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.updates.title },
        ]}
        action={
          <Link href={timelineHref} className="btn-secondary">
            {dictionary.nav.timeline}
          </Link>
        }
      />

      <section className="container-page section-y">
        <p className="font-ui text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-accent">
          {dictionary.updates.eyebrow}
        </p>
        <span className="gold-rule mt-3 block max-w-xs" aria-hidden="true" />
      </section>

      <div className="container-page pb-16 sm:pb-20">
        <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4 sm:p-5">
          <p className="font-ui text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-accent">
            {dictionary.updates.autoLabel}
          </p>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
            {dictionary.updates.licenseNote}
            {feed.generatedAt ? (
              <>
                {' '}
                {dictionary.updates.generatedLabel}{' '}
                <time dateTime={feed.generatedAt}>{formatDate(feed.generatedAt)}</time>.
              </>
            ) : null}
          </p>
        </div>

        {feed.items.length === 0 ? (
          <p className="mt-10 text-[1.0625rem] leading-relaxed text-muted">
            {dictionary.updates.emptyNote}
          </p>
        ) : (
          <ol className="mt-8 space-y-6">
            {feed.items.map((item) => {
              const date = formatDate(item.date);
              const revised = formatDate(item.revisedAt);
              const article = articleOf(item);

              return (
                <li key={item.key}>
                  <article
                    className="card p-6 sm:p-8"
                    aria-labelledby={`update-${item.key}-title`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-ui text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-accent">
                      {date ? <time dateTime={item.date}>{date}</time> : null}
                      {item.location ? <span aria-hidden="true">·</span> : null}
                      {item.location ? <span>{item.location}</span> : null}
                    </div>

                    <h2
                      id={`update-${item.key}-title`}
                      className="mt-2.5 font-display text-[1.45rem] font-bold leading-tight text-ink sm:text-[1.7rem]"
                    >
                      {titleOf(item)}
                    </h2>

                    <p className="mt-3 text-[1rem] leading-[1.75] text-muted">
                      {summaryOf(item)}
                    </p>

                    <p className="mt-3 font-ui text-[0.8125rem] text-muted">
                      {item.languages} {dictionary.updates.languagesLabel}
                      {revised ? (
                        <>
                          <span aria-hidden="true"> · </span>
                          {dictionary.updates.revisedLabel}{' '}
                          <time dateTime={item.revisedAt ?? undefined}>{revised}</time>
                        </>
                      ) : null}
                    </p>

                    <div className="mt-5 border-t border-line pt-4">
                      <p className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
                        {dictionary.updates.sourcesTitle}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {item.sources.map((source) => (
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

                    {article ? (
                      <div className="mt-6">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          {dictionary.updates.viewSource}
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </div>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <JsonLd data={[collectionJsonLd, breadcrumbJsonLd]} />
    </>
  );
}
