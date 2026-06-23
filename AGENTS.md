# Project Guide for AI Coding Agents

This file tells AI coding agents how to work with this project.

## Next.js Documentation

This project uses Next.js 15+. Official documentation is bundled at `node_modules/next/dist/docs/` and matches the installed version exactly.

Before writing any Next.js code, read the relevant bundled docs:

- **App Router:** `node_modules/next/dist/docs/01-app/`
- **API Reference:** `node_modules/next/dist/docs/01-app/03-api-reference/`
- **Data Fetching:** `node_modules/next/dist/docs/01-app/02-guides/03-data-fetching.mdx`
- **Caching:** `node_modules/next/dist/docs/01-app/02-guides/04-caching.mdx`

## Project Overview

**NewsBot** — A free news scraper + WhatsApp bot + Next.js dashboard.
- Scrapes LLM/AI news from TLDR AI and Hugging Face Blog (2 RSS sources)
- Summarizes with Groq AI (Llama 3.3 70B, free tier)
- Sends 3x/day via WhatsApp (08h, 12h, 18h BRT)
- Dashboard at `/` (5 pages: Home, Fontes, Agendamento, Histórico, Configurações)

## Stack & Key Patterns

| Layer | Technology | Pattern |
|-------|-----------|---------|
| Runtime | Bun 1.x | `bun install`, `bunx`, `bun run` |
| Frontend | Next.js 15 App Router | `src/app/` with file-based routing |
| Styling | Tailwind CSS + shadcn/ui | CSS variables in `globals.css`, `cn()` utility |
| Database | Supabase + Prisma | Singleton client in `src/lib/prisma.ts` |
| Scraping | Axios + Cheerio | RSS first, HTML fallback in `src/lib/scraper.ts` |
| AI | Groq SDK | `groq-sdk`, model `llama-3.3-70b-versatile` |
| WhatsApp | whatsapp-web.js | LocalAuth, Puppeteer, QR code first run |
| CI | GitHub Actions | 3 cron schedules, Chrome included |
| Deploy | Vercel | Dashboard only, pipeline runs in Actions |

## Architecture Rules

1. **Monolith, single package.json** — No turborepo or multi-package
2. **Zero cost** — Groq free (100K tokens/day), Supabase free, Vercel Hobby, GitHub Actions free
3. **No credentials in code** — All secrets via environment variables, GitHub Secrets in CI
4. **Portuguese (pt-BR)** — Dashboard UI, prompts, comments
5. **Server Components by default** — Use "use client" only when necessary
6. **Pipeline in GitHub Actions** — NOT in Vercel (Actions has Chrome + longer timeout)

## File Organization

```
src/
  app/           # Next.js App Router pages + API routes
  components/    # React components (ui/, layout)
  lib/           # Business logic (prisma, scraper, summarizer, whatsapp)
prisma/          # Schema + seed
scripts/         # Pipeline script (run-pipeline.ts)
.github/workflows/  # CI/CD
```

## Common Commands

```bash
bun install           # Install dependencies
bunx prisma generate  # Generate Prisma client
bunx prisma db push   # Sync schema to database
bun run db:seed       # Seed initial data (TLDR + Hugging Face)
bun run dev           # Start dev server
bun run pipeline      # Run full pipeline locally
```

## Important Notes

- whatsapp-web.js requires Chrome/Puppeteer — only works in GitHub Actions
- WhatsApp session is saved to `.wwebjs_auth/` and committed between runs
- Supabase free tier pauses after 7 days of inactivity (keep-alive via Actions)
- Groq rate limit: 30 RPM, 12K TPM for llama-3.3-70b-versatile
