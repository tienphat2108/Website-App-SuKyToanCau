import type { Metadata } from 'next';
import Link from 'next/link';
import { StudyPanel } from '@/components/study/study-panel';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { localizePath } from '@/core/i18n/config';
import { getI18n } from '@/core/i18n/server';
import { toEventCards } from '@/core/presenters/event.presenter';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { historicalService } from '@/services/historical.service';
import { absoluteUrl } from '@/utils/site';

/**
 * Siêu dữ liệu trang ôn tập. Trang chứa dữ liệu cá nhân của từng trình duyệt
 * nên không cho công cụ tìm kiếm lập chỉ mục.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.study.title,
    description: dictionary.meta.study.description,
    keywords: dictionary.meta.keywords,
    noindex: true,
  });
}

/**
 * Trang ôn tập: sự kiện đã lưu và tiến độ trắc nghiệm của người đọc.
 * Toàn bộ dữ liệu nằm trong bộ nhớ cục bộ của trình duyệt, máy chủ chỉ cung cấp
 * danh sách sự kiện để tra tên và đường dẫn.
 */
export default async function StudyPage() {
  const { locale, dictionary } = await getI18n();
  const events = await historicalService.getAll();
  const cards = toEventCards(events, locale);

  const homeHref = localizePath(locale, '/');
  const pageHref = localizePath(locale, '/study');
  const timelineHref = localizePath(locale, '/timeline');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.study.title, url: absoluteUrl(pageHref) },
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
              { label: dictionary.study.title },
            ]}
          />

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl animate-fade-up">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[2.9rem]">
                {dictionary.study.title}
              </h1>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
                {dictionary.study.pageIntro}
              </p>
            </div>

            <Link href={timelineHref} className="btn-secondary self-start lg:self-auto">
              {dictionary.event.backToTimeline}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <StudyPanel
          events={cards}
          locale={locale}
          labels={{
            savedTitle: dictionary.study.savedTitle,
            savedSubtitle: dictionary.study.savedSubtitle,
            savedEmpty: dictionary.study.savedEmpty,
            savedEmptyCta: dictionary.study.savedEmptyCta,
            unsave: dictionary.study.unsave,
            progressTitle: dictionary.study.progressTitle,
            progressSubtitle: dictionary.study.progressSubtitle,
            progressEmpty: dictionary.study.progressEmpty,
            progressEmptyCta: dictionary.study.progressEmptyCta,
            best: dictionary.study.best,
            attempts: dictionary.study.attempts,
            last: dictionary.study.last,
            readMore: dictionary.common.readMore,
            featured: dictionary.common.featured,
            minutes: dictionary.event.minuteRead,
          }}
        />
      </section>

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
