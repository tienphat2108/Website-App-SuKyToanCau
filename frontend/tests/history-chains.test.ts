import { describe, expect, it } from 'vitest';
import { seedEvents, seedEventsBySlug } from '@/data/seed';
import { HISTORY_CHAINS, findChainsForEvent, resolveChainEvents } from '@/data/history-chains';

describe('chuỗi nhân quả', () => {
  it('mỗi chuỗi đều có tiêu đề và mô tả song ngữ không rỗng', () => {
    for (const chain of HISTORY_CHAINS) {
      expect(chain.titleVi.length).toBeGreaterThan(0);
      expect(chain.titleEn.length).toBeGreaterThan(0);
      expect(chain.descriptionVi.length).toBeGreaterThan(0);
      expect(chain.descriptionEn.length).toBeGreaterThan(0);
    }
  });

  it('mọi khóa sự kiện trong chuỗi đều tồn tại trong kho dữ liệu', () => {
    for (const chain of HISTORY_CHAINS) {
      for (const slug of chain.eventSlugs) {
        expect(seedEventsBySlug.has(slug), `thiếu sự kiện ${slug} trong chuỗi ${chain.slug}`).toBe(true);
      }
    }
  });

  it('không có khóa sự kiện nào lặp trong cùng một chuỗi', () => {
    for (const chain of HISTORY_CHAINS) {
      expect(new Set(chain.eventSlugs).size).toBe(chain.eventSlugs.length);
    }
  });

  it('mỗi chuỗi có ít nhất ba bước và các bước tăng dần theo thời gian', () => {
    for (const chain of HISTORY_CHAINS) {
      const events = resolveChainEvents(chain, seedEvents);
      expect(events).toHaveLength(chain.eventSlugs.length);
      expect(events.length).toBeGreaterThanOrEqual(3);

      for (let index = 1; index < events.length; index += 1) {
        expect(events[index].startYear).toBeGreaterThanOrEqual(events[index - 1].startYear);
      }
    }
  });

  it('giữ đúng thứ tự đọc của chuỗi khi đổi khóa thành sự kiện', () => {
    const chain = HISTORY_CHAINS[0];
    const events = resolveChainEvents(chain, seedEvents);
    expect(events.map((event) => event.slug)).toEqual([...chain.eventSlugs]);
  });

  it('tìm đúng chuỗi chứa sự kiện và trả rỗng khi sự kiện không thuộc chuỗi nào', () => {
    const bachDangChains = findChainsForEvent('chien-thang-bach-dang-938');
    expect(bachDangChains.map((chain) => chain.slug)).toEqual(['bac-thuoc-den-doc-lap']);

    const apolloChains = findChainsForEvent('apollo-11-1969');
    expect(apolloChains.map((chain) => chain.slug)).toEqual(['chay-dua-vu-tru']);

    expect(findChainsForEvent('doi-moi-1986')).toEqual([]);
  });
});
