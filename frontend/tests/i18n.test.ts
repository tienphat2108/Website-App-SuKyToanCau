import { describe, expect, it } from 'vitest';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';
import {
  defaultLocale,
  isLocale,
  localeFromPath,
  localizePath,
  stripLocalePrefix,
} from '@/core/i18n/config';
import { formatMessage, getDictionary } from '@/core/i18n/dictionary';

/**
 * Thu thập toàn bộ đường dẫn khóa của một đối tượng từ điển.
 * @param value Giá trị cần duyệt.
 * @param prefix Tiền tố khóa hiện tại.
 * @returns Danh sách khóa dạng a.b.c.
 */
function collectKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

/**
 * Lấy giá trị tại một đường dẫn khóa.
 * @param value Đối tượng nguồn.
 * @param path Đường dẫn khóa.
 * @returns Giá trị tìm được hoặc undefined.
 */
function valueAt(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

describe('cấu hình đa ngôn ngữ', () => {
  it('có đủ hai ngôn ngữ và mặc định là tiếng Việt', () => {
    expect(defaultLocale).toBe('vi');
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('giữ tiếng Việt ở gốc và thêm tiền tố cho tiếng Anh', () => {
    expect(localizePath('vi', '/')).toBe('/');
    expect(localizePath('vi', '/timeline')).toBe('/timeline');
    expect(localizePath('en', '/')).toBe('/en');
    expect(localizePath('en', '/timeline')).toBe('/en/timeline');
    expect(localizePath('en', 'timeline')).toBe('/en/timeline');
  });

  it('bỏ tiền tố ngôn ngữ đúng cách', () => {
    expect(stripLocalePrefix('/en')).toBe('/');
    expect(stripLocalePrefix('/en/timeline')).toBe('/timeline');
    expect(stripLocalePrefix('/timeline')).toBe('/timeline');
  });

  it('nhận diện ngôn ngữ từ đường dẫn', () => {
    expect(localeFromPath('/en/timeline')).toBe('en');
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/timeline')).toBe('vi');
  });
});

describe('từ điển', () => {
  it('hai ngôn ngữ có cùng bộ khóa', () => {
    const viKeys = collectKeys(vi).sort();
    const enKeys = collectKeys(en).sort();

    expect(enKeys).toEqual(viKeys);
  });

  it('không có chuỗi rỗng trong từ điển', () => {
    for (const locale of [vi, en]) {
      for (const key of collectKeys(locale)) {
        const value = valueAt(locale, key);
        if (typeof value === 'string') {
          expect(value.trim().length, key).toBeGreaterThan(0);
        }
      }
    }
  });

  it('trả về đúng từ điển và quay về tiếng Việt khi mã không hợp lệ', () => {
    expect(getDictionary('en').nav.home).toBe('Home');
    expect(getDictionary('vi').nav.home).toBe('Trang chủ');
    expect(getDictionary('fr').nav.home).toBe('Trang chủ');
  });

  it('thay thế biến trong chuỗi dịch và giữ nguyên biến thiếu giá trị', () => {
    expect(formatMessage('{count} sự kiện', { count: 20 })).toBe('20 sự kiện');
    expect(formatMessage('{count} sự kiện', {})).toBe('{count} sự kiện');
  });
});
