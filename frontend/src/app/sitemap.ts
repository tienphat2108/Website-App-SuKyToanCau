import type { MetadataRoute } from 'next';
import { locales, type Locale } from '@/core/i18n/config';
import { collections } from '@/data/collections';
import { historicalService } from '@/services/historical.service';
import { absoluteUrl } from '@/utils/site';

/** Sơ đồ trang được làm mới mỗi giờ để phản ánh bài viết mới. */
export const revalidate = 3600;

/** Đường dẫn tĩnh của website, không gồm trang cảm ơn vì trang đó không được lập chỉ mục. */
const STATIC_PAGES = [
  '/',
  '/timeline',
  '/stories',
  '/updates',
  '/about',
  '/faq',
  '/contribute',
  '/privacy',
  '/on-this-day',
  '/collections',
  ...collections.map((collection) => `/collections/${collection.slug}`),
] as const;

/**
 * Tạo đường dẫn công khai cho một ngôn ngữ.
 * @param locale Ngôn ngữ.
 * @param path Đường dẫn nội bộ.
 * @returns Đường dẫn có tiền tố khi cần.
 */
function localePath(locale: Locale, path: string): string {
  if (locale === 'vi') {
    return path;
  }

  return path === '/' ? '/en' : `/en${path}`;
}

/**
 * Tạo sơ đồ trang cho cả hai ngôn ngữ.
 * Mỗi mục kèm liên kết ngôn ngữ thay thế để công cụ tìm kiếm hiểu quan hệ giữa
 * bản tiếng Việt và bản tiếng Anh. Nếu API không sẵn sàng, dịch vụ dùng dữ liệu mẫu.
 * @returns Danh sách mục sơ đồ trang.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await historicalService.getAll();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      lastModified: now,
      changeFrequency: path === '/' || path === '/timeline' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/timeline' ? 0.9 : path === '/stories' ? 0.7 : 0.6,
      alternates: {
        languages: {
          vi: absoluteUrl(localePath('vi', path)),
          en: absoluteUrl(localePath('en', path)),
        },
      },
    })),
  );

  const eventEntries: MetadataRoute.Sitemap = events.flatMap((event) =>
    locales.map((locale) => {
      const path = event.href(locale);

      return {
        url: absoluteUrl(path),
        lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: event.featured ? 0.8 : 0.7,
        alternates: {
          languages: {
            vi: absoluteUrl(event.href('vi')),
            en: absoluteUrl(event.href('en')),
          },
        },
      };
    }),
  );

  return [...staticEntries, ...eventEntries];
}
