import type { Locale } from '@/core/i18n/config';

/**
 * Bộ nhãn địa danh do dự án tự đặt, hiển thị đè lên nền bản đồ.
 *
 * Website không dùng ô ảnh của bên thứ ba nữa, nên mọi tên trên bản đồ đều đến từ
 * tệp này. Với hai quần đảo Hoàng Sa và Trường Sa, tên tiếng Việt được giữ nguyên ở
 * cả hai ngôn ngữ và không có bản dịch nào khác.
 */
export interface PlaceLabel {
  /** Tên tiếng Việt. */
  vi: string;
  /** Tên tiếng Anh; với địa danh giữ tên Việt thì trùng với trường vi. */
  en: string;
  /** Vị trí đặt nhãn theo [vĩ độ, kinh độ]. */
  position: [number, number];
  /** Mức thu phóng nhỏ nhất mà nhãn còn hiện, để tránh đè chi chít khi nhìn cả thế giới. */
  minZoom: number;
  /** Kiểu nhãn, dùng để chọn màu và cỡ chữ trong CSS. */
  kind: 'sea' | 'island' | 'ocean';
  /** Bắt buộc giữ tên tiếng Việt ở mọi ngôn ngữ. */
  keepVietnamese?: boolean;
}

/**
 * Biển, dương và quần đảo cần hiện tên.
 * Hoàng Sa và Trường Sa đánh dấu keepVietnamese để không bao giờ bị đổi tên;
 * hai quần đảo này luôn có chấm nhỏ trên bản đồ kể cả khi tên chưa hiện.
 */
export const MARITIME_PLACES: PlaceLabel[] = [
  { vi: 'Biển Đông', en: 'East Sea', position: [14.8, 114.2], minZoom: 1, kind: 'sea' },
  { vi: 'vịnh Bắc Bộ', en: 'Bắc Bộ Gulf', position: [20.2, 107.6], minZoom: 3, kind: 'sea' },
  { vi: 'vịnh Thái Lan', en: 'Gulf of Thailand', position: [10.6, 101.2], minZoom: 3, kind: 'sea' },
  { vi: 'Biển Caribe', en: 'Caribbean Sea', position: [14.5, -73.0], minZoom: 2, kind: 'sea' },
  { vi: 'Địa Trung Hải', en: 'Mediterranean Sea', position: [36.2, 16.5], minZoom: 2, kind: 'sea' },
  { vi: 'Biển Đen', en: 'Black Sea', position: [43.2, 33.5], minZoom: 3, kind: 'sea' },
  { vi: 'Biển Đỏ', en: 'Red Sea', position: [20.5, 38.2], minZoom: 3, kind: 'sea' },
  { vi: 'Biển Caspi', en: 'Caspian Sea', position: [41.6, 50.4], minZoom: 4, kind: 'sea' },
  { vi: 'vịnh Mexico', en: 'Gulf of Mexico', position: [24.2, -91.5], minZoom: 3, kind: 'sea' },
  {
    vi: 'Hoàng Sa',
    en: 'Hoàng Sa',
    position: [16.55, 111.6],
    minZoom: 2,
    kind: 'island',
    keepVietnamese: true,
  },
  {
    vi: 'Trường Sa',
    en: 'Trường Sa',
    position: [9.9, 114.6],
    minZoom: 2,
    kind: 'island',
    keepVietnamese: true,
  },
  { vi: 'Ấn Độ Dương', en: 'Indian Ocean', position: [-22.0, 72.0], minZoom: 1, kind: 'ocean' },
  { vi: 'Thái Bình Dương', en: 'Pacific Ocean', position: [-22.0, 152.0], minZoom: 1, kind: 'ocean' },
  { vi: 'Bắc Băng Dương', en: 'Arctic Ocean', position: [79.0, 105.0], minZoom: 1, kind: 'ocean' },
];

/**
 * Điểm đặt nhãn cho từng quốc gia và khu vực có trong danh mục.
 * Khóa trùng với khóa trong danh mục quốc gia để tên luôn lấy từ một nguồn duy nhất.
 * Những khóa không phải một nơi chốn cụ thể (Babylon, Liên Xô, Toàn cầu, Tây Á)
 * không có điểm đặt và vì thế không hiện trên bản đồ.
 */
export const COUNTRY_LABEL_POINTS: Record<string, { position: [number, number]; minZoom: number }> = {
  'Ả Rập Xê Út': { position: [24.5, 45.5], minZoom: 3 },
  'Ai Cập': { position: [26.8, 30.2], minZoom: 3 },
  'Anh': { position: [53.2, -2.2], minZoom: 4 },
  'Argentina': { position: [-35.5, -65.0], minZoom: 3 },
  'Ấn Độ': { position: [22.5, 79.5], minZoom: 3 },
  'Ba Lan': { position: [52.2, 19.4], minZoom: 4 },
  'Bồ Đào Nha': { position: [39.6, -8.6], minZoom: 4 },
  'Brasil': { position: [-10.5, -52.0], minZoom: 2 },
  'Campuchia': { position: [12.5, 104.9], minZoom: 4 },
  'Canada': { position: [56.0, -100.0], minZoom: 2 },
  'Cuba': { position: [21.7, -79.3], minZoom: 4 },
  'Đức': { position: [51.0, 10.3], minZoom: 4 },
  'Ethiopia': { position: [8.5, 39.6], minZoom: 3 },
  'Ghana': { position: [7.8, -1.3], minZoom: 4 },
  'Hà Lan': { position: [52.3, 5.4], minZoom: 5 },
  'Haiti': { position: [19.0, -72.5], minZoom: 4 },
  'Hàn Quốc': { position: [36.6, 127.8], minZoom: 4 },
  'Hoa Kỳ': { position: [39.0, -98.5], minZoom: 2 },
  'Hy Lạp': { position: [39.6, 22.0], minZoom: 4 },
  'Indonesia': { position: [-2.2, 117.5], minZoom: 3 },
  'Iran': { position: [32.5, 53.5], minZoom: 3 },
  'Kenya': { position: [0.6, 37.8], minZoom: 3 },
  'Mali': { position: [17.0, -3.5], minZoom: 3 },
  'Mexico': { position: [23.5, -102.5], minZoom: 3 },
  'Mông Cổ': { position: [46.0, 103.0], minZoom: 3 },
  'Nam Phi': { position: [-29.0, 25.0], minZoom: 3 },
  'New Zealand': { position: [-42.5, 172.2], minZoom: 3 },
  'Nga': { position: [61.0, 92.0], minZoom: 2 },
  'Nhật Bản': { position: [37.5, 138.2], minZoom: 3 },
  'Nigeria': { position: [9.5, 8.2], minZoom: 4 },
  'Peru': { position: [-10.0, -76.0], minZoom: 3 },
  'Pháp': { position: [46.6, 2.4], minZoom: 3 },
  'Philippines': { position: [15.2, 121.6], minZoom: 3 },
  'Singapore': { position: [1.35, 103.8], minZoom: 5 },
  'Tây Ban Nha': { position: [40.0, -3.7], minZoom: 3 },
  'Thái Lan': { position: [15.5, 101.0], minZoom: 3 },
  'Thổ Nhĩ Kỳ': { position: [39.0, 35.3], minZoom: 3 },
  'Trung Quốc': { position: [35.5, 104.0], minZoom: 2 },
  'Úc': { position: [-25.0, 134.0], minZoom: 2 },
  'Ukraina': { position: [49.0, 32.0], minZoom: 4 },
  'Việt Nam': { position: [13.8, 108.2], minZoom: 3 },
  'Ý': { position: [42.8, 12.8], minZoom: 4 },
};

/**
 * Lấy tên hiển thị của một địa danh theo ngôn ngữ.
 * Địa danh đánh dấu giữ tên tiếng Việt sẽ trả về tên Việt ở cả hai ngôn ngữ.
 * @param label Địa danh cần lấy tên.
 * @param locale Ngôn ngữ đang xem.
 * @returns Tên dùng để vẽ lên bản đồ.
 */
export function placeLabelName(label: PlaceLabel, locale: Locale): string {
  if (label.keepVietnamese || locale === 'vi') {
    return label.vi;
  }

  return label.en;
}
