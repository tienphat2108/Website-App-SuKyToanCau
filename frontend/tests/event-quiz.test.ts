import { describe, expect, it } from 'vitest';
import {
  buildQuizDeck,
  pickQuizQuestions,
  QUIZ_COUNTS,
  type QuizQuestionData,
} from '@/lib/event-quiz';
import { seedEvents, seedEventsBySlug } from '@/data/seed';
import { getDictionary } from '@/core/i18n/dictionary';

const vi = getDictionary('vi');
const en = getDictionary('en');

const DIRECT_IDS = ['year', 'era', 'country', 'location', 'date'];
const REVERSE_IDS = [
  'find-year',
  'find-era',
  'find-country',
  'find-location',
  'find-date',
];
const ORDERING_IDS = ['earliest-near', 'earliest-far', 'latest-near', 'latest-far'];

/**
 * Lấy một câu hỏi theo mã trong bộ dự phòng.
 * @param deck Bộ câu hỏi.
 * @param id Mã câu hỏi.
 * @returns Câu hỏi tương ứng, phải tồn tại.
 */
function getQuestion(deck: QuizQuestionData[], id: string): QuizQuestionData {
  const question = deck.find((item) => item.id === id);

  expect(question, id).toBeDefined();

  return question!;
}

describe('bộ câu hỏi dự phòng của bài viết', () => {
  const magnaCarta = seedEventsBySlug.get('magna-carta-1215');

  it('luôn có năm câu hỏi trực tiếp và năm câu hỏi ngược', () => {
    expect(magnaCarta).toBeDefined();

    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);

    expect(deck.slice(0, 5).map((question) => question.id)).toEqual(DIRECT_IDS);
    expect(deck.slice(5, 10).map((question) => question.id)).toEqual(REVERSE_IDS);
    expect(deck.length).toBeGreaterThanOrEqual(10);
    expect(new Set(deck.map((question) => question.id)).size).toBe(deck.length);
  });

  it('mỗi câu có bốn nhãn khác nhau và không lặp đáp án đúng', () => {
    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);

    for (const question of deck) {
      const labels = [question.correct, ...question.distractors];

      expect(question.distractors, question.id).toHaveLength(3);
      expect(new Set(labels).size, question.id).toBe(4);
      expect(question.distractors, question.id).not.toContain(question.correct);
      expect(question.prompt.length, question.id).toBeGreaterThan(0);
      expect(question.explanation.length, question.id).toBeGreaterThan(0);
    }
  });

  it('năm câu trực tiếp lấy đáp án từ dữ liệu của chính bài viết', () => {
    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);

    expect(getQuestion(deck, 'year').correct).toBe('1215');
    expect(getQuestion(deck, 'era').correct).toBe(magnaCarta!.eraName('vi'));
    expect(getQuestion(deck, 'country').correct).toBe(magnaCarta!.countryName('vi'));
    expect(getQuestion(deck, 'location').correct).toBe(magnaCarta!.location('vi'));
    expect(getQuestion(deck, 'date').correct).toBe(magnaCarta!.dateLabel('vi'));
  });

  it('năm câu hỏi ngược đều lấy tiêu đề bài viết làm đáp án đúng', () => {
    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);

    for (const id of REVERSE_IDS) {
      expect(getQuestion(deck, id).correct, id).toBe(magnaCarta!.title('vi'));
    }
  });

  it('câu hỏi thứ tự chỉ dùng sự kiện ở đúng một phía của mốc thời gian', () => {
    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);
    const byTitle = new Map(seedEvents.map((event) => [event.title('vi'), event]));

    for (const id of ['earliest-near', 'earliest-far']) {
      const question = getQuestion(deck, id);

      for (const title of question.distractors) {
        expect(byTitle.get(title)!.startYear, id).toBeGreaterThan(magnaCarta!.startYear);
      }
    }

    for (const id of ['latest-near', 'latest-far']) {
      const question = getQuestion(deck, id);

      for (const title of question.distractors) {
        expect(byTitle.get(title)!.startYear, id).toBeLessThan(magnaCarta!.startYear);
      }
    }
  });

  it('giữ nhãn trước Công nguyên cho sự kiện âm lịch', () => {
    const dongSon = seedEventsBySlug.get('van-hoa-dong-son-700-tcn');

    expect(dongSon).toBeDefined();

    const deck = buildQuizDeck(dongSon!, seedEvents, 'vi', vi);

    expect(getQuestion(deck, 'year').correct).toBe('700 TCN');
    expect(getQuestion(deck, 'find-year').prompt).toContain('700 TCN');

    const englishDeck = buildQuizDeck(dongSon!, seedEvents, 'en', en);
    expect(getQuestion(englishDeck, 'year').correct).toBe('700 BCE');
  });

  it('lặp lại cho cùng kết quả để máy chủ và trình duyệt khớp nhau', () => {
    const first = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);
    const second = buildQuizDeck(magnaCarta!, seedEvents, 'vi', vi);

    expect(second).toEqual(first);
  });

  it('toàn bộ kho dữ liệu đều có ít nhất mười câu hợp lệ', () => {
    const allowed = new Set([...DIRECT_IDS, ...REVERSE_IDS, ...ORDERING_IDS]);

    for (const event of seedEvents) {
      const deck = buildQuizDeck(event, seedEvents, 'vi', vi);

      expect(deck.length, event.slug).toBeGreaterThanOrEqual(10);

      for (const question of deck) {
        expect(allowed.has(question.id), `${event.slug}:${question.id}`).toBe(true);
        expect(question.distractors, `${event.slug}:${question.id}`).toHaveLength(3);
        expect(new Set([question.correct, ...question.distractors]).size, event.slug).toBe(4);
      }
    }
  });

  it('bản tiếng Anh dùng tên thời kỳ, quốc gia và địa điểm tiếng Anh', () => {
    const deck = buildQuizDeck(magnaCarta!, seedEvents, 'en', en);

    expect(getQuestion(deck, 'era').correct).toBe(magnaCarta!.eraName('en'));
    expect(getQuestion(deck, 'country').correct).toBe(magnaCarta!.countryName('en'));
    expect(getQuestion(deck, 'location').correct).toBe(magnaCarta!.location('en'));
    expect(getQuestion(deck, 'era').explanation).toContain(magnaCarta!.eraName('en'));
  });
});

describe('rút ngẫu nhiên bộ câu hỏi', () => {
  const deck = buildQuizDeck(seedEventsBySlug.get('magna-carta-1215')!, seedEvents, 'vi', vi);

  it('rút đúng số câu được chọn và không trùng mã', () => {
    for (const count of QUIZ_COUNTS) {
      const questions = pickQuizQuestions(deck, count, 'seed-a');

      expect(questions).toHaveLength(count);
      expect(new Set(questions.map((question) => question.id)).size).toBe(count);
    }
  });

  it('cùng hạt giống cho cùng bộ câu, khác hạt giống cho bộ khác', () => {
    const first = pickQuizQuestions(deck, 10, 'seed-a');
    const repeat = pickQuizQuestions(deck, 10, 'seed-a');
    const other = pickQuizQuestions(deck, 10, 'seed-b');

    expect(repeat).toEqual(first);
    expect(other).not.toEqual(first);
  });

  it('không lặp câu hỏi cùng dạng trong một bộ', () => {
    for (const seed of ['seed-a', 'seed-b', 'seed-c']) {
      const questions = pickQuizQuestions(deck, 10, seed);
      const prompts = questions.map((question) => question.prompt);

      expect(new Set(prompts).size, seed).toBe(10);
      expect(questions.filter((question) => question.id.startsWith('earliest-')).length, seed).toBeLessThanOrEqual(1);
      expect(questions.filter((question) => question.id.startsWith('latest-')).length, seed).toBeLessThanOrEqual(1);
    }
  });

  it('xáo phương án nhưng vẫn trỏ đúng đáp án của bộ dự phòng', () => {
    const questions = pickQuizQuestions(deck, 10, 'seed-c');

    for (const question of questions) {
      const source = getQuestion(deck, question.id);
      const labels = question.options.map((option) => option.label);
      const correct = question.options.find((option) => option.id === question.correctId);

      expect(question.options, question.id).toHaveLength(4);
      expect(new Set(labels).size, question.id).toBe(4);
      expect(correct?.label, question.id).toBe(source.correct);
      expect(labels.filter((label) => label === source.correct), question.id).toHaveLength(1);
    }
  });

  it('toàn bộ kho dữ liệu luôn rút đủ mười câu', () => {
    for (const event of seedEvents) {
      const eventDeck = buildQuizDeck(event, seedEvents, 'vi', vi);
      const questions = pickQuizQuestions(eventDeck, 10, `${event.slug}:check`);

      expect(questions, event.slug).toHaveLength(10);
      expect(new Set(questions.map((question) => question.id)).size, event.slug).toBe(10);
      expect(new Set(questions.map((question) => question.prompt)).size, event.slug).toBe(10);
    }
  });
});