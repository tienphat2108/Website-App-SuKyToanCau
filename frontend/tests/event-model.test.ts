import { describe, expect, it } from 'vitest';
import { HistoricalEvent, findEra } from '@/core/models/HistoricalEvent';
import { seedEvents, seedEventsBySlug } from '@/data/seed';
import { toEventCard } from '@/core/presenters/event.presenter';

/** Sự kiện tối thiểu dùng cho kiểm thử. */
const sample = new HistoricalEvent({
  slug: 'su-kien-thu',
  era: 'trung-dai',
  country: 'Việt Nam',
  countryEn: 'Vietnam',
  startYear: 938,
  endYear: null,
  dateLabelVi: 'Năm 938',
  dateLabelEn: '938 CE',
  titleVi: 'Chiến thắng Bạch Đằng',
  titleEn: 'Battle of Bach Dang',
  summaryVi: 'Tóm tắt tiếng Việt.',
  summaryEn: 'English summary.',
  contentVi: ['Đoạn một.', 'Đoạn hai.'],
  contentEn: ['Paragraph one.'],
  locationVi: 'Quảng Ninh',
  locationEn: 'Quang Ninh',
  latitude: 20.9,
  longitude: 106.8,
  imagePath: '/images/trung-dai.svg',
  imageAltVi: 'Minh họa',
  imageAltEn: 'Illustration',
  tagsVi: ['Bạch Đằng'],
  tagsEn: ['Bach Dang'],
  featured: true,
  relatedSlugs: ['chien-thang-bach-dang-938'],
});

describe('HistoricalEvent', () => {
  it('chọn đúng nội dung theo ngôn ngữ', () => {
    expect(sample.title('vi')).toBe('Chiến thắng Bạch Đằng');
    expect(sample.title('en')).toBe('Battle of Bach Dang');
    expect(sample.summary('en')).toBe('English summary.');
    expect(sample.content('vi')).toHaveLength(2);
    expect(sample.content('en')).toHaveLength(1);
    expect(sample.tags('en')).toEqual(['Bach Dang']);
  });

  it('suy ra tên thời kỳ khi dữ liệu không cung cấp', () => {
    expect(sample.eraName('vi')).toBe('Trung đại');
    expect(sample.eraName('en')).toBe('Medieval');
    expect(findEra('khong-ton-tai')).toBeUndefined();
  });

  it('tạo đường dẫn đúng cho từng ngôn ngữ', () => {
    expect(sample.href('vi')).toBe('/event/su-kien-thu');
    expect(sample.href('en')).toBe('/en/event/su-kien-thu');
  });

  it('giữ nguyên giá trị mặc định an toàn', () => {
    const minimal = new HistoricalEvent({
      ...sample,
      contentVi: undefined,
      contentEn: undefined,
      relatedSlugs: undefined,
      related: undefined,
      featured: undefined,
      endYear: undefined,
      updatedAt: undefined,
    });

    expect(minimal.contentVi).toEqual([]);
    expect(minimal.relatedSlugs).toEqual([]);
    expect(minimal.featured).toBe(false);
    expect(minimal.endYear).toBeNull();
    expect(minimal.hasContent()).toBe(false);
  });
});

describe('dữ liệu mẫu', () => {
  it('có kho dữ liệu mở rộng với khóa duy nhất', () => {
    expect(seedEvents.length).toBe(149);
    expect(seedEventsBySlug.size).toBe(seedEvents.length);
    expect(new Set(seedEvents.map((event) => event.slug)).size).toBe(seedEvents.length);
  });

  it('mọi liên kết sự kiện liên quan đều tồn tại', () => {
    for (const event of seedEvents) {
      for (const slug of event.relatedSlugs) {
        expect(seedEventsBySlug.has(slug), `${event.slug} -> ${slug}`).toBe(true);
      }
    }
  });

  it('mọi sự kiện đều có bài viết đầy đủ song ngữ và tọa độ hợp lệ', () => {
    for (const event of seedEvents) {
      expect(event.titleVi.length).toBeGreaterThan(0);
      expect(event.titleEn.length).toBeGreaterThan(0);
      expect(event.contentVi.length).toBeGreaterThanOrEqual(3);
      expect(event.contentEn.length).toBeGreaterThanOrEqual(3);
      expect(Math.abs(event.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(event.longitude)).toBeLessThanOrEqual(180);
    }
  });

  it('mọi sự kiện đều có ít nhất hai nguồn tham khảo hợp lệ', () => {
    for (const event of seedEvents) {
      expect(event.sources.length, event.slug).toBeGreaterThanOrEqual(2);
      for (const source of event.sources) {
        expect(source.title.length, event.slug).toBeGreaterThan(0);
        expect(source.publisher.length, event.slug).toBeGreaterThan(0);
        expect(source.url, event.slug).toMatch(/^https?:\/\//);
        expect(['vi', 'en']).toContain(source.language);
      }
    }
  });
});

describe('bộ chuyển dữ liệu thẻ', () => {
  it('tạo dữ liệu thuần, có chuỗi tìm kiếm hai ngôn ngữ', () => {
    const card = toEventCard(sample, 'en');

    expect(card.href).toBe('/en/event/su-kien-thu');
    expect(card.eraName).toBe('Medieval');
    expect(card.country).toBe('Vietnam');
    expect(card.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(card.searchText).toContain('chien thang bach dang');
    expect(card.searchText).toContain('battle of bach dang');
  });
});
