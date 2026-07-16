export interface Concours {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  description_ar: string | null;
  description_fr: string | null;
  institution: string;
  category: string;
  city: string | null;
  year: number;
  deadline: string | null;
  concours_date: string | null;
  eligibility_ar: string | null;
  eligibility_fr: string | null;
  diploma_required_ar: string | null;
  diploma_required_fr: string | null;
  official_pdf_url: string | null;
  source_url: string | null;
  postes_count: number | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConcoursListItem {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  institution: string;
  category: string;
  city: string | null;
  year: number;
  deadline: string | null;
  postes_count: number | null;
  view_count: number;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_fr: string;
  description_ar: string | null;
  description_fr: string | null;
  icon: string | null;
  sort_order: number;
}

export type Locale = "ar" | "fr";

export interface ConcoursFilters {
  category?: string;
  city?: string;
  year?: number;
  institution?: string;
  search?: string;
  page?: number;
  limit?: number;
}
