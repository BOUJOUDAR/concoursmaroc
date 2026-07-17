export const SITE_CONFIG = {
  name: {
    ar: "concoursMaroc",
    fr: "ConcoursMaroc",
  },
  description: {
    ar: "منصة مجانية للتحضير للمسابقات المغربية. آلاف الوثائق والامتحانات السابقة والمقالات التعليمية.",
    fr: "Plateforme gratuite de préparation aux concours marocains. Des milliers de documents, annales et articles éducatifs.",
  },
  url: process.env.NEXT_PUBLIC_APP_URL || "https://concoursmaroc-nu.vercel.app",
  ogImage: "/og-default.png",
  keywords: {
    ar: [
      "مسابقات مغربية",
      "concours maroc",
      "ENSA",
      "ENSAM",
      "ENCG",
      "طب",
      "هندسة",
      "تدريس",
      "وظيفة عمومية",
    ],
    fr: [
      "concours maroc",
      "concours ENSA",
      "concours ENSAM",
      "concours ENCG",
      "médecine",
      "ingénieur",
      "enseignement",
      "fonction publique",
    ],
  },
} as const;

export const CATEGORIES_ICONS: Record<string, string> = {
  master: "GraduationCap",
  licence: "BookOpen",
  doctorat: "Award",
  ensa: "Building",
  ensam: "Wrench",
  encg: "TrendingUp",
  fst: "Atom",
  est: "Cpu",
  ens: "GraduationCap",
  ena: "Landmark",
  medecine: "Heart",
  pharmacie: "Pill",
  architecture: "Home",
  ingenieur: "Settings",
  education: "School",
  primaire: "BookOpen",
  secondaire: "BookOpen",
  lycee: "BookOpen",
  recrutement: "Users",
  bourses: "Gift",
  formation: "Training",
} as const;

export const ITEMS_PER_PAGE = 20;

export const REVALIDATION_TIMES = {
  homepage: 3600,
  concoursList: 1800,
  concoursDetail: 3600,
  pdfLibrary: 1800,
  blogArticle: 86400,
  categories: false, // Static, build time only
} as const;
