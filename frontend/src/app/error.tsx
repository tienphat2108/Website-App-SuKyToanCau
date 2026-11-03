'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizePath } from '@/core/i18n/config';

/**
 * Khung báo lỗi khi một trang không tải được.
 * Không hiển thị chi tiết kỹ thuật cho người đọc; lỗi gốc được ghi ở console
 * bởi Next.js trong môi trường phát triển. Mã tra cứu chỉ hiện khi có để hỗ trợ đối chiếu.
 * @param props.error Lỗi do Next.js cung cấp.
 * @param props.reset Hàm thử dựng lại đoạn giao diện bị lỗi.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, dictionary } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[24rem] w-[24rem] rounded-full bg-gold/12 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden="true" />

      <div className="container-page relative py-16 sm:py-24">
        <div className="card relative mx-auto max-w-2xl overflow-hidden p-6 text-center sm:p-10">
          <span
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            aria-hidden="true"
          />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 8v5M12 17h.01" strokeLinecap="round" />
              <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="mt-6 font-display text-[2rem] font-bold leading-tight text-ink sm:text-4xl">
            {dictionary.common.error}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            {dictionary.errors.loadContent}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-primary">
              {dictionary.common.retry}
            </button>
            <Link href={localizePath(locale, '/')} className="btn-secondary">
              {dictionary.common.home}
            </Link>
          </div>

          {error.digest ? (
            <p className="mt-7 inline-flex rounded-full border border-line bg-raised/60 px-3 py-1 font-mono text-[0.75rem] text-muted">
              {error.digest}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
