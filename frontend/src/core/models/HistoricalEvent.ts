import { defaultLocale, type Locale } from '@/core/i18n/config';

/** Khóa thời kỳ lịch sử. */
export type EraKey = 'co-dai' | 'trung-dai' | 'can-dai' | 'hien-dai';

/** Thông tin một thời kỳ lịch sử dùng cho bộ lọc và nhãn. */
export interface EraDefinition {
  key: EraKey;
  nameVi: string;
  nameEn: string;
  order: number;
  fromYear: number;
  toYear: number;
}

/** Danh mục thời kỳ, đồng bộ với tầng máy chủ. */
export const ERAS: EraDefinition[] = [
  { key: 'co-dai', nameVi: 'Cổ đại', nameEn: 'Ancient', order: 1, fromYear: -3000, toYear: 999 },
  { key: 'trung-dai', nameVi: 'Trung đại', nameEn: 'Medieval', order: 2, fromYear: 1000, toYear: 1801 },
  { key: 'can-dai', nameVi: 'Cận đại', nameEn: 'Early modern', order: 3, fromYear: 1802, toYear: 1944 },
  { key: 'hien-dai', nameVi: 'Hiện đại', nameEn: 'Modern', order: 4, fromYear: 1945, toYear: 2100 },
];

/**
 * Tìm thời kỳ theo khóa.
 * @param key Khóa thời kỳ.
 * @returns Thông tin thời kỳ hoặc undefined.
 */
export function findEra(key: string | undefined): EraDefinition | undefined {
  return ERAS.find((era) => era.key === key);
}

/** Một nguồn tham khảo hiển thị ở cuối bài viết. */
export interface HistoricalSource {
  title: string;
  publisher: string;
  url: string;
  language: string;
}

/** Dữ liệu thô của một sự kiện, dùng chung cho phản hồi API và tệp mẫu. */
export interface EventData {
  slug: string;
  era: string;
  eraNameVi?: string;
  eraNameEn?: string;
  country: string;
  countryEn?: string;
  startYear: number;
  endYear?: number | null;
  dateLabelVi: string;
  dateLabelEn: string;
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  summaryEn: string;
  contentVi?: string[];
  contentEn?: string[];
  locationVi: string;
  locationEn: string;
  latitude: number;
  longitude: number;
  imagePath: string;
  imageAltVi: string;
  imageAltEn: string;
  tagsVi?: string[];
  tagsEn?: string[];
  wikiTitle?: string | null;
  sources?: HistoricalSource[];
  featured?: boolean;
  related?: EventData[];
  relatedSlugs?: string[];
  updatedAt?: string;
}

/**
 * Lớp biểu diễn một sự kiện lịch sử ở phía giao diện.
 * Đóng gói toàn bộ logic chọn ngôn ngữ và tạo đường dẫn để component không phải xử lý thủ công.
 */
export class HistoricalEvent {
  readonly slug: string;
  readonly era: string;
  readonly eraNameVi: string;
  readonly eraNameEn: string;
  readonly country: string;
  readonly countryEn: string;
  readonly startYear: number;
  readonly endYear: number | null;
  readonly dateLabelVi: string;
  readonly dateLabelEn: string;
  readonly titleVi: string;
  readonly titleEn: string;
  readonly summaryVi: string;
  readonly summaryEn: string;
  readonly contentVi: string[];
  readonly contentEn: string[];
  readonly locationVi: string;
  readonly locationEn: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly imagePath: string;
  readonly imageAltVi: string;
  readonly imageAltEn: string;
  readonly tagsVi: string[];
  readonly tagsEn: string[];
  readonly wikiTitle: string | null;
  readonly sources: HistoricalSource[];
  readonly featured: boolean;
  readonly relatedSlugs: string[];
  readonly related: HistoricalEvent[];
  readonly updatedAt: string | null;

  /**
   * Khởi tạo sự kiện từ dữ liệu đã chuẩn hóa.
   * @param data Dữ liệu sự kiện.
   */
  constructor(data: EventData) {
    this.slug = data.slug;
    this.era = data.era;
    this.eraNameVi = data.eraNameVi ?? findEra(data.era)?.nameVi ?? data.era;
    this.eraNameEn = data.eraNameEn ?? findEra(data.era)?.nameEn ?? data.era;
    this.country = data.country;
    this.countryEn = data.countryEn ?? data.country;
    this.startYear = data.startYear;
    this.endYear = data.endYear ?? null;
    this.dateLabelVi = data.dateLabelVi;
    this.dateLabelEn = data.dateLabelEn;
    this.titleVi = data.titleVi;
    this.titleEn = data.titleEn;
    this.summaryVi = data.summaryVi;
    this.summaryEn = data.summaryEn;
    this.contentVi = data.contentVi ?? [];
    this.contentEn = data.contentEn ?? [];
    this.locationVi = data.locationVi;
    this.locationEn = data.locationEn;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.imagePath = data.imagePath;
    this.imageAltVi = data.imageAltVi;
    this.imageAltEn = data.imageAltEn;
    this.tagsVi = data.tagsVi ?? [];
    this.tagsEn = data.tagsEn ?? [];
    this.wikiTitle = data.wikiTitle ?? null;
    this.sources = data.sources ?? [];
    this.featured = data.featured ?? false;
    this.relatedSlugs = data.relatedSlugs ?? data.related?.map((item) => item.slug) ?? [];
    this.related = data.related?.map((item) => new HistoricalEvent(item)) ?? [];
    this.updatedAt = data.updatedAt ?? null;
  }

  /**
   * Lấy tiêu đề theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Tiêu đề tương ứng.
   */
  title(locale: Locale): string {
    return locale === 'en' ? this.titleEn : this.titleVi;
  }

  /**
   * Lấy tóm tắt theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Đoạn tóm tắt.
   */
  summary(locale: Locale): string {
    return locale === 'en' ? this.summaryEn : this.summaryVi;
  }

  /**
   * Lấy nội dung đầy đủ theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Mảng đoạn văn.
   */
  content(locale: Locale): string[] {
    return locale === 'en' ? this.contentEn : this.contentVi;
  }

  /**
   * Lấy nhãn thời gian theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Nhãn thời gian đã biên tập.
   */
  dateLabel(locale: Locale): string {
    return locale === 'en' ? this.dateLabelEn : this.dateLabelVi;
  }

  /**
   * Lấy địa điểm theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Tên địa điểm.
   */
  location(locale: Locale): string {
    return locale === 'en' ? this.locationEn : this.locationVi;
  }

  /**
   * Lấy văn bản thay thế của hình minh họa.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Văn bản thay thế.
   */
  imageAlt(locale: Locale): string {
    return locale === 'en' ? this.imageAltEn : this.imageAltVi;
  }

  /**
   * Lấy nhãn theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Danh sách nhãn.
   */
  tags(locale: Locale): string[] {
    return locale === 'en' ? this.tagsEn : this.tagsVi;
  }

  /**
   * Lấy tên thời kỳ theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Tên thời kỳ.
   */
  eraName(locale: Locale): string {
    return locale === 'en' ? this.eraNameEn : this.eraNameVi;
  }

  /**
   * Lấy tên quốc gia theo ngôn ngữ.
   * @param locale Ngôn ngữ cần hiển thị.
   * @returns Tên quốc gia hoặc khu vực.
   */
  countryName(locale: Locale): string {
    return locale === 'en' ? this.countryEn : this.country;
  }

  /**
   * Tạo đường dẫn tới trang chi tiết theo ngôn ngữ.
   * @param locale Ngôn ngữ đích.
   * @returns Đường dẫn nội bộ.
   */
  href(locale: Locale): string {
    return locale === defaultLocale
      ? `/event/${this.slug}`
      : `/${locale}/event/${this.slug}`;
  }

  /**
   * Cho biết sự kiện đã có nội dung đầy đủ hay chỉ là bản tóm tắt.
   * @returns Đúng nếu có ít nhất một đoạn nội dung.
   */
  hasContent(): boolean {
    return this.contentVi.length > 0 || this.contentEn.length > 0;
  }

  /**
   * Lấy khoảng năm hiệu lực của sự kiện.
   * Sự kiện một mốc thời gian dùng chính năm bắt đầu làm năm kết thúc.
   * @returns Cặp năm bắt đầu và năm kết thúc.
   */
  yearRange(): { start: number; end: number } {
    return { start: this.startYear, end: this.endYear ?? this.startYear };
  }
}
