import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ConcoursListItem } from "@/types/concours";
import { ConcoursCard } from "@/components/concours/ConcoursCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface LatestConcoursProps {
  concours: ConcoursListItem[];
  dict: Dictionary;
  locale: Locale;
}

export function LatestConcours({ concours, dict, locale }: LatestConcoursProps) {
  if (concours.length === 0) return null;
  const isAr = locale === "ar";

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{dict.home.latest_concours}</h2>
          <Link
            href={`/${locale}/concours`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {dict.home.view_all}
            {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {concours.slice(0, 3).map((item) => (
            <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
          ))}
          {concours.length > 3 && (
            <div className="col-span-full">
              <AdSlot placement="between-cards" className="max-w-lg mx-auto" />
            </div>
          )}
          {concours.slice(3).map((item) => (
            <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
