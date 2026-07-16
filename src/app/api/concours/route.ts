import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = await createClient();

    let query = supabase
      .from("concours")
      .select("id, slug, title_ar, title_fr, institution, category, city, year, deadline, postes_count, view_count", { count: "exact" })
      .eq("is_active", true);

    if (category) query = query.eq("category", category);
    if (city) query = query.eq("city", city);
    if (year) query = query.eq("year", parseInt(year, 10));

    const offset = (page - 1) * limit;
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Concours API error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (e) {
    logger.error("Concours API unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
