import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { REVALIDATION_TIMES, ITEMS_PER_PAGE } from "@/lib/utils/constants";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { BookOpen } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  return generateSEOMetadata({
    title: dict.blog.title,
    description: dict.hero.subtitle,
    locale,
    path: "/blog",
  });
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params; const locale = rawLocale as Locale;
  const { page } = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, count } = await supabase
    .from("articles")
    .select("id, slug, title_ar, title_fr, excerpt_ar, excerpt_fr, category, featured_image_url, author_name, created_at", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: dict.blog.title, href: `/${locale}/blog` }]}
        locale={locale}
      />
      <h1 className="text-3xl font-bold mb-8">{dict.blog.title}</h1>

      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((article) => (
              <ArticleCard key={article.id} article={article} dict={dict} locale={locale} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/blog?page=${currentPage - 1}`}
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
                  href={`/${locale}/blog?page=${currentPage + 1}`}
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
          title={dict.blog.no_results}
          icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}

export const revalidate = 86400;
