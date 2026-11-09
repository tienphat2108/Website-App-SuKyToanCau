'use client';

import { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapLabels, MapMarker } from './historical-map';
import { useI18n } from '@/components/providers/i18n-provider';
import { formatMessage } from '@/core/i18n/dictionary';
import { cn, formatHistoricalYear } from '@/utils/format';

/**
 * Bản đồ được tải động ở phía trình duyệt để không làm nặng lần hiển thị đầu tiên
 * và tránh lỗi khi máy chủ dựng trang không có đối tượng window.
 */
const HistoricalMap = dynamic(
  () => import('./historical-map').then((module) => module.HistoricalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[22rem] items-center justify-center bg-raised text-sm text-muted">
        <span className="animate-pulse">Đang tải bản đồ…</span>
      </div>
    ),
  },
);

/** Nhãn thanh trượt thời gian nằm dưới bản đồ. */
export interface TimeSliderLabels {
  /** Nhãn của cả thanh trượt. */
  label: string;
  /** Dòng hiển thị năm đang chọn, có chỗ {year}. */
  year: string;
  /** Dòng hiển thị khi không lọc. */
  all: string;
  /** Nhãn nút bỏ lọc. */
  reset: string;
}

/**
 * Khung hiển thị bản đồ kèm viền và tỉ lệ cố định.
 *
 * Khi các điểm có năm bắt đầu và có nhãn thanh trượt, khung vẽ thêm một thanh
 * trượt bên dưới: kéo thanh chỉ lọc điểm theo năm, không dựng lại bản đồ.
 * @param props.markers Các điểm cần hiển thị.
 * @param props.labels Nhãn giao diện.
 * @param props.center Tâm bản đồ khi chỉ có một điểm.
 * @param props.zoom Mức thu phóng.
 * @param props.className Lớp bổ sung cho khung ngoài.
 * @param props.sliderLabels Nhãn thanh trượt; bỏ trống là không vẽ thanh trượt.
 * @param props.yearCeiling Năm chặn trên khi trang ngoài điều khiển thanh trượt.
 * @param props.onYearCeilingChange Báo trang ngoài khi người đọc kéo thanh; có mặt nghĩa là chế độ điều khiển ngoài.
 */
export function MapPanel({
  markers,
  labels,
  center,
  zoom,
  className,
  sliderLabels,
  yearCeiling,
  onYearCeilingChange,
}: {
  markers: MapMarker[];
  labels: MapLabels;
  center?: [number, number];
  zoom?: number;
  className?: string;
  sliderLabels?: TimeSliderLabels;
  yearCeiling?: number | null;
  onYearCeilingChange?: (next: number | null) => void;
}) {
  const { locale } = useI18n();
  const sliderId = useId();
  // null nghĩa là đang xem toàn thời gian; khi trang ngoài điều khiển thì theo giá trị truyền vào.
  const [internalCeiling, setInternalCeiling] = useState<number | null>(null);
  const controlled = onYearCeilingChange !== undefined;
  const ceiling = controlled ? (yearCeiling ?? null) : internalCeiling;
  const changeCeiling = (next: number | null): void => {
    if (controlled) {
      onYearCeilingChange(next);
    } else {
      setInternalCeiling(next);
    }
  };

  const years = markers
    .map((marker) => marker.year)
    .filter((year): year is number => typeof year === 'number')
    .sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  // Thanh trượt chỉ có nghĩa khi có ít nhất hai mốc năm khác nhau.
  const showSlider =
    sliderLabels !== undefined && minYear !== undefined && maxYear !== undefined && minYear !== maxYear;

  const activeYear = ceiling ?? maxYear;

  return (
    <div>
      {/* `isolate` giam các lớp xếp lớp bên trong Leaflet trong khung bản đồ,
          tránh bản đồ vẽ đè lên thanh điều hướng dính khi cuộn trang. */}
      <div className={cn('isolate overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
        <HistoricalMap
          markers={markers}
          labels={labels}
          center={center}
          zoom={zoom}
          yearCeiling={ceiling}
        />
      </div>
      {/* Thanh trượt nằm ngoài khung để chiều cao cố định của khung bản đồ không bị
          chia sẻ và không làm tràn phần bản đồ phía trong. */}
      {showSlider && maxYear !== undefined ? (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center sm:gap-5 sm:px-5">
          <div className="flex items-baseline justify-between gap-3 sm:w-56 sm:shrink-0 sm:flex-col sm:gap-1">
            <label htmlFor={sliderId} className="font-ui text-sm font-semibold text-ink">
              {sliderLabels.label}
            </label>
            <output
              htmlFor={sliderId}
              aria-live="polite"
              className="font-ui text-sm font-semibold tabular-nums text-accent"
            >
              {ceiling === null
                ? sliderLabels.all
                : formatMessage(sliderLabels.year, { year: formatHistoricalYear(ceiling, locale) })}
            </output>
          </div>

          <input
            id={sliderId}
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={activeYear}
            onChange={(event) => {
              const next = Number(event.target.value);
              changeCeiling(next >= maxYear ? null : next);
            }}
            aria-valuetext={
              ceiling === null
                ? sliderLabels.all
                : formatMessage(sliderLabels.year, { year: formatHistoricalYear(ceiling, locale) })
            }
            className="h-11 w-full min-w-0 flex-1 cursor-pointer accent-accent"
          />

          {ceiling !== null ? (
            <button
              type="button"
              onClick={() => changeCeiling(null)}
              className="chip chip-active h-11 shrink-0 px-4 font-ui text-sm font-semibold"
            >
              {sliderLabels.reset}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
