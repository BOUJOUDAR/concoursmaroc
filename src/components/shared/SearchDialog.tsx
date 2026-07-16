"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { X, Search } from "lucide-react";

interface SearchDialogProps {
  dict: Dictionary;
  locale: Locale;
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ dict, locale, open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/${locale}/recherche?q=${encodeURIComponent(query.trim())}`);
        onClose();
        setQuery("");
      }
    },
    [query, locale, router, onClose]
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
        <form onSubmit={handleSearch} className="flex items-center border-b border-border">
          <Search className="ml-4 h-5 w-5 text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.hero.search_placeholder}
            className="flex-1 px-4 py-4 bg-transparent outline-none text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="mr-4 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
        <div className="p-4 text-sm text-muted">
          {dict.nav.search}... Press Enter to search
        </div>
      </div>
    </div>
  );
}
