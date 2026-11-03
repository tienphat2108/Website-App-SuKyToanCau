/**
 * Nhịp trễ dùng chung cho các khối lộ dần.
 *
 * Tệp này không đánh dấu 'use client' vì trang dựng ở máy chủ cần gọi `revealDelay`
 * khi render danh sách: một hàm xuất ra từ module phía trình duyệt không thể chạy
 * trên máy chủ, gọi vào đó sẽ làm cả trang rơi vào màn hình lỗi.
 */

/** Khoảng trễ giữa hai khối liên tiếp khi lộ dần theo danh sách, tính bằng mili giây. */
export const REVEAL_STAGGER_MS = 60;

/** Số phần tử cùng chịu một nhịp trễ; vượt qua thì các khối sau vào cùng lúc cho gọn. */
const STAGGER_CAP = 6;

/**
 * Tính trễ cho phần tử thứ tự `index` trong một hàng lộ dần.
 * @param index Vị trí phần tử, bắt đầu từ 0.
 * @returns Số mili giây cần trễ, đã chặn ở mức trần để hàng dài không chờ lâu.
 */
export function revealDelay(index: number): number {
  return Math.min(index, STAGGER_CAP) * REVEAL_STAGGER_MS;
}
