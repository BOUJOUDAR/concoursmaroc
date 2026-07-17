import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type DocumentListItem } from "@/types/pdf";
import { PDFCard } from "@/components/pdf/PDFCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface LatestPDFsProps {
  documents: DocumentListItem[];
  dict: Dictionary;
  locale: Locale;
}

export function LatestPDFs({ documents, dict, locale }: LatestPDFsProps) {
  if (documents.length === 0) return null;
  const isAr = locale === "ar";

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{dict.home.latest_pdfs}</h2>
          <Link
            href={`/${locale}/bibliotheque`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {dict.home.view_all}
            {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.slice(0, 4).map((doc) => (
            <PDFCard key={doc.id} document={doc} dict={dict} locale={locale} />
          ))}
          {documents.length > 4 && (
            <div className="col-span-full">
              <AdSlot placement="between-cards" className="max-w-lg mx-auto" />
            </div>
          )}
          {documents.slice(4).map((doc) => (
            <PDFCard key={doc.id} document={doc} dict={dict} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
