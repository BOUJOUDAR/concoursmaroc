import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { REVALIDATION_TIMES, SITE_CONFIG } from "@/lib/utils/constants";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/json-ld";
import { formatDate, formatNumber } from "@/lib/utils/format-date";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ShareButtons } from "@/components/concours/ShareButtons";
import { ConcoursCard } from "@/components/concours/ConcoursCard";
import { logger } from "@/lib/utils/logger";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: concours } = await supabase
    .from("concours")
    .select("title_ar, title_fr, description_ar, description_fr")
    .eq("slug", slug)
    .single();

  if (!concours) return {};

  const title = locale === "ar" ? concours.title_ar : concours.title_fr;
  const description =
    locale === "ar" ? concours.description_ar : concours.description_fr;

  return generateSEOMetadata({
    title,
    description: description || dict.hero.subtitle,
    locale,
    path: `/concours/${slug}`,
  });
}

export default async function ConcoursDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: concours } = await supabase
    .from("concours")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!concours) {
    logger.warn("Concours not found", { slug });
    notFound();
  }

  // Increment view count
  await supabase
    .from("concours")
    .update({ view_count: concours.view_count + 1 })
    .eq("id", concours.id);

  const title = locale === "ar" ? concours.title_ar : concours.title_fr;
  const description =
    locale === "ar" ? concours.description_ar : concours.description_fr;
  const eligibility =
    locale === "ar" ? concours.eligibility_ar : concours.eligibility_fr;
  const diploma =
    locale === "ar" ? concours.diploma_required_ar : concours.diploma_required_fr;

  // Get related concours
  const { data: related } = await supabase
    .from("concours")
    .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
    .eq("category", concours.category)
    .eq("is_active", true)
    .neq("id", concours.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Get previous exams
  const { data: annales } = await supabase
    .from("annales")
    .select("id, slug, title_ar, title_fr, year, subject, file_url")
    .eq("institution", concours.institution)
    .order("year", { ascending: false })
    .limit(5);

  const pageUrl = `${SITE_CONFIG.url}/${locale}/concours/${slug}`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.nav.home, url: `${SITE_CONFIG.url}/${locale}` },
    { name: dict.concours.title, url: `${SITE_CONFIG.url}/${locale}/concours` },
    { name: title, url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: dict.concours.title, href: `/${locale}/concours` },
            { label: title, href: `/${locale}/concours/${slug}` },
          ]}
          locale={locale}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-brand-900 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                  {concours.category.toUpperCase()}
                </span>
                <span className="text-sm text-muted flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(concours.view_count)} {dict.concours.views}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              {description && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted whitespace-pre-line">{description}</p>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                <Building2 className="h-5 w-5 text-brand-600 shrink-0" />
                <div>
                  <p className="text-xs text-muted">{dict.concours.institution}</p>
                  <p className="font-medium text-sm">{concours.institution}</p>
                </div>
              </div>
              {concours.city && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <MapPin className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">{dict.concours.city}</p>
                    <p className="font-medium text-sm">{concours.city}</p>
                  </div>
                </div>
              )}
              {concours.deadline && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <Calendar className="h-5 w-5 text-accent-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">{dict.concours.deadline}</p>
                    <p className="font-medium text-sm">
                      {formatDate(concours.deadline, locale)}
                    </p>
                  </div>
                </div>
              )}
              {concours.postes_count && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <Users className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">{dict.concours.postes}</p>
                    <p className="font-medium text-sm">{concours.postes_count}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility */}
            {eligibility && (
              <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="font-semibold mb-3">{dict.concours.eligibility}</h2>
                <p className="text-sm text-muted whitespace-pre-line">{eligibility}</p>
              </div>
            )}

            {/* Diploma */}
            {diploma && (
              <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="font-semibold mb-3">{dict.concours.diploma_required}</h2>
                <p className="text-sm text-muted whitespace-pre-line">{diploma}</p>
              </div>
            )}

            {/* Annonce Officielle */}
            {concours.annonce_officielle && (
              <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                <h2 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  {locale === "ar" ? "الannonce الرسمية" : "Annonce Officielle"}
                </h2>
                <p className="text-sm text-muted whitespace-pre-line">{concours.annonce_officielle}</p>
              </div>
            )}

            {/* Previous Exams */}
            {annales && annales.length > 0 && (
              <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="font-semibold mb-3">{dict.concours.previous_exams}</h2>
                <div className="space-y-2">
                  {annales.map((a) => (
                    <a
                      key={a.id}
                      href={a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {locale === "ar" ? a.title_ar : a.title_fr}
                        </p>
                        <p className="text-xs text-muted">
                          {a.year} - {a.subject}
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="p-5 rounded-xl border border-border bg-card sticky top-24">
              <h3 className="font-semibold mb-4">{dict.concours.official_pdf}</h3>
              {concours.official_pdf_url ? (
                <a
                  href={concours.official_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-lg bg-brand-600 text-white py-3 font-medium hover:bg-brand-700 transition-colors"
                >
                  {dict.concours.download_official}
                </a>
              ) : (
                <p className="text-sm text-muted">{dict.common.error}</p>
              )}

              {concours.source_url && (
                <a
                  href={concours.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-lg border border-border py-3 font-medium hover:bg-muted transition-colors mt-3 text-sm"
                >
                  {dict.concours.official_pdf} ↗
                </a>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <ShareButtons
                  url={pageUrl}
                  title={title}
                  dict={dict}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{dict.concours.related}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const revalidate = REVALIDATION_TIMES.concoursDetail;
