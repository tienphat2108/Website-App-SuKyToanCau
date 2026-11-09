import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { getI18n } from '@/core/i18n/server';
import { collections, collectionIntro, collectionPath, collectionTitle } from '@/data/collections';
import { seedEventsBySlug } from '@/data/seed';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/utils/site';

/**
 * Siêu dữ liệu trang chủ đề tuyến bài học.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.collections.title,
    description: dictionary.meta.collections.description,
    keywords: dictionary.meta.keywords,
  });
}

/**
 * Trang danh sách các tuyến bài học.
 * Mỗi tuyến là một chuỗi sự kiện được tuyển chọn kèm lời dẫn biên tập song ngữ.
 */
export default async function CollectionsPage() {
  const { locale, dictionary } = await getI18n();

  const homeHref = localizePath(locale, '/');
  const pageHref = localizePath(locale, '/collections');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.collections.title, url: absoluteUrl(pageHref) },
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="surface-grid absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

        <div className="container-page relative py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            label={dictionary.a11y.breadcrumb}
            items={[
              { label: dictionary.common.home, href: homeHref },
              { label: dictionary.collections.title },
            ]}
          />

          <div className="mt-7 max-w-2xl animate-fade-up">
            <h1 className="font-display text-[2.35rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.15rem]">
              {dictionary.collections.title}
            </h1>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
              {dictionary.collections.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <div className="grid gap-6 lg:grid-cols-2">
          {collections.map((collection, index) => {
            const first = seedEventsBySlug.get(collection.steps[0]?.slug ?? '');
            const yearLabel = first ? first.dateLabel(locale) : '';

            return (
              <article key={collection.slug} className="card-press card group relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
                <span
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-[0.8125rem] font-bold text-gold">
                    0{index + 1}
                  </span>
                  <span className="chip shrink-0">
                    {formatMessage(dictionary.collections.stepCount, { count: collection.steps.length })}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-[1.45rem] font-bold leading-snug text-ink transition group-hover:text-accent">
                  <Link href={localizePath(locale, collectionPath(collection))} className="focus-visible:outline-offset-4">
                    {collectionTitle(collection, locale)}
                  </Link>
                </h2>

                <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
                  {collectionIntro(collection, locale)}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[0.8125rem] font-medium text-muted">
                  <span>{formatMessage(dictionary.collections.rangeLabel, { date: yearLabel })}</span>
                </div>

                <Link
                  href={localizePath(locale, collectionPath(collection))}
                  className="mt-5 inline-flex items-center gap-2 font-ui text-[0.875rem] font-semibold text-accent transition hover:text-ink"
                >
                  {dictionary.collections.startPath}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line transition group-hover:border-accent/40 group-hover:bg-accent group-hover:text-white">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
