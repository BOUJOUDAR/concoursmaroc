import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const searchTerm = q.trim();
    const supabase = await createClient();

    const [concoursRes, documentsRes] = await Promise.all([
      supabase
        .from("concours")
        .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count")
        .eq("is_active", true)
        .or(`title_ar.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%,institution.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("documents")
        .select("id, slug, title_ar, title_fr, file_type, file_size, category, subject, year, download_count")
        .or(`title_ar.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (concoursRes.error) {
      logger.error("Search API concours error", { error: concoursRes.error.message });
    }
    if (documentsRes.error) {
      logger.error("Search API documents error", { error: documentsRes.error.message });
    }

    return NextResponse.json({
      concours: concoursRes.data || [],
      documents: documentsRes.data || [],
      total: (concoursRes.data?.length || 0) + (documentsRes.data?.length || 0),
    });
  } catch (e) {
    logger.error("Search API unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
