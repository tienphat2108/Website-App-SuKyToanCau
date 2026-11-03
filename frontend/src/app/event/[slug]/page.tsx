import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { JsonLd } from '@/components/ui/json-ld';
import { EventCard } from '@/components/events/event-card';
import { EventQuiz } from '@/components/event/event-quiz';
import { FavoriteButton } from '@/components/event/favorite-button';
import { ShareButtons } from '@/components/event/share-buttons';
import { MapPanel } from '@/components/map/map-panel';
import { BreathingImage } from '@/components/motion/breathing-image';
import { Reveal } from '@/components/motion/reveal';
import { revealDelay } from '@/components/motion/stagger';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { toEventCard } from '@/core/presenters/event.presenter';
import { historicalService, findSameYearWorldEvents, type ExternalSummary } from '@/services/historical.service';
import { getImageCredit, licenseLabel } from '@/data/image-credits';
import { absoluteUrl } from '@/utils/site';
import { buildQuizDeck } from '@/lib/event-quiz';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { readingTime } from '@/utils/format';

/** Tham số đường dẫn của trang chi tiết. */
type PageProps = { params: Promise<{ slug: string }> };

/** Thời gian chờ tối đa cho đoạn tóm tắt bên ngoài để không làm chậm trang. */
const EXTERNAL_TIMEOUT_MS = 1800;

/**
 * Gọi dịch vụ tóm tắt bên ngoài với giới hạn thời gian.
 * Nếu nguồn ngoài chậm hoặc lỗi, bài viết chính vẫn hiển thị bình thường.
 * @param slug Khóa sự kiện.
 * @param locale Ngôn ngữ mong muốn.
 * @returns Đoạn tóm tắt hoặc null.
 */
async function loadExternalSummary(
  slug: string,
  locale: 'vi' | 'en',
): Promise<ExternalSummary | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      historicalService.getExternalSummary(slug, locale),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), EXTERNAL_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Tạo siêu dữ liệu riêng cho bài viết, gồm tiêu đề, mô tả và loại nội dung bài viết.
 * @param props.params Tham số đường dẫn chứa khóa sự kiện.
 * @returns Siêu dữ liệu của trang hoặc thông báo không tìm thấy.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dictionary } = await getI18n();
  const event = await historicalService.getBySlug(slug);

  if (!event) {
    return createPageMetadata({
      title: dictionary.meta.notFound.title,
      description: dictionary.meta.notFound.description,
      noindex: true,
    });
  }

  const summary = event.summary(locale);

  return createPageMetadata({
    title: event.title(locale),
    description: summary.length > 165 ? `${summary.slice(0, 162).trimEnd()}…` : summary,
    type: 'article',
    keywords: event.tags(locale),
    modifiedTime: event.updatedAt ?? undefined,
  });
}

/**
 * Trang chi tiết một sự kiện lịch sử.
 * Bao gồm bối cảnh, nội dung nhiều đoạn, thông tin tra cứu, bản đồ, nguồn mở rộng,
 * bài viết liên quan và điều hướng tới sự kiện trước/sau theo thời gian.
 * @param props.params Tham số đường dẫn chứa khóa sự kiện.
 */
export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, dictionary } = await getI18n();
  const [event, allEvents] = await Promise.all([
    historicalService.getBySlug(slug),
    historicalService.getAll(),
  ]);

  if (!event) {
    notFound();
  }

  const external = await loadExternalSummary(event.slug, locale);
  const content = event.content(locale);
  const paragraphs = content.length > 0 ? content : [event.summary(locale)];
  const minutes = readingTime(paragraphs);
  const tags = event.tags(locale);
  const eventUrl = absoluteUrl(event.href(locale));
  const imageCredit = getImageCredit(event.slug);

  const currentIndex = allEvents.findIndex((item) => item.slug === event.slug);
  const previousEvent = currentIndex > 0 ? allEvents[currentIndex - 1] : null;
  const nextEvent =
    currentIndex >= 0 && currentIndex < allEvents.length - 1 ? allEvents[currentIndex + 1] : null;

  const relatedFromSlugs = event.relatedSlugs
    .map((relatedSlug) => allEvents.find((item) => item.slug === relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const relatedEvents = (event.related.length > 0 ? event.related : relatedFromSlugs)
    .filter((item) => item.slug !== event.slug)
    .slice(0, 3);

  const sameYearEvents = findSameYearWorldEvents(allEvents, event, 3);

  /**
   * Định dạng năm hiển thị, kèm nhãn trước Công nguyên khi cần.
   * @param year Năm cần hiển thị.
   * @returns Chuỗi năm đã định dạng.
   */
  const formatYear = (year: number): string =>
    year < 0
      ? `${Math.abs(year)} ${dictionary.event.sameYearBc}`
      : String(year);

  const quizDeck = buildQuizDeck(event, allEvents, locale, dictionary);

  const tocItems = [
    { id: 'noi-dung', label: dictionary.event.overview },
    ...(quizDeck.length > 0 ? [{ id: 'trac-nghiem', label: dictionary.event.quizToc }] : []),
    { id: 'thong-tin', label: dictionary.event.keyFacts },
    { id: 'ban-do', label: dictionary.event.mapTitle },
    ...(sameYearEvents.length > 0
      ? [{ id: 'cung-nam', label: dictionary.event.sameYearToc }]
      : []),
    { id: 'nguon', label: dictionary.event.sources },
  ];

  const timelineHref = localizePath(locale, '/timeline');
  const homeHref = localizePath(locale, '/');

  const marker = {
    slug: event.slug,
    title: event.title(locale),
    subtitle: `${event.dateLabel(locale)} · ${event.eraName(locale)}`,
    href: event.href(locale),
    latitude: event.latitude,
    longitude: event.longitude,
  };

  // Liên kết chỉ đường mở ứng dụng bản đồ bên ngoài, không tải bất kỳ ảnh nền nào vào trang.
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;

  const breadcrumbs = [
    { label: dictionary.common.home, href: homeHref },
    { label: dictionary.event.breadcrumbTimeline, href: timelineHref },
    { label: event.title(locale) },
  ];

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.event.breadcrumbTimeline, url: absoluteUrl(timelineHref) },
    { label: event.title(locale), url: eventUrl },
  ]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: event.title(locale),
    description: event.summary(locale),
    image: [absoluteUrl(event.imagePath)],
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': eventUrl },
    contentLocation: {
      '@type': 'Place',
      name: event.location(locale),
      address: { '@type': 'PostalAddress', addressCountry: event.countryName(locale) },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.latitude,
        longitude: event.longitude,
      },
    },
    spatialCoverage: event.location(locale),
    author: { '@type': 'Organization', name: dictionary.meta.siteName },
    publisher: {
      '@type': 'Organization',
      name: dictionary.meta.siteName,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') },
    },
    about: [event.eraName(locale), event.countryName(locale), ...tags].slice(0, 8),
    ...(event.sources.length > 0
      ? {
          citation: event.sources.map((source) => ({
            '@type': 'CreativeWork',
            name: source.title,
            publisher: { '@type': 'Organization', name: source.publisher },
            url: source.url,
            inLanguage: source.language === 'en' ? 'en' : 'vi-VN',
          })),
        }
      : {}),
    ...(event.updatedAt ? { dateModified: event.updatedAt } : {}),
  };

  /**
   * Tạo địa chỉ Wikipedia theo ngôn ngữ và tiêu đề bài viết gốc.
   * @returns Địa chỉ ngoài hoặc null nếu chưa có tiêu đề.
   */
  const wikipediaUrl = event.wikiTitle
    ? `https://${locale === 'vi' ? 'vi' : 'en'}.wikipedia.org/wiki/${encodeURIComponent(
        event.wikiTitle.replace(/ /g, '_'),
      )}`
    : null;

  const eventLabels = {
    readMore: dictionary.common.readMore,
    featured: dictionary.common.featured,
    minutes: dictionary.event.minuteRead,
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="surface-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

        <div className="container-page relative py-8">
          <Breadcrumbs label={dictionary.a11y.breadcrumb} items={breadcrumbs} />

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-active">{event.eraName(locale)}</span>
                {event.featured ? (
                  <span className="chip border-gold/40 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5Z" />
                    </svg>
                    {dictionary.common.featured}
                  </span>
                ) : null}
                <span className="font-ui text-[0.8125rem] font-medium text-muted">{event.countryName(locale)}</span>
              </div>

              <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                {event.title(locale)}
              </h1>

              <p className="mt-5 max-w-2xl border-l-2 border-gold/60 pl-4 text-base leading-relaxed text-muted sm:text-lg">
                {event.summary(locale)}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-surface/75 px-4 py-3 font-ui text-sm text-muted backdrop-blur">
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 2" strokeLinecap="round" />
                  </svg>
                  {event.dateLabel(locale)}
                </span>
                <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                  {event.location(locale)}
                </span>
                <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
                    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />
                  </svg>
                  {minutes} {dictionary.event.minuteRead}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <FavoriteButton
                  slug={event.slug}
                  favoriteLabel={dictionary.a11y.favorite}
                  unfavoriteLabel={dictionary.a11y.unfavorite}
                />
                <ShareButtons
                  url={eventUrl}
                  title={event.title(locale)}
                  labels={{
                    share: dictionary.common.share,
                    copyLink: dictionary.event.copyLink,
                    copied: dictionary.event.copied,
                    facebook: dictionary.event.facebook,
                    newTab: dictionary.a11y.externalLink,
                    x: dictionary.event.x,
                  }}
                />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl animate-fade-in">
              <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-1.5 shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-raised">
                  <BreathingImage
                    src={event.imagePath}
                    alt={event.imageAlt(locale)}
                    priority
                    sizes="(max-width: 1024px) 92vw, 44vw"
                  />
                </div>
                {imageCredit ? (
                  <p className="px-3 py-2 font-ui text-[0.75rem] leading-relaxed text-muted">
                    <span className="text-muted/80">{dictionary.event.imageCredit}: </span>
                    <span className="text-ink/80">{imageCredit.author}</span>
                    <span aria-hidden="true"> · </span>
                    {imageCredit.licenseUrl ? (
                      <a
                        href={imageCredit.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line underline-offset-2 transition hover:text-accent hover:decoration-accent"
                      >
                        {licenseLabel(imageCredit, locale)}
                        <span className="sr-only">
                          {' '}
                          {dictionary.a11y.externalLink}
                        </span>
                      </a>
                    ) : (
                      <span>{licenseLabel(imageCredit, locale)}</span>
                    )}
                    {imageCredit.sourceUrl ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        <a
                          href={imageCredit.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-line underline-offset-2 transition hover:text-accent hover:decoration-accent"
                        >
                          {dictionary.event.imageSource}
                          <span className="sr-only">
                            {' '}
                            {dictionary.a11y.externalLink}
                          </span>
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mx-auto grid max-w-[68rem] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <article id="noi-dung" className="min-w-0 scroll-mt-28">
          <div className="flex items-center gap-3">
            <span className="font-ui text-[0.8125rem] font-medium text-muted">
              {dictionary.event.overview}
            </span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>

          <div className="dropcap prose-history mt-6">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'text-[1.14rem] leading-[1.9]' : undefined}>
                {paragraph}
              </p>
            ))}
          </div>

          {tags.length > 0 ? (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-ui text-[0.8125rem] font-semibold text-muted">
                {dictionary.event.tags}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {quizDeck.length > 0 ? (
            <EventQuiz
              key={`${event.slug}:${locale}`}
              deck={quizDeck}
              labels={{
                eyebrow: dictionary.event.quizEyebrow,
                title: dictionary.event.quizTitle,
                intro: dictionary.event.quizIntro,
                countLegend: dictionary.event.quizCountLegend,
                countOption: dictionary.event.quizCountOption,
                submit: dictionary.event.quizSubmit,
                retry: dictionary.event.quizRetry,
                score: dictionary.event.quizScore,
                perfect: dictionary.event.quizPerfect,
                correct: dictionary.event.quizCorrect,
                incorrect: dictionary.event.quizIncorrect,
                correctAnswer: dictionary.event.quizCorrectAnswer,
                needAll: dictionary.event.quizNeedAll,
              }}
            />
          ) : null}

          {sameYearEvents.length > 0 ? (
            <section
              id="cung-nam"
              aria-labelledby="cung-nam-title"
              className="relative mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-gold/30 bg-surface p-5 sm:p-6"
            >
              <span
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-accent to-accent-strong"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-ui text-[0.8125rem] font-medium text-gold">
                    {dictionary.event.sameYearEyebrow}
                  </p>
                  <h2
                    id="cung-nam-title"
                    className="mt-1.5 font-display text-xl font-semibold text-ink"
                  >
                    {dictionary.event.sameYearTitle}
                  </h2>
                </div>
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"
                  aria-hidden="true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5Z" />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                {dictionary.event.sameYearSubtitle}
              </p>

              <ol className="mt-5 space-y-2.5">
                {sameYearEvents.map(({ event: sameYearEvent, year }) => (
                  <li key={sameYearEvent.slug}>
                    <Link
                      href={sameYearEvent.href(locale)}
                      className="group flex items-center gap-3.5 rounded-xl border border-line/70 bg-raised/40 px-3.5 py-3 transition hover:border-gold/40 hover:bg-raised"
                    >
                      <span className="grid w-[4.5rem] shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10 px-2 py-2 text-center">
                        <span className="font-ui text-[0.625rem] font-semibold uppercase tracking-wide text-gold">
                          {dictionary.event.sameYearChip}
                        </span>
                        <span className="font-display text-[0.9375rem] font-bold leading-tight text-ink">
                          {formatYear(year)}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] font-semibold leading-snug text-ink transition group-hover:text-accent">
                          {sameYearEvent.title(locale)}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
                          <span>{sameYearEvent.countryName(locale)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{sameYearEvent.dateLabel(locale)}</span>
                        </span>
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      >
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <div
            id="nguon"
            className="relative mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-line/80 bg-surface p-5 sm:p-6"
          >
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-accent to-accent-strong" aria-hidden="true" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-ui text-[0.8125rem] font-medium text-accent">
                  {dictionary.event.sources}
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-ink">
                  {dictionary.event.sourceList}
                </h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-raised text-muted" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
                  <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />
                </svg>
              </span>
            </div>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{dictionary.event.sourcesNote}</p>

            {event.sources.length > 0 ? (
              <ol className="mt-5 space-y-2.5">
                {event.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border border-line/70 bg-raised/40 px-3.5 py-3 transition hover:border-gold/40 hover:bg-raised"
                    >
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-ui text-[0.6875rem] font-semibold text-muted">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] font-semibold leading-snug text-ink group-hover:text-accent">
                          {source.title}
                          <span className="sr-only">
                            {' '}
                            {dictionary.a11y.externalLink}
                          </span>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
                          <span>{source.publisher}</span>
                          <span aria-hidden="true">·</span>
                          <span className="rounded-full border border-line/80 bg-surface px-2 py-0.5 text-[0.6875rem] font-medium">
                            {source.language === 'en'
                              ? dictionary.event.sourceLanguageEn
                              : dictionary.event.sourceLanguageVi}
                          </span>
                        </span>
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mt-1 shrink-0 text-muted transition group-hover:text-accent"
                        aria-hidden="true"
                      >
                        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}

            {external || wikipediaUrl ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="font-display text-base font-semibold text-ink">{dictionary.event.externalTitle}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{dictionary.event.externalNote}</p>

                {external ? (
                  <>
                    <blockquote className="mt-3 border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-ink/85">
                      {external.extract}
                    </blockquote>
                    <a
                      href={external.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-7 items-center gap-1.5 text-sm font-semibold text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
                    >
                      {dictionary.event.readOnWikipedia}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="sr-only">
                        {' '}
                        {dictionary.a11y.externalLink}
                      </span>
                    </a>
                  </>
                ) : wikipediaUrl ? (
                  <a
                    href={wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary mt-3 !min-h-10 !px-4 !py-2 text-sm"
                  >
                    {dictionary.event.readOnWikipedia}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="sr-only">
                      {' '}
                      {dictionary.a11y.externalLink}
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-raised/40 px-5 py-4 text-sm text-muted">
            <p className="max-w-xl">{dictionary.event.contentNote}</p>
            <Link
              href={localizePath(locale, '/contribute')}
              className="inline-flex min-h-7 shrink-0 items-center gap-1.5 font-semibold text-accent transition hover:text-accent-strong"
            >
              {dictionary.event.feedback}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {previousEvent ? (
              <Link
                href={previousEvent.href(locale)}
                className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                <span className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-muted">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {dictionary.event.previous}
                </span>
                <span className="mt-2 block font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
                  {previousEvent.title(locale)}
                </span>
                <span className="mt-1 block text-[0.8125rem] text-muted">{previousEvent.dateLabel(locale)}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}

            {nextEvent ? (
              <Link
                href={nextEvent.href(locale)}
                className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 text-right transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                <span className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-muted">
                  {dictionary.event.next}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mt-2 block font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
                  {nextEvent.title(locale)}
                </span>
                <span className="mt-1 block text-[0.8125rem] text-muted">{nextEvent.dateLabel(locale)}</span>
              </Link>
            ) : null}
          </div>
        </article>

        <aside className="space-y-6">
          <nav aria-label={dictionary.event.toc} className="card p-5 font-ui">
            <h2 className="text-[0.8125rem] font-semibold text-muted">
              {dictionary.event.toc}
            </h2>
            <ol className="mt-3 space-y-1">
              {tocItems.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 text-[0.9375rem] text-muted transition hover:bg-raised/70 hover:text-ink"
                  >
                    <span className="text-[0.75rem] font-semibold text-accent/80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                      className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                    >
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div id="thong-tin" className="card scroll-mt-28 overflow-hidden font-ui">
            <div className="border-b border-line bg-surface px-5 py-3.5">
              <h2 className="text-[0.8125rem] font-semibold text-accent">
                {dictionary.event.keyFacts}
              </h2>
            </div>
            <dl className="divide-y divide-line px-5 text-[0.9375rem]">
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-muted">{dictionary.event.era}</dt>
                <dd className="text-right font-medium text-ink">{event.eraName(locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-muted">{dictionary.event.country}</dt>
                <dd className="text-right font-medium text-ink">{event.countryName(locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-muted">{dictionary.event.date}</dt>
                <dd className="text-right font-medium text-ink">{event.dateLabel(locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-muted">{dictionary.event.location}</dt>
                <dd className="text-right font-medium text-ink">{event.location(locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 py-3">
                <dt className="text-muted">{dictionary.event.readingProgress}</dt>
                <dd className="text-right font-medium text-ink">
                  {minutes} {dictionary.event.minuteRead}
                </dd>
              </div>
              {event.updatedAt ? (
                <div className="flex justify-between gap-3 py-3">
                  <dt className="text-muted">{dictionary.event.updated}</dt>
                  <dd className="text-right font-medium text-ink">
                    {new Date(event.updatedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="px-5 pb-5">
              <Link href={timelineHref} className="btn-secondary w-full">
                {dictionary.event.backToTimeline}
              </Link>
            </div>
          </div>

          <div id="ban-do" className="scroll-mt-28">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">{dictionary.event.mapTitle}</h2>
            <MapPanel
              markers={[marker]}
              labels={{
                ariaLabel: dictionary.a11y.map,
                readMore: dictionary.common.readMore,
                attribution: dictionary.common.mapCredit,
                openGoogle: dictionary.common.openGoogleMap,
                cluster: dictionary.common.mapCluster,
                zoomIn: dictionary.a11y.zoomIn,
                zoomOut: dictionary.a11y.zoomOut,
                closePopup: dictionary.a11y.closePopup,
                externalLink: dictionary.a11y.externalLink,
              }}
              center={[event.latitude, event.longitude]}
              zoom={6}
              className="h-[20rem]"
            />
            <p className="mt-2 font-ui text-[0.8125rem] leading-relaxed text-muted">{dictionary.event.mapHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !min-h-9 !px-3.5 !py-1.5 text-[0.8125rem]"
              >
                {dictionary.event.directions}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M14 4h6v6M20 4l-9 9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" strokeLinecap="round" />
                </svg>
                <span className="sr-only">
                  {' '}
                  {dictionary.a11y.externalLink}
                </span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {relatedEvents.length > 0 ? (
        <section className="border-t border-line bg-surface/50 section-y">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Reveal style="ink" className="max-w-2xl">
                <h2 className="font-display text-[1.9rem] font-bold leading-tight text-ink sm:text-[2.35rem]">
                  {dictionary.event.related}
                </h2>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{dictionary.event.relatedSubtitle}</p>
              </Reveal>
              <Link href={timelineHref} className="btn-secondary">
                {dictionary.event.backToTimeline}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((related, index) => (
                <Reveal key={related.slug} className="h-full" delay={revealDelay(index)}>
                  <EventCard
                    event={toEventCard(related, locale)}
                    labels={eventLabels}
                    className="h-full"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />
    </>
  );
}
