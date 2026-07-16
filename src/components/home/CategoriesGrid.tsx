"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type Category } from "@/types/concours";
import {
  GraduationCap,
  BookOpen,
  Award,
  Building,
  Wrench,
  TrendingUp,
  Atom,
  Cpu,
  Landmark,
  Heart,
  Pill,
  Home,
  Settings,
  School,
  Users,
  Gift,
  Briefcase,
} from "lucide-react";

interface CategoriesGridProps {
  categories: Category[];
  dict: Dictionary;
  locale: Locale;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  BookOpen,
  Award,
  Building,
  Wrench,
  TrendingUp,
  Atom,
  Cpu,
  Landmark,
  Heart,
  Pill,
  Home,
  Settings,
  School,
  Users,
  Gift,
  Training: Briefcase,
};

export function CategoriesGrid({ categories, dict, locale }: CategoriesGridProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-10">
          {dict.categories.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon || "BookOpen"] || BookOpen;
            const name = locale === "ar" ? cat.name_ar : cat.name_fr;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/${locale}/categories/${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="rounded-full bg-brand-100 dark:bg-brand-900 p-3">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-center line-clamp-2">
                    {name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
