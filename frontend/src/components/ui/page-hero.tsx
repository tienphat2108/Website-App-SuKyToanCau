import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { cn } from '@/utils/format';

/**
 * Khung mở đầu dùng chung cho các trang nội dung tĩnh.
 * Giữ cùng nhịp với trang chủ và trang sự kiện: nền lưới mờ, đường dẫn điều hướng,
 * tiêu đề lớn kiểu ấn phẩm giấy và một cột phụ tùy chọn.
 *
 * Nhãn nhỏ phía trên tiêu đề đã được bỏ để giảm lớp chữ thừa và giữ tiêu đề nổi bật.
 * @param props.title Tiêu đề chính của trang.
 * @param props.description Đoạn mô tả ngắn dưới tiêu đề.
 * @param props.breadcrumbLabel Nhãn trợ năng cho đường dẫn điều hướng.
 * @param props.breadcrumbs Danh sách mắt đường dẫn, mắt cuối là trang hiện tại.
 * @param props.action Cụm nút hoặc liên kết đặt dưới phần mô tả.
 * @param props.aside Cột phụ bên phải, thường là thẻ thông tin nổi bật.
 * @param props.children Nội dung bổ sung nằm trong cùng khung mở đầu.
 * @param props.className Lớp bổ sung cho thẻ section ngoài cùng.
 * @returns Khối mở đầu trang đã đồng bộ hệ thống thiết kế.
 */
export function PageHero({
  title,
  description,
  breadcrumbLabel,
  breadcrumbs,
  action,
  aside,
  children,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbLabel: string;
  breadcrumbs: BreadcrumbItem[];
  action?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('relative overflow-hidden border-b border-line', className)}>
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 -top-28 h-[26rem] w-[26rem] rounded-full bg-gold/[0.07] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/[0.04] blur-3xl" aria-hidden="true" />

      <div className="container-page relative py-10 sm:py-12">
        <Breadcrumbs label={breadcrumbLabel} items={breadcrumbs} />

        <div
          className={cn(
            'mt-7',
            aside ? 'grid items-end gap-8 lg:grid-cols-[1.18fr_0.82fr]' : 'max-w-3xl',
          )}
        >
          <div>
            <h1 className="font-display text-[2.2rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.15rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted sm:text-[1.125rem]">
                {description}
              </p>
            ) : null}

            {action ? <div className="mt-7 flex flex-wrap items-center gap-3">{action}</div> : null}
          </div>

          {aside}
        </div>

        {children}
      </div>
    </section>
  );
}
