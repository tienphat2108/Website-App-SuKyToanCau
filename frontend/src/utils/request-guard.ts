/**
 * Nhận diện yêu cầu do công cụ tự động gửi tới biểu mẫu công khai.
 *
 * Danh sách chỉ gồm những chuỗi đặc trưng của trình thu thập, thư viện HTTP và
 * trình duyệt điều khiển tự động. Nhờ vậy người dùng thật trên trình duyệt thông
 * thường, kể cả các dòng điện thoại có chữ "bot" trong tên, vẫn gửi được.
 */
const AUTOMATED_AGENT =
  /(googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp|discordbot|crawler|spider|scrapy|curl\/|wget\/|python-requests|python\/|aiohttp|httpx|go-http-client|java\/|libwww-perl|httpclient|headlesschrome|phantomjs|selenium|puppeteer|playwright|postmanruntime|insomnia)/i;

/**
 * Cho biết một yêu cầu có dấu hiệu do công cụ tự động gửi hay không.
 * Yêu cầu thiếu tên tác nhân người dùng bị coi là đáng ngờ.
 * @param userAgent Giá trị tiêu đề User-Agent.
 * @returns Đúng nếu nên chặn yêu cầu.
 */
export function isAutomatedRequest(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length === 0) {
    return true;
  }

  return AUTOMATED_AGENT.test(userAgent);
}
