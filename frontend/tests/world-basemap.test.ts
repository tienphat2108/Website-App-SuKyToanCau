import { describe, expect, it } from 'vitest';
import { COUNTRY_BY_KEY } from '@/data/countries';
import {
  COUNTRY_LABEL_POINTS,
  MARITIME_PLACES,
  placeLabelName,
  type PlaceLabel,
} from '@/data/geo/place-labels';
import { WORLD_BORDERS } from '@/data/geo/world-borders';
import { WORLD_LAND } from '@/data/geo/world-land';

/** Chữ Hán, kana, Hangul và ký tự rộng toàn phần — không tên nào của dự án được phép chứa. */
const FOREIGN_SCRIPT = /[\u2E80-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\uAC00-\uD7AF\u3040-\u30FF]/;

/** Hai quần đảo thuộc chủ quyền Việt Nam, bắt buộc giữ tên tiếng Việt ở mọi ngôn ngữ. */
const VIETNAM_ISLANDS = ['Hoàng Sa', 'Trường Sa'];

/**
 * Hộp biển trống hoàn toàn ở giữa Biển Đông (kinh độ 114–119,5; vĩ độ 12,5–15,5).
 * Mọi điểm bờ biển hoặc biên giới rơi vào hộp này đều là dấu hiệu đường yêu sách trên
 * biển lọt vào dữ liệu, vì không có đảo tự nhiên nào ở đó.
 */
const OPEN_SEA_BOX = { minLng: 114, maxLng: 119.5, minLat: 12.5, maxLat: 15.5 };

/**
 * Duyệt toàn bộ điểm của một lớp đa giác.
 * @param rings Danh sách vòng tọa độ theo [vĩ độ, kinh độ].
 * @returns Mọi điểm của lớp dưới dạng cặp số.
 */
function landPoints(rings: readonly [number, number][][][]): Array<[number, number]> {
  return rings.flatMap((polygon) => polygon.flat());
}

describe('bộ nhãn địa danh trên nền bản đồ', () => {
  it('giữ tên tiếng Việt cho Hoàng Sa và Trường Sa ở cả hai ngôn ngữ', () => {
    const islands = MARITIME_PLACES.filter((place) => place.kind === 'island');

    expect(islands.map((place) => place.vi).sort()).toEqual([...VIETNAM_ISLANDS].sort());

    for (const place of islands) {
      expect(place.keepVietnamese, place.vi).toBe(true);
      expect(placeLabelName(place, 'vi'), place.vi).toBe(place.vi);
      expect(placeLabelName(place, 'en'), place.vi).toBe(place.vi);
    }
  });

  it('đặt hai quần đảo ngay trong Biển Đông và luôn có chấm trên bản đồ', () => {
    for (const name of VIETNAM_ISLANDS) {
      const place = MARITIME_PLACES.find((item) => item.vi === name) as PlaceLabel | undefined;

      expect(place, name).toBeDefined();
      expect(place?.position[0]).toBeGreaterThan(5);
      expect(place?.position[0]).toBeLessThan(21);
      expect(place?.position[1]).toBeGreaterThan(108);
      expect(place?.position[1]).toBeLessThan(120);
      expect(place?.minZoom).toBeLessThanOrEqual(2);
    }
  });

  it('không có tên địa danh nào chứa chữ nước ngoài', () => {
    for (const place of MARITIME_PLACES) {
      expect(FOREIGN_SCRIPT.test(place.vi), place.vi).toBe(false);
      expect(FOREIGN_SCRIPT.test(place.en), place.en).toBe(false);
      expect(FOREIGN_SCRIPT.test(placeLabelName(place, 'en')), place.vi).toBe(false);
    }

    for (const key of Object.keys(COUNTRY_LABEL_POINTS)) {
      const country = COUNTRY_BY_KEY.get(key);

      expect(country, key).toBeDefined();
      expect(FOREIGN_SCRIPT.test(country?.vi ?? key), key).toBe(false);
      expect(FOREIGN_SCRIPT.test(country?.en ?? key), key).toBe(false);
    }
  });

  it('lấy tên quốc gia từ danh mục chung và không trùng vị trí', () => {
    const keys = Object.keys(COUNTRY_LABEL_POINTS);

    expect(keys.length).toBeGreaterThan(30);
    expect(new Set(keys).size).toBe(keys.length);

    const positions = keys.map((key) => COUNTRY_LABEL_POINTS[key].position.join(','));
    expect(new Set(positions).size).toBe(positions.length);

    for (const [key, entry] of Object.entries(COUNTRY_LABEL_POINTS)) {
      expect(entry.minZoom, key).toBeGreaterThanOrEqual(1);
      expect(entry.minZoom, key).toBeLessThanOrEqual(6);
      expect(entry.position[0], key).toBeGreaterThanOrEqual(-90);
      expect(entry.position[0], key).toBeLessThanOrEqual(90);
      expect(entry.position[1], key).toBeGreaterThanOrEqual(-180);
      expect(entry.position[1], key).toBeLessThanOrEqual(180);
    }
  });
});

describe('dữ liệu nền bản đồ tự kiểm soát', () => {
  it('nằm trong phạm vi tọa độ hợp lệ', () => {
    const points = [...landPoints(WORLD_LAND), ...WORLD_BORDERS.flat()];

    expect(points.length).toBeGreaterThan(1000);

    for (const [lat, lng] of points) {
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    }
  });

  it('không có đường biên giới nào chạy giữa Biển Đông', () => {
    const inside = (lat: number, lng: number) =>
      lng >= OPEN_SEA_BOX.minLng &&
      lng <= OPEN_SEA_BOX.maxLng &&
      lat >= OPEN_SEA_BOX.minLat &&
      lat <= OPEN_SEA_BOX.maxLat;

    const offenders = WORLD_BORDERS.flat().filter(([lat, lng]) => inside(lat, lng));

    expect(offenders).toEqual([]);
  });

  it('không có đất liền nào được vẽ ở vùng biển trống giữa Biển Đông', () => {
    const inside = (lat: number, lng: number) =>
      lng >= OPEN_SEA_BOX.minLng &&
      lng <= OPEN_SEA_BOX.maxLng &&
      lat >= OPEN_SEA_BOX.minLat &&
      lat <= OPEN_SEA_BOX.maxLat;

    const offenders = landPoints(WORLD_LAND).filter(([lat, lng]) => inside(lat, lng));

    expect(offenders).toEqual([]);
  });
});
