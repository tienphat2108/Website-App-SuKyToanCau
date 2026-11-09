'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EventCard } from '@/components/events/event-card';
import { MapPanel } from '@/components/map/map-panel';
import { Reveal } from '@/components/motion/reveal';
import { revealDelay } from '@/components/motion/stagger';
import { ScrollRail } from '@/components/motion/scroll-rail';
import { useI18n } from '@/components/providers/i18n-provider';
import { ERAS } from '@/core/models/HistoricalEvent';
import type { EventCardModel } from '@/core/presenters/event.presenter';
import { formatMessage } from '@/core/i18n/dictionary';
import { countryLabel } from '@/data/countries';
import { formatYearRange, normalizeSearchText } from '@/utils/format';
import { clearPreferredCountry, sortByPreferredCountry } from '@/utils/preferred-country';

/** Chế độ xem của trang dòng thời gian. */
type ViewMode = 'timeline' | 'map';

/**
 * Bộ lọc và hai chế độ xem của trang dòng thời gian.
 *
 * Dữ liệu được tải sẵn ở máy chủ và lọc tại trình duyệt vì số lượng sự kiện còn nhỏ;
 * cách này giữ phản hồi tức thì và vẫn dễ thay bằng tìm kiếm phía máy chủ khi dữ liệu lớn hơn.
 * @param props.events Danh sách sự kiện đã bản địa hóa.
 * @param props.initialEra Thời kỳ chọn sẵn từ đường dẫn.
 * @param props.initialCountry Quốc gia chọn sẵn từ đường dẫn.
 * @param props.initialQuery Từ khóa chọn sẵn từ đường dẫn.
 * @param props.initialView Chế độ xem ban đầu.
 * @param props.initialPreferredCountry Quốc gia hoặc khu vực người đọc đã chọn.
 */
export function TimelineExplorer({
  events,
  initialEra = '',
  initialCountry = '',
  initialQuery = '',
  initialView = 'timeline',
  initialPreferredCountry = '',
}: {
  events: EventCardModel[];
  initialEra?: string;
  initialCountry?: string;
  initialQuery?: string;
  initialView?: ViewMode;
  initialPreferredCountry?: string;
}) {
  const { locale, dictionary } = useI18n();
  const router = useRouter();
  const [era, setEra] = useState(initialEra);
  const [country, setCountry] = useState(initialCountry);
  const [search, setSearch] = useState(initialQuery);
  const [view, setView] = useState<ViewMode>(initialView === 'map' ? 'map' : 'timeline');
  const [preferred, setPreferred] = useState(initialPreferredCountry);

  // Máy chủ đọc lại cookie sau khi người đọc đổi lựa chọn ở thanh điều hướng.
  useEffect(() => {
    setPreferred(initialPreferredCountry);
  }, [initialPreferredCountry]);

  const preferredName = countryLabel(preferred, locale);

  /** Danh sách quốc gia suy ra từ dữ liệu, sắp xếp theo ngôn ngữ hiện tại. */
  const countries = useMemo(() => {
    const unique = new Map<string, string>();
    for (const event of events) {
      if (!unique.has(event.country)) {
        unique.set(event.country, event.country);
      }
    }

    return [...unique.values()].sort((left, right) => left.localeCompare(right, locale));
  }, [events, locale]);

  /** Số sự kiện của từng thời kỳ, dùng cho nhãn trên nút lọc. */
  const eraCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      counts.set(event.era, (counts.get(event.era) ?? 0) + 1);
    }

    return counts;
  }, [events]);

  /** Danh sách sau khi áp dụng đồng thời thời kỳ, quốc gia và từ khóa. */
  const filtered = useMemo(() => {
    const term = normalizeSearchText(search.trim());

    return events.filter((event) => {
      if (era && event.era !== era) return false;
      if (country && event.country !== country) return false;
      if (term && !event.searchText.includes(term)) return false;
      return true;
    });
  }, [events, era, country, search]);

  /**
   * Danh sách đã lọc, đưa sự kiện của quốc gia người đọc chọn lên trước.
   * Giữ nguyên thứ tự thời gian tương đối giữa các sự kiện còn lại.
   */
  const ordered = useMemo(
    () => sortByPreferredCountry(filtered, (event) => event.countryKey, preferred),
    [filtered, preferred],
  );

  /** Các nhóm sự kiện theo thời kỳ, giữ thứ tự từ cổ đến kim và ưu tiên quốc gia đã chọn. */
  const groups = useMemo(
    () =>
      ERAS.map((definition) => ({
        definition,
        name: locale === 'en' ? definition.nameEn : definition.nameVi,
        items: ordered.filter((event) => event.era === definition.key),
      })).filter((group) => group.items.length > 0),
    [ordered, locale],
  );

  /** Điểm bản đồ dựng từ danh sách đã lọc. */
  const mapMarkers = useMemo(
    () =>
      ordered.map((event) => ({
        slug: event.slug,
        title: event.title,
        subtitle: `${event.dateLabel} · ${event.eraName}`,
        href: event.href,
        latitude: event.latitude,
        longitude: event.longitude,
        year: event.startYear,
      })),
    [ordered],
  );

  /**
   * Năm chặn trên của thanh trượt thời gian, nâng lên khỏi khung bản đồ để danh sách
   * chữ thay thế bản đồ liệt kê đúng các điểm đang hiển thị. null là toàn thời gian.
   */
  const [mapYearCeiling, setMapYearCeiling] = useState<number | null>(null);

  /** Điểm còn hiển thị sau khi kéo thanh trượt, dùng cho danh sách chữ song song. */
  const visibleMapMarkers = useMemo(() => {
    if (mapYearCeiling === null) {
      return mapMarkers;
    }

    return mapMarkers.filter((marker) => marker.year === undefined || marker.year <= mapYearCeiling);
  }, [mapMarkers, mapYearCeiling]);

  /** Nhãn thanh trượt thời gian giữ nguyên tham chiếu giữa các lần render. */
  const sliderLabels = useMemo(
    () => ({
      label: dictionary.timeline.timeSliderLabel,
      year: dictionary.timeline.timeSliderYear,
      all: dictionary.timeline.timeSliderAll,
      reset: dictionary.timeline.timeSliderReset,
    }),
    [dictionary],
  );

  /** Nhãn bản đồ giữ nguyên tham chiếu giữa các lần render để tránh dựng lại bản đồ. */
  const mapLabels = useMemo(
    () => ({
      ariaLabel: dictionary.a11y.map,
      readMore: dictionary.common.readMore,
      attribution: dictionary.common.mapCredit,
      openGoogle: dictionary.common.openGoogleMap,
      cluster: dictionary.common.mapCluster,
      zoomIn: dictionary.a11y.zoomIn,
      zoomOut: dictionary.a11y.zoomOut,
      closePopup: dictionary.a11y.closePopup,
      externalLink: dictionary.a11y.externalLink,
    }),
    [dictionary],
  );

  const hasFilters = Boolean(era || country || search);
  const eventLabels = {
    readMore: dictionary.common.readMore,
    featured: dictionary.common.featured,
    minutes: dictionary.event.minuteRead,
  };

  /**
   * Xóa toàn bộ bộ lọc và đưa chế độ xem về dòng thời gian.
   * @returns Không trả về giá trị.
   */
  const resetFilters = (): void => {
    setEra('');
    setCountry('');
    setSearch('');
    setView('timeline');
  };

  /**
   * Bỏ ưu tiên quốc gia đã lưu và tải lại nội dung do máy chủ dựng.
   * @returns Không trả về giá trị.
   */
  const clearPreference = (): void => {
    clearPreferredCountry();
    setPreferred('');
    router.refresh();
  };

  return (
    <div>
      {preferred ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/[0.08] px-4 py-3">
          <p className="inline-flex items-center gap-2 font-ui text-sm font-medium text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="shrink-0 text-gold">
              <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
            {formatMessage(dictionary.preferences.preferredNotice, { country: preferredName })}
          </p>
          <button
            type="button"
            onClick={clearPreference}
            className="font-ui text-[0.8125rem] font-semibold text-accent transition hover:text-accent-strong"
          >
            {dictionary.preferences.clear}
          </button>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-5 sm:p-6">
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden="true" />

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="timeline-search" className="field-label">
              {dictionary.timeline.searchLabel}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="timeline-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={dictionary.timeline.searchPlaceholder}
                className="field pl-11"
                autoComplete="off"
                maxLength={120}
              />
            </div>
          </div>

          <div>
            <label htmlFor="timeline-era" className="field-label">
              {dictionary.timeline.eraLabel}
            </label>
            <select
              id="timeline-era"
              value={era}
              onChange={(event) => setEra(event.target.value)}
              className="field select-press"
            >
              <option value="">{dictionary.timeline.allEras}</option>
              {ERAS.map((definition) => (
                <option key={definition.key} value={definition.key}>
                  {locale === 'en' ? definition.nameEn : definition.nameVi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="timeline-country" className="field-label">
              {dictionary.timeline.countryLabel}
            </label>
            <select
              id="timeline-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="field select-press"
            >
              <option value="">{dictionary.timeline.allCountries}</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="inline-flex rounded-full border border-line bg-background p-1"
              role="group"
              aria-label={dictionary.common.viewMode}
            >
              <button
                type="button"
                onClick={() => setView('timeline')}
                aria-pressed={view === 'timeline'}
                className={
                  view === 'timeline'
                    ? 'press inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-white'
                    : 'press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.8125rem] font-semibold text-muted hover:text-ink'
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 6h14M5 12h9M5 18h12" strokeLinecap="round" />
                </svg>
                {dictionary.timeline.viewTimeline}
              </button>
              <button
                type="button"
                onClick={() => setView('map')}
                aria-pressed={view === 'map'}
                className={
                  view === 'map'
                    ? 'press inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-white'
                    : 'press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.8125rem] font-semibold text-muted hover:text-ink'
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
                  <circle cx="12" cy="11" r="2.2" />
                </svg>
                {dictionary.timeline.viewMap}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-5">
          <span className="mr-1 font-ui text-[0.8125rem] font-medium text-muted">
            {dictionary.timeline.quickFilters}
          </span>
          <button
            type="button"
            onClick={() => setEra('')}
            aria-pressed={!era}
            className={`chip ${!era ? 'chip-active' : 'hover:border-accent/50'}`}
          >
            {dictionary.timeline.allEras}
            <span className="opacity-70">({events.length})</span>
          </button>
          {ERAS.map((definition) => {
            const active = era === definition.key;
            const count = eraCounts.get(definition.key) ?? 0;

            return (
              <button
                key={definition.key}
                type="button"
                onClick={() => setEra(definition.key)}
                aria-pressed={active}
                className={`chip ${active ? 'chip-active' : 'hover:border-accent/50'}`}
                disabled={count === 0}
              >
                {locale === 'en' ? definition.nameEn : definition.nameVi}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-sm text-muted">
          <span className="font-display text-lg font-semibold text-ink">
            {formatMessage(dictionary.timeline.results, { count: filtered.length })}
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 font-ui font-semibold text-accent transition hover:text-accent-strong"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
              {dictionary.timeline.reset}
            </button>
          ) : null}
        </p>
        <p className="inline-flex items-center gap-1.5 font-ui text-[0.8125rem] text-muted">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" strokeLinecap="round" />
          </svg>
          {dictionary.timeline.sortNote}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-raised text-muted" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5M8.5 11h5" strokeLinecap="round" />
            </svg>
          </span>
          <p className="mt-5 font-display text-xl font-semibold text-ink">{dictionary.timeline.noResults}</p>
          <button type="button" onClick={resetFilters} className="btn-secondary mt-5">
            {dictionary.timeline.reset}
          </button>
        </div>
      ) : view === 'map' ? (
        <div className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-line/80 bg-surface p-2">
            <MapPanel
              markers={mapMarkers}
              labels={mapLabels}
              className="h-[34rem] !border-0 !shadow-none"
              sliderLabels={sliderLabels}
              yearCeiling={mapYearCeiling}
              onYearCeilingChange={setMapYearCeiling}
            />
          </div>
          <p className="mt-3 text-[0.8125rem] text-muted">{dictionary.timeline.mapHint}</p>

          {/*
           * Bản đồ là nội dung đồ họa nên cần một bản thay thế bằng chữ. Danh sách giữ
           * đúng số thứ tự gắn trên ghim và mở được từng bài viết, người dùng trình đọc
           * màn hình hoặc người tắt hình ảnh vẫn lần theo được nội dung.
           */}
          <details className="mt-3 rounded-xl border border-line/80 bg-surface/60 px-4 py-3">
            <summary className="cursor-pointer font-ui text-[0.8125rem] font-semibold text-ink">
              {formatMessage(dictionary.timeline.mapListSummary, { count: visibleMapMarkers.length })}
            </summary>
            <ol className="mt-3 grid gap-2 font-ui text-[0.875rem] text-muted sm:grid-cols-2">
              {visibleMapMarkers.map((marker, index) => (
                <li key={marker.slug} className="flex gap-2">
                  <span aria-hidden="true" className="shrink-0 font-semibold text-ink">
                    {index + 1}.
                  </span>
                  <span>
                    <Link
                      href={marker.href}
                      className="font-semibold text-accent underline decoration-line underline-offset-2 hover:text-accent-strong"
                    >
                      {marker.title}
                    </Link>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    {marker.subtitle}
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {groups.map((group) => (
            <section
              key={group.definition.key}
              aria-labelledby={`era-${group.definition.key}`}
              className="relative md:pl-7"
            >
              {/* Nét dòng thời gian vẽ theo cuộn, bỏ trên màn hình hẹp để thẻ rộng hết khổ. */}
              <ScrollRail className="absolute inset-y-0 left-0 hidden w-px md:block" />

              <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
                <Reveal style="ink" className="flex items-center gap-4">
                  <span className="font-display text-4xl font-bold leading-none text-gold/70" aria-hidden="true">
                    0{group.definition.order}
                  </span>
                  <div>
                    <h2 id={`era-${group.definition.key}`} className="font-display text-2xl font-bold text-ink sm:text-3xl">
                      {group.name}
                    </h2>
                    <p className="mt-1 font-ui text-[0.8125rem] font-medium text-muted">
                      {formatYearRange(group.definition.fromYear, group.definition.toYear, locale)}
                    </p>
                  </div>
                </Reveal>
                <span className="chip">
                  {group.items.length} {dictionary.common.events}
                </span>
              </div>

              {/* Nét ngăn giữa tiêu đề thời kỳ và các thẻ, quét từ trái sang khi khối vào tầm nhìn. */}
              <Reveal style="wipe" className="h-px w-full bg-line/80" />

              <div className="mt-6">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((event, index) => (
                    <Reveal
                      key={event.slug}
                      className="h-full"
                      delay={revealDelay(index)}
                      immediate={hasFilters}
                    >
                      <div className="h-full">
                        <EventCard
                          event={event}
                          labels={eventLabels}
                          priority={index < 2 && group.definition.order === 1}
                          className="h-full"
                        />
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
