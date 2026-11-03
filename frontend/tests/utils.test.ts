import { describe, expect, it } from 'vitest';
import {
  createShareLinks,
  formatHistoricalYear,
  formatNumber,
  formatYearRange,
  getInitials,
  normalizeSearchText,
  readingTime,
  serializeJsonLd,
  truncate,
} from '@/utils/format';
import { CONTACT_EMAIL, contactMailto } from '@/utils/site';

describe('định dạng năm lịch sử', () => {
  it('hiển thị năm trước Công nguyên theo ngôn ngữ', () => {
    expect(formatHistoricalYear(-2879, 'vi')).toBe('2879 TCN');
    expect(formatHistoricalYear(-2879, 'en')).toBe('2879 BCE');
    expect(formatHistoricalYear(1945, 'vi')).toBe('1945');
  });

  it('ghép khoảng năm và bỏ phần trùng', () => {
    expect(formatYearRange(1000, 1801, 'vi')).toBe('1000 – 1801');
    expect(formatYearRange(938, null, 'vi')).toBe('938');
    expect(formatYearRange(40, null, 'en')).toBe('40');
  });

  it('định dạng số theo ngôn ngữ', () => {
    expect(formatNumber(20000, 'vi')).toMatch(/20\.000/);
    expect(formatNumber(20000, 'en')).toBe('20,000');
  });
});

describe('tiện ích văn bản', () => {
  it('ước lượng thời gian đọc tối thiểu một phút', () => {
    expect(readingTime([])).toBe(1);
    expect(readingTime(['một hai ba'])).toBe(1);
    expect(readingTime([Array.from({ length: 450 }, () => 'từ').join(' ')])).toBe(3);
  });

  it('rút gọn tại ranh giới từ', () => {
    expect(truncate('Một câu ngắn', 50)).toBe('Một câu ngắn');
    expect(truncate('Một câu dài hơn giới hạn', 12)).toBe('Một câu dài…');
  });

  it('lấy chữ cái đầu của tên', () => {
    expect(getInitials('Nguyễn Minh Anh')).toBe('NM');
    expect(getInitials('  An  ')).toBe('A');
  });

  it('chuẩn hóa tiếng Việt để tìm kiếm không dấu', () => {
    expect(normalizeSearchText('Bạch Đằng')).toBe('bach dang');
    expect(normalizeSearchText('Điện Biên Phủ')).toBe('dien bien phu');
    expect(normalizeSearchText('HÀ NỘI')).toBe('ha noi');
  });
});

describe('liên kết thư đóng góp', () => {
  it('dùng hộp thư công khai của website', () => {
    expect(CONTACT_EMAIL).toBe('sukytoancau@gmail.com');
  });

  it('mã hóa tiêu đề thư', () => {
    const href = contactMailto('Đóng góp cho Sử Ký Toàn Cầu');

    expect(href.startsWith(`mailto:${CONTACT_EMAIL}?subject=`)).toBe(true);
    expect(href).toContain(encodeURIComponent('Đóng góp cho Sử Ký Toàn Cầu'));
  });
});

describe('an toàn dữ liệu có cấu trúc', () => {
  it('mã hóa ký tự có thể đóng thẻ script', () => {
    const json = serializeJsonLd({ title: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('</script>');
    expect(json).toContain('\\u003c');
  });

  it('tạo liên kết chia sẻ đã mã hóa', () => {
    const links = createShareLinks('https://example.com/bai viet', 'Tiêu đề & thử');

    expect(links.facebook).toContain(encodeURIComponent('https://example.com/bai viet'));
    expect(links.x).toContain(encodeURIComponent('Tiêu đề & thử'));
  });
});
