# 📰 NewsBot — News Scrapper + WhatsApp Bot + Dashboard

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Pipeline-blue?logo=githubactions)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**NewsBot** is a free news scraper that collects tech articles from **TLDR AI** and **Hugging Face Blog**, summarizes them with AI (Llama 3.3 70B via Groq), and delivers them to your WhatsApp 3x/day.

> 🇧🇷 Dashboard UI in Portuguese (pt-BR), codebase in English.

---

## Features

- **🤖 Auto Scraping** — RSS + HTML fallback with Axios + Cheerio
- **🧠 AI Summaries** — Groq (Llama 3.3 70B), free, no credit card
- **📱 WhatsApp Delivery** — 3x/day (08h, 12h, 18h BRT)
- **📊 Web Dashboard** — Next.js 15 + Tailwind + shadcn/ui (dark mode)
- **🔧 Configurable** — Sources, schedules, WhatsApp number
- **💰 Zero Cost** — Groq free, Supabase free, Vercel Hobby, GitHub Actions free
- **🥟 Bun Runtime** — 4x faster than Node.js, `bunx` instead of `npx`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions (cron)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Scraper  │→ │ Groq AI  │→ │ WhatsApp (wwebjs)    │   │
│  │(Axios+   │  │(Summary) │  │(Puppeteer)           │   │
│  │ Cheerio) │  │          │  │                      │   │
│  └────┬─────┘  └────┬─────┘  └─────────┬────────────┘   │
│       │             │                  │                 │
│       └─────────────┴──────────────────┘                 │
│                        │                                 │
│                  ┌─────▼──────┐                          │
│                  │  Supabase  │ ← PostgreSQL             │
│                  │  (Free)    │                          │
│                  └─────┬──────┘                          │
└────────────────────────┼─────────────────────────────────┘
                         │
                  ┌──────▼───────┐
                  │  Vercel      │ ← Next.js Dashboard
                  │  (Hobby)     │
                  └──────────────┘
```

## Stack

| Layer | Technology | Why |
|--------|-----------|------|
| **Runtime** | Bun 1.x | 4x faster than Node, built-in TS support |
| **Frontend** | Next.js 15 + Tailwind + shadcn/ui | SSR, DX, beautiful components |
| **Database** | Supabase (PostgreSQL) + Prisma | 500MB free, type-safe ORM |
| **Scraping** | Axios + Cheerio | Lightweight, no headless browser needed |
| **AI** | Groq API (Llama 3.3 70B) | 100K free tokens/day |
| **WhatsApp** | whatsapp-web.js | Free, Puppeteer-based |
| **CI/Scheduling** | GitHub Actions | 2000 free min/month, Chrome included |
| **Hosting** | Vercel (Hobby) | 1-click deploy, free |

## Prerequisites

- [Bun](https://bun.sh/) 1.x (`curl -fsSL https://bun.sh/install | bash`)
- [Git](https://git-scm.com/)

**Free accounts needed:**
- [Supabase](https://supabase.com/) — PostgreSQL database
- [Groq](https://console.groq.com/) — AI API
- [GitHub](https://github.com/) — repository + Actions
- [Vercel](https://vercel.com/) — dashboard deploy

## Local Setup

```bash
# 1. Clone
git clone https://github.com/vitorschelb/news-scrapper.git
cd news-scrapper

# 2. Install dependencies
bun install

# 3. Copy .env and fill in
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, GROQ_API_KEY, WHATSAPP_NUMBER)

# 4. Generate Prisma Client and sync schema
bunx prisma generate
bunx prisma db push

# 5. Seed (initial data: TLDR + Hugging Face sources)
bun run db:seed

# 6. Run the dashboard
bun run dev
# Access: http://localhost:3000
```

## Deploy

### 1. Supabase
1. Create account at [supabase.com](https://supabase.com/)
2. New project → copy `Database connection string` (transaction mode, port 6543)

### 2. Groq
1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Create a free API key

### 3. GitHub
```bash
# Repo already has git init — just push
gh repo create news-scrapper --public --push
```

### 4. GitHub Secrets
In repo > Settings > Secrets and variables > Actions:

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | `postgresql://postgres:...` (from Supabase) |
| `GROQ_API_KEY` | `gsk_...` (from Groq) |
| `WHATSAPP_NUMBER` | `5511999999999` (your number) |

### 5. Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repository
3. Add `DATABASE_URL` to environment variables
4. Deploy! 🎉

### 6. WhatsApp QR Code
On first GitHub Actions run, it generates a QR code:
1. Go to Actions > Daily News Pipeline > Run workflow
2. Check workflow logs for the QR code
3. Scan with WhatsApp > Linked Devices

The session is saved for subsequent runs.

## Project Structure

```
.
├── .github/workflows/
│   └── daily-news.yml          # 3x/day pipeline
├── AGENTS.md                   # AI agent instructions (Next.js official)
├── CLAUDE.md                   # Technology-specific rules
├── prisma/
│   ├── schema.prisma           # DB schema (5 models)
│   └── seed.ts                 # Initial data
├── scripts/
│   └── run-pipeline.ts         # Pipeline script
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home / Dashboard
│   │   ├── fontes/page.tsx     # News sources
│   │   ├── agendamento/page.tsx# Delivery schedule
│   │   ├── historico/page.tsx  # Delivery history
│   │   ├── configuracoes/page.tsx # Settings
│   │   ├── layout.tsx          # Root layout + sidebar
│   │   ├── globals.css         # Tailwind + CSS variables
│   │   └── api/
│   │       ├── sites/          # Sources CRUD
│   │       ├── config/         # Global config
│   │       ├── articles/       # Articles list
│   │       ├── stats/          # Statistics
│   │       └── pipeline/       # Manual trigger
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── sidebar.tsx         # Navigation
│   │   ├── theme-provider.tsx  # Dark mode
│   │   └── theme-toggle.tsx    # Theme button
│   └── lib/
│       ├── prisma.ts           # Prisma singleton
│       ├── scraper.ts          # RSS/HTML scraper
│       ├── summarizer.ts       # Groq AI summary
│       ├── whatsapp.ts         # WhatsApp sender
│       └── utils.ts            # cn() helper
├── .env.example
├── .gitignore
├── bun.lockb                   # Bun lockfile
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Costs (R$ 0,00/month)

| Service | Plan | Limit | Expected Usage |
|---------|------|-------|----------------|
| Groq API | Free | 100K tokens/day | ~1,800 tokens/day (1.8%) |
| Supabase | Free | 500MB, 50k rows | < 1MB/month |
| GitHub Actions | Free | 2000 min/month | ~30 min/month |
| Vercel | Hobby | 100h/month | < 10h/month |
| whatsapp-web.js | Free | — | 3 msg/day |

## Warnings

- **whatsapp-web.js** is unofficial. Technically violates WhatsApp ToS. Use a secondary number.
- **Supabase** pauses inactive projects after 7 days. GitHub Actions keep-alive prevents this.
- **QR code** needed on first run only. Session is persisted afterward.

## AI Agent Rules

This project includes configuration files for AI coding agents:

- **`AGENTS.md`** — Next.js official pattern: tells agents to use bundled docs
  at `node_modules/next/dist/docs/` instead of training data.
- **`CLAUDE.md`** — Technology-specific rules for Next.js, Prisma, Supabase,
  GitHub Actions, Vercel, Cheerio, Groq API, and whatsapp-web.js.

## License

MIT — Use, modify, share.

---

<p align="center">
  Built with ☕ by <a href="https://github.com/vitorschelb">vitorschelb</a>
</p>
