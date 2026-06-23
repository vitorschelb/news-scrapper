# Build Report — News Scrapper WhatsApp Bot

**Date:** 2026-06-23
**Status:** Build complete, pending user deploy

## Milestones

### ✅ M1 — Setup (complete)
- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Prisma schema with 5 models (CrawledSite, Article, Summary, SendLog, AppConfig)
- Configuration files: tsconfig, tailwind, postcss, next.config

### ✅ M2 — Scraper + Summarizer (complete)
- `src/lib/scraper.ts`: RSS parser (TLDR AI + Hugging Face) + HTML fallback with Cheerio
- `src/lib/summarizer.ts`: Groq API integration (Llama 3.3 70B), pt-BR prompt, token tracking
- Duplicate detection by URL (unique constraint)
- 10 article limit per run (safety)

### ✅ M3 — WhatsApp (complete)
- `src/lib/whatsapp.ts`: whatsapp-web.js with LocalAuth for session persistence
- QR code display in terminal
- Automatic session commit in CI (`.wwebjs_auth/`)
- 2s delay between messages
- Format: title + summary + link + source

### ✅ M4 — GitHub Actions (complete)
- `.github/workflows/daily-news.yml`: 3 cron schedules (08, 12, 18 BRT)
- Chrome/puppeteer args for headless CI
- Session commit back to repo
- Manual trigger support (workflow_dispatch)

### ✅ M5 — Dashboard (complete)
- 5 pt-BR pages: Home (`/`), Fontes, Agendamento, Histórico, Configurações
- Dark mode by default (next-themes)
- Responsive sidebar with mobile hamburger
- Stats cards, recent summaries, system status
- All pages are server-rendered (SSR with Prisma)

### ✅ M6 — API Routes (complete)
- `GET/POST /api/sites` — list/create sources
- `PATCH/DELETE /api/sites/[id]` — update/delete source
- `GET/PATCH /api/config` — global configuration
- `GET /api/articles` — paginated articles with filters
- `GET /api/stats` — dashboard statistics
- `POST /api/pipeline` — manual pipeline trigger

### ⏳ M7 — Quality Gate (pending user action)
User needs to:
1. Create Supabase account → get DATABASE_URL
2. Create Groq account → get GROQ_API_KEY
3. Create GitHub repo → push code
4. Set GitHub Secrets (DATABASE_URL, GROQ_API_KEY, WHATSAPP_NUMBER)
5. Import on Vercel
6. Scan WhatsApp QR on first pipeline run

## Files Created (51 files)
```
├── .env.example
├── .gitignore
├── .github/workflows/daily-news.yml
├── README.md
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma/schema.prisma
├── prisma/seed.ts
├── scripts/run-pipeline.ts
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── agendamento/page.tsx
    │   ├── configuracoes/page.tsx
    │   ├── fontes/page.tsx
    │   ├── historico/page.tsx
    │   └── api/
    │       ├── sites/route.ts + [id]/route.ts
    │       ├── config/route.ts
    │       ├── articles/route.ts
    │       ├── stats/route.ts
    │       └── pipeline/route.ts
    ├── components/
    │   ├── sidebar.tsx
    │   ├── theme-provider.tsx
    │   ├── theme-toggle.tsx
    │   └── ui/ (button, card, badge, switch)
    └── lib/
        ├── prisma.ts
        ├── scraper.ts
        ├── summarizer.ts
        ├── whatsapp.ts
        └── utils.ts
```

## Git
- Initialized repo with one commit: `ef4e02f`
- Branch: `main`
- Ready to push to GitHub
