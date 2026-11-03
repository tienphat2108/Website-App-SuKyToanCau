'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { localizePath } from '@/core/i18n/config';

/** Khóa lưu quyết định đồng ý phân tích. */
const CONSENT_KEY = 'wh-analytics-consent';

/** Giá trị quyết định đã lưu. */
type ConsentValue = 'granted' | 'denied';

/** Mã đo lường Google Analytics, chỉ tải khi cấu hình và người đọc đồng ý. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

/**
 * Kiểm tra mã đo lường có đúng định dạng công khai hay không.
 * Việc kiểm tra tránh chèn chuỗi lạ vào mã khởi tạo phân tích.
 * @param value Giá trị cần kiểm tra.
 * @returns Đúng nếu mã có dạng G-XXXXXXX.
 */
function isValidMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]{4,20}$/i.test(value);
}

/**
 * Quản lý sự đồng ý phân tích và nạp Google Analytics sau khi được chấp thuận.
 *
 * Mặc định không tải bất kỳ mã theo dõi nào. Lựa chọn được lưu trong bộ nhớ cục bộ
 * để không hỏi lại ở lần truy cập sau, nhưng vẫn có thể xóa qua cài đặt trình duyệt.
 */
export function ConsentManager() {
  const { locale, dictionary } = useI18n();
  const [decision, setDecision] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved === 'granted' || saved === 'denied') {
        setDecision(saved);
      }
    } catch {
      // Không đọc được bộ nhớ cục bộ: coi như chưa quyết định.
    }

    setReady(true);
  }, []);

  /**
   * Ghi nhận lựa chọn của người đọc.
   * @param value Đồng ý hoặc từ chối phân tích.
   */
  const choose = (value: ConsentValue): void => {
    setDecision(value);

    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Vẫn áp dụng lựa chọn trong phiên hiện tại.
    }
  };

  const analyticsEnabled = decision === 'granted' && isValidMeasurementId(GA_ID);

  return (
    <>
      {analyticsEnabled ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {ready && decision === null ? (
        <div
          className="fixed inset-x-3 bottom-[5.5rem] z-50 mx-auto max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-card sm:inset-x-4 md:bottom-6"
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              <div className="min-w-0">
                <h2 id="consent-title" className="font-display text-[1.0625rem] font-semibold leading-snug text-ink">
                  {dictionary.consent.title}
                </h2>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">{dictionary.consent.text}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => choose('granted')}
                className="btn-primary !min-h-10 flex-1 !px-4 !py-2 text-sm"
              >
                {dictionary.consent.accept}
              </button>
              <button
                type="button"
                onClick={() => choose('denied')}
                className="btn-secondary !min-h-10 flex-1 !px-4 !py-2 text-sm"
              >
                {dictionary.consent.decline}
              </button>
            </div>

            <Link
              href={localizePath(locale, '/privacy')}
              className="mt-2.5 inline-block text-[0.8125rem] font-medium text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
            >
              {dictionary.consent.privacy}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
