/**
 * Quét nguồn sự kiện cập nhật liên tục cho khu riêng của website.
 *
 * Chạy: node scripts/discover-events.mjs [--months=24] [--min-links=20] [--max=40] [--dry-run]
 *
 * Nguồn là Wikidata: mỗi mục sự kiện do cộng đồng Wikimedia tạo ra đều mang mốc thời
 * gian (P585) và số ngôn ngữ đã viết về nó. Lấy những mục có bài ở cả Wikipedia tiếng
 * Việt lẫn tiếng Anh và được viết bằng từ 20 ngôn ngữ trở lên, tức là sự kiện đủ lớn
 * để hai bách khoa toàn thư cùng ghi nhận. Vì Wikidata được sửa mỗi ngày, khu riêng
 * luôn nhận được sự kiện mới mà không phải chờ biên tập viên trong nước viết lại.
 *
 * Hai tệp đầu ra:
 * - shared/recent-events.json  : mục đã kiểm chứng, khu riêng đọc tệp này;
 * - .tmp/ung-vien-lich-su.json : toàn bộ ứng viên kèm lý do loại, để người biên tập đối chiếu.
 *
 * Kho 149 sự kiện đã biên tập ở shared/history-events.json chỉ được đọc để loại trùng,
 * không bị ghi đè. Tóm tắt hai ngôn ngữ là đoạn mở đầu của bài Wikipedia, kèm nguồn dẫn
 * trỏ đúng bài viết và giấy phép CC BY-SA 4.0 theo yêu cầu ghi công.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CURATED_FILE = join(ROOT, '..', 'shared', 'history-events.json');
const FEED_FILE = join(ROOT, '..', 'shared', 'recent-events.json');
const AUDIT_FILE = join(ROOT, '.tmp', 'ung-vien-lich-su.json');

const USER_AGENT = 'SuKyToanCau discover-events/1.0 (bien tap noi dung sukytoancau)';

/** Độ dài nội dung tối thiểu để coi một bài Wikipedia là bài thật, không phải trang trỏ. */
const MIN_EXCERPT_LENGTH = 200;

/** Độ dài tối đa đoạn tóm tắt ghi vào tệp phát hành. */
const MAX_SUMMARY_LENGTH = 700;

/** Những mở đầu tên bài không phải một sự kiện. */
const NON_ARTICLE_PREFIXES = [
  'Thể loại:',
  'Category:',
  'Bản mẫu:',
  'Template:',
  'Wikipedia:',
  'Portal:',
  'Cổng:',
  'Help:',
  'Trợ giúp:',
  'Danh sách',
  'List of',
];

function readFlag(name, fallback) {
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(`--${name}=`));
  return hit ? Number(hit.slice(name.length + 3)) : Number(fallback);
}

const months = Math.min(readFlag('months', 24), 120);
const minLinks = Math.min(readFlag('min-links', 20), 200);
const maxItems = Math.min(readFlag('max', 40), 120);
const dryRun = process.argv.slice(2).includes('--dry-run');

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  return JSON.parse(text);
}

const sparql = async (query, attempts = 3) => {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const data = await getJson(url);
      return data.results.bindings;
    } catch (error) {
      const message = String(error.message);
      const retryable = message.includes('HTTP 504') || message.includes('HTTP 429');
      if (attempt === attempts || !retryable) throw error;
      const hinted = message.match(/retry in (\d+) seconds/i);
      const wait = hinted ? Math.min(Number(hinted[1]) * 1000, 130000) : 4000 * attempt;
      console.log(`    Wikidata quá tải, chờ ${wait / 1000} giây rồi thử lại (lần ${attempt + 1}/${attempts}).`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  return [];
};

/** Bỏ dấu phụ và chữ hoa để đối chiếu tên bài giữa các nguồn. */
function normalize(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** URL bài Wikipedia, mã hóa từng từ để giữ đúng dấu tiếng Việt. */
const articleUrl = (host, title) => `https://${host}/wiki/${title.trim().split(/\s+/).map(encodeURIComponent).join('_')}`;

/**
 * Truy vấn một cửa sổ thời gian: sự kiện có mốc trong khoảng, đủ số ngôn ngữ,
 * có bài ở cả Wikipedia tiếng Việt lẫn tiếng Anh.
 * Chia cửa sổ ngắn vì Wikidata hay cắt các truy vấn quét cả năm.
 */
function windowQuery(fromIso, toIso) {
  return [
    'SELECT ?item ?date ?viTitle ?enTitle ?sitelinks WHERE {',
    '  ?item wdt:P585 ?date .',
    `  FILTER(?date >= "${fromIso}T00:00:00"^^xsd:dateTime && ?date <= "${toIso}T23:59:59"^^xsd:dateTime)`,
    '  ?item wikibase:sitelinks ?sitelinks .',
    `  FILTER(?sitelinks >= ${minLinks})`,
    '  ?vi schema:about ?item ; schema:isPartOf <https://vi.wikipedia.org/> ; schema:name ?viTitle .',
    '  ?en schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?enTitle .',
    '} ORDER BY DESC(?date) LIMIT 400',
  ].join('\n');
}

/**
 * Đọc đoạn mở đầu và mốc sửa đổi gần nhất của một bài Wikipedia qua REST.
 * Dùng REST thay vì action=query vì prop=extracts không cho hỏi nhiều bài cùng lúc
 * với rvlimit, còn mỗi lần gọi REST trả đủ cả đoạn lẫn dấu thời gian.
 */
async function fetchSummary(host, title) {
  const url = `https://${host}/api/rest_v1/page/summary/${title.trim().split(/\s+/).map(encodeURIComponent).join('_')}?redirect=true`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (response.status === 429) {
        if (attempt === 4) return null;
        const retryAfter = Number(response.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 30000) : 2000 * attempt;
        await new Promise((resolve) => setTimeout(resolve, wait));
        continue;
      }
      const text = await response.text();
      if (!response.ok) return null;
      const data = JSON.parse(text);
      const excerpt = String(data.extract || '').replace(/\s+/g, ' ').trim();
      if (excerpt.length < MIN_EXCERPT_LENGTH) return null;
      return { title: data.title, updated: data.timestamp ?? null, excerpt: excerpt.slice(0, MAX_SUMMARY_LENGTH) };
    } catch (error) {
      if (attempt === 4) return null;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  return null;
}

/** Chạy nhiều việc bất đồng bộ theo lô, nghỉ ngắn giữa các lô để không bị hãm tốc độ. */
async function inPool(list, worker, size = 4, gapMs = 300) {
  const out = [];
  for (let i = 0; i < list.length; i += size) {
    out.push(...(await Promise.all(list.slice(i, i + size).map(worker))));
    if (i + size < list.length && gapMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, gapMs));
    }
  }
  return out;
}

/** Đọc nhãn, mô tả và một số thuộc tính của nhiều mục Wikidata trong một lần gọi. */
async function fetchEntities(ids, props) {
  const out = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=${props}&ids=${ids.slice(i, i + 50).join('|')}`;
    const data = await getJson(url);
    for (const [id, entity] of Object.entries(data.entities ?? {})) {
      if (entity.missing !== undefined) continue;
      out.set(id, entity);
    }
  }
  return out;
}

/** Lấy QID của một thuộc tính dạng đơn giá trị. */
const entityIdOf = (entity, property) => entity?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value?.id ?? null;

/** Chuyển "Point(kinh vi)" thành tọa độ đã kiểm tra giới hạn. */
function toCoordinate(globe) {
  const match = String(globe?.value || '').match(/Point\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;
  const longitude = Number(match[1]);
  const latitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

const curated = JSON.parse(await readFile(CURATED_FILE, 'utf8'));
const curatedTitles = new Set(curated.events.map((event) => normalize(event.wikiTitle)));

const now = new Date();
const since = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
const todayIso = now.toISOString().slice(0, 10);
console.log(`Quét ${months} tháng gần nhất (${since.toISOString().slice(0, 10)} -> ${todayIso}), ngưỡng ${minLinks} ngôn ngữ.`);

const rows = [];
for (let start = new Date(since); start <= now; ) {
  const end = new Date(start.getFullYear(), start.getMonth() + 6, 0);
  const fromIso = start.toISOString().slice(0, 10);
  const toIso = (end > now ? now : end).toISOString().slice(0, 10);
  try {
    const found = await sparql(windowQuery(fromIso, toIso));
    console.log(`  ${fromIso} -> ${toIso}: ${found.length} mục`);
    rows.push(...found);
  } catch (error) {
    console.log(`  ${fromIso} -> ${toIso}: bỏ qua (${error.message})`);
  }
  start = new Date(start.getFullYear(), start.getMonth() + 6, 1);
}

const byId = new Map();
for (const row of rows) {
  const id = row.item.value.split('/').pop();
  const date = row.date.value.slice(0, 10);
  if (date < since.toISOString().slice(0, 10) || date > now.toISOString().slice(0, 10)) continue;
  if (byId.has(id)) continue;
  byId.set(id, { id, date, viTitle: row.viTitle.value, enTitle: row.enTitle.value, links: Number(row.sitelinks.value) });
}

const rejected = [];
const candidates = [];
for (const item of byId.values()) {
  const viStarts = NON_ARTICLE_PREFIXES.some((prefix) => item.viTitle.startsWith(prefix) || item.enTitle.startsWith(prefix));
  const monthPage = /^(Tháng|December|January|February|March|April|May|June|July|August|September|October|November)\s+\d{0,4}\s*(năm|of)?\s*\d{0,4}$/i.test(item.viTitle);
  const duplicate = [item.viTitle, item.enTitle].some((title) => curatedTitles.has(normalize(title)));
  if (viStarts) rejected.push({ ...item, lyDo: 'khong-phai-bai-su-kien' });
  else if (monthPage) rejected.push({ ...item, lyDo: 'trang-thang' });
  else if (duplicate) rejected.push({ ...item, lyDo: 'da-co-trong-kho-bien-tap' });
  else candidates.push(item);
}
candidates.sort((a, b) => b.date.localeCompare(a.date));
console.log(`Tổng ứng viên sạch: ${candidates.length} (giữ ${maxItems} mục mới nhất để thẩm định).`);

const pool = candidates.slice(0, maxItems);
const entities = await fetchEntities(pool.map((item) => item.id), 'labels|claims|sitelinks');

const locationIds = pool.map((item) => entityIdOf(entities.get(item.id), 'P276')).filter(Boolean);
const locations = await fetchEntities(locationIds, 'labels|claims');

const summaries = await inPool(pool, async (item) => ({
  vi: await fetchSummary('vi.wikipedia.org', item.viTitle),
  en: await fetchSummary('en.wikipedia.org', item.enTitle),
}));

const items = [];
for (const [index, item] of pool.entries()) {
  const entity = entities.get(item.id);
  const { vi, en } = summaries[index] ?? {};
  const locationEntity = entity ? locations.get(entityIdOf(entity, 'P276') ?? '') : null;
  const coordinate = toCoordinate(locationEntity?.claims?.P625?.[0]?.mainsnak?.datavalue);
  const reasons = [];
  if (!entity) reasons.push('khong-doc-duoc-wikidata');
  if (!vi?.excerpt) reasons.push('thieu-tom-tat-tieng-viet');
  if (!en?.excerpt) reasons.push('thieu-tom-tat-tieng-anh');

  if (reasons.length > 0) {
    rejected.push({ ...item, lyDo: reasons.join('+') });
    continue;
  }

  items.push({
    key: item.id,
    date: item.date,
    titleVi: vi.title,
    titleEn: en.title,
    summaryVi: vi.excerpt,
    summaryEn: en.excerpt,
    location: locationEntity?.labels?.vi?.value ?? locationEntity?.labels?.en?.value ?? null,
    latitude: coordinate?.latitude ?? null,
    longitude: coordinate?.longitude ?? null,
    languages: item.links,
    revisedAt: vi.updated,
    sources: [
      { title: vi.title, publisher: 'Wikipedia tiếng Việt', url: articleUrl('vi.wikipedia.org', vi.title), language: 'vi', license: 'CC BY-SA 4.0' },
      { title: en.title, publisher: 'Wikipedia tiếng Anh', url: articleUrl('en.wikipedia.org', en.title), language: 'en', license: 'CC BY-SA 4.0' },
      { title: entity.labels?.en?.value ?? item.id, publisher: 'Wikidata', url: `https://www.wikidata.org/wiki/${item.id}`, language: 'multilingual', license: 'CC0 1.0' },
    ],
  });
}

items.sort((a, b) => b.date.localeCompare(a.date));
const generatedAt = now.toISOString();

await mkdir(dirname(AUDIT_FILE), { recursive: true });
await writeFile(
  AUDIT_FILE,
  JSON.stringify({ sinhNgay: generatedAt, months, minLinks, maxItems, tongUngVien: byId.size, soPhatHanh: items.length, biLoai: rejected, ungVien: candidates }, null, 2) + '\n',
  'utf8',
);

const feed = {
  version: 1,
  generatedAt,
  windowMonths: months,
  source: 'Wikidata (moc P585) va Wikipedia tieng Viet, tieng Anh',
  minLinks,
  license: 'Van ban Wikipedia theo CC BY-SA 4.0, du lieu Wikidata theo CC0 1.0',
  note: 'Khu rieng suu tam tu nguon mo, khong phai bai bien tap cua sukytoancau va khong nam trong kho 149 su kien.',
  count: items.length,
  items,
};

if (dryRun) {
  console.log(`\n--dry-run: khong ghi ${FEED_FILE}. Du dieu kien phat hanh: ${items.length}.`);
} else {
  await writeFile(FEED_FILE, JSON.stringify(feed, null, 2) + '\n', 'utf8');
  console.log(`\nDa ghi ${FEED_FILE} (${items.length} muc).`);
}
console.log(`Ban doi chieu va ly do loai: ${AUDIT_FILE}\n`);

for (const item of items.slice(0, 15)) {
  console.log(`${item.date}  ${String(item.languages).padStart(3)} ngon ngu  ${item.titleVi.slice(0, 56)}`);
}
