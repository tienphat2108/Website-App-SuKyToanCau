import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RecentUpdateFeed } from '@/data/recent-updates';

/**
 * Tệp phát hành do bộ quét nguồn mở sinh ra theo lệnh.
 * Bộ kiểm thử chỉ chạy khi tệp đã có; khi chưa quét lần nào thì bỏ qua thay vì báo lỗi.
 */
const FILE = join(process.cwd(), '..', 'shared', 'recent-events.json');

function readFeed(): RecentUpdateFeed | null {
  if (!existsSync(FILE)) return null;
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as RecentUpdateFeed;
  } catch {
    return null;
  }
}

const feed = readFeed();

/** URL bài Wikipedia sâu, không được là trang chủ hay trang đặc biệt. */
const ARTICLE_URL = /^https:\/\/[a-z]{2,3}\.wikipedia\.org\/wiki\/[^/]+$/;
const WIKIDATA_URL = /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/;

const isValidIso = (value: string): boolean => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

describe.skipIf(!feed)('tệp dữ liệu cập nhật từ nguồn mở', () => {
  const items = feed?.items ?? [];

  it('số đếm khớp với danh sách mục', () => {
    expect(feed?.count).toBe(items.length);
  });

  it('khóa mục là duy nhất', () => {
    const keys = items.map((item) => item.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('xếp mới nhất lên đầu và không có ngày trong tương lai', () => {
    const today = new Date().toISOString().slice(0, 10);

    for (const [index, item] of items.entries()) {
      expect(isValidIso(item.date), item.key).toBe(true);
      expect(item.date <= today, item.key).toBe(true);
      if (index > 0) {
        expect(item.date <= items[index - 1].date, item.key).toBe(true);
      }
    }
  });

  it('có đủ tiêu đề và tóm tắt hai ngôn ngữ', () => {
    for (const item of items) {
      expect(item.titleVi.trim().length, item.key).toBeGreaterThan(0);
      expect(item.titleEn.trim().length, item.key).toBeGreaterThan(0);
      expect(item.summaryVi.trim().length, item.key).toBeGreaterThanOrEqual(200);
      expect(item.summaryEn.trim().length, item.key).toBeGreaterThanOrEqual(200);
    }
  });

  it('đạt ngưỡng ngôn ngữ của lần quét', () => {
    const minLinks = feed?.minLinks ?? 0;

    for (const item of items) {
      expect(item.languages, item.key).toBeGreaterThanOrEqual(minLinks);
    }
  });

  it('nguồn trỏ thẳng bài viết, không phải trang chủ, và kèm giấy phép', () => {
    for (const item of items) {
      expect(item.sources.length, item.key).toBeGreaterThanOrEqual(2);

      for (const source of item.sources) {
        expect(ARTICLE_URL.test(source.url) || WIKIDATA_URL.test(source.url), `${item.key}: ${source.url}`).toBe(true);
        expect(source.license.length, item.key).toBeGreaterThan(0);
      }

      expect(item.sources.some((source) => source.language === 'vi'), item.key).toBe(true);
      expect(item.sources.some((source) => source.language === 'en'), item.key).toBe(true);
    }
  });

  it('tọa độ nằm trong phạm vi hợp lệ khi có địa điểm', () => {
    for (const item of items) {
      if (item.latitude !== null) {
        expect(Math.abs(item.latitude), item.key).toBeLessThanOrEqual(90);
      }
      if (item.longitude !== null) {
        expect(Math.abs(item.longitude), item.key).toBeLessThanOrEqual(180);
      }
    }
  });

  it('mốc sửa đổi là ngày hợp lệ khi có', () => {
    for (const item of items) {
      if (item.revisedAt !== null) {
        expect(isValidIso(item.revisedAt), item.key).toBe(true);
      }
    }
  });

  it('ghi rõ giấy phép mở của nguồn', () => {
    expect(feed?.license).toContain('CC BY-SA');
    expect(feed?.license).toContain('CC0');
  });
});
