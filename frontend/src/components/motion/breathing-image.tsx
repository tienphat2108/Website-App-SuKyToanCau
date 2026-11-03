'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import type { AnimationPlaybackControls } from 'motion/react';
import { ease, useShouldReduceMotion, useTempoTransition } from '@animate-ui/react/utils/motion';
import { useHoverCapable } from '@/components/motion/use-hover-capable';
import { cn } from '@/utils/format';

/** Mức phóng tối đa của ảnh, đủ để cảm nhận chuyển động mà không vỡ nét. */
const BREATH_SCALE = 1.06;

/** Thời gian một hơi thở của ảnh, tính bằng giây. */
const BREATH_SECONDS = 8;

/**
 * Ảnh phủ khung có hơi thở chậm: phóng từ 1 lên 1,06 trong tám giây rồi thu lại khi
 * rời khỏi vùng nhìn, tạm dừng khi con trỏ nằm trên ảnh.
 *
 * Ba quy tắc chuyển động chi phối thành phần này:
 * - giá trị co giãn chạy trên lớp tổng hợp qua chuỗi `transform`, không qua trạng thái
 *   React, nên cuộn trang không làm vẽ lại cả cây;
 * - vòng lặp dừng khi ảnh rời khỏi màn hình và tắt hẳn ở chế độ giảm chuyển động;
 * - pha dừng khi rê chuột chỉ bật trên thiết bị có con trỏ mịn.
 * @param props.src Đường dẫn ảnh nội bộ.
 * @param props.alt Văn bản thay thế mô tả ảnh.
 * @param props.sizes Mô tả kích thước khung cho next/image.
 * @param props.priority Ưu tiên tải sớm cho ảnh đầu trang.
 * @param props.className Lớp bổ sung cho khối bọc ảnh.
 */
export function BreathingImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const scale = useMotionValue(1);
  const transform = useTransform(scale, (value) => `scale(${value})`);
  const inView = useInView(ref, { margin: '10%' });
  const reduce = useShouldReduceMotion();
  const canHover = useHoverCapable();
  const tween = useTempoTransition({ duration: BREATH_SECONDS, ease: ease.inOut });

  useEffect(() => {
    if (reduce) return undefined;

    // Ảnh rời khỏi vùng nhìn thì thu về 1, quay lại thì tiếp tục từ giá trị hiện tại
    // chứ không nhảy về đầu, nên hơi thở không bị giật khi kéo lên kéo xuống.
    const animation = animate(scale, inView ? BREATH_SCALE : 1, tween);
    controls.current = animation;

    return () => {
      controls.current = null;
      animation.stop();
    };
  }, [inView, reduce, scale, tween]);

  return (
    <motion.div
      ref={ref}
      style={{ transform }}
      className={cn('absolute inset-0', className)}
      onMouseEnter={canHover ? () => controls.current?.pause() : undefined}
      onMouseLeave={canHover ? () => controls.current?.play() : undefined}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </motion.div>
  );
}
