"use client";

import { motion } from "framer-motion";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { BookOpen, FileText, Building2, FolderOpen } from "lucide-react";

interface StatsProps {
  dict: Dictionary;
}

const stats = [
  { key: "total_concours", icon: BookOpen, value: "2500+", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-950" },
  { key: "total_pdfs", icon: FileText, value: "10000+", color: "text-accent-600", bg: "bg-accent-50 dark:bg-accent-950" },
  { key: "total_institutions", icon: Building2, value: "150+", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  { key: "total_categories", icon: FolderOpen, value: "21", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
];

export function Stats({ dict }: StatsProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-12">
          {dict.home.statistics}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className={`inline-flex rounded-xl ${stat.bg} p-3 mb-4 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted font-medium">
                  {dict.home[stat.key as keyof typeof dict.home]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
