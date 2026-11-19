import { loadRecentUpdates } from '@/data/recent-updates';
import { isBrowserFeedRequest, renderFeedPreview } from '@/lib/feed-preview';
import { absoluteUrl } from '@/utils/site';

/**
 * Nguồn cấp RSS riêng cho khu cập nhật từ nguồn mở.
 * Đọc cùng tệp dữ liệu với trang `/updates` nên nội dung luôn khớp nhau;
 * chỉ gửi tiêu đề, tóm tắt và liên kết tới bài gốc.
 */
export const revalidate = 1800;

/**
 * Thoát ký tự đặc biệt để nội dung an toàn trong tài liệu XML.
 * @param value Chuỗi cần làm sạch.
 * @returns Chuỗi đã thoát ký tự.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Đổi ngày của mục cập nhật sang định dạng RFC 822 dùng trong RSS.
 * @param value Chuỗi ngày ISO hoặc giá trị dự phòng.
 * @returns Chuỗi ngày hợp lệ.
 */
function toRfc822(value: string | null): string {
  const parsed = value ? new Date(value) : null;

  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed.toUTCString();
  }

  return new Date().toUTCString();
}

/**
 * Tạo phản hồi RSS 2.0 cho các mục cập nhật mới nhất.
 * @returns Phản hồi XML đúng chuẩn RSS.
 */
export async function GET(request: Request): Promise<Response> {
  const feed = await loadRecentUpdates();
  const feedHref = absoluteUrl('/updates');
  const selfHref = absoluteUrl('/updates/feed.xml');

  const entries = feed.items.map((item) => {
    const source =
      item.sources.find((entry) => entry.language === 'vi') ?? item.sources[0];

    return {
      key: item.key,
      title: item.titleVi,
      href: source?.url ?? feedHref,
      summary: item.summaryVi,
      date: item.date ?? null,
    };
  });

  if (isBrowserFeedRequest(request)) {
    return new Response(
      renderFeedPreview({
        title: 'Sử Ký Toàn Cầu — Cập nhật từ nguồn mở',
        description:
          'Sự kiện lịch sử mới do cộng đồng Wikidata và Wikipedia cập nhật, có bài bằng cả tiếng Việt và tiếng Anh.',
        feedPath: '/updates/feed.xml',
        baseUrl: new URL(request.url).origin,
        backHref: '/updates',
        backLabel: 'Khu cập nhật',
        items: entries.map((entry) => ({
          title: entry.title,
          href: entry.href,
          summary: entry.summary,
          date: entry.date ?? undefined,
        })),
      }),
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=1800',
          Vary: 'Accept, Sec-Fetch-Mode',
        },
      },
    );
  }

  const items = entries
    .map((entry) => [
      '<item>',
      `<title>${escapeXml(entry.title)}</title>`,
      `<link>${escapeXml(entry.href)}</link>`,
      `<guid isPermaLink="false">${escapeXml(entry.key)}</guid>`,
      `<description>${escapeXml(entry.summary)}</description>`,
      `<pubDate>${toRfc822(entry.date)}</pubDate>`,
      '</item>',
    ].join(''))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Sử Ký Toàn Cầu — Cập nhật từ nguồn mở</title>
<link>${escapeXml(feedHref)}</link>
<description>Sự kiện lịch sử mới do cộng đồng Wikidata và Wikipedia cập nhật, có bài bằng cả tiếng Việt và tiếng Anh.</description>
<language>vi</language>
<lastBuildDate>${toRfc822(feed.generatedAt)}</lastBuildDate>
<atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800',
      Vary: 'Accept, Sec-Fetch-Mode',
    },
  });
}
