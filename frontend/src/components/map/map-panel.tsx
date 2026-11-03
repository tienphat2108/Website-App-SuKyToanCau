'use client';

import dynamic from 'next/dynamic';
import type { MapLabels, MapMarker } from './historical-map';
import { cn } from '@/utils/format';

/**
 * Bản đồ được tải động ở phía trình duyệt để không làm nặng lần hiển thị đầu tiên
 * và tránh lỗi khi máy chủ dựng trang không có đối tượng window.
 */
const HistoricalMap = dynamic(
  () => import('./historical-map').then((module) => module.HistoricalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[22rem] items-center justify-center bg-raised text-sm text-muted">
        <span className="animate-pulse">Đang tải bản đồ…</span>
      </div>
    ),
  },
);

/**
 * Khung hiển thị bản đồ kèm viền và tỉ lệ cố định.
 * @param props.markers Các điểm cần hiển thị.
 * @param props.labels Nhãn giao diện.
 * @param props.center Tâm bản đồ khi chỉ có một điểm.
 * @param props.zoom Mức thu phóng.
 * @param props.className Lớp bổ sung cho khung ngoài.
 */
export function MapPanel({
  markers,
  labels,
  center,
  zoom,
  className,
}: {
  markers: MapMarker[];
  labels: MapLabels;
  center?: [number, number];
  zoom?: number;
  className?: string;
}) {
  return (
    // `isolate` giam các lớp xếp lớp bên trong Leaflet trong khung bản đồ,
    // tránh bản đồ vẽ đè lên thanh điều hướng dính khi cuộn trang.
    <div className={cn('isolate overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      <HistoricalMap markers={markers} labels={labels} center={center} zoom={zoom} />
    </div>
  );
}
