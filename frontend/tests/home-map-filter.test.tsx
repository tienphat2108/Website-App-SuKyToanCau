import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { HomeMapSection, type HomeMapPoint } from '@/components/map/home-map-section';
import { I18nProvider } from '@/components/providers/i18n-provider';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// Khối lộ dần khi cuộn cần IntersectionObserver và Motion, không cần cho kiểm tra bộ lọc.
vi.mock('@/components/motion/reveal', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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

/** Ba điểm khác thời kỳ và khác quốc gia để kiểm tra ba ô lọc. */
const points: HomeMapPoint[] = [
  {
    slug: 'chien-thang-bach-dang',
    title: 'Chiến thắng Bạch Đằng',
    subtitle: 'Năm 938 · Cổ đại',
    href: '/event/chien-thang-bach-dang',
    latitude: 20.9,
    longitude: 106.8,
    year: 938,
    era: 'co-dai',
    country: 'Việt Nam',
    searchText: 'chien thang bach dang battle of bach dang ngo quyen',
  },
  {
    slug: 'cach-mang-thang-tam',
    title: 'Cách mạng tháng Tám',
    subtitle: 'Năm 1945 · Hiện đại',
    href: '/event/cach-mang-thang-tam',
    latitude: 21,
    longitude: 105.8,
    year: 1945,
    era: 'hien-dai',
    country: 'Việt Nam',
    searchText: 'cach mang thang tam august revolution ha noi',
  },
  {
    slug: 'suu-tam-buc-tuong-berlin',
    title: 'Sụp đổ bức tường Berlin',
    subtitle: 'Năm 1989 · Hiện đại',
    href: '/event/suu-tam-buc-tuong-berlin',
    latitude: 52.5,
    longitude: 13.4,
    year: 1989,
    era: 'hien-dai',
    country: 'Đức',
    searchText: 'sup do buc tuong berlin fall of the berlin wall',
  },
];

/**
 * Dựng khối bản đồ trang chủ trong ngữ cảnh tiếng Việt.
 * @returns Kết quả render của thư viện kiểm thử.
 */
function renderHomeMap() {
  return render(
    <I18nProvider locale="vi">
      <HomeMapSection points={points} />
    </I18nProvider>,
  );
}

describe('bộ lọc trên bản đồ trang chủ', () => {
  it('có ô từ khóa, ô thời kỳ và ô quốc gia ngay trên bản đồ', () => {
    renderHomeMap();

    expect(document.getElementById('home-map-search')).toBeInTheDocument();
    expect(document.getElementById('home-map-era')).toBeInTheDocument();
    expect(document.getElementById('home-map-country')).toBeInTheDocument();
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
    expect(screen.getAllByText('3 sự kiện').length).toBeGreaterThan(0);
  });

  it('gõ từ khóa không dấu vẫn lọc đúng điểm và đổi danh sách chữ', () => {
    renderHomeMap();

    fireEvent.change(document.getElementById('home-map-search') as HTMLInputElement, {
      target: { value: 'bach dang' },
    });

    expect(screen.getByTestId('map-panel')).toHaveTextContent('chien-thang-bach-dang');
    expect(screen.getByTestId('map-panel')).not.toHaveTextContent('cach-mang-thang-tam');
    expect(screen.getAllByText('1 sự kiện').length).toBeGreaterThan(0);
    expect(screen.getByText('Danh sách địa điểm của 1 sự kiện đang hiển thị')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chiến thắng Bạch Đằng' })).toHaveAttribute(
      'href',
      '/event/chien-thang-bach-dang',
    );
  });

  it('chọn thời kỳ và quốc gia lọc chồng lên nhau', () => {
    renderHomeMap();

    fireEvent.change(document.getElementById('home-map-era') as HTMLSelectElement, {
      target: { value: 'hien-dai' },
    });
    expect(screen.getByTestId('map-panel')).not.toHaveTextContent('chien-thang-bach-dang');

    fireEvent.change(document.getElementById('home-map-country') as HTMLSelectElement, {
      target: { value: 'Đức' },
    });
    expect(screen.getByTestId('map-panel')).toHaveTextContent('suu-tam-buc-tuong-berlin');
    expect(screen.getByTestId('map-panel')).not.toHaveTextContent('cach-mang-thang-tam');
    expect(screen.getAllByText('1 sự kiện').length).toBeGreaterThan(0);
  });

  it('không còn điểm nào thì báo rõ và nút xóa lọc đưa bản đồ trở lại', () => {
    renderHomeMap();

    fireEvent.change(document.getElementById('home-map-search') as HTMLInputElement, {
      target: { value: 'không có sự kiện này' },
    });

    expect(screen.queryByTestId('map-panel')).not.toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy sự kiện phù hợp với bộ lọc.')).toBeInTheDocument();

    // Lúc không còn điểm nào có hai nút xóa lọc: một trên thanh lọc, một trong khung báo.
    const resetButtons = screen.getAllByRole('button', { name: 'Xóa bộ lọc' });
    expect(resetButtons).toHaveLength(2);
    fireEvent.click(resetButtons[1]);

    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
    expect(document.getElementById('home-map-search')).toHaveValue('');
    expect(screen.getAllByText('3 sự kiện').length).toBeGreaterThan(0);
  });

  it('số địa điểm ở cột chữ đổi theo bộ lọc', () => {
    renderHomeMap();

    expect(screen.getByText('3 địa điểm trên bản đồ')).toBeInTheDocument();

    fireEvent.change(document.getElementById('home-map-country') as HTMLSelectElement, {
      target: { value: 'Việt Nam' },
    });

    expect(screen.getByText('2 địa điểm trên bản đồ')).toBeInTheDocument();
  });
});