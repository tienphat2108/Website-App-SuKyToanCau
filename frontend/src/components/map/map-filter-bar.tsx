'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { formatMessage } from '@/core/i18n/dictionary';
import { ERAS } from '@/core/models/HistoricalEvent';
import { cn } from '@/utils/format';

/** Giá trị ba ô lọc của một bản đồ. */
export interface MapFilterValues {
  search: string;
  era: string;
  country: string;
}

/**
 * Thanh lọc đặt ngay trên khung bản đồ: ô từ khóa, ô thời kỳ, ô quốc gia, số điểm
 * đang hiển thị và nút xóa lọc.
 *
 * Dùng chung cho bản đồ trang dòng thời gian và bản đồ trang chủ để hai nơi có cùng
 * một cách lọc, cùng nhãn và cùng thứ tự ô. Nhãn lấy từ bộ từ điển của trang dòng
 * thời gian vì wording phải giống nhau ở mọi bản đồ.
 * @param props.idPrefix Tiền tố mã ô nhập, để hai bản đồ trên cùng trang không trùng mã.
 * @param props.values Giá trị hiện tại của ba ô lọc.
 * @param props.countries Danh sách quốc gia đã bản địa hóa, sắp xếp theo ngôn ngữ.
 * @param props.count Số điểm còn hiển thị sau lọc.
 * @param props.onChange Báo giá trị mới khi người đọc đổi một ô bất kỳ.
 * @param props.onReset Xóa cả ba ô lọc.
 * @param props.tone `night` cho khối nền tối của trang chủ, `light` cho nền trang thường.
 * @param props.trailing Cụm điều khiển đặt cuối hàng, ví dụ nút đổi chế độ xem.
 */
export function MapFilterBar({
  idPrefix,
  values,
  countries,
  count,
  onChange,
  onReset,
  tone = 'light',
  trailing,
}: {
  idPrefix: string;
  values: MapFilterValues;
  countries: string[];
  count: number;
  onChange: (next: MapFilterValues) => void;
  onReset: () => void;
  tone?: 'light' | 'night';
  trailing?: ReactNode;
}) {
  const { locale, dictionary } = useI18n();
  const night = tone === 'night';
  const hasFilters = Boolean(values.search || values.era || values.country);
  const fieldClass = cn('field select-press h-10 !py-0 text-[0.875rem]', night && 'map-night-field');

  return (
    <div className={cn('border-b', night ? 'border-white/10' : 'border-line/70')}>
      <div className="flex flex-col gap-2 px-3 pt-3 sm:flex-row sm:items-center sm:gap-2.5">
        <div className="relative min-w-0 flex-1">
          <span
            className={cn(
              'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2',
              night ? 'text-white/55' : 'text-muted',
            )}
            aria-hidden="true"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
          <label htmlFor={`${idPrefix}-search`} className="sr-only">
            {dictionary.timeline.searchLabel}
          </label>
          <input
            id={`${idPrefix}-search`}
            type="search"
            value={values.search}
            onChange={(event) => onChange({ ...values, search: event.target.value })}
            placeholder={dictionary.timeline.searchPlaceholder}
            className={cn('field h-10 !py-0 pl-9 text-[0.875rem]', night && 'map-night-field')}
            autoComplete="off"
            maxLength={120}
          />
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
          <div className="min-w-0 sm:w-40">
            <label htmlFor={`${idPrefix}-era`} className="sr-only">
              {dictionary.timeline.eraLabel}
            </label>
            <select
              id={`${idPrefix}-era`}
              value={values.era}
              onChange={(event) => onChange({ ...values, era: event.target.value })}
              className={fieldClass}
            >
              <option value="">{dictionary.timeline.allEras}</option>
              {ERAS.map((definition) => (
                <option key={definition.key} value={definition.key}>
                  {locale === 'en' ? definition.nameEn : definition.nameVi}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0 sm:w-48">
            <label htmlFor={`${idPrefix}-country`} className="sr-only">
              {dictionary.timeline.countryLabel}
            </label>
            <select
              id={`${idPrefix}-country`}
              value={values.country}
              onChange={(event) => onChange({ ...values, country: event.target.value })}
              className={fieldClass}
            >
              <option value="">{dictionary.timeline.allCountries}</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-2.5">
        <p
          aria-live="polite"
          className={cn('font-ui text-[0.8125rem] font-medium', night ? 'text-white/75' : 'text-muted')}
        >
          {formatMessage(dictionary.timeline.results, { count })}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              'press inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-[0.8125rem] font-semibold transition',
              night
                ? 'border-white/20 bg-white/[0.06] text-white hover:border-gold/60 hover:text-gold'
                : 'border-line text-accent hover:border-accent/50 hover:text-accent-strong',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
            {dictionary.timeline.reset}
          </button>
        ) : null}
        {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}