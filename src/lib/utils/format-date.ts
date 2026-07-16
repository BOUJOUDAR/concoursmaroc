export function formatDate(dateString: string, locale: "ar" | "fr"): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatRelativeDate(dateString: string, locale: "ar" | "fr"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (locale === "ar") {
    if (days === 0) return "اليوم";
    if (days === 1) return "أمس";
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    return formatDate(dateString, locale);
  }

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  return formatDate(dateString, locale);
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ar-MA").format(num);
}
