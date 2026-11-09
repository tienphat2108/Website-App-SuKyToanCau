import type { Metadata } from 'next';
import Link from 'next/link';
import { OnThisDayStrip } from '@/components/on-this-day/on-this-day-strip';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { localizePath } from '@/core/i18n/config';
import { getI18n } from '@/core/i18n/server';
import { toEventCards } from '@/core/presenters/event.presenter';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { historicalService } from '@/services/historical.service';
import { absoluteUrl } from '@/utils/site';

/**
 * Siêu dữ liệu trang ngày này năm xưa.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.onThisDay.title,
    description: dictionary.meta.onThisDay.description,
    keywords: dictionary.meta.keywords,
  });
}

/**
 * Trang "Ngày này năm xưa": liệt kê toàn bộ sự kiện trùng ngày hôm nay.
 * Ngày được tính phía trình duyệt theo giờ Việt Nam để không lệch theo múi giờ.
 */
export default async function OnThisDayPage() {
  const { locale, dictionary } = await getI18n();
  const events = await historicalService.getAll();
  const cards = toEventCards(events, locale);

  const homeHref = localizePath(locale, '/');
  const pageHref = localizePath(locale, '/on-this-day');
  const timelineHref = localizePath(locale, '/timeline');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.onThisDay.title, url: absoluteUrl(pageHref) },
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
              { label: dictionary.onThisDay.title },
            ]}
          />

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl animate-fade-up">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[2.9rem]">
                {dictionary.onThisDay.title}
              </h1>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
                {dictionary.onThisDay.pageIntro}
              </p>
            </div>

            <Link href={`${timelineHref}?view=timeline`} className="btn-secondary self-start lg:self-auto">
              {dictionary.event.backToTimeline}
            </Link>
          </div>
        </div>
      </section>

      <OnThisDayStrip
        events={cards}
        locale={locale}
        limit={0}
        labels={{
          title: dictionary.onThisDay.title,
          subtitle: dictionary.onThisDay.subtitle,
          datePrefix: dictionary.onThisDay.datePrefix,
          yearsAgo: dictionary.onThisDay.yearsAgo,
          thisYear: dictionary.onThisDay.thisYear,
          emptyTitle: dictionary.onThisDay.emptyTitle,
          emptyText: dictionary.onThisDay.emptyText,
          upcomingLabel: dictionary.onThisDay.upcomingLabel,
          upcomingItem: dictionary.onThisDay.upcomingItem,
          viewAll: dictionary.onThisDay.viewAll,
          readMore: dictionary.common.readMore,
          featured: dictionary.common.featured,
          minutes: dictionary.event.minuteRead,
        }}
      />

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
