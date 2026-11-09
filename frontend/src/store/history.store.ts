'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Chế độ hiển thị của trang dòng thời gian. */
export type TimelineView = 'timeline' | 'map';

/** Kết quả ôn tập trắc nghiệm của một sự kiện, gộp mọi lần làm. */
export interface QuizProgressRecord {
  /** Tỉ lệ đúng cao nhất tính theo phần trăm, so được giữa các đề 5 và 10 câu. */
  bestPercent: number;
  /** Số lần đã nộp bài. */
  attempts: number;
  /** Điểm lần nộp gần nhất. */
  lastScore: number;
  /** Tổng số câu lần nộp gần nhất. */
  lastTotal: number;
  /** Thời điểm nộp gần nhất, tính bằng mili-giây epoch. */
  lastAt: number;
}

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
  /** Kết quả ôn tập trắc nghiệm theo khóa sự kiện. */
  quizProgress: Record<string, QuizProgressRecord>;
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
  /** Ghi nhận một lần nộp bài trắc nghiệm. */
  recordQuizAttempt: (slug: string, score: number, total: number) => void;
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
      quizProgress: {},
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
      recordQuizAttempt: (slug, score, total) =>
        set((state) => {
          const previous = state.quizProgress[slug];
          const percent = total > 0 ? Math.round((score / total) * 100) : 0;

          return {
            quizProgress: {
              ...state.quizProgress,
              [slug]: {
                bestPercent: Math.max(previous?.bestPercent ?? 0, percent),
                attempts: (previous?.attempts ?? 0) + 1,
                lastScore: score,
                lastTotal: total,
                lastAt: Date.now(),
              },
            },
          };
        }),
      dismissSticky: () => set({ stickyDismissed: true }),
    }),
    {
      name: 'wh-history-preferences',
      partialize: (state) => ({
        view: state.view,
        favorites: state.favorites,
        quizProgress: state.quizProgress,
        stickyDismissed: state.stickyDismissed,
      }),
    },
  ),
);
