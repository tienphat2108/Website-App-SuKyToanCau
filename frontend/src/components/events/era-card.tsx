import Image from 'next/image';
import Link from 'next/link';
import type { EraDefinition } from '@/core/models/HistoricalEvent';

/** Hình minh họa tương ứng với từng thời kỳ. */
const ERA_IMAGES: Record<string, string> = {
  'co-dai': '/images/co-dai.svg',
  'trung-dai': '/images/trung-dai.svg',
  'can-dai': '/images/can-dai.svg',
  'hien-dai': '/images/hien-dai.svg',
};

/**
 * Thẻ dẫn vào một thời kỳ lịch sử.
 *
 * Thẻ dùng ảnh nền tối để chữ luôn đạt độ tương phản, số thứ tự mờ lớn tạo nhịp
 * như mục lục sách và nút mũi tên cho biết đây là một liên kết có thể mở.
 * @param props.era Thông tin thời kỳ.
 * @param props.name Tên thời kỳ theo ngôn ngữ hiện tại.
 * @param props.count Số sự kiện trong thời kỳ.
 * @param props.href Đường dẫn tới dòng thời gian đã lọc.
 * @param props.eventLabel Nhãn đơn vị sự kiện.
 * @param props.periodLabel Khoảng năm đã định dạng theo ngôn ngữ.
 * @param props.imageAlt Văn bản thay thế của hình minh họa.
 */
export function EraCard({
  era,
  name,
  count,
  href,
  eventLabel,
  periodLabel,
  imageAlt,
}: {
  era: EraDefinition;
  name: string;
  count: number;
  href: string;
  eventLabel: string;
  periodLabel: string;
  imageAlt: string;
}) {
  const image = ERA_IMAGES[era.key] ?? '/images/hero.svg';

  return (
    <Link
      href={href}
      className="group relative isolate flex min-h-[19rem] flex-col justify-between overflow-hidden rounded-2xl border border-line/60 p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/10"
        aria-hidden="true"
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.75rem] font-medium text-white/90 backdrop-blur">
          {periodLabel}
        </span>
      </div>

      <div className="relative text-white">
        <h3 className="font-display text-2xl font-bold leading-tight">{name}</h3>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/15 pt-3">
          <p className="text-[0.8125rem] font-medium text-white/75">
            {count} {eventLabel}
          </p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-night">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
