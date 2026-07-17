import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { REVALIDATION_TIMES } from "@/lib/utils/constants";
import { Hero } from "@/components/home/Hero";
import { LatestConcours } from "@/components/home/LatestConcours";
import { PopularConcours } from "@/components/home/PopularConcours";
import { LatestPDFs } from "@/components/home/LatestPDFs";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { Stats } from "@/components/home/Stats";
import { FAQ } from "@/components/home/FAQ";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const [latestConcours, popularConcours, latestPDFs, categories] =
    await Promise.all([
      supabase
        .from("concours")
        .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("concours")
        .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
        .eq("is_active", true)
        .order("view_count", { ascending: false })
        .limit(6),
      supabase
        .from("documents")
        .select("id, slug, title_ar, title_fr, file_type, file_size, category, subject, year, download_count")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

  return (
    <>
      <Hero dict={dict} locale={locale} />
      <LatestConcours
        concours={latestConcours.data || []}
        dict={dict}
        locale={locale}
      />
      <PopularConcours
        concours={popularConcours.data || []}
        dict={dict}
        locale={locale}
      />
      <LatestPDFs
        documents={latestPDFs.data || []}
        dict={dict}
        locale={locale}
      />
      <CategoriesGrid
        categories={categories.data || []}
        dict={dict}
        locale={locale}
      />
      <Stats dict={dict} />
      <FAQ dict={dict} />
    </>
  );
}

export const revalidate = 3600;
