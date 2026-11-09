import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/events/event-card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { getI18n } from '@/core/i18n/server';
import { toEventCard } from '@/core/presenters/event.presenter';
import {
  collectionBySlug,
  collectionPath,
  collectionTitle,
  collections,
  stepNote,
} from '@/data/collections';
import { seedEventsBySlug } from '@/data/seed';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/utils/site';

/** Tham số đường dẫn của trang chi tiết tuyến. */
type PageProps = { params: Promise<{ slug: string }> };

/**
 * Khai báo các tuyến có thể dựng tĩnh.
 * @returns Danh sách khóa đường dẫn của mọi tuyến bài học.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return collections.map((collection) => ({ slug: collection.slug }));
}

/**
 * Siêu dữ liệu trang chi tiết tuyến bài học.
 * @param props.params Khóa đường dẫn của tuyến.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collectionBySlug.get(slug);
  const { locale, dictionary } = await getI18n();

  if (!collection) {
    return createPageMetadata({
      title: dictionary.meta.notFound.title,
      description: dictionary.meta.notFound.description,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: collectionTitle(collection, locale),
    description: locale === 'en' ? collection.introEn : collection.introVi,
    keywords: dictionary.meta.keywords,
  });
}

/**
 * Trang chi tiết một tuyến bài học: lời dẫn biên tập và các bước đọc theo thứ tự.
 * @param props.params Khóa đường dẫn của tuyến.
 */
export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = collectionBySlug.get(slug);

  if (!collection) {
    notFound();
  }

  const { locale, dictionary } = await getI18n();
  const steps = collection.steps.map((step, index) => {
    const event = seedEventsBySlug.get(step.slug);

    return event
      ? {
          step,
          index: index + 1,
          card: toEventCard(event, locale),
        }
      : null;
  });

  const homeHref = localizePath(locale, '/');
  const listHref = localizePath(locale, '/collections');
  const pageHref = localizePath(locale, collectionPath(collection));

  const eventLabels = {
    readMore: dictionary.common.readMore,
    featured: dictionary.common.featured,
    minutes: dictionary.event.minuteRead,
  };

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.collections.title, url: absoluteUrl(listHref) },
    { label: collectionTitle(collection, locale), url: absoluteUrl(pageHref) },
  ]);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collectionTitle(collection, locale),
    description: locale === 'en' ? collection.introEn : collection.introVi,
    numberOfItems: steps.filter(Boolean).length,
    itemListElement: steps
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => ({
        '@type': 'ListItem',
        position: item.index,
        name: item.card.title,
        url: absoluteUrl(item.card.href),
      })),
  };

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
              { label: dictionary.collections.title, href: listHref },
              { label: collectionTitle(collection, locale) },
            ]}
          />

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div className="max-w-2xl animate-fade-up">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.15rem]">
                {collectionTitle(collection, locale)}
              </h1>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
                {locale === 'en' ? collection.introEn : collection.introVi}
              </p>
            </div>

            <div className="animate-fade-in rounded-2xl border border-line/80 bg-surface p-5">
              <p className="text-[0.8125rem] font-medium text-muted">{dictionary.collections.pathSummary}</p>
              <div className="mt-4 grid grid-cols-2 divide-x divide-line text-center">
                <div>
                  <p className="font-display text-[1.8rem] font-bold leading-none text-ink">{collection.steps.length}</p>
                  <p className="mt-1.5 text-[0.75rem] font-medium leading-snug text-muted">
                    {dictionary.collections.stepsLabel}
                  </p>
                </div>
                <div>
                  <p className="font-display text-[1.8rem] font-bold leading-none text-ink">
                    {formatMessage(dictionary.collections.minutesEstimate, {
                      count: collection.steps.length * 5,
                    })}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] font-medium leading-snug text-muted">
                    {dictionary.collections.readingTimeLabel}
                  </p>
                </div>
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[0.8125rem] leading-relaxed text-muted">
                {dictionary.collections.orderNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <ol className="space-y-10">
          {steps.map((item) =>
            item ? (
              <li key={item.step.slug} className="relative">
                <div className="grid gap-5 lg:grid-cols-[2.6rem_1fr]">
                  <div className="flex items-center gap-3 lg:block">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-[0.8125rem] font-bold text-gold">
                      {String(item.index).padStart(2, '0')}
                    </span>
                  </div>

                  <div>
                    <p className="text-[0.9375rem] leading-relaxed text-muted">{stepNote(item.step, locale)}</p>
                    <div className="mt-4 max-w-2xl">
                      <EventCard event={item.card} labels={eventLabels} className="h-full" />
                    </div>
                  </div>
                </div>
              </li>
            ) : null,
          )}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-8">
          <Link href={listHref} className="btn-secondary">
            {dictionary.collections.backToList}
          </Link>
          <Link
            href={localizePath(locale, '/timeline')}
            className="btn-primary"
          >
            {dictionary.collections.browseTimeline}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />
    </>
  );
}
