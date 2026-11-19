import { describe, expect, it } from 'vitest';
import { GET } from '@/app/feed.xml/route';
import { seedEvents } from '@/data/seed';

function feedRequest(): Request {
  return new Request('https://suky.example/feed.xml', {
    headers: { accept: 'application/rss+xml, application/xml;q=0.9' },
  });
}

describe('nguồn cấp RSS', () => {
  it('trả về tài liệu RSS 2.0 với đủ một mục cho mỗi sự kiện', async () => {
    const response = await GET(feedRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/rss+xml');

    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml.match(/<item>/g)).toHaveLength(seedEvents.length);
  });

  it('xếp mục theo năm bắt đầu giảm dần, sự kiện mới nhất nằm đầu', async () => {
    const response = await GET(feedRequest());
    const xml = await response.text();

    const newest = [...seedEvents].sort((left, right) => right.startYear - left.startYear)[0];
    const firstTitle = xml.match(/<item>\s*<title>([^<]*)<\/title>/)?.[1];

    expect(firstTitle).toBe(newest.titleVi);
  });

  it('thoát ký tự đặc biệt trong tiêu đề để tài liệu XML không vỡ', async () => {
    const response = await GET(feedRequest());
    const xml = await response.text();

    const titles = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((match) => match[1]);
    expect(titles.length).toBeGreaterThan(0);

    for (const title of titles) {
      expect(title).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
      expect(title).not.toMatch(/[<>]/);
    }
  });

  it('mỗi mục đều có liên kết, định danh và ngày công bố', async () => {
    const response = await GET(feedRequest());
    const xml = await response.text();

    // Kênh cũng có một <link> riêng nên chỉ đếm liên kết trỏ tới bài sự kiện.
    expect(xml.match(/<link>http[^<]*\/event\//g)).toHaveLength(seedEvents.length);
    expect(xml.match(/<guid isPermaLink="true">/g)).toHaveLength(seedEvents.length);
    expect(xml.match(/<pubDate>/g)).toHaveLength(seedEvents.length);
  });

  it('trả trang đọc được cho trình duyệt và vẫn trả XML cho trình đọc tin', async () => {
    const browser = await GET(
      new Request('https://suky.example/feed.xml', {
        headers: { 'sec-fetch-mode': 'navigate', accept: 'text/html' },
      }),
    );

    expect(browser.headers.get('Content-Type')).toContain('text/html');
    expect(browser.headers.get('Vary')).toContain('Sec-Fetch-Mode');

    const html = await browser.text();
    expect(html).toContain('Địa chỉ nguồn cấp');
    expect(html).toContain('https://suky.example/feed.xml');
    expect(html).toContain('Mục mới nhất');

    const reader = await GET(
      new Request('https://suky.example/feed.xml', {
        headers: { accept: 'application/rss+xml, application/xml;q=0.9' },
      }),
    );

    expect(reader.headers.get('Content-Type')).toContain('application/rss+xml');
  });

  it('trả XML thô khi trình duyệt yêu cầu rõ bằng format=xml', async () => {
    const response = await GET(
      new Request('https://suky.example/feed.xml?format=xml', {
        headers: { 'sec-fetch-mode': 'navigate', accept: 'text/html' },
      }),
    );

    expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
  });
});
