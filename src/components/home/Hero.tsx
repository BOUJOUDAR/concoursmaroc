"use client";

import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { SearchBar } from "./SearchBar";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

interface HeroProps {
  dict: Dictionary;
  locale: Locale;
}

export function Hero({ dict, locale }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-brand-950 dark:via-background dark:to-accent-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-brand-900 px-4 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6">
              {dict.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="text-brand-600">{dict.hero.title_1}</span>
            <br />
            {dict.hero.title_2}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted mb-8 max-w-xl mx-auto"
          >
            {dict.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <SearchBar dict={dict} locale={locale} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={`/${locale}/concours`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-colors"
            >
              {dict.hero.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/bibliotheque`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              {dict.hero.cta_secondary}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
