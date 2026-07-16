import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { ITEMS_PER_PAGE } from "@/lib/utils/constants";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils/format-date";
import { FileText, ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ institution?: string; subject?: string; year?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.annales.title,
    description: dict.hero.subtitle,
    locale,
    path: "/annales",
  });
}

export default async function AnnalesPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const { institution, subject, year, page } = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let query = supabase
    .from("annales")
    .select("id, slug, title_ar, title_fr, institution, category, subject, year, file_url, correction_url, view_count", { count: "exact" });

  if (institution) query = query.eq("institution", institution);
  if (subject) query = query.eq("subject", subject);
  if (year) query = query.eq("year", parseInt(year, 10));

  const { data, count } = await query
    .order("year", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.annales.title, href: `/${locale}/annales` }]}
        locale={locale}
      />
      <h1 className="text-3xl font-bold mb-8">{dict.annales.title}</h1>

      {data && data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="rounded-lg bg-red-100 dark:bg-red-900 p-3">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {locale === "ar" ? a.title_ar : a.title_fr}
                  </h3>
                  <p className="text-sm text-muted">
                    {a.institution} • {a.subject} • {a.year}
                  </p>
                </div>
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  {dict.pdf.download}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {a.correction_url && (
                  <a
                    href={a.correction_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {dict.annales.correction}
                  </a>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/annales?page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  {dict.common.previous}
                </a>
              )}
              <span className="px-4 py-2 text-sm text-muted">
                {currentPage} {dict.common.of} {totalPages}
              </span>
              {currentPage < totalPages && (
                <a
                  href={`/${locale}/annales?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  {dict.common.next}
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState title={dict.annales.no_results} />
      )}
    </div>
  );
}
