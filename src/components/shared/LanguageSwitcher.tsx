"use client";

import { useRouter, usePathname } from "next/navigation";
import { type Locale, i18n } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  locale: Locale;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale prefix
    const segments = pathname.split("/");
    const currentLocaleIndex = segments.findIndex((s) =>
      i18n.locales.includes(s as Locale)
    );

    if (currentLocaleIndex !== -1) {
      segments[currentLocaleIndex] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    router.push(segments.join("/"));
  };

  const otherLocale = locale === "ar" ? "fr" : "ar";

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted transition-colors"
      aria-label={`Switch to ${otherLocale === "ar" ? "Arabic" : "French"}`}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{otherLocale === "ar" ? "عربي" : "FR"}</span>
    </button>
  );
}
