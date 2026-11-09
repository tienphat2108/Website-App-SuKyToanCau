'use client';

/**
 * Nút mở hộp thoại in của trình duyệt để in bài viết hiện tại.
 * Bản thân nút mang lớp .no-print để không xuất hiện trên bản in.
 * @param props.label Nhãn nút cho trình đọc màn hình và chú giải khi rê chuột.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="press no-print inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-accent/50 hover:bg-raised"
      aria-label={label}
      title={label}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M7 8V4h10v4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="8" width="16" height="9" rx="2" />
        <path d="M7 14h10v6H7z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
