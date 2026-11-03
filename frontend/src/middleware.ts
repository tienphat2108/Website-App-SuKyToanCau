import { NextResponse, type NextRequest } from 'next/server';

/**
 * Tiền tố đường dẫn của tiếng Anh.
 * Tiếng Việt là ngôn ngữ mặc định nên không có tiền tố.
 */
const ENGLISH_PREFIX = '/en';

/** Tên cookie ghi nhớ ngôn ngữ, dùng chung với lớp đọc ngôn ngữ phía máy chủ. */
const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Thời hạn ghi nhớ lựa chọn ngôn ngữ trong một năm. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Gắn ngôn ngữ vào cookie nếu người đọc chưa có hoặc đã đổi ngôn ngữ.
 * Việc chỉ ghi khi cần giúp giảm tiêu đề Set-Cookie lặp lại trên mỗi yêu cầu.
 * @param response Phản hồi cần gắn cookie.
 * @param locale Ngôn ngữ hiện tại.
 * @param request Yêu cầu gốc để đọc cookie cũ.
 */
function syncLocaleCookie(response: NextResponse, locale: string, request: NextRequest): void {
  if (request.cookies.get(LOCALE_COOKIE)?.value === locale) {
    return;
  }

  response.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // Cookie chỉ dùng để máy chủ chọn ngôn ngữ, không cần đọc từ mã trình duyệt.
    httpOnly: true,
  });
}

/**
 * Điều hướng ngôn ngữ và bảo vệ đường dẫn nội bộ.
 *
 * Cách làm: đường dẫn /en/... được viết lại (rewrite) về cùng cây trang với tiếng Việt,
 * đồng thời gắn tiêu đề x-locale để máy chủ chọn từ điển. Cách này giữ URL thật cho
 * người đọc và công cụ tìm kiếm, nhưng không cần nhân đôi toàn bộ cấu trúc trang.
 *
 * @param request Yêu cầu đến từ trình duyệt.
 * @returns Phản hồi viết lại, chuyển hướng hoặc cho đi tiếp.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Bắt buộc HTTPS khi tên miền công khai đã cấu hình bằng https.
  // Bỏ qua máy cục bộ để bản dựng thử vẫn chạy được trên http.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const host = (request.headers.get('host') ?? '').split(':')[0];
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (process.env.NODE_ENV === 'production' && siteUrl.startsWith('https://') && !isLocalHost) {
    const isInsecure = forwardedProto === 'http' || (!forwardedProto && request.nextUrl.protocol === 'http:');

    if (isInsecure) {
      const httpsUrl = request.nextUrl.clone();
      httpsUrl.protocol = 'https:';
      return NextResponse.redirect(httpsUrl, 308);
    }
  }

  // Chuẩn hóa đường dẫn tiếng Việt có tiền tố /vi về dạng không tiền tố.
  if (pathname === '/vi' || pathname.startsWith('/vi/')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/vi/, '') || '/';
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isEnglish = pathname === ENGLISH_PREFIX || pathname.startsWith(`${ENGLISH_PREFIX}/`);
  const locale = isEnglish ? 'en' : 'vi';

  // Luôn ghi đè tiêu đề do trình duyệt gửi lên để tránh giả mạo ngôn ngữ.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-locale');
  requestHeaders.delete('x-internal-locale');
  requestHeaders.set('x-pathname', pathname);

  // Bản phát hành có thể chạy lại middleware sau khi viết lại /en về cây trang gốc.
  // Giữ nguyên tiếng Anh cho yêu cầu nội bộ đó thay vì ghi đè về tiếng Việt.
  if (!isEnglish && request.headers.get('x-internal-locale') === 'en') {
    requestHeaders.set('x-locale', 'en');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  requestHeaders.set('x-locale', locale);

  if (!isEnglish) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    syncLocaleCookie(response, locale, request);
    return response;
  }

  requestHeaders.set('x-internal-locale', 'en');

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === ENGLISH_PREFIX ? '/' : pathname.slice(ENGLISH_PREFIX.length);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  syncLocaleCookie(response, locale, request);
  return response;
}

/**
 * Chỉ chạy middleware cho các trang, bỏ qua tài nguyên tĩnh và tệp hệ thống.
 * Việc loại trừ sớm giúp giảm chi phí và tránh viết lại đường dẫn ảnh, phông chữ.
 */
export const config = {
  matcher: [
    '/((?!_next/|images/|fonts/|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};
