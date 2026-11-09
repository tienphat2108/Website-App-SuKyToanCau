import { describe, expect, it } from 'vitest';
import { HistoricalEvent, type EventData } from '@/core/models/HistoricalEvent';
import { findRelatedEvents } from '@/lib/related-events';

/**
 * Tạo sự kiện tối giản đủ trường bắt buộc cho bài kiểm thử gợi ý liên quan.
 * @param overrides Giá trị ghi đè.
 * @returns Sự kiện mẫu.
 */
function makeEvent(
  overrides: Partial<EventData> & Pick<EventData, 'slug' | 'startYear'>,
): HistoricalEvent {
  return new HistoricalEvent({
    era: 'hien-dai',
    country: 'Việt Nam',
    dateLabelVi: 'Ngày 1 tháng 1',
    dateLabelEn: '1 January',
    titleVi: 'Tiêu đề',
    titleEn: 'Title',
    summaryVi: 'Tóm tắt.',
    summaryEn: 'Summary.',
    locationVi: 'Hà Nội',
    locationEn: 'Hanoi',
    latitude: 21,
    longitude: 105,
    imagePath: '/images/events/demo.jpg',
    imageAltVi: 'Ảnh minh họa',
    imageAltEn: 'Illustration',
    featured: false,
    ...overrides,
  });
}

describe('gợi ý sự kiện liên quan', () => {
  const current = makeEvent({
    slug: 'hien-tai',
    startYear: 1975,
    era: 'hien-dai',
    country: 'Việt Nam',
    tagsVi: ['chiến tranh', 'thống nhất'],
    tagsEn: ['war', 'reunification'],
  });

  it('không gợi ý chính sự kiện đang xem', () => {
    const result = findRelatedEvents([current], current);
    expect(result).toEqual([]);
  });

  it('xếp sự kiện cùng thời kỳ, cùng quốc gia và cùng chủ đề lên đầu với đủ lý do', () => {
    const match = makeEvent({
      slug: 'trung-khop',
      startYear: 1977,
      era: 'hien-dai',
      country: 'Việt Nam',
      tagsVi: ['chiến tranh'],
      tagsEn: ['war'],
    });
    const far = makeEvent({ slug: 'xa-khong-lien-quan', startYear: 1300, era: 'co-dai' });

    const result = findRelatedEvents([far, match], current);

    expect(result[0].event.slug).toBe('trung-khop');
    expect(result[0].reasons).toEqual(
      expect.arrayContaining(['sameEra', 'sameCountry', 'sameTag', 'nearYear']),
    );
  });

  it('tính điểm gần năm: cách dưới 10 năm xếp trên cách dưới 50 năm', () => {
    const near = makeEvent({ slug: 'gan-10-nam', startYear: 1983, era: 'hien-dai' });
    const mid = makeEvent({ slug: 'gan-50-nam', startYear: 1920, era: 'hien-dai' });

    const result = findRelatedEvents([mid, near], current);

    expect(result.map((item) => item.event.slug)).toEqual(['gan-10-nam', 'gan-50-nam']);
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });

  it('không gợi ý sự kiện không có bất kỳ điểm tương đồng nào', () => {
    const alien = makeEvent({ slug: 'xa-lac', startYear: 1300, era: 'co-dai', country: 'Hy Lạp' });
    const result = findRelatedEvents([alien], current, 3);
    expect(result).toEqual([]);
  });

  it('giới hạn đúng số gợi ý yêu cầu', () => {
    const others = Array.from({ length: 5 }, (_, index) =>
      makeEvent({ slug: `khac-${index}`, startYear: 1975 + index, era: 'hien-dai' }),
    );
    expect(findRelatedEvents(others, current, 3)).toHaveLength(3);
    expect(findRelatedEvents(others, current, 1)).toHaveLength(1);
  });

  it('không có gợi ý nào trùng lặp', () => {
    const others = Array.from({ length: 6 }, (_, index) =>
      makeEvent({ slug: `khac-${index}`, startYear: 1975 + index, era: 'hien-dai' }),
    );
    const result = findRelatedEvents(others, current, 6);
    expect(new Set(result.map((item) => item.event.slug)).size).toBe(result.length);
  });
});
