import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ConcoursListItem } from "@/types/concours";
import { formatDate, formatNumber } from "@/lib/utils/format-date";
import { Calendar, MapPin, Building2, Users, Eye, Clock } from "lucide-react";

interface ConcoursCardProps {
  concours: ConcoursListItem;
  dict: Dictionary;
  locale: Locale;
}

function getConcoursStatus(deadline: string | null): { label: { ar: string; fr: string }; color: string } | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays <= 3) return { label: { ar: "ينتهي قريباً", fr: "Se termine bientôt" }, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
  if (diffDays <= 14) return { label: { ar: "مفتوح", fr: "Ouvert" }, color: "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300" };
  return { label: { ar: "مغلق", fr: "Ouvert" }, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
}

export function ConcoursCard({ concours, dict, locale }: ConcoursCardProps) {
  const title = locale === "ar" ? concours.title_ar : concours.title_fr;
  const hasDeadline = concours.deadline && new Date(concours.deadline) > new Date();
  const status = getConcoursStatus(concours.deadline);
  const isAr = locale === "ar";

  return (
    <Link
      href={`/${locale}/concours/${concours.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-brand-900 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300">
            {concours.category.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            {status && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                <Clock className="h-3 w-3" />
                {status.label[locale as "ar" | "fr"]}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted">
              <Eye className="h-3 w-3" />
              {formatNumber(concours.view_count)}
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-card-foreground group-hover:text-brand-600 transition-colors line-clamp-2 mb-3">
          {title}
        </h3>

        <div className="space-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{concours.institution}</span>
          </div>
          {concours.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{concours.city}</span>
            </div>
          )}
          {concours.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className={hasDeadline ? "text-accent-600 font-medium" : ""}>
                {formatDate(concours.deadline, locale)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/30">
        {concours.postes_count && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Users className="h-3 w-3" />
            <span>
              {concours.postes_count} {dict.concours.postes}
            </span>
          </div>
        )}
        <span className="text-xs text-brand-600 font-medium group-hover:underline">
          {isAr ? "عرض التفاصيل" : "Voir les détails"} →
        </span>
      </div>
    </Link>
  );
}
