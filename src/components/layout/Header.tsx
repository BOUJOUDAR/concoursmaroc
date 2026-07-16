"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SearchDialog } from "@/components/shared/SearchDialog";
import {
  Menu,
  X,
  Search,
  GraduationCap,
} from "lucide-react";

interface HeaderProps {
  dict: Dictionary;
  locale: Locale;
}

const navLinks = [
  { key: "concours", href: "/concours" },
  { key: "library", href: "/bibliotheque" },
  { key: "exams", href: "/annales" },
  { key: "blog", href: "/blog" },
  { key: "categories", href: "/categories" },
] as const;

export function Header({ dict, locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <GraduationCap className="h-7 w-7 text-brand-600" />
          <span className="text-brand-600">Concours</span>
          <span>Maroc</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-600",
                "dark:hover:bg-brand-950"
              )}
            >
              {dict.nav[link.key]}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={dict.nav.search}
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={`/${locale}${link.href}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                {dict.nav[link.key]}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchDialog
        dict={dict}
        locale={locale}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  );
}
