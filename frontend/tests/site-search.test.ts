import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/core/i18n/dictionary';
import { SEARCH_EVENT_LIMIT, searchSite } from '@/lib/site-search';

const vi = getDictionary('vi');
const en = getDictionary('en');

describe('tìm kiếm toàn site', () => {
  it('tìm sự kiện không phân biệt dấu và chữ hoa', () => {
    const results = searchSite('vi', 'bach dang', vi);

    expect(results.events[0]?.slug).toBe('chien-thang-bach-dang-938');
    expect(results.total).toBeGreaterThan(0);
  });

  it('tìm được tuyến bài học có nhắc tới từ khóa', () => {
    const results = searchSite('vi', 'Bạch Đằng', vi);

    expect(results.collections.some((item) => item.slug === 'nguon-coi-quoc-gia')).toBe(true);
  });

  it('tìm trang theo tiêu đề tiếng Việt', () => {
    const results = searchSite('vi', 'ôn tập', vi);

    expect(results.pages.some((page) => page.href === '/study')).toBe(true);
  });

  it('tìm sự kiện bằng từ khóa tiếng Anh trên giao diện tiếng Anh', () => {
    const results = searchSite('en', 'Magna Carta', en);

    expect(results.events.some((event) => event.slug === 'magna-carta-1215')).toBe(true);
    expect(results.pages.every((page) => page.href.startsWith('/en/'))).toBe(true);
  });

  it('giới hạn số sự kiện hiển thị nhưng vẫn báo đủ tổng', () => {
    const results = searchSite('vi', 'a', vi);

    expect(results.events).toHaveLength(SEARCH_EVENT_LIMIT);
    expect(results.eventTotal).toBeGreaterThan(SEARCH_EVENT_LIMIT);
  });

  it('trả kết quả rỗng khi chưa nhập từ khóa', () => {
    const results = searchSite('vi', '   ', vi);

    expect(results.total).toBe(0);
    expect(results.term).toBe('');
  });

  it('không trả kết quả cho chuỗi không tồn tại', () => {
    const results = searchSite('vi', 'zzzqqq123', vi);

    expect(results.total).toBe(0);
    expect(results.events).toHaveLength(0);
  });
});
