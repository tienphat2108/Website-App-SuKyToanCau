'use client';

import { useSyncExternalStore } from 'react';

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Đăng ký nghe thay đổi của truy vấn "máy có con trỏ mịn".
 * @param onChange Hàm gọi lại khi điều kiện đổi, ví dụ khi cắm thêm chuột vào máy tính bảng.
 * @returns Hàm hủy đăng ký.
 */
function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);

  return () => mql.removeEventListener('change', onChange);
}

/**
 * Cho biết thiết bị hiện có con trỏ rê được hay không.
 *
 * Quy tắc chuyển động chỉ cho phép hiệu ứng rê chuột chạy trên máy có chuột chính xác,
 * vì trình duyệt trên điện thoại cũng bắn sự kiện rê khi chạm nhưng không bao giờ bắn
 * sự kiện rời chuột; nếu không chặn, một cái chạm sẽ để lại thế rê dính suốt.
 * Máy chủ luôn trả về false để mã dựng trùng với khung hình thủy hợp đầu tiên.
 * @returns true khi thiết bị có con trỏ mịn.
 */
export function useHoverCapable(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}
