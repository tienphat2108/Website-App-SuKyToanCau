/**
 * Hệ thống lỗi phía máy khách.
 * Mỗi lỗi mang mã ổn định để tầng hiển thị có thể chọn thông điệp phù hợp.
 */

/** Lớp cơ sở cho lỗi của ứng dụng. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Lỗi không kết nối được tới máy chủ dữ liệu. */
export class NetworkError extends AppError {
  constructor(message = 'Không thể kết nối tới máy chủ dữ liệu.', options?: ErrorOptions) {
    super(message, 'NETWORK_ERROR', options);
  }
}

/** Lỗi dữ liệu trả về không đúng cấu trúc mong đợi. */
export class DataError extends AppError {
  constructor(message = 'Dữ liệu nhận được không đúng định dạng.', options?: ErrorOptions) {
    super(message, 'DATA_ERROR', options);
  }
}

/** Lỗi không tìm thấy tài nguyên. */
export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy nội dung.', options?: ErrorOptions) {
    super(message, 'NOT_FOUND', options);
  }
}

/**
 * Chuyển một lỗi chưa biết thành lỗi mạng có thông điệp an toàn.
 * @param error Lỗi gốc.
 * @returns Lỗi mạng.
 */
export function toNetworkError(error: unknown): NetworkError {
  return error instanceof NetworkError
    ? error
    : new NetworkError(undefined, { cause: error });
}
