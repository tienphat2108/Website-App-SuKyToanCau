'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { spring, transition, useTempoTransition } from '@animate-ui/react/utils/motion';

/**
 * Kiểu chuyển động của khối khi bước vào khung nhìn.
 * - `rise`: nhô lên 12px kèm pha mờ, dùng cho thẻ và khối nội dung.
 * - `ink`: mực loang, từ mờ sang sắc, dành cho chữ vì chữ không được co giãn.
 * - `wipe`: quét từ trái sang, dùng cho đường kẻ mảnh.
 */
export type RevealStyle = 'rise' | 'ink' | 'wipe';

/** Trạng thái ẩn của từng kiểu, viết bằng giá trị rời để Motion bỏ đúng phần bị cấm. */
const HIDDEN: Record<RevealStyle, Record<string, number | string>> = {
  rise: { opacity: 0, y: 12 },
  ink: { opacity: 0, filter: 'blur(3px)' },
  wipe: { opacity: 0, scaleX: 0 },
};

/** Trạng thái hiện tương ứng, ghi rõ giá trị để khối về đúng thế nghỉ ở mọi trình duyệt. */
const VISIBLE: Record<RevealStyle, Record<string, number | string>> = {
  rise: { opacity: 1, y: 0 },
  ink: { opacity: 1, filter: 'blur(0px)' },
  wipe: { opacity: 1, scaleX: 1 },
};

/**
 * Bọc một khối nội dung phía dưới màn hình để nó lộ dần khi người đọc cuộn tới.
 *
 * Ba điểm cần nhớ khi dùng:
 * 1. Chỉ bọc khối nằm dưới vùng nhìn đầu tiên, vì mã dựng ở máy chủ xuất hiện với độ mờ
 *    bằng 0 và phải chờ mã phía trình duyệt nạp xong mới hiện.
 * 2. Khi một phần tử bên trong nhận tiêu điểm bằng bàn phím, khối hiện ngay lập tức:
 *    người dùng bàn phím không bao giờ bị dẫn tới một vùng vô hình.
 * 3. Ở chế độ giảm chuyển động, Motion bỏ pha di chuyển và co giãn nhưng vẫn giữ pha mờ
 *    và nét loang, nên khối vẫn xuất hiện nhẹ nhàng mà không rung.
 *
 * Danh sách đổi nội dung vì bộ lọc không nên mang thêm trễ: truyền `immediate` để khối
 * hiện thẳng, vì người đọc đang nhìn kết quả và chờ xem danh sách hiện dần là một khoản
 * thời gian chết không cần thiết.
 * @param props.children Nội dung được bọc.
 * @param props.className Lớp bổ sung cho khối bọc.
 * @param props.style Kiểu chuyển động.
 * @param props.delay Trễ tính bằng mili giây, thường lấy từ `revealDelay`.
 * @param props.immediate Bỏ hẳn hoạt ảnh, khối hiện ngay như một lớp div thường.
 */
export function Reveal({
  children,
  className,
  style = 'rise',
  delay = 0,
  immediate = false,
}: {
  children?: ReactNode;
  className?: string;
  style?: RevealStyle;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const entrance = useTempoTransition(spring.entrance);
  const reveal = useTempoTransition(transition.reveal);

  // Kiểu nhô dùng lò xo cho cảm giác giấy bật lên; kiểu mực và kiểu quét dùng đường
  // cong ease.out để chữ sắc lại ngay từ những khung hình đầu.
  const baseTransition = style === 'rise' ? entrance : reveal;

  if (immediate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={HIDDEN[style]}
      animate={inView || focused ? VISIBLE[style] : HIDDEN[style]}
      transition={{ ...baseTransition, delay: delay / 1000 }}
      onFocusCapture={() => setFocused(true)}
      className={className}
    >
      {children}
    </motion.div>
  );
}
