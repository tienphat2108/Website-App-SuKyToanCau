import { NetworkError } from '@/core/exceptions';
import { ApiClient, API_BASE_URL } from './api.client';

/** Dữ liệu người đọc gửi từ biểu mẫu đóng góp. */
export interface ContributionPayload {
  fullName: string;
  email: string;
  message: string;
  eventSuggestion?: string;
  website?: string;
  locale?: string;
}

/** Kết quả gửi đóng góp. */
export interface ContributionResult {
  ok: boolean;
  status: number;
  fieldErrors: Record<string, string[]>;
  message?: string;
}

/**
 * Dịch vụ gửi đóng góp tới API.
 * Không bao giờ ném lỗi ra ngoài để biểu mẫu luôn có thể hiển thị thông báo thân thiện.
 */
export class ContributionService {
  constructor(private readonly client: ApiClient) {}

  /**
   * Gửi một đóng góp.
   * @param payload Dữ liệu đã kiểm tra sơ bộ ở giao diện.
   * @returns Kết quả gồm mã trạng thái và lỗi theo trường.
   */
  async submit(payload: ContributionPayload): Promise<ContributionResult> {
    try {
      const response = await this.client.post('/api/contributions', payload);

      if (response.status === 202) {
        return { ok: true, status: 202, fieldErrors: {} };
      }

      if (response.status === 400) {
        const problem = (await response.json().catch(() => null)) as
          | { errors?: Record<string, string[]> }
          | null;

        return {
          ok: false,
          status: 400,
          fieldErrors: problem?.errors ?? {},
        };
      }

      return {
        ok: false,
        status: response.status,
        fieldErrors: {},
        message: response.status === 429 ? 'RATE_LIMIT' : 'GENERIC',
      };
    } catch (error) {
      if (error instanceof NetworkError) {
        return { ok: false, status: 0, fieldErrors: {}, message: 'NETWORK' };
      }

      return { ok: false, status: 0, fieldErrors: {}, message: 'GENERIC' };
    }
  }
}

/** Thực thể dịch vụ dùng chung cho hành động phía máy chủ. */
export const contributionService = new ContributionService(new ApiClient(API_BASE_URL));
