/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Nội dung Chính sách bảo mật nội dung.
 * Ghi chú: Next.js chèn một số đoạn mã nội tuyến khi khởi động nên cần cho phép 'unsafe-inline'.
 * Riêng chế độ phát triển cần thêm 'unsafe-eval' vì React Refresh dùng eval để biên dịch lại
 * thành phần; thiếu quyền này, việc tiếp thủy (hydration) dừng lại và các thành phần tương tác
 * như bản đồ không bao giờ hiển thị. Bản phát hành không cần và không được phép bật eval.
 * Khi triển khai thật, nên thay bằng cơ chế nonce để siết chặt hơn.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  // Bản đồ vẽ hoàn toàn bằng dữ liệu đóng gói trong dự án nên không còn phải xin phép
  // tải ảnh từ máy chủ bản đồ bên thứ ba; bỏ quyền này đồng nghĩa trình duyệt không
  // còn gửi địa chỉ IP của người đọc tới dịch vụ ngoài khi xem bản đồ.
  "img-src 'self' data: blob: https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Download-Options', value: 'noopen' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  experimental: {
    externalDir: true,
    // Giới hạn dung lượng dữ liệu gửi lên hành động máy chủ; website không có tệp đính kèm.
    serverActions: {
      bodySizeLimit: '64kb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
