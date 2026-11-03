import { describe, expect, it } from 'vitest';
import { isAutomatedRequest } from '@/utils/request-guard';

describe('isAutomatedRequest', () => {
  it('cho phép trình duyệt thông thường', () => {
    expect(
      isAutomatedRequest(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      ),
    ).toBe(false);
    expect(
      isAutomatedRequest(
        'Mozilla/5.0 (Linux; Android 13; CUBOT X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
      ),
    ).toBe(false);
  });

  it('chặn công cụ dòng lệnh và thư viện tự động', () => {
    expect(isAutomatedRequest('curl/8.4.0')).toBe(true);
    expect(isAutomatedRequest('python-requests/2.31.0')).toBe(true);
    expect(isAutomatedRequest('Go-http-client/1.1')).toBe(true);
    expect(isAutomatedRequest('Mozilla/5.0 HeadlessChrome/130.0')).toBe(true);
  });

  it('chặn yêu cầu thiếu tên tác nhân người dùng', () => {
    expect(isAutomatedRequest('')).toBe(true);
    expect(isAutomatedRequest(null)).toBe(true);
    expect(isAutomatedRequest(undefined)).toBe(true);
  });
});
