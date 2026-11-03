import { cn } from '@/utils/format';

/**
 * Biểu tượng trống đồng cách điệu dùng làm logo.
 * Hình được vẽ nội tuyến để không phát sinh thêm yêu cầu mạng và luôn sắc nét.
 * @param props.className Lớp bổ sung cho kích thước.
 * @param props.tone Tông màu nền của con dấu.
 */
export function BrandMark({
  className,
  tone = 'night',
}: {
  className?: string;
  tone?: 'night' | 'light';
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn('h-10 w-10 shrink-0', className)}
    >
      <rect
        width="64"
        height="64"
        rx="18"
        fill={tone === 'night' ? '#0e171f' : '#f7f3ea'}
      />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="16.5"
        fill="none"
        stroke={tone === 'night' ? '#d8b36a' : '#ad843f'}
        strokeOpacity="0.35"
      />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#d8b36a" strokeWidth="1.5" opacity="0.85" />
      <circle cx="32" cy="32" r="13.5" fill="none" stroke="#d8b36a" strokeWidth="1" opacity="0.5" />
      <path
        d="M32 15.5 L35.7 25.6 L46.4 21.6 L39.7 30.2 L48.9 34.1 L38.4 35.7 L41.3 45.8 L32 38.8 L22.7 45.8 L25.6 35.7 L15.1 34.1 L24.3 30.2 L17.6 21.6 L28.3 25.6 Z"
        fill="#d8b36a"
      />
      <circle cx="32" cy="32" r="3.4" fill="#a32e2e" />
    </svg>
  );
}
