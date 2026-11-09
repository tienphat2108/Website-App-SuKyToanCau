'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventCard } from '@/components/events/event-card';
import { useHistoryStore } from '@/store/history.store';
import { localizePath } from '@/core/i18n/config';
import { formatMessage } from '@/core/i18n/dictionary';
import type { Locale } from '@/core/i18n/config';
import type { EventCardModel } from '@/core/presenters/event.presenter';

/** Các chuỗi giao diện của trang ôn tập, đã bản địa hóa ở phía máy chủ. */
export interface StudyLabels {
  savedTitle: string;
  savedSubtitle: string;
  savedEmpty: string;
  savedEmptyCta: string;
  unsave: string;
  progressTitle: string;
  progressSubtitle: string;
  progressEmpty: string;
  progressEmptyCta: string;
  /** Dòng điểm cao nhất, có chỗ {percent}. */
  best: string;
  /** Dòng số lần làm, có chỗ {count}. */
  attempts: string;
  /** Dòng ngày làm gần nhất, có chỗ {date}. */
  last: string;
  readMore: string;
  featured: string;
  minutes: string;
}

/**
 * Nội dung trang ôn tập: sự kiện đã lưu và tiến độ trắc nghiệm của người đọc.
 *
 * Dữ liệu nằm trong bộ nhớ cục bộ của trình duyệt nên chỉ hiển thị sau khi gắn kết,
 * tránh lệch giữa bản dựng máy chủ và bản chạy thật. Dữ liệu không rời khỏi máy.
 * @param props.events Toàn bộ sự kiện đã bản địa hóa để tra tên và đường dẫn.
 * @param props.locale Ngôn ngữ đang hiển thị.
 * @param props.labels Chuỗi giao diện.
 */
export function StudyPanel({
  events,
  locale,
  labels,
}: {
  events: EventCardModel[];
  locale: Locale;
  labels: StudyLabels;
}) {
  const [mounted, setMounted] = useState(false);
  const favorites = useHistoryStore((state) => state.favorites);
  const quizProgress = useHistoryStore((state) => state.quizProgress);
  const toggleFavorite = useHistoryStore((state) => state.toggleFavorite);

  useEffect(() => {
    setMounted(true);
  }, []);

  const eventBySlug = new Map(events.map((event) => [event.slug, event]));
  const saved = favorites
    .map((slug) => eventBySlug.get(slug))
    .filter((event): event is EventCardModel => event !== undefined);
  const progress = Object.entries(quizProgress)
    .map(([slug, record]) => ({ slug, record, event: eventBySlug.get(slug) }))
    .filter((item): item is { slug: string; record: (typeof quizProgress)[string]; event: EventCardModel } =>
      item.event !== undefined,
    )
    .sort((left, right) => right.record.lastAt - left.record.lastAt);

  const dateFormat = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const cardLabels = {
    readMore: labels.readMore,
    featured: labels.featured,
    minutes: labels.minutes,
  };
  const timelineHref = localizePath(locale, '/timeline');

  return (
    <div className="space-y-14">
      <section aria-labelledby="study-saved-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 id="study-saved-title" className="font-display text-2xl font-bold text-ink">
              {labels.savedTitle}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{labels.savedSubtitle}</p>
          </div>
          {mounted && saved.length > 0 ? (
            <span className="chip">{saved.length}</span>
          ) : null}
        </div>

        {!mounted ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-56 animate-pulse rounded-2xl bg-raised/70" aria-hidden="true" />
            <div className="h-56 animate-pulse rounded-2xl bg-raised/70" aria-hidden="true" />
          </div>
        ) : saved.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-raised text-muted"
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-5 font-display text-xl font-semibold text-ink">{labels.savedEmpty}</p>
            <Link href={timelineHref} className="btn-secondary mt-5">
              {labels.savedEmptyCta}
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {saved.map((event) => (
              <li key={event.slug} className="flex h-full flex-col gap-3">
                <div className="flex-1">
                  <EventCard event={event} labels={cardLabels} className="h-full" />
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(event.slug)}
                  className="chip inline-flex self-start hover:border-accent/50"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                    className="text-accent"
                  >
                    <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {labels.unsave}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="study-progress-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 id="study-progress-title" className="font-display text-2xl font-bold text-ink">
              {labels.progressTitle}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{labels.progressSubtitle}</p>
          </div>
          {mounted && progress.length > 0 ? (
            <span className="chip">{progress.length}</span>
          ) : null}
        </div>

        {!mounted ? (
          <div className="mt-6 space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-raised/70" aria-hidden="true" />
            <div className="h-20 animate-pulse rounded-2xl bg-raised/70" aria-hidden="true" />
          </div>
        ) : progress.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-raised text-muted"
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M9 11.5l2.2 2.2L15.5 9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3.5l2.1 1.6 2.6-.2 1 2.4 2.2 1.4-.6 2.6 1.3 2.3-1.9 1.8-.4 2.6-2.5.7-1.7 2-2.4-1-2.5.7-1.6-2.1-2.5-.8-.1-2.6-1.7-2 1.3-2.3-.7-2.5 2.2-1.4 1.1-2.4 2.6.2L12 3.5Z" />
              </svg>
            </span>
            <p className="mt-5 font-display text-xl font-semibold text-ink">{labels.progressEmpty}</p>
            <Link href={timelineHref} className="btn-secondary mt-5">
              {labels.progressEmptyCta}
            </Link>
          </div>
        ) : (
          <ol className="mt-6 space-y-3">
            {progress.map(({ slug, record, event }) => (
              <li
                key={slug}
                className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line/80 bg-surface px-5 py-4"
              >
                <div className="min-w-0 flex-1 basis-64">
                  <Link
                    href={event.href}
                    className="font-display text-[1.0625rem] font-semibold text-ink underline-offset-4 hover:text-accent hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-1 font-ui text-[0.8125rem] text-muted">
                    {event.dateLabel} · {event.eraName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-active tabular-nums">
                    {formatMessage(labels.best, { percent: record.bestPercent })}
                  </span>
                  <span className="chip tabular-nums">
                    {formatMessage(labels.attempts, { count: record.attempts })}
                  </span>
                  <span className="chip">
                    {formatMessage(labels.last, { date: dateFormat.format(record.lastAt) })}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
