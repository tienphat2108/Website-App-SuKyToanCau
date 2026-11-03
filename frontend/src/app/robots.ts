import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/utils/site';

/**
 * Tạo tệp robots.txt.
 * Cho phép công cụ tìm kiếm đọc toàn bộ nội dung công khai, chặn các trang
 * không có giá trị tìm kiếm và trỏ tới sơ đồ trang.
 * @returns Cấu hình robots.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you', '/en/thank-you'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
