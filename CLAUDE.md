# NewsBot Project Rules & Skills

This file defines the technology-specific rules and best practices for AI coding agents working on this project.

---

## React Component Best Practices

### Official Docs
- React: https://react.dev/learn
- React Compiler: https://react.dev/learn/react-compiler
- Composition patterns (Next.js): https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns

### Core Principles

#### 1. Composition over Configuration
Replace boolean-prop proliferation with explicit composed children:

```typescript
// ❌ Bad: boolean props explosion
<Card variant="elevated" showHeader showFooter showBadge badgeText="New" />

// ✅ Good: composition with children and slots
<Card>
  <CardHeader>
    <Badge>New</Badge>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### 2. Server Components by Default
- Every component starts as a Server Component (no `"use client"`)
- Add `"use client"` ONLY when you need:
  - Browser APIs (`localStorage`, `navigator`, etc.)
  - React hooks (`useState`, `useEffect`, `useContext`)
  - Event handlers (`onClick`, `onSubmit`, etc.)
  - Custom hooks that use any of the above

```typescript
// Server Component — async, directly accesses DB
export async function ArticleList() {
  const articles = await prisma.article.findMany();
  return <ul>{articles.map(a => <ArticleItem key={a.id} article={a} />)}</ul>;
}

// Client Component — needs interactivity
"use client";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Toggle</Button>;
}
```

#### 3. Extract Logic into Custom Hooks
Any repeated `useState` + `useEffect` pattern → custom hook:

```typescript
// Custom hook for data fetching
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

#### 4. Compound Components for Flexible APIs
Use `React.createContext` to share implicit state among related components:

```typescript
// Compound pattern: <Select> <Select.Item value="1">Option 1</Select.Item> </Select>
const SelectContext = createContext<{ value: string; onChange: (v: string) => void } | null>(null);

function Select({ children, value, onChange }: Props) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <select className="..." value={value} onChange={e => onChange(e.target.value)}>
        {children}
      </select>
    </SelectContext.Provider>
  );
}

Select.Item = function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
};
```

### Component File Organization

#### One component = one file (except small closely-related groups)
```
src/components/
  ui/           # Generic, reusable UI primitives (button, card, badge)
  layout/       # Layout components (sidebar, navbar, footer)
  features/     # Feature-specific components (article-list, summary-card)
```

#### File structure for each component:
```typescript
// 1. Imports (React, libraries, types)
// 2. Types/Interfaces (Props)
// 3. Component function (with JSDoc comment)
// 4. displayName
// 5. Default export

interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
  children: React.ReactNode;
}

/**
 * Primary UI button with multiple variants.
 * Uses cva() for variant management.
 */
function Button({ variant = "default", children }: ButtonProps) {
  return <button className={buttonVariants({ variant })}>{children}</button>;
}
Button.displayName = "Button";
```

### Props Design Rules

1. **Boolean props = red flag.** If you have 3+ boolean props, you need composition instead
2. **Use `React.ReactNode` for children** — most flexible
3. **Use `ComponentPropsWithoutRef<'button'>`** to extend native HTML attributes
4. **Optional props = `?` in interface** — sensible defaults in destructuring
5. **Event handlers follow `on[Event]` naming**: `onClick`, `onChange`, `onSubmit`

```typescript
// ✅ Good props interface
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string; // optional
}

// ❌ Bad props interface (too many booleans)
interface CardProps {
  variant: "elevated" | "flat" | "outlined";
  showHeader: boolean;
  showFooter: boolean;
  showBadge: boolean;
  isHoverable: boolean;
  isClickable: boolean;
  isDraggable: boolean;
}
```

### Performance Rules

1. **`useMemo` and `useCallback` are LAST RESORT** — measure first, optimize second
2. **Move state DOWN** — the component closest to where state is used should own it
3. **Move state UP** — only when siblings need to share it (lift to nearest common ancestor)
4. **Server Components are free** — they add zero JS to the client bundle
5. **Suspense boundaries** for loading states, not ad-hoc `isLoading` checks

### Accessibility (a11y) Minimums

```typescript
// Every interactive element needs:
<button aria-label="Close dialog" onClick={onClose}>✕</button>

// Every form input needs a label:
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" />
<span id="email-hint">We'll never share your email.</span>

// Images need alt text:
<Image src="/logo.png" alt="NewsBot Logo" />

// Use semantic HTML: <nav>, <main>, <section>, <article>, <aside>
```

### State Management Rules

1. **Server state** (data from DB) → Prisma directly in Server Components
2. **URL state** (current page, search params) → `useSearchParams`, `useParams`
3. **Form state** → Server Actions with `useActionState` (React 19)
4. **Global UI state** (theme, sidebar) → React Context (no Redux needed)
5. **Never put server data in React state** — fetch fresh on each request instead

---

## Next.js 15 (App Router)

### Official Docs
- Bundled at `node_modules/next/dist/docs/` — always use these (version-matched)
- Online: https://nextjs.org/docs

### Server Components First
- All components are Server Components by default
- Add `"use client"` ONLY when you need: browser APIs, state, effects, event handlers
- Server Components can be `async` and fetch data directly from DB/API

### Data Fetching
- Use `async` components with direct Prisma calls for server data
- Use `fetch()` with `cache: "force-cache"` for static data, `"no-store"` for dynamic
- Server Actions for mutations (form submissions, button clicks)
- `force-dynamic` export on pages that need fresh data every request

### Routing
- File-based: `app/page.tsx` = `/`, `app/blog/[slug]/page.tsx` = `/blog/:slug`
- Layouts: `app/layout.tsx` wraps all children, persists across navigations
- Loading: `app/loading.tsx` shows during streaming
- Error: `app/error.tsx` catches errors in the segment

### Key Imports
```typescript
import { prisma } from "@/lib/prisma";   // DB access
import { cn } from "@/lib/utils";         // Tailwind class merging
import { Button } from "@/components/ui/button";
```

---

## Prisma ORM

### Official Docs
- https://www.prisma.io/docs
- Version 7 (TypeScript engine, no more Rust binary)

### Singleton Pattern (Required in Next.js)
```typescript
// src/lib/prisma.ts — prevents multiple clients in dev hot-reload
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Schema Conventions
- Use `cuid()` for IDs (sorted by creation time, good DB locality)
- Add `@@index` for every foreign key
- Use `@unique` for URLs and other natural keys
- Soft deletes: add `deletedAt DateTime?` field
- Always name relations explicitly: `author User @relation(fields: [authorId], references: [id])`

### Migration Workflow
- Dev: `bunx prisma migrate dev` (generates migration files)
- Production: `bunx prisma migrate deploy` (applies pending migrations)
- Prototyping: `bunx prisma db push` (no migration files, schema-only)
- Seed: `bun run db:seed`

### Query Patterns
```typescript
// Create with relation
await prisma.user.create({ data: { email, profile: { create: { bio } } } });

// Pagination
const articles = await prisma.article.findMany({ skip, take: 20, orderBy: { createdAt: "desc" } });

// Count
const total = await prisma.article.count({ where: { siteId } });
```

---

## Supabase (PostgreSQL)

### Official Docs
- https://supabase.com/docs
- Prisma integration: https://supabase.com/docs/guides/database/prisma

### Connection Setup
- Use **Transaction Pooler** (port 6543) for `DATABASE_URL` (Prisma Client)
- Use **Direct Connection** (port 5432) for `DIRECT_URL` (Prisma Migrate)
- Append `?pgbouncer=true&connect_timeout=15` to pooler URL

### Important Notes
- Supabase free tier: 500MB DB, 50k rows
- Project auto-pauses after 7 days of inactivity
- Keep-alive via GitHub Actions cron (already configured)
- Use `prisma` schema (not `public`) to avoid conflicts with Supabase API
- RLS (Row Level Security) not needed — Prisma is the sole data access layer

---

## GitHub Actions

### Official Docs
- https://docs.github.com/en/actions
- Workflow syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

### Our Pipeline
- File: `.github/workflows/daily-news.yml`
- Schedule: 3x/day BRT (08:00=11UTC, 12:00=15UTC, 18:00=21UTC)
- Manual trigger via `workflow_dispatch`

### Secrets (Set in GitHub > Settings > Secrets > Actions)
| Name | Description |
|------|-------------|
| `DATABASE_URL` | Supabase connection string (pooler, port 6543) |
| `GROQ_API_KEY` | Groq API key (starts with `gsk_`) |
| `WHATSAPP_NUMBER` | International format: `5511999999999` |

### Security Rules
- DO NOT pin actions to mutable tags like `@v1` — use full SHAs or `@v4`
- Always use `actions/checkout@v4` (not v3 or v2)
- Secrets are auto-masked in logs; never `echo $SECRET`
- Use `workflow_dispatch` for manual testing

### Caching
- Bun caching is fast enough without explicit cache steps
- `oven-sh/setup-bun@v2` handles Bun binary caching

---

## Vercel Deploy

### Official Docs
- https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs

### Our Setup
- Deploys ONLY the Next.js dashboard (API routes + pages)
- Pipeline runs in GitHub Actions, NOT Vercel
- Environment variable `DATABASE_URL` needed in Vercel dashboard

### Important Notes
- Vercel Hobby plan: 100h/month, 60s serverless function timeout
- Serverless functions may cold-start (typically < 1s with Prisma)
- `next.config.ts` should remain minimal — no custom config needed

---

## Cheerio (HTML Parsing)

### Official Docs
- https://cheerio.js.org/
- GitHub: https://github.com/cheeriojs/cheerio

### Usage Pattern
```javascript
import * as cheerio from "cheerio";
import axios from "axios";

const { data } = await axios.get(url, { timeout: 15000 });
const $ = cheerio.load(data);
$("selector").each((i, el) => {
  const text = $(el).text().trim();
  const href = $(el).attr("href");
});
```

### Best Practices
- Always set `User-Agent` header to avoid blocks
- Use `timeout` on all requests (15s default)
- Parse RSS with `{ xmlMode: true }` option
- Strip HTML tags from extracted content before storage
- Fallback: RSS first, HTML scraping second
- Rate limit: 1 request per source per pipeline run

---

## Groq API (AI)

### Official Docs
- API: https://console.groq.com/docs/api-reference
- Rate limits: https://console.groq.com/docs/rate-limits
- Node SDK: https://github.com/groq/groq-typescript

### Usage Pattern
```typescript
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt },
  ],
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  max_tokens: 300,
});
```

### Rate Limits (Free Tier)
| Model | RPM | TPM | TPD |
|-------|-----|-----|-----|
| llama-3.3-70b-versatile | 30 | 12K | 100K |

- Our use: ~1,800 tokens/day (1.8% of limit) — very safe
- Add 500ms delay between sequential calls to avoid 429 errors
- Usage is logged per-summary in `Summary.tokensUsed` field
- Always provide a fallback message if API call fails

---

## whatsapp-web.js (WhatsApp Automation)

### Official Docs
- GitHub: https://github.com/pedroslopez/whatsapp-web.js
- Docs: https://wwebjs.dev/

### Setup Pattern
```typescript
import { Client, LocalAuth } from "whatsapp-web.js";

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
```

### Important Notes
- NOT an official WhatsApp API — uses Web protocol (violates ToS in theory)
- Low volume (3 msg/day) keeps risk minimal
- Use secondary number if concerned
- **First run requires QR code scan** — see pipeline logs
- Session is saved to `.wwebjs_auth/` and committed between runs
- Puppeteer only works in GitHub Actions (Chrome pre-installed)

### Error Handling
- Always wrap in try/catch
- Destroy client in `finally` block
- Log auth failures and disconnections
- Retry is not implemented (low volume, failures are rare)

---

## Tailwind CSS + shadcn/ui

### Pattern
- Custom CSS variables in `globals.css` for theming (light/dark)
- `cn()` utility from `tailwind-merge` + `clsx` for class merging
- shadcn/ui components live in `src/components/ui/`
- Dark mode via `next-themes`, default is dark

### Adding New shadcn/ui Components
```bash
# shadcn components are hand-written in src/components/ui/
# They follow the pattern: forwardRef, cn(), cva() for variants
```

### Color Tokens
Use only CSS variable colors: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`

---

## Conventional Commits (Versionamento)

### Official Spec
- https://www.conventionalcommits.org/en/v1.0.0/

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | When to use |
|------|-------------|
| `feat` | New feature, component, page, or endpoint |
| `fix` | Bug fix, error correction |
| `refactor` | Code change without behavior change (renaming, restructuring) |
| `chore` | Dependencies, config files, build tooling |
| `docs` | Documentation only (README, AGENTS.md, CLAUDE.md) |
| `style` | Formatting, spacing, CSS/Tailwind changes (no logic change) |
| `test` | Adding or updating tests |
| `perf` | Performance optimization |
| `ci` | CI/CD workflow changes |

### Examples
```
feat(scraper): add HTML fallback parsing with Cheerio
fix(whatsapp): handle QR code timeout gracefully
refactor(api): extract pagination logic into reusable hook
chore(deps): upgrade Prisma to v7
docs(readme): update deployment checklist
style(card): adjust padding on mobile breakpoints
perf(images): add lazy loading to article thumbnails
ci(actions): pin checkout action to SHA
```

### Rules
- Use lowercase, no period at end
- Scope is optional but encouraged (`feat(api):`, `fix(scraper):`)
- Description is imperative mood: "add", "fix", "implement" — NOT "added", "fixed"
- Body wraps at 72 characters, explains WHAT and WHY (not HOW)

### Pull Request Template
Use the template at `.github/PULL_REQUEST_TEMPLATE.md` when creating PRs.
Group changes by category: features, UI/UX, technical improvements.
