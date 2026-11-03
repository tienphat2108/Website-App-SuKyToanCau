import type { MetadataRoute } from 'next';

/**
 * Khai báo thông tin ứng dụng web để trình duyệt và thiết bị di động nhận diện.
 * @returns Nội dung tệp manifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sử Ký Toàn Cầu – Bách khoa lịch sử',
    short_name: 'Sử Ký',
    description:
      'Bách khoa lịch sử Việt Nam và thế giới với dòng thời gian, bản đồ và bài viết song ngữ.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f8f5ef',
    theme_color: '#101b26',
    lang: 'vi',
    dir: 'ltr',
    categories: ['education', 'books', 'reference'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
