import { describe, expect, it } from 'vitest';
import { HistoricalEvent, type EventData } from '@/core/models/HistoricalEvent';
import {
  selectCaseStudySlugs,
  VIETNAM_CASE_STUDY_SLUGS,
} from '@/data/case-studies';

/**
 * Tạo sự kiện tối giản đủ trường bắt buộc cho bài kiểm thử chọn hồ sơ.
 * @param overrides Giá trị ghi đè.
 * @returns Sự kiện mẫu.
 */
function makeEvent(
  overrides: Partial<EventData> & Pick<EventData, 'slug' | 'country' | 'startYear'>,
): HistoricalEvent {
  return new HistoricalEvent({
    era: 'hien-dai',
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

describe('chọn hồ sơ theo quốc gia ưu tiên', () => {
  const vnEvents = VIETNAM_CASE_STUDY_SLUGS.map((slug) =>
    makeEvent({ slug, country: 'Việt Nam', startYear: 1900 }),
  );
  const usApollo = makeEvent({ slug: 'us-apollo', country: 'Hoa Kỳ', startYear: 1969, featured: true });
  const usNoiChien = makeEvent({ slug: 'us-noi-chien', country: 'Hoa Kỳ', startYear: 1861, featured: true });
  const usLapQuoc = makeEvent({ slug: 'us-lap-quoc', country: 'Hoa Kỳ', startYear: 1776 });
  const usHienDai = makeEvent({ slug: 'us-hien-dai', country: 'Hoa Kỳ', startYear: 2020 });
  const events = [...vnEvents, usApollo, usNoiChien, usLapQuoc, usHienDai];

  it('không chọn quốc gia thì hiển thị các mốc quan trọng của Việt Nam', () => {
    expect(selectCaseStudySlugs(events, '')).toEqual([...VIETNAM_CASE_STUDY_SLUGS]);
  });

  it('chọn Việt Nam vẫn hiển thị đủ bốn hồ sơ Việt Nam', () => {
    expect(selectCaseStudySlugs(events, 'Việt Nam')).toEqual([...VIETNAM_CASE_STUDY_SLUGS]);
  });

  it('ưu tiên sự kiện nổi bật của quốc gia đã chọn, sắp theo thời gian và không trộn hồ sơ Việt Nam', () => {
    expect(selectCaseStudySlugs(events, 'Hoa Kỳ')).toEqual([
      'us-noi-chien',
      'us-apollo',
      'us-lap-quoc',
    ]);
  });

  it('quốc gia có ít hơn ba sự kiện thì chỉ hiển thị sự kiện của quốc gia đó, không bù bằng hồ sơ Việt Nam', () => {
    const chile = makeEvent({ slug: 'chile-doc-lap', country: 'Chile', startYear: 1818 });
    expect(selectCaseStudySlugs([...events, chile], 'Chile')).toEqual(['chile-doc-lap']);
  });

  it('quốc gia chưa có sự kiện thì trả về danh sách hồ sơ Việt Nam', () => {
    expect(selectCaseStudySlugs(events, 'Chile')).toEqual([...VIETNAM_CASE_STUDY_SLUGS]);
  });

  it('không có hồ sơ nào trùng lặp trong kết quả', () => {
    const result = selectCaseStudySlugs(events, 'Hoa Kỳ');
    expect(new Set(result).size).toBe(result.length);
  });
});
