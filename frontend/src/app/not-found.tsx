import Link from 'next/link';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { seedEvents } from '@/data/seed';

/**
 * Trang báo lỗi 404 tùy chỉnh.
 * Gợi ý vài sự kiện từ dữ liệu mẫu để người đọc có lối quay lại nội dung thay vì
 * gặp một trang trống. Biểu mẫu tìm kiếm chuyển thẳng sang dòng thời gian.
 * Next.js tự gắn thẻ noindex cho trang không tìm thấy.
 */
export default async function NotFound() {
  const { locale, dictionary } = await getI18n();
  const suggestions = seedEvents.slice(0, 3);
  const timelineHref = localizePath(locale, '/timeline');

  return (
    <section className="relative overflow-hidden">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[26rem] w-[26rem] rounded-full bg-gold/12 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden="true" />

      <div className="container-page relative py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-[5.5rem] font-bold leading-none tracking-tight text-gold/35 sm:text-[7rem]">
            404
          </p>
          <h1 className="mt-4 font-display text-[2.3rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl">
            {dictionary.notFound.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted">{dictionary.notFound.text}</p>

          {/* Biểu mẫu tìm kiếm thật để người đọc đi tiếp ngay trên trang lỗi. */}
          <form action={timelineHref} method="get" role="search" className="mx-auto mt-8 max-w-lg">
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
              <label htmlFor="not-found-search" className="sr-only">
                {dictionary.a11y.search}
              </label>
              <input
                id="not-found-search"
                type="search"
                name="q"
                maxLength={120}
                placeholder={dictionary.timeline.searchPlaceholder}
                className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-muted/80"
              />
              <button type="submit" className="btn-primary !min-h-10 shrink-0 !px-5 !py-2 text-sm">
                {dictionary.home.hero.searchCta}
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={timelineHref} className="btn-secondary">
              {dictionary.notFound.searchCta}
            </Link>
            <Link href={localizePath(locale, '/')} className="btn-ghost underline decoration-line underline-offset-4">
              {dictionary.notFound.homeCta}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <h2 className="text-[0.8125rem] font-semibold text-muted">
              {dictionary.notFound.suggestions}
            </h2>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {suggestions.map((event) => (
              <Link
                key={event.slug}
                href={event.href(locale)}
                className="card group relative flex items-start justify-between gap-3 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-gold/40"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition group-hover:opacity-100"
                  aria-hidden="true"
                />

                <span className="min-w-0">
                  <span className="block text-[0.75rem] font-medium text-accent">
                    {event.eraName(locale)}
                  </span>
                  <span className="mt-1.5 block font-display text-[1.0625rem] font-semibold leading-snug text-ink group-hover:text-accent">
                    {event.title(locale)}
                  </span>
                  <span className="mt-1.5 block text-[0.8125rem] text-muted">
                    {event.dateLabel(locale)}
                  </span>
                </span>

                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition group-hover:border-gold group-hover:text-gold">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
