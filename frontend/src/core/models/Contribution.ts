/**
 * Mô hình trạng thái dùng chung giữa máy chủ và biểu mẫu đóng góp.
 *
 * Kiểu dữ liệu và trạng thái ban đầu được tách khỏi tệp hành động máy chủ để
 * thành phần phía trình duyệt có thể đọc trực tiếp. Tệp đánh dấu "use server"
 * chỉ nên xuất các hàm bất đồng bộ, nên hằng số khởi tạo không đặt ở đó.
 */

/** Giá trị các trường được giữ lại khi biểu mẫu gặp lỗi. */
export interface ContributionFormValues {
  /** Họ và tên người gửi. */
  fullName: string;
  /** Thư điện tử liên hệ. */
  email: string;
  /** Nội dung đóng góp. */
  message: string;
  /** Sự kiện hoặc chủ đề gợi ý, có thể để trống. */
  eventSuggestion: string;
  /** Người gửi đã tích ô đồng ý xử lý dữ liệu hay chưa. */
  consent: boolean;
}

/** Trạng thái biểu mẫu trả về cho trình duyệt. */
export interface ContributionFormState {
  /** Lần gửi gần nhất, dùng để đặt lại biểu mẫu mà vẫn giữ nội dung. */
  attempt: number;
  /** Loại phản hồi để chọn thông báo phù hợp. */
  status: 'idle' | 'error';
  /** Mã lỗi tổng quát. */
  code?: 'VALIDATION' | 'RATE_LIMIT' | 'NETWORK' | 'GENERIC';
  /** Lỗi theo từng trường, đã bản địa hóa. */
  fieldErrors: Record<string, string[]>;
  /** Giá trị người dùng đã nhập. */
  values: ContributionFormValues;
}

/** Trạng thái ban đầu của biểu mẫu, dùng cho lần dựng đầu tiên. */
export const initialContributionState: ContributionFormState = {
  attempt: 0,
  status: 'idle',
  fieldErrors: {},
  values: {
    fullName: '',
    email: '',
    message: '',
    eventSuggestion: '',
    consent: false,
  },
};
