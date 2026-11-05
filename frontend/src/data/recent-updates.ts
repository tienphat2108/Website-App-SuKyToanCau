import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Nguồn tham khảo của một mục cập nhật, trỏ thẳng bài viết gốc. */
export interface RecentUpdateSource {
  title: string;
  publisher: string;
  url: string;
  language: string;
  license: string;
}

/** Một sự kiện do bộ quét nguồn mở thu thập. */
export interface RecentUpdateItem {
  key: string;
  date: string;
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  languages: number;
  revisedAt: string | null;
  sources: RecentUpdateSource[];
}

/** Tài liệu phát hành của khu cập nhật từ nguồn mở. */
export interface RecentUpdateFeed {
  version: number;
  generatedAt: string;
  windowMonths: number;
  source: string;
  minLinks: number;
  license: string;
  note: string;
  count: number;
  items: RecentUpdateItem[];
}

const FILE = join(process.cwd(), '..', 'shared', 'recent-events.json');

/** Tệp phát hành trên kho GitHub công khai, do bộ quét hẹn giờ đẩy lên hằng tuần. */
const DEFAULT_FEED_URL =
  'https://cdn.jsdelivr.net/gh/tienphat2108/Website-App-SuKyToanCau@main/shared/recent-events.json';

const EMPTY_FEED: RecentUpdateFeed = {
  version: 1,
  generatedAt: '',
  windowMonths: 0,
  source: '',
  minLinks: 0,
  license: '',
  note: '',
  count: 0,
  items: [],
};

/** Đọc tệp cục bộ dùng khi dựng, khi không có mạng hoặc khi ép chế độ "local". */
function readLocalFile(): RecentUpdateFeed {
  if (!existsSync(FILE)) return EMPTY_FEED;

  try {
    const parsed = JSON.parse(readFileSync(FILE, 'utf8')) as RecentUpdateFeed;
    if (!Array.isArray(parsed.items)) return EMPTY_FEED;

    return {
      ...parsed,
      items: [...parsed.items].sort((a, b) => b.date.localeCompare(a.date)),
    };
  } catch {
    return EMPTY_FEED;
  }
}

/**
 * Kiểm tra hình dạng dữ liệu từ xa trước khi hiển thị: đây là dữ liệu ngoài
 * hệ thống (CDN công khai) nên phải chặn tại biên trước khi chạm vào giao diện.
 */
function isFeed(value: unknown): value is RecentUpdateFeed {
  if (typeof value !== 'object' || value === null) return false;
  const feed = value as Partial<RecentUpdateFeed>;
  if (typeof feed.version !== 'number' || typeof feed.generatedAt !== 'string' || !Array.isArray(feed.items)) {
    return false;
  }

  return feed.items.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const it = item as Partial<RecentUpdateItem>;
    const isText = (v: unknown): boolean => typeof v === 'string';
    return (
      isText(it.key) &&
      isText(it.date) &&
      isText(it.titleVi) &&
      isText(it.titleEn) &&
      isText(it.summaryVi) &&
      isText(it.summaryEn) &&
      Array.isArray(it.sources) &&
      it.sources.every(
        (s) => typeof s === 'object' && s !== null && isText((s as Partial<RecentUpdateSource>).url) && /^https:\/\//.test((s as RecentUpdateSource).url),
      )
    );
  });
}

/**
 * Nạp tài liệu cập nhật, xếp mới nhất lên đầu.
 *
 * Ưu tiên đọc bản mới nhất từ CDN của kho GitHub để khu này tự đổi mới mà
 * không cần dựng lại website; khi không lấy được thì quay về tệp cục bộ trong
 * bản dựng. Đặt UPDATES_FEED_URL="local" để chỉ đọc tệp cục bộ.
 * @returns Tài liệu cập nhật đã sắp xếp theo ngày giảm dần.
 */
export async function loadRecentUpdates(): Promise<RecentUpdateFeed> {
  const feedUrl = process.env.UPDATES_FEED_URL ?? DEFAULT_FEED_URL;
  if (feedUrl === 'local') return readLocalFile();

  try {
    const response = await fetch(feedUrl, {
      headers: { 'user-agent': 'sukytoancau/1.0 (updates feed reader)' },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed: unknown = await response.json();
    if (!isFeed(parsed)) throw new Error('du lieu khong dung hinh dang');

    return { ...parsed, items: [...parsed.items].sort((a, b) => b.date.localeCompare(a.date)) };
  } catch {
    return readLocalFile();
  }
}
