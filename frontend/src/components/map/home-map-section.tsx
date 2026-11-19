'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapFilterBar, type MapFilterValues } from '@/components/map/map-filter-bar';
import { MapPanel } from '@/components/map/map-panel';
import { Reveal } from '@/components/motion/reveal';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import { normalizeSearchText } from '@/utils/format';

/**
 * Một điểm trên bản đồ trang chủ, kèm ba trường phục vụ lọc phía trình duyệt.
 * Chỉ chứa giá trị thuần để truyền từ máy chủ sang trình duyệt.
 */
export interface HomeMapPoint {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  latitude: number;
  longitude: number;
  year: number;
  era: string;
  /** Tên quốc gia đã bản địa hóa, dùng làm giá trị ô chọn. */
  country: string;
  searchText: string;
}

const EMPTY_FILTERS: MapFilterValues = { search: '', era: '', country: '' };

/**
 * Khối bản đồ nền tối của trang chủ: chữ giới thiệu bên trái, bản đồ có bộ lọc bên phải.
 *
 * Bộ lọc chạy ngay tại trình duyệt trên danh sách đã tải sẵn ở máy chủ, giống trang
 * dòng thời gian, nên gõ tới đâu số điểm và danh sách chữ đổi tới đó. Thanh trượt
 * thời gian được nâng lên đây để danh sách chữ liệt kê đúng các điểm còn hiển thị.
 * @param props.points Toàn bộ điểm bản đồ của kho sự kiện.
 */
export function HomeMapSection({ points }: { points: HomeMapPoint[] }) {
  const { locale, dictionary } = useI18n();
  const [filters, setFilters] = useState<MapFilterValues>(EMPTY_FILTERS);
  const [yearCeiling, setYearCeiling] = useState<number | null>(null);

  const countries = useMemo(() => {
    const unique = new Set(points.map((point) => point.country));

    return [...unique].sort((left, right) => left.localeCompare(right, locale));
  }, [points, locale]);

  const filtered = useMemo(() => {
    const term = normalizeSearchText(filters.search.trim());

    return points.filter((point) => {
      if (filters.era && point.era !== filters.era) return false;
      if (filters.country && point.country !== filters.country) return false;
      if (term && !point.searchText.includes(term)) return false;
      return true;
    });
  }, [points, filters]);

  const markers = useMemo(
    () =>
      filtered.map((point) => ({
        slug: point.slug,
        title: point.title,
        subtitle: point.subtitle,
        href: point.href,
        latitude: point.latitude,
        longitude: point.longitude,
        year: point.year,
      })),
    [filtered],
  );

  const visibleMarkers = useMemo(() => {
    if (yearCeiling === null) return markers;

    return markers.filter((marker) => marker.year === undefined || marker.year <= yearCeiling);
  }, [markers, yearCeiling]);

  // Nhãn giữ nguyên tham chiếu giữa các lần render để bản đồ không dựng lại khi lọc.
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

  const sliderLabels = useMemo(
    () => ({
      label: dictionary.timeline.timeSliderLabel,
      year: dictionary.timeline.timeSliderYear,
      all: dictionary.timeline.timeSliderAll,
      reset: dictionary.timeline.timeSliderReset,
    }),
    [dictionary],
  );

  const resetFilters = (): void => {
    setFilters(EMPTY_FILTERS);
    setYearCeiling(null);
  };

  const timelineHref = localizePath(locale, '/timeline');
  const markerLabel = formatMessage(dictionary.home.map.markerLabel, { count: visibleMarkers.length });

  return (
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
            <span aria-live="polite">{markerLabel}</span>
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

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <MapFilterBar
              idPrefix="home-map"
              values={filters}
              countries={countries}
              count={visibleMarkers.length}
              onChange={setFilters}
              onReset={resetFilters}
              tone="night"
            />

            <div className="p-2">
              {filtered.length === 0 ? (
                <div className="grid h-[24rem] place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-6 text-center lg:h-[27rem]">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">
                      {dictionary.timeline.noResults}
                    </p>
                    <button type="button" onClick={resetFilters} className="btn-gold mt-5">
                      {dictionary.timeline.reset}
                    </button>
                  </div>
                </div>
              ) : (
                <MapPanel
                  markers={markers}
                  labels={mapLabels}
                  tone="night"
                  className="map-night h-[24rem] !border-0 !shadow-none lg:h-[27rem]"
                  sliderLabels={sliderLabels}
                  yearCeiling={yearCeiling}
                  onYearCeilingChange={setYearCeiling}
                />
              )}
            </div>
          </div>

          {/*
           * Bản đồ là nội dung đồ họa nên cần bản thay thế bằng chữ. Danh sách giữ đúng
           * số thứ tự gắn trên ghim và mở được từng bài viết, người dùng trình đọc màn
           * hình hoặc người tắt hình ảnh vẫn lần theo được nội dung.
           */}
          {visibleMarkers.length > 0 ? (
            <details className="mt-3 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3">
              <summary className="cursor-pointer font-ui text-[0.8125rem] font-semibold text-white/85">
                {formatMessage(dictionary.timeline.mapListSummary, { count: visibleMarkers.length })}
              </summary>
              {/*
               * Danh sách đủ 193 điểm sẽ kéo trang chủ dài thêm hàng nghìn điểm ảnh nếu
               * trải hết ra; giới hạn chiều cao và cuộn trong khung để phần còn lại của
               * trang không bị đẩy xuống. Khung cuộn nhận tiêu điểm để cuộn bằng bàn phím.
               */}
              <div
                role="region"
                tabIndex={0}
                aria-label={formatMessage(dictionary.timeline.mapListSummary, { count: visibleMarkers.length })}
                className="map-night-scroll mt-3 max-h-80 overflow-y-auto pr-2"
              >
                <ol className="grid gap-2 font-ui text-[0.875rem] text-white/60 sm:grid-cols-2">
                  {visibleMarkers.map((marker, index) => (
                    <li key={marker.slug} className="flex gap-2">
                      <span aria-hidden="true" className="shrink-0 font-semibold text-white/85">
                        {index + 1}.
                      </span>
                      <span>
                        <Link
                          href={marker.href}
                          className="font-semibold text-gold underline decoration-white/25 underline-offset-2 hover:text-white"
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
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}