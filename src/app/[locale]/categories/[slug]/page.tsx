import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { ConcoursCard } from "@/components/concours/ConcoursCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("categories")
    .select("name_ar, name_fr")
    .eq("slug", slug)
    .single();

  if (!cat) return {};

  const name = locale === "ar" ? cat.name_ar : cat.name_fr;

  return generateSEOMetadata({
    title: `${name} - ${dict.categories.title}`,
    description: dict.hero.subtitle,
    locale,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const name = locale === "ar" ? category.name_ar : category.name_fr;
  const description = locale === "ar" ? category.description_ar : category.description_fr;

  const { data: concours } = await supabase
    .from("concours")
    .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
    .eq("category", slug)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: dict.categories.title, href: `/${locale}/categories` },
          { label: name, href: `/${locale}/categories/${slug}` },
        ]}
        locale={locale}
      />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        {description && <p className="text-muted">{description}</p>}
      </div>

      {concours && concours.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {concours.map((item) => (
            <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState title={dict.concours.no_results} />
      )}
    </div>
  );
}
