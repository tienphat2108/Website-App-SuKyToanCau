'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { submitContribution } from '@/app/contribute/actions';
import {
  initialContributionState,
  type ContributionFormState,
} from '@/core/models/Contribution';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizePath } from '@/core/i18n/config';
import { cn } from '@/utils/format';

/**
 * Hiển thị lỗi của một trường nếu có.
 * @param props.messages Danh sách thông báo lỗi.
 * @param props.id Mã của vùng thông báo để liên kết với aria-describedby.
 */
function FieldError({ messages, id }: { messages?: string[]; id: string }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p id={id} className="mt-1.5 text-[0.8125rem] font-medium text-accent">
      {messages.join(' ')}
    </p>
  );
}

/**
 * Dấu bắt buộc của một trường.
 *
 * Hoa thị chỉ mang tính hình thức nên được ẩn khỏi cây trợ năng; thuộc tính
 * `required` trên input đã khiến trình đọc màn hình tự thông báo "bắt buộc".
 */
function RequiredMark() {
  return (
    <span className="text-accent" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

/**
 * Tiêu đề một nhóm trường trong biểu mẫu.
 * @param props.index Số thứ tự hiển thị.
 * @param props.title Tên nhóm trường.
 * @param props.hint Gợi ý ngắn giúp người gửi điền đúng thông tin.
 */
function FormSectionHeading({ index, title, hint }: { index: string; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-[0.66rem] font-bold text-gold">
        {index}
      </span>
      <div>
        <h2 className="font-display text-lg font-semibold leading-snug text-ink">{title}</h2>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{hint}</p>
      </div>
    </div>
  );
}

/**
 * Biểu mẫu gửi tư liệu.
 *
 * Biểu mẫu dùng hành động máy chủ của Next.js để dữ liệu không phải đi qua một
 * điểm cuối công khai riêng. Khi có lỗi, nội dung đã nhập được giữ lại nhờ trạng
 * thái trả về; khi thành công, người đọc được chuyển tới trang cảm ơn.
 */
export function ContributionForm() {
  const { locale, dictionary } = useI18n();
  const [state, formAction, isPending] = useActionState<ContributionFormState, FormData>(
    submitContribution,
    initialContributionState,
  );

  const errorMessage =
    state.status !== 'error'
      ? null
      : state.code === 'RATE_LIMIT'
        ? dictionary.contribute.errorRateLimit
        : state.code === 'NETWORK'
          ? dictionary.errors.network
          : state.code === 'VALIDATION'
            ? dictionary.contribute.errorValidation
            : dictionary.contribute.errorGeneric;

  const alertRef = useRef<HTMLDivElement>(null);

  // Đưa con trỏ về khối lỗi sau mỗi lần gửi thất bại; nếu không, người dùng
  // bàn phím và trình đọc màn hình bị bỏ lại tại nút Gửi đã mất tác dụng.
  useEffect(() => {
    if (errorMessage) {
      alertRef.current?.focus();
    }
  }, [errorMessage, state.attempt]);

  const failedFields = [
    { label: dictionary.contribute.nameLabel, messages: state.fieldErrors.fullName },
    { label: dictionary.contribute.emailLabel, messages: state.fieldErrors.email },
    { label: dictionary.contribute.suggestionLabel, messages: state.fieldErrors.eventSuggestion },
    { label: dictionary.contribute.messageLabel, messages: state.fieldErrors.message },
    { label: dictionary.contribute.consentLabel, messages: state.fieldErrors.consent },
  ].filter((field) => field.messages?.length);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      {/* Bong bóng trình duyệt bị tắt: Chrome tiếng Việt hiển thị lỗi độ dài
          thiếu khoảng trắng, còn giới hạn vẫn kiểm ở máy chủ. */}
      <form
        action={formAction}
        className="card relative overflow-hidden p-6 sm:p-8"
        noValidate
      >
        <span
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          aria-hidden="true"
        />

        {errorMessage ? (
          <div
            ref={alertRef}
            role="group"
            aria-labelledby="contribution-error-title"
            tabIndex={-1}
            className="mb-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <p id="contribution-error-title" className="flex items-start gap-2 font-semibold">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              >
                <path d="M12 3l9 16H3l9-16Z" strokeLinejoin="round" />
                <path d="M12 10v4M12 16.6v.4" strokeLinecap="round" />
              </svg>
              {errorMessage}
            </p>

            {failedFields.length ? (
              <div className="mt-2">
                <p className="font-semibold">{dictionary.contribute.errorFieldsTitle}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {failedFields.map((field) => (
                    <li key={field.label} className="font-normal">
                      <span className="font-semibold">{field.label}:</span> {field.messages?.join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <FormSectionHeading
          index="01"
          title={dictionary.contribute.formContactTitle}
          hint={dictionary.contribute.formContactHint}
        />

        <p className="mt-3 text-[0.8125rem] text-muted">
          <span className="font-semibold text-accent" aria-hidden="true">
            *
          </span>{' '}
          {dictionary.contribute.requiredLegend}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="field-label">
              {dictionary.contribute.nameLabel}
              <RequiredMark />
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              defaultValue={state.values.fullName}
              placeholder={dictionary.contribute.namePlaceholder}
              className={cn('field', state.fieldErrors.fullName && 'border-accent')}
              aria-invalid={Boolean(state.fieldErrors.fullName)}
              aria-describedby={state.fieldErrors.fullName ? 'fullName-error' : undefined}
            />
            <FieldError messages={state.fieldErrors.fullName} id="fullName-error" />
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              {dictionary.contribute.emailLabel}
              <RequiredMark />
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              defaultValue={state.values.email}
              placeholder={dictionary.contribute.emailPlaceholder}
              className={cn('field', state.fieldErrors.email && 'border-accent')}
              aria-invalid={Boolean(state.fieldErrors.email)}
              aria-describedby={state.fieldErrors.email ? 'email-hint email-error' : 'email-hint'}
            />
            <p id="email-hint" className="mt-1.5 text-[0.8125rem] text-muted">
              {dictionary.contribute.emailHint}
            </p>
            <FieldError messages={state.fieldErrors.email} id="email-error" />
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-7">
          <FormSectionHeading
            index="02"
            title={dictionary.contribute.formContentTitle}
            hint={dictionary.contribute.formContentHint}
          />

          <div className="mt-6">
            <label htmlFor="eventSuggestion" className="field-label">
              {dictionary.contribute.suggestionLabel}
              <span className="ml-2 text-[0.8125rem] font-normal text-muted">
                {dictionary.contribute.optional}
              </span>
            </label>
            <input
              id="eventSuggestion"
              name="eventSuggestion"
              type="text"
              maxLength={200}
              defaultValue={state.values.eventSuggestion}
              placeholder={dictionary.contribute.suggestionPlaceholder}
              className={cn('field', state.fieldErrors.eventSuggestion && 'border-accent')}
              aria-invalid={Boolean(state.fieldErrors.eventSuggestion)}
              aria-describedby={state.fieldErrors.eventSuggestion ? 'eventSuggestion-error' : undefined}
            />
            <FieldError messages={state.fieldErrors.eventSuggestion} id="eventSuggestion-error" />
          </div>

          <div className="mt-5">
            <label htmlFor="message" className="field-label">
              {dictionary.contribute.messageLabel}
              <RequiredMark />
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={20}
              maxLength={5000}
              rows={8}
              defaultValue={state.values.message}
              placeholder={dictionary.contribute.messagePlaceholder}
              className={cn('field resize-y', state.fieldErrors.message && 'border-accent')}
              aria-invalid={Boolean(state.fieldErrors.message)}
              aria-describedby={state.fieldErrors.message ? 'message-error' : undefined}
            />
            <FieldError messages={state.fieldErrors.message} id="message-error" />
          </div>
        </div>

        {/* Bẫy chống tự động gửi: người dùng thật không nhìn thấy và không thể chạm tới. */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">{dictionary.contribute.honeypotLabel}</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Đồng ý xử lý dữ liệu là một hành động riêng: không tích sẵn, không gộp
            vào điều khoản khác, và được kiểm lại ở máy chủ thay vì chỉ ở trình duyệt. */}
        <div className="mt-6">
          <label
            htmlFor="consent"
            className="flex cursor-pointer items-start gap-3 text-[0.875rem] leading-relaxed text-ink"
          >
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              defaultChecked={state.values.consent}
              className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded border-line accent-accent"
              aria-invalid={Boolean(state.fieldErrors.consent)}
              aria-describedby={state.fieldErrors.consent ? 'consent-error' : undefined}
            />
            <span>
              {dictionary.contribute.consentText}{' '}
              <Link
                href={localizePath(locale, '/privacy')}
                className="font-semibold text-accent underline decoration-line underline-offset-2"
              >
                {dictionary.contribute.consentLink}
              </Link>
            </span>
          </label>
          <FieldError messages={state.fieldErrors.consent} id="consent-error" />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm text-[0.8125rem] leading-relaxed text-muted">
            <p>{dictionary.contribute.privacy}</p>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary shrink-0 disabled:opacity-60">
            {isPending ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                {dictionary.contribute.submitting}
              </>
            ) : (
              <>
                {dictionary.contribute.submit}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      <aside className="space-y-5">
        <div className="card relative overflow-hidden p-6">
          <span
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            aria-hidden="true"
          />

          <h2 className="font-display text-lg font-semibold text-ink">{dictionary.contribute.guidelinesTitle}</h2>
          <span className="mt-3 block h-px w-10 bg-gold/60" aria-hidden="true" />

          <ul className="mt-4 space-y-4">
            {[dictionary.contribute.guideline1, dictionary.contribute.guideline2, dictionary.contribute.guideline3].map(
              (text, index) => (
                <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-[0.6rem] font-bold text-gold">
                    0{index + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gold/[0.07] p-6">
          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-accent/70" aria-hidden="true" />
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3Z" strokeLinejoin="round" />
                <path d="M9.5 12.2l1.9 1.9 3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <div>
              <h2 className="font-display text-base font-semibold text-ink">{dictionary.nav.privacy}</h2>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{dictionary.contribute.emailHint}</p>
              <Link
                href={localizePath(locale, '/privacy')}
                className="mt-3 inline-flex text-[0.8125rem] font-semibold text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
              >
                {dictionary.meta.privacy.title}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
