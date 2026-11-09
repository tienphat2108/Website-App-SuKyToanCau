import type { HistoricalEvent } from '@/core/models/HistoricalEvent';

/** Lý do hai sự kiện được xem là liên quan, dùng để dán nhãn lên thẻ gợi ý. */
export type RelatedReason = 'sameEra' | 'sameCountry' | 'sameTag' | 'nearYear';

/** Trọng số các tín hiệu tương đồng. */
const ERA_SCORE = 3;
const COUNTRY_SCORE = 2;
const TAG_SCORE = 1;
/** Trần điểm tối đa từ nhãn chủ đề để một nhãn không lấn át các tín hiệu khác. */
const TAG_SCORE_MAX = 3;
const NEAR_YEAR_SCORE = 2;
const DECADE_YEAR_SCORE = 1;
const NEAR_YEAR_GAP = 10;
const DECADE_YEAR_GAP = 50;

/** Một sự kiện liên quan kèm điểm tương đồng và các lý do. */
export interface RelatedEventMatch {
  event: HistoricalEvent;
  /** Tổng điểm tương đồng, chỉ dùng để xếp hạng. */
  score: number;
  /** Các lý do liên quan, sắp theo mức quan trọng giảm dần. */
  reasons: RelatedReason[];
}

/**
 * Tìm các sự kiện gần gũi nhất với sự kiện đang đọc để gợi ý "đọc tiếp theo".
 * Tính điểm theo thời kỳ, quốc gia, nhãn chủ đề và khoảng cách năm; không dựa
 * vào bất kỳ dữ liệu hành vi nào nên chạy được ngay cả ở máy chủ.
 * @param events Toàn bộ sự kiện trong kho dữ liệu.
 * @param current Sự kiện đang xem.
 * @param limit Số gợi ý tối đa.
 * @returns Danh sách gợi ý đã sắp theo điểm giảm dần.
 */
export function findRelatedEvents(
  events: readonly HistoricalEvent[],
  current: HistoricalEvent,
  limit = 3,
): RelatedEventMatch[] {
  const currentTags = new Set([...current.tagsVi, ...current.tagsEn]);

  return events
    .map((event) => {
      if (event.slug === current.slug) {
        return null;
      }

      const reasons: RelatedReason[] = [];
      let score = 0;

      if (event.era === current.era) {
        score += ERA_SCORE;
        reasons.push('sameEra');
      }

      if (event.country === current.country) {
        score += COUNTRY_SCORE;
        reasons.push('sameCountry');
      }

      const candidateTags = new Set([...event.tagsVi, ...event.tagsEn]);
      const sharedTags = [...candidateTags].filter((tag) => currentTags.has(tag)).length;
      if (sharedTags > 0) {
        score += Math.min(sharedTags, TAG_SCORE_MAX) * TAG_SCORE;
        reasons.push('sameTag');
      }

      const yearGap = Math.abs(event.startYear - current.startYear);
      if (yearGap <= NEAR_YEAR_GAP) {
        score += NEAR_YEAR_SCORE;
        reasons.push('nearYear');
      } else if (yearGap <= DECADE_YEAR_GAP) {
        score += DECADE_YEAR_SCORE;
        reasons.push('nearYear');
      }

      if (score === 0) {
        return null;
      }

      return { event, score, reasons, yearGap };
    })
    .filter((match): match is NonNullable<typeof match> => match !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.yearGap - right.yearGap ||
        left.event.slug.localeCompare(right.event.slug),
    )
    .slice(0, limit)
    .map(({ event, score, reasons }) => ({ event, score, reasons }));
}
