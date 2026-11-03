/**
 * Sinh dữ liệu nền bản đồ tự kiểm soát từ Natural Earth (phạm vi công cộng).
 *
 * Chạy: node scripts/build-world-basemap.mjs
 *
 * Lý do có tệp này: website không còn dùng ô ảnh của bên thứ ba, nên đường bờ biển
 * và biên giới trên bộ phải là dữ liệu đóng gói trong dự án. Tệp chỉ giữ những gì
 * cần cho một tấm bản đồ thế giới gọn nhẹ:
 * - đường bờ biển lấy từ lớp 1:50.000, làm gọn 0.03 độ và bỏ các đảo diện tích nhỏ;
 * - biên giới lấy từ lớp đường biên TRÊN BỘ 1:110.000, tuyệt đối không dùng lớp
 *   biên giới trên biển vì lớp đó chứa các yêu sách chồng lấn ở Biển Đông.
 * Kết quả được viết thành hai tệp TypeScript để Leaflet vẽ trực tiếp bằng tọa độ
 * [vĩ độ, kinh độ].
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, 'src', 'data', 'geo');

/** Đường dẫn tệp nguồn dạng GeoJSON trên kho Natural Earth. */
const SOURCES = {
  land: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson',
  borders:
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_boundary_lines_land.geojson',
};

/** Sai số cho phép khi làm gọn đường bờ biển, tính bằng độ. */
const TOLERANCE = 0.06;

/** Diện tích tối thiểu (độ vuông) của một đảo để còn được giữ lại. */
const MIN_RING_AREA = 0.05;

/** Số chữ số thập phân giữ lại trong tọa độ đầu ra. */
const PRECISION = 2;

/**
 * Làm gọn đường gấp khúc bằng thuật toán Douglas-Peucker dạng lặp để không vỡ
 * ngăn xếp với những vòng bờ biển hàng nghìn điểm.
 * @param points Danh sách điểm [kinh độ, vĩ độ].
 * @param epsilon Sai số cho phép.
 * @returns Danh sách điểm đã làm gọn.
 */
function simplify(points, epsilon) {
  if (points.length < 3) return points;

  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop();
    let farthest = -1;
    let farthestDistance = 0;

    for (let i = start + 1; i < end; i += 1) {
      const distance = pointToSegment(points[i], points[start], points[end]);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthest = i;
      }
    }

    if (farthestDistance > epsilon && farthest > start) {
      keep[farthest] = true;
      stack.push([start, farthest], [farthest, end]);
    }
  }

  return points.filter((_, index) => keep[index]);
}

/**
 * Khoảng cách từ một điểm tới đoạn thẳng, coi đoạn suy biến thành một điểm.
 * @param point Điểm cần đo.
 * @param from Đầu đoạn thẳng.
 * @param to Cuối đoạn thẳng.
 * @returns Khoảng cách theo độ.
 */
function pointToSegment(point, from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];

  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - from[0], point[1] - from[1]);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point[0] - from[0]) * dx + (point[1] - from[1]) * dy) / (dx * dx + dy * dy)),
  );

  return Math.hypot(point[0] - (from[0] + t * dx), point[1] - (from[1] + t * dy));
}

/**
 * Diện tích tuyệt đối của một vòng khép kín, tính theo công thức dây giày.
 * @param ring Danh sách điểm [kinh độ, vĩ độ].
 * @returns Diện tích tính bằng độ vuông.
 */
function ringArea(ring) {
  let sum = 0;

  for (let i = 0; i < ring.length - 1; i += 1) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }

  return Math.abs(sum) / 2;
}

/**
 * Tải và phân tích một tệp GeoJSON.
 * @param url Địa chỉ tệp.
 * @returns Danh sách hình học trong tệp.
 */
async function fetchGeometries(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Không tải được ${url}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  return payload.features.map((feature) => feature.geometry);
}

/**
 * Đổi một điểm từ thứ tự [kinh độ, vĩ độ] của GeoJSON sang [vĩ độ, kinh độ] của Leaflet
 * và làm tròn ba chữ số để giảm dung lượng.
 * @param point Điểm gốc.
 * @returns Điểm đã đổi thứ tự.
 */
function toLatLng(point) {
  return [Number(point[1].toFixed(PRECISION)), Number(point[0].toFixed(PRECISION))];
}

/**
 * Tạo nội dung một tệp TypeScript chứa dữ liệu số.
 * @param name Tên hằng số xuất ra.
 * @param docLine Dòng tài liệu tiếng Việt mô tả nguồn dữ liệu.
 * @param tsType Kiểu TypeScript của dữ liệu.
 * @param value Dữ liệu sẽ được serialize.
 * @returns Chuỗi mã nguồn TypeScript.
 */
function moduleSource(name, docLine, tsType, value) {
  return `/** ${docLine} */\nexport const ${name}: ${tsType} = ${JSON.stringify(value)};\n`;
}

const landGeometries = await fetchGeometries(SOURCES.land);
/** @type {number[][][][]} Danh sách đa giác bờ biển, mỗi đa giác gồm các vòng. */
const land = [];

for (const geometry of landGeometries) {
  const polygons =
    geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];

  for (const polygon of polygons) {
    /** @type {number[][][]} */
    const rings = [];

    for (const ring of polygon) {
      const simplified = simplify(ring, TOLERANCE);

      if (simplified.length < 4 || ringArea(simplified) < MIN_RING_AREA) {
        continue;
      }

      rings.push(simplified.map(toLatLng));
    }

    if (rings.length > 0) {
      land.push(rings);
    }
  }
}

const borderGeometries = await fetchGeometries(SOURCES.borders);
/** @type {number[][][]} Danh sách các đoạn thẳng biên giới, mỗi đoạn là chuỗi điểm [vĩ độ, kinh độ]. */
const borders = [];

for (const geometry of borderGeometries) {
  const lines =
    geometry.type === 'MultiLineString' ? geometry.coordinates : [geometry.coordinates];

  for (const line of lines) {
    if (line.length >= 2) {
      borders.push(line.map(toLatLng));
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });

const landFile = join(OUT_DIR, 'world-land.ts');
const borderFile = join(OUT_DIR, 'world-borders.ts');

await writeFile(
  landFile,
  moduleSource(
    'WORLD_LAND',
    'Đường bờ biển thế giới do dự án tự nắm giữ, rút gọn từ Natural Earth 1:50.000 (phạm vi công cộng).',
    '[number, number][][][]',
    land,
  ),
  'utf8',
);
await writeFile(
  borderFile,
  moduleSource(
    'WORLD_BORDERS',
    'Biên giới trên bộ rút gọn từ Natural Earth 1:110.000 (phạm vi công cộng); không có đường biên trên biển.',
    '[number, number][][]',
    borders,
  ),
  'utf8',
);

const landPoints = land.reduce((total, polygon) => total + polygon.reduce((sum, ring) => sum + ring.length, 0), 0);
const borderPoints = borders.reduce((total, line) => total + line.length, 0);

console.log(
  JSON.stringify({
    landPolygons: land.length,
    landPoints,
    borderLines: borders.length,
    borderPoints,
    landFile,
    borderFile,
  }),
);
