"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ConcoursListItem } from "@/types/concours";
import { ConcoursCard } from "./ConcoursCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Filter, X } from "lucide-react";

interface ConcoursGridProps {
  concours: ConcoursListItem[];
  dict: Dictionary;
  locale: Locale;
  currentPage: number;
  totalPages: number;
  filters: { category?: string; city?: string; year?: string };
  cities: string[];
  years: number[];
}

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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "category" && filters.category) params.set("category", filters.category);
    if (key !== "city" && filters.city) params.set("city", filters.city);
    if (key !== "year" && filters.year) params.set("year", filters.year);

    if (value) params.set(key, value);
    params.set("page", "1");

    router.push(`/${locale}/concours?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${locale}/concours`);
  };

  const hasFilters = filters.category || filters.city || filters.year;

  return (
    <div>
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
              onChange={(e) => updateFilter("category", e.target.value)}
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
              onChange={(e) => updateFilter("city", e.target.value)}
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
              onChange={(e) => updateFilter("year", e.target.value)}
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
            {concours.map((item) => (
              <ConcoursCard key={item.id} concours={item} dict={dict} locale={locale} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/concours?page=${currentPage - 1}${filters.category ? `&category=${filters.category}` : ""}${filters.city ? `&city=${filters.city}` : ""}${filters.year ? `&year=${filters.year}` : ""}`}
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
                  href={`/${locale}/concours?page=${currentPage + 1}${filters.category ? `&category=${filters.category}` : ""}${filters.city ? `&city=${filters.city}` : ""}${filters.year ? `&year=${filters.year}` : ""}`}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
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
