import type { HistoricalEvent } from '@/core/models/HistoricalEvent';

/**
 * Một chuỗi nhân quả: các sự kiện trong kho dữ liệu được biên tập thành mạch
 * nguyên nhân – hệ quả. Chỉ trỏ tới các bài đã có, mỗi bài đều kèm nguồn kiểm
 * chứng riêng nên chuỗi không tạo thêm dữ liệu cần kiểm chứng.
 */
export interface HistoryChain {
  /** Khóa định danh chuỗi. */
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  /** Khóa các sự kiện theo đúng thứ tự đọc. */
  eventSlugs: readonly string[];
}

/** Các chuỗi nhân quả được biên tập thủ công và kiểm chứng được. */
export const HISTORY_CHAINS: readonly HistoryChain[] = [
  {
    slug: 'bac-thuoc-den-doc-lap',
    titleVi: 'Từ Bắc thuộc đến độc lập',
    titleEn: 'From Chinese rule to independence',
    descriptionVi:
      'Ba cột mốc khởi nghĩa lớn mở đường chấm dứt hơn một nghìn năm Bắc thuộc, đỉnh điểm là trận Bạch Đằng của Ngô Quyền.',
    descriptionEn:
      'Three major uprisings that paved the way out of more than a thousand years of Chinese rule, crowned by Ngo Quyen’s victory on the Bach Dang River.',
    eventSlugs: [
      'khoi-nghia-hai-ba-trung',
      'khoi-nghia-ly-bi-542',
      'chien-thang-bach-dang-938',
    ],
  },
  {
    slug: 'buc-tuong-berlin-chien-tranh-lanh',
    titleVi: 'Bức tường Berlin trong Chiến tranh Lạnh',
    titleEn: 'The Berlin Wall and the Cold War',
    descriptionVi:
      'Từ sự phân chia nước Đức sau Thế chiến thứ hai đến bức tường dựng lên rồi sụp đổ, kết thúc bằng ngày nước Đức thống nhất.',
    descriptionEn:
      'From the division of Germany after the Second World War to the rise and fall of the Berlin Wall, ending with German reunification.',
    eventSlugs: [
      'the-chien-thu-hai',
      'buc-tuong-berlin-xay-1961',
      'buc-tuong-berlin-1989',
      'thong-nhat-duc-1990',
    ],
  },
  {
    slug: 'chay-dua-vu-tru',
    titleVi: 'Chạy đua vũ trụ',
    titleEn: 'The space race',
    descriptionVi:
      'Từ vệ tinh nhân tạo đầu tiên đến chuyến bay có người lái và bước chân lên Mặt Trăng, khép lại bằng chuyến hợp tác Apollo – Soyuz.',
    descriptionEn:
      'From the first artificial satellite to the first crewed flight and the first Moon landing, closing with the Apollo–Soyuz joint mission.',
    eventSlugs: [
      'sputnik-1957',
      'vostok-1-gagarin-1961',
      'apollo-11-1969',
      'apollo-soyuz-1975',
    ],
  },
];

/**
 * Tìm các chuỗi nhân quả chứa sự kiện đang xem.
 * @param eventSlug Khóa sự kiện.
 * @returns Danh sách chuỗi phù hợp.
 */
export function findChainsForEvent(eventSlug: string): HistoryChain[] {
  return HISTORY_CHAINS.filter((chain) => chain.eventSlugs.includes(eventSlug));
}

/**
 * Đổi khóa sự kiện trong chuỗi thành đối tượng sự kiện đầy đủ, giữ đúng thứ tự đọc.
 * Bỏ qua khóa không còn trong kho dữ liệu để chuỗi không vỡ khi dữ liệu đổi.
 * @param chain Chuỗi nhân quả.
 * @param events Toàn bộ sự kiện trong kho dữ liệu.
 * @returns Các sự kiện theo thứ tự đọc.
 */
export function resolveChainEvents(
  chain: HistoryChain,
  events: readonly HistoricalEvent[],
): HistoricalEvent[] {
  return chain.eventSlugs
    .map((slug) => events.find((event) => event.slug === slug))
    .filter((event): event is HistoricalEvent => Boolean(event));
}
