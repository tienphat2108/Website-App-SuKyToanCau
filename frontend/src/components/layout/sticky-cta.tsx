'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import { useHistoryStore } from '@/store/history.store';
import { localizePath } from '@/core/i18n/config';

/**
 * Thanh kêu gọi đóng góp cố định trên thiết bị di động.
 *
 * Chỉ xuất hiện sau khi người đọc đã cuộn một đoạn để không che nội dung đầu trang.
 * Trạng thái đóng được lưu lại để không làm phiền ở các lần truy cập sau.
 */
export function StickyCta() {
  const { locale, dictionary } = useI18n();
  const dismissed = useHistoryStore((state) => state.stickyDismissed);
  const dismiss = useHistoryStore((state) => state.dismissSticky);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Chờ trình duyệt khôi phục lựa chọn đã lưu trước khi hiển thị.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Theo dõi vị trí cuộn để hiện thanh kêu gọi sau phần nội dung đầu tiên.
  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 520);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted || dismissed || !scrolled) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-night/95 p-3 shadow-night backdrop-blur-xl">
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-accent to-accent-strong" aria-hidden="true" />
        <span className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 19.5V6a2 2 0 0 1 2-2h11.5" strokeLinecap="round" />
            <path d="M6 17h12.5a1.5 1.5 0 0 1 0 3H6a2 2 0 0 1-2-2Z" strokeLinecap="round" />
            <path d="M9 9h6M9 12h4" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.875rem] font-semibold text-white">{dictionary.stickyCta.title}</p>
          <p className="truncate text-[0.75rem] text-white/65">{dictionary.stickyCta.text}</p>
        </div>
        <Link
          href={localizePath(locale, '/contribute')}
          className="btn-gold !min-h-9 shrink-0 !px-4 !py-1.5 text-[0.8125rem]"
        >
          {dictionary.stickyCta.button}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          aria-label={dictionary.stickyCta.dismiss}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
