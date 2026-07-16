import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterSchema } from "@/lib/validators/concours";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email, locale } = parsed.data;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, locale }, { onConflict: "email" });

    if (error) {
      logger.error("Newsletter subscription error", { error: error.message, email });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info("Newsletter subscription", { email, locale });

    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error("Newsletter API unexpected error", {
      error: e instanceof Error ? e.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
