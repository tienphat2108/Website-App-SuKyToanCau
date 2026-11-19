/**
 * Đo hiệu năng thật của bản dựng production bằng Chrome DevTools Protocol.
 *
 * Chạy sau khi máy chủ đã sẵn sàng:
 *   npm run audit:perf
 * Đổi địa chỉ khi cần:
 *   PERF_BASE_URL=http://localhost:3001 npm run audit:perf
 *
 * Ngưỡng: LCP không quá 2,5 giây và CLS không quá 0,1 trên cả điện thoại lẫn máy tính.
 * Lệnh trả mã lỗi nếu vượt ngưỡng để dùng được trong quy trình kiểm tra trước khi đẩy.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DEBUG_PORT = Number(process.env.PERF_DEBUG_PORT ?? 9334);
const LCP_LIMIT = 2500;
const CLS_LIMIT = 0.1;
const PAGES = ['/', '/timeline'];
const VIEWPORTS = [
  { label: 'di động 375', width: 375, height: 812, deviceScaleFactor: 2, mobile: true },
  { label: 'máy tính 1440', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
];

const profile = mkdtempSync(join(tmpdir(), 'sktc-perf-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-device-scale-factor=1',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function debuggerUrl() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome chưa mở cổng, thử lại.
    }
    await sleep(250);
  }
  throw new Error('Không nối được Chrome DevTools.');
}

let ws;
try {
  ws = new WebSocket(await debuggerUrl());
} catch (error) {
  chrome.kill();
  console.error(`Không khởi động được Chrome: ${error.message}`);
  process.exit(1);
}

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
});

function send(method, params = {}) {
  const id = nextId;
  nextId += 1;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__perf = { lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perf.lcp = Math.max(window.__perf.lcp, entry.startTime);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__perf.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      window.__perf.error = String(error);
    }
  `,
});

const rows = [];
let failed = false;

for (const viewport of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  });

  for (const path of PAGES) {
    const url = `${BASE}${path}`;
    await send('Page.navigate', { url });
    await sleep(3200);

    const evaluation = await send('Runtime.evaluate', {
      expression:
        'JSON.stringify({ perf: window.__perf, ready: document.readyState, title: document.title })',
      returnByValue: true,
    });
    const payload = JSON.parse(evaluation.result.value ?? '{}');
    const perf = payload.perf ?? {};
    const lcp = Math.round(perf.lcp ?? 0);
    const cls = Number((perf.cls ?? 0).toFixed(4));
    const passed = payload.ready === 'complete' && lcp > 0 && lcp <= LCP_LIMIT && cls <= CLS_LIMIT;
    if (!passed) failed = true;

    rows.push({
      viewport: viewport.label,
      path,
      ready: payload.ready,
      lcp,
      cls,
      passed,
    });
  }
}

ws.close();
chrome.kill();

console.log('Đo hiệu năng trên', BASE);
console.log('Trang'.padEnd(12), 'Khổ'.padEnd(16), 'LCP'.padStart(8), 'CLS'.padStart(8), 'Kết quả');
for (const row of rows) {
  console.log(
    row.path.padEnd(12),
    row.viewport.padEnd(16),
    `${row.lcp}ms`.padStart(8),
    String(row.cls).padStart(8),
    row.passed ? 'đạt' : 'vượt ngưỡng',
  );
}

if (failed) {
  console.error(
    `\nCó chỉ số vượt ngưỡng: LCP ≤ ${LCP_LIMIT}ms, CLS ≤ ${CLS_LIMIT}, trang phải tải xong.`,
  );
  process.exit(1);
}

console.log(`\nTất cả chỉ số đạt ngưỡng: LCP ≤ ${LCP_LIMIT}ms, CLS ≤ ${CLS_LIMIT}.`);
