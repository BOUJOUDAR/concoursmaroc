import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ArticleListItem } from "@/types/blog";
import { formatRelativeDate } from "@/lib/utils/format-date";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  article: ArticleListItem;
  dict: Dictionary;
  locale: Locale;
}

export function ArticleCard({ article, dict, locale }: ArticleCardProps) {
  const title = locale === "ar" ? article.title_ar : article.title_fr;
  const excerpt = locale === "ar" ? article.excerpt_ar : article.excerpt_fr;

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      <div className="p-5 flex-1">
        {article.category && (
          <span className="inline-flex items-center rounded-full bg-accent-100 dark:bg-accent-900 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:text-accent-300 mb-3">
            {article.category}
          </span>
        )}
        <h3 className="font-semibold text-card-foreground group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-muted line-clamp-3 mb-4">{excerpt}</p>
        )}
      </div>
      <div className="border-t border-border px-5 py-3 flex items-center justify-between text-xs text-muted bg-muted/30">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {article.author_name}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatRelativeDate(article.created_at, locale)}
        </div>
      </div>
    </Link>
  );
}
