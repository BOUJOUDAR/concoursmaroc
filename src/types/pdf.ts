export interface Document {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  description_ar: string | null;
  description_fr: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  concours_id: string | null;
  category: string;
  subject: string | null;
  year: number | null;
  download_count: number;
  created_at: string;
}

export interface DocumentListItem {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  file_type: string;
  file_size: number | null;
  category: string;
  subject: string | null;
  year: number | null;
  download_count: number;
}

export type FileType = "pdf" | "doc" | "docx" | "txt";
