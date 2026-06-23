# Discovery Report — News Scraper + WhatsApp Bot + Dashboard

**Date:** 2026-06-23
**Objective:** Build a simple, cheap, efficient news scraper that scrapes 2 sites, summarizes articles, sends via WhatsApp, and has a Next.js dashboard for configuration.

---

## Agents Consulted

| Agent | Focus | Key Findings |
|-------|-------|-------------|
| **Researcher** | Stack research, cost analysis, tool comparison | Full $0/month stack identified |
| **Architect** | System design, module interfaces, data flow | Monorepo architecture with 4 core packages |
| **UX Designer** | UI/UX, wireframes, component tree | 5-page dashboard in pt-BR with dark/light mode |

---

## 1. Stack Decision Record

### 1.1 Scraping — Axios + Cheerio ✅

| Option | Verdict |
|--------|---------|
| Axios + Cheerio | ✅ **Chosen** — lightweight, fast, no browser needed |
| Puppeteer | ❌ Overkill — 150MB+ dependency |
| Playwright | ❌ Overkill — sites are server-rendered |
| Crawlee | ❌ Too heavy for 2 sites |

**Why:** Brazilian news sites (G1, UOL) serve server-rendered HTML. Cheerio parses it perfectly. No JS rendering needed.

### 1.2 Summarization — Groq API (Llama 3.3 70B) ✅

| Option | Cost | Verdict |
|--------|------|---------|
| **Groq API** | **$0** | ✅ **Chosen** — free, blazing fast, no CC needed |
| Google Gemini API | $0 | Good alternative, slower |
| OpenAI GPT-4o-mini | ~$0.01/article | Cheap but not free |
| Local Ollama | $0 | Needs GPU, complex setup |
| HuggingFace | $0 | Cold starts, slower |

**Why:** Groq gives us Llama 3.3 70B at 200+ tokens/sec completely free. 30 req/min, 100K tokens/day — more than enough.

### 1.3 WhatsApp Sending — whatsapp-web.js ✅

| Option | Cost | Verdict |
|--------|------|---------|
| **whatsapp-web.js** | **$0** | ✅ **Chosen** — free, 22k stars, QR auth |
| Baileys | $0 | No browser, but less docs |
| Twilio API | $0.005/msg | Paid, needs business verification |
| Meta Cloud API | $0.005/msg | Paid, business verification |

**⚠️ Risk:** Unofficial library. Ban risk at high volume. For personal use (10-20 msgs/day), risk is negligible.

### 1.4 Scheduling — GitHub Actions ✅

| Option | Cost | Verdict |
|--------|------|---------|
| **GitHub Actions** | **$0** | ✅ **Chosen** — 2000 min/month, 6h timeout |
| Vercel Cron | $0 | Only 1 run/day on free tier |
| cron-job.org | $0 | Reliable, but external dependency |
| node-cron (in-app) | $0 | Only if app is always-on |

**Why:** GitHub Actions gives us unlimited flexibility — can run the full pipeline (scraping + AI + WhatsApp) with up to 6h timeout. The free 2000 min/month is plenty.

### 1.5 Database — Supabase (PostgreSQL) ✅

| Option | Cost | Verdict |
|--------|------|---------|
| **Supabase** | **$0** | ✅ **Chosen** — 500MB Postgres, auth, RLS |
| SQLite (better-sqlite3) | $0 | Simple but no cloud access for Vercel |
| Turso (edge SQLite) | $0 | Good but less ecosystem |
| MongoDB Atlas M0 | $0 | 512MB free, but no relations needed |
| Neon | $0 | 512MB Postgres, cold starts |

**Why:** Supabase gives us a hosted Postgres with 500MB free, plus built-in auth if we need it later. Prisma ORM works perfectly with it.

### 1.6 ORM — Prisma ✅

| Option | Verdict |
|--------|---------|
| **Prisma** | ✅ **Chosen** — type-safe, great DX, migrations |
| Drizzle | Good alternative, lighter |
| Raw SQL | Too much work |

### 1.7 Hosting — Vercel (Hobby) ✅

| Option | Cost | Verdict |
|--------|------|---------|
| **Vercel Hobby** | **$0** | ✅ **Chosen** — native Next.js, CDN, SSL |
| Render | $0 | Good but services sleep after 15min |
| Railway | ❌ | No free tier anymore |
| Fly.io | ❌ | Free trial only |

**Why:** Vercel is the best platform for Next.js. Deploy from GitHub with zero config.

### 1.8 UI Framework — shadcn/ui + Tailwind ✅

**Why:** Most popular Next.js UI library. Copy-paste components. Dark/light mode built-in. Lucide icons.

---

## 2. Final Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| **Frontend** | Next.js 15 (App Router) | $0 |
| **UI** | shadcn/ui + Tailwind CSS + lucide-react | $0 |
| **Database** | Supabase (PostgreSQL free tier) | $0 |
| **ORM** | Prisma | $0 |
| **Scraping** | Axios + Cheerio | $0 |
| **Summarization** | Groq API (Llama 3.3 70B) | $0 |
| **WhatsApp** | whatsapp-web.js | $0 |
| **Scheduler** | GitHub Actions | $0 |
| **Hosting** | Vercel (Hobby) | $0 |

### Total: **$0/month** ☁️✨

---

## 3. Architecture Decision — Single Next.js App

After analyzing the tradeoffs, we will use a **single Next.js app** (not a monorepo with separate worker). Rationale:

1. **Simplicity** — One package.json, one deploy, one mental model
2. **GitHub Actions handles the heavy lifting** — Scraping + AI + WhatsApp runs in GitHub Actions, not in serverless
3. **Vercel handles the dashboard** — Next.js with API routes for CRUD
4. **WhatsApp session saved as GitHub Actions artifact** — persists between runs

### Data Flow

```
GitHub Actions (scheduled cron)
  │
  ├── 1. Fetch enabled sites from Supabase (via Vercel API)
  ├── 2. Scrape each site (Axios + Cheerio)
  ├── 3. Dedup articles against Supabase
  ├── 4. Summarize each new article (Groq API)
  ├── 5. Format WhatsApp message
  ├── 6. Connect to WhatsApp Web (whatsapp-web.js)
  └── 7. Send message + update Supabase

Vercel (Next.js)
  ├── Dashboard UI (5 pages)
  ├── API routes (CRUD for sites, articles, config)
  └── Stores all data in Supabase
```

---

## 4. Key Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| WhatsApp ban at high volume | Personal use only (10-20 msgs/day). Dedicated number recommended |
| Sites change HTML structure | Use semantic selectors + JSON-LD extraction. Monitor with health checks |
| Vercel 60s function timeout | GitHub Actions handles the heavy pipeline (6h timeout) |
| Supabase 7-day inactivity pause | GitHub Actions weekly keep-alive ping |
| Groq API rate limits | 30 RPM is enough for ~20 articles/day |

---

## 5. Open Questions (Resolved)

| Question | Decision |
|----------|---------|
| RSS vs HTML scraping | Both — prefer RSS (structured), fallback to HTML |
| WhatsApp session persistence | Save session as GitHub Actions artifact (base64) |
| Multi-user vs single-user | Single-user (admin). Simple API key auth if needed later |
| Image support in WhatsApp | Skip v1. Text-only summaries |
