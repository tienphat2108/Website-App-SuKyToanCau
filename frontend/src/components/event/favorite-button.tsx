'use client';

import { useEffect, useState } from 'react';
import { useHistoryStore } from '@/store/history.store';

/**
 * Nút lưu hoặc bỏ lưu một sự kiện vào danh sách cá nhân trên trình duyệt.
 * Trạng thái được hiển thị sau khi trình duyệt khôi phục bộ nhớ cục bộ
 * để tránh lệch giữa bản dựng máy chủ và bản chạy thật.
 * @param props.slug Khóa sự kiện.
 * @param props.favoriteLabel Nhãn khi chưa lưu.
 * @param props.unfavoriteLabel Nhãn khi đã lưu.
 */
export function FavoriteButton({
  slug,
  favoriteLabel,
  unfavoriteLabel,
}: {
  slug: string;
  favoriteLabel: string;
  unfavoriteLabel: string;
}) {
  const [mounted, setMounted] = useState(false);
  const favorites = useHistoryStore((state) => state.favorites);
  const toggleFavorite = useHistoryStore((state) => state.toggleFavorite);
  const saved = mounted && favorites.includes(slug);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={saved}
      aria-label={saved ? unfavoriteLabel : favoriteLabel}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[0.8125rem] font-semibold text-ink transition hover:border-accent/50 hover:bg-raised"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className={saved ? 'text-accent' : 'text-muted'}
      >
        <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {saved ? unfavoriteLabel : favoriteLabel}
    </button>
  );
}
