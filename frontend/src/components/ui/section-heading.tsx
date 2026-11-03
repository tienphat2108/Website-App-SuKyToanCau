import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/utils/format';

/**
 * Tiêu đề một khu vực nội dung, gồm tiêu đề, mô tả và hành động tùy chọn.
 *
 * Nhãn nhỏ phía trên tiêu đề đã được bỏ để tiêu đề tự đứng vững, giảm cảm giác
 * chồng nhiều lớp chữ và giúp mắt người đọc đi thẳng vào nội dung chính.
 *
 * Tiêu đề và mô tả hiện theo kiểu mực loang khi khối bước vào khung nhìn: chỉ có độ
 * mờ và nét nhoè thay đổi, chữ không co giãn nên dòng chữ không nhảy khỏi vị trí. Ở
 * chế độ giảm chuyển động, phần di chuyển bị bỏ nhưng pha mờ vẫn giữ, khối vẫn hiện
 * nhẹ nhàng. Thành phần này luôn nằm dưới vùng nhìn đầu tiên, nên việc chữ ẩn cho tới
 * khi mã phía trình duyệt nạp xong không ảnh hưởng nội dung mở màn của trang.
 * @param props.title Tiêu đề chính.
 * @param props.subtitle Mô tả ngắn.
 * @param props.action Liên kết hoặc nút nằm bên phải.
 * @param props.align Căn trái hoặc giữa.
 * @param props.className Lớp bổ sung.
 */
export function SectionHeading({
  title,
  subtitle,
  action,
  align = 'left',
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'left' && 'sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        <Reveal style="ink">
          <h2 className="font-display text-[1.9rem] font-bold leading-[1.15] tracking-tight text-ink sm:text-[2.35rem]">
            {title}
          </h2>
        </Reveal>
        {subtitle ? (
          <Reveal style="ink" delay={90}>
            <p className="mt-3 text-[1.0125rem] leading-relaxed text-muted">{subtitle}</p>
          </Reveal>
        ) : null}
      </div>

      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </div>
  );
}
