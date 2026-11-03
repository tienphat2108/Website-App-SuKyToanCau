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
