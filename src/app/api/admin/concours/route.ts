import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { concoursSchema } from "@/lib/validators/concours";
import { logger } from "@/lib/utils/logger";

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-secret");
  return authHeader === process.env.ADMIN_SECRET;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("concours")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Admin concours GET error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    logger.error("Admin concours GET unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = concoursSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("concours")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      logger.error("Admin concours POST error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info("Admin concours created", { id: data.id, slug: data.slug });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    logger.error("Admin concours POST unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("concours")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Admin concours PUT error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info("Admin concours updated", { id: data.id });

    return NextResponse.json({ data });
  } catch (e) {
    logger.error("Admin concours PUT unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("concours")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      logger.error("Admin concours DELETE error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info("Admin concours soft-deleted", { id });

    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error("Admin concours DELETE unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
