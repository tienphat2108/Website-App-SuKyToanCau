'use client';

import { useEffect, useRef, useState } from 'react';
import L, { type LeafletKeyboardEvent, type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/utils/format';
import { addWorldBasemap } from './world-basemap';

/** Một điểm cần hiển thị trên bản đồ. */
export interface MapMarker {
  /** Khóa sự kiện. */
  slug: string;
  /** Tiêu đề hiển thị trong bong bóng. */
  title: string;
  /** Dòng mô tả ngắn, thường là thời gian và thời kỳ. */
  subtitle: string;
  /** Đường dẫn tới bài viết. */
  href: string;
  /** Vĩ độ. */
  latitude: number;
  /** Kinh độ. */
  longitude: number;
  /** Năm bắt đầu, dùng cho thanh trượt thời gian; bỏ trống nghĩa là luôn hiển thị. */
  year?: number;
}

/** Nhãn dùng trong bản đồ. */
export interface MapLabels {
  /** Nhãn trợ năng của vùng bản đồ. */
  ariaLabel: string;
  /** Nhãn liên kết mở bài viết. */
  readMore: string;
  /** Dòng ghi nguồn dữ liệu bản đồ. */
  attribution: string;
  /** Nhãn liên kết mở vùng đang xem bằng Google Maps. */
  openGoogle: string;
  /** Nhãn một cụm điểm, có chỗ {count} để thay bằng số sự kiện trong cụm. */
  cluster: string;
  /** Nhãn nút phóng to của Leaflet; mặc định của thư viện là tiếng Anh. */
  zoomIn: string;
  /** Nhãn nút thu nhỏ của Leaflet; mặc định của thư viện là tiếng Anh. */
  zoomOut: string;
  /** Nhãn nút đóng bong bóng của Leaflet; mặc định của thư viện là tiếng Anh. */
  closePopup: string;
  /** Cụm từ cho biết liên kết mở ở tab mới, dùng cho liên kết ngoài trong bản đồ. */
  externalLink: string;
}

/**
 * Cạnh ô lưới dùng để gom điểm, tính theo điểm ảnh thế giới ở mức thu phóng hiện thời.
 * Ô phải rộng hơn đường kính cụm lớn nhất để hai cụm cạnh nhau không đè lên nhau.
 */
const CLUSTER_CELL_PX = 54;

/** Từ mức thu phóng này trở lên, mỗi sự kiện được vẽ thành một điểm riêng có số thứ tự. */
const SPREAD_ZOOM = 4;

/**
 * Địa chỉ mở đúng vùng bản đồ đang xem trên Google Maps.
 *
 * Dùng mẫu liên kết công khai, không cần khóa và không truyền dữ liệu nào khác
 * ngoài tọa độ tâm đã làm tròn, nên trình duyệt chỉ kết nối tới Google khi
 * người đọc bấm vào liên kết.
 * @param map Bản đồ đang hiển thị.
 * @returns Địa chỉ tuyệt đối tới Google Maps.
 */
function googleMapsHref(map: LeafletMap): string {
  const { lat, lng } = map.getCenter();
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(5)},${lng.toFixed(5)}`;
}

/**
 * Nội dung bong bóng của một sự kiện.
 * @param marker Sự kiện cần hiển thị.
 * @param labels Nhãn giao diện đang dùng.
 * @returns Nút DOM chưa gắn vào trang.
 */
function buildPopup(marker: MapMarker, labels: MapLabels): HTMLElement {
  const popup = document.createElement('div');
  popup.className = 'map-popup';

  const title = document.createElement('p');
  title.className = 'map-popup__title';
  title.textContent = marker.title;

  const subtitle = document.createElement('p');
  subtitle.className = 'map-popup__meta';
  subtitle.textContent = marker.subtitle;

  const link = document.createElement('a');
  link.className = 'map-popup__link';
  link.href = marker.href;
  link.textContent = labels.readMore;

  popup.append(title, subtitle, link);

  return popup;
}

/**
 * Mức thu phóng gần nhất khiến một nhóm điểm tách thành ít nhất hai cụm riêng.
 *
 * Bấm vào cụm sẽ nhảy đúng tới mức đó thay vì phóng từng bậc một, đỡ phải bấm nhiều lần.
 * @param map Bản đồ đang hiển thị.
 * @param positions Các vị trí đang nằm chung một ô lưới.
 * @param zoom Mức thu phóng hiện thời.
 * @returns Mức thu phóng nên dùng, hoặc mức tối đa nếu nhóm không bao giờ tách.
 */
function splitZoom(map: LeafletMap, positions: L.LatLng[], zoom: number): number {
  const maxZoom = map.getMaxZoom();

  for (let candidate = zoom + 1; candidate <= maxZoom; candidate += 1) {
    const cells = new Set(
      positions.map((position) => {
        const point = map.project(position, candidate);
        return `${Math.round(point.x / CLUSTER_CELL_PX)}:${Math.round(point.y / CLUSTER_CELL_PX)}`;
      }),
    );

    if (cells.size > 1) {
      return candidate;
    }
  }

  return maxZoom;
}

/**
 * Bản đồ tương tác hiển thị vị trí các sự kiện lịch sử.
 *
 * Thành phần chỉ chạy ở trình duyệt vì Leaflet cần DOM. Nội dung bong bóng được
 * tạo bằng DOM API và textContent thay vì chuỗi HTML để tránh chèn mã độc.
 * @param props.markers Các điểm cần hiển thị.
 * @param props.labels Nhãn giao diện.
 * @param props.center Tâm bản đồ khi có một điểm.
 * @param props.zoom Mức thu phóng.
 * @param props.className Lớp bổ sung cho khung bản đồ.
 * @param props.yearCeiling Năm chặn trên của thanh trượt thời gian; null là không lọc.
 */
export function HistoricalMap({
  markers,
  labels,
  center,
  zoom = 5,
  className,
  yearCeiling,
}: {
  markers: MapMarker[];
  labels: MapLabels;
  center?: [number, number];
  zoom?: number;
  className?: string;
  yearCeiling?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();
  // Địa chỉ mở đúng vùng đang nhìn; chưa có địa chỉ khi bản đồ còn chưa dựng xong.
  const [googleHref, setGoogleHref] = useState<string | null>(null);

  // Thanh trượt chỉ thay đổi mức lọc chứ không dựng lại bản đồ: giá trị chặn nằm trong
  // ref, còn hàm vẽ lại được giữ trong ref để hiệu ứng thanh trượt luôn gọi đúng bản vẽ mới nhất.
  const yearCeilingRef = useRef<number | null>(yearCeiling ?? null);
  const renderMarkersRef = useRef<() => void>(() => {});

  useEffect(() => {
    yearCeilingRef.current = yearCeiling ?? null;
    renderMarkersRef.current();
  }, [yearCeiling]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = L.map(container, {
      scrollWheelZoom: false,
      // Mức nhỏ nhất giữ cả thế giới rộng đủ để đọc tên biển, đảo trên màn hình điện thoại;
      // mức lớn nhất dừng ở 8 vì dữ liệu bờ biển đã rút gọn, vẽ to hơn chỉ thành răng cưa.
      minZoom: 1,
      maxZoom: 8,
      // Giới hạn đúng phạm vi thế giới để kéo hết cỡ vẫn không lộ nền trống ngoài khung.
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
      maxBoundsViscosity: 1,
      zoomControl: false,
    });

    // Cụm nút thu phóng đặt góc trên bên trái để không lấn dòng ghi nguồn dưới góc phải.
    // Leaflet để nhãn hai nút bằng tiếng Anh nếu không truyền vào, nên gắn nhãn có sẵn.
    L.control.zoom({
      position: 'topleft',
      zoomInTitle: labels.zoomIn,
      zoomOutTitle: labels.zoomOut,
    }).addTo(map);

    // Nút đóng bong bóng mang nhãn tiếng Anh cố định trong Leaflet nên gắn lại sau mỗi lần mở.
    map.on('popupopen', (event) => {
      event.popup
        .getElement()
        ?.querySelector('.leaflet-popup-close-button')
        ?.setAttribute('aria-label', labels.closePopup);
    });

    // Nền bản đồ do dự án tự vẽ: không gọi máy chủ ảnh nào của bên thứ ba.
    const removeBasemap = addWorldBasemap(map, locale);
    map.attributionControl.setPrefix(
      `<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet<span class="sr-only"> · ${labels.externalLink}</span></a>`,
    );
    map.attributionControl.addAttribution(labels.attribution);

    const points = markers.map((marker) => L.latLng(marker.latitude, marker.longitude));

    if (markers.length === 1 && points[0]) {
      map.setView(points[0], zoom);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: zoom + 1 });
    } else if (center) {
      map.setView(center, zoom);
    } else {
      map.setView([16.2, 107.8], 4);
    }

    // Điểm đã tạo được giữ lại để dùng tiếp khi thu phóng, nhờ vậy bong bóng đang mở
    // không bị đóng mỗi lần vẽ lại.
    const markerLayer = L.layerGroup().addTo(map);
    const markerCache = new Map<string, L.Marker>();

    /**
     * Lấy điểm của một sự kiện, tạo mới nếu chưa từng vẽ.
     * @param marker Sự kiện cần vẽ.
     * @param index Số thứ tự trong danh sách đang lọc.
     * @returns Điểm đánh dấu đã gắn nội dung bong bóng.
     */
    const singleMarker = (marker: MapMarker, index: number): L.Marker => {
      const cached = markerCache.get(marker.slug);

      if (cached) {
        return cached;
      }

      const icon = L.divIcon({
        className: 'map-marker-host',
        html: `<span class="map-marker"><span class="map-marker__num">${index + 1}</span></span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -13],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon,
        title: marker.title,
        alt: marker.title,
        riseOnHover: true,
      });

      // Leaflet bỏ qua thuộc tính alt của divIcon, nên gắn nhãn trực tiếp lên phần tử
      // mỗi lần điểm được vẽ lại.
      leafletMarker.on('add', () => {
        leafletMarker.getElement()?.setAttribute('aria-label', marker.title);
      });

      // Leaflet đo nội dung bong bóng nên cần chặn sẵn bề rộng, nếu không tiêu đề
      // dài sẽ bị dồn thành một cột chữ rất hẹp.
      leafletMarker.bindPopup(buildPopup(marker, labels), { minWidth: 210, maxWidth: 280 });
      markerCache.set(marker.slug, leafletMarker);

      return leafletMarker;
    };

    /**
     * Vẽ lại cụm điểm theo mức thu phóng hiện thời.
     * @returns Không trả về giá trị.
     */
    const renderMarkers = (): void => {
      const currentZoom = map.getZoom();
      const ceiling = yearCeilingRef.current;
      // Sự kiện không có năm luôn hiển thị; sự kiện có năm chỉ hiện khi chưa vượt mức trượt.
      const visible =
        ceiling === null
          ? markers
          : markers.filter((marker) => marker.year === undefined || marker.year <= ceiling);
      markerLayer.clearLayers();
      container.classList.toggle('map-markers-spread', currentZoom >= SPREAD_ZOOM);

      if (currentZoom >= SPREAD_ZOOM || visible.length < 2) {
        visible.forEach((marker, index) => {
          markerLayer.addLayer(singleMarker(marker, index));
        });

        return;
      }

      type ClusteredPoint = { marker: MapMarker; index: number; position: L.LatLng };
      type Cluster = { cellX: number; cellY: number; points: ClusteredPoint[] };
      const groups = new Map<string, Cluster>();

      visible.forEach((marker, index) => {
        const position = L.latLng(marker.latitude, marker.longitude);
        const point = map.project(position, currentZoom);
        // Ô lưới tính theo tọa độ pixel thế giới nên cụm không đổi khi kéo bản đồ.
        const cellX = Math.round(point.x / CLUSTER_CELL_PX);
        const cellY = Math.round(point.y / CLUSTER_CELL_PX);
        const key = `${cellX}:${cellY}`;
        const group = groups.get(key);

        if (group) {
          group.points.push({ marker, index, position });
        } else {
          groups.set(key, { cellX, cellY, points: [{ marker, index, position }] });
        }
      });

      for (const group of groups.values()) {
        if (group.points.length === 1) {
          const only = group.points[0];

          if (only) {
            markerLayer.addLayer(singleMarker(only.marker, only.index));
          }

          continue;
        }

        const positions = group.points.map((item) => item.position);
        // Vòng cụm đặt ở tâm ô lưới chứ không phải trọng tâm các điểm: trọng tâm hai ô
        // cạnh nhau có thể sát nhau hơn cả đường kính vòng, còn tâm ô thì luôn cách nhau
        // đúng một cạnh ô.
        const middle = map.unproject(
          L.point(group.cellX * CLUSTER_CELL_PX, group.cellY * CLUSTER_CELL_PX),
          currentZoom,
        );
        // Cụm to dần theo căn bậc hai số điểm và luôn nhỏ hơn ô lưới để không đè cụm bên cạnh.
        const spread = 30 + Math.round(Math.sqrt(group.points.length) * 3);
        const size = Math.min(CLUSTER_CELL_PX - 12, spread);
        const text = labels.cluster.replace('{count}', String(group.points.length));
        const icon = L.divIcon({
          className: 'map-marker-host',
          html: `<span class="map-cluster" style="--cluster-size:${size}px">${group.points.length}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2 - 2],
        });

        const badge = L.marker(middle, { icon, title: text });

        const zoomIntoCluster = (): void => {
          map.setView(middle, splitZoom(map, positions, currentZoom));
        };

        badge.on('click', zoomIntoCluster);

        // Leaflet chỉ tự kích hoạt bằng Enter cho điểm có bong bóng, nên vòng cụm
        // phải nhận phím riêng; Space cũng được vì vòng cụm đóng vai một nút.
        badge.on('keypress', (event: LeafletKeyboardEvent) => {
          const key = event.originalEvent.key;

          if (key !== 'Enter' && key !== ' ') {
            return;
          }

          event.originalEvent.preventDefault();
          zoomIntoCluster();
        });

        markerLayer.addLayer(badge);
        // Leaflet bỏ qua thuộc tính alt của divIcon, nên gắn nhãn trực tiếp lên phần tử.
        badge.getElement()?.setAttribute('aria-label', text);
      }
    };

    renderMarkersRef.current = renderMarkers;
    renderMarkers();
    map.on('zoomend', renderMarkers);

    // Điều khiển mở vùng đang xem bằng Google Maps. Đây chỉ là liên kết: không có ảnh,
    // mã lệnh hay kết nối nào của bên thứ ba được tải trước khi người đọc bấm vào nó.
    const refreshGoogleHref = () => setGoogleHref(googleMapsHref(map));
    refreshGoogleHref();
    map.on('moveend zoomend', refreshGoogleHref);

    // Bản đồ trong lưới co giãn cần được thông báo khi kích thước thay đổi.
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    // Vòng sáng quanh cụm điểm là chuyển động lặp nên chỉ chạy khi khung bản đồ thực sự
    // hiện trên màn hình. Kéo trang xuống dưới, vòng dừng lại, trình duyệt khỏi phải vẽ
    // vô ích và người dùng thiết bị cũng đỡ tốn pin.
    const visibility = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        container.classList.toggle('map-in-view', visible);
      },
      { threshold: 0.05 },
    );
    visibility.observe(container);

    return () => {
      observer.disconnect();
      visibility.disconnect();
      map.off('zoomend', renderMarkers);
      removeBasemap();
      markerLayer.remove();
      markerCache.clear();
      map.remove();
      // Bản đồ cũ đã bị gỡ; chặn hiệu ứng thanh trượt gọi lại hàm vẽ lỗi thời
      // cho tới khi bản đồ mới được dựng xong trong cùng lượt kết xuất.
      renderMarkersRef.current = () => {};
    };
  }, [markers, labels, center, zoom, locale]);

  return (
    <div className={cn('relative h-full', className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label={labels.ariaLabel}
        className="h-full min-h-[22rem] w-full"
      />
      {googleHref ? (
        <a
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          className="map-open-google absolute right-2 top-2 z-[650]"
        >
          {labels.openGoogle}
          <span className="sr-only">
            {' · '}
            {labels.externalLink}
          </span>
        </a>
      ) : null}
    </div>
  );
}
