import { DataError, NetworkError } from '@/core/exceptions';

/** Địa chỉ máy chủ dữ liệu, chỉ dùng ở phía máy chủ Next.js. */
export const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5080'
).replace(/\/+$/, '');

/** Tùy chọn cho một yêu cầu đọc dữ liệu. */
interface GetOptions {
  /** Số giây lưu bộ nhớ đệm của Next.js. Bỏ trống để dùng mặc định. */
  revalidate?: number;
  /** Thẻ bộ nhớ đệm để có thể làm mới theo nhóm. */
  tags?: string[];
}

/**
 * Máy khách HTTP dùng chung cho các dịch vụ dữ liệu.
 * Tự động gắn thời gian chờ, kiểm tra mã trạng thái và chuyển lỗi kỹ thuật thành lỗi nghiệp vụ.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs = 6000,
  ) {}

  /**
   * Gửi yêu cầu đọc dữ liệu.
   * @param path Đường dẫn bắt đầu bằng dấu gạch chéo.
   * @param options Tùy chọn bộ nhớ đệm.
   * @returns Dữ liệu đã giải tuần tự hoặc null nếu máy chủ trả về 404/204.
   * @throws NetworkError Khi không kết nối được hoặc mã trạng thái không thành công.
   * @throws DataError Khi phản hồi không phải JSON hợp lệ.
   */
  async get<T>(path: string, options: GetOptions = {}): Promise<T | null> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
        ...(options.revalidate === 0
          ? { cache: 'no-store' as const }
          : {
              next: {
                revalidate: options.revalidate ?? 300,
                ...(options.tags ? { tags: options.tags } : {}),
              },
            }),
      });
    } catch (error) {
      throw new NetworkError(`Không kết nối được tới ${url}.`, { cause: error });
    }

    if (response.status === 404 || response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new NetworkError(
        `Máy chủ dữ liệu trả về mã ${response.status}.`,
        { cause: new Error(await safeReadText(response)) },
      );
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new DataError(undefined, { cause: error });
    }
  }

  /**
   * Gửi yêu cầu tạo mới dữ liệu.
   * @param path Đường dẫn điểm cuối.
   * @param body Dữ liệu cần gửi.
   * @returns Phản hồi thô để dịch vụ nghiệp vụ xử lý theo mã trạng thái.
   * @throws NetworkError Khi không kết nối được hoặc quá thời gian chờ.
   */
  async post(path: string, body: unknown): Promise<Response> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    try {
      return await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new NetworkError(`Không gửi được yêu cầu tới ${url}.`, { cause: error });
    }
  }
}

/**
 * Đọc nội dung lỗi nhưng không làm hỏng luồng xử lý chính.
 * @param response Phản hồi cần đọc.
 * @returns Nội dung văn bản, tối đa 500 ký tự.
 */
async function safeReadText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return '';
  }
}
