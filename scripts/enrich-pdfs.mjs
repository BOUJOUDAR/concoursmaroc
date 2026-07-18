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
const STORAGE_BUCKET = "documents";

const PDF_TYPES = {
  "arrete": "قرار فتح المباراة",
  "list_convoques": "لائحة المترشحين المدعوين لاجتياز المباراة",
  "list_convoques_oral": "لائحة المدعوين لإجراء الاختبار الشفوي",
  "list_resultats": "نتيجة المباراة",
  "list_attente": "لائحة الانتظار",
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function downloadPdf(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/pdf,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("pdf")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch { return null; }
}

async function uploadToStorage(storagePath, pdfBuffer) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) return null;
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return urlData?.publicUrl || null;
}

function buildStoragePath(slug, type) {
  const safe = (slug || "concours").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
  return `concours-pdfs/${safe}_${type}.pdf`;
}

async function main() {
  const onlyId = process.argv[2]; // optional: pass a concour ID to process just one
  console.log("=== Download & upload PDFs to Supabase Storage ===\n");

  let query = supabase
    .from("concours")
    .select("id, slug, source_url, official_pdf_url")
    .not("source_url", "is", null);

  if (onlyId) {
    query = query.eq("id", onlyId);
  }

  const { data: concours, error } = await query;
  if (error) { console.error(error); return; }
  console.log(`Found ${concours.length} concours to process\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < concours.length; i++) {
    const c = concours[i];
    if (!c.source_url) continue;

    console.log(`[${i + 1}/${concours.length}] ${c.slug}`);

    const html = await fetchPage(c.source_url);
    if (!html) { console.log("  Failed to fetch detail page"); failed++; continue; }

    const $ = load(html);
    const pdfs = {};

    for (const [type, label] of Object.entries(PDF_TYPES)) {
      const href = $(`a[href*='${type}']`).attr("href");
      if (!href) continue;

      const pdfUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      console.log(`  Downloading ${type}...`);

      const pdfBuffer = await downloadPdf(pdfUrl);
      if (!pdfBuffer) {
        console.log(`    Failed to download ${type}`);
        continue;
      }

      const storagePath = buildStoragePath(c.slug, type);
      const publicUrl = await uploadToStorage(storagePath, pdfBuffer);
      if (!publicUrl) {
        console.log(`    Failed to upload ${type}`);
        continue;
      }

      console.log(`    OK (${(pdfBuffer.length / 1024).toFixed(0)} KB) -> ${storagePath}`);
      pdfs[type] = { url: publicUrl, label, storagePath };
      await sleep(500);
    }

    if (Object.keys(pdfs).length > 0) {
      const { error: updateErr } = await supabase
        .from("concours")
        .update({ official_pdf_url: JSON.stringify(pdfs) })
        .eq("id", c.id);

      if (updateErr) {
        console.error(`  DB update failed: ${updateErr.message}`);
        failed++;
      } else {
        console.log(`  Saved ${Object.keys(pdfs).length} PDFs to DB`);
        uploaded++;
      }
    } else {
      console.log("  No PDFs found on detail page");
    }

    await sleep(1000);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
