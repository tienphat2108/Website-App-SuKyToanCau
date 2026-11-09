/**
 * Tiện ích cho tính năng "Ngày này năm xưa".
 * Dữ liệu sự kiện không có trường ngày tháng có cấu trúc nên mốc ngày được
 * đọc trực tiếp từ nhãn thời gian tiếng Việt đã biên tập.
 */

/** Ngày tháng của một sự kiện được đọc từ nhãn thời gian. */
export interface ParsedEventDate {
  /** Ngày bắt đầu trong tháng, từ 1 tới 31. */
  day: number;
  /** Ngày kết thúc khi sự kiện kéo dài nhiều ngày trong cùng một tháng. */
  dayEnd?: number;
  /** Tháng trong năm, từ 1 tới 12. */
  month: number;
  /** Năm diễn ra sự kiện. */
  year: number;
}

/** Các mẫu nhãn ngày hỗ trợ, thử theo thứ tự từ dạng dài tới dạng ngắn. */
const DATE_PATTERNS: ReadonlyArray<{
  regex: RegExp;
  build: (match: RegExpMatchArray) => ParsedEventDate;
}> = [
  {
    regex: /^Ngày (\d{1,2}) đến ngày (\d{1,2}) tháng (\d{1,2}) năm (-?\d+)/,
    build: (m) => ({ day: Number(m[1]), dayEnd: Number(m[2]), month: Number(m[3]), year: Number(m[4]) }),
  },
  {
    regex: /^Từ ngày (\d{1,2}) đến ngày (\d{1,2}) tháng (\d{1,2}) năm (-?\d+)/,
    build: (m) => ({ day: Number(m[1]), dayEnd: Number(m[2]), month: Number(m[3]), year: Number(m[4]) }),
  },
  {
    regex: /^Ngày (\d{1,2}) và (\d{1,2}) tháng (\d{1,2}) năm (-?\d+)/,
    build: (m) => ({ day: Number(m[1]), dayEnd: Number(m[2]), month: Number(m[3]), year: Number(m[4]) }),
  },
  {
    regex: /^Ngày (\d{1,2}) tháng (\d{1,2}) năm (-?\d+)/,
    build: (m) => ({ day: Number(m[1]), month: Number(m[2]), year: Number(m[3]) }),
  },
];

/**
 * Đọc ngày tháng từ nhãn thời gian tiếng Việt.
 * @param dateLabel Nhãn như "Ngày 30 tháng 4 năm 1975".
 * @returns Ngày tháng đã phân tích hoặc null khi nhãn không ghi ngày cụ thể.
 */
export function parseEventDate(dateLabel: string): ParsedEventDate | null {
  for (const pattern of DATE_PATTERNS) {
    const match = dateLabel.match(pattern.regex);
    if (match) {
      return pattern.build(match);
    }
  }

  return null;
}

/**
 * Kiểm tra một mốc ngày có trùng ngày hôm nay hay không, kể cả khoảng nhiều ngày.
 * @param parsed Mốc ngày đã phân tích.
 * @param day Ngày hôm nay.
 * @param month Tháng hôm nay.
 * @returns Đúng khi hôm nay nằm trong khoảng ngày của sự kiện.
 */
export function matchesDayMonth(parsed: ParsedEventDate, day: number, month: number): boolean {
  if (parsed.month !== month) {
    return false;
  }

  return day >= parsed.day && day <= (parsed.dayEnd ?? parsed.day);
}

/**
 * Tính số ngày còn lại tới ngày kỷ niệm tiếp theo của một sự kiện.
 * Dùng để gợi ý sự kiện sắp tới khi hôm nay không có gì trùng.
 * @param parsed Mốc ngày đã phân tích.
 * @param todayDay Ngày hôm nay.
 * @param todayMonth Tháng hôm nay.
 * @returns Số ngày từ 0 tới 365.
 */
export function daysUntil(parsed: ParsedEventDate, todayDay: number, todayMonth: number): number {
  const dayOfYear = (day: number, month: number): number => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let total = day;

    for (let index = 0; index < month - 1; index += 1) {
      total += daysInMonth[index];
    }

    return total;
  };

  const eventDay = dayOfYear(parsed.day, parsed.month);
  const today = dayOfYear(todayDay, todayMonth);
  const diff = eventDay - today;

  return diff >= 0 ? diff : diff + 365;
}
