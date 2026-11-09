'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EventCard, type EventCardLabels } from '@/components/events/event-card';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Locale } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import type { EventCardModel } from '@/core/presenters/event.presenter';
import { daysUntil, matchesDayMonth, parseEventDate } from '@/lib/on-this-day';
import { cn } from '@/utils/format';

/** Ngày hôm nay theo giờ Việt Nam. */
interface TodayDate {
  day: number;
  month: number;
  year: number;
}

/** Nhãn giao diện của khối ngày này năm xưa. */
export interface OnThisDayLabels {
  title: string;
  subtitle: string;
  datePrefix: string;
  yearsAgo: string;
  thisYear: string;
  emptyTitle: string;
  emptyText: string;
  upcomingLabel: string;
  upcomingItem: string;
  viewAll: string;
  readMore: string;
  featured: string;
  minutes: string;
}

/**
 * Đọc ngày hôm nay theo múi giờ Việt Nam, không phụ thuộc múi giờ của thiết bị.
 * @returns Ngày, tháng và năm theo giờ Hà Nội.
 */
function getVnToday(): TodayDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .split('-');

  return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) };
}

/**
 * Khối "Ngày này năm xưa": liệt kê sự kiện trùng ngày hôm nay.
 *
 * Ngày được tính phía trình duyệt theo giờ Việt Nam nên trang có thể dựng sẵn ở máy
 * chủ mà không lo lệch ngày khi xem ở múi giờ khác. Khi hôm nay không có sự kiện
 * nào, khối hiển thị lời nhắn và gợi ý các ngày kỷ niệm sắp tới.
 * @param props.events Toàn bộ sự kiện đã bản địa hóa.
 * @param props.labels Nhãn giao diện theo ngôn ngữ.
 * @param props.locale Ngôn ngữ hiện tại, dùng để định dạng ngày.
 * @param props.limit Số thẻ tối đa hiển thị ở biến thể trang chủ.
 * @param props.viewAllHref Đường dẫn trang "Ngày này năm xưa" đầy đủ.
 */
export function OnThisDayStrip({
  events,
  labels,
  locale = 'vi',
  limit = 3,
  viewAllHref,
}: {
  events: EventCardModel[];
  labels: OnThisDayLabels;
  locale?: Locale;
  limit?: number;
  viewAllHref?: string;
}) {
  const [today, setToday] = useState<TodayDate | null>(null);

  useEffect(() => {
    setToday(getVnToday());
  }, []);

  const cardLabels: EventCardLabels = {
    readMore: labels.readMore,
    featured: labels.featured,
    minutes: labels.minutes,
  };

  // Ghép mỗi sự kiện với mốc ngày đã phân tích, chỉ giữ những mốc ghi ngày cụ thể.
  const dated = useMemo(
    () =>
      events
        .map((event) => ({ event, parsed: parseEventDate(event.dateLabel) }))
        .filter((item): item is { event: EventCardModel; parsed: NonNullable<ReturnType<typeof parseEventDate>> } =>
          item.parsed !== null,
        ),
    [events],
  );

  const matches = today
    ? dated
        .filter((item) => matchesDayMonth(item.parsed, today.day, today.month))
        .sort((left, right) => right.parsed.year - left.parsed.year)
    : [];

  const upcoming = today
    ? dated
        .map((item) => ({ ...item, until: daysUntil(item.parsed, today.day, today.month) }))
        .filter((item) => item.until > 0 && item.until <= 60)
        .sort((left, right) => left.until - right.until)
        .slice(0, 3)
    : [];

  const shown = limit > 0 ? matches.slice(0, limit) : matches;
  const dateText = today
    ? new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        day: 'numeric',
        month: 'long',
      }).format(new Date(today.year, today.month - 1, today.day))
    : '';

  /**
   * Tạo nhãn "cách đây N năm" cho một sự kiện.
   * @param year Năm diễn ra sự kiện.
   * @returns Nhãn theo ngôn ngữ hiện tại.
   */
  const yearsAgoChip = (year: number): string => {
    if (!today) {
      return '';
    }

    const diff = today.year - year;
    if (diff <= 0) {
      return labels.thisYear;
    }

    return formatMessage(labels.yearsAgo, { n: diff });
  };

  return (
    <section className={cn('section-y', limit > 0 && 'border-y border-line bg-gold/[0.04]')}>
      <div className="container-page">
        <SectionHeading
          title={labels.title}
          subtitle={labels.subtitle}
          action={
            viewAllHref ? (
              <Link href={viewAllHref} className="btn-secondary">
                {labels.viewAll}
              </Link>
            ) : undefined
          }
        />

        {today ? (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-ui text-[0.8125rem] font-semibold text-accent">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gold" aria-hidden="true" />
            {labels.datePrefix}: {dateText}
          </p>
        ) : null}

        {shown.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <EventCard
                key={item.event.slug}
                event={item.event}
                labels={cardLabels}
                extraChip={yearsAgoChip(item.parsed.year)}
                className="h-full"
              />
            ))}
          </div>
        ) : null}

        {today && shown.length === 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="card h-full p-6 sm:p-7">
              <h3 className="font-display text-xl font-bold text-ink">{labels.emptyTitle}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{labels.emptyText}</p>
            </div>

            {upcoming.length > 0 ? (
              <div className="card h-full p-6 sm:p-7">
                <h3 className="font-ui text-[0.8125rem] font-semibold text-muted">{labels.upcomingLabel}</h3>
                <ul className="mt-4 space-y-3">
                  {upcoming.map((item) => (
                    <li key={item.event.slug}>
                      <Link
                        href={item.event.href}
                        className="group block rounded-xl p-1 text-[0.9375rem] leading-relaxed text-ink transition hover:bg-raised"
                      >
                        <span className="font-ui text-[0.8125rem] font-semibold text-accent">
                          {new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
                            day: 'numeric',
                            month: 'numeric',
                          }).format(new Date(today.year, item.parsed.month - 1, item.parsed.day))}
                        </span>
                        <span className="mt-0.5 block">
                          {formatMessage(labels.upcomingItem, { title: item.event.title })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
