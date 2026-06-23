# Synthesis Report — Plano de Implementação

**Date:** 2026-06-23
**Objective:** News Scraper + WhatsApp Bot + Next.js Dashboard
**Status:** ⏳ Aguardando aprovação humana

---

## 1. Resumo Executivo

Vamos construir um sistema que:
1. **Scrappa** notícias de sites brasileiros (G1, UOL) via Axios + Cheerio
2. **Resume** cada artigo via Groq API (Llama 3.3 70B) — **gratuito**
3. **Envia** no WhatsApp via whatsapp-web.js
4. **Gerencia** tudo por um dashboard Next.js com Supabase

**Custo total: $0/mês** ☁️

---

## 2. Stack Final

| Componente | Tecnologia | Motivo |
|-----------|-----------|--------|
| Frontend | Next.js 15 (App Router) | SSR, API routes, Vercel deploy |
| UI | Tailwind CSS + shadcn/ui | Componentes prontos, dark mode |
| Database | Supabase (PostgreSQL) | 500MB grátis, hospedado |
| ORM | Prisma | Type-safe, migrations |
| Scraping | Axios + Cheerio | Leve, rápido, sem browser |
| IA Resumo | Groq API (Llama 3.3 70B) | Grátis, rápido, sem CC |
| WhatsApp | whatsapp-web.js | Grátis, 22k ⭐, QR auth |
| Agendador | GitHub Actions | 2000 min/mês grátis |
| Hospedagem | Vercel (Hobby) | Next.js nativo, grátis |

---

## 3. Estrutura do Projeto

```
news-scrapper/
├── .github/
│   └── workflows/
│       ├── daily-news.yml        # Pipeline principal (cron)
│       └── keep-alive.yml        # Evita pause do Supabase
├── prisma/
│   └── schema.prisma             # Schema do banco
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Layout global com sidebar
│   │   ├── page.tsx              # Dashboard (home)
│   │   ├── fontes/
│   │   │   └── page.tsx          # Gerenciar fontes
│   │   ├── agendamento/
│   │   │   └── page.tsx          # Configurar horários
│   │   ├── historico/
│   │   │   └── page.tsx          # Histórico de artigos
│   │   ├── configuracoes/
│   │   │   └── page.tsx          # Config gerais
│   │   └── api/
│   │       ├── sites/route.ts    # CRUD fontes
│   │       ├── config/route.ts   # Config agendamento
│   │       ├── articles/route.ts # Histórico artigos
│   │       ├── stats/route.ts    # Dashboard stats
│   │       └── pipeline/route.ts # Gatilho manual
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── sidebar.tsx
│   │   ├── stats-cards.tsx
│   │   ├── source-list.tsx
│   │   ├── schedule-picker.tsx
│   │   ├── article-history.tsx
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── scraper.ts            # Axios + Cheerio
│   │   ├── summarizer.ts         # Groq API
│   │   ├── whatsapp.ts           # WhatsApp sender
│   │   └── utils.ts              # Helpers
│   └── types/
│       └── index.ts              # Tipos compartilhados
├── scripts/
│   ├── run-pipeline.ts           # Pipeline completo (GH Actions)
│   └── seed.ts                   # Dados iniciais
├── public/
│   └── favicon.ico
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 4. Milestones & Alocação

### M1: Setup do Projeto 🏗️
**Responsável: DevOps/SRE**

- [ ] Inicializar Next.js 15 com App Router + TypeScript
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Configurar Prisma + Supabase
- [ ] Schema do banco (sites, articles, summaries, send_log, config)
- [ ] Rodar migrations
- [ ] Configurar Vercel deploy
- [ ] Setup GitHub Actions workflows
- [ ] .env.example com todas as variáveis

### M2: Core — Scraping + IA 📰
**Responsável: Backend Engineer**

- [ ] Implementar `lib/scraper.ts`:
  - Adapter para G1 (RSS + HTML fallback)
  - Adapter para UOL (RSS + HTML fallback)
  - Extrator de JSON-LD (mais estável)
  - Dedup por URL
- [ ] Implementar `lib/summarizer.ts`:
  - Integração com Groq API (Llama 3.3 70B)
  - Prompt em português para resumo em 2 parágrafos
  - Fallback para sites sem conteúdo

### M3: Core — WhatsApp 📱
**Responsável: Backend Engineer**

- [ ] Implementar `lib/whatsapp.ts`:
  - Inicialização do whatsapp-web.js
  - Geração de QR code
  - Persistência de sessão
  - Formatação de mensagem
  - Envio com fallback

### M4: Pipeline GitHub Actions ⚡
**Responsável: DevOps/SRE**

- [ ] Workflow `daily-news.yml`:
  - Trigger por cron + manual
  - Setup Node.js + dependências
  - Executar pipeline completo
  - Salvar sessão WhatsApp como artifact
  - Notificar erros
- [ ] Workflow `keep-alive.yml`:
  - Ping semanal no Supabase

### M5: Dashboard Frontend 🎨
**Responsável: Frontend Engineer**

- [ ] Layout global (sidebar + bottom nav mobile)
- [ ] Página Dashboard (stats, atividade recente, status)
- [ ] Página Fontes (CRUD + toggle enable)
- [ ] Página Agendamento (horários, dias, fuso)
- [ ] Página Histórico (filtros, status badges)
- [ ] Página Configurações (WhatsApp, tema, idioma)
- [ ] Dark/light mode
- [ ] Responsivo (mobile-first)

### M6: API Routes 🔌
**Responsável: Backend Engineer**

- [ ] `GET/POST /api/sites` — CRUD fontes
- [ ] `PUT/DELETE /api/sites/[id]` — Editar/deletar fonte
- [ ] `GET/PUT /api/config` — Configurações
- [ ] `GET /api/articles` — Histórico com filtros
- [ ] `GET /api/stats` — Dashboard stats
- [ ] `POST /api/pipeline` — Gatilho manual

### M7: Quality Gate ✅
**Responsável: QA + Code Review**

- [ ] Revisão de código
- [ ] Teste de types (tsc --noEmit)
- [ ] Teste de lint (next lint)
- [ ] Verificação de segurança (env vars, SQL injection)
- [ ] Teste manual do fluxo completo

---

## 5. Dependências entre Tarefas

```
M1 (Setup) ──────────────► M2 (Scraping + IA)
  │                         │
  │                         ▼
  │                       M3 (WhatsApp)
  │                         │
  │                         ▼
  ├──────────────────────► M4 (Pipeline GH Actions)
  │                         │
  ▼                         │
M5 (Frontend) ◄────────────┘
  │
  ▼
M6 (API Routes) ◄─────── M4 (dados para API)
  │
  ▼
M7 (Quality Gate)
```

**Paralelizáveis:** M2 + M5 (backend e frontend independentes)

---

## 6. Database Schema

```prisma
model CrawledSite {
  id              String   @id @default(cuid())
  name            String
  url             String
  type            String   @default("rss") // "rss" | "html"
  selector        String?
  rssUrl          String?
  enabled         Boolean  @default(true)
  intervalMinutes Int      @default(30)
  lastCrawledAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  articles        Article[]
}

model Article {
  id            String     @id @default(cuid())
  siteId        String
  site          CrawledSite @relation(fields: [siteId], references: [id])
  url           String     @unique
  title         String
  body          String
  bodyHash      String
  publishedAt   DateTime?
  fetchedAt     DateTime   @default(now())
  status        String     @default("fetched") // fetched | summarized | sent | error
  errorMessage  String?
  summary       Summary?
  sendLogs      SendLog[]
}

model Summary {
  id          String   @id @default(cuid())
  articleId   String   @unique
  article     Article  @relation(fields: [articleId], references: [id])
  summary     String
  model       String
  tokensUsed  Int?
  createdAt   DateTime @default(now())
}

model SendLog {
  id          Int      @id @default(autoincrement())
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id])
  summaryId   String?
  recipient   String
  status      String   // "sent" | "failed"
  errorMessage String?
  sentAt      DateTime @default(now())
}

model AppConfig {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

---

## 7. Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://..."

# Groq (AI Summarization)
GROQ_API_KEY="gsk_..."

# WhatsApp
WHATSAPP_TARGET_PHONE="+5511999999999"

# App
NEXT_PUBLIC_APP_URL="https://news-scrapper.vercel.app"
```

---

## 8. Cron Jobs

**Pipeline diário** (`.github/workflows/daily-news.yml`):
```yaml
on:
  schedule:
    - cron: '0 7 * * *'   # 07:00 BRT (10:00 UTC)
    - cron: '0 12 * * *'  # 12:00 BRT (15:00 UTC)
    - cron: '0 18 * * *'  # 18:00 BRT (21:00 UTC)
  workflow_dispatch:        # Trigger manual
```

**Keep-alive Supabase** (`.github/workflows/keep-alive.yml`):
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'   # Domingo meia-noite
```

---

## 9. Próximos Passos

**Para começar a build, preciso da sua aprovação 👇**

---

**Plano apresentado por:** Maestro Orchestrator
**Milestones:** 7
**Tempo estimado:** 4-6 horas de implementação
**Custo mensal:** $0
