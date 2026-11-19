import { randomInt } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getLocale } from '@/core/i18n/server';
import { seedEvents } from '@/data/seed';

/**
 * Điều hướng người đọc tới một sự kiện bất kỳ trong kho dữ liệu.
 * Dùng được cả khi JavaScript chưa tải xong vì đây là chuyển hướng phía máy chủ.
 * Không lưu bộ nhớ đệm để mỗi lần bấm là một sự kiện khác.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const locale = await getLocale();
  const event = seedEvents[randomInt(seedEvents.length)];
  const response = NextResponse.redirect(new URL(event.href(locale), request.url), 307);

  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}
