// ============================================================
// Scraper — Extrai artigos de fontes RSS/HTML
// ============================================================
// Por que: Precisamos buscar notícias das fontes configuradas
// (TLDR AI, Hugging Face) e extrair título + conteúdo bruto
// para depois resumir com IA.
//
// Estratégia: Tenta RSS primeiro (mais estruturado), se falhar
// ou se a fonte for tipo "html", usa Cheerio pra parsear a página.
// ============================================================

import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "./prisma";

// Interface do resultado do scraper
export interface ScrapedArticle {
  siteId: string;
  siteName: string;
  title: string;
  url: string;
  content: string; // texto limpo sem HTML
  publishedAt?: Date;
}

// Extrai texto de conteúdo HTML (tags básicas)
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ") // remove tags HTML
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ") // entidades numéricas
    .replace(/\s+/g, " ")     // normaliza espaços
    .trim();
}

// --- Parser de RSS (formato XML padrão) ---
async function parseRss(feedUrl: string): Promise<ScrapedArticle[]> {
  // Por que: RSS é o formato mais comum para feeds de notícias.
  // TLDR AI e Hugging Face Blog ambos oferecem RSS.

  const { data } = await axios.get(feedUrl, {
    timeout: 15000,
    headers: { "User-Agent": "NewsScrapper/1.0" },
  });

  const $ = cheerio.load(data, { xmlMode: true });
  const articles: ScrapedArticle[] = [];

  // RSS pode usar <item> (RSS 2.0) ou <entry> (Atom)
  // Aqui suportamos ambos:
  const items = $("item").length > 0 ? $("item") : $("entry");

  items.each((_, el) => {
    const $el = $(el);

    // Tenta extrair título de <title> (RSS/Atom)
    const title =
      $el.find("title").first().text() ||
      $el.find("title\\[type=html\\]").first().text() ||
      "";

    // Link: pode ser <link> (RSS com texto) ou <link href="..."> (Atom)
    let url =
      $el.find("link").first().text() ||
      $el.find("link").first().attr("href") ||
      "";

    // Descrição/conteúdo
    const description =
      $el.find("description").first().text() ||
      $el.find("content\\:encoded").first().text() ||
      $el.find("content").first().text() ||
      "";

    // Data de publicação
    const pubDateStr =
      $el.find("pubDate").first().text() ||
      $el.find("published").first().text() ||
      $el.find("updated").first().text();

    const publishedAt = pubDateStr ? new Date(pubDateStr) : undefined;

    if (title && url) {
      articles.push({
        siteId: "",
        siteName: "",
        title: stripHtml(title),
        url: url.trim(),
        content: stripHtml(description),
        publishedAt,
      });
    }
  });

  return articles;
}

// --- Parser de HTML genérico (fallback) ---
async function parseHtml(
  url: string,
  selector: string
): Promise<ScrapedArticle[]> {
  // Por que: Nem todo site tem RSS. Para esses casos, fazemos
  // scrape da página HTML usando um seletor CSS que captura
  // os cards/links de artigos.

  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: { "User-Agent": "NewsScrapper/1.0" },
  });

  const $ = cheerio.load(data);
  const articles: ScrapedArticle[] = [];

  // Usa o seletor configurado (ex: "article h2 a", ".post-title")
  $(selector).each((_, el) => {
    const $el = $(el);
    const title = $el.text().trim();
    const link = $el.attr("href") || "";

    // Se for link relativo, completa com a URL base
    const fullUrl = link.startsWith("http")
      ? link
      : new URL(link, url).href;

    if (title) {
      articles.push({
        siteId: "",
        siteName: "",
        title: stripHtml(title),
        url: fullUrl,
        content: "",
        publishedAt: undefined,
      });
    }
  });

  return articles;
}

// --- Função principal ---
// Por que: Orquestra o scraping de todas as fontes ativas.
// Retorna artigos novos (não duplicados) para cada fonte.
export async function scrapeAllSites(): Promise<ScrapedArticle[]> {
  const sites = await prisma.crawledSite.findMany({
    where: { isActive: true },
  });

  if (sites.length === 0) {
    console.warn("⚠️  Nenhuma fonte ativa encontrada.");
    return [];
  }

  const allArticles: ScrapedArticle[] = [];

  for (const site of sites) {
    console.log(`🔍 Scrapeando: ${site.name} (${site.type})`);

    try {
      let articles: ScrapedArticle[] = [];

      if (site.type === "rss" && site.feedUrl) {
        articles = await parseRss(site.feedUrl);
      } else if (site.type === "html" && site.selector) {
        articles = await parseHtml(site.url, site.selector);
      } else {
        console.warn(`  ⚠️  Config inválida para ${site.name}`);
        continue;
      }

      // Atribui siteId e siteName
      for (const a of articles) {
        a.siteId = site.id;
        a.siteName = site.name;
      }

      allArticles.push(...articles);
      console.log(`  ✅ ${articles.length} artigos encontrados`);
    } catch (err) {
      console.error(`  ❌ Erro ao scrapear ${site.name}:`, err);
    }
  }

  return allArticles;
}

// Salva artigos novos no banco (ignora duplicados por URL)
export async function saveNewArticles(
  articles: ScrapedArticle[]
): Promise<number> {
  let savedCount = 0;

  for (const article of articles) {
    try {
      await prisma.article.create({
        data: {
          siteId: article.siteId,
          title: article.title,
          url: article.url,
          content: article.content || null,
          publishedAt: article.publishedAt || null,
        },
      });
      savedCount++;
    } catch (err: any) {
      // Erro P2002 = unique constraint violation (URL duplicada)
      // Ignora silenciosamente — já temos esse artigo
      if (err?.code === "P2002") {
        // URL duplicada, ignorar
      } else {
        console.error(`  ❌ Erro ao salvar: ${article.title}`, err);
      }
    }
  }

  return savedCount;
}
