import { describe, expect, it } from 'vitest';
import { COUNTRY_BY_KEY, COUNTRY_KEYS, COUNTRY_OPTIONS, countryLabel } from '@/data/countries';
import { seedEvents } from '@/data/seed';
import { sortByPreferredCountry } from '@/utils/preferred-country';

describe('danh mục quốc gia và khu vực', () => {
  it('có khóa duy nhất và sắp xếp theo tên tiếng Việt', () => {
    expect(COUNTRY_OPTIONS.length).toBe(new Set(seedEvents.map((event) => event.country)).size);
    expect(COUNTRY_KEYS.size).toBe(COUNTRY_OPTIONS.length);
    expect(new Set(COUNTRY_OPTIONS.map((country) => country.key)).size).toBe(COUNTRY_OPTIONS.length);

    const labels = COUNTRY_OPTIONS.map((country) => country.vi);
    expect(labels).toEqual([...labels].sort((left, right) => left.localeCompare(right, 'vi')));
  });

  it('phủ toàn bộ quốc gia và khu vực có trong dữ liệu sự kiện', () => {
    for (const event of seedEvents) {
      expect(COUNTRY_BY_KEY.has(event.country), event.country).toBe(true);
    }

    expect(new Set(seedEvents.map((event) => event.country)).size).toBe(COUNTRY_OPTIONS.length);
  });

  it('hiển thị tên theo ngôn ngữ và trả chuỗi rỗng với khóa không hợp lệ', () => {
    expect(countryLabel('Việt Nam', 'vi')).toBe('Việt Nam');
    expect(countryLabel('Việt Nam', 'en')).toBe('Vietnam');
    expect(countryLabel('Hoa Kỳ', 'en')).toBe('United States');
    expect(countryLabel('', 'vi')).toBe('');
    expect(countryLabel('khong-ton-tai', 'vi')).toBe('');
    expect(countryLabel(undefined, 'en')).toBe('');
  });
});

describe('sắp xếp ưu tiên quốc gia', () => {
  /** Danh sách mẫu giữ thứ tự thời gian. */
  const items = [
    { slug: 'a', country: 'Việt Nam' },
    { slug: 'b', country: 'Pháp' },
    { slug: 'c', country: 'Việt Nam' },
    { slug: 'd', country: 'Nhật Bản' },
  ];

  it('đưa sự kiện của quốc gia đã chọn lên trước', () => {
    const sorted = sortByPreferredCountry(items, (item) => item.country, 'Việt Nam');

    expect(sorted.map((item) => item.slug)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('giữ nguyên thứ tự tương đối của các sự kiện còn lại', () => {
    const sorted = sortByPreferredCountry(items, (item) => item.country, 'Nhật Bản');

    expect(sorted.map((item) => item.slug)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('không đổi thứ tự khi chưa chọn quốc gia và không sửa mảng gốc', () => {
    const sorted = sortByPreferredCountry(items, (item) => item.country, '');

    expect(sorted.map((item) => item.slug)).toEqual(['a', 'b', 'c', 'd']);
    expect(sorted).not.toBe(items);
    expect(items.map((item) => item.slug)).toEqual(['a', 'b', 'c', 'd']);
  });
});
