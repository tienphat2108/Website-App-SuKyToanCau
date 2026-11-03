import Link from 'next/link';
import type { Locale } from '@/core/i18n/config';
import { HistoricalEvent } from '@/core/models/HistoricalEvent';
import { normalizeSearchText, readingTime } from '@/utils/format';

/**
 * Dữ liệu rút gọn của một sự kiện dùng cho thẻ hiển thị và bộ lọc phía trình duyệt.
 * Mọi trường đều là giá trị thuần (chuỗi, số, mảng) để có thể truyền qua ranh giới
 * máy chủ và trình duyệt mà không mất phương thức của lớp HistoricalEvent.
 */
export interface EventCardModel {
  slug: string;
  href: string;
  era: string;
  eraName: string;
  country: string;
  /** Khóa quốc gia chuẩn (tiếng Việt) dùng để so khớp lựa chọn ưu tiên. */
  countryKey: string;
  dateLabel: string;
  title: string;
  summary: string;
  location: string;
  imagePath: string;
  imageAlt: string;
  tags: string[];
  featured: boolean;
  startYear: number;
  endYear: number | null;
  latitude: number;
  longitude: number;
  readingMinutes: number;
  /** Chuỗi tìm kiếm đã gộp hai ngôn ngữ, bỏ dấu và chuyển chữ thường. */
  searchText: string;
}

/**
 * Chuyển một sự kiện sang dữ liệu thuần phục vụ giao diện.
 * @param event Sự kiện nguồn.
 * @param locale Ngôn ngữ cần hiển thị.
 * @returns Dữ liệu thẻ sự kiện đã bản địa hóa.
 */
export function toEventCard(event: HistoricalEvent, locale: Locale): EventCardModel {
  const content = event.content(locale);
  const tags = event.tags(locale);
  const summary = event.summary(locale);

  return {
    slug: event.slug,
    href: event.href(locale),
    era: event.era,
    eraName: event.eraName(locale),
    country: event.countryName(locale),
    countryKey: event.country,
    dateLabel: event.dateLabel(locale),
    title: event.title(locale),
    summary,
    location: event.location(locale),
    imagePath: event.imagePath,
    imageAlt: event.imageAlt(locale),
    tags,
    featured: event.featured,
    startYear: event.startYear,
    endYear: event.endYear,
    latitude: event.latitude,
    longitude: event.longitude,
    readingMinutes: readingTime(content.length ? content : [summary]),
    searchText: normalizeSearchText(
      [
        event.titleVi,
        event.titleEn,
        event.summaryVi,
        event.summaryEn,
        event.locationVi,
        event.locationEn,
        event.country,
        event.countryEn,
        ...event.tagsVi,
        ...event.tagsEn,
      ].join(' '),
    ),
  };
}

/**
 * Chuyển danh sách sự kiện sang dữ liệu thuần.
 * @param events Danh sách sự kiện.
 * @param locale Ngôn ngữ hiển thị.
 * @returns Mảng dữ liệu thẻ.
 */
export function toEventCards(events: HistoricalEvent[], locale: Locale): EventCardModel[] {
  return events.map((event) => toEventCard(event, locale));
}
