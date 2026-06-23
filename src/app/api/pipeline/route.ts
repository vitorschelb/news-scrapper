// ============================================================
// POST /api/pipeline — Dispara pipeline manualmente
// ============================================================
// Por que: Útil para teste durante desenvolvimento.
// Em produção, quem chama é o GitHub Actions 3x/dia.
// ============================================================

import { NextResponse } from "next/server";
import { scrapeAllSites, saveNewArticles } from "@/lib/scraper";
import { summarizePendingArticles } from "@/lib/summarizer";

export async function POST() {
  // Por que: Pipeline só pode ser executada em ambiente
  // com as variáveis de ambiente configuradas
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY não configurada. Pipeline disponível apenas em produção." },
      { status: 400 }
    );
  }

  try {
    console.log("🚀 Pipeline manual iniciada");

    // Etapa 1: Scraping
    const articles = await scrapeAllSites();
    const saved = await saveNewArticles(articles);

    // Etapa 2: Resumo
    const summarized = await summarizePendingArticles();

    return NextResponse.json({
      success: true,
      stats: {
        articlesFound: articles.length,
        articlesSaved: saved,
        summariesGenerated: summarized,
      },
    });
  } catch (err) {
    console.error("POST /api/pipeline error:", err);
    return NextResponse.json(
      { error: "Erro na pipeline. Verifique os logs do servidor." },
      { status: 500 }
    );
  }
}
