'use client';

import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import { useI18n } from '@/components/providers/i18n-provider';

/**
 * Một con số thống kê đếm dần tới giá trị thật khi khối bước vào khung nhìn.
 *
 * Thành phần dùng đúng nguyên mẫu đếm số của Animate UI nên cách ngăn chữ số hàng
 * nghìn theo ngôn ngữ được truyền vào, và ở chế độ giảm chuyển động nó nhảy thẳng tới
 * giá trị cuối thay vì cuộn từng số. Giá trị thật luôn có một bản chữ không nhìn thấy
 * dành cho trình đọc màn hình, nên số đang đếm không ảnh hưởng tới việc đọc trang.
 * @param props.value Giá trị đích cần đếm tới.
 * @param props.className Lớp bổ sung cho khối số.
 */
export function StatCounter({ value, className }: { value: number; className?: string }) {
  const { locale } = useI18n();

  return (
    <CountingNumber
      number={value}
      inView
      inViewOnce
      inViewMargin="0px 0px -10% 0px"
      thousandSeparator={locale === 'vi' ? '.' : ','}
      className={className}
    />
  );
}
