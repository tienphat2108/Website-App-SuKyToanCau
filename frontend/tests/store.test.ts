import { beforeEach, describe, expect, it } from 'vitest';
import { useHistoryStore } from '@/store/history.store';

describe('kho trạng thái giao diện', () => {
  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.setState({
      era: '',
      country: '',
      search: '',
      view: 'timeline',
      favorites: [],
      quizProgress: {},
      stickyDismissed: false,
    });
  });

  it('cập nhật và xóa bộ lọc', () => {
    useHistoryStore.getState().setEra('hien-dai');
    useHistoryStore.getState().setCountry('Việt Nam');
    useHistoryStore.getState().setSearch('1975');

    expect(useHistoryStore.getState().era).toBe('hien-dai');
    expect(useHistoryStore.getState().search).toBe('1975');

    useHistoryStore.getState().resetFilters();

    expect(useHistoryStore.getState().era).toBe('');
    expect(useHistoryStore.getState().country).toBe('');
    expect(useHistoryStore.getState().search).toBe('');
  });

  it('bật và tắt lưu sự kiện mà không tạo bản trùng', () => {
    useHistoryStore.getState().toggleFavorite('doi-moi-1986');
    useHistoryStore.getState().toggleFavorite('doi-moi-1986');
    useHistoryStore.getState().toggleFavorite('buc-tuong-berlin-1989');

    expect(useHistoryStore.getState().favorites).toEqual(['buc-tuong-berlin-1989']);
  });

  it('ghi nhận đã đóng thanh kêu gọi di động', () => {
    useHistoryStore.getState().dismissSticky();

    expect(useHistoryStore.getState().stickyDismissed).toBe(true);
  });

  it('đổi chế độ xem', () => {
    useHistoryStore.getState().setView('map');

    expect(useHistoryStore.getState().view).toBe('map');
  });
});

describe('kho trạng thái: tiến độ ôn tập trắc nghiệm', () => {
  beforeEach(() => {
    useHistoryStore.setState({ quizProgress: {}, favorites: [] });
  });

  it('lần nộp đầu tiên tạo bản ghi với tỉ lệ phần trăm làm tròn', () => {
    useHistoryStore.getState().recordQuizAttempt('apollo-11-1969', 7, 10);

    expect(useHistoryStore.getState().quizProgress['apollo-11-1969']).toEqual({
      bestPercent: 70,
      attempts: 1,
      lastScore: 7,
      lastTotal: 10,
      lastAt: expect.any(Number),
    });
  });

  it('giữ tỉ lệ cao nhất giữa các lần làm và cộng dồn số lần nộp', () => {
    useHistoryStore.getState().recordQuizAttempt('dien-bien-phu', 8, 10);
    useHistoryStore.getState().recordQuizAttempt('dien-bien-phu', 3, 5);
    useHistoryStore.getState().recordQuizAttempt('dien-bien-phu', 5, 5);

    const record = useHistoryStore.getState().quizProgress['dien-bien-phu'];
    expect(record.bestPercent).toBe(100);
    expect(record.attempts).toBe(3);
    expect(record.lastScore).toBe(5);
    expect(record.lastTotal).toBe(5);
  });

  it('đề 5 câu và đề 10 câu so được với nhau nhờ tỉ lệ phần trăm', () => {
    useHistoryStore.getState().recordQuizAttempt('de-ngan', 4, 5);
    useHistoryStore.getState().recordQuizAttempt('de-dai', 8, 10);

    expect(useHistoryStore.getState().quizProgress['de-ngan'].bestPercent).toBe(80);
    expect(useHistoryStore.getState().quizProgress['de-dai'].bestPercent).toBe(80);
  });

  it('tổng câu bằng 0 không gây chia lỗi và vẫn tăng số lần nộp', () => {
    useHistoryStore.getState().recordQuizAttempt('de-trong', 0, 0);

    const record = useHistoryStore.getState().quizProgress['de-trong'];
    expect(record.bestPercent).toBe(0);
    expect(record.attempts).toBe(1);
  });

  it('mỗi sự kiện có bản ghi riêng, không ghi đè lẫn nhau', () => {
    useHistoryStore.getState().recordQuizAttempt('su-kien-a', 5, 5);
    useHistoryStore.getState().recordQuizAttempt('su-kien-b', 1, 5);

    const progress = useHistoryStore.getState().quizProgress;
    expect(progress['su-kien-a'].bestPercent).toBe(100);
    expect(progress['su-kien-b'].bestPercent).toBe(20);
    expect(Object.keys(progress)).toHaveLength(2);
  });
});
