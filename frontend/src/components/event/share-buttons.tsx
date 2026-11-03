'use client';

import { useEffect, useRef, useState } from 'react';
import { createShareLinks } from '@/utils/format';

/** Nhãn dùng cho cụm nút chia sẻ. */
export interface ShareLabels {
  share: string;
  copyLink: string;
  copied: string;
  facebook: string;
  x: string;
  /** Cụm từ cho biết liên kết mở ở tab mới; nhãn đọc màn hình nối thêm vào tên nút. */
  newTab: string;
}

/**
 * Cụm nút chia sẻ bài viết lên mạng xã hội và sao chép liên kết.
 * Liên kết ngoài luôn mở tab mới với rel an toàn.
 * @param props.url Địa chỉ tuyệt đối của bài viết.
 * @param props.title Tiêu đề bài viết.
 * @param props.labels Nhãn giao diện theo ngôn ngữ.
 */
export function ShareButtons({ url, title, labels }: { url: string; title: string; labels: ShareLabels }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const links = createShareLinks(url, title);

  // Dọn bộ hẹn giờ khi thành phần rời khỏi trang.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /**
   * Sao chép liên kết vào bộ nhớ tạm và hiện phản hồi trong giây lát.
   * @returns Promise hoàn tất khi đã thử sao chép.
   */
  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Trình duyệt từ chối quyền: người đọc vẫn có thể dùng liên kết trực tiếp.
    }
  };

  const buttonClass =
    'press inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-accent/50 hover:bg-raised';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[0.8125rem] font-medium text-muted">{labels.share}</span>

      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label={`${labels.facebook} · ${labels.newTab}`}
        title={labels.facebook}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.3c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.9h2.5v7h3Z" />
        </svg>
      </a>

      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label={`${labels.x} · ${labels.newTab}`}
        title={labels.x}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.7 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L5 21H1.8l7.4-8.5L1.4 3H8l4.5 5.6L17.7 3Zm-1.1 16h1.8L7.5 4.8H5.6L16.6 19Z" />
        </svg>
      </a>

      <button type="button" onClick={copyLink} className={buttonClass} aria-label={labels.copyLink} title={labels.copyLink}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
        </svg>
      </button>

      <span className="text-[0.8125rem] font-medium text-accent" aria-live="polite">
        {copied ? labels.copied : ''}
      </span>
    </div>
  );
}
