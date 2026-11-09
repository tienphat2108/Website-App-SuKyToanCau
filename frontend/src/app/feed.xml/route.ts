import { seedEvents } from '@/data/seed';
import { absoluteUrl } from '@/utils/site';

/**
 * Mốc phát hành của kho dữ liệu mẫu v7, dùng làm ngày công bố chung cho các mục
 * RSS vì bộ sự kiện không lưu ngày cập nhật từng bài.
 */
const FEED_PUB_DATE = 'Sat, 08 Nov 2026 09:00:00 +0700';

/**
 * Thay các ký tự đặc biệt để nội dung an toàn khi nhúng vào tài liệu XML.
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
 * Tuyến RSS 2.0 liệt kê toàn bộ sự kiện trong kho dữ liệu, mới nhất theo năm trước.
 * Đọc trực tiếp từ dữ liệu mẫu nên không cần máy chủ phụ; chỉ gửi tiêu đề và
 * tóm tắt tiếng Việt, liên kết trỏ về bài viết đầy đủ.
 * @returns Phản hồi XML đúng chuẩn RSS.
 */
export async function GET(): Promise<Response> {
  const items = [...seedEvents]
    .sort((left, right) => right.startYear - left.startYear)
    .map((event) => {
      const href = absoluteUrl(event.href('vi'));

      return [
        '<item>',
        `<title>${escapeXml(event.titleVi)}</title>`,
        `<link>${escapeXml(href)}</link>`,
        `<guid isPermaLink="true">${escapeXml(href)}</guid>`,
        `<description>${escapeXml(event.summaryVi)}</description>`,
        `<pubDate>${FEED_PUB_DATE}</pubDate>`,
        '</item>',
      ].join('');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Sử Ký Toàn Cầu</title>
<link>${escapeXml(absoluteUrl('/'))}</link>
<description>Bách khoa lịch sử mở song ngữ Việt – Anh: các sự kiện lịch sử Việt Nam và thế giới kèm nguồn kiểm chứng.</description>
<language>vi</language>
<lastBuildDate>${FEED_PUB_DATE}</lastBuildDate>
<atom:link href="${escapeXml(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
