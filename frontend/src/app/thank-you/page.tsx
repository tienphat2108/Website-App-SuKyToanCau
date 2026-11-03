import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { createPageMetadata } from '@/lib/seo';

/**
 * Siêu dữ liệu trang cảm ơn.
 * Trang chỉ hiển thị sau khi gửi biểu mẫu nên không cần được lập chỉ mục.
 * @returns Siêu dữ liệu có đánh dấu không lập chỉ mục.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.thankYou.title,
    description: dictionary.meta.thankYou.description,
    noindex: true,
  });
}

/**
 * Trang xác nhận đã nhận đóng góp và gợi ý bước tiếp theo.
 * Con dấu vàng son đóng vai trò điểm nhấn thị giác, còn thẻ tối màu giữ các liên kết
 * tiếp tục khám phá để người đọc không dừng lại ở một trang trống.
 */
export default async function ThankYouPage() {
  const { locale, dictionary } = await getI18n();

  return (
    <section className="relative overflow-hidden">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[26rem] w-[26rem] rounded-full bg-gold/12 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden="true" />

      <div className="container-page relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="relative mx-auto grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full border border-gold/25" aria-hidden="true" />
              <span className="absolute inset-2 rounded-full border border-gold/40" aria-hidden="true" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-accent text-white shadow-glow">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>

            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {dictionary.thankYou.title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted">{dictionary.thankYou.text}</p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -bottom-16 -right-10 opacity-[0.07]" aria-hidden="true">
              <BrandMark tone="night" className="h-52 w-52" />
            </div>

            <h2 className="relative font-display text-2xl font-semibold leading-snug text-white">
              {dictionary.thankYou.nextTitle}
            </h2>
            <span className="mt-3 block h-px w-12 bg-gold/70" aria-hidden="true" />
            <p className="relative mt-4 max-w-xl text-[1rem] leading-relaxed text-white/75">
              {dictionary.thankYou.nextText}
            </p>

            <div className="relative mt-6 flex flex-wrap gap-3">
              <Link href={localizePath(locale, '/timeline')} className="btn-gold">
                {dictionary.thankYou.timelineCta}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={localizePath(locale, '/')}
                className="btn border border-white/20 text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {dictionary.thankYou.homeCta}
              </Link>
              <Link
                href={localizePath(locale, '/faq')}
                className="btn text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white"
              >
                {dictionary.thankYou.faqCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
