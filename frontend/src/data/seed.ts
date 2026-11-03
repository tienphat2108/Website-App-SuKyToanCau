import { HistoricalEvent, type EventData } from '@/core/models/HistoricalEvent';
import seedDocument from '../../../shared/history-events.json';

/** Cấu trúc một sự kiện trong tệp dữ liệu dùng chung. */
interface SeedEvent extends Omit<EventData, 'imagePath' | 'related'> {
  image: string;
  related: string[];
}

/** Tài liệu dữ liệu mẫu dùng chung với tầng máy chủ. */
interface SeedDocument {
  events: SeedEvent[];
}

const document = seedDocument as unknown as SeedDocument;

/**
 * Chuyển dữ liệu mẫu sang lớp sự kiện của giao diện.
 * Dữ liệu này là phương án dự phòng khi API chưa sẵn sàng và cũng dùng để tạo sơ đồ trang.
 */
export const seedEvents: HistoricalEvent[] = document.events.map(
  (item) =>
    new HistoricalEvent({
      ...item,
      imagePath: item.image,
      relatedSlugs: item.related,
      related: [],
    }),
);

/** Tra cứu nhanh một sự kiện mẫu theo khóa. */
export const seedEventsBySlug = new Map(seedEvents.map((event) => [event.slug, event]));
