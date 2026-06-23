# 📚 Plano Detalhado Passo a Passo — News Scraper + WhatsApp Bot

> **Objetivo:** Construir um sistema que scrappa notícias, resume com IA grátis e envia no WhatsApp
> **Custo:** $0/mês
> **Público:** Iniciante/intermediário — vou explicar cada decisão

---

## 🧭 Como Ler Este Plano

- **👤 Você faz** — tarefas manuais (criar contas, pegar chaves)
- **🤖 Maestro faz** — codifica, configura, executa
- **💡 Comentário** — explica o *porquê* de cada decisão
- **🔍 Verificação** — como saber se deu certo

---

## M0 — Pré-requisitos (Contas que VOCÊ precisa criar) ⏳

Antes de começar, você precisa criar 3 contas grátis.

---

### M0.1 — Conta no Supabase (Banco de Dados)

> **O que é:** Supabase é um banco PostgreSQL hospedado com 500MB grátis. Vamos guardar artigos, configurações e histórico aqui.

| Passo | Ação |
|-------|------|
| 1 | Acesse [supabase.com](https://supabase.com) |
| 2 | Clique "Start your project" |
| 3 | Faça login com GitHub (recomendado) ou email |
| 4 | Crie uma **Organization** (nome: qualquer, ex: "meus-projetos") |
| 5 | Crie um **Project**:
|    - Name: `news-scrapper`
|    - Database Password: **GUARDE ISSO** (vamos usar como `DATABASE_PASSWORD`)
|    - Region: `South America (São Paulo)` — ***importante: menor latência pra você***
| 6 | Aguarde 1-2 minutos o provisionamento |
| 7 | Vá em **Project Settings → Database → Connection string** |
| 8 | Copie a `Connection string` (URI) — começa com `postgresql://postgres:...` |
| 9 | Anote também o **Project ID** (está na URL: `https://supabase.com/project/[ID]`) |

**💡 Por que Supabase e não SQLite?**
- SQLite é um arquivo local — não funciona no Vercel (serverless é stateless)
- Supabase fica na nuvem, acessível de qualquer lugar (Vercel, GitHub Actions, seu cell)
- 500MB grátis = ~100.000 artigos

**🔍 Verificação:** Você deve ter:
- [ ] URL de conexão: `postgresql://postgres:[PASSWORD]@db.[ID].supabase.co:6543/postgres`
- [ ] Project ID: `[ID]`
- [ ] Database Password anotado

---

### M0.2 — Conta no Groq (IA para Resumo)

> **O que é:** Groq tem chips ultra-rápidos (LPU) que rodam IA. Eles oferecem acesso grátis ao Llama 3.3 70B — um modelo TOP de linha, melhor que muitos pagos.

| Passo | Ação |
|-------|------|
| 1 | Acesse [console.groq.com](https://console.groq.com) |
| 2 | Clique "Sign Up" |
| 3 | Faça login com **Conta Google** (mais rápido) ou GitHub |
| 4 | Vá em **API Keys** (canto inferior esquerdo) |
| 5 | Clique "Create API Key" |
| 6 | Nome: `news-scrapper` |
| 7 | Copie a chave — começa com `gsk_...` — **e guarde** (não aparece de novo!) |

**💡 Por que Groq e não OpenAI?**
- OpenAI GPT-4o-mini: ~$0.01/artigo → $3/mês para 300 artigos
- Groq Llama 3.3 70B: **$0/mês ilimitado** (dentro de 100K tokens/dia)
- Groq é 10x mais rápido (200-350 tokens/segundo vs 30-50 da OpenAI)
- Groq **não pede cartão de crédito** — só login social

**🔍 Verificação:** Você deve ter:
- [ ] API Key: `gsk_...` (começa com gsk_)

---

### M0.3 — Conta no GitHub + Vercel

> **O que é:** GitHub hospeda o código e roda os scripts agendados. Vercel faz o deploy do site.

| Passo | Ação |
|-------|------|
| 1 | Acesse [github.com](https://github.com) e crie conta (se não tiver) |
| 2 | Acesse [vercel.com](https://vercel.com) e clique "Sign Up" |
| 3 | Escolha "Continue with GitHub" — conecta automático |
| 4 | **(opcional)** Instale Vercel CLI: `npm i -g vercel` |

**💡 Por que Vercel e não outro?**
- Vercel foi feita PELO time do Next.js — integração perfeita
- Free tier: 100GB banda, SSL grátis, CDN global, deploy automático do GitHub
- "Push to deploy" — você sobe código e pronto

**🔍 Verificação:**
- [ ] Conta GitHub ativa
- [ ] Conta Vercel conectada ao GitHub

---

## 📦 M1 — Setup do Projeto (30 min) — 🤖 Maestro faz

> **O que vamos fazer:** Inicializar o projeto Next.js, conectar banco, instalar componentes

---

### 1.1 Inicializar Next.js 15

```bash
# Cria um projeto Next.js com App Router + TypeScript + Tailwind
# O App Router é o novo sistema de rotas do Next.js (recomendado)
npx create-next-app@latest . \
  --typescript \         # TypeScript = código mais seguro, menos bugs
  --tailwind \           # Tailwind = CSS utility-first, mais rápido de estilizar
  --eslint \             # ESLint = pega erros de código automaticamente
  --app \                # App Router = novo sistema de rotas (recomendado)
  --src-dir \            # Código fonte em src/ (organização)
  --import-alias "@/*"   # "@/" = caminho absoluto (ex: import { x } from "@/lib/db")
```

**💡 Por que cada flag?**
- `--typescript`: JavaScript com tipos. Pega erros ANTES de rodar. Vale o esforço inicial
- `--tailwind`: Você escreve `className="text-blue-500 flex"` em vez de criar arquivos CSS separados
- `--app`: App Router permite componentes de servidor (Server Components) — mais rápido, menos JS no browser

---

### 1.2 Instalar Dependências

```bash
# 📦 Prisma — ORM (Object-Relational Mapping)
# Traduz TypeScript <-> SQL. Você escreve tipos, ele gera queries
npm install @prisma/client
npm install -D prisma      # -D = devDependency (só precisa em dev)

# 📦 Supabase client — para conectar no banco
npm install @supabase/supabase-js

# 📦 Scraping — buscar páginas e extrair conteúdo
npm install axios cheerio
# axios = faz requisições HTTP (buscar páginas)
# cheerio = jQuery do servidor (navegar pelo HTML)

# 📦 IA — Groq SDK
npm install groq-sdk
# SDK oficial da Groq, mesma interface da OpenAI

# 📦 WhatsApp
npm install whatsapp-web.js qrcode-terminal
# whatsapp-web.js = conecta no WhatsApp Web via Puppeteer
# qrcode-terminal = mostra QR code no terminal pra autenticar

# 📦 Utilitários
npm install date-fns       # Manipulação de datas (leve, tree-shakeable)

# 📦 Dev Dependencies
npm install -D @types/node tsx
# tsx = roda TypeScript direto sem compilar (pra scripts)
```

---

### 1.3 Configurar shadcn/ui

```bash
# shadcn/ui = biblioteca de componentes prontos (botões, modais, tabelas...)
# Diferente de outras libs, você COPIA o código — controle total
npx shadcn@latest init

# Durante a config:
# - Style: Default
# - Base color: Zinc (neutro, funciona bem dark/light)
# - CSS variables: Yes
# - src/ directory: Yes

# Instalar componentes que vamos usar:
npx shadcn@latest add button card input switch select table dialog toast separator skeleton badge
```

**💡 Por que shadcn/ui?**
- Componentes acessíveis (ARIA compliant) — cego consegue usar
- Dark mode nativo
- Você tem o código — pode modificar qualquer detalhe
- Usa Radix UI por baixo (biblioteca headless robusta)

---

### 1.4 Configurar Prisma + Supabase

**Arquivo: `prisma/schema.prisma`**

```prisma
// Prisma = "TypeScript que vira SQL"
// Toda tabela vira um tipo TypeScript automaticamente

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Pega do .env (segurança!)
}

// 🗂️ Tabela: fontes de notícia
// Ex: "G1", "UOL" — cada site que queremos scrappar
model CrawledSite {
  id              String     @id @default(cuid())  // cuid = id único gerado
  name            String                            // Nome amigável
  url             String                            // URL base do site
  type            String     @default("rss")        // "rss" ou "html"
  selector        String?                           // Seletor CSS (se type="html")
  rssUrl          String?                           // URL do feed RSS (se type="rss")
  enabled         Boolean    @default(true)          // Ativo? Podemos desligar sem deletar
  intervalMinutes Int        @default(30)            // A cada quantos minutos checar
  lastCrawledAt   DateTime?                          // Última vez que scrappamos
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  articles        Article[]                          // Relacionamento 1:N
}

// 📰 Tabela: artigos scrappados
model Article {
  id            String     @id @default(cuid())
  siteId        String                                // Qual site de origem
  site          CrawledSite @relation(fields: [siteId], references: [id])
  url           String     @unique                    // URL única (evita duplicatas)
  title         String                                // Título da notícia
  body          String                                // Corpo do texto
  bodyHash      String                                // Hash do body (pra detectar mudanças)
  publishedAt   DateTime?                             // Data de publicação (se disponível)
  fetchedAt     DateTime   @default(now())            // Quando scrappamos
  status        String     @default("fetched")        // fetched -> summarized -> sent
  errorMessage  String?                               // Se algo deu errado
  summary       Summary?                              // Relacionamento 1:1 com resumo
  sendLogs      SendLog[]                             // Relacionamento 1:N com logs
}

// 📝 Tabela: resumos gerados pela IA
model Summary {
  id          String   @id @default(cuid())
  articleId   String   @unique                       // 1 artigo = 1 resumo
  article     Article  @relation(fields: [articleId], references: [id])
  summary     String                                  // O resumo em si
  model       String                                  // Qual modelo usou
  tokensUsed  Int?                                    // Quantos tokens (pra monitorar)
  createdAt   DateTime @default(now())
}

// 📤 Tabela: log de envios
model SendLog {
  id            Int      @id @default(autoincrement()) // Número sequencial
  articleId     String
  article       Article  @relation(fields: [articleId], references: [id])
  summaryId     String?
  recipient     String                                // Número do WhatsApp
  status        String                                // "sent" ou "failed"
  errorMessage  String?
  sentAt        DateTime @default(now())
}

// ⚙️ Tabela: configurações do app
// Chave-valor flexível — qualquer config nova sem migração
model AppConfig {
  key       String   @id                              // Ex: "schedule", "whatsapp_target"
  value     String                                    // Valor em texto
  updatedAt DateTime @updatedAt
}
```

**💡 Por que esse schema?**
- `@unique` em `url` — impede o mesmo artigo de ser scrappado 2x
- `status` como string — simples, flexível (poderíamos usar enum, mas string permite novos estados sem migração)
- AppConfig chave-valor — qualquer config (tema, horário, etc) sem precisar alterar schema

---

### 1.5 Executar Migração

```bash
# Cria as tabelas no Supabase
npx prisma migrate dev --name init
# --name "init" = nome da migração (descreve o que mudou)
# Isso gera um arquivo SQL em prisma/migrations/

# Gera o Client TypeScript
npx prisma generate
# Cria types em node_modules/.prisma/client/
# Agora você pode importar: import { PrismaClient } from '@prisma/client'
```

---

### 1.6 Configurar env

**Arquivo: `.env`** (NUNCA commitar — já está no `.gitignore`)

```env
# 🔗 Supabase (Banco de Dados)
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:6543/postgres"
# 🔑 Pega em: Supabase > Project Settings > Database > Connection string
# ⚠️ Troque [SUA_SENHA] pela senha que você criou
# ⚠️ Troque [SEU_PROJETO] pelo seu Project ID

# 🤖 Groq (IA para resumos)
GROQ_API_KEY="gsk_[SUA_CHAVE]"
# 🔑 Pega em: console.groq.com > API Keys

# 📱 WhatsApp
WHATSAPP_TARGET_PHONE="+5511999999999"
# 📞 Seu número no formato internacional (+55XX...)

# 🌐 URL da aplicação (muda depois do deploy)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 🔍 Verificação M1

- [ ] `npm run dev` roda sem erros
- [ ] `http://localhost:3000` abre a página Next.js padrão
- [ ] `npx prisma db push` executa sem erros (cria as tabelas)

---

## 📰 M2 — Scraping + IA (1h) — 🤖 Maestro faz

> **O que vamos fazer:** Código que busca notícias dos sites e manda pra IA resumir

---

### 2.1 Criar `src/lib/scraper.ts`

**💡 Estratégia de scraping:**
- RSS feed primeiro (estruturado, estável)
- Se não tiver RSS, usa Cheerio pra extrair do HTML
- Se ambos falharem, tenta JSON-LD (dados estruturados que os sites usam pra Google)
- **Ordem de prioridade:** JSON-LD > meta tags > HTML > CSS classes

```typescript
// src/lib/scraper.ts
// Funções para buscar notícias de sites

import axios from 'axios';
import * as cheerio from 'cheerio';

// 🎯 Interface do que é uma "notícia" no nosso sistema
export interface Article {
  url: string;
  title: string;
  body: string;
  publishedAt?: Date;
}

// 🎯 Resultado do scraping de um site
export interface ScrapeResult {
  siteId: string;
  articles: Article[];
  error?: string;
}

// 🕷️ Scraper para sites baseados em RSS
// RSS = XML padronizado que sites usam pra distribuir conteúdo
// Vantagem: estrutura SEMPRE igual, independente do layout do site
export async function scrapeRSS(rssUrl: string, siteId: string): Promise<Article[]> {
  console.log(`📡 Scraping RSS: ${rssUrl}`);
  
  // 1️⃣ Buscar o feed RSS
  const response = await axios.get(rssUrl, {
    timeout: 10000,          // 10s timeout — se demorar, desiste
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
      // User-Agent = "quem está visitando". Alguns sites bloqueiam bots sem identificação
    }
  });

  // 2️⃣ Extrair items do XML
  // RSS tem formato padronizado: <rss><channel><item><title>...</title>
  const xml = response.data;
  const articles: Article[] = [];
  
  // Expressão regular pra encontrar items (sem precisar parser XML complexo)
  // Funciona pra 99% dos feeds RSS
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    
    const getField = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    
    const title = getField('title');
    const link = getField('link');
    const description = getField('description');
    const pubDate = getField('pubDate');
    
    if (title && link) {
      articles.push({
        url: link,
        title: stripHtml(title),
        body: stripHtml(description),
        publishedAt: pubDate ? new Date(pubDate) : undefined,
      });
    }
  }
  
  console.log(`  -> Encontrados ${articles.length} artigos`);
  return articles;
}

// 🕷️ Scraper para HTML (fallback quando não tem RSS)
// Usa Cheerio = jQuery rodando no servidor
export async function scrapeHTML(url: string, linkSelector: string, articleSelector: string): Promise<Article[]> {
  console.log(`🌐 Scraping HTML: ${url}`);
  
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const $ = cheerio.load(response.data);
  const articles: Article[] = [];
  
  // Encontrar links dos artigos
  $(linkSelector).each((_, el) => {
    const link = $(el).attr('href');
    const title = $(el).text().trim();
    
    if (link && title) {
      const fullUrl = link.startsWith('http') ? link : new URL(link, url).href;
      articles.push({ url: fullUrl, title, body: '', publishedAt: undefined });
    }
  });
  
  console.log(`  -> Encontrados ${articles.length} links`);
  
  // Abrir cada artigo e extrair o texto
  const MAX_ARTICLES = 10;
  const articlePromises = articles.slice(0, MAX_ARTICLES).map(async (article) => {
    try {
      const body = await scrapeArticleBody(article.url, articleSelector);
      return { ...article, body };
    } catch {
      return null;
    }
  });
  
  const results = await Promise.all(articlePromises);
  return results.filter((a): a is Article => a !== null && a.body.length > 100);
}

// Extrair o corpo de um artigo individual
async function scrapeArticleBody(url: string, selector: string): Promise<string> {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const $ = cheerio.load(response.data);
  
  // Tenta JSON-LD (dados estruturados)
  const jsonLd = $('script[type="application/ld+json"]').text();
  if (jsonLd) {
    try {
      const parsed = JSON.parse(jsonLd);
      const body = parsed.articleBody || parsed.description || '';
      if (body.length > 200) return cleanText(body);
    } catch {}
  }
  
  // Tenta meta tags
  const metaDesc = $('meta[property="og:description"]').attr('content');
  if (metaDesc && metaDesc.length > 100) return cleanText(metaDesc);
  
  // Fallback: seletor CSS
  const text = $(selector).text();
  if (text.length > 100) return cleanText(text);
  
  return cleanText($('body').text());
}

// 🧹 Limpar texto
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 🏭 Função principal que coordena o scraping
export async function scrapeAllSites(
  sites: Array<{ id: string; name: string; rssUrl?: string; url: string; selector?: string; type: string }>
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  for (const site of sites) {
    try {
      let articles: Article[] = [];
      
      if (site.rssUrl) {
        articles = await scrapeRSS(site.rssUrl, site.id);
      }
      
      if (articles.length === 0 && site.selector) {
        articles = await scrapeHTML(site.url, site.selector, site.selector.replace('a.', ''));
      }
      
      results.push({ siteId: site.id, articles });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre sites
    } catch (error) {
      console.error(`Erro scraping ${site.name}:`, error);
      results.push({ siteId: site.id, articles: [], error: String(error) });
    }
  }
  
  return results;
}
```

---

### 2.2 Criar `src/lib/summarizer.ts`

```typescript
// src/lib/summarizer.ts
// Resumo de artigos usando Groq API (Llama 3.3 70B — grátis!)

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface SummaryResult {
  articleId: string;
  summary: string;
  tokensUsed: number;
}

export async function summarizeArticle(
  title: string,
  body: string,
  url: string,
  articleId: string
): Promise<SummaryResult> {
  
  // 💡 Prompt em português — a IA responde no mesmo idioma
  const prompt = `Você é um jornalista especializado em resumir notícias.

Resuma o artigo abaixo em português brasileiro em exatamente 2 parágrafos:

REGRAS:
- Primeiro parágrafo: o fato principal (o que aconteceu, quem, quando)
- Segundo parágrafo: contexto e implicações (por que é importante)
- Tom neutro e objetivo
- Máximo de 150 palavras no total
- Não use frases como "o artigo diz" ou "segundo o texto"
- Apenas o resumo, sem introdução

TÍTULO: ${title}

TEXTO:
${body.substring(0, 3000)}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.3,  // Baixo = mais objetivo
  });

  const summary = completion.choices[0]?.message?.content || '';
  const tokensUsed = completion.usage?.total_tokens || 0;

  return { articleId, summary, tokensUsed };
}

export async function summarizeArticles(
  articles: Array<{ id: string; title: string; body: string; url: string }>
): Promise<SummaryResult[]> {
  return Promise.all(
    articles.map(a => summarizeArticle(a.title, a.body, a.url, a.id))
  );
}
```

---

### 2.3 Criar seed do banco

**Arquivo: `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco com sites iniciais...');
  
  const sites = [
    {
      id: 'g1',
      name: 'G1 Globo',
      url: 'https://g1.globo.com',
      type: 'rss',
      rssUrl: 'https://g1.globo.com/rss/g1/',
      enabled: true,
    },
    {
      id: 'uol',
      name: 'UOL Notícias',
      url: 'https://noticias.uol.com.br',
      type: 'rss',
      rssUrl: 'https://rss.uol.com.br/feed/noticias.xml',
      enabled: true,
    },
  ];
  
  for (const site of sites) {
    await prisma.crawledSite.upsert({
      where: { id: site.id },
      update: site,
      create: site,
    });
    console.log(`  ✅ ${site.name}`);
  }
  
  // Config padrão
  const configs = [
    { key: 'schedule_enabled', value: 'true' },
    { key: 'schedule_times', value: '["08:00","12:00","18:00"]' },
    { key: 'schedule_days', value: '["mon","tue","wed","thu","fri","sat","sun"]' },
    { key: 'whatsapp_target', value: process.env.WHATSAPP_TARGET_PHONE || '' },
  ];
  
  for (const cfg of configs) {
    await prisma.appConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }
  
  console.log('✅ Seed completo!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### 🔍 Verificação M2

- [ ] Executar `npx tsx prisma/seed.ts` popula o banco
- [ ] Código de scraping roda sem erros

---

## 📱 M3 — WhatsApp (45 min) — 🤖 Maestro faz

> **O que vamos fazer:** Conectar ao WhatsApp Web e enviar mensagens

---

### 3.1 Criar `src/lib/whatsapp.ts`

```typescript
// src/lib/whatsapp.ts
// Integração com WhatsApp Web via whatsapp-web.js
// Ele ABRE o Chrome (Puppeteer), mostra QR code, e você escaneia com o celular

import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

let client: Client | null = null;
let isReady = false;
let lastQR: string | null = null;

export async function getWhatsAppClient(): Promise<Client> {
  if (client && isReady) return client;
  
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
      ],
    },
  });
  
  client.on('qr', (qr: string) => {
    lastQR = qr;
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie o QR Code acima com o WhatsApp do seu celular');
    console.log('📱 Vá em: WhatsApp > Menu > WhatsApp Web > Escanear');
  });
  
  client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp conectado!');
  });
  
  client.on('disconnected', (reason) => {
    isReady = false;
    console.log(`❌ WhatsApp desconectado: ${reason}`);
    client = null;
  });
  
  await client.initialize();
  return client;
}

export async function sendWhatsAppMessage(
  to: string, 
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const waClient = await getWhatsAppClient();
    const formattedNumber = `${to}@c.us`;  // @c.us = contato individual
    await waClient.sendMessage(formattedNumber, message);
    console.log(`✅ Mensagem enviada para ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    return { success: false, error: String(error) };
  }
}

// 🎨 Formatar mensagem bonitinha
export function formatNewsMessage(
  articles: Array<{ title: string; summary: string; url: string; source: string }>
): string {
  let message = '📰 *RESUMO DE NOTÍCIAS*\n';
  message += `📅 ${new Date().toLocaleDateString('pt-BR')}\n`;
  message += '─────────────────────\n\n';
  
  articles.forEach((article, index) => {
    message += `${index + 1}. *${article.title}*\n`;
    message += `📰 ${article.source}\n`;
    message += `📝 ${article.summary}\n`;
    message += `🔗 ${article.url}\n\n`;
  });
  
  message += '─────────────────────\n';
  message += '🤖 _Enviado pelo NewsBot_';
  
  return message;
}

export function getLastQR(): string | null {
  return lastQR;
}
```

---

### 🔍 Verificação M3

- [ ] Script roda e mostra QR code no terminal
- [ ] Escaneia com celular
- [ ] Mensagem de teste enviada com sucesso

---

## ⚡ M4 — Pipeline GitHub Actions (30 min) — 🤖 Maestro faz

> **O que vamos fazer:** Automatizar tudo nos 3 horários do dia

---

### 4.1 Pipeline principal

**`.github/workflows/daily-news.yml`**

```yaml
name: Daily News Pipeline

on:
  schedule:
    - cron: '0 11 * * *'    # 08:00 BRT
    - cron: '0 15 * * *'    # 12:00 BRT
    - cron: '0 21 * * *'    # 18:00 BRT
  workflow_dispatch:          # Botão manual

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
  WHATSAPP_TARGET_PHONE: ${{ secrets.WHATSAPP_TARGET_PHONE }}

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npx prisma generate
      
      - name: Run pipeline
        run: npx tsx scripts/run-pipeline.ts
        continue-on-error: true
      
      # Salva sessão WhatsApp pra não precisar re-escanear
      - name: Save WhatsApp session
        run: |
          if [ -d ".wwebjs_auth" ]; then
            git config user.name "News Bot"
            git config user.email "bot@news-scrapper"
            git add .wwebjs_auth/
            git commit -m "🤖 Atualiza sessão WhatsApp [skip ci]" || true
            git push
          fi
```

**💡 Por que GitHub Actions e não cron do Vercel?**
- Vercel Cron: timeout de 60s, não roda Chrome
- GitHub Actions: timeout de 6h, roda Chrome (essencial pro WhatsApp)
- 3 notícias/dia = ~1 minuto de execução = ~30 min/mês (de 2000 disponíveis)

---

### 4.2 Script principal da pipeline

**`scripts/run-pipeline.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import { scrapeAllSites } from '../src/lib/scraper';
import { summarizeArticles } from '../src/lib/summarizer';
import { sendWhatsAppMessage, formatNewsMessage } from '../src/lib/whatsapp';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando pipeline...');
  
  // PASSO 1: Buscar sites habilitados
  const sites = await prisma.crawledSite.findMany({ where: { enabled: true } });
  if (sites.length === 0) { console.log('Nenhum site habilitado'); return; }
  
  // PASSO 2: Scrapar
  const results = await scrapeAllSites(sites);
  
  // PASSO 3: Salvar artigos novos (dedup por URL)
  const newArticles: Array<{ id: string; title: string; body: string; url: string; siteId: string }> = [];
  
  for (const result of results) {
    for (const article of result.articles) {
      const existing = await prisma.article.findUnique({ where: { url: article.url } });
      if (!existing) {
        const saved = await prisma.article.create({
          data: {
            siteId: result.siteId,
            url: article.url,
            title: article.title,
            body: article.body,
            bodyHash: simpleHash(article.body),
            publishedAt: article.publishedAt,
            status: 'fetched',
          }
        });
        newArticles.push(saved);
      }
    }
  }
  
  if (newArticles.length === 0) { console.log('Nenhum artigo novo'); return; }
  
  // PASSO 4: Resumir com IA
  console.log('🤖 Resumindo artigos...');
  const summaries = await summarizeArticles(newArticles);
  
  for (const s of summaries) {
    await prisma.summary.create({
      data: { articleId: s.articleId, summary: s.summary, model: 'llama-3.3-70b-versatile', tokensUsed: s.tokensUsed }
    });
    await prisma.article.update({ where: { id: s.articleId }, data: { status: 'summarized' } });
  }
  
  // PASSO 5: Enviar WhatsApp
  console.log('📱 Enviando WhatsApp...');
  const target = process.env.WHATSAPP_TARGET_PHONE;
  if (!target) { console.log('Telefone não configurado'); return; }
  
  const messageData = summaries.map(s => {
    const a = newArticles.find(n => n.id === s.articleId)!;
    const site = sites.find(s => s.id === a.siteId);
    return { title: a.title, summary: s.summary, url: a.url, source: site?.name || '' };
  });
  
  const message = formatNewsMessage(messageData);
  const result = await sendWhatsAppMessage(target, message);
  
  // Log
  for (const s of summaries) {
    await prisma.sendLog.create({
      data: { articleId: s.articleId, summaryId: s.articleId, recipient: target, status: result.success ? 'sent' : 'failed', errorMessage: result.error }
    });
    await prisma.article.update({ where: { id: s.articleId }, data: { status: result.success ? 'sent' : 'error' } });
  }
  
  console.log(result.success ? '✅ Pipeline concluído!' : '❌ Falha no envio');
}

function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(16);
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## 🎨 M5 — Dashboard Frontend (2h) — 🤖 Maestro faz

> **O que vamos fazer:** Interface web com 5 páginas

---

### 5.1 Páginas do Dashboard

| Rota | Página | Funcionalidade |
|------|--------|---------------|
| `/` | Dashboard | Stats cards, status do bot, últimos artigos |
| `/fontes` | Fontes | CRUD de sites, toggle ativar/desativar |
| `/agendamento` | Agendamento | Horários, dias da semana, fuso |
| `/historico` | Histórico | Artigos scrappados com status de envio |
| `/configuracoes` | Config | WhatsApp, tema, idioma |

Todas as páginas usam:
- ✅ shadcn/ui (Card, Button, Switch, Select, Table)
- ✅ Tailwind para layout responsivo
- ✅ next-themes para dark/light mode
- ✅ lucide-react para ícones
- ✅ Tudo em português (pt-BR)

---

## 🔌 M6 — API Routes (1h) — 🤖 Maestro faz

> **O que vamos fazer:** Conectar o frontend com o banco

### 6.1 Rotas da API

| Método | Rota | Função |
|--------|------|--------|
| GET | `/api/sites` | Listar fontes |
| POST | `/api/sites` | Criar fonte |
| PUT | `/api/sites/[id]` | Atualizar fonte |
| DELETE | `/api/sites/[id]` | Deletar fonte |
| GET | `/api/config` | Listar configurações |
| PUT | `/api/config` | Atualizar configurações |
| GET | `/api/articles` | Histórico com filtros |
| GET | `/api/stats` | Estatísticas do dashboard |
| POST | `/api/pipeline` | Gatilho manual |

---

## ✅ M7 — Quality Gate (30 min)

| Passo | Comando | O que verifica |
|-------|---------|---------------|
| 1 | `npx tsc --noEmit` | Erros de tipo TypeScript |
| 2 | `npm run lint` | Erros de código |
| 3 | `npm run build` | Se compila pra produção |
| 4 | Teste manual | Fluxo completo: scrape -> IA -> WhatsApp |

---

## 🚀 Deploy — O que VOCÊ precisa fazer

### D1: Enviar pro GitHub

Depois que eu criar tudo, você vai:

```bash
# 1. Criar repositório no GitHub (pelo site)
# 2. Rodar:
git init
git add .
git commit -m "🎉 Initial commit: News Scraper + WhatsApp Bot"
git branch -M main
git remote add origin https://github.com/[SEU_USUARIO]/news-scrapper.git
git push -u origin main
```

### D2: Configurar Secrets no GitHub

Vá em **Settings > Secrets and variables > Actions** e adicione:

```env
DATABASE_URL=postgresql://postgres:[SENHA]@db.[ID].supabase.co:6543/postgres
GROQ_API_KEY=gsk_[SUA_CHAVE]
WHATSAPP_TARGET_PHONE=5511999999999
```

### D3: Deploy no Vercel

Vá em [vercel.com/new](https://vercel.com/new), importe o repositório, adicione as mesmas env vars, e clique **Deploy**.

### D4: Autenticar WhatsApp 🔥

1. Vá no GitHub > Actions > Daily News Pipeline
2. Clique "Run workflow"
3. Nos logs, aparece o QR Code
4. Abra WhatsApp > Menu > WhatsApp Web
5. Escaneie
6. **Pronto!** Agora o bot vai enviar notícias todo dia 📰

---

## 📊 Conceitos que Você Vai Aprender

| Conceito | Aplicação no Projeto |
|----------|---------------------|
| **Next.js App Router** | Rotas baseadas em pastas (`/fontes`, `/api/sites`) |
| **Server Components** | Componentes que rodam no servidor (mais rápidos) |
| **API Routes** | Backend dentro do Next.js |
| **Prisma ORM** | TypeScript que vira SQL automaticamente |
| **Supabase** | PostgreSQL grátis na nuvem |
| **Cheerio** | "jQuery do servidor" pra extrair dados de HTML |
| **Groq API** | IA gratuita mais rápida do mercado |
| **Prompt Engineering** | Como escrever prompts que funcionam |
| **whatsapp-web.js** | WhatsApp Web automatizado |
| **GitHub Actions** | CI/CD + cron grátis |
| **shadcn/ui** | Componentes copiáveis (vc tem o código) |

---

## 🔥 Próximo Passo

**Tudo pronto para começar a Build.** Assim que você aprovar:

1. Vou executar **M1** (Setup) — inicializar o projeto
2. Depois **M2 + M5 em paralelo** (backend + frontend)
3. Depois **M3** (WhatsApp)
4. Depois **M4** (GitHub Actions)
5. Depois **M6** (API Routes)
6. Finalizar com **M7** (Quality Gate)

> **PODE COMEÇAR?** 🔥
