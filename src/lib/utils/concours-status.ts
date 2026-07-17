export type ConcoursStatus = "open" | "closing_soon" | "closed";

export function getConcoursStatus(deadline: string | null): ConcoursStatus | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "closed";
  if (diffDays <= 3) return "closing_soon";
  return "open";
}

export const STATUS_CONFIG: Record<ConcoursStatus, { labelAr: string; labelFr: string; color: string }> = {
  open: {
    labelAr: "مفتوح",
    labelFr: "Ouvert",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  closing_soon: {
    labelAr: "ينتهي قريباً",
    labelFr: "Se termine bientôt",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  closed: {
    labelAr: "مغلق",
    labelFr: "Fermé",
    color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};
