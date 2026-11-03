import { serializeJsonLd } from '@/utils/format';

/**
 * Chèn dữ liệu có cấu trúc JSON-LD cho công cụ tìm kiếm.
 * Nội dung được mã hóa để không thể đóng thẻ script sớm.
 * @param props.data Đối tượng dữ liệu có cấu trúc.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
