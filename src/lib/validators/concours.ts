import { z } from "zod";

export const concoursSchema = z.object({
  slug: z.string().min(1),
  title_ar: z.string().min(1),
  title_fr: z.string().min(1),
  description_ar: z.string().nullable(),
  description_fr: z.string().nullable(),
  institution: z.string().min(1),
  category: z.string().min(1),
  city: z.string().nullable(),
  year: z.number().int().min(2000).max(2030),
  deadline: z.string().nullable(),
  concours_date: z.string().nullable(),
  eligibility_ar: z.string().nullable(),
  eligibility_fr: z.string().nullable(),
  diploma_required_ar: z.string().nullable(),
  diploma_required_fr: z.string().nullable(),
  official_pdf_url: z.string().url().nullable(),
  source_url: z.string().url().nullable(),
  postes_count: z.number().int().positive().nullable(),
  is_active: z.boolean().default(true),
});

export const documentSchema = z.object({
  slug: z.string().min(1),
  title_ar: z.string().min(1),
  title_fr: z.string().min(1),
  description_ar: z.string().nullable(),
  description_fr: z.string().nullable(),
  file_url: z.string().url(),
  file_type: z.enum(["pdf", "doc", "docx", "txt"]),
  file_size: z.number().int().positive().nullable(),
  concours_id: z.string().uuid().nullable(),
  category: z.string().min(1),
  subject: z.string().nullable(),
  year: z.number().int().min(2000).max(2030).nullable(),
});

export const articleSchema = z.object({
  slug: z.string().min(1),
  title_ar: z.string().min(1),
  title_fr: z.string().min(1),
  content_ar: z.string().min(1),
  content_fr: z.string().min(1),
  excerpt_ar: z.string().nullable(),
  excerpt_fr: z.string().nullable(),
  category: z.string().nullable(),
  featured_image_url: z.string().url().nullable(),
  is_published: z.boolean().default(true),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  locale: z.enum(["ar", "fr"]).default("ar"),
});
