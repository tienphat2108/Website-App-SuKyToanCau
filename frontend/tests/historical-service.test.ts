import { describe, expect, it, vi } from 'vitest';
import { HistoricalService, filterSeedEvents, findSameYearWorldEvents } from '@/services/historical.service';
import { HistoricalEvent } from '@/core/models/HistoricalEvent';
import { seedEvents } from '@/data/seed';
import type { ApiClient } from '@/services/api.client';

/** Sự kiện thử nghiệm đặt ở năm 4000: toàn bộ kho dữ liệu hiện tại đều kết thúc trước năm đó. */
const suKienCachBiet = new HistoricalEvent({
  slug: 'su-kien-cach-biet',
  era: 'hien-dai',
  country: 'Việt Nam',
  countryEn: 'Vietnam',
  startYear: 4000,
  endYear: null,
  dateLabelVi: 'Năm 4000',
  dateLabelEn: '4000 CE',
  titleVi: 'Sự kiện cách biệt',
  titleEn: 'Isolated event',
  summaryVi: 'Dùng để kiểm tra trường hợp không có sự kiện giao năm.',
  summaryEn: 'Used to check the case with no overlapping years.',
  contentVi: ['Đoạn một.'],
  contentEn: ['Paragraph one.'],
  locationVi: 'Hà Nội',
  locationEn: 'Hanoi',
  latitude: 21,
  longitude: 105,
  imagePath: '/images/hien-dai.svg',
  imageAltVi: 'Minh họa',
  imageAltEn: 'Illustration',
  tagsVi: ['Thử nghiệm'],
  tagsEn: ['Testing'],
  featured: false,
  relatedSlugs: [],
});

describe('lọc dữ liệu dự phòng', () => {
  it('trả về toàn bộ khi không có bộ lọc, sắp xếp từ cổ đến kim', () => {
    const page = filterSeedEvents(seedEvents, { pageSize: 200 });
    const latestYear = Math.max(...seedEvents.map((event) => event.startYear));

    expect(page.total).toBe(seedEvents.length);
    expect(page.items[0]?.slug).toBe('cach-mang-nong-nghiep-10000-tcn');
    expect(page.items.at(-1)?.startYear).toBe(latestYear);
    expect(page.items.every((event, index) => index === 0 || event.startYear >= page.items[index - 1].startYear)).toBe(true);
  });

  it('lọc theo thời kỳ', () => {
    const page = filterSeedEvents(seedEvents, { era: 'hien-dai', pageSize: 48 });

    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((event) => event.era === 'hien-dai')).toBe(true);
  });

  it('lọc theo quốc gia bằng cả tên tiếng Việt và tiếng Anh', () => {
    const vietnam = filterSeedEvents(seedEvents, { country: 'việt nam', pageSize: 200 });
    const france = filterSeedEvents(seedEvents, { country: 'france', pageSize: 200 });
    const francePlain = filterSeedEvents(seedEvents, { country: 'Pháp', pageSize: 200 });
    const soSuKienPhap = seedEvents.filter((event) => event.countryEn === 'France').length;

    expect(vietnam.total).toBeGreaterThan(0);
    expect(vietnam.items.every((event) => event.country === 'Việt Nam')).toBe(true);
    expect(soSuKienPhap).toBeGreaterThan(1);
    expect(france.total).toBe(soSuKienPhap);
    expect(france.items.every((event) => event.country === 'Pháp')).toBe(true);
    expect(francePlain.items.map((event) => event.slug)).toEqual(france.items.map((event) => event.slug));
    expect(france.items.map((event) => event.slug)).toContain('cach-mang-phap-1789');
  });

  it('tìm kiếm không phân biệt hoa thường và dấu tiếng Việt', () => {
    const accented = filterSeedEvents(seedEvents, { search: 'bạch đằng', pageSize: 48 });
    const plain = filterSeedEvents(seedEvents, { search: 'bach dang', pageSize: 48 });

    expect(accented.total).toBeGreaterThanOrEqual(1);
    expect(accented.items.map((event) => event.slug)).toContain('chien-thang-bach-dang-938');
    expect(plain.total).toBe(accented.total);
    expect(plain.items.map((event) => event.slug)).toContain('chien-thang-bach-dang-938');
  });

  it('lọc theo khoảng năm và sự kiện nổi bật', () => {
    const page = filterSeedEvents(seedEvents, {
      fromYear: 1900,
      toYear: 2000,
      featured: true,
      pageSize: 48,
    });

    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((event) => event.startYear >= 1900 && event.startYear <= 2000)).toBe(true);
    expect(page.items.every((event) => event.featured)).toBe(true);
  });

  it('phân trang và báo tổng số trang', () => {
    const first = filterSeedEvents(seedEvents, { page: 1, pageSize: 5 });
    const second = filterSeedEvents(seedEvents, { page: 2, pageSize: 5 });

    expect(first.items).toHaveLength(5);
    expect(first.totalPages).toBe(Math.ceil(seedEvents.length / 5));
    expect(second.items[0]?.slug).not.toBe(first.items[0]?.slug);
  });

  it('giới hạn kích thước trang trong khoảng an toàn', () => {
    const page = filterSeedEvents(seedEvents, { pageSize: 999 });

    expect(page.pageSize).toBe(200);
  });
});

describe('sự kiện quốc tế cùng năm', () => {
  it('tìm sự kiện quốc gia khác diễn ra cùng năm', () => {
    const event = seedEvents.find((item) => item.slug === 'cach-mang-thang-tam-1945');
    expect(event).toBeDefined();

    const matches = findSameYearWorldEvents(seedEvents, event!, 3);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((item) => item.event.country !== 'Việt Nam')).toBe(true);
    expect(matches.some((item) => item.event.slug === 'lien-hop-quoc-1945')).toBe(true);
    expect(matches.every((item) => item.year === 1945)).toBe(true);
  });

  it('ưu tiên sự kiện trùng đúng năm bắt đầu', () => {
    const event = seedEvents.find((item) => item.slug === 'doi-moi-1986');
    expect(event).toBeDefined();

    const [first] = findSameYearWorldEvents(seedEvents, event!, 3);

    expect(first?.event.slug).toBe('chernobyl-1986');
    expect(first?.exactStart).toBe(true);
    expect(first?.year).toBe(1986);
  });

  it('không trả về sự kiện cùng quốc gia hoặc chính sự kiện đang xem', () => {
    const event = seedEvents.find((item) => item.slug === 'binh-thuong-hoa-viet-my-1995');
    expect(event).toBeDefined();

    const matches = findSameYearWorldEvents(seedEvents, event!, 5);

    expect(matches.some((item) => item.event.slug === event!.slug)).toBe(false);
    expect(matches.some((item) => item.event.country === event!.country)).toBe(false);
    expect(matches.some((item) => item.event.slug === 'wto-thanh-lap-1995')).toBe(true);
  });

  it('trả về danh sách rỗng khi không có sự kiện giao khoảng năm', () => {
    expect(findSameYearWorldEvents(seedEvents, suKienCachBiet, 3)).toEqual([]);
  });

  it('bỏ sự kiện cùng quốc gia khi khoảng năm giao nhau', () => {
    const giza = seedEvents.find((item) => item.slug === 'kim-tu-thap-giza-2560-tcn');
    expect(giza).toBeDefined();

    const matches = findSameYearWorldEvents(seedEvents, giza!, 3);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((item) => item.event.country !== giza!.country)).toBe(true);
    expect(matches.every((item) => item.year === -2560)).toBe(true);
  });
});

describe('HistoricalService', () => {
  it('dùng dữ liệu mẫu khi API lỗi', async () => {
    const client = {
      get: vi.fn().mockRejectedValue(new Error('offline')),
      post: vi.fn(),
    } as unknown as ApiClient;

    const service = new HistoricalService(client);
    const page = await service.getAll();

    expect(page).toHaveLength(seedEvents.length);
  });

  it('yêu cầu tối đa 200 bản ghi khi tải toàn bộ', async () => {
    const get = vi.fn().mockResolvedValue(null);
    const service = new HistoricalService({ get, post: vi.fn() } as unknown as ApiClient);

    await service.getAll();

    expect(get.mock.calls[0][0]).toContain('pageSize=200');
  });

  it('bổ sung sự kiện liên quan khi API không trả về', async () => {
    const client = {
      get: vi.fn().mockResolvedValue(null),
      post: vi.fn(),
    } as unknown as ApiClient;

    const service = new HistoricalService(client);
    const event = await service.getBySlug('chien-thang-bach-dang-938');

    expect(event).not.toBeNull();
    expect(event?.related.length).toBeGreaterThan(0);
    expect(event?.related.every((item) => item.slug !== event.slug)).toBe(true);
  });

  it('trả về null khi không tìm thấy sự kiện', async () => {
    const client = {
      get: vi.fn().mockResolvedValue(null),
      post: vi.fn(),
    } as unknown as ApiClient;

    const service = new HistoricalService(client);
    const event = await service.getBySlug('khong-ton-tai');

    expect(event).toBeNull();
  });

  it('tự tính số liệu khi API không phản hồi', async () => {
    const client = {
      get: vi.fn().mockRejectedValue(new Error('offline')),
      post: vi.fn(),
    } as unknown as ApiClient;

    const service = new HistoricalService(client);
    const stats = await service.getStats();

    expect(stats.totalEvents).toBe(seedEvents.length);
    expect(stats.totalEras).toBe(4);
    expect(stats.totalCountries).toBeGreaterThan(1);
  });

  it('danh sách quốc gia không trùng lặp và sắp xếp theo tiếng Việt', async () => {
    const client = {
      get: vi.fn().mockRejectedValue(new Error('offline')),
      post: vi.fn(),
    } as unknown as ApiClient;

    const service = new HistoricalService(client);
    const events = await service.getAll();
    const countries = service.getCountries(events);

    expect(countries.length).toBe(new Set(countries.map((item) => item.vi)).size);
    expect(countries[0]?.vi.localeCompare(countries[1]?.vi ?? '', 'vi')).toBeLessThanOrEqual(0);
  });
});
