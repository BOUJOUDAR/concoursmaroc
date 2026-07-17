import { load } from "cheerio";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const BASE_URL = "https://www.emploi-public.ma";

const PDF_TYPES = {
  "arrete": "قرار فتح المباراة",
  "list_convoques": "لائحة المترشحين المدعوين لاجتياز المباراة",
  "list_convoques_oral": "لائحة المدعوين لإجراء الاختبار الشفوي",
  "list_resultats": "نتيجة المباراة",
  "list_attente": "لائحة الانتظار",
};

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en;q=0.9",
      },
    });
    if (!res.ok) { console.log(`  HTTP ${res.status}`); return null; }
    return await res.text();
  } catch (e) { console.log(`  Fetch error: ${e.message}`); return null; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("=== Enriching existing concours with all PDF links ===\n");

  const { data: concours, error } = await supabase
    .from("concours")
    .select("id, source_url, official_pdf_url")
    .not("source_url", "is", null);

  if (error) { console.error(error); return; }
  console.log(`Found ${concours.length} concours with source_url\n`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < concours.length; i++) {
    const c = concours[i];
    if (!c.source_url) continue;

    // Check if already has JSON (multiple PDFs)
    if (c.official_pdf_url && c.official_pdf_url.startsWith("{")) {
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${concours.length}] ${c.source_url}`);

    const html = await fetchPage(c.source_url);
    if (!html) { console.log("  Failed to fetch"); continue; }

    const $ = load(html);
    const pdfs = {};

    for (const [type, label] of Object.entries(PDF_TYPES)) {
      const href = $(`a[href*='${type}']`).attr("href");
      if (href) pdfs[type] = { url: `${BASE_URL}${href}`, label };
    }

    if (Object.keys(pdfs).length > 0) {
      const { error: updateErr } = await supabase
        .from("concours")
        .update({ official_pdf_url: JSON.stringify(pdfs) })
        .eq("id", c.id);

      if (updateErr) {
        console.error(`  Update failed: ${updateErr.message}`);
      } else {
        console.log(`  Updated: ${Object.keys(pdfs).length} PDFs`);
        updated++;
      }
    } else {
      console.log("  No PDFs found");
    }

    await sleep(1000);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already JSON): ${skipped}`);
}

main().catch(console.error);
