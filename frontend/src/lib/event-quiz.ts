import { ERAS, type HistoricalEvent } from '@/core/models/HistoricalEvent';
import type { Locale } from '@/core/i18n/config';
import { formatMessage, type Dictionary } from '@/core/i18n/dictionary';

/** Các mức số câu người đọc có thể chọn. */
export const QUIZ_COUNTS = [5, 10] as const;

/** Số câu hợp lệ. */
export type QuizCount = (typeof QUIZ_COUNTS)[number];

/** Một phương án đã sẵn sàng hiển thị. */
export interface QuizOption {
  id: string;
  label: string;
}

/** Một câu hỏi đã bản địa hóa, dùng trực tiếp trong giao diện. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
}

/** Một câu hỏi trong bộ dự phòng, chưa xáo phương án. */
export interface QuizQuestionData {
  id: string;
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  family?: string;
}

/**
 * Băm chuỗi thành số nguyên dùng làm hạt giống xáo trộn.
 * @param value Chuỗi đầu vào.
 * @returns Số nguyên không dấu.
 */
function hashSeed(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * Tạo bộ sinh số giả ngẫu nhiên có hạt giống để kết quả lặp lại được.
 * @param seed Hạt giống.
 * @returns Hàm trả số trong khoảng [0, 1).
 */
function createRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Xáo trộn một bản sao của mảng theo hạt giống cố định.
 * @param items Mảng gốc, không bị sửa.
 * @param seed Chuỗi hạt giống.
 * @returns Mảng mới đã xáo trộn.
 */
function shuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  const random = createRandom(hashSeed(seed));

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }

  return result;
}

/**
 * Định dạng năm, kèm nhãn trước Công nguyên khi cần.
 * @param year Năm cần hiển thị.
 * @param dictionary Từ điển của ngôn ngữ đang dùng.
 * @returns Chuỗi năm đã định dạng.
 */
function formatYear(year: number, dictionary: Dictionary): string {
  return year < 0 ? `${Math.abs(year)} ${dictionary.event.sameYearBc}` : String(year);
}

/**
 * Lấy các nhãn khác nhau từ danh sách sự kiện, bỏ giá trị đáp án đúng.
 * @param events Danh sách sự kiện làm nguồn nhiễu.
 * @param read Hàm đọc nhãn theo ngôn ngữ.
 * @param correct Nhãn của đáp án đúng.
 * @param limit Số phương án nhiễu cần lấy.
 * @param seed Hạt giống xáo trộn.
 * @returns Danh sách nhãn nhiễu.
 */
function pickDistractors(
  events: HistoricalEvent[],
  read: (event: HistoricalEvent) => string,
  correct: string,
  limit: number,
  seed: string,
): string[] {
  const labels = [...new Set(events.map(read))].filter((label) => label && label !== correct);

  return shuffle(labels, seed).slice(0, limit);
}

/**
 * Lấy tiêu đề của các sự kiện khác, đã xáo trộn và loại trùng.
 * @param events Danh sách sự kiện ứng viên.
 * @param locale Ngôn ngữ đang hiển thị.
 * @param limit Số tiêu đề cần lấy.
 * @param seed Hạt giống xáo trộn.
 * @returns Danh sách tiêu đề.
 */
function pickTitles(
  events: HistoricalEvent[],
  locale: Locale,
  limit: number,
  seed: string,
): string[] {
  return shuffle(events, seed)
    .map((event) => event.title(locale))
    .filter((title) => title)
    .slice(0, limit);
}

/**
 * Lấy các năm gần năm của sự kiện nhất, mỗi năm một sự kiện đại diện.
 * @param event Sự kiện đang xem.
 * @param allEvents Toàn bộ sự kiện.
 * @param limit Số phương án nhiễu cần lấy.
 * @returns Danh sách nhãn năm, hoặc mảng rỗng nếu không đủ.
 */
function nearestYearLabels(
  event: HistoricalEvent,
  allEvents: HistoricalEvent[],
  limit: number,
  dictionary: Dictionary,
): string[] {
  const years = [
    ...new Set(
      allEvents
        .map((item) => item.startYear)
        .filter((year) => year !== event.startYear),
    ),
  ].sort(
    (left, right) =>
      Math.abs(left - event.startYear) - Math.abs(right - event.startYear) || left - right,
  );

  return years.length < limit
    ? []
    : years.slice(0, limit).map((year) => formatYear(year, dictionary));
}

/**
 * Chọn ba sự kiện ở một phía của sự kiện đang xem để làm phương án nhiễu thứ tự.
 * Mỗi năm chỉ lấy một sự kiện đại diện để phương án không trùng mốc thời gian.
 * @param event Sự kiện đang xem.
 * @param allEvents Toàn bộ sự kiện.
 * @param direction `earliest` lấy sự kiện sau, `latest` lấy sự kiện trước.
 * @param variant `near` lấy gần nhất, `far` lấy xa nhất.
 * @returns Danh sách sự kiện, hoặc null nếu không đủ ba mốc khác nhau.
 */
function extremeEvents(
  event: HistoricalEvent,
  allEvents: HistoricalEvent[],
  direction: 'earliest' | 'latest',
  variant: 'near' | 'far',
): HistoricalEvent[] | null {
  const later = direction === 'earliest';
  const byYear = new Map<number, HistoricalEvent>();

  for (const item of allEvents) {
    if (item.slug === event.slug) continue;
    if (later ? item.startYear <= event.startYear : item.startYear >= event.startYear) continue;
    if (!byYear.has(item.startYear)) {
      byYear.set(item.startYear, item);
    }
  }

  const years = [...byYear.keys()].sort((left, right) =>
    later ? left - right : right - left,
  );

  if (years.length < 3) return null;

  const picked = variant === 'near' ? years.slice(0, 3) : years.slice(-3);

  return picked.map((year) => byYear.get(year)!);
}

/**
 * Ghép đáp án đúng và phương án nhiễu thành một câu hỏi trong bộ dự phòng.
 * @param id Mã câu hỏi.
 * @param prompt Đề bài đã bản địa hóa.
 * @param correct Đáp án đúng.
 * @param distractors Phương án nhiễu.
 * @param explanation Lời giải đã bản địa hóa.
 * @returns Câu hỏi, hoặc null nếu không đủ hai phương án khác nhau.
 */
function createQuestion(
  id: string,
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
): QuizQuestionData | null {
  const unique = [...new Set([correct, ...distractors])];

  return unique.length < 2
    ? null
    : { id, prompt, correct, distractors: unique.filter((label) => label !== correct), explanation };
}

/**
 * Sinh bộ câu hỏi dự phòng cho một bài viết.
 *
 * Năm câu đầu hỏi thẳng các trường đã kiểm chứng của sự kiện, năm câu tiếp hỏi ngược
 * (chọn sự kiện khớp năm, thời kỳ, quốc gia, địa điểm, thời điểm) và bốn câu cuối so
 * sánh thứ tự thời gian. Mọi phương án nhiễu đều lấy từ sự kiện khác trong kho dữ
 * liệu, nên không có chi tiết nào do máy tự nghĩ ra.
 *
 * Bộ này cố định theo sự kiện và ngôn ngữ; việc rút ngẫu nhiên 5 hoặc 10 câu diễn ra
 * ở trình duyệt để mỗi lần mở trang lại có đề khác.
 *
 * @param event Sự kiện đang xem.
 * @param allEvents Toàn bộ sự kiện dùng làm nguồn phương án nhiễu.
 * @param locale Ngôn ngữ đang hiển thị.
 * @param dictionary Từ điển tương ứng.
 * @returns Danh sách câu hỏi dự phòng đã bản địa hóa.
 */
export function buildQuizDeck(
  event: HistoricalEvent,
  allEvents: HistoricalEvent[],
  locale: Locale,
  dictionary: Dictionary,
): QuizQuestionData[] {
  const others = allEvents.filter((item) => item.slug !== event.slug);
  const title = event.title(locale);
  const date = event.dateLabel(locale);
  const era = event.eraName(locale);
  const country = event.countryName(locale);
  const location = event.location(locale);
  const seed = `${event.slug}:${locale}`;
  const messages = dictionary.event;
  const eraLabel = (item: (typeof ERAS)[number]): string =>
    locale === 'en' ? item.nameEn : item.nameVi;
  const questions: Array<QuizQuestionData | null> = [];

  questions.push(
    createQuestion(
      'year',
      formatMessage(messages.quizQuestionYear, { title }),
      formatYear(event.startYear, dictionary),
      nearestYearLabels(event, allEvents, 3, dictionary),
      formatMessage(messages.quizExplainYear, { date }),
    ),
    createQuestion(
      'era',
      formatMessage(messages.quizQuestionEra, { title }),
      era,
      ERAS.filter((item) => item.key !== event.era).map(eraLabel),
      formatMessage(messages.quizExplainEra, { answer: era }),
    ),
    createQuestion(
      'country',
      formatMessage(messages.quizQuestionCountry, { title }),
      country,
      pickDistractors(others, (item) => item.countryName(locale), country, 3, `${seed}:country`),
      formatMessage(messages.quizExplainCountry, { answer: country }),
    ),
    createQuestion(
      'location',
      formatMessage(messages.quizQuestionLocation, { title }),
      location,
      pickDistractors(others, (item) => item.location(locale), location, 3, `${seed}:location`),
      formatMessage(messages.quizExplainLocation, { answer: location }),
    ),
    createQuestion(
      'date',
      formatMessage(messages.quizQuestionDate, { title }),
      date,
      pickDistractors(others, (item) => item.dateLabel(locale), date, 3, `${seed}:date`),
      formatMessage(messages.quizExplainDate, { answer: date }),
    ),
  );

  const sameYear = others.filter((item) => item.startYear !== event.startYear);
  const otherEras = others.filter((item) => item.era !== event.era);
  const otherCountries = others.filter((item) => item.countryName(locale) !== country);
  const otherLocations = others.filter((item) => item.location(locale) !== location);
  const otherDates = others.filter((item) => item.dateLabel(locale) !== date);

  questions.push(
    createQuestion(
      'find-year',
      formatMessage(messages.quizQuestionFindYear, { year: formatYear(event.startYear, dictionary) }),
      title,
      pickTitles(sameYear, locale, 3, `${seed}:find-year`),
      formatMessage(messages.quizExplainFindYear, { title, date }),
    ),
    createQuestion(
      'find-era',
      formatMessage(messages.quizQuestionFindEra, { era }),
      title,
      pickTitles(otherEras, locale, 3, `${seed}:find-era`),
      formatMessage(messages.quizExplainFindEra, { title, era }),
    ),
    createQuestion(
      'find-country',
      formatMessage(messages.quizQuestionFindCountry, { country }),
      title,
      pickTitles(otherCountries, locale, 3, `${seed}:find-country`),
      formatMessage(messages.quizExplainFindCountry, { title, country }),
    ),
    createQuestion(
      'find-location',
      formatMessage(messages.quizQuestionFindLocation, { location }),
      title,
      pickTitles(otherLocations, locale, 3, `${seed}:find-location`),
      formatMessage(messages.quizExplainFindLocation, { title, location }),
    ),
    createQuestion(
      'find-date',
      formatMessage(messages.quizQuestionFindDate, { date }),
      title,
      pickTitles(otherDates, locale, 3, `${seed}:find-date`),
      formatMessage(messages.quizExplainFindDate, { title, date }),
    ),
  );

  const ordering = [
    { id: 'earliest-near', direction: 'earliest', variant: 'near' },
    { id: 'earliest-far', direction: 'earliest', variant: 'far' },
    { id: 'latest-near', direction: 'latest', variant: 'near' },
    { id: 'latest-far', direction: 'latest', variant: 'far' },
  ] as const;

  for (const item of ordering) {
    const pool = extremeEvents(event, allEvents, item.direction, item.variant);

    if (!pool) continue;

    const question = createQuestion(
      item.id,
      messages[item.direction === 'earliest' ? 'quizQuestionEarliest' : 'quizQuestionLatest'],
      title,
      pool.map((candidate) => candidate.title(locale)),
      formatMessage(
        messages[item.direction === 'earliest' ? 'quizExplainEarliest' : 'quizExplainLatest'],
        { title, date },
      ),
    );

    if (question) {
      questions.push({ ...question, family: item.direction });
    }
  }

  return questions.filter((question): question is QuizQuestionData => question !== null);
}

/**
 * Rút ngẫu nhiên một số câu từ bộ dự phòng và xáo cả thứ tự câu lẫn phương án.
 *
 * Cùng một hạt giống luôn cho cùng kết quả, nên lần dựng máy chủ và lần chạy lại
 * khớp nhau; trình duyệt truyền hạt giống mới mỗi lần mở trang để đề thay đổi.
 *
 * @param deck Bộ câu hỏi dự phòng của bài viết.
 * @param count Số câu cần lấy.
 * @param seed Hạt giống xáo trộn.
 * @returns Danh sách câu hỏi đã xáo, không nhiều hơn số câu trong bộ dự phòng.
 */
export function pickQuizQuestions(
  deck: QuizQuestionData[],
  count: number,
  seed: string,
): QuizQuestion[] {
  const total = Math.max(0, Math.min(Math.floor(count), deck.length));
  const picked: QuizQuestionData[] = [];
  const families = new Set<string>();

  // Hai biến thể "sớm nhất"/"muộn nhất" dùng chung một câu hỏi; chỉ lấy một biến thể
  // mỗi họ để đề không có hai câu trùng chữ.
  for (const item of shuffle(deck, `${seed}:questions`)) {
    const family = item.family ?? item.id;

    if (families.has(family)) continue;

    families.add(family);
    picked.push(item);

    if (picked.length === total) break;
  }

  return picked.map((item) => {
      const labels = shuffle(
        [item.correct, ...item.distractors],
        `${seed}:${item.id}:options`,
      );
      const options = labels.map((label, index) => ({ id: `${item.id}-${index}`, label }));
      const correctId = options[labels.indexOf(item.correct)].id;

      return {
        id: item.id,
        prompt: item.prompt,
        options,
        correctId,
        explanation: item.explanation,
      };
    });
}