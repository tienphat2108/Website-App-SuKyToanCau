'use client';

import type { ReactNode } from 'react';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { ReducedMotionConfig } from '@animate-ui/react/utils/motion';

/**
 * Nhịp chuyển động chung của toàn site, đặt nhanh hơn một chút (0,95) để giao diện
 * vẫn kịp trả lời nhưng các mặt phẳng mở ra không có cảm giác gấp.
 */
const TEMPO = 0.95;

/**
 * Nền tảng hoạt ảnh cho cây giao diện phía trình duyệt.
 *
 * `AnimateUIProvider` phát nhịp `tempo` cho mọi token chuyển động, còn
 * `ReducedMotionConfig` nối lựa chọn "giảm chuyển động" của hệ điều hành vào
 * Motion: khi bật, Motion thôi chạy các phép thu, phóng, xoay và giữ nguyên pha mờ.
 * Đặt trong thẻ body nên nội dung dựng ở máy chủ vẫn nguyên vẹn khi chưa nạp mã.
 * @param props.children Cây giao diện con.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <AnimateUIProvider tempo={TEMPO}>
      <ReducedMotionConfig>{children}</ReducedMotionConfig>
    </AnimateUIProvider>
  );
}
