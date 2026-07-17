"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ConcoursListItem } from "@/types/concours";
import { ConcoursCard } from "./ConcoursCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/shared/EmptyState";
import { Filter, X } from "lucide-react";

interface ConcoursGridProps {
  concours: ConcoursListItem[];
  dict: Dictionary;
  locale: Locale;
  currentPage: number;
  totalPages: number;
  filters: { category?: string; city?: string; year?: string; status?: string };
  cities: string[];
  years: number[];
}

const STATUS_FILTERS: { key: string; dot: string }[] = [
  { key: "all", dot: "" },
  { key: "open", dot: "bg-green-500" },
  { key: "closing_soon", dot: "bg-yellow-500" },
  { key: "closed", dot: "bg-red-500" },
];

export function ConcoursGrid({
  concours,
  dict,
  locale,
  currentPage,
  totalPages,
  filters,
  cities,
  years,
}: ConcoursGridProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const keys = ["category", "city", "year", "status"] as const;
    for (const k of keys) {
      const val = overrides[k] !== undefined ? overrides[k] : filters[k];
      if (val) params.set(k, val);
    }
    params.set("page", "1");
    return `/${locale}/concours?${params.toString()}`;
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.year) params.set("year", filters.year);
    if (filters.status) params.set("status", filters.status);
    params.set("page", String(page));
    return `/${locale}/concours?${params.toString()}`;
  };

  const clearFilters = () => {
    router.push(`/${locale}/concours`);
  };

  const hasFilters = filters.category || filters.city || filters.year || filters.status;

  const statusLabel = (key: string): string => {
    const map: Record<string, string> = {
      all: dict.concours.status_all,
      open: dict.concours.status_open,
      closing_soon: dict.concours.status_closing_soon,
      closed: dict.concours.status_closed,
    };
    return map[key];
  };

  return (
    <div>
      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(({ key, dot }) => {
          const active = (filters.status || "all") === key;
          return (
            <button
              key={key}
              onClick={() => router.push(buildUrl({ status: key === "all" ? undefined : key }))}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-brand text-brand-foreground"
                  : "bg-card border border-border text-muted hover:bg-muted hover:text-foreground"
              }`}
            >
              {dot && (
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${active ? "bg-brand-foreground" : dot}`} />
              )}
              {statusLabel(key)}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
        >
          <Filter className="h-4 w-4" />
          {dict.concours.filters}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 ml-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            {dict.common.close}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.concours.category}</label>
            <select
              value={filters.category || ""}
              onChange={(e) => router.push(buildUrl({ category: e.target.value || undefined }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
            >
              <option value="">{dict.concours.all_categories}</option>
              <option value="ensa">ENSA</option>
              <option value="ensam">ENSAM</option>
              <option value="encg">ENCG</option>
              <option value="fst">FST</option>
              <option value="est">EST</option>
              <option value="medecine">{locale === "ar" ? "طب" : "Médecine"}</option>
              <option value="education">{locale === "ar" ? "تعليم" : "Éducation"}</option>
              <option value="recrutement">{locale === "ar" ? "توظيف عمومي" : "Recrutement"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.concours.city}</label>
            <select
              value={filters.city || ""}
              onChange={(e) => router.push(buildUrl({ city: e.target.value || undefined }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
            >
              <option value="">{dict.concours.all_cities}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.concours.year}</label>
            <select
              value={filters.year || ""}
              onChange={(e) => router.push(buildUrl({ year: e.target.value || undefined }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
            >
              <option value="">{dict.concours.all_years}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      {concours.length === 0 ? (
        <EmptyState title={dict.concours.no_results} />
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <a href={buildPageUrl(currentPage - 1)} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                  {dict.common.previous}
                </a>
              )}
              <span className="px-4 py-2 text-sm text-muted">
                {currentPage} {dict.common.of} {totalPages}
              </span>
              {currentPage < totalPages && (
                <a href={buildPageUrl(currentPage + 1)} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                  {dict.common.next}
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
