import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { REVALIDATION_TIMES, ITEMS_PER_PAGE } from "@/lib/utils/constants";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { PDFCard } from "@/components/pdf/PDFCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FileText } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; type?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.pdf.title,
    description: dict.hero.subtitle,
    locale,
    path: "/bibliotheque",
  });
}

export default async function BibliothquePage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const { category, type, page } = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let query = supabase
    .from("documents")
    .select("id, slug, title_ar, title_fr, file_type, file_size, category, subject, year, download_count", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (type) query = query.eq("file_type", type);

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.pdf.title, href: `/${locale}/bibliotheque` }]}
        locale={locale}
      />
      <h1 className="text-3xl font-bold mb-8">{dict.pdf.title}</h1>

      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((doc) => (
              <PDFCard key={doc.id} document={doc} dict={dict} locale={locale} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/bibliotheque?page=${currentPage - 1}`}
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
                  href={`/${locale}/bibliotheque?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  {dict.common.next}
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={dict.pdf.no_results}
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}

export const revalidate = 1800;
