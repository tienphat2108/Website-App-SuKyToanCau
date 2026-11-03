'use client';

import { useRef } from 'react';
import { motion, useScroll } from 'motion/react';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { cn } from '@/utils/format';

/**
 * Nét thẳng của dòng thời gian, vẽ dần theo vị trí cuộn của khối nó đi kèm.
 *
 * Nét cao đúng bằng chiều cao khối chứa, nên người đọc thấy tiến độ cuộn chứ không thấy
 * một vòng lặp chạy vô hạn. Khối đo là lớp ngoài đứng yên, còn lớp trong co giãn, vì phép
 * đo dựa trên khung hình đã hiển thị: đo đúng phần đang co sẽ tạo vòng lặp tự nhiên.
 * Ở chế độ giảm chuyển động, nét hiện nguyên chiều ngay vì di chuyển bị bỏ, chỉ còn pha mờ.
 * @param props.className Lớp định vị và kích thước cho khối nét.
 */
export function ScrollRail({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useShouldReduceMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 60%'],
  });

  return (
    <span ref={ref} aria-hidden="true" className={cn('pointer-events-none block', className)}>
      <motion.span
        className="block h-full w-full origin-top bg-gradient-to-b from-gold/70 via-accent/55 to-transparent"
        style={reduce ? undefined : { scaleY: scrollYProgress }}
      />
    </span>
  );
}
