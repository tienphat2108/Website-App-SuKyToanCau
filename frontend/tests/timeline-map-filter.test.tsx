import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TimelineExplorer } from '@/components/timeline/timeline-explorer';
import { I18nProvider } from '@/components/providers/i18n-provider';
import type { EventCardModel } from '@/core/presenters/event.presenter';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => '/timeline',
}));

// jsdom chưa có matchMedia; nét dòng thời gian đọc nó khi quay lại chế độ dòng thời gian.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Hiệu ứng lộ dần của danh sách dòng thời gian dùng IntersectionObserver, jsdom chưa có.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = () => [];
    root = null;
    rootMargin = '';
    thresholds = [];
  },
);

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/map/map-panel', () => ({
  MapPanel: ({ markers }: { markers: Array<{ slug: string }> }) => (
    <div data-testid="map-panel">
      {markers.map((marker) => (
        <span key={marker.slug}>{marker.slug}</span>
      ))}
    </div>
  ),
}));

/** Hai sự kiện khác thời kỳ để kiểm tra lọc ngay trên bản đồ. */
const events: EventCardModel[] = [
  {
    slug: 'chien-thang-bach-dang',
    href: '/event/chien-thang-bach-dang',
    era: 'trung-dai',
    eraName: 'Trung đại',
    country: 'Việt Nam',
    countryKey: 'Việt Nam',
    dateLabel: 'Năm 938',
    title: 'Chiến thắng Bạch Đằng',
    summary: 'Ngô Quyền đánh bại quân Nam Hán.',
    location: 'Quảng Ninh',
    imagePath: '/images/trung-dai.svg',
    imageAlt: 'Minh họa trận Bạch Đằng',
    tags: ['Bạch Đằng'],
    featured: true,
    startYear: 938,
    endYear: null,
    latitude: 20.9,
    longitude: 106.8,
    readingMinutes: 3,
    searchText: 'chien thang bach dang battle of bach dang',
  },
  {
    slug: 'cach-mang-thang-tam',
    href: '/event/cach-mang-thang-tam',
    era: 'can-dai',
    eraName: 'Cận đại',
    country: 'Việt Nam',
    countryKey: 'Việt Nam',
    dateLabel: 'Năm 1945',
    title: 'Cách mạng tháng Tám',
    summary: 'Nhân dân giành chính quyền.',
    location: 'Hà Nội',
    imagePath: '/images/can-dai.svg',
    imageAlt: 'Minh họa Cách mạng tháng Tám',
    tags: ['1945'],
    featured: false,
    startYear: 1945,
    endYear: null,
    latitude: 21,
    longitude: 105.8,
    readingMinutes: 4,
    searchText: 'cach mang thang tam august revolution',
  },
];

/**
 * Dựng trang dòng thời gian ở chế độ bản đồ trong ngữ cảnh tiếng Việt.
 * @param props Thuộc tính ghi đè cho thành phần.
 * @returns Kết quả render của thư viện kiểm thử.
 */
function renderMapView(props: { initialQuery?: string } = {}) {
  return render(
    <I18nProvider locale="vi">
      <TimelineExplorer events={events} initialView="map" {...props} />
    </I18nProvider>,
  );
}

describe('bộ lọc ngay trên bản đồ', () => {
  it('có ô tìm kiếm, chọn thời kỳ, chọn quốc gia và nút đổi chế độ xem trên bản đồ', () => {
    renderMapView();

    expect(document.getElementById('map-search')).toBeInTheDocument();
    expect(document.getElementById('map-era')).toBeInTheDocument();
    expect(document.getElementById('map-country')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dòng thời gian' })).toBeInTheDocument();
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
  });

  it('ẩn thẻ lọc phía trên khi đang xem bản đồ để không lặp bộ lọc', () => {
    renderMapView();

    expect(document.getElementById('timeline-search')).not.toBeInTheDocument();
    expect(document.getElementById('timeline-era')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dòng thời gian' }));

    expect(document.getElementById('timeline-search')).toBeInTheDocument();
    expect(document.getElementById('map-search')).not.toBeInTheDocument();
  });

  it('lọc điểm trên bản đồ và giữ nguyên từ khóa khi quay lại dòng thời gian', () => {
    renderMapView();

    fireEvent.change(document.getElementById('map-search') as HTMLInputElement, {
      target: { value: 'Bạch Đằng' },
    });

    expect(screen.getByTestId('map-panel')).toHaveTextContent('chien-thang-bach-dang');
    expect(screen.getByTestId('map-panel')).not.toHaveTextContent('cach-mang-thang-tam');
    expect(screen.getAllByText('1 sự kiện').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Dòng thời gian' }));

    expect((document.getElementById('timeline-search') as HTMLInputElement).value).toBe('Bạch Đằng');
  });

  it('chọn thời kỳ trên bản đồ lọc đúng điểm và giữ nguyên khi đổi chế độ xem', () => {
    renderMapView();

    fireEvent.change(document.getElementById('map-era') as HTMLSelectElement, {
      target: { value: 'can-dai' },
    });

    expect(screen.getByTestId('map-panel')).toHaveTextContent('cach-mang-thang-tam');
    expect(screen.getByTestId('map-panel')).not.toHaveTextContent('chien-thang-bach-dang');

    fireEvent.click(screen.getByRole('button', { name: 'Dòng thời gian' }));

    expect((document.getElementById('timeline-era') as HTMLSelectElement).value).toBe('can-dai');
  });

  it('nút xóa lọc trên bản đồ xóa từ khóa mà vẫn giữ chế độ bản đồ', () => {
    renderMapView({ initialQuery: 'Bạch Đằng' });

    const resetButtons = screen.getAllByRole('button', { name: 'Xóa bộ lọc' });
    fireEvent.click(resetButtons[resetButtons.length - 1]);

    expect(document.getElementById('map-search')).toHaveValue('');
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bản đồ' })).toHaveAttribute('aria-pressed', 'true');
  });
});
