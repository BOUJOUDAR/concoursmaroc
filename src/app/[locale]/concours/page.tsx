import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { REVALIDATION_TIMES, ITEMS_PER_PAGE } from "@/lib/utils/constants";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { ConcoursGrid } from "@/components/concours/ConcoursGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; city?: string; year?: string; status?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.concours.title,
    description: dict.hero.subtitle,
    locale,
    path: "/concours",
  });
}

export default async function ConcoursPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const { category, city, year, status, page } = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let query = supabase
    .from("concours")
    .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count", { count: "exact" })
    .eq("is_active", true);

  if (category) query = query.eq("category", category);
  if (city) query = query.eq("city", city);
  if (year) query = query.eq("year", parseInt(year, 10));

  if (status === "open") {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    query = query.gt("deadline", threeDaysFromNow.toISOString().split("T")[0]);
  } else if (status === "closing_soon") {
    const today = new Date().toISOString().split("T")[0];
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    query = query.gte("deadline", today).lte("deadline", threeDaysFromNow.toISOString().split("T")[0]);
  } else if (status === "closed") {
    const today = new Date().toISOString().split("T")[0];
    query = query.lt("deadline", today);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  const { data: citiesData } = await supabase
    .from("concours")
    .select("city")
    .eq("is_active", true)
    .not("city", "is", null);

  const cities = [...new Set((citiesData || []).map((c) => c.city).filter(Boolean))] as string[];

  const { data: yearsData } = await supabase
    .from("concours")
    .select("year")
    .eq("is_active", true);

  const years = [...new Set((yearsData || []).map((y) => y.year))].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.concours.title, href: `/${locale}/concours` }]}
        locale={locale}
      />
      <h1 className="text-3xl font-bold mb-8">{dict.concours.title}</h1>
      <ConcoursGrid
        concours={data || []}
        dict={dict}
        locale={locale}
        currentPage={currentPage}
        totalPages={totalPages}
        filters={{ category, city, year, status }}
        cities={cities}
        years={years}
      />
    </div>
  );
}

export const revalidate = 1800;
