'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { localizePath } from '@/core/i18n/config';
import { getLocale } from '@/core/i18n/server';
import { getDictionary } from '@/core/i18n/dictionary';
import type { ContributionFormState, ContributionFormValues } from '@/core/models/Contribution';
import { contributionService } from '@/services/contribution.service';
import { isAutomatedRequest } from '@/utils/request-guard';

/**
 * Đọc một trường văn bản từ dữ liệu biểu mẫu và giới hạn độ dài.
 * @param formData Dữ liệu biểu mẫu.
 * @param name Tên trường.
 * @param maxLength Độ dài tối đa cho phép.
 * @returns Chuỗi đã cắt khoảng trắng và giới hạn độ dài.
 */
function readField(formData: FormData, name: string, maxLength: number): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/**
 * Hành động máy chủ xử lý biểu mẫu đóng góp.
 *
 * Dữ liệu được kiểm tra lại ở máy chủ thay vì tin vào kiểm tra phía trình duyệt.
 * Thư điện tử và địa chỉ mạng không bao giờ được ghi log; việc mã hóa và băm
 * diễn ra trong dịch vụ phía sau và tầng lưu trữ.
 *
 * @param previousState Trạng thái trước đó do React quản lý.
 * @param formData Dữ liệu người đọc gửi lên.
 * @returns Trạng thái lỗi để hiển thị, hoặc chuyển hướng tới trang cảm ơn khi thành công.
 */
export async function submitContribution(
  previousState: ContributionFormState,
  formData: FormData,
): Promise<ContributionFormState> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const messages = dictionary.contribute.fieldErrors;

  const values: ContributionFormValues = {
    fullName: readField(formData, 'fullName', 120),
    email: readField(formData, 'email', 254),
    message: readField(formData, 'message', 5000),
    eventSuggestion: readField(formData, 'eventSuggestion', 200),
    consent: formData.get('consent') === 'on',
  };
  const website = readField(formData, 'website', 200);

  // Chặn công cụ tự động trước khi kiểm tra chi tiết; người dùng thật luôn có tên trình duyệt.
  const requestHeaders = await headers();
  if (isAutomatedRequest(requestHeaders.get('user-agent'))) {
    return {
      attempt: previousState.attempt + 1,
      status: 'error',
      code: 'GENERIC',
      fieldErrors: {},
      values,
    };
  }

  const fieldErrors: Record<string, string[]> = {};

  if (values.fullName.length < 2) {
    fieldErrors.fullName = [messages.fullName];
  }

  if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(values.email)) {
    fieldErrors.email = [messages.email];
  }

  if (values.message.length < 20) {
    fieldErrors.message = [messages.message];
  }

  // Đồng ý xử lý dữ liệu phải là hành động rõ ràng của người gửi, không suy ra
  // từ việc bấm Gửi; thiếu ô tích thì yêu cầu bị chặn ngay tại máy chủ.
  if (!values.consent) {
    fieldErrors.consent = [messages.consent];
  }

  // Bẫy chống tự động gửi: trường ẩn phải luôn trống.
  if (website) {
    fieldErrors.website = [messages.website];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      attempt: previousState.attempt + 1,
      status: 'error',
      code: 'VALIDATION',
      fieldErrors,
      values,
    };
  }

  const result = await contributionService.submit({
    fullName: values.fullName,
    email: values.email,
    message: values.message,
    eventSuggestion: values.eventSuggestion || undefined,
    locale,
  });

  if (result.ok) {
    redirect(localizePath(locale, '/thank-you'));
  }

  // Chuẩn hóa lỗi từ API sang thông báo đã bản địa hóa, không lộ chi tiết hệ thống.
  const apiMessage = result.message;
  const code =
    apiMessage === 'RATE_LIMIT'
      ? 'RATE_LIMIT'
      : apiMessage === 'NETWORK'
        ? 'NETWORK'
        : result.status === 400
          ? 'VALIDATION'
          : 'GENERIC';

  if (result.status === 400 && Object.keys(result.fieldErrors).length > 0) {
    const mapped: Record<string, string[]> = {};

    for (const key of Object.keys(result.fieldErrors)) {
      const localized = messages[key as keyof typeof messages];
      if (localized) {
        mapped[key] = [localized];
      }
    }

    if (Object.keys(mapped).length > 0) {
      return {
        attempt: previousState.attempt + 1,
        status: 'error',
        code: 'VALIDATION',
        fieldErrors: mapped,
        values,
      };
    }
  }

  return {
    attempt: previousState.attempt + 1,
    status: 'error',
    code,
    fieldErrors: {},
    values,
  };
}
