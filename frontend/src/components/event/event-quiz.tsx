'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  pickQuizQuestions,
  QUIZ_COUNTS,
  type QuizCount,
  type QuizQuestion,
  type QuizQuestionData,
} from '@/lib/event-quiz';

/** Các chuỗi giao diện của khối trắc nghiệm, đã bản địa hóa ở phía máy chủ. */
export interface EventQuizLabels {
  eyebrow: string;
  title: string;
  intro: string;
  countLegend: string;
  countOption: string;
  submit: string;
  retry: string;
  score: string;
  perfect: string;
  correct: string;
  incorrect: string;
  correctAnswer: string;
  needAll: string;
}

/**
 * Thay biến dạng {ten} trong chuỗi, giữ nguyên biến nếu thiếu giá trị.
 * @param template Chuỗi gốc.
 * @param values Bản đồ giá trị.
 * @returns Chuỗi đã thay thế.
 */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Tạo hạt giống mới cho mỗi lần mở trang.
 * @returns Chuỗi ngẫu nhiên dùng để chọn và xáo câu hỏi.
 */
function createSeed(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = crypto.getRandomValues(new Uint32Array(2));

    return `${values[0].toString(36)}${values[1].toString(36)}`;
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

/**
 * Khối trắc nghiệm ôn tập ngay trong bài viết.
 *
 * Bộ câu hỏi dự phòng do máy chủ dựng từ chính dữ liệu của sự kiện; thành phần này
 * rút ngẫu nhiên 5 hoặc 10 câu mỗi lần mở trang, khi quay lại từ bộ nhớ đệm trình
 * duyệt hoặc khi đổi số câu. Phản hồi đúng sai luôn có chữ và biểu tượng, không dựa
 * riêng vào màu, và điểm số được đọc lên sau khi chấm.
 * @param props.deck Bộ câu hỏi dự phòng đã bản địa hóa.
 * @param props.labels Chuỗi giao diện theo ngôn ngữ đang hiển thị.
 */
export function EventQuiz({
  deck,
  labels,
}: {
  deck: QuizQuestionData[];
  labels: EventQuizLabels;
}) {
  const [count, setCount] = useState<QuizCount>(QUIZ_COUNTS[0]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    pickQuizQuestions(deck, QUIZ_COUNTS[0], 'initial'),
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const fieldsetRefs = useRef<Array<HTMLFieldSetElement | null>>([]);
  const scoreRef = useRef<HTMLParagraphElement | null>(null);

  // Bản dựng máy chủ dùng hạt giống cố định để khớp khi thủy hợp; sau đó đổi sang
  // bộ ngẫu nhiên. Khối đang đóng lúc này nên người đọc không thấy nội dung nhảy.
  useEffect(() => {
    setQuestions(pickQuizQuestions(deck, QUIZ_COUNTS[0], createSeed()));
    setAnswers({});
    setSubmitted(false);
    setError('');
  }, [deck]);

  // Quay lại bằng nút Trước/Sau có thể phục hồi trang từ bộ nhớ đệm, không chạy lại
  // hiệu ứng gắn kết; đổi đề ngay khi trang được phục hồi để không lặp lại đề cũ.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent): void => {
      if (!event.persisted) return;

      setQuestions(pickQuizQuestions(deck, count, createSeed()));
      setAnswers({});
      setSubmitted(false);
      setError('');
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [deck, count]);

  const total = questions.length;
  const correctCount = questions.filter(
    (question) => answers[question.id] === question.correctId,
  ).length;
  const scoreText =
    correctCount === total
      ? fill(labels.perfect, { total })
      : fill(labels.score, { score: correctCount, total });

  useEffect(() => {
    if (submitted) {
      scoreRef.current?.focus();
    }
  }, [submitted]);

  // <details> không tự mở khi liên kết trong trang nhảy tới nó, nên mục lục
  // trỏ tới #trac-nghiem phải mở khối ra thay vì chỉ cuộn tới một khung đóng.
  // Nghe cả cú bấm vì bấm lại khi địa chỉ đã sẵn #trac-nghiem không phát hashchange.
  useEffect(() => {
    const details = detailsRef.current;

    if (!details) {
      return;
    }

    const openFromHash = (): void => {
      if (window.location.hash === '#trac-nghiem') {
        details.open = true;
      }
    };

    const openFromToc = (event: MouseEvent): void => {
      if ((event.target as Element | null)?.closest?.('a[href="#trac-nghiem"]')) {
        details.open = true;
      }
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    document.addEventListener('click', openFromToc);

    return () => {
      window.removeEventListener('hashchange', openFromHash);
      document.removeEventListener('click', openFromToc);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const missingIndex = questions.findIndex((question) => !answers[question.id]);

    if (missingIndex >= 0) {
      setError(fill(labels.needAll, { total }));
      fieldsetRefs.current[missingIndex]?.focus();

      return;
    }

    setError('');
    setSubmitted(true);
  };

  const handleReset = (): void => {
    setAnswers({});
    setSubmitted(false);
    setError('');
    requestAnimationFrame(() => fieldsetRefs.current[0]?.focus());
  };

  const handleCountChange = (value: QuizCount): void => {
    if (value === count) {
      return;
    }

    setCount(value);
    setQuestions(pickQuizQuestions(deck, value, createSeed()));
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  return (
    <details
      id="trac-nghiem"
      ref={detailsRef}
      className="group relative mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-line/80 bg-surface"
    >
      <span
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-accent to-accent-strong"
        aria-hidden="true"
      />

      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <span className="block">
          <span className="block font-ui text-[0.8125rem] font-medium text-gold">
            {labels.eyebrow}
          </span>
          <h2
            id="trac-nghiem-title"
            className="mt-1.5 font-display text-xl font-semibold text-ink"
          >
            {labels.title}
          </h2>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span
            className="hidden h-10 w-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold sm:grid"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M9 11.5l2.2 2.2L15.5 9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3.5l2.1 1.6 2.6-.2 1 2.4 2.2 1.4-.6 2.6 1.3 2.3-1.9 1.8-.4 2.6-2.5.7-1.7 2-2.4-1-2.5.7-1.6-2.1-2.5-.8-.1-2.6-1.7-2 1.3-2.3-.7-2.5 2.2-1.4 1.1-2.4 2.6.2L12 3.5Z" />
            </svg>
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="text-[0.875rem] leading-relaxed text-muted">{labels.intro}</p>

        <fieldset className="mt-4">
          <legend className="font-ui text-[0.8125rem] font-semibold text-muted">
            {labels.countLegend}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUIZ_COUNTS.map((value) => {
              const active = value === count;

              return (
                <label
                  key={value}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[0.875rem] transition',
                    active
                      ? 'border-accent/60 bg-accent-soft/40 text-ink'
                      : 'border-line/70 bg-surface text-muted hover:border-gold/40',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="quiz-count"
                    value={value}
                    checked={active}
                    onChange={() => handleCountChange(value)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span>{fill(labels.countOption, { count: value })}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <form className="mt-5" onSubmit={handleSubmit} noValidate>
        <ol className="space-y-4">
          {questions.map((question, index) => {
            const chosen = answers[question.id];
            const correctLabel =
              question.options.find((option) => option.id === question.correctId)?.label ?? '';
            const isRight = chosen === question.correctId;

            return (
              <li key={question.id}>
                <fieldset
                  ref={(element) => {
                    fieldsetRefs.current[index] = element;
                  }}
                  tabIndex={-1}
                  className="rounded-xl border border-line/70 bg-raised/30 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <legend className="px-1 font-ui text-[0.9375rem] font-semibold leading-snug text-ink">
                    <span className="mr-1.5 text-accent">{index + 1}.</span>{' '}
                    {question.prompt}
                  </legend>

                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => {
                      const selected = option.id === chosen;
                      const showCorrect = submitted && option.id === question.correctId;
                      const showWrong = submitted && selected && option.id !== question.correctId;

                      return (
                        <label
                          key={option.id}
                          className={[
                            'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-[0.9375rem] transition',
                            showCorrect
                              ? 'border-gold bg-gold-soft/50'
                              : showWrong
                                ? 'border-accent bg-accent-soft/60'
                                : selected
                                  ? 'border-accent/60 bg-accent-soft/40'
                                  : 'border-line/70 bg-surface hover:border-gold/40',
                            submitted ? 'cursor-default' : 'cursor-pointer',
                          ].join(' ')}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={selected}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: option.id,
                              }))
                            }
                            className="mt-1 h-4 w-4 shrink-0 accent-accent"
                          />
                          <span className="min-w-0 flex-1 leading-snug text-ink">
                            {option.label}
                          </span>
                          {showCorrect ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              className="mt-0.5 shrink-0 text-gold"
                              aria-hidden="true"
                            >
                              <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                          {showWrong ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              className="mt-0.5 shrink-0 text-accent"
                              aria-hidden="true"
                            >
                              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                            </svg>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>

                  {submitted ? (
                    <p className="mt-3 border-t border-line/60 pt-3 text-[0.875rem] leading-relaxed text-muted">
                      <span className={isRight ? 'font-semibold text-ink' : 'font-semibold text-accent'}>
                        {isRight ? labels.correct : labels.incorrect}
                      </span>{' '}
                      {isRight ? null : fill(labels.correctAnswer, { answer: correctLabel })}{' '}
                      {question.explanation}
                    </p>
                  ) : null}
                </fieldset>
              </li>
            );
          })}
        </ol>

        {error ? (
          <p role="alert" className="mt-4 text-[0.9375rem] font-medium text-accent">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          {submitted ? (
            <button type="button" onClick={handleReset} className="btn-secondary">
              {labels.retry}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              {labels.submit}
            </button>
          )}

          <p
            ref={scoreRef}
            tabIndex={-1}
            aria-live="polite"
            className="text-[0.9375rem] font-semibold leading-snug text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitted ? scoreText : ''}
          </p>
        </div>
      </form>
      </div>
    </details>
  );
}
