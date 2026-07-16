export interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  content_ar: string;
  content_fr: string;
  excerpt_ar: string | null;
  excerpt_fr: string | null;
  category: string | null;
  featured_image_url: string | null;
  author_name: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  excerpt_ar: string | null;
  excerpt_fr: string | null;
  category: string | null;
  featured_image_url: string | null;
  author_name: string;
  created_at: string;
}

export interface Annales {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  institution: string;
  category: string;
  subject: string;
  year: number;
  file_url: string;
  correction_url: string | null;
  view_count: number;
  created_at: string;
}
