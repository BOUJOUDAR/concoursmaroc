import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ConcoursCard } from "@/components/concours/ConcoursCard";
import { PDFCard } from "@/components/pdf/PDFCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.search.title,
    description: dict.hero.subtitle,
    locale,
    path: "/recherche",
  });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const { q } = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  let concoursResults: Array<Record<string, unknown>> = [];
  let pdfResults: Array<Record<string, unknown>> = [];

  type ConcoursItem = { id: string; slug: string; title_ar: string; title_fr: string; institution: string; category: string; city: string; year: number; deadline: string; postes_count: number; view_count: number };
  type DocumentItem = { id: string; slug: string; title_ar: string; title_fr: string; file_type: string; file_size: number; category: string; subject: string; year: number; download_count: number };

  if (q && q.trim()) {
    const searchTerm = q.trim();

    const [concoursRes, pdfRes] = await Promise.all([
      supabase
        .from("concours")
        .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
        .eq("is_active", true)
        .or(`title_ar.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("documents")
        .select("id, slug, title_ar, title_fr, file_type, file_size, category, subject, year, download_count")
        .or(`title_ar.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    concoursResults = concoursRes.data || [];
    pdfResults = pdfRes.data || [];
  }

  const totalResults = concoursResults.length + pdfResults.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.search.title, href: `/${locale}/recherche` }]}
        locale={locale}
      />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict.search.title}</h1>
        {q && (
          <p className="text-muted">
            {dict.search.results_for} <span className="font-medium text-foreground">{q}</span>
            {totalResults > 0 && (
              <span className="ml-2">
                ({totalResults} {dict.common.items})
              </span>
            )}
          </p>
        )}
      </div>

      {!q || !q.trim() ? (
        <EmptyState
          title={dict.nav.search}
          description={dict.hero.search_placeholder}
          icon={<Search className="h-8 w-8 text-muted-foreground" />}
        />
      ) : totalResults === 0 ? (
        <EmptyState
          title={`${dict.search.no_results} "${q}"`}
          description={dict.search.try_again}
        />
      ) : (
        <div className="space-y-10">
          {concoursResults.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{dict.nav.concours}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {concoursResults.map((item) => (
                  <ConcoursCard
                    key={item.id as string}
                    concours={item as unknown as ConcoursItem}
                    dict={dict}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

          {pdfResults.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{dict.nav.library}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfResults.map((doc) => (
                  <PDFCard
                    key={doc.id as string}
                    document={doc as unknown as DocumentItem}
                    dict={dict}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
