"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { Search } from "lucide-react";

interface SearchBarProps {
  dict: Dictionary;
  locale: Locale;
  size?: "lg" | "md";
}

export function SearchBar({ dict, locale, size = "lg" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute start-4 h-5 w-5 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.hero.search_placeholder}
          className={`w-full rounded-xl border border-border bg-background ps-12 pe-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow ${
            size === "lg" ? "py-4 text-base" : "py-3 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`absolute end-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors ${
            size === "lg" ? "px-6 py-2.5" : "px-4 py-2 text-sm"
          }`}
        >
          {dict.nav.search}
        </button>
      </div>
    </form>
  );
}
