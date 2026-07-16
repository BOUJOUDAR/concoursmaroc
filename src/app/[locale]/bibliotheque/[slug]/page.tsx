import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { generateSEOMetadata } from "@/lib/seo/generate-metadata";
import { formatFileSize } from "@/lib/utils/format-date";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FileText, Download, Eye } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("title_ar, title_fr, description_ar, description_fr")
    .eq("slug", slug)
    .single();

  if (!doc) return {};

  const title = locale === "ar" ? doc.title_ar : doc.title_fr;
  const description = locale === "ar" ? doc.description_ar : doc.description_fr;

  return generateSEOMetadata({
    title,
    description: description || dict.hero.subtitle,
    locale,
    path: `/bibliotheque/${slug}`,
  });
}

export default async function PDFDetailPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params; const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!doc) notFound();

  // Increment download count
  await supabase
    .from("documents")
    .update({ download_count: doc.download_count + 1 })
    .eq("id", doc.id);

  const title = locale === "ar" ? doc.title_ar : doc.title_fr;
  const description = locale === "ar" ? doc.description_ar : doc.description_fr;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: dict.pdf.title, href: `/${locale}/bibliotheque` },
          { label: title, href: `/${locale}/bibliotheque/${slug}` },
        ]}
        locale={locale}
      />

      <div className="mt-8 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-xl bg-brand-100 dark:bg-brand-900 p-4">
            <FileText className="h-8 w-8 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="uppercase font-medium">{doc.file_type}</span>
              <span>{formatFileSize(doc.file_size)}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {doc.download_count}
              </span>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-muted mb-6 whitespace-pre-line">{description}</p>
        )}

        {doc.subject && (
          <p className="text-sm mb-4">
            <span className="font-medium">{dict.pdf.subject}:</span> {doc.subject}
          </p>
        )}

        {doc.year && (
          <p className="text-sm mb-6">
            <span className="font-medium">{dict.concours.year}:</span> {doc.year}
          </p>
        )}

        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          {dict.pdf.download}
        </a>
      </div>
    </div>
  );
}
