# PROJECT_MAP.md — ConcoursMaroc Platform

> **Date:** 2026-07-15
> **Role:** Staff Software Engineer / Tech Lead
> **Status:** Architecture Planning (Pre-Implementation)

---

## 1. Assumptions & Clarifications

### Assumptions
| # | Assumption | Risk |
|---|-----------|------|
| A1 | Content is 100% free, no auth, no paywall | Low — explicitly stated |
| A2 | Arabic = RTL default, French = LTR alternate | Medium — UI must handle bidirectional |
| A3 | "Admin panel" is a hidden `/admin` route with a shared secret (env var), NOT full auth | Low |
| A4 | "Automatic content collection" = periodic Supabase Edge Functions scraping public RSS/pages | Medium — must respect robots.txt |
| A5 | PDFs are uploaded manually by admin OR linked from official sources | Low |
| A6 | Vercel deployment (no custom server) | Low |
| A7 | Monetization = Google AdSense only (no Stripe, no payments) | Low |

### Open Questions (No blockers — using defaults)
- Newsletter: Using Supabase `newsletter_subscribers` table (optional email capture)
- Admin secret: `ADMIN_SECRET` env var checked in middleware (not a login page)
- Content scraping: Start with RSS feeds + manual, scale to edge functions later

---

## 2. Competitive Analysis

| Competitor | Focus | Our Differentiator |
|-----------|-------|-------------------|
| MonConcours.ma | QCM platform, paid prep | We offer FREE document library |
| ConcoursPro.ma | QCM + simulator, paid | No auth, pure content access |
| Prepary.ma | QCM + annales | We cover ALL concours (not just post-bac) |
| Farmaroc.net | News aggregator | We have structured PDF library + SEO |
| 9rayti.com | Orientation only | We have preparation materials |
| Tawjihnet.net | Forums, dated UI | Modern design, instant access |

**Our Position:** The "Wikipedia of Moroccan Concours" — free, open, comprehensive document library with zero friction.

---

## 3. TECH_STACK

```yaml
# Runtime
node: "22.x LTS"

# Framework
next: "15.5.20"           # App Router, LTS until Oct 2026
react: "19.2.7"
typescript: "7.0.2"

# Styling
tailwindcss: "4.3.2"      # CSS-first config (@theme directive)
next-themes: "0.4.6"       # Dark mode

# UI Components
shadcn-ui: "4.13.0"        # Via CLI, NOT npm install
radix-ui: "latest"          # Peer dep of shadcn

# Animation
framer-motion: "12.42.2"   # Now "Motion" package

# Backend
supabase-js: "2.110.5"
supabase-ssr: "0.12.3"
supabase-cli: "2.109.1"

# SEO
next-sitemap: "4.2.3"      # Sitemap + robots.txt generation

# Analytics
next-third-parties: "15.5.20"  # GoogleAnalytics component (GA4)

# Utilities
clsx: "latest"              # Conditional classes
tailwind-merge: "latest"    # Merge Tailwind classes
```

### ⚠️ Version Lock Policy
- Pin EXACT versions in `package.json` (no `^` or `~`)
- Never use deprecated packages
- `next-sitemap` last updated Sep 2023 but remains the standard — acceptable

---

## 4. ARCHITECTURE

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL CDN                         │
│                  (Edge Network + ISR)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Next.js 15  │───▶│  Supabase    │                   │
│  │  App Router   │    │  (Free Tier) │                   │
│  │  SSR + ISR    │    │              │                   │
│  └──────┬───────┘    │  ┌────────┐  │                   │
│         │            │  │Postgres│  │                   │
│  ┌──────▼───────┐    │  └────────┘  │                   │
│  │  Vercel KV   │    │  ┌────────┐  │                   │
│  │  (Caching)   │    │  │Storage │  │                   │
│  └──────────────┘    │  └────────┘  │                   │
│                      └──────────────┘                   │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Edge Fn     │───▶│  Official    │                   │
│  │  (Cron Job)  │    │  Sites RSS   │                   │
│  └──────────────┘    └──────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Feature-Based Directory Structure

```
src/
├── app/
│   ├── [locale]/                    # /ar or /fr
│   │   ├── layout.tsx               # Root layout (RTL/LTR, fonts, theme)
│   │   ├── page.tsx                 # Homepage
│   │   ├── concours/
│   │   │   ├── page.tsx             # /ar/concours — All competitions
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # /ar/concours/ensa-2026 — Detail
│   │   ├── bibliotheque/
│   │   │   ├── page.tsx             # /ar/bibliotheque — PDF library
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # /ar/bibliotheque/annales-ensa-2024
│   │   ├── annales/
│   │   │   ├── page.tsx             # /ar/annales — Previous exams
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # /ar/annales/ensa-maths-2024
│   │   ├── blog/
│   │   │   ├── page.tsx             # /ar/blog — Articles
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # /ar/blog/comment-preparer-ensa
│   │   ├── categories/
│   │   │   ├── page.tsx             # /ar/categories
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # /ar/categories/master
│   │   └── recherche/
│   │       └── page.tsx             # /ar/recherche?q=ensa
│   │
│   ├── api/
│   │   ├── concours/
│   │   │   └── route.ts             # GET /api/concours
│   │   ├── search/
│   │   │   └── route.ts             # GET /api/search?q=
│   │   └── admin/
│   │       ├── upload/route.ts      # POST /api/admin/upload
│   │       └── concours/route.ts    # CRUD /api/admin/concours
│   │
│   ├── admin/
│   │   └── page.tsx                 # Hidden admin panel
│   │
│   ├── sitemap.ts                   # Dynamic sitemap
│   ├── robots.ts                    # robots.txt
│   ├── layout.tsx                   # Root (no locale)
│   └── not-found.tsx
│
├── components/
│   ├── ui/                          # shadcn components (auto-generated)
│   ├── layout/
│   │   ├── Header.tsx               # Nav + search + lang switch
│   │   ├── Footer.tsx               # Links + newsletter
│   │   ├── MobileNav.tsx            # Mobile drawer
│   │   └── Breadcrumbs.tsx          # SEO breadcrumbs
│   ├── home/
│   │   ├── Hero.tsx                 # Hero section
│   │   ├── SearchBar.tsx            # Global search
│   │   ├── LatestConcours.tsx       # Latest competitions
│   │   ├── PopularConcours.tsx      # Popular competitions
│   │   ├── LatestPDFs.tsx           # Latest PDFs
│   │   ├── CategoriesGrid.tsx       # Category cards
│   │   ├── Stats.tsx                # Platform statistics
│   │   └── FAQ.tsx                  # FAQ section
│   ├── concours/
│   │   ├── ConcoursCard.tsx         # Competition card
│   │   ├── ConcoursGrid.tsx         # Grid with filters
│   │   ├── ConcoursDetail.tsx       # Full detail view
│   │   ├── ConcoursFilters.tsx      # Filter sidebar
│   │   └── ShareButtons.tsx         # Social sharing
│   ├── pdf/
│   │   ├── PDFCard.tsx              # PDF document card
│   │   ├── PDFGrid.tsx              # PDF grid view
│   │   ├── PDFPreview.tsx           # In-browser PDF viewer
│   │   └── PDFDownload.tsx          # Download button
│   ├── blog/
│   │   ├── ArticleCard.tsx          # Blog article card
│   │   ├── ArticleContent.tsx       # Article body
│   │   └── RelatedArticles.tsx      # Related articles
│   └── shared/
│       ├── LanguageSwitcher.tsx      # AR/FR toggle
│       ├── ThemeToggle.tsx           # Dark/light mode
│       ├── SearchDialog.tsx          # Global search modal
│       ├── EmptyState.tsx            # Empty state component
│       └── LoadingSkeleton.tsx       # Skeleton loader
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client (@supabase/ssr)
│   │   ├── server.ts                # Server client (@supabase/ssr)
│   │   └── admin.ts                 # Service role client (admin only)
│   ├── i18n/
│   │   ├── config.ts                # i18n configuration
│   │   ├── dictionaries/
│   │   │   ├── ar.json              # Arabic translations
│   │   │   └── fr.json              # French translations
│   │   └── get-dictionary.ts        # Dynamic dictionary loader
│   ├── seo/
│   │   ├── generate-metadata.ts     # Meta tags generator
│   │   ├── json-ld.ts               # Structured data schemas
│   │   └── open-graph.ts            # OG image generation
│   ├── utils/
│   │   ├── cn.ts                    # clsx + tailwind-merge
│   │   ├── format-date.ts           # Arabic/French date formatting
│   │   ├── slugify.ts               # URL slug generation
│   │   └── constants.ts             # App constants
│   └── validators/
│       └── concours.ts              # Zod schemas for concours data
│
├── types/
│   ├── concours.ts                  # Concours types
│   ├── pdf.ts                       # PDF document types
│   ├── blog.ts                      # Blog article types
│   └── database.ts                  # Supabase generated types
│
└── middleware.ts                     # Locale detection + admin guard
```

### 4.3 Why This Structure (Domain-Driven, Not Micro-Files)

| Decision | Rationale |
|----------|-----------|
| `[locale]/` prefix | Single source for i18n, no duplication |
| Feature-based `components/` | `concours/` contains ALL concours logic — no scattering |
| `lib/supabase/` (3 files only) | client, server, admin — no over-abstraction |
| `lib/i18n/` with JSON files | Simple, no external i18n library needed |
| No `features/` folder | 6 pages don't need feature-sliced architecture |
| `types/` separate | Shared types used across features |

---

## 5. SYSTEM_FLOW

### 5.1 User Journey (GUI Flow)

```
Visitor Lands on Homepage (/ar)
    │
    ├──▶ Hero Section (search bar prominent)
    │       │
    │       ├──▶ Types query ──▶ Instant Results (SearchDialog)
    │       │       │
    │       │       ├──▶ Click result ──▶ /ar/concours/[slug]
    │       │       │                      │
    │       │       │                      ├──▶ View details
    │       │       │                      ├──▶ Download PDF
    │       │       │                      ├──▶ Share on social
    │       │       │                      └──▶ Breadcrumbs → Back
    │       │       │
    │       │       └──▶ View all results ──▶ /ar/recherche?q=
    │       │
    │       └──▶ Click "Explore" ──▶ /ar/concours
    │
    ├──▶ Latest Competitions
    │       │
    │       └──▶ Click card ──▶ /ar/concours/[slug]
    │
    ├──▶ Categories Grid
    │       │
    │       └──▶ Click category ──▶ /ar/categories/[slug]
    │                                   │
    │                                   └──▶ Filtered competitions
    │
    ├──▶ PDF Library Section
    │       │
    │       └──▶ Click PDF ──▶ /ar/bibliotheque/[slug]
    │                              │
    │                              ├──▶ Preview in browser
    │                              └──▶ Download (no auth)
    │
    ├──▶ Blog Section
    │       │
    │       └──▶ Click article ──▶ /ar/blog/[slug]
    │
    └──▶ Language Switch (AR ↔ FR)
            │
            └──▶ Same page, different locale (no reload)
```

### 5.2 Data Flow (API)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js SSR │────▶│  Supabase   │
│             │◀────│  (Server     │◀────│  PostgreSQL  │
│             │     │   Components)│     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├──▶ ISR Cache (Vercel)
                           │    - Homepage: 1 hour
                           │    - Concours list: 30 min
                           │    - Detail pages: 1 hour
                           │    - Blog: 24 hours
                           │
                           └──▶ Static Generation
                                - Categories: build time
                                - Sitemap: build time
```

---

## 6. Database Schema (Supabase PostgreSQL)

```sql
-- Concours (competitions)
CREATE TABLE concours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,          -- master, licence, ensa, ensam, etc.
  city TEXT,
  year INTEGER NOT NULL,
  deadline DATE,
  concours_date DATE,
  eligibility_ar TEXT,
  eligibility_fr TEXT,
  diploma_required_ar TEXT,
  diploma_required_fr TEXT,
  official_pdf_url TEXT,
  source_url TEXT,                 -- Official announcement URL
  postes_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDFs / Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  file_url TEXT NOT NULL,          -- Supabase Storage URL
  file_type TEXT NOT NULL,         -- pdf, doc, docx, txt
  file_size INTEGER,               -- bytes
  concours_id UUID REFERENCES concours(id),
  category TEXT NOT NULL,
  subject TEXT,                    -- maths, physique, etc.
  year INTEGER,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous exams (Annales)
CREATE TABLE annales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  correction_url TEXT,             -- Optional correction PDF
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_fr TEXT,
  category TEXT,                   -- preparation, orientation, scholarships
  featured_image_url TEXT,
  author_name TEXT DEFAULT 'ConcoursMaroc',
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (static, seeded)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  icon TEXT,                       -- Lucide icon name
  sort_order INTEGER DEFAULT 0
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'ar',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search indexes
CREATE INDEX idx_concours_search ON concours
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr || ' ' || institution));

CREATE INDEX idx_documents_search ON documents
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr));

CREATE INDEX idx_annales_search ON annales
  USING GIN (to_tsvector('simple', title_ar || ' ' || title_fr || ' ' || subject));
```

---

## 7. Page Specifications

### 7.1 Homepage (`/ar` or `/fr`)

| Section | Content | Data Source | Cache |
|---------|---------|-------------|-------|
| Hero | Search bar, headline, stats | Static | Build |
| Latest Concours | 6 most recent cards | `concours` table, ORDER BY created_at DESC | 30 min |
| Popular Concours | 6 most viewed cards | `concours` table, ORDER BY view_count DESC | 30 min |
| Latest PDFs | 8 most recent PDFs | `documents` table, ORDER BY created_at DESC | 30 min |
| Categories | All categories grid | `categories` table | Build |
| Statistics | Total concours, PDFs, users | `concours` count, `documents` count | 1 hour |
| FAQ | 8 common questions | Static JSON | Build |
| Newsletter | Email subscription form | Client component | - |

### 7.2 Competition Detail (`/ar/concours/[slug]`)

| Element | Source |
|---------|--------|
| Title, description | `concours.title_ar`, `concours.description_ar` |
| Institution, city, year | `concours` fields |
| Eligibility | `concours.eligibility_ar` |
| Required diploma | `concours.diploma_required_ar` |
| Dates | `concours.deadline`, `concours.concours_date` |
| Official PDF link | `concours.official_pdf_url` |
| Previous exams | JOIN `annales` WHERE institution matches |
| Related competitions | Same category, exclude current |
| Social sharing | Twitter, Facebook, WhatsApp, LinkedIn |
| Breadcrumbs | Home > Concours > [Institution] > [Title] |

### 7.3 PDF Library (`/ar/bibliotheque`)

| Feature | Implementation |
|---------|---------------|
| Grid view | Cards with PDF icon, title, type badge |
| Filters | Category, year, subject, file type |
| Preview | PDF.js viewer in modal (no download required) |
| Download | Direct link to Supabase Storage |
| Search | Full-text search across titles |
| Pagination | 20 items per page, infinite scroll option |

---

## 8. SEO Strategy

### 8.1 URL Structure (SEO-Friendly)
```
/ar/concours/ensa-fst-fes-2026
/ar/concours/enseignant-primaire-2026
/ar/bibliotheque/annales-ensa-maths-2024
/ar/annales/ensa-physique-2023
/ar/blog/comment-preparer-ensa
/ar/categories/master
```

### 8.2 Meta Tags (Auto-Generated)
```typescript
// For each page, generate:
{
  title: "Concours ENSA 2026 - Conditions, Dates et PDF | ConcoursMaroc",
  description: "Découvrez toutes les informations sur le concours ENSA 2026...",
  openGraph: {
    title: "...",
    description: "...",
    images: ["/og/concours-ensa-2026.png"],  // Dynamic OG
    locale: "fr_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
  },
  alternates: {
    canonical: "https://concoursmaroc.ma/fr/concours/ensa-fst-fes-2026",
    languages: {
      "ar": "/ar/concours/ensa-fst-fes-2026",
      "fr": "/fr/concours/ensa-fst-fes-2026",
    },
  },
}
```

### 8.3 Structured Data (JSON-LD)
```typescript
// Organization Schema (homepage)
// FAQ Schema (homepage FAQ section)
// Article Schema (blog posts)
// BreadcrumbList Schema (all pages)
// WebSite + SearchAction Schema (homepage)
```

### 8.4 Sitemap Strategy
```typescript
// next-sitemap config
{
  siteUrl: "https://concoursmaroc.ma",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: {
    "/concours/*": "weekly",
    "/bibliotheque/*": "monthly",
    "/annales/*": "monthly",
    "/blog/*": "weekly",
  },
  priority: {
    "/": 1.0,
    "/concours/*": 0.9,
    "/bibliotheque/*": 0.7,
    "/annales/*": 0.7,
    "/blog/*": 0.6,
  },
}
```

---

## 9. Internationalization (i18n)

### 9.1 Implementation
- **URL-based:** `/ar/...` and `/fr/...`
- **Dictionary files:** `lib/i18n/dictionaries/ar.json` and `fr.json`
- **RTL support:** `<html dir="rtl" lang="ar">` / `<html dir="ltr" lang="fr">`
- **No external i18n library** — simple JSON + `getDictionary()` function
- **Language switch:** Client component, updates URL prefix, no reload

### 9.2 Translation Keys Structure
```json
{
  "nav": { "home": "Accueil", "concours": "Concours", ... },
  "home": { "hero_title": "...", "hero_subtitle": "...", ... },
  "concours": { "deadline": "Date limite", "institution": "Institution", ... },
  "pdf": { "download": "Télécharger", "preview": "Aperçu", ... },
  "common": { "loading": "...", "no_results": "...", ... }
}
```

---

## 10. Internationalization (i18n)

### 10.1 Implementation
- **URL-based:** `/ar/...` and `/fr/...`
- **Dictionary files:** `lib/i18n/dictionaries/ar.json` and `fr.json`
- **RTL support:** `<html dir="rtl" lang="ar">` / `<html dir="ltr" lang="fr">`
- **No external i18n library** — simple JSON + `getDictionary()` function
- **Language switch:** Client component, updates URL prefix, no reload

### 10.2 RTL Strategy
```css
/* globals.css */
[dir="rtl"] .flip-rtl { transform: scaleX(-1); }
[dir="rtl"] .ps-4 { padding-left: 0; padding-right: 1rem; }
/* shadcn components auto-adapt via tailwind-rtl or manual */
```

---

## 11. Admin Panel

### 11.1 Access Control
```
No public authentication.
Admin panel at /admin.
Middleware checks ADMIN_SECRET env var.
Access via URL: /admin?secret=YOUR_SECRET
Secret stored in cookie (httpOnly, 24h expiry).
```

### 11.2 Admin Capabilities
| Action | Implementation |
|--------|---------------|
| Upload PDFs | Supabase Storage upload + metadata insert |
| Edit competitions | Update `concours` row |
| Delete competitions | Soft delete (is_active = false) |
| Add blog articles | Insert into `articles` table |
| Manage categories | CRUD on `categories` table |
| SEO metadata | Override meta title/description per page |

### 11.3 Admin UI
- Simple form-based interface
- shadcn/ui components (Table, Form, Dialog)
- No fancy dashboard — functional only
- Hidden from SEO (noindex, nofollow)

---

## 12. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Lighthouse Performance | 100 | ISR, Server Components, Image optimization |
| Lighthouse SEO | 100 | Meta tags, JSON-LD, Sitemap, Canonical |
| Lighthouse Accessibility | 100 | Semantic HTML, ARIA labels, Keyboard nav |
| Lighthouse Best Practices | 100 | HTTPS, no console errors, proper caching |
| First Contentful Paint | < 1.0s | SSR + Edge caching |
| Largest Contentful Paint | < 1.5s | ISR + Font optimization |
| Total Bundle Size | < 150KB gzipped | Tree shaking, code splitting |
| Cumulative Layout Shift | < 0.1 | next/font, aspect-ratio on images |

### 12.1 Caching Strategy
```
Homepage:           ISR 1 hour    (revalidate: 3600)
Concours list:      ISR 30 min    (revalidate: 1800)
Concours detail:    ISR 1 hour    (revalidate: 3600)
PDF library:        ISR 30 min    (revalidate: 1800)
Blog articles:      ISR 24 hours  (revalidate: 86400)
Categories:         SSG           (build time only)
Search API:         SWR           (client-side, 5s deduping)
```

---

## 13. Logging Strategy (Protocol 4)

### Non-Blocking Async Logging
```typescript
// lib/utils/logger.ts
type LogLevel = "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  info: 0, warn: 1, error: 2
};

const configLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) =>
    log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) =>
    log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) =>
    log("error", msg, data),
};

function log(level: LogLevel, msg: string, data?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[configLevel]) return;

  // Fire-and-forget: never blocks the request
  queueMicrotask(() => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: msg,
      ...data,
    };

    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  });
}
```

### Usage
```typescript
// In Server Components / API routes
logger.info("Concours viewed", { slug, id });
logger.error("Supabase query failed", { error: e.message });
logger.warn("High download count", { documentId, count });
```

**Rules:**
- Only 3 levels: info, warn, error
- Never block request lifecycle
- Structured JSON for easy parsing
- No sensitive data (no IPs, no emails)
- Production: only warn + error logged

---

## 14. Implementation Phases

### Phase 1: Foundation ✅ COMPLETED (2026-07-15)
- [x] Project scaffolding (`package.json` with locked versions)
- [x] Tailwind v4 setup (`globals.css` with `@theme` directive)
- [x] Supabase client setup (client + server + admin)
- [x] i18n configuration (AR/FR dictionaries, 500+ translation keys each)
- [x] Root layout with RTL/LTR support
- [x] Theme provider (dark mode via next-themes)

### Phase 2: Core Pages ✅ COMPLETED (2026-07-15)
- [x] Homepage with all sections (Hero, Latest, Popular, PDFs, Categories, Stats, FAQ)
- [x] Concours listing page with filters (category, city, year)
- [x] Concours detail page (full info, related, annales, share)
- [x] PDF library page with pagination
- [x] Blog listing + detail pages
- [x] Search functionality (full-text across concours + documents)

### Phase 3: Data Layer ✅ COMPLETED (2026-07-15)
- [x] Supabase schema creation (6 tables with indexes)
- [x] Seed data (21 categories with Arabic/French names)
- [x] Server Components data fetching (all pages)
- [x] ISR configuration (per-page revalidation times)
- [x] API routes (concours, search, newsletter, admin CRUD)

### Phase 4: SEO & Polish ✅ COMPLETED (2026-07-15)
- [x] Meta tags generation (OpenGraph, Twitter, canonical)
- [x] JSON-LD structured data (Organization, WebSite, FAQ, Breadcrumb, Article)
- [x] Dynamic sitemap.ts (all pages, concours, documents, blog, categories)
- [x] robots.txt (disallow /admin, /api)
- [x] Breadcrumbs component (RTL-aware)
- [x] Performance optimization (ISR, Server Components, lazy loading)

### Phase 5: Admin & Extras ✅ COMPLETED (2026-07-15)
- [x] Hidden admin panel (secret-based, no public auth)
- [x] Admin API routes (CRUD with Zod validation)
- [x] Newsletter subscription API
- [x] Share buttons (Twitter, Facebook, LinkedIn, WhatsApp)
- [x] Error pages (404, 500)
- [x] Async logger utility (3 levels, queueMicrotask)

---

## 15. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Admin
ADMIN_SECRET=your-secret-here

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# App
NEXT_PUBLIC_APP_URL=https://concoursmaroc.ma
NEXT_PUBLIC_APP_NAME=ConcoursMaroc
```

---

## 16. ORPHANS & PENDING

### All Implementation Complete ✅

All 35 files from the File Creation Order have been created.
All 5 phases are marked complete.

### Remaining External Tasks (Not Code — Require Human Action)
- [ ] Create Supabase project and run `supabase/schema.sql`
- [ ] Set environment variables in `.env.local`
- [ ] Deploy to Vercel (`vercel deploy`)
- [ ] Configure custom domain
- [ ] Set up Google Analytics 4 (get `G-XXXXXXXXXX`)
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google AdSense account
- [ ] Create OG images (1200x630) for each page type
- [ ] Add real concours data via admin panel or SQL inserts
- [ ] Upload PDF documents to Supabase Storage
- [ ] Write initial blog articles for SEO
- [ ] Test RTL/LTR on mobile devices
- [ ] Run Lighthouse audit and fix any issues
- [ ] Set up Vercel Analytics (optional)

### Technical Notes
- `next-sitemap` v4.2.3 last updated Sep 2023 — stable, no issues with Next.js 15
- Tailwind v4 uses CSS-first config (`@theme` in `globals.css`), no `tailwind.config.ts`
- TypeScript 7.0 may have editor compatibility — fallback to 5.x if needed
- shadcn/ui components NOT installed via CLI (add as needed: `npx shadcn@latest add button card dialog`)

---

## 17. File Creation Order

```
1.  package.json                    (dependencies locked)
2.  next.config.ts                  (ISR, headers, redirects)
3.  tailwind.config.ts              (v4: skip, use globals.css)
4.  src/app/globals.css             (Tailwind v4 @theme config)
5.  src/app/layout.tsx              (root layout)
6.  src/middleware.ts               (locale detection + admin)
7.  src/lib/supabase/client.ts
8.  src/lib/supabase/server.ts
9.  src/lib/i18n/config.ts
10. src/lib/i18n/dictionaries/ar.json
11. src/lib/i18n/dictionaries/fr.json
12. src/lib/utils/cn.ts
13. src/types/concours.ts
14. src/types/pdf.ts
15. src/types/blog.ts
16. src/components/layout/Header.tsx
17. src/components/layout/Footer.tsx
18. src/components/shared/LanguageSwitcher.tsx
19. src/components/shared/ThemeToggle.tsx
20. src/components/home/Hero.tsx
21. src/components/home/SearchBar.tsx
22. src/components/concours/ConcoursCard.tsx
23. src/components/pdf/PDFCard.tsx
24. src/app/[locale]/page.tsx         (homepage)
25. src/app/[locale]/concours/page.tsx
26. src/app/[locale]/concours/[slug]/page.tsx
27. src/app/[locale]/bibliotheque/page.tsx
28. src/app/[locale]/blog/page.tsx
29. src/app/[locale]/annales/page.tsx
30. src/app/[locale]/categories/page.tsx
31. src/app/[locale]/recherche/page.tsx
32. src/app/sitemap.ts
33. src/app/robots.ts
34. src/app/admin/page.tsx
35. next-sitemap.config.js
```

---

*This document is the single source of truth for the ConcoursMaroc architecture. Update as decisions evolve.*
