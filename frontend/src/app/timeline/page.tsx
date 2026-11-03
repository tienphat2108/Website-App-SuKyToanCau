import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { TimelineExplorer } from '@/components/timeline/timeline-explorer';
import { getI18n } from '@/core/i18n/server';
import { getPreferredCountry } from '@/core/preferences/server';
import { localizePath } from '@/core/i18n/config';
import { ERAS } from '@/core/models/HistoricalEvent';
import { toEventCards } from '@/core/presenters/event.presenter';
import { historicalService } from '@/services/historical.service';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/** Kiểu tham số truy vấn do Next.js cung cấp. */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Đọc một tham số truy vấn dạng chuỗi.
 * @param params Bản đồ tham số.
 * @param key Tên tham số.
 * @returns Giá trị đầu tiên hoặc chuỗi rỗng.
 */
function readParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

/**
 * Siêu dữ liệu trang dòng thời gian.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.timeline.title,
    description: dictionary.meta.timeline.description,
    keywords: dictionary.meta.keywords,
  });
}

/**
 * Trang dòng thời gian có bộ lọc theo thời kỳ, quốc gia, từ khóa và chế độ bản đồ.
 * Bộ lọc ban đầu có thể được truyền qua đường dẫn để chia sẻ một góc nhìn cụ thể.
 * @param props.searchParams Tham số truy vấn của yêu cầu.
 */
export default async function TimelinePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { locale, dictionary } = await getI18n();
  const events = await historicalService.getAll();
  const cards = toEventCards(events, locale);
  const preferredCountry = await getPreferredCountry();

  const eraParam = readParam(params, 'era');
  const initialEra = ERAS.some((era) => era.key === eraParam) ? eraParam : '';
  const initialCountry = readParam(params, 'country');
  const initialQuery = readParam(params, 'q').slice(0, 120);
  const initialView = readParam(params, 'view') === 'map' ? 'map' : 'timeline';

  const homeHref = localizePath(locale, '/');
  const timelineHref = localizePath(locale, '/timeline');
  const countryCount = new Set(cards.map((card) => card.country)).size;

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.timeline.title, url: absoluteUrl(timelineHref) },
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
              { label: dictionary.timeline.title },
            ]}
          />

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
            <div className="max-w-2xl animate-fade-up">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.15rem]">
                {dictionary.timeline.title}
              </h1>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">{dictionary.timeline.subtitle}</p>

              <Link href={localizePath(locale, '/contribute')} className="btn-secondary mt-6">
                {dictionary.home.hero.secondaryCta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="animate-fade-in rounded-2xl border border-line/80 bg-surface p-5">
              <p className="text-[0.8125rem] font-medium text-muted">
                {dictionary.event.overview}
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-line text-center">
                <div>
                  <p className="font-display text-[1.8rem] font-bold leading-none text-ink">{cards.length}</p>
                  <p className="mt-1.5 text-[0.75rem] font-medium leading-snug text-muted">
                    {dictionary.common.events}
                  </p>
                </div>
                <div>
                  <p className="font-display text-[1.8rem] font-bold leading-none text-ink">{ERAS.length}</p>
                  <p className="mt-1.5 text-[0.75rem] font-medium leading-snug text-muted">
                    {dictionary.timeline.eraLabel}
                  </p>
                </div>
                <div>
                  <p className="font-display text-[1.8rem] font-bold leading-none text-ink">{countryCount}</p>
                  <p className="mt-1.5 text-[0.75rem] font-medium leading-snug text-muted">
                    {dictionary.timeline.countryLabel}
                  </p>
                </div>
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[0.8125rem] leading-relaxed text-muted">{dictionary.timeline.sortNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10 lg:py-12">
        <TimelineExplorer
          events={cards}
          initialEra={initialEra}
          initialCountry={initialCountry}
          initialQuery={initialQuery}
          initialView={initialView}
          initialPreferredCountry={preferredCountry}
        />
      </section>

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
