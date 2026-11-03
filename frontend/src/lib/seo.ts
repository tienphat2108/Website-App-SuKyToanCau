import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { defaultLocale, stripLocalePrefix, type Locale } from '@/core/i18n/config';
import { getDictionary } from '@/core/i18n/dictionary';
import { getLocale } from '@/core/i18n/server';
import { absoluteUrl } from '@/utils/site';

/** Kích thước ảnh chia sẻ mặc định. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Lấy đường dẫn công khai của yêu cầu hiện tại do middleware gắn vào.
 * @returns Đường dẫn bắt đầu bằng dấu gạch chéo, ví dụ /en/timeline.
 */
export async function getRequestPath(): Promise<string> {
  const headerStore = await headers();
  const path = headerStore.get('x-pathname');
  return path && path.startsWith('/') ? path : '/';
}

/**
 * Tạo đường dẫn công khai cho một ngôn ngữ.
 * @param locale Ngôn ngữ đích.
 * @param path Đường dẫn nội bộ không có tiền tố.
 * @returns Đường dẫn đầy đủ trên website.
 */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === defaultLocale) {
    return path || '/';
  }

  return path === '/' ? '/en' : `/en${path}`;
}

/** Tùy chọn đầu vào cho hàm tạo siêu dữ liệu trang. */
export interface PageMetadataOptions {
  /** Tiêu đề trang, sẽ được ghép với mẫu tên website. */
  title: string;
  /** Mô tả riêng của trang. */
  description: string;
  /** Đặt tiêu đề tuyệt đối, không ghép mẫu. */
  absoluteTitle?: boolean;
  /** Không cho công cụ tìm kiếm lập chỉ mục. */
  noindex?: boolean;
  /** Từ khóa bổ sung. */
  keywords?: string[];
  /** Loại nội dung cho Open Graph. */
  type?: 'website' | 'article';
  /** Thời điểm công bố, dùng cho bài viết. */
  publishedTime?: string;
  /** Thời điểm cập nhật, dùng cho bài viết. */
  modifiedTime?: string;
  /** Ảnh chia sẻ riêng; mặc định dùng ảnh bìa của website. */
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

/**
 * Tạo siêu dữ liệu đầy đủ cho một trang: tiêu đề, mô tả, canonical, ngôn ngữ thay thế,
 * thẻ Open Graph và Twitter. Đường dẫn được lấy từ yêu cầu nên trang tiếng Anh
 * và tiếng Việt có canonical riêng, tránh trùng lặp nội dung.
 * @param options Thông tin riêng của trang.
 * @returns Đối tượng Metadata của Next.js.
 */
export async function createPageMetadata(options: PageMetadataOptions): Promise<Metadata> {
  const [locale, requestPath] = await Promise.all([getLocale(), getRequestPath()]);
  const dictionary = getDictionary(locale);
  const internalPath = stripLocalePrefix(requestPath) || '/';
  const canonicalPath = localizedPath(locale, internalPath);
  const viPath = localizedPath('vi', internalPath);
  const enPath = localizedPath('en', internalPath);

  const image = options.image ?? {
    url: '/images/og-cover.png',
    alt: dictionary.meta.siteName,
    width: OG_WIDTH,
    height: OG_HEIGHT,
  };

  return {
    title: options.absoluteTitle ? { absolute: options.title } : options.title,
    description: options.description,
    keywords: options.keywords,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: {
        vi: absoluteUrl(viPath),
        en: absoluteUrl(enPath),
        'x-default': absoluteUrl(viPath),
      },
    },
    openGraph: {
      type: options.type ?? 'website',
      title: options.title,
      description: options.description,
      url: absoluteUrl(canonicalPath),
      siteName: dictionary.meta.siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      images: [
        {
          url: absoluteUrl(image.url),
          width: image.width ?? OG_WIDTH,
          height: image.height ?? OG_HEIGHT,
          alt: image.alt,
        },
      ],
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [absoluteUrl(image.url)],
    },
    robots: options.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

/** Một mắt đường dẫn dùng để tạo dữ liệu có cấu trúc. */
export interface StructuredBreadcrumb {
  label: string;
  /** Đường dẫn công khai đầy đủ. */
  url: string;
}

/**
 * Tạo dữ liệu có cấu trúc BreadcrumbList.
 * @param items Các mắt theo thứ tự từ gốc tới trang hiện tại.
 * @returns Đối tượng JSON-LD.
 */
export function createBreadcrumbJsonLd(
  items: StructuredBreadcrumb[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.url,
    })),
  };
}
