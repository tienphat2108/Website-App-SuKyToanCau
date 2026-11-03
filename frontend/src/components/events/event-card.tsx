import Image from 'next/image';
import Link from 'next/link';
import type { EventCardModel } from '@/core/presenters/event.presenter';
import { cn } from '@/utils/format';

/** Nhãn văn bản cần cho một thẻ sự kiện. */
export interface EventCardLabels {
  /** Nhãn hành động đọc bài. */
  readMore: string;
  /** Nhãn đánh dấu sự kiện nổi bật. */
  featured: string;
  /** Đơn vị phút đọc. */
  minutes: string;
}

/**
 * Thẻ giới thiệu một sự kiện lịch sử.
 * Thành phần thuần, không dùng trạng thái nên có thể dùng cả ở máy chủ và trình duyệt,
 * đồng thời dễ tái sử dụng cho ứng dụng di động trong tương lai.
 * @param props.event Dữ liệu sự kiện đã bản địa hóa.
 * @param props.labels Nhãn giao diện theo ngôn ngữ.
 * @param props.priority Ưu tiên tải ảnh cho các thẻ nằm trong vùng nhìn đầu tiên.
 * @param props.variant Bố cục dọc mặc định hoặc bố cục ngang cho bài nổi bật.
 * @param props.showFeaturedBadge Hiện nhãn "nổi bật"; tắt khi cả danh sách đều nổi bật.
 * @param props.className Lớp bổ sung cho bố cục bên ngoài.
 */
export function EventCard({
  event,
  labels,
  priority = false,
  variant = 'default',
  showFeaturedBadge = true,
  className,
}: {
  event: EventCardModel;
  labels: EventCardLabels;
  priority?: boolean;
  variant?: 'default' | 'wide';
  showFeaturedBadge?: boolean;
  className?: string;
}) {
  const isWide = variant === 'wide';

  return (
    <article
      className={cn(
        'card-press group relative flex flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-card hover:border-gold/40 hover:shadow-lift',
        className,
      )}
    >
      <Link
        href={event.href}
        className={cn(
          'flex h-full flex-col focus-visible:outline-offset-4',
          isWide && 'sm:flex-row',
        )}
        aria-label={event.title}
      >
        <div
          className={cn(
            'relative aspect-[16/10] overflow-hidden bg-raised',
            isWide && 'sm:aspect-auto sm:min-h-[18rem] sm:w-[44%] sm:shrink-0',
          )}
        >
          <Image
            src={event.imagePath}
            alt={event.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/15 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="rounded-full border border-white/15 bg-night/60 px-3 py-1 font-ui text-[0.75rem] font-medium text-white/90 backdrop-blur">
              {event.eraName}
            </span>

            {event.featured && showFeaturedBadge ? (
              <span className="rounded-full bg-gold px-3 py-1 font-ui text-[0.75rem] font-semibold text-[#241a0b]">
                {labels.featured}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-4 bottom-3.5 flex items-center gap-2.5 font-ui text-[0.8125rem] font-medium text-white/90">
            <span className="h-px w-6 bg-gold" aria-hidden="true" />
            {event.dateLabel}
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col p-5 sm:p-6', isWide && 'sm:justify-center sm:p-7')}>
          <div className="flex flex-wrap items-center gap-2 font-ui text-[0.75rem] font-medium text-muted">
            <span>{event.country}</span>
            <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
            <span>{event.readingMinutes} {labels.minutes}</span>
          </div>

          <h3
            className={cn(
              'mt-2.5 font-display text-xl font-bold leading-snug text-ink transition group-hover:text-accent',
              isWide && 'sm:text-2xl',
            )}
          >
            {event.title}
          </h3>

          <p className={cn('mt-2.5 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted', isWide && 'sm:text-base')}>
            {event.summary}
          </p>

          <div className={cn('mt-auto flex items-end justify-between gap-3 pt-5', isWide && 'sm:mt-6 sm:pt-0')}>
            <div className="flex flex-wrap items-center gap-1.5">
              {event.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 font-ui text-[0.8125rem] font-semibold text-accent">
              {labels.readMore}
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line transition group-hover:border-accent/40 group-hover:bg-accent group-hover:text-white">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="transition duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
