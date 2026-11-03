'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Chế độ hiển thị của trang dòng thời gian. */
export type TimelineView = 'timeline' | 'map';

/** Trạng thái giao diện được chia sẻ giữa các thành phần tương tác. */
interface HistoryState {
  /** Thời kỳ đang lọc, chuỗi rỗng là tất cả. */
  era: string;
  /** Quốc gia đang lọc, chuỗi rỗng là tất cả. */
  country: string;
  /** Từ khóa tìm kiếm. */
  search: string;
  /** Chế độ xem hiện tại. */
  view: TimelineView;
  /** Danh sách sự kiện người đọc đã lưu. */
  favorites: string[];
  /** Đã đóng thanh kêu gọi trên thiết bị di động hay chưa. */
  stickyDismissed: boolean;
  /** Cập nhật thời kỳ. */
  setEra: (era: string) => void;
  /** Cập nhật quốc gia. */
  setCountry: (country: string) => void;
  /** Cập nhật từ khóa. */
  setSearch: (search: string) => void;
  /** Đổi chế độ xem. */
  setView: (view: TimelineView) => void;
  /** Xóa toàn bộ bộ lọc. */
  resetFilters: () => void;
  /** Bật hoặc tắt lưu một sự kiện. */
  toggleFavorite: (slug: string) => void;
  /** Đóng thanh kêu gọi di động. */
  dismissSticky: () => void;
}

/**
 * Kho trạng thái phía trình duyệt.
 * Bộ lọc được giữ trong phiên; sự kiện đã lưu và lựa chọn giao diện được lưu lâu dài.
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      era: '',
      country: '',
      search: '',
      view: 'timeline',
      favorites: [],
      stickyDismissed: false,
      setEra: (era) => set({ era }),
      setCountry: (country) => set({ country }),
      setSearch: (search) => set({ search }),
      setView: (view) => set({ view }),
      resetFilters: () => set({ era: '', country: '', search: '' }),
      toggleFavorite: (slug) =>
        set((state) => ({
          favorites: state.favorites.includes(slug)
            ? state.favorites.filter((item) => item !== slug)
            : [...state.favorites, slug],
        })),
      dismissSticky: () => set({ stickyDismissed: true }),
    }),
    {
      name: 'wh-history-preferences',
      partialize: (state) => ({
        view: state.view,
        favorites: state.favorites,
        stickyDismissed: state.stickyDismissed,
      }),
    },
  ),
);
