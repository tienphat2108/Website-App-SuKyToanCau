'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/providers/i18n-provider';
import { COUNTRY_OPTIONS } from '@/data/countries';
import { cn } from '@/utils/format';
import { writePreferredCountry } from '@/utils/preferred-country';

/**
 * Bộ chọn quốc gia hoặc khu vực ưu tiên.
 *
 * Lựa chọn được lưu trong cookie để máy chủ sắp xếp lại nội dung ở lần tải sau.
 * Sau khi đổi, trang được làm mới để phần máy chủ và phần trình duyệt dùng cùng dữ liệu.
 * @param props.value Khóa quốc gia đang chọn do máy chủ đọc từ cookie.
 * @param props.tone Tông màu phù hợp dải thông tin tối hoặc bề mặt sáng.
 * @param props.compact Dùng kích thước gọn cho thanh công cụ.
 * @param props.id Mã nhận diện để gắn với nhãn biểu mẫu.
 * @param props.className Lớp bổ sung cho hàng chứa ô chọn và nút bỏ ưu tiên.
 */
export function CountryPreference({
  value = '',
  tone = 'surface',
  compact = false,
  id,
  className,
}: {
  value?: string;
  tone?: 'night' | 'surface';
  compact?: boolean;
  id?: string;
  className?: string;
}) {
  const { locale, dictionary } = useI18n();
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  /** Có đang phát vòng báo "đã đổi ưu tiên" hay không; tự tắt khi hiệu ứng kết thúc. */
  const [isNoting, setNoting] = useState(false);

  // Đồng bộ lại khi máy chủ trả về lựa chọn mới sau khi làm mới trang.
  useEffect(() => {
    setSelected(value);
  }, [value]);

  /**
   * Lưu lựa chọn mới và yêu cầu máy chủ dựng lại nội dung đã sắp xếp.
   * @param nextCountry Khóa quốc gia mới hoặc chuỗi rỗng để bỏ ưu tiên.
   * @returns Không trả về giá trị.
   */
  const handleChange = (nextCountry: string): void => {
    if (nextCountry !== selected) {
      setNoting(true);
    }

    setSelected(nextCountry);
    writePreferredCountry(nextCountry);
    router.refresh();
  };

  /** Đã chọn một quốc gia cụ thể hay chưa; ảnh hưởng tới dòng hướng dẫn và nút bỏ ưu tiên. */
  const hasSelection = selected !== '';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <select
        id={id}
        value={selected}
        onChange={(event) => handleChange(event.target.value)}
        onAnimationEnd={() => setNoting(false)}
        aria-label={dictionary.preferences.countryLabel}
        className={cn(
          'select-press min-w-0 rounded-xl border font-ui font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/35',
          /* Vòng báo ngắn mỗi lần đổi ưu tiên, tự gỡ lớp khi hiệu ứng chạy xong. */
          isNoting && 'select-note',
          tone === 'night'
            ? 'h-8 max-w-[13rem] border-white/20 bg-white/10 px-2 text-[0.8125rem] text-white [&>option]:bg-background [&>option]:text-ink'
            : compact
              ? 'h-9 w-auto border-line bg-surface px-2.5 text-[0.8125rem] text-ink'
              : 'h-11 w-full border-line bg-surface px-3 text-[0.9375rem] text-ink',
        )}
      >
        {/* Dòng hướng dẫn chỉ hiện khi chưa chọn, để danh sách sau đó chỉ còn tên quốc gia. */}
        {!hasSelection ? (
          <option value="">{dictionary.preferences.countryPlaceholder}</option>
        ) : null}
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country.key} value={country.key}>
            {locale === 'en' ? country.en : country.vi}
          </option>
        ))}
      </select>

      {/* Bỏ ưu tiên là một nút riêng, không nằm trong danh sách quốc gia. */}
      {hasSelection ? (
        <button
          type="button"
          onClick={() => handleChange('')}
          className={cn(
            /* Nút xuất hiện tại chỗ khi đã chọn quốc gia nên hiện ra bằng một pha mờ ngắn. */
            'press action-reveal whitespace-nowrap font-ui font-semibold',
            tone === 'night'
              ? 'text-[0.8125rem] text-white/65 hover:text-white'
              : 'text-[0.8125rem] text-accent hover:text-accent-strong',
          )}
        >
          {dictionary.preferences.clear}
        </button>
      ) : null}
    </div>
  );
}
