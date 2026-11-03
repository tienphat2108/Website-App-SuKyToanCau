import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { ContributionForm } from '@/components/contribute/contribution-form';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { absoluteUrl, CONTACT_EMAIL, contactMailto } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/**
 * Siêu dữ liệu trang đóng góp.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.contribute.title,
    description: dictionary.meta.contribute.description,
  });
}

/**
 * Trang gửi tư liệu và góp ý.
 * Biểu mẫu là thành phần tương tác; phần khung, tiêu đề và liên kết được dựng ở máy chủ
 * để nội dung vẫn đọc được khi JavaScript chưa tải xong.
 */
export default async function ContributePage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const contributeHref = localizePath(locale, '/contribute');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.contribute.title, url: absoluteUrl(contributeHref) },
  ]);

  return (
    <>
      <PageHero
        title={dictionary.contribute.title}
        description={dictionary.contribute.subtitle}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.contribute.title },
        ]}
        action={
          <>
            <Link href={localizePath(locale, '/privacy')} className="btn-secondary">
              {dictionary.nav.privacy}
            </Link>
            <Link href={localizePath(locale, '/faq')} className="btn-ghost underline decoration-line underline-offset-4">
              {dictionary.nav.faq}
            </Link>
          </>
        }
      />

      <section className="container-page py-10 sm:py-14">
        <ContributionForm />

        <div className="mt-6 rounded-2xl border border-line/70 bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {dictionary.contribute.directEmailTitle}
          </h2>
          <p className="mt-1.5 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">
            {dictionary.contribute.directEmailText}
          </p>
          <a
            href={contactMailto(dictionary.contribute.directEmailSubject)}
            aria-label={`${dictionary.contribute.directEmailTitle}: ${CONTACT_EMAIL}`}
            className="mt-3 inline-flex max-w-full items-center gap-2 py-1 font-medium text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="break-all">{CONTACT_EMAIL}</span>
          </a>
        </div>

        <div className="mt-8 relative overflow-hidden rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 sm:p-6">
          <span
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-accent/70"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-ink">
                {dictionary.contribute.responseTitle}
              </h2>
              <p className="mt-1.5 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">
                {dictionary.contribute.responseText}
              </p>
              <p className="mt-1.5 text-[0.8125rem] font-medium text-accent">
                {dictionary.contribute.responseNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd} />
    </>
  );
}
