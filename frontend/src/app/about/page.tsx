import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import { JsonLd } from '@/components/ui/json-ld';
import { PageHero } from '@/components/ui/page-hero';
import { SectionHeading } from '@/components/ui/section-heading';
import { getI18n } from '@/core/i18n/server';
import { localizePath } from '@/core/i18n/config';
import { absoluteUrl } from '@/utils/site';
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

/**
 * Siêu dữ liệu trang giới thiệu.
 * @returns Tiêu đề và mô tả theo ngôn ngữ hiện tại.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n();

  return createPageMetadata({
    title: dictionary.meta.about.title,
    description: dictionary.meta.about.description,
  });
}

/**
 * Trang giới thiệu sứ mệnh, nguyên tắc biên tập, quy trình kiểm chứng và đội ngũ.
 * Bố cục đi theo nhịp biên tập của trang chủ: khung mở đầu có cột sứ mệnh tối màu,
 * câu chuyện dự án, dải nguyên tắc trên nền đêm, quy trình đánh số và hồ sơ đội ngũ.
 */
export default async function AboutPage() {
  const { locale, dictionary } = await getI18n();
  const homeHref = localizePath(locale, '/');
  const aboutHref = localizePath(locale, '/about');
  const contributeHref = localizePath(locale, '/contribute');

  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { label: dictionary.common.home, url: absoluteUrl(homeHref) },
    { label: dictionary.about.title, url: absoluteUrl(aboutHref) },
  ]);

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: dictionary.meta.about.title,
    description: dictionary.meta.about.description,
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en',
    mainEntity: {
      '@type': 'Organization',
      name: dictionary.meta.siteName,
      url: absoluteUrl(localizePath(locale, '/')),
      logo: absoluteUrl('/icon.svg'),
      description: dictionary.about.lead,
      employee: dictionary.about.team.map((member) => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
      })),
    },
  };

  return (
    <>
      <PageHero
        title={dictionary.about.title}
        description={dictionary.about.lead}
        breadcrumbLabel={dictionary.a11y.breadcrumb}
        breadcrumbs={[
          { label: dictionary.common.home, href: homeHref },
          { label: dictionary.about.title },
        ]}
        aside={
          <aside className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-7">
            <div className="pointer-events-none absolute -bottom-10 -right-8 opacity-[0.08]" aria-hidden="true">
              <BrandMark tone="night" className="h-44 w-44" />
            </div>

            <p className="text-[0.8125rem] font-medium text-gold">
              {dictionary.about.missionTitle}
            </p>
            <span className="gold-rule mt-4 block" aria-hidden="true" />
            <p className="relative mt-4 text-[0.9375rem] leading-relaxed text-white/70">{dictionary.about.missionText}</p>
          </aside>
        }
      />

      <section className="container-page section-y">
        <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-ink sm:text-[2.35rem]">
              {dictionary.about.storyTitle}
            </h2>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
            <div className="prose-history dropcap mt-6">
              {dictionary.about.storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="relative lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-line/80 bg-surface p-1.5 shadow-card">
              <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-raised">
                <Image
                  src="/images/hero.svg"
                  alt={dictionary.home.hero.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 40vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 text-white">
                  <BrandMark tone="night" className="h-9 w-9" />
                  <span>
                    <span className="block text-[0.75rem] font-medium text-gold">
                      {dictionary.about.eyebrow}
                    </span>
                    <span className="block font-display text-[0.875rem] font-semibold">{dictionary.meta.siteName}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night py-16 text-white sm:py-20">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />

        <div className="container-page relative">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-white sm:text-[2.35rem]">
              {dictionary.about.valuesTitle}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {dictionary.about.values.map((value, index) => (
              <div
                key={value.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-bold leading-none text-gold">0{index + 1}</span>
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/70">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-ink sm:text-[2.35rem]">
              {dictionary.about.methodTitle}
            </h2>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
          </div>

          <ol className="relative space-y-4 border-l border-line pl-6 md:pl-8">
            {dictionary.about.methodParagraphs.map((paragraph, index) => (
              <li key={index} className="relative">
                <span
                  className="absolute -left-[1.85rem] top-7 grid h-5 w-5 place-items-center rounded-full border border-gold/45 bg-background md:-left-[2.35rem]"
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                </span>

                <div className="card-hover overflow-hidden p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/35 bg-gold/10 font-display text-sm font-bold text-accent">
                      0{index + 1}
                    </span>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-[0.9375rem] leading-[1.8] text-muted">{paragraph}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-surface/50 section-y">
        <div className="container-page">
          <SectionHeading
            title={dictionary.about.teamTitle}
            subtitle={dictionary.about.teamSubtitle}
            align="center"
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {dictionary.about.team.map((member, index) => (
              <article
                key={member.name}
                className="card group grid grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden sm:block"
              >
                <div className="relative min-h-[9.5rem] overflow-hidden bg-raised sm:aspect-[4/5] sm:min-h-0">
                  <Image
                    src={member.image}
                    alt={member.alt}
                    fill
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 45vw, 22vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-70"
                    aria-hidden="true"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-night/70 px-2 py-0.5 font-display text-[0.75rem] font-semibold text-gold backdrop-blur sm:left-4 sm:top-4 sm:px-2.5 sm:py-1">
                    0{index + 1}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-display text-base font-semibold leading-snug text-ink sm:text-lg">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] font-medium leading-snug text-accent">
                    {member.role}
                  </p>
                  <span className="mt-3 block h-px w-10 bg-gold/60" aria-hidden="true" />
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-muted sm:text-[0.9375rem]">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-4 pt-16 sm:pt-20">
        <div className="relative overflow-hidden rounded-2xl bg-night px-6 py-12 text-center sm:px-12 lg:py-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 right-6 opacity-[0.07]" aria-hidden="true">
            <BrandMark tone="night" className="h-60 w-60" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-[2.6rem]">
              {dictionary.about.ctaTitle}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">{dictionary.about.ctaText}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={contributeHref} className="btn-gold">
                {dictionary.about.ctaButton}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={localizePath(locale, '/faq')}
                className="btn border border-white/20 text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {dictionary.nav.faq}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={[aboutJsonLd, breadcrumbJsonLd]} />
    </>
  );
}
