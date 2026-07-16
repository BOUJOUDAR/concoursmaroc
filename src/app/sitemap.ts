import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://concoursmaroc.ma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/ar`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/fr`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/ar/concours`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/fr/concours`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/ar/bibliotheque`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/fr/bibliotheque`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/ar/annales`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/fr/annales`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/ar/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/fr/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/ar/categories`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/fr/categories`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/ar/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/fr/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/ar/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/fr/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/ar/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/fr/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/ar/conditions-generales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/fr/conditions-generales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const { data: concours } = await supabase.from("concours").select("slug, updated_at").eq("is_active", true);
  const concoursPages = (concours || []).flatMap((c) => [
    { url: `${BASE_URL}/ar/concours/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/fr/concours/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const, priority: 0.7 },
  ]);

  const { data: articles } = await supabase.from("articles").select("slug, updated_at").eq("is_published", true);
  const articlePages = (articles || []).flatMap((a) => [
    { url: `${BASE_URL}/ar/blog/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/fr/blog/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "monthly" as const, priority: 0.6 },
  ]);

  const { data: categories } = await supabase.from("categories").select("slug");
  const categoryPages = (categories || []).flatMap((c) => [
    { url: `${BASE_URL}/ar/categories/${c.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/fr/categories/${c.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ]);

  return [...staticPages, ...concoursPages, ...articlePages, ...categoryPages];
}
