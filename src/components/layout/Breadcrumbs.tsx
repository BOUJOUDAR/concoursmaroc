import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: Locale;
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const isRtl = locale === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1.5 text-sm text-muted flex-wrap">
        <li>
          <Link
            href={`/${locale}`}
            className="hover:text-brand-600 transition-colors"
          >
            {isRtl ? "الرئيسية" : "Accueil"}
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <Chevron className="h-3 w-3 shrink-0" />
            {i === items.length - 1 ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-brand-600 transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
