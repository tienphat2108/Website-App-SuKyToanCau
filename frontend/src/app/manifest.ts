import type { MetadataRoute } from 'next';

/**
 * Khai báo ứng dụng web (manifest) để trình duyệt và hệ điều hành nhận diện
 * Sử Ký Toàn Cầu như một ứng dụng đọc được cài trên màn hình chính.
 * Biểu tượng dùng lại tệp PNG đã có trong kho ảnh, không sinh thêm tài nguyên.
 * @returns Nội dung manifest theo chuẩn của Next.js.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sử Ký Toàn Cầu — Bách khoa lịch sử mở',
    short_name: 'Sử Ký',
    description:
      'Bách khoa lịch sử thế giới song ngữ Việt – Anh, ưu tiên lịch sử Việt Nam, kèm nguồn kiểm chứng.',
    lang: 'vi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8f5ef',
    theme_color: '#11161d',
    categories: ['education', 'books', 'reference'],
    icons: [
      { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
