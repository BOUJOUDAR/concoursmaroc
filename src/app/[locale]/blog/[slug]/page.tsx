import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { generateArticleSchema } from "@/lib/seo/json-ld";
import { formatDate } from "@/lib/utils/format-date";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SITE_CONFIG } from "@/lib/utils/constants";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("title_ar, title_fr, excerpt_ar, excerpt_fr")
    .eq("slug", slug)
    .single();

  if (!article) return {};

  const title = locale === "ar" ? article.title_ar : article.title_fr;
  const description = locale === "ar" ? article.excerpt_ar : article.excerpt_fr;

  return generateSEOMetadata({
    title,
    description: description || dict.hero.subtitle,
    locale,
    path: `/blog/${slug}`,
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

  // Increment view count
  await supabase
    .from("articles")
    .update({ view_count: article.view_count + 1 })
    .eq("id", article.id);

  const title = locale === "ar" ? article.title_ar : article.title_fr;
  const content = locale === "ar" ? article.content_ar : article.content_fr;
  const pageUrl = `${SITE_CONFIG.url}/${locale}/blog/${slug}`;

  const articleSchema = generateArticleSchema({
    title,
    description: locale === "ar" ? article.excerpt_ar || "" : article.excerpt_fr || "",
    url: pageUrl,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: article.author_name,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: dict.blog.title, href: `/${locale}/blog` },
            { label: title, href: `/${locale}/blog/${slug}` },
          ]}
          locale={locale}
        />

        <header className="mt-8 mb-8">
          {article.category && (
            <span className="inline-flex items-center rounded-full bg-accent-100 dark:bg-accent-900 px-3 py-1 text-xs font-medium text-accent-700 dark:text-accent-300 mb-4">
              {article.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>{article.author_name}</span>
            <span>•</span>
            <span>{formatDate(article.created_at, locale)}</span>
          </div>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {content.split("\n").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </>
  );
}
