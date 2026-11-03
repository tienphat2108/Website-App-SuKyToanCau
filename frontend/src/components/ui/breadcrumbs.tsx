import Link from 'next/link';
import { cn } from '@/utils/format';

/** Một mắt trong đường dẫn điều hướng. */
export interface BreadcrumbItem {
  /** Nhãn hiển thị. */
  label: string;
  /** Đường dẫn; mục cuối thường không có. */
  href?: string;
}

/**
 * Đường dẫn điều hướng giúp người đọc biết vị trí hiện tại và quay lại nhanh.
 * @param props.items Danh sách mắt theo thứ tự từ gốc tới trang hiện tại.
 * @param props.label Nhãn trợ năng cho vùng điều hướng.
 * @param props.className Lớp bổ sung.
 */
export function Breadcrumbs({
  items,
  label,
  className,
}: {
  items: BreadcrumbItem[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn('text-[0.8125rem] text-muted', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-6 items-center rounded-sm transition hover:text-accent focus-visible:outline-offset-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('text-ink/75', isLast && 'font-medium text-ink')}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="h-1 w-1 shrink-0 rounded-full bg-gold/70" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
