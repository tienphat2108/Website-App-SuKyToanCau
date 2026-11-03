/**
 * Quét mã nguồn tìm khóa bí mật vô tình bị viết cứng.
 *
 * Công cụ chỉ đọc tệp văn bản trong kho mã, bỏ qua thư mục phụ thuộc và đầu ra dựng.
 * Khi phát hiện mẫu khóa đã biết, chương trình in vị trí và trả mã lỗi để chặn phát hành.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  '.next',
  '.git',
  'bin',
  'obj',
  'coverage',
  'TestResults',
  '.vs',
  'out',
  'dist',
  'public',
]);

const SCANNED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.cs',
  '.csproj',
  '.props',
  '.targets',
  '.yml',
  '.yaml',
  '.xml',
  '.config',
  '.md',
  '.ps1',
  '.cmd',
  '.sh',
  '.sql',
  '.example',
]);

const PATTERNS = [
  { name: 'Khóa riêng PEM', expression: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: 'Khóa truy cập AWS', expression: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Mã GitHub', expression: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Mã Slack', expression: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'Khóa Stripe thật', expression: /\bsk_live_[A-Za-z0-9]{16,}\b/ },
  { name: 'Khóa Google API', expression: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];

const findings = [];
let scannedFiles = 0;

/**
 * Duyệt một thư mục và quét các tệp văn bản bên trong.
 * @param {string} directory Thư mục cần duyệt.
 */
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') {
      continue;
    }

    if (SKIPPED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }

    if (entry.name.includes('.env') && entry.name !== '.env.example') {
      continue;
    }

    if (!SCANNED_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      continue;
    }

    if (statSync(absolutePath).size > 2 * 1024 * 1024) {
      continue;
    }

    scanFile(absolutePath);
  }
}

/**
 * Quét một tệp và ghi nhận các dòng khớp mẫu khóa.
 * @param {string} absolutePath Đường dẫn tuyệt đối của tệp.
 */
function scanFile(absolutePath) {
  const content = readFileSync(absolutePath, 'utf8');
  scannedFiles += 1;

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const pattern of PATTERNS) {
      if (pattern.expression.test(line)) {
        findings.push({
          file: relative(root, absolutePath),
          line: index + 1,
          name: pattern.name,
        });
      }
    }
  });
}

walk(root);

if (findings.length > 0) {
  console.error(`Phát hiện ${findings.length} dấu hiệu bí mật trong mã nguồn:`);

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} — ${finding.name}`);
  }

  process.exitCode = 1;
} else {
  console.log(`Đã quét ${scannedFiles} tệp, không phát hiện bí mật bị viết cứng.`);
}
