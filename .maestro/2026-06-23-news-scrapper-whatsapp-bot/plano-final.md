# 🎯 Plano Final — News Scraper + WhatsApp Bot + Dashboard

> **Última atualização:** 23 Jun 2026
> **Stack:** Next.js 15 + Supabase + Groq IA + whatsapp-web.js + GitHub Actions + Vercel
> **Custo:** $0/mês
> **Repositório:** Público (portfólio)
> **Projeto:** Monolito (1 projeto, 1 package.json)

---

## 📋 Índice

1. [Stack Definitiva](#1-stack-definitiva)
2. [Arquitetura Final](#2-arquitetura-final)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Milestones Detalhados](#4-milestones-detalhados)
5. [Cronograma](#5-cronograma)
6. [O Que Aprender](#6-o-que-aprender)

---

## 1. Stack Definitiva

### Tecnologias

| Camada | Tecnologia | Versão | Motivo |
|--------|-----------|--------|--------|
| **Framework** | Next.js | 15 (App Router) | Full-stack, SSR, API routes nativas |
| **Linguagem** | TypeScript | 5.x | Tipos = menos bugs, docs vivas |
| **Estilo** | Tailwind CSS | 4.x | Utility-first, rápido, responsivo |
| **Componentes** | shadcn/ui | latest | Acessível, dark mode, copiável |
| **Ícones** | lucide-react | latest | Mesmo pacote do shadcn |
| **ORM** | Prisma | 6.x | Type-safe, migrations automáticas |
| **Banco** | Supabase (PostgreSQL) | Free | 500MB grátis, hospedado, RLS |
| **Scraping** | Axios + Cheerio | latest | Leve (~2MB), sem browser |
| **IA** | Groq API (Llama 3.3 70B) | Free | Grátis, 200+ tokens/s, sem CC |
| **WhatsApp** | whatsapp-web.js | latest | Grátis, 22k ⭐, QR auth |
| **Scheduler** | GitHub Actions | Free | 2000 min/mês, Chrome incluso |
| **Hospedagem** | Vercel | Hobby | Next.js nativo, SSL, CDN |
| **Autenticação** | next-themes | latest | Dark/light mode nativo |

### Custo: $0/mês — Detalhado

| Recurso | Custo | Limite Free | Nosso uso estimado |
|---------|-------|-------------|-------------------|
| Vercel | $0 | 100 GB banda | < 1 GB/mês |
| Supabase | $0 | 500 MB PostgreSQL | < 10 MB (3 notícias/dia) |
| Groq API | $0 | 100K tokens/dia | ~1.800 tokens/dia (1.8%) |
| GitHub Actions | $0 | 2000 min/mês | ~30 min/mês (1.5%) |
| whatsapp-web.js | $0 | — | 3 msgs/dia |

---

## 2. Arquitetura Final

### Diagrama de Alto Nível

```
         👤 VOCÊ
    ┌─────────────────┐
    │  Dashboard Web  │ ←── news-scrapper.vercel.app
    │  (Vercel)       │
    └────────┬────────┘
             │ API Routes
             ▼
    ┌─────────────────┐
    │   Supabase DB   │ ←── PostgreSQL grátis
    │  (artigos, cfg) │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ GitHub Actions  │ ←── Cron: 08h, 12h, 18h
    │  Pipeline       │
    └────────┬────────┘
             │
    ┌────────▼────────┐     ┌──────────────────┐
    │ Scraping        │────▶│ G1 + UOL (RSS)   │
    │ Axios + Cheerio │     └──────────────────┘
    └────────┬────────┘
             │
    ┌────────▼────────┐     ┌──────────────────┐
    │ Resumo com IA   │────▶│ Groq Llama 3.3   │
    │ Groq API        │     │ 70B (grátis)      │
    └────────┬────────┘     └──────────────────┘
             │
    ┌────────▼────────┐     ┌──────────────────┐
    │ WhatsApp Send   │────▶│ Seu celular 📱    │
    │ wwebjs          │     │ 3x ao dia         │
    └─────────────────┘     └──────────────────┘
```

### Fluxo dos Dados (Passo a Passo)

```
[08:00] GitHub Actions acorda
  ↓
[08:00:05] Busca sites habilitados no Supabase (G1, UOL)
  ↓
[08:00:06] Faz scraping dos RSS feeds (axios + cheerio)
  ↓
[08:00:10] Compara URLs com banco (só processa novos)
  ↓
[08:00:11] Envia texto pra Groq: "Resuma em 2 parágrafos"
  ↓
[08:00:13] Recebe resumo pronto (~3s por artigo)
  ↓
[08:00:14] Conecta WhatsApp Web (sessão salva)
  ↓
[08:00:15] Envia mensagem formatada 📰
  ↓
[08:00:16] Salva tudo no Supabase (histórico)
  ↓
[08:00:17] Pipeline encerra — GitHub Actions dorme
```

---

## 3. Estrutura do Projeto

### Árvore Completa (com explicações)

```
📁 news-scrapper/                          ← 1 repositório (público no GitHub)
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── 📄 daily-news.yml              ← Pipeline: roda 08h, 12h, 18h (BRT)
│       │                                    - Faz scraping + IA + WhatsApp
│       │                                    - Executa em ubuntu (Chrome incluso)
│       │
│       └── 📄 keep-alive.yml              ← 1x/semana: ping no Supabase
│                                             (impede desligamento por inatividade)
│
├── 📁 prisma/
│   ├── 📄 schema.prisma                   ← Definição de TODAS as tabelas
│   │                                         5 models: CrawledSite, Article,
│   │                                         Summary, SendLog, AppConfig
│   │
│   └── 📄 seed.ts                         ← Popula banco com G1 + UOL
│
├── 📁 src/
│   ├── 📁 app/                            ← Next.js App Router
│   │   │                                     (cada pasta vira uma rota)
│   │   │
│   │   ├── 📄 layout.tsx                  ← Layout global: sidebar + bottom nav
│   │   ├── 📄 page.tsx                    ← / Dashboard com stats
│   │   │
│   │   ├── 📁 fontes/
│   │   │   └── 📄 page.tsx                ← /fontes CRUD de sites + toggle
│   │   │
│   │   ├── 📁 agendamento/
│   │   │   └── 📄 page.tsx                ← /agendamento Horários + dias + fuso
│   │   │
│   │   ├── 📁 historico/
│   │   │   └── 📄 page.tsx                ← /historico Artigos + status envio
│   │   │
│   │   ├── 📁 configuracoes/
│   │   │   └── 📄 page.tsx                ← /configuracoes WhatsApp + tema
│   │   │
│   │   └── 📁 api/                        ← API Routes (backend)
│   │       ├── 📁 sites/
│   │       │   ├── 📄 route.ts            ← GET (listar), POST (criar)
│   │       │   └── 📁 [id]/
│   │       │       └── 📄 route.ts        ← PUT (editar), DELETE (remover)
│   │       │
│   │       ├── 📁 config/
│   │       │   └── 📄 route.ts            ← GET/PUT configurações
│   │       │
│   │       ├── 📁 articles/
│   │       │   └── 📄 route.ts            ← GET histórico (com filtros)
│   │       │
│   │       ├── 📁 stats/
│   │       │   └── 📄 route.ts            ← GET dados do dashboard
│   │       │
│   │       └── 📁 pipeline/
│   │           └── 📄 route.ts            ← POST gatilho manual
│   │
│   ├── 📁 lib/                            ← Lógica COMPARTILHADA
│   │   ├── 📄 db.ts                       ← Prisma Client (conexão única)
│   │   ├── 📄 scraper.ts                  ← Axios + Cheerio (RSS + HTML)
│   │   ├── 📄 summarizer.ts               ← Groq API (prompt engenharia)
│   │   ├── 📄 whatsapp.ts                 ← whatsapp-web.js (QR + envio)
│   │   └── 📄 utils.ts                    ← Helpers (datas, formatação)
│   │
│   ├── 📁 components/                     ← UI components
│   │   ├── 📁 ui/                         ← shadcn/ui (gerado automaticamente)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── switch.tsx
│   │   │   └── ...
│   │   ├── 📄 sidebar.tsx                 ← Navegação desktop
│   │   ├── 📄 mobile-nav.tsx             ← Navegação mobile (bottom tabs)
│   │   ├── 📄 theme-provider.tsx         ← Dark/light mode
│   │   ├── 📄 stats-cards.tsx            ← Cards do dashboard
│   │   └── 📄 source-form.tsx            ← Modal de adicionar fonte
│   │
│   └── 📄 types/
│       └── index.ts                      ← Interfaces compartilhadas
│
├── 📁 scripts/                            ← Scripts STANDALONE (rodam fora do Next.js)
│   └── 📄 run-pipeline.ts                ← Pipeline completo:
│                                            scrape → summarize → send → log
│                                            Usado pelo GitHub Actions
│                                            (roda com npx tsx)
│
├── 📄 .env.example                        ← Template das env vars (SÓ EXEMPLO)
├── 📄 .gitignore                          ← Bloqueia .env, node_modules, etc
├── 📄 next.config.ts                      ← Config Next.js
├── 📄 tailwind.config.ts                  ← Config Tailwind
├── 📄 tsconfig.json                       ← Config TypeScript
├── 📄 vercel.json                         ← Config Vercel (crons, headers)
└── 📄 package.json                        ← 1 ÚNICO arquivo
```

---

## 4. Milestones Detalhados

### 📦 M0 — Setup das Contas ⏳ [VOCÊ FAZ]

Tempo estimado: **15 minutos**

| # | Ação | Link | Tempo |
|---|------|------|-------|
| 1 | Criar conta **Supabase** (GitHub login) + projeto `news-scrapper` região São Paulo | [supabase.com](https://supabase.com) | 5min |
| 2 | Anotar `DATABASE_URL` em Project Settings > Database > URI | — | 1min |
| 3 | Criar conta **Groq** (Google login) + API Key `gsk_...` | [console.groq.com](https://console.groq.com) | 3min |
| 4 | Criar conta **GitHub** (se não tiver) | [github.com](https://github.com) | 3min |
| 5 | Conectar **Vercel** com GitHub | [vercel.com](https://vercel.com) | 2min |

> 🔐 **Importante:** Guarde `DATABASE_URL` e `GROQ_API_KEY` num lugar seguro (vamos usar depois)

---

### 🏗️ M1 — Setup do Projeto [🤖 MAESTRO FAZ]

Tempo estimado: **30 minutos**

| Passo | Arquivo/Comando | O que acontece |
|-------|-----------------|----------------|
| 1.1 | `npx create-next-app@latest .` | Cria Next.js 15 com TypeScript + Tailwind |
| 1.2 | `npm install @prisma/client axios cheerio groq-sdk whatsapp-web.js qrcode-terminal date-fns` | Instala dependências principais |
| 1.3 | `npm install -D prisma tsx` | Instala ferramentas de dev |
| 1.4 | `npx shadcn@latest init` | Configura shadcn/ui (componentes acessíveis) |
| 1.5 | `npx shadcn@latest add button card switch select table dialog toast` | Adiciona componentes |
| 1.6 | **Criar**: `prisma/schema.prisma` | Define 5 tabelas (models) |
| 1.7 | `npx prisma migrate dev --name init` | Cria as tabelas no Supabase |
| 1.8 | **Criar**: `prisma/seed.ts` | Popula G1 + UOL + config padrão |
| 1.9 | `npx tsx prisma/seed.ts` | Executa seed |
| 1.10 | **Criar**: `.env.example` | Template seguro (sem senhas reais) |
| 1.11 | **Criar**: `src/lib/db.ts` | Singleton do Prisma Client |

**🔍 Verificação:** `npm run dev` abre Next.js, `npx prisma studio` mostra tabelas vazias

---

### 📰 M2 — Scraping + IA [🤖 MAESTRO FAZ]

Tempo estimado: **1 hora**

| Passo | Arquivo | O que ensina |
|-------|---------|-------------|
| 2.1 | `src/lib/scraper.ts` | **Axios + Cheerio**: buscar páginas e extrair dados |
| | | **RSS parsing**: extrair notícias de feeds XML |
| | | **JSON-LD**: extrair dados estruturados (mais estável) |
| | | **Fallbacks**: RSS → HTML → JSON-LD → meta tags |
| | | **Rate limiting**: delay de 1s entre requisições |
| 2.2 | `src/lib/summarizer.ts` | **Groq API SDK**: chamada à IA |
| | | **Prompt engineering**: como escrever prompts que funcionam |
| | | **Temperature 0.3**: controle de criatividade vs factualidade |
| | | **Token counting**: monitoramento de consumo grátis |

**Conceitos aprendidos:**
- Como funciona um web scraper (HTTP → HTML → extração)
- Diferença entre RSS (estruturado) e HTML (bagunçado)
- O que é JSON-LD e como sites brasileiros usam
- Como "conversar" com IA via prompts eficazes

---

### 📱 M3 — WhatsApp [🤖 MAESTRO FAZ]

Tempo estimado: **45 minutos**

| Passo | Arquivo | O que ensina |
|-------|---------|-------------|
| 3.1 | `src/lib/whatsapp.ts` | **whatsapp-web.js**: como funciona por baixo |
| | | **Puppeteer**: Chrome headless automatizado |
| | | **QR Code auth**: autenticação via celular |
| | | **LocalAuth**: persistência de sessão (não precisa re-escanear) |
| | | **Formatação**: mensagem bonita com markdown do WhatsApp |

**Conceitos aprendidos:**
- Como o WhatsApp Web funciona (WebSocket + QR Code)
- O que é browser automation (Puppeteer/Playwright)
- Formatação de mensagem no WhatsApp (negrito, itálico, emoji)
- Gerenciamento de sessão (salvar estado entre execuções)

---

### ⚡ M4 — Pipeline GitHub Actions [🤖 MAESTRO FAZ]

Tempo estimado: **30 minutos**

| Passo | Arquivo | O que ensina |
|-------|---------|-------------|
| 4.1 | `.github/workflows/daily-news.yml` | **Cron syntax**: `0 11 * * *` = 08:00 BRT |
| | | **workflow_dispatch**: botão manual |
| | | **Secrets**: `${{ secrets.DATABASE_URL }}` |
| | | **Cache**: `actions/cache` pra npm mais rápido |
| 4.2 | `scripts/run-pipeline.ts` | **Script standalone**: roda fora do Next.js |
| | | **Orquestração**: scrape → summarize → send → log |
| | | **Error handling**: `continue-on-error` |
| | | **Git commit da sessão**: preserva auth entre runs |
| 4.3 | `.github/workflows/keep-alive.yml` | **Ping semanal**: mantém Supabase ativo |

**Conceitos aprendidos:**
- O que é CI/CD e GitHub Actions
- Como agendar tarefas na nuvem (cron)
- Diferença entre serverless (Vercel) e runner (GH Actions)
- Por que o pipeline roda no GitHub Actions e não no Vercel

---

### 🎨 M5 — Dashboard Frontend [🤖 MAESTRO FAZ]

Tempo estimado: **2 horas**

| Página | Rota | Componentes | Funcionalidades |
|--------|------|-------------|-----------------|
| **Dashboard** | `/` | StatsCards, ActivityChart | Stats do dia, status do bot, últimos artigos |
| **Fontes** | `/fontes` | SourceList, SourceForm, ToggleSwitch | CRUD sites, ativar/desativar |
| **Agendamento** | `/agendamento` | TimePicker, DayPicker, TimezoneSelect | Horários, dias, fuso horário |
| **Histórico** | `/historico` | ArticleList, StatusBadge, SearchFilter | Artigos scrappados com status |
| **Config** | `/configuracoes` | ThemeToggle, PhoneInput, LanguageSelect | WhatsApp, tema, notificações |

**Conceitos aprendidos:**
- Server Components vs Client Components
- shadcn/ui (Radix UI por baixo)
- Dark mode com next-themes
- Layout responsivo (sidebar + bottom nav)
- Formulários com validação

---

### 🔌 M6 — API Routes [🤖 MAESTRO FAZ]

Tempo estimado: **1 hora**

| Rota | Métodos | Função |
|------|---------|--------|
| `/api/sites` | GET, POST | Listar e criar fontes |
| `/api/sites/[id]` | PUT, DELETE | Editar e deletar fonte |
| `/api/config` | GET, PUT | Ler e atualizar configs |
| `/api/articles` | GET | Histórico com filtros |
| `/api/stats` | GET | Stats do dashboard |
| `/api/pipeline` | POST | Gatilho manual |

---

### ✅ M7 — Quality Gate [🤖 MAESTRO FAZ + 👤 VERIFICA]

| Passo | Comando | O que verifica |
|-------|---------|---------------|
| 7.1 | `npx tsc --noEmit` | Erros de tipo TypeScript |
| 7.2 | `npm run lint` | Erros de padrão de código |
| 7.3 | `npm run build` | Se compila pra produção |
| 7.4 | `npx tsx scripts/run-pipeline.ts` | Pipeline roda localmente |
| 7.5 | Teste manual | Fluxo completo funcional |

---

## 5. Cronograma

### Sequência de Execução

```
DIA 1 (30 min)
├── M0 👤 Você cria contas (Supabase, Groq, GitHub)
└── M1 🤖 Setup do projeto + banco

DIA 2 (2h)
├── M2 🤖 Scraping + IA (código explicado)
└── M3 🤖 WhatsApp (código explicado)

DIA 3 (1h)
├── M4 🤖 Pipeline GitHub Actions
├── M5 🤖 Dashboard (código + UI)
└── M6 🤖 API Routes

DIA 4 (30 min)
├── M7 🤖 Quality Gate
├── 👤 Você sobe pro GitHub + configura secrets
├── 👤 Você conecta Vercel
└── 👤 Você escaneia QR code → BOT VIVO! 🎉
```

---

## 6. O Que Você Vai Aprender

### 6.1 Conceitos de Engenharia

| Conceito | Onde aparece | Por que importa |
|----------|-------------|-----------------|
| **Arquitetura Monolito** | 1 projeto, 1 deploy | Simplicidade > complexidade prematura |
| **Separação de Concerns** | `src/lib/` vs `src/app/` vs `scripts/` | Código organizado, fácil de manter |
| **Server Components** | `src/app/page.tsx` | Renderiza no servidor, menos JS no browser |
| **API Routes** | `src/app/api/` | Backend dentro do frontend |
| **Prisma ORM** | `prisma/schema.prisma` | TypeScript que vira SQL |
| **CI/CD** | `.github/workflows/` | Código que testa e deploya sozinho |

### 6.2 Tecnologias Específicas

| Tecnologia | Você vai saber fazer |
|-----------|---------------------|
| **Next.js 15** | Criar páginas, API routes, layouts |
| **TypeScript** | Tipar interfaces, usar generics |
| **Tailwind** | Layout responsivo, dark mode |
| **shadcn/ui** | Componentes acessíveis e bonitos |
| **Prisma** | Modelar banco, migrar, consultar |
| **Supabase** | PostgreSQL hospedado grátis |
| **Axios + Cheerio** | Scraper de qualquer site |
| **Groq API** | Chamar IA com prompt engineering |
| **whatsapp-web.js** | Automatizar WhatsApp |
| **GitHub Actions** | Pipelines, cron, secrets |
| **Vercel** | Deploy automático, domínio grátis |

---

## 🚀 Deploy Passo a Passo (Checklist)

### Depois que eu criar o código, você faz:

```
[ ] 1. git init && git add . && git commit -m "🎉 Initial commit"
[ ] 2. git remote add origin https://github.com/[SEU_USER]/news-scrapper.git
[ ] 3. git push -u origin main

[ ] 4. GitHub > Settings > Secrets > Actions:
       ├── DATABASE_URL         ← Sua connection string do Supabase
       ├── GROQ_API_KEY          ← gsk_... do Groq
       ├── WHATSAPP_TARGET_PHONE ← 5511999999999 (seu número)
       ├── SUPABASE_URL          ← https://[id].supabase.co
       └── SUPABASE_ANON_KEY     ← anon public key do Supabase

[ ] 5. Vercel > Import repo > Add env vars > Deploy

[ ] 6. GitHub > Actions > Daily News Pipeline > Run workflow
       → Aparece QR CODE nos logs
       → Abre WhatsApp > Menu > WhatsApp Web > Escaneia
       → Pronto! 🎉

[ ] 7. Abrir https://news-scrapper.vercel.app → Dashboard vivo!
```

---

## 📊 Resumo das Decisões

| Decisão | Opção Escolhida | Alternativa Rejeitada | Motivo |
|---------|----------------|----------------------|--------|
| Arquitetura | **Monolito** (1 projeto) | Multi-pacote (Turborepo) | Simplicidade, 1 deploy |
| WhatsApp | **whatsapp-web.js** (grátis) | Twilio API ($0.005/msg) | Custo $0, 3 msg/dia = risco baixo |
| IA | **Groq** (Llama 3.3 70B) | OpenAI ($0.01/artigo) | Grátis, sem CC, mais rápido |
| Banco | **Supabase** (PostgreSQL) | SQLite | Hospedado, acessível de qualquer lugar |
| Scheduler | **GitHub Actions** | Vercel Cron (60s timeout) | Precisa de Chrome (Puppeteer) |
| Repositório | **Público** | Privado | Portfólio — sem credenciais no código |
| Hospedagem | **Vercel** (Hobby) | Render, Railway | Melhor Next.js, grátis, simples |

---

**Plano salvo em:** `.maestro/2026-06-23-news-scrapper-whatsapp-bot/plano-final.md`

**Pronto para começar a Build?** 🔥
