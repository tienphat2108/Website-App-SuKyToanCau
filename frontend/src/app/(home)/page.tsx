import type { Metadata } from 'next';
import Link from 'next/link';
import { EraCard } from '@/components/events/era-card';
import { EventCard } from '@/components/events/event-card';
import { MapPanel } from '@/components/map/map-panel';
import { BreathingImage } from '@/components/motion/breathing-image';
import { Reveal } from '@/components/motion/reveal';
import { revealDelay } from '@/components/motion/stagger';
import { StatCounter } from '@/components/motion/stat-counter';
import { CountryPreference } from '@/components/preferences/country-preference';
import { BrandMark } from '@/components/ui/brand-mark';
import { SectionHeading } from '@/components/ui/section-heading';
import { JsonLd } from '@/components/ui/json-ld';
import { getI18n } from '@/core/i18n/server';
import { getPreferredCountry } from '@/core/preferences/server';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { ERAS } from '@/core/models/HistoricalEvent';
import { toEventCard, toEventCards } from '@/core/presenters/event.presenter';
import { countryLabel } from '@/data/countries';
import { historicalService } from '@/services/historical.service';
import { createPageMetadata } from '@/lib/seo';
import { cn, formatNumber, formatYearRange } from '@/utils/format';
import { sortByPreferredCountry } from '@/utils/preferred-country';

/**
 * Siêu dữ liệu trang chủ.
 * @returns Tiêu đề, mô tả và liên kết canonical riêng cho ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.home.title,
    description: dictionary.meta.home.description,
    keywords: dictionary.meta.keywords,
  });
}

/**
 * Trang chủ giới thiệu bách khoa lịch sử.
 * Dữ liệu được đọc ở máy chủ; nếu API không sẵn sàng, dịch vụ tự dùng bộ dữ liệu mẫu
 * để trang chủ vẫn có nội dung đầy đủ.
 */
export default async function HomePage() {
  const { locale, dictionary } = await getI18n();
  const [events, stats, preferredCountry] = await Promise.all([
    historicalService.getAll(),
    historicalService.getStats(),
    getPreferredCountry(),
  ]);

  const cards = toEventCards(events, locale);
  // Quốc gia người đọc đã chọn được đẩy lên trước trong khu vực nổi bật.
  const featured = sortByPreferredCountry(
    cards.filter((event) => event.featured),
    (event) => event.countryKey,
    preferredCountry,
  ).slice(0, 6);
  const latest = cards.slice().sort((left, right) => right.startYear - left.startYear).slice(0, 3);
  const preferredName = countryLabel(preferredCountry, locale);
  // Ba mốc son của quốc gia đã chọn: ưu tiên sự kiện nổi bật, sau đó theo thời gian.
  const preferredCards = preferredCountry
    ? cards
        .filter((event) => event.countryKey === preferredCountry)
        .sort(
          (left, right) =>
            Number(right.featured) - Number(left.featured) || left.startYear - right.startYear,
        )
        .slice(0, 3)
    : [];

  const eraCounts = new Map<string, number>();
  for (const event of cards) {
    eraCounts.set(event.era, (eraCounts.get(event.era) ?? 0) + 1);
  }

  const mapMarkers = events.map((event) => ({
    slug: event.slug,
    title: event.title(locale),
    subtitle: `${event.dateLabel(locale)} · ${event.eraName(locale)}`,
    href: event.href(locale),
    latitude: event.latitude,
    longitude: event.longitude,
  }));

  const mapLabels = {
    ariaLabel: dictionary.a11y.map,
    readMore: dictionary.common.readMore,
    attribution: dictionary.common.mapCredit,
    openGoogle: dictionary.common.openGoogleMap,
    cluster: dictionary.common.mapCluster,
    zoomIn: dictionary.a11y.zoomIn,
    zoomOut: dictionary.a11y.zoomOut,
    closePopup: dictionary.a11y.closePopup,
    externalLink: dictionary.a11y.externalLink,
  };

  const eventLabels = {
    readMore: dictionary.common.readMore,
    featured: dictionary.common.featured,
    minutes: dictionary.event.minuteRead,
  };

  const timelineHref = localizePath(locale, '/timeline');
  const contributeHref = localizePath(locale, '/contribute');
  const faqHref = localizePath(locale, '/faq');

  const statsItems = [
    { value: stats.totalEvents, label: dictionary.home.stats.events },
    { value: stats.totalEras || ERAS.length, label: dictionary.home.stats.eras },
    { value: stats.totalCountries, label: dictionary.home.stats.countries },
    { value: 2, label: dictionary.home.stats.languages },
  ];

  const eraNames = ERAS.map((era) => (locale === 'en' ? era.nameEn : era.nameVi));
  const markerLabel = formatMessage(dictionary.home.map.markerLabel, { count: mapMarkers.length });

  // Dữ liệu có cấu trúc liệt kê các bài viết để công cụ tìm kiếm hiểu cấu trúc trang chủ.
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dictionary.meta.home.title,
    description: dictionary.meta.home.description,
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: cards.length,
      itemListElement: cards.map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${localizePath(locale, event.href.replace(/^\/en/, ''))}`,
        name: event.title,
      })),
    },
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="surface-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -right-40 -top-24 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden="true" />

        <div className="container-page relative pb-16 pt-12 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <p className="text-[0.8125rem] font-medium text-muted lg:hidden">
                {dictionary.home.hero.note}
              </p>

              <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-[3.25rem] xl:text-[3.6rem]">
                {dictionary.home.hero.title}
                <span className="mt-2 block text-accent">{dictionary.home.hero.titleAccent}</span>
              </h1>

              <p className="mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-muted sm:text-[1.125rem]">
                {dictionary.home.hero.description}
              </p>

              {/* Biểu mẫu tìm kiếm thật, chuyển thẳng từ khóa sang trang dòng thời gian. */}
              <form
                action={timelineHref}
                method="get"
                role="search"
                className="mt-8 max-w-xl"
              >
                <label
                  htmlFor="hero-search"
                  className="text-[0.8125rem] font-semibold text-ink"
                >
                  {dictionary.home.hero.searchHint}
                </label>
                <div className="search-pill mt-2 flex items-center gap-1.5 rounded-full border border-line bg-surface p-1.5 pl-4 transition focus-within:border-accent/45">
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
                    id="hero-search"
                    type="search"
                    name="q"
                    maxLength={120}
                    placeholder={dictionary.timeline.searchPlaceholder}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-muted/80"
                  />
                  <button type="submit" className="btn-primary !min-h-10 shrink-0 !px-5 !py-2 text-sm">
                    {dictionary.home.hero.searchCta}
                  </button>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[0.8125rem] font-medium text-muted">
                  {dictionary.timeline.eraLabel}
                </span>
                {ERAS.map((era) => (
                  <Link
                    key={era.key}
                    href={`${timelineHref}?era=${era.key}`}
                    className="chip transition hover:border-gold/60 hover:text-accent"
                  >
                    {locale === 'en' ? era.nameEn : era.nameVi}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={timelineHref} className="btn-primary">
                  {dictionary.home.hero.primaryCta}
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href={contributeHref} className="btn-secondary">
                  {dictionary.home.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl animate-fade-in">
              <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-1.5 shadow-card">
                <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-raised">
                  <BreathingImage
                    src="/images/hero.svg"
                    alt={dictionary.home.hero.imageAlt}
                    priority
                    sizes="(max-width: 1024px) 90vw, 44vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="text-[0.8125rem] font-medium text-white/70">
                      {dictionary.home.eras.eyebrow}
                    </p>
                    <ul className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.875rem] font-medium text-white/90">
                      {eraNames.map((name, index) => (
                        <li key={name} className="flex items-center gap-2.5">
                          {index > 0 ? (
                            <span className="h-1 w-1 rounded-full bg-gold/70" aria-hidden="true" />
                          ) : null}
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Con dấu nhỏ gợi số lượng bài viết, đặt lệch khỏi khung ảnh như một dấu triện. */}
              <div className="absolute -right-2 top-5 grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-accent text-center text-white sm:-right-4">
                <span className="block">
                  <span className="block font-display text-xl font-bold leading-none">
                    {formatNumber(stats.totalEvents, locale)}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] font-medium text-white/85">
                    {dictionary.common.events}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-line/80 bg-surface sm:grid-cols-4"
            aria-label={dictionary.home.stats.events}
          >
            {statsItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'relative px-5 py-5 sm:px-6 sm:py-6',
                  index > 0 && 'border-l border-line',
                  index >= 2 && 'border-t border-line sm:border-t-0',
                )}
              >
                <p className="font-display text-[1.8rem] font-bold leading-none tracking-tight text-ink sm:text-[2.1rem]">
                  <StatCounter value={item.value} />
                </p>
                <p className="mt-1.5 font-ui text-[0.8125rem] font-medium leading-snug text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {preferredCards.length > 0 ? (
        <section className="border-y border-line bg-gold/[0.05] section-y">
          <div className="container-page">
            <SectionHeading
              title={formatMessage(dictionary.preferences.countrySectionTitle, {
                country: preferredName,
              })}
              subtitle={dictionary.preferences.countrySectionSubtitle}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <CountryPreference value={preferredCountry} compact />
                  <Link
                    href={`${timelineHref}?country=${encodeURIComponent(preferredCountry)}`}
                    className="btn-secondary"
                  >
                    {dictionary.home.featured.cta}
                  </Link>
                </div>
              }
            />

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {preferredCards.map((event, index) => (
                <Reveal key={event.slug} className="h-full" delay={revealDelay(index)}>
                  <EventCard event={event} labels={eventLabels} priority={index === 0} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page section-y">
        <SectionHeading
          title={dictionary.home.featured.title}
          subtitle={dictionary.home.featured.subtitle}
          action={
            <div className="flex flex-wrap items-end gap-2">
              {preferredCards.length === 0 ? (
                <CountryPreference value={preferredCountry} compact />
              ) : null}
              <Link href={timelineHref} className="btn-secondary">
                {dictionary.home.featured.cta}
              </Link>
            </div>
          }
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((event, index) => (
            <Reveal key={event.slug} className="h-full" delay={revealDelay(index)}>
              <EventCard
                event={event}
                labels={eventLabels}
                priority={index < 3}
                showFeaturedBadge={false}
                className="h-full"
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/50 section-y">
        <div className="container-page">
          <SectionHeading
            title={dictionary.home.eras.title}
            subtitle={dictionary.home.eras.subtitle}
            align="center"
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ERAS.map((era, index) => {
              const name = locale === 'en' ? era.nameEn : era.nameVi;
              const periodLabel = formatYearRange(era.fromYear, era.toYear, locale);
              const alt =
                locale === 'en'
                  ? `Illustration of the ${name.toLowerCase()} era`
                  : `Minh họa thời kỳ ${name.toLowerCase()}`;

              return (
                <Reveal key={era.key} className="h-full" delay={revealDelay(index)}>
                  <EraCard
                    era={era}
                    name={name}
                    count={eraCounts.get(era.key) ?? 0}
                    href={`${timelineHref}?era=${era.key}`}
                    eventLabel={dictionary.home.eras.eventCount}
                    periodLabel={periodLabel}
                    imageAlt={alt}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <div className="relative overflow-hidden rounded-2xl bg-night p-5 sm:p-8 lg:p-10">
          <div className="surface-grid absolute inset-0 opacity-[0.06]" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <Reveal>
              <h2 className="font-display text-[2rem] font-bold leading-[1.12] text-white sm:text-[2.5rem]">
                {dictionary.home.map.title}
              </h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">
                {dictionary.home.map.subtitle}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.8125rem] font-medium text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                {markerLabel}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={`${timelineHref}?view=map`} className="btn-gold">
                  {dictionary.home.map.cta}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <span className="text-[0.8125rem] text-white/60">{dictionary.home.map.hint}</span>
              </div>
            </Reveal>

            <MapPanel
              markers={mapMarkers}
              labels={mapLabels}
              className="map-night h-[24rem] !border-white/10 shadow-night lg:h-[27rem]"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/50 section-y">
        <div className="container-page">
          <SectionHeading
            title={dictionary.home.latest.title}
            subtitle={dictionary.home.latest.subtitle}
            action={
              <Link href={timelineHref} className="btn-secondary">
                {dictionary.home.latest.cta}
              </Link>
            }
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((event, index) => (
              <Reveal key={event.slug} className="h-full" delay={revealDelay(index)}>
                <EventCard event={event} labels={eventLabels} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <SectionHeading
          title={dictionary.home.method.title}
          align="center"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: dictionary.home.method.item1Title, text: dictionary.home.method.item1Text },
            { title: dictionary.home.method.item2Title, text: dictionary.home.method.item2Text },
            { title: dictionary.home.method.item3Title, text: dictionary.home.method.item3Text },
          ].map((item, index) => (
            <Reveal key={item.title} className="h-full" delay={revealDelay(index)}>
              <div className="card-hover relative h-full overflow-hidden p-6">
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-[0.8125rem] font-bold text-gold">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-snug text-ink">{item.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-night px-6 py-14 text-center sm:px-12 lg:py-20">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 right-6 opacity-[0.07]" aria-hidden="true">
            <BrandMark tone="night" className="h-64 w-64" />
          </div>

          <Reveal className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-[2.7rem]">
              {dictionary.home.cta.title}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">{dictionary.home.cta.text}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={contributeHref} className="btn-gold">
                {dictionary.home.cta.button}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={faqHref}
                className="btn border border-white/20 text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {dictionary.home.cta.secondary}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={collectionJsonLd} />
    </>
  );
}
