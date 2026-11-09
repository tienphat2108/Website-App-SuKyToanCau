import { HistoricalEvent, ERAS, type EventData } from '@/core/models/HistoricalEvent';
import { seedEvents, seedEventsBySlug } from '@/data/seed';
import { normalizeSearchText } from '@/utils/format';
import { ApiClient, API_BASE_URL } from './api.client';

/** Bộ lọc danh sách sự kiện phía giao diện. */
export interface EventQuery {
  era?: string;
  country?: string;
  search?: string;
  fromYear?: number;
  toYear?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

/** Trang dữ liệu sự kiện. */
export interface EventPage {
  items: HistoricalEvent[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Số liệu tổng quan hiển thị trên trang chủ. */
export interface SiteStats {
  totalEvents: number;
  totalEras: number;
  totalCountries: number;
  featuredEvents: number;
  earliestYear: number;
  latestYear: number;
}

/** Một dòng tham khảo lấy từ nguồn bên ngoài. */
export interface ExternalSummary {
  title: string;
  extract: string;
  sourceUrl: string;
  language: string;
}

/** Cấu trúc phản hồi phân trang của API. */
interface ApiPaged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Một sự kiện quốc tế diễn ra cùng năm với sự kiện đang xem. */
export interface SameYearEvent {
  event: HistoricalEvent;
  year: number;
  exactStart: boolean;
}

/**
 * Tìm các sự kiện ở quốc gia khác diễn ra cùng năm với sự kiện đang xem.
 * Ưu tiên sự kiện trùng năm bắt đầu, sau đó tới khoảng năm giao nhau gần nhất.
 * @param events Toàn bộ sự kiện đã tải.
 * @param current Sự kiện đang xem.
 * @param limit Số lượng tối đa.
 * @returns Danh sách sự kiện quốc tế kèm năm giao nhau.
 */
export function findSameYearWorldEvents(
  events: HistoricalEvent[],
  current: HistoricalEvent,
  limit = 3,
): SameYearEvent[] {
  const currentRange = current.yearRange();

  return events
    .filter((event) => event.slug !== current.slug && event.country !== current.country)
    .map((event) => {
      const range = event.yearRange();
      const year = Math.max(currentRange.start, range.start);
      const lastYear = Math.min(currentRange.end, range.end);

      if (year > lastYear) {
        return null;
      }

      return { event, year, exactStart: event.startYear === current.startYear };
    })
    .filter((item): item is SameYearEvent => item !== null)
    .sort(
      (left, right) =>
        Number(right.exactStart) - Number(left.exactStart) ||
        Math.abs(left.year - current.startYear) - Math.abs(right.year - current.startYear) ||
        left.event.slug.localeCompare(right.event.slug),
    )
    .slice(0, limit);
}

/**
 * Lọc dữ liệu dự phòng tại máy chủ khi API chưa sẵn sàng.
 * Logic được giữ đồng bộ với tầng ứng dụng .NET để kết quả không thay đổi đáng kể.
 * @param events Toàn bộ sự kiện mẫu.
 * @param query Bộ lọc cần áp dụng.
 * @returns Trang dữ liệu phù hợp.
 */
export function filterSeedEvents(events: HistoricalEvent[], query: EventQuery): EventPage {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 12));
  const search = normalizeSearchText(query.search?.trim() ?? '');
  const country = normalizeSearchText(query.country?.trim() ?? '');

  const filtered = events
    .filter((event) => {
      if (query.era && event.era !== query.era) return false;

      if (
        country &&
        !normalizeSearchText(event.country).includes(country) &&
        !normalizeSearchText(event.countryEn).includes(country)
      ) {
        return false;
      }

      if (query.featured !== undefined && event.featured !== query.featured) return false;

      const effectiveEnd = event.endYear ?? event.startYear;
      if (query.fromYear !== undefined && effectiveEnd < query.fromYear) return false;
      if (query.toYear !== undefined && event.startYear > query.toYear) return false;

      if (search) {
        const haystack = normalizeSearchText(
          [
            event.titleVi,
            event.titleEn,
            event.summaryVi,
            event.summaryEn,
            event.locationVi,
            event.locationEn,
          ].join(' '),
        );

        if (!haystack.includes(search)) return false;
      }

      return true;
    })
    .sort((left, right) => left.startYear - right.startYear || left.slug.localeCompare(right.slug));

  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}

/**
 * Dịch vụ đọc dữ liệu lịch sử.
 * Ưu tiên API của hệ thống, tự động quay về dữ liệu mẫu khi API không khả dụng
 * để trang vẫn hiển thị nội dung hữu ích.
 */
export class HistoricalService {
  constructor(
    private readonly client: ApiClient,
    private readonly fallbackEvents: HistoricalEvent[] = seedEvents,
  ) {}

  /**
   * Lấy danh sách sự kiện theo bộ lọc.
   * @param query Bộ lọc và phân trang.
   * @returns Trang dữ liệu sự kiện.
   */
  async list(query: EventQuery = {}): Promise<EventPage> {
    const params = new URLSearchParams();

    if (query.era) params.set('era', query.era);
    if (query.country) params.set('country', query.country);
    if (query.search) params.set('search', query.search);
    if (query.fromYear !== undefined) params.set('fromYear', String(query.fromYear));
    if (query.toYear !== undefined) params.set('toYear', String(query.toYear));
    if (query.featured !== undefined) params.set('featured', String(query.featured));
    params.set('page', String(query.page ?? 1));
    params.set('pageSize', String(query.pageSize ?? 12));

    // Khi máy chủ dữ liệu không phản hồi lúc dựng trang, Next.js có thể phát lại phản hồi
    // hết hạn còn lưu trong bộ nhớ đệm; danh sách không lọc vì thế không được ít hơn
    // số sự kiện của kho phát hành kèm giao diện.
    const isFullList =
      !query.era &&
      !query.country &&
      !query.search &&
      query.fromYear === undefined &&
      query.toYear === undefined &&
      query.featured === undefined &&
      (query.page ?? 1) === 1;

    try {
      const response = await this.client.get<ApiPaged<EventData>>(
        `/api/events?${params.toString()}`,
        { revalidate: 300, tags: ['events'] },
      );

      if (response && (!isFullList || response.total >= this.fallbackEvents.length)) {
        return {
          items: response.items.map((item) => new HistoricalEvent(item)),
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        };
      }
    } catch (error) {
      console.warn(
        '[historical-service] Không đọc được API, dùng dữ liệu mẫu.',
        error instanceof Error ? error.message : error,
      );
    }

    return filterSeedEvents(this.fallbackEvents, query);
  }

  /**
   * Lấy chi tiết một sự kiện.
   * @param slug Khóa đường dẫn.
   * @returns Sự kiện đầy đủ hoặc null nếu không tồn tại.
   */
  async getBySlug(slug: string): Promise<HistoricalEvent | null> {
    try {
      const response = await this.client.get<EventData>(
        `/api/events/${encodeURIComponent(slug)}`,
        { revalidate: 300, tags: ['events', `event:${slug}`] },
      );

      if (response) {
        return new HistoricalEvent(response);
      }
    } catch (error) {
      console.warn(
        `[historical-service] Không đọc được sự kiện ${slug}, dùng dữ liệu mẫu.`,
        error instanceof Error ? error.message : error,
      );
    }

    return this.getFallbackEvent(slug);
  }

  /**
   * Lấy toàn bộ sự kiện, tối đa 200 bản ghi.
   * @returns Danh sách đã sắp xếp theo thời gian.
   */
  async getAll(): Promise<HistoricalEvent[]> {
    const page = await this.list({ page: 1, pageSize: 200 });
    return page.items;
  }

  /**
   * Lấy các sự kiện nổi bật.
   * @param limit Số lượng tối đa.
   * @returns Danh sách sự kiện nổi bật.
   */
  async getFeatured(limit = 6): Promise<HistoricalEvent[]> {
    const page = await this.list({ featured: true, pageSize: limit });
    return page.items.slice(0, limit);
  }

  /**
   * Lấy các bài viết mới nhất theo mốc thời gian.
   * @param limit Số lượng tối đa.
   * @returns Các sự kiện hiện đại nhất.
   */
  async getLatest(limit = 3): Promise<HistoricalEvent[]> {
    const all = await this.getAll();
    return [...all].sort((left, right) => right.startYear - left.startYear).slice(0, limit);
  }

  /**
   * Lấy số liệu tổng quan.
   * @returns Số liệu của kho dữ liệu.
   */
  async getStats(): Promise<SiteStats> {
    try {
      const response = await this.client.get<SiteStats>('/api/meta/stats', {
        revalidate: 600,
        tags: ['stats'],
      });

      // Bộ nhớ đệm của Next.js có thể trả phản hồi cũ dựng từ khi kho còn ít sự kiện hơn,
      // nên số liệu thấp hơn bộ dữ liệu phát hành kèm giao diện bị coi là lỗi thời.
      if (response && response.totalEvents >= this.fallbackEvents.length) {
        return response;
      }
    } catch (error) {
      console.warn(
        '[historical-service] Không đọc được số liệu API, tự tính từ dữ liệu mẫu.',
        error instanceof Error ? error.message : error,
      );
    }

    const events = this.fallbackEvents;
    const countries = new Set(events.map((event) => event.country));
    const years = events.map((event) => event.startYear);

    return {
      totalEvents: events.length,
      totalEras: ERAS.length,
      totalCountries: countries.size,
      featuredEvents: events.filter((event) => event.featured).length,
      earliestYear: years.length ? Math.min(...years) : 0,
      latestYear: years.length ? Math.max(...years) : 0,
    };
  }

  /**
   * Lấy danh sách quốc gia có trong dữ liệu.
   * @param events Danh sách sự kiện đã tải.
   * @returns Mảng quốc gia duy nhất theo thứ tự chữ cái.
   */
  getCountries(events: HistoricalEvent[]): Array<{ vi: string; en: string }> {
    const map = new Map<string, { vi: string; en: string }>();

    for (const event of events) {
      if (!map.has(event.country)) {
        map.set(event.country, { vi: event.country, en: event.countryEn });
      }
    }

    return [...map.values()].sort((left, right) => left.vi.localeCompare(right.vi, 'vi'));
  }

  /**
   * Lấy đoạn tóm tắt tham khảo từ nguồn bên ngoài.
   * @param slug Khóa sự kiện.
   * @param language Ngôn ngữ mong muốn.
   * @returns Đoạn tóm tắt hoặc null nếu không có.
   */
  async getExternalSummary(slug: string, language: 'vi' | 'en'): Promise<ExternalSummary | null> {
    try {
      return await this.client.get<ExternalSummary>(
        `/api/events/${encodeURIComponent(slug)}/external?language=${language}`,
        { revalidate: 21_600 },
      );
    } catch (error) {
      console.warn(
        `[historical-service] Không lấy được tóm tắt mở rộng cho ${slug}.`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  /**
   * Tìm sự kiện trong dữ liệu mẫu và bổ sung liên kết liên quan.
   * @param slug Khóa sự kiện.
   * @returns Sự kiện đầy đủ hoặc null.
   */
  private getFallbackEvent(slug: string): HistoricalEvent | null {
    const event = seedEventsBySlug.get(slug);
    if (!event) {
      return null;
    }

    const related = event.relatedSlugs
      .map((relatedSlug) => seedEventsBySlug.get(relatedSlug))
      .filter((item): item is HistoricalEvent => Boolean(item));

    if (related.length < 3) {
      for (const candidate of this.fallbackEvents) {
        if (
          related.length >= 3 ||
          candidate.slug === slug ||
          related.some((item) => item.slug === candidate.slug)
        ) {
          continue;
        }

        if (candidate.era === event.era) {
          related.push(candidate);
        }
      }
    }

    return new HistoricalEvent({
      ...(event as unknown as EventData),
      relatedSlugs: event.relatedSlugs,
      related: related.slice(0, 3).map((item) => item as unknown as EventData),
    });
  }
}

/** Thực thể dịch vụ dùng chung cho các thành phần phía máy chủ. */
export const historicalService = new HistoricalService(new ApiClient(API_BASE_URL));
