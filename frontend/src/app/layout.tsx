import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Merriweather, Source_Serif_4 } from 'next/font/google';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { MotionProvider } from '@/components/providers/motion-provider';
import { ThemeScript } from '@/components/providers/theme-script';
import { ConsentManager } from '@/components/providers/consent-manager';
import { DevToolsGuard } from '@/components/security/devtools-guard';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { StickyCta } from '@/components/layout/sticky-cta';
import { JsonLd } from '@/components/ui/json-ld';
import { htmlLang } from '@/core/i18n/config';
import { getDictionary } from '@/core/i18n/dictionary';
import { getLocale } from '@/core/i18n/server';
import { getPreferredCountry } from '@/core/preferences/server';
import { seedEvents } from '@/data/seed';
import { absoluteUrl } from '@/utils/site';
import './globals.css';

// Dải tin đầu trang lấy số liệu trực tiếp từ kho dữ liệu để không bao giờ lệch với thực tế.
const EVENT_COUNT = seedEvents.length;
const COUNTRY_COUNT = new Set(seedEvents.map((event) => event.country)).size;

/**
 * Phông chữ tiêu đề Merriweather.
 * Nạp kèm tập ký tự Latinh và tiếng Việt để hiển thị đủ dấu, đồng thời xuất biến
 * `--font-display` cho Tailwind dùng lại ở mọi tiêu đề.
 * `display: 'swap'` giúp chữ hiện ngay bằng phông dự phòng thay vì chờ tải xong.
 */
const displayFont = Merriweather({
  subsets: ['latin', 'vietnamese'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * Phông chữ nội dung Source Serif 4.
 * Dùng cho toàn bộ văn bản thân trang, xuất biến `--font-body` để Tailwind áp dụng
 * thống nhất cho cả giao diện sáng và tối.
 */
const bodyFont = Source_Serif_4({
  subsets: ['latin', 'vietnamese'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

/**
 * Phông chữ giao diện Be Vietnam Pro.
 * Dùng cho những thành phần mang tính điều khiển như menu, nút, nhãn biểu mẫu và
 * thẻ lọc. Chữ không chân giúp các nhãn ngắn hiển thị rõ và đều hơn chữ có chân,
 * trong khi tiêu đề và thân bài vẫn giữ nét biên tập của phông có chân.
 */
const uiFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

/**
 * Siêu dữ liệu mặc định của toàn website.
 * Tiêu đề của từng trang sẽ được ghép với mẫu tên website trong `title.template`.
 *
 * Không khai báo `robots` ở đây: mọi trang đều đi qua `createPageMetadata` nên đã tự đặt
 * chỉ dẫn thu thập. Nếu khung gốc cũng khai báo, trang 404 sẽ nhận thêm một thẻ
 * `index, follow` song song với thẻ `noindex` mà Next.js tự gắn, gây chỉ dẫn trái ngược.
 * @returns Siêu dữ liệu gốc.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const isEnglish = locale === 'en';
  const canonical = absoluteUrl(isEnglish ? '/en' : '/');

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: dictionary.meta.defaultTitle,
      template: dictionary.meta.titleTemplate,
    },
    description: dictionary.meta.description,
    keywords: dictionary.meta.keywords,
    applicationName: dictionary.meta.siteName,
    authors: [{ name: dictionary.meta.siteName }],
    creator: dictionary.meta.siteName,
    publisher: dictionary.meta.siteName,
    generator: 'Next.js',
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: { email: false, address: false, telephone: false },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
    alternates: {
      canonical,
      languages: {
        vi: absoluteUrl('/'),
        en: absoluteUrl('/en'),
        'x-default': absoluteUrl('/'),
      },
      types: {
        'application/rss+xml': absoluteUrl('/feed.xml'),
      },
    },
    openGraph: {
      type: 'website',
      title: dictionary.meta.defaultTitle,
      description: dictionary.meta.description,
      url: canonical,
      siteName: dictionary.meta.siteName,
      locale: isEnglish ? 'en_US' : 'vi_VN',
      alternateLocale: isEnglish ? ['vi_VN'] : ['en_US'],
      images: [
        {
          url: absoluteUrl('/images/og-cover.png'),
          width: 1200,
          height: 630,
          alt: dictionary.meta.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.meta.defaultTitle,
      description: dictionary.meta.description,
      images: [absoluteUrl('/images/og-cover.png')],
    },
  };
}

/** Cấu hình khung nhìn và màu thanh trình duyệt theo giao diện. */
export const viewport: Viewport = {  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f5ef' },
    { media: '(prefers-color-scheme: dark)', color: '#11161d' },
  ],
  colorScheme: 'light dark',
};

/**
 * Khung gốc của ứng dụng.
 * Ngôn ngữ được đọc từ tiêu đề do middleware gắn vào, sau đó cung cấp cho toàn bộ
 * cây giao diện phía trình duyệt qua I18nProvider. MotionProvider nằm ngoài để mọi
 * thành phần hoạt ảnh, kể cả những khối đọc nhãn đa ngôn ngữ, cùng dùng một nhịp.
 * @param props.children Nội dung trang hiện tại.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const preferredCountry = await getPreferredCountry();
  const siteUrl = absoluteUrl(locale === 'en' ? '/en' : '/');

  // Dữ liệu có cấu trúc mô tả website và hành động tìm kiếm nội bộ.
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: dictionary.meta.siteName,
    alternateName: locale === 'en' ? 'World History Archive' : 'Sử Ký Toàn Cầu',
    url: siteUrl,
    description: dictionary.meta.description,
    inLanguage: ['vi-VN', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(locale === 'en' ? '/en/timeline' : '/timeline')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={htmlLang[locale]} className={`${displayFont.variable} ${bodyFont.variable} ${uiFont.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body id="top" className="font-body">
        <MotionProvider>
          <I18nProvider locale={locale}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
            >
              {dictionary.common.skipToContent}
            </a>

            <Navbar
              preferredCountry={preferredCountry}
              eventCount={EVENT_COUNT}
              countryCount={COUNTRY_COUNT}
            />

            <main id="main-content" className="scroll-mt-24">
              {children}
            </main>

            <Footer />
            <StickyCta />
            <ConsentManager />
            <DevToolsGuard />
            <JsonLd data={websiteJsonLd} />
          </I18nProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
