# 📰 NewsBot — News Scrapper + WhatsApp Bot + Dashboard

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Pipeline-blue?logo=githubactions)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**NewsBot** é um scraper de notícias de tecnologia gratuito que coleta artigos de **TLDR AI** e **Hugging Face Blog**, resume com IA (Llama 3.3 70B via Groq) e envia 3x/dia no seu WhatsApp.

> 🇧🇷 Projeto 100% em português, feito por dev pra dev.

---

## ✨ Funcionalidades

- **🤖 Scraping automático** — RSS + fallback HTML
- **🧠 Resumo por IA** — Groq (Llama 3.3 70B), grátis, sem cartão de crédito
- **📱 Entrega no WhatsApp** — 3x/dia (08h, 12h, 18h BRT)
- **📊 Dashboard web** — Next.js 15 + Tailwind + shadcn/ui (dark mode)
- **🔧 Configurável** — Fontes, horários, número do WhatsApp
- **💰 Custo zero** — Groq free, Supabase free, Vercel Hobby, GitHub Actions free
- **🥟 Bun runtime** — Mais rápido que Node.js, `bunx` no lugar de `npx`

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Actions (cron)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Scraper  │→ │ Groq IA  │→ │ WhatsApp (wwebjs)    │   │
│  │(Axios+   │  │(Resumo)  │  │(Puppeteer)           │   │
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
                  │  Vercel      │ ← Dashboard Next.js
                  │  (Hobby)     │
                  └──────────────┘
```

## 🚀 Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| **Runtime** | Bun 1.x | 4x mais rápido que Node.js, `bunx` nativo |
| **Frontend** | Next.js 15 + Tailwind + shadcn/ui | SSR, DX, componentes lindos |
| **Database** | Supabase (PostgreSQL) + Prisma | 500MB free, ORM type-safe |
| **Scraping** | Axios + Cheerio | Leve, sem headless browser |
| **IA** | Groq API (Llama 3.3 70B) | 100K tokens/dia grátis |
| **WhatsApp** | whatsapp-web.js | Gratuito, Puppeteer |
| **CI/Agendamento** | GitHub Actions | 2000 min/mês grátis, Chrome incluso |
| **Host** | Vercel (Hobby) | Deploy 1-clique, grátis |

## 📋 Pré-requisitos

- [Bun](https://bun.sh/) 1.x (`curl -fsSL https://bun.sh/install | bash`)
- [Git](https://git-scm.com/)

**Contas gratuitas necessárias:**
- [Supabase](https://supabase.com/) — banco PostgreSQL
- [Groq](https://console.groq.com/) — API de IA
- [GitHub](https://github.com/) — repositório + Actions
- [Vercel](https://vercel.com/) — deploy do dashboard

## 🛠️ Setup local

```bash
# 1. Clone
git clone https://github.com/seu-usuario/news-scrapper.git
cd news-scrapper

# 2. Instalar dependências
bun install

# 3. Copiar .env e preencher
cp .env.example .env
# Edite .env com suas credenciais (DATABASE_URL, GROQ_API_KEY, WHATSAPP_NUMBER)

# 4. Gerar Prisma Client e criar tabelas
bunx prisma generate
bunx prisma db push

# 5. Seed (dados iniciais: fontes TLDR + Hugging Face)
bun run db:seed

# 6. Rodar o dashboard
bun run dev
# Acesse: http://localhost:3000
```

## 🚢 Deploy

### 1. Supabase
1. Crie conta em [supabase.com](https://supabase.com/)
2. Novo projeto → anote a `Database connection string` (transaction mode, porta 6543)

### 2. Groq
1. Acesse [console.groq.com/keys](https://console.groq.com/keys)
2. Crie uma API key (gratuita)

### 3. GitHub
```bash
# O repositório já está com git init feito
gh repo create news-scrapper --public --push
```

### 4. GitHub Secrets
No repositório > Settings > Secrets and variables > Actions:

| Secret | Valor |
|--------|-------|
| `DATABASE_URL` | `postgresql://postgres:...` (do Supabase) |
| `GROQ_API_KEY` | `gsk_...` (do Groq) |
| `WHATSAPP_NUMBER` | `5511999999999` (seu número) |

### 5. Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório
3. Adicione `DATABASE_URL` nas variáveis de ambiente
4. Deploy! 🎉

### 6. WhatsApp QR Code
Na primeira execução do GitHub Actions, ele vai gerar um QR code. Você precisa:
1. Ir em Actions > Daily News Pipeline > manual run
2. Ver o QR code nos logs
3. Escanear com WhatsApp > Dispositivos Conectados

A sessão fica salva para as próximas execuções.

## 📁 Estrutura do Projeto

```
.
├── .github/workflows/
│   └── daily-news.yml          # Pipeline 3x/dia
├── prisma/
│   ├── schema.prisma           # Schema do banco (5 modelos)
│   └── seed.ts                 # Dados iniciais
├── scripts/
│   └── run-pipeline.ts         # Script da pipeline
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home / Dashboard
│   │   ├── fontes/page.tsx     # Fontes de notícias
│   │   ├── agendamento/page.tsx# Horários de entrega
│   │   ├── historico/page.tsx  # Log de envios
│   │   ├── configuracoes/page.tsx # Configurações
│   │   ├── layout.tsx          # Root layout + sidebar
│   │   ├── globals.css         # Tailwind + CSS variables
│   │   └── api/
│   │       ├── sites/          # CRUD fontes
│   │       ├── config/         # Config global
│   │       ├── articles/       # Lista artigos
│   │       ├── stats/          # Estatísticas
│   │       └── pipeline/       # Disparo manual
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── sidebar.tsx         # Navegação
│   │   ├── theme-provider.tsx  # Dark mode
│   │   └── theme-toggle.tsx    # Botão tema
│   └── lib/
│       ├── prisma.ts           # Prisma singleton
│       ├── scraper.ts          # Scraper RSS/HTML
│       ├── summarizer.ts       # Resumo com Groq
│       ├── whatsapp.ts         # Envio WhatsApp
│       └── utils.ts            # cn() helper
├── .env.example
├── .gitignore
├── bun.lockb                   # Lockfile do Bun
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 💰 Custos (R$ 0,00/mês)

| Serviço | Plano | Limite | Uso esperado |
|---------|-------|--------|-------------|
| Groq API | Free | 100K tokens/dia | ~1.800 tokens/dia (1,8%) |
| Supabase | Free | 500MB, 50k linhas | < 1MB/mês |
| GitHub Actions | Free | 2000 min/mês | ~30 min/mês |
| Vercel | Hobby | 100h/mês | < 10h/mês |
| whatsapp-web.js | Grátis | — | 3 msg/dia |

## ⚠️ Avisos

- **whatsapp-web.js** não é oficial. Viola ToS do WhatsApp em teoria. Use número secundário.
- **Supabase** pausa projetos inativos após 7 dias. O keep-alive no GitHub Actions previne.
- **QR code** necessário na primeira execução. Após isso, sessão é persistida.

## 📄 Licença

MIT — Use, modifique, compartilhe.

---

<p align="center">
  Feito com ☕ por <a href="https://github.com/seu-usuario">você</a>
</p>
