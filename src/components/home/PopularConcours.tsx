import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ConcoursListItem } from "@/types/concours";
import { ConcoursCard } from "@/components/concours/ConcoursCard";
import { ArrowRight } from "lucide-react";

interface PopularConcoursProps {
  concours: ConcoursListItem[];
  dict: Dictionary;
  locale: Locale;
}

export function PopularConcours({ concours, dict, locale }: PopularConcoursProps) {
  if (concours.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{dict.home.popular_concours}</h2>
          <Link
            href={`/${locale}/concours`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {dict.home.view_all}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {concours.map((item) => (
            <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
