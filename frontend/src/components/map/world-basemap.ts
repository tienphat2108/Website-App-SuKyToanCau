'use client';

import L from 'leaflet';
import type { Locale } from '@/core/i18n/config';
import { COUNTRY_BY_KEY } from '@/data/countries';
import { COUNTRY_LABEL_POINTS, MARITIME_PLACES, placeLabelName } from '@/data/geo/place-labels';
import { WORLD_BORDERS } from '@/data/geo/world-borders';
import { WORLD_LAND } from '@/data/geo/world-land';

/** Tên lớp pane dành riêng cho nhãn, đặt trên đất liền nhưng dưới điểm đánh dấu. */
const LABEL_PANE = 'world-basemap-labels';

/**
 * Tên lớp pane cho hai nhãn quần đảo.
 * Pane này nằm trên lớp điểm đánh dấu để tên Hoàng Sa và Trường Sa không bao giờ
 * bị cụm chấm sự kiện che mất ở mức thu phóng toàn thế giới.
 */
const KEY_LABEL_PANE = 'world-basemap-key-labels';

/** Một lớp nền kèm mức thu phóng nhỏ nhất còn hiển thị. */
interface ZoomLayer {
  /** Mức thu phóng nhỏ nhất để lớp còn hiện. */
  minZoom: number;
  /** Lớp sẽ được thêm hoặc bớt khỏi bản đồ khi người đọc thu phóng. */
  layer: L.Layer;
  /** Nhãn chữ, cần giữ lại để đo kích thước khi xét mép khung nhìn. */
  label?: L.Tooltip;
}

/**
 * Kiểm tra một nhãn còn nằm trọn trong khung nhìn hay không.
 *
 * Nhãn bị mép khung cắt mất một nửa trông như bản đồ lỗi, nên những nhãn không còn
 * chỗ đứng sẽ được ẩn đi thay vì cắt xén.
 * @param map Bản đồ đang hiển thị.
 * @param element Phần tử của nhãn cần đo.
 * @returns `true` khi nhãn hiện đầy đủ trong khung.
 */
function isLabelInsideView(map: L.Map, element: HTMLElement): boolean {
  const frame = map.getContainer().getBoundingClientRect();
  const box = element.getBoundingClientRect();

  return (
    box.left >= frame.left &&
    box.right <= frame.right &&
    box.top >= frame.top &&
    box.bottom <= frame.bottom
  );
}

/**
 * Tạo một nhãn địa danh bằng DOM thuần.
 *
 * Tên địa danh được đưa vào bằng textContent, không qua chuỗi HTML, nên không có
 * đường nào để mã đánh cắp nội dung trang chạy được.
 * @param position Vị trí [vĩ độ, kinh độ] của nhãn.
 * @param text Đoạn văn bản hiển thị.
 * @param modifier Lớp CSS bổ sung để phân biệt kiểu nhãn.
 * @param pane Lớp phân tầng vẽ nhãn; mặc định là lớp nhãn thường.
 * @returns Lớp nhãn đã gắn vị trí, chờ được thêm vào bản đồ.
 */
function createPlaceLabel(
  position: [number, number],
  text: string,
  modifier: string,
  pane: string = LABEL_PANE,
): L.Tooltip {
  const node = document.createElement('span');
  node.textContent = text;

  return L.tooltip({
    permanent: true,
    direction: 'center',
    className: `map-place-label ${modifier}`,
    pane,
    interactive: false,
    opacity: 1,
  })
    .setLatLng(position)
    .setContent(node);
}

/**
 * Lưới kinh vĩ tuyến vẽ dưới đất liền.
 *
 * Vẽ trước và để đất liền phủ lên nên lưới chỉ còn hiện trên mặt biển, giúp vùng nước
 * trống không bị một màu phẳng khi nhìn cả thế giới.
 */
const GRATICULE_LINES: [number, number][][] = (() => {
  const lines: [number, number][][] = [];

  for (let longitude = -180; longitude <= 180; longitude += 20) {
    lines.push([
      [-85, longitude],
      [85, longitude],
    ]);
  }

  for (let latitude = -80; latitude <= 80; latitude += 20) {
    lines.push([
      [latitude, -180],
      [latitude, 180],
    ]);
  }

  return lines;
})();

/**
 * Vẽ nền bản đồ thế giới bằng dữ liệu của chính dự án.
 *
 * Trước đây nền lấy từ ô ảnh của bên thứ ba, nên có những chỗ bị ghi tên và đường
 * yêu sách do người khác đặt — không chấp nhận được với Hoàng Sa và Trường Sa. Từ
 * nay toàn bộ những gì nhìn thấy đều do dự án kiểm soát: đường bờ biển, biên giới
 * trên bộ và mọi nhãn tên.
 * @param map Bản đồ Leaflet vừa tạo.
 * @param locale Ngôn ngữ đang xem, dùng để chọn tên quốc gia.
 * @returns Hàm gỡ liên kết sự kiện khi thành phần bị gỡ khỏi trang.
 */
export function addWorldBasemap(map: L.Map, locale: Locale): () => void {
  if (!map.getPane(LABEL_PANE)) {
    const pane = map.createPane(LABEL_PANE);
    pane.style.zIndex = '450';
    pane.style.pointerEvents = 'none';
  }

  if (!map.getPane(KEY_LABEL_PANE)) {
    const pane = map.createPane(KEY_LABEL_PANE);
    // 640: trên lớp điểm đánh dấu (600) nhưng vẫn dưới hộp thoại chú thích (700).
    pane.style.zIndex = '640';
    pane.style.pointerEvents = 'none';
  }

  L.polyline(GRATICULE_LINES, {
    className: 'map-graticule',
    interactive: false,
  }).addTo(map);

  // Đất liền kèm nét bờ biển; màu do CSS quy định để tự đổi theo giao diện sáng tối.
  L.polygon(WORLD_LAND, {
    className: 'map-land',
    stroke: true,
    fillRule: 'evenodd',
    interactive: false,
  }).addTo(map);

  L.polyline(WORLD_BORDERS, {
    className: 'map-border',
    interactive: false,
  }).addTo(map);

  /** @type {ZoomLayer[]} */
  const layers: ZoomLayer[] = [];

  /**
   * Ghi nhận một nhãn địa danh kèm lớp của nó.
   * @param place Địa danh cần gắn nhãn.
   * @returns Không trả về giá trị.
   */
  const addLabel = (place: (typeof MARITIME_PLACES)[number]): void => {
    const label = createPlaceLabel(
      place.position,
      placeLabelName(place, locale),
      `map-place-label--${place.kind}`,
      place.keepVietnamese ? KEY_LABEL_PANE : LABEL_PANE,
    );

    layers.push({ minZoom: place.minZoom, layer: label, label });
  };

  for (const place of MARITIME_PLACES) {
    addLabel(place);

    // Quần đảo nhỏ vẫn cần một chấm trên bản đồ ngay cả khi tên chưa tới mức hiện.
    if (place.kind === 'island') {
      layers.push({
        minZoom: 1,
        layer: L.circleMarker(place.position, {
          pane: LABEL_PANE,
          className: 'map-island-dot',
          radius: 3,
          interactive: false,
        }),
      });
    }
  }

  for (const [key, entry] of Object.entries(COUNTRY_LABEL_POINTS)) {
    const country = COUNTRY_BY_KEY.get(key);

    if (!country) {
      continue;
    }

    const label = createPlaceLabel(
      entry.position,
      locale === 'en' ? country.en : country.vi,
      'map-place-label--country',
    );

    layers.push({ minZoom: entry.minZoom, layer: label, label });
  }

  /**
   * Ẩn hoặc hiện từng lớp theo mức thu phóng và chỗ trống còn lại trong khung nhìn.
   *
   * Phần đo kích thước được gom riêng sau phần thêm lớp để trình duyệt không phải
   * tính lại bố cục nhiều lần trong một lượt.
   * @returns Không trả về giá trị.
   */
  const applyZoom = (): void => {
    const zoom = map.getZoom();

    for (const item of layers) {
      const visible = item.minZoom <= zoom;

      if (visible && !map.hasLayer(item.layer)) {
        map.addLayer(item.layer);
      } else if (!visible && map.hasLayer(item.layer)) {
        map.removeLayer(item.layer);
      }
    }

    const fits: boolean[] = [];

    for (const item of layers) {
      const element = item.label?.getElement();
      fits.push(element ? isLabelInsideView(map, element) : true);
    }

    layers.forEach((item, index) => {
      const element = item.label?.getElement();

      if (element) {
        // Dùng visibility thay vì ẩn hẳn để lần đo sau vẫn lấy được kích thước nhãn.
        element.style.visibility = fits[index] ? '' : 'hidden';
      }
    });
  };

  // 'resize' cần nghe riêng vì khung bản đồ đổi kích thước mà không kéo hay thu phóng
  // (thành phần vừa hiện ra sau khi ẩn) sẽ để lại toàn bộ nhãn ở trạng thái ẩn.
  map.on('zoomend moveend resize', applyZoom);
  applyZoom();

  return () => {
    map.off('zoomend moveend resize', applyZoom);
  };
}
