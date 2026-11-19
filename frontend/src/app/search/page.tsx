import type { Metadata } from 'next';
import Link from 'next/link';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { searchSite } from '@/lib/site-search';
import { createPageMetadata } from '@/lib/seo';

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

/**
 * Siêu dữ liệu trang tìm kiếm.
 * Trang kết quả tìm kiếm nội bộ không được lập chỉ mục để tránh trùng lặp nội dung.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.search.title,
    description: dictionary.search.subtitle,
    noindex: true,
  });
}

/**
 * Trang tìm kiếm toàn site.
 *
 * Kết quả được tính ngay trên máy chủ từ kho dữ liệu biên tập, không gọi mạng
 * và không cần JavaScript. Mỗi nhóm kết quả giữ đúng kiểu liên kết của nơi đến.
 * @param props.searchParams Từ khóa lấy từ địa chỉ trang.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { locale, dictionary } = await getI18n();
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const results = searchSite(locale, rawQuery, dictionary);
  const searchHref = localizePath(locale, '/search');
  const timelineHref = localizePath(locale, '/timeline');
  const faqHref = localizePath(locale, '/faq');

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="container-page relative py-12 sm:py-16">
          <p className="font-ui text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-accent">
            {dictionary.common.search}
          </p>
          <h1 className="mt-3 font-display text-[2rem] font-bold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
            {dictionary.search.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
            {dictionary.search.subtitle}
          </p>

          <form action={searchHref} method="get" role="search" className="mt-7 max-w-2xl">
            <label htmlFor="site-search-input" className="sr-only">
              {dictionary.a11y.search}
            </label>
            <div className="search-pill flex items-center gap-1.5 rounded-full border border-line bg-surface p-1.5 pl-4 transition focus-within:border-accent/45">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="shrink-0 text-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                id="site-search-input"
                type="search"
                name="q"
                maxLength={120}
                defaultValue={results.query}
                placeholder={dictionary.search.placeholder}
                className="h-12 min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-muted/80"
              />
              <button type="submit" className="btn-primary !min-h-10 shrink-0 !px-5 !py-2 text-sm">
                {dictionary.search.submit}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="container-page section-y">
        {results.term ? (
          <>
            <p role="status" className="font-ui text-[0.9375rem] text-muted">
              {formatMessage(dictionary.search.results, {
                count: results.total,
                query: results.query,
              })}
            </p>

            {results.total === 0 ? (
              <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {dictionary.search.emptyTitle}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                  {dictionary.search.emptyText}
                </p>
                <Link href={timelineHref} className="btn-secondary mt-5">
                  {dictionary.timeline.viewTimeline}
                </Link>
              </div>
            ) : null}

            {results.events.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {dictionary.search.events}
                  <span className="ml-2 align-middle text-[0.875rem] font-normal text-muted">
                    ({results.eventTotal})
                  </span>
                </h2>
                <ol className="mt-4 grid gap-3">
                  {results.events.map((event) => (
                    <li key={event.slug}>
                      <Link href={event.href(locale)} className="card group block p-5">
                        <span className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-accent">
                          {event.eraName(locale)}
                        </span>
                        <span className="mt-1 block font-display text-[1.125rem] font-semibold leading-snug text-ink group-hover:text-accent">
                          {event.title(locale)}
                        </span>
                        <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-muted">
                          {event.summary(locale)}
                        </span>
                        <span className="mt-2 block text-[0.8125rem] text-muted">
                          {event.dateLabel(locale)} · {event.countryName(locale)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
                {results.eventTotal > results.events.length ? (
                  <p className="mt-3 text-[0.875rem] text-muted">
                    {formatMessage(dictionary.search.eventCount, {
                      count: results.events.length,
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}

            {results.collections.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {dictionary.search.collections}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {results.collections.map((collection) => (
                    <li key={collection.slug}>
                      <Link
                        href={localizePath(locale, `/collections/${collection.slug}`)}
                        className="card group block h-full p-5"
                      >
                        <span className="block font-display text-[1.0625rem] font-semibold text-ink group-hover:text-accent">
                          {(locale === 'vi' ? collection.titleVi : collection.titleEn)}
                        </span>
                        <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-muted">
                          {(locale === 'vi' ? collection.introVi : collection.introEn)}
                        </span>
                        <span className="mt-2 block font-ui text-[0.8125rem] text-gold">
                          {formatMessage(dictionary.collections.stepCount, {
                            count: collection.steps.length,
                          })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {results.faq.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {dictionary.search.faq}
                </h2>
                <ul className="mt-4 grid gap-3">
                  {results.faq.map((item) => (
                    <li key={item.question}>
                      <Link href={faqHref} className="card group block p-5">
                        <span className="block font-ui text-[1rem] font-semibold text-ink group-hover:text-accent">
                          {item.question}
                        </span>
                        <span className="mt-1 block line-clamp-2 text-[0.875rem] leading-relaxed text-muted">
                          {item.answer}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {results.pages.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {dictionary.search.pages}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.pages.map((page) => (
                    <li key={page.href}>
                      <Link href={page.href} className="card group block h-full p-5">
                        <span className="block font-ui text-[1rem] font-semibold text-ink group-hover:text-accent">
                          {page.title}
                        </span>
                        <span className="mt-1 block text-[0.875rem] leading-relaxed text-muted">
                          {page.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-raised/40 p-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              {dictionary.search.hintTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
              {dictionary.search.hintText}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={timelineHref} className="btn-secondary">
                {dictionary.nav.timeline}
              </Link>
              <Link href={localizePath(locale, '/collections')} className="btn-ghost">
                {dictionary.nav.collections}
              </Link>
              <Link href={localizePath(locale, '/on-this-day')} className="btn-ghost">
                {dictionary.nav.onThisDay}
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
