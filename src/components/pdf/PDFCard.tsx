import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type DocumentListItem } from "@/types/pdf";
import { formatFileSize, formatNumber } from "@/lib/utils/format-date";
import { FileText, Download } from "lucide-react";

interface PDFCardProps {
  document: DocumentListItem;
  dict: Dictionary;
  locale: Locale;
}

const fileTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  doc: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  docx: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  txt: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function PDFCard({ document, dict, locale }: PDFCardProps) {
  const title = locale === "ar" ? document.title_ar : document.title_fr;

  return (
    <Link
      href={`/${locale}/bibliotheque/${document.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      {/* Icon Header */}
      <div className="flex items-center justify-center py-8 bg-muted/30">
        <div className="rounded-xl bg-brand-100 dark:bg-brand-900 p-4 group-hover:scale-110 transition-transform">
          <FileText className="h-8 w-8 text-brand-600" />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              fileTypeColors[document.file_type] || fileTypeColors.pdf
            }`}
          >
            {document.file_type.toUpperCase()}
          </span>
          {document.year && (
            <span className="text-xs text-muted">{document.year}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-card-foreground group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 flex-1">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{formatFileSize(document.file_size)}</span>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {formatNumber(document.download_count)}
          </div>
        </div>
      </div>
    </Link>
  );
}
