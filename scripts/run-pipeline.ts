#!/usr/bin/env tsx
// ============================================================
// Pipeline diário — Roda no GitHub Actions 3x/dia
// ============================================================
// Por que: Orquestra o fluxo completo:
//   1. Scrapear fontes → salvar artigos novos
//   2. Resumir artigos pendentes (Groq)
//   3. Enviar resumos via WhatsApp
//   4. Commit da sessão WhatsApp (pra próxima execução)
//
// Uso: npm run pipeline
// ============================================================

import { scrapeAllSites, saveNewArticles } from "../src/lib/scraper";
import { summarizePendingArticles } from "../src/lib/summarizer";
import { sendSummaries } from "../src/lib/whatsapp";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=".repeat(50));
  console.log("🚀 Iniciando pipeline de notícias");
  console.log(`📅 ${new Date().toLocaleString("pt-BR")}`);
  console.log("=".repeat(50));

  // --- Etapa 1: Scraping ---
  console.log("\n📡 ETAPA 1: Scraping das fontes");
  console.log("-".repeat(30));
  const articles = await scrapeAllSites();
  const saved = await saveNewArticles(articles);
  console.log(`\n📊 Total: ${articles.length} encontrados, ${saved} novos salvos`);

  // --- Etapa 2: Resumo ---
  console.log("\n🤖 ETAPA 2: Resumo com IA (Groq)");
  console.log("-".repeat(30));
  const summarized = await summarizePendingArticles();
  console.log(`\n📊 Total: ${summarized} artigos resumidos`);

  // --- Etapa 3: Envio WhatsApp ---
  console.log("\n📤 ETAPA 3: Envio via WhatsApp");
  console.log("-".repeat(30));
  const result = await sendSummaries();
  console.log(`\n📊 Enviados: ${result.sent} | Falhas: ${result.failed}`);

  // --- Resumo final ---
  console.log("\n" + "=".repeat(50));
  console.log("📋 RESUMO DA EXECUÇÃO");
  console.log("=".repeat(50));
  console.log(`  Artigos encontrados:    ${articles.length}`);
  console.log(`  Artigos novos salvos:   ${saved}`);
  console.log(`  Resumos gerados:        ${summarized}`);
  console.log(`  WhatsApp enviados:      ${result.sent}`);
  console.log(`  WhatsApp falhas:        ${result.failed}`);
  console.log("=".repeat(50));
}

main()
  .catch((err) => {
    console.error("\n💥 Pipeline falhou:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
