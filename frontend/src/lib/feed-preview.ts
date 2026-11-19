/** Số mục tối đa vẽ trên trang xem nguồn cấp để trang nhẹ. */
const PREVIEW_LIMIT = 30;

/** Một mục hiển thị trên trang xem nguồn cấp. */
export interface FeedPreviewItem {
  title: string;
  href: string;
  summary: string;
  date?: string;
}

/** Nội dung cần để dựng trang xem nguồn cấp. */
export interface FeedPreviewOptions {
  title: string;
  description: string;
  feedPath: string;
  /** Gốc địa chỉ người đọc đang mở, dùng để hiện đúng địa chỉ nguồn cấp. */
  baseUrl: string;
  backHref: string;
  backLabel: string;
  items: FeedPreviewItem[];
}

/**
 * Nhận biết trình duyệt đang mở nguồn cấp để trả trang đọc được thay vì XML thô.
 * Trình đọc tin không gửi `Sec-Fetch-Mode` và thường chỉ xin RSS/XML.
 * @param request Yêu cầu tới tuyến nguồn cấp.
 * @returns `true` khi nên trả trang HTML cho người đọc.
 */
export function isBrowserFeedRequest(request?: Request): boolean {
  if (!request) {
    return false;
  }

  const url = new URL(request.url);

  if (url.searchParams.get('format') === 'xml') {
    return false;
  }

  const mode = request.headers.get('sec-fetch-mode');

  if (mode) {
    return mode === 'navigate';
  }

  return (request.headers.get('accept') ?? '').includes('text/html');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/**
 * Dựng trang HTML giúp người đọc xem nguồn cấp và biết cách đăng ký.
 * Không tải mã ngoài, không đặt cookie; trình đọc tin vẫn nhận XML như cũ.
 * @param options Tiêu đề, mô tả, địa chỉ nguồn cấp và các mục mới nhất.
 * @returns Tài liệu HTML hoàn chỉnh.
 */
export function renderFeedPreview(options: FeedPreviewOptions): string {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const feedUrl = `${baseUrl}${options.feedPath}`;
  const items = options.items.slice(0, PREVIEW_LIMIT);
  const remaining = Math.max(options.items.length - items.length, 0);

  const itemsHtml = items
    .map((item) => {
      const date = formatDate(item.date);

      return [
        '<li class="entry">',
        date ? `<time datetime="${escapeHtml(item.date ?? '')}">${date}</time>` : '',
        `<h3><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h3>`,
        `<p>${escapeHtml(item.summary)}</p>`,
        '</li>',
      ].join('');
    })
    .join('');

  const remainingHtml = remaining
    ? `<p class="more">Còn ${remaining} mục nữa trong nguồn cấp đầy đủ.</p>`
    : '';

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(options.title)}</title>
<link rel="alternate" type="application/rss+xml" href="${escapeHtml(feedUrl)}">
<style>
:root{color-scheme:light;--bg:#f7f3ea;--surface:#fffcf6;--ink:#141d27;--muted:#4c5968;--line:#e1d8c9;--accent:#a32e2e;--gold:#ad843f}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#0d131a;--surface:#141c26;--ink:#f2ece2;--muted:#aeb9c6;--line:#283543;--accent:#e36f62;--gold:#d8b36a}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 "Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}
a{color:var(--accent);text-underline-offset:.18em}
header{border-bottom:1px solid var(--line);background:var(--surface)}
.bar{max-width:46rem;margin:0 auto;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.brand{font-size:1.15rem;font-weight:700;color:var(--ink);text-decoration:none;letter-spacing:-.01em}
.tag{font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
main{max-width:46rem;margin:0 auto;padding:2.5rem 1.25rem 4rem}
.eyebrow{margin:0;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{margin:.55rem 0 0;font-size:clamp(1.8rem,5vw,2.6rem);font-weight:700;line-height:1.15;letter-spacing:-.025em}
.lede{margin:.9rem 0 0;color:var(--muted);font-size:1.05rem}
.subscribe{margin:2rem 0 0;padding:1.25rem;border:1px solid var(--line);border-radius:1rem;background:var(--surface)}
.subscribe h2{margin:0;font-size:.95rem;letter-spacing:.02em}
code{display:block;margin:.7rem 0 0;padding:.7rem .85rem;border-radius:.6rem;background:var(--bg);border:1px solid var(--line);font:0.9rem/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}
.subscribe p{margin:.8rem 0 0;color:var(--muted);font-size:.95rem}
.en{margin:.45rem 0 0;color:var(--muted);font-size:.85rem}
.list-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin:2.5rem 0 0;border-bottom:1px solid var(--line);padding-bottom:.6rem}
.list-head h2{margin:0;font-size:1.35rem;font-weight:700;letter-spacing:-.015em}
.list-head span{font-size:.8rem;color:var(--muted)}
ol{list-style:none;margin:0;padding:0}
.entry{padding:1.15rem 0;border-bottom:1px solid var(--line)}
.entry time{font-size:.78rem;font-weight:700;letter-spacing:.06em;color:var(--gold)}
.entry h3{margin:.2rem 0 0;font-size:1.05rem;line-height:1.4}
.entry h3 a{color:var(--ink);text-decoration:none}
.entry h3 a:hover{color:var(--accent);text-decoration:underline}
.entry p{margin:.35rem 0 0;color:var(--muted);font-size:.93rem}
.more{margin:1rem 0 0;color:var(--muted);font-size:.9rem}
footer{margin-top:2.5rem;display:flex;flex-wrap:wrap;gap:1rem;font-size:.9rem}
footer a{color:var(--muted)}
@media (max-width:420px){main{padding-top:1.75rem}.subscribe{padding:1rem}}
</style>
</head>
<body>
<header><div class="bar"><a class="brand" href="/">Sử Ký Toàn Cầu</a><span class="tag">RSS</span></div></header>
<main>
<p class="eyebrow">Nguồn cấp RSS</p>
<h1>${escapeHtml(options.title)}</h1>
<p class="lede">${escapeHtml(options.description)}</p>
<section class="subscribe">
<h2>Địa chỉ nguồn cấp</h2>
<code>${escapeHtml(feedUrl)}</code>
<p>Dán địa chỉ này vào trình đọc tin như Feedly, Inoreader hoặc NetNewsWire. Trình duyệt mở trang này để dễ đọc; trình đọc tin vẫn nhận đúng định dạng RSS.</p>
<p class="en">This is the reader-friendly view of the RSS feed. Add the address above to your feed reader.</p>
</section>
<div class="list-head"><h2>Mục mới nhất</h2><span>${items.length} mục${remaining ? ` / ${options.items.length}` : ''}</span></div>
<ol>${itemsHtml}</ol>
${remainingHtml}
<footer><a href="${escapeHtml(options.backHref)}">${escapeHtml(options.backLabel)}</a><a href="/">Trang chủ</a><a href="${escapeHtml(feedUrl)}?format=xml">XML gốc</a></footer>
</main>
</body>
</html>`;
}
