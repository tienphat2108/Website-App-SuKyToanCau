import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/events/event-card';
import type { EventCardModel } from '@/core/presenters/event.presenter';

/** Dữ liệu mẫu cho thẻ sự kiện. */
const event: EventCardModel = {
  slug: 'chien-thang-bach-dang-938',
  href: '/event/chien-thang-bach-dang-938',
  era: 'trung-dai',
  eraName: 'Trung đại',
  country: 'Việt Nam',
  countryKey: 'Việt Nam',
  dateLabel: 'Năm 938',
  title: 'Chiến thắng Bạch Đằng',
  summary: 'Ngô Quyền đánh bại quân Nam Hán trên sông Bạch Đằng.',
  location: 'Quảng Ninh',
  imagePath: '/images/trung-dai.svg',
  imageAlt: 'Minh họa cổng thành và cọc gỗ trên sông',
  tags: ['Bạch Đằng', 'Ngô Quyền'],
  featured: true,
  startYear: 938,
  endYear: null,
  latitude: 20.9,
  longitude: 106.8,
  readingMinutes: 3,
  searchText: 'chiến thắng bạch đằng battle of bach dang',
};

const labels = {
  readMore: 'Đọc bài',
  featured: 'Nổi bật',
  minutes: 'phút đọc',
};

describe('EventCard', () => {
  it('hiển thị tiêu đề, tóm tắt và liên kết đúng', () => {
    render(<EventCard event={event} labels={labels} />);

    expect(screen.getByRole('link', { name: event.title })).toHaveAttribute('href', event.href);
    expect(screen.getByRole('heading', { name: event.title })).toBeInTheDocument();
    expect(screen.getByText(event.summary)).toBeInTheDocument();
    expect(screen.getByText('Nổi bật')).toBeInTheDocument();
    expect(screen.getByText('3 phút đọc')).toBeInTheDocument();
  });

  it('có văn bản thay thế cho hình ảnh', () => {
    render(<EventCard event={event} labels={labels} />);

    expect(screen.getByAltText(event.imageAlt)).toBeInTheDocument();
  });
});
