import type { Locale } from '@/core/i18n/config';
import { localizePath } from '@/core/i18n/config';
import type { Dictionary } from '@/core/i18n/dictionary';
import type { HistoricalEvent } from '@/core/models/HistoricalEvent';
import { collections, type Collection } from '@/data/collections';
import { seedEvents } from '@/data/seed';
import { normalizeSearchText } from '@/utils/format';

/** Số sự kiện tối đa hiển thị trên một lần tìm để trang không quá nặng. */
export const SEARCH_EVENT_LIMIT = 30;

/** Một câu hỏi thường gặp khớp từ khóa. */
export interface SiteSearchFaqItem {
  question: string;
  answer: string;
  href: string;
}

/** Một trang tĩnh khớp từ khóa. */
export interface SiteSearchPageItem {
  title: string;
  description: string;
  href: string;
}

/** Kết quả tìm kiếm toàn site đã gom theo nhóm. */
export interface SiteSearchResults {
  /** Từ khóa gốc người đọc nhập. */
  query: string;
  /** Từ khóa đã bỏ dấu, dùng để hiển thị điều kiện đang áp dụng. */
  term: string;
  /** Sự kiện khớp, đã xếp theo mức liên quan và giới hạn số lượng. */
  events: HistoricalEvent[];
  /** Tổng số sự kiện khớp trước khi cắt bớt. */
  eventTotal: number;
  collections: Collection[];
  faq: SiteSearchFaqItem[];
  pages: SiteSearchPageItem[];
  /** Tổng số kết quả trên mọi nhóm. */
  total: number;
}

/**
 * Tìm một từ khóa trong toàn bộ nội dung biên tập của website.
 * So khớp không phân biệt chữ hoa và dấu tiếng Việt, đồng thời tìm trên cả hai
 * ngôn ngữ để người đọc gõ "Napoleon" vẫn thấy bài tiếng Việt có tên đó.
 * @param locale Ngôn ngữ đang xem, dùng để tạo đường dẫn.
 * @param rawQuery Từ khóa người đọc nhập.
 * @param dictionary Từ điển của ngôn ngữ hiện tại.
 * @returns Kết quả gom theo nhóm sự kiện, tuyến bài học, hỏi đáp và trang.
 */
export function searchSite(
  locale: Locale,
  rawQuery: string,
  dictionary: Dictionary,
): SiteSearchResults {
  const query = rawQuery.trim().slice(0, 120);
  const term = normalizeSearchText(query);
  const empty: SiteSearchResults = {
    query,
    term,
    events: [],
    eventTotal: 0,
    collections: [],
    faq: [],
    pages: [],
    total: 0,
  };

  if (!term) {
    return empty;
  }

  const matchedEvents = seedEvents
    .map((event) => {
      const haystack = normalizeSearchText(
        [
          event.titleVi,
          event.titleEn,
          event.summaryVi,
          event.summaryEn,
          event.locationVi,
          event.locationEn,
          event.country,
          event.countryEn,
          event.eraNameVi,
          event.eraNameEn,
          ...event.tagsVi,
          ...event.tagsEn,
        ].join(' '),
      );
      const titleHaystack = normalizeSearchText(
        `${event.titleVi} ${event.titleEn}`,
      );

      return { event, haystack, inTitle: titleHaystack.includes(term) };
    })
    .filter((entry) => entry.haystack.includes(term))
    .sort((left, right) => {
      if (left.inTitle !== right.inTitle) {
        return left.inTitle ? -1 : 1;
      }
      return right.event.startYear - left.event.startYear;
    })
    .map((entry) => entry.event);

  const matchedCollections = collections.filter((collection) =>
    normalizeSearchText(
      `${collection.titleVi} ${collection.titleEn} ${collection.introVi} ${collection.introEn}`,
    ).includes(term),
  );

  const faqHref = `${localizePath(locale, '/faq')}#faq`;
  const matchedFaq = dictionary.faq.items
    .filter((item) =>
      normalizeSearchText(`${item.question} ${item.answer}`).includes(term),
    )
    .map((item) => ({ question: item.question, answer: item.answer, href: faqHref }));

  const pageCandidates: SiteSearchPageItem[] = [
    {
      title: dictionary.nav.timeline,
      description: dictionary.meta.timeline.description,
      href: localizePath(locale, '/timeline'),
    },
    {
      title: dictionary.nav.collections,
      description: dictionary.meta.collections.description,
      href: localizePath(locale, '/collections'),
    },
    {
      title: dictionary.nav.onThisDay,
      description: dictionary.meta.onThisDay.description,
      href: localizePath(locale, '/on-this-day'),
    },
    {
      title: dictionary.nav.study,
      description: dictionary.meta.study.description,
      href: localizePath(locale, '/study'),
    },
    {
      title: dictionary.nav.stories,
      description: dictionary.meta.stories.description,
      href: localizePath(locale, '/stories'),
    },
    {
      title: dictionary.nav.updates,
      description: dictionary.meta.updates.description,
      href: localizePath(locale, '/updates'),
    },
    {
      title: dictionary.nav.about,
      description: dictionary.meta.about.description,
      href: localizePath(locale, '/about'),
    },
    {
      title: dictionary.nav.contribute,
      description: dictionary.meta.contribute.description,
      href: localizePath(locale, '/contribute'),
    },
    {
      title: dictionary.nav.privacy,
      description: dictionary.meta.privacy.description,
      href: localizePath(locale, '/privacy'),
    },
  ];

  const matchedPages = pageCandidates.filter((page) =>
    normalizeSearchText(`${page.title} ${page.description}`).includes(term),
  );

  return {
    query,
    term,
    events: matchedEvents.slice(0, SEARCH_EVENT_LIMIT),
    eventTotal: matchedEvents.length,
    collections: matchedCollections,
    faq: matchedFaq,
    pages: matchedPages,
    total:
      matchedEvents.length +
      matchedCollections.length +
      matchedFaq.length +
      matchedPages.length,
  };
}
