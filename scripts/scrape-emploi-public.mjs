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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = "https://www.emploi-public.ma";
const LISTING_PATH = "/ar/%D9%82%D8%A7%D8%A6%D9%85%D8%A9-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA";
const MAX_PAGES = parseInt(process.env.MAX_PAGES || "10", 10);
const DELAY_MS = 1500;

const ARABIC_MONTHS = {
  "يناير": 1, "فبراير": 2, "مارس": 3, "أبريل": 4, "ابريل": 4,
  "ماي": 5, "مايو": 5, "يونيو": 6, "يوليوز": 7, "غشت": 8,
  "شتنبر": 9, "أكتوبر": 10, "نونبر": 11, "دجنبر": 12,
};

function parseArabicDate(str) {
  if (!str) return null;
  const cleaned = str.replace(/[-–]/g, " ").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const month = ARABIC_MONTHS[parts[1]];
  const year = parseInt(parts[2], 10);
  if (!day || !month || !year) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractCity(institution) {
  if (!institution) return null;
  const cityPatterns = [
    "الدارالبيضاء", "الدار البيضاء", " Casablanca",
    "الرباط", "Rabat",
    "فاس", "Fès", "Fes",
    "مراكش", "Marrakech",
    "طنجة", "Tanger", "Tangier",
    "أكادير", "Agadir",
    "مكناس", "Meknès", "Meknes",
    "وجدة", "Oujda",
    "الناظور", "Nador",
    "آسفي", "آسفي",
    "القنيطرة", "Kénitra", "Kenitra",
    "بني ملال", "Beni Mellal",
    "خنيفرة", "Khénifra",
    "سطات", "Settat",
    "الجديدة", "El Jadida",
    "ورزازات", "Ouarzazate",
    "العيون", "Laayoune",
    "الداخلة", "Dakhla",
    "تازة", "Taza",
    "الحسيمة", "Al Hoceima",
    "تارودانت", "Taroudant",
    "قلعة السراغنة", "Kalaa Sraghna",
    "الصويرة", "Essaouira",
    "وزان", "Ouezzane",
    "سلا", "Salé",
    "تمارة", "Temara",
    "المحمدية", "Mohammedia",
    "الصخيرات", "Skhirat",
    "بركان", "Berkane",
    "تاوريرت", "Taourirt",
    "جرادة", "Jerada",
    "الفقيه بنصالح", "Fquih Ben Salah",
    "بوعرفة", "Bouarfa",
    "اطران", "Errachidia",
    "زاكورة", "Zagora",
    "طاطا", "Tata",
    "كلميم", "Goulimine",
    "السمارة", "Smara",
    "بوجدور", "Boujdour",
    "العيون", "Laayoune",
    "المحاميد", "Mehamid",
  ];
  const lower = institution.toLowerCase();
  for (const city of cityPatterns) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return null;
}

async function fetchPage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en;q=0.9",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      console.error(`  Attempt ${attempt}/${retries} failed for ${url}: ${err.message}`);
      if (attempt < retries) await sleep(2000 * attempt);
      else return null;
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseListingPage(html) {
  const $ = load(html);
  const items = [];

  $("a.card.card-scale").each((_, el) => {
    const $card = $(el);
    const href = $card.attr("href") || "";
    const uuidMatch = href.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

    const title = $card.find(".card-title").text().trim();
    const institution = $card.find(".card-text").text().trim().replace(/^[\u{1F3E0}\u{1F3DB}]\s*/u, "").trim();
    const status = $card.find(".card-type").first().text().trim();

    let positions = null;
    let deadline = null;
    let concoursDate = null;

    $card.find(".card-footer div").each((_, div) => {
      const text = $(div).text().trim();
      if (text.includes("منصب") || text.includes("مناصب")) {
        const numMatch = text.match(/(\d+)/);
        if (numMatch) positions = parseInt(numMatch[1], 10);
      }
      if (text.includes("آخر أجل") || text.includes("إيداع")) {
        const dateStr = text.replace(/.*:\s*/, "").trim();
        deadline = parseArabicDate(dateStr);
      }
      if (text.includes("تاريخ إجراء") || text.includes("المباراة")) {
        const dateStr = text.replace(/.*:\s*/, "").trim();
        concoursDate = parseArabicDate(dateStr);
      }
    });

    if (title && uuidMatch) {
      items.push({
        title,
        institution,
        status,
        source_id: uuidMatch[1],
        source_url: `${BASE_URL}${href}`,
        positions,
        deadline,
        concoursDate,
      });
    }
  });

  return items;
}

async function fetchDetailPage(url) {
  const html = await fetchPage(url);
  if (!html) return null;
  const $ = load(html);
  const detail = {};

  const infoList = $(".s-content-box.full ul li");
  infoList.each((_, li) => {
    const text = $(li).text().trim();
    if (text.includes("تخصص")) {
      detail.specialization = text.replace(/.*:\s*/, "").trim();
    }
    if (text.includes("الدرجة")) {
      detail.grade = text.replace(/.*:\s*/, "").trim();
    }
    if (text.includes("عدد المناصب")) {
      const m = text.match(/(\d+)/);
      if (m) detail.positions = parseInt(m[1], 10);
    }
    if (text.includes("نوع التوظيف")) {
      detail.employmentType = text.replace(/.*:\s*/, "").trim();
    }
    if (text.includes("موقع الإيداع")) {
      const link = $(li).find("a").attr("href");
      if (link) detail.depositUrl = link;
    }
    if (text.includes("معلومات إضافية")) {
      detail.extraInfo = text.replace(/.*:\s*/, "").trim();
    }
    if (text.includes("رمز المباراة")) {
      detail.refCode = text.replace(/.*:\s*/, "").trim();
    }
  });

  const pdfLink = $("a[href*='/ar/تحميل/المباريات/arrete/']").attr("href");
  if (pdfLink) detail.arreteUrl = `${BASE_URL}${pdfLink}`;

  const websiteLink = $(".details-contact .form-info a").attr("href");
  if (websiteLink) detail.officialWebsite = websiteLink;

  const sidebar = $(".s-content-box");
  sidebar.each((_, box) => {
    const h3s = $(box).find("h3");
    h3s.each((_, h3) => {
      const span = $(h3).find("span").text().trim();
      const val = $(h3).text().replace(span, "").trim();
      if (span.includes("آخر أجل") && val) {
        detail.deadline = parseArabicDate(val);
      }
      if (span.includes("تاريخ إجراء") && val) {
        detail.concoursDate = parseArabicDate(val);
      }
      if (span.includes("تاريخ النشر") && val) {
        detail.publishDate = parseArabicDate(val);
      }
    });
  });

  return detail;
}

async function getExistingSourceUrls() {
  const urls = new Set();
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("concours")
      .select("source_url")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error("Error fetching existing concours:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row.source_url) urls.add(row.source_url);
    }
    if (data.length < pageSize) break;
    page++;
  }
  return urls;
}

function buildConcoursRecord(item, detail) {
  const now = new Date().toISOString();
  const titleAr = item.title;
  const titleFr = item.title;
  const slug = `${slugify(titleAr)}-${item.source_id.slice(0, 8)}`;

  let descriptionParts = [];
  if (detail?.specialization) descriptionParts.push(`التخصص: ${detail.specialization}`);
  if (detail?.grade) descriptionParts.push(`الدرجة: ${detail.grade}`);
  if (detail?.employmentType) descriptionParts.push(`نوع التوظيف: ${detail.employmentType}`);
  if (detail?.refCode) descriptionParts.push(`رمز المباراة: ${detail.refCode}`);
  if (detail?.extraInfo) descriptionParts.push(`معلومات إضافية: ${detail.extraInfo}`);

  return {
    slug,
    title_ar: titleAr,
    title_fr: titleFr,
    description_ar: descriptionParts.length > 0 ? descriptionParts.join("\n") : null,
    description_fr: null,
    institution: item.institution || "غير محدد",
    category: "recrutement",
    city: extractCity(item.institution),
    year: new Date().getFullYear(),
    deadline: detail?.deadline || item.deadline || null,
    concours_date: detail?.concoursDate || item.concoursDate || null,
    eligibility_ar: detail?.specialization || null,
    eligibility_fr: null,
    diploma_required_ar: detail?.grade || null,
    diploma_required_fr: null,
    official_pdf_url: detail?.arreteUrl || null,
    source_url: item.source_url,
    postes_count: detail?.positions || item.positions || null,
    is_active: true,
    view_count: 0,
    created_at: now,
    updated_at: now,
  };
}

async function main() {
  console.log("=== Scraper Emploi-Public.ma ===\n");
  console.log(`Scraping ${MAX_PAGES} pages from emploi-public.ma...\n`);

  const existingUrls = await getExistingSourceUrls();
  console.log(`Found ${existingUrls.size} existing concours in DB\n`);

  const allItems = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${BASE_URL}${LISTING_PATH}?page=${page}`;
    console.log(`Page ${page}/${MAX_PAGES}: ${url}`);

    const html = await fetchPage(url);
    if (!html) {
      console.log(`  Failed to fetch page ${page}, skipping`);
      continue;
    }

    const items = parseListingPage(html);
    console.log(`  Found ${items.length} concours`);

    for (const item of items) {
      if (existingUrls.has(item.source_url)) {
        continue;
      }
      allItems.push(item);
    }

    if (page < MAX_PAGES) await sleep(DELAY_MS);
  }

  console.log(`\nFound ${allItems.length} new concours to import\n`);

  if (allItems.length === 0) {
    console.log("Nothing new to import. Done!");
    return;
  }

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    console.log(`[${i + 1}/${allItems.length}] ${item.title}`);

    const detail = await fetchDetailPage(item.source_url);
    if (detail) {
      console.log(`  Detail fetched: ${detail.positions || "?"} postes, deadline: ${detail.deadline || "?"}`);
    }

    const record = buildConcoursRecord(item, detail);

    const { error } = await supabase.from("concours").insert(record);
    if (error) {
      console.error(`  FAILED: ${error.message}`);
      failed++;
    } else {
      console.log(`  OK`);
      imported++;
    }

    if (i < allItems.length - 1) await sleep(800);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (already exists): ${existingUrls.size}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
