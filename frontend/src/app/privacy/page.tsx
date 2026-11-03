import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { getI18n } from '@/core/i18n/server';
import { formatMessage } from '@/core/i18n/dictionary';
import { localizePath } from '@/core/i18n/config';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/**
 * Siêu dữ liệu trang chính sách riêng tư.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.privacy.title,
    description: dictionary.meta.privacy.description,
  });
}

/**
 * Trang chính sách riêng tư.
 * Mỗi mục có mã neo riêng để liên kết trực tiếp từ chân trang và biểu mẫu đóng góp.
 * Cột mục lục bám theo màn hình trên máy tính để người đọc chuyển nhanh giữa các phần.
 */
export default async function PrivacyPage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const privacyHref = localizePath(locale, '/privacy');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.privacy.title, url: absoluteUrl(privacyHref) },
  ]);

  /**
   * Tạo mã neo cho một mục chính sách.
   * Mã neo khai báo trong từ điển ngôn ngữ nên liên kết từ chân trang không đổi
   * khi thứ tự hoặc số lượng mục thay đổi.
   * @param section Mục chính sách.
   * @param index Vị trí của mục, dùng cho mục không đặt mã neo.
   * @returns Mã neo dùng cho thuộc tính id.
   */
  const sectionId = (section: { anchor?: string }, index: number): string =>
    section.anchor ?? `muc-${index + 1}`;

  /** Tên chủ quản dùng để thay vào biến {owner} trong các đoạn chính sách. */
  const owner = dictionary.privacy.ownerName;

  return (
    <>
      <PageHero
        title={dictionary.privacy.title}
        description={dictionary.privacy.intro}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.privacy.title },
        ]}
        aside={
          <aside className="relative overflow-hidden rounded-2xl border border-gold/35 bg-gold/[0.07] p-6">
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-accent/70" aria-hidden="true" />

            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3Z" strokeLinejoin="round" />
                  <path d="M9.5 12.2l1.9 1.9 3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              <div>
                <p className="font-display text-lg font-semibold leading-snug text-ink">
                  {dictionary.privacy.updated}
                </p>
              </div>
            </div>
          </aside>
        }
      />

      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={dictionary.privacy.title} className="card p-5">
            <h2 className="text-[0.8125rem] font-semibold text-muted">
              {dictionary.privacy.title}
            </h2>
            <span className="mt-3 block h-px w-10 bg-gold/60" aria-hidden="true" />

            <ol className="mt-3 space-y-0.5">
              {dictionary.privacy.sections.map((section, index) => (
                <li key={section.title}>
                  <a
                    href={`#${sectionId(section, index)}`}
                    className="flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 text-[0.9375rem] leading-snug text-muted transition hover:bg-raised hover:text-accent"
                  >
                    <span className="font-display text-[0.75rem] font-semibold text-accent/80">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="max-w-3xl">
          {dictionary.privacy.sections.map((section, index) => (
            <section
              key={section.title}
              id={sectionId(section, index)}
              className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-b-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[0.875rem] font-bold tracking-[0.06em] text-accent/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-2xl font-bold text-ink">{section.title}</h2>
              </div>

              <div className="prose-history mt-4 text-[0.98rem]">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{formatMessage(paragraph, { owner })}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-6">
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-accent/70" aria-hidden="true" />
            <p className="text-[0.9375rem] leading-relaxed text-muted">{dictionary.faq.moreText}</p>
            <Link href={localizePath(locale, '/contribute')} className="btn-primary mt-4">
              {dictionary.privacy.contactCta}
            </Link>
          </div>
        </article>
      </div>

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
