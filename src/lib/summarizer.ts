// ============================================================
// Summarizer — Resumo de artigos com IA (Groq)
// ============================================================
// Por que: Converter artigos longos em resumos de ~80 palavras
// em português, no tom dev. Usamos a API gratuita da Groq
// (Llama 3.3 70B) que dá 100K tokens/dia sem precisar de
// cartão de crédito.
//
// Custo estimado: ~600 tokens por artigo * 3 artigos/dia
// = ~1800 tokens/dia de 100K disponíveis = 1,8% de uso.
// ============================================================

import Groq from "groq-sdk";
import { prisma } from "./prisma";

// Inicializa cliente Groq
// Por que: A chave vem da env var GROQ_API_KEY. Em produção
// (Vercel/GitHub Actions), configuramos como secret.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Modelo usado — Llama 3.3 70B é gratuito via Groq
const MODEL = "llama-3.3-70b-versatile";

// Prompt em português para gerar resumos no tom "dev brasileiro"
const SYSTEM_PROMPT = `Você é um curador de notícias de tecnologia. Resuma o artigo abaixo em português brasileiro em aproximadamente 80 palavras. Use tom direto e informal, como um dev falando com outro dev. Destaque o que é relevante para quem trabalha com tecnologia. Inclua o que foi anunciado, por que importa, e uma opinião breve. Não use saudações nem introduções como "Neste artigo". Vá direto ao ponto. Termine com 2-3 hashtags relevantes.`;

export interface SummaryResult {
  content: string;
  tokensUsed: number;
}

// Gera resumo de um artigo
export async function summarizeArticle(
  title: string,
  content: string
): Promise<SummaryResult> {
  // Por que: Mandamos título + conteúdo para a IA. Se o
  // conteúdo for muito longo (>4000 chars), truncamos para
  // economizar tokens (o resumo é só do começo do artigo).
  const truncatedContent = content
    ? content.slice(0, 4000)
    : "(conteúdo não disponível)";

  const userPrompt = `Título: ${title}\n\nConteúdo:\n${truncatedContent}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      model: MODEL,
      temperature: 0.3, // Baixa temperatura = mais consistente
      max_tokens: 300,  // 300 tokens ~= 200-225 palavras
    });

    const content = completion.choices[0]?.message?.content || "";
    // Uso de tokens: somamos prompt + completion
    const tokensUsed =
      (completion.usage?.prompt_tokens ?? 0) +
      (completion.usage?.completion_tokens ?? 0);

    return { content, tokensUsed };
  } catch (err) {
    console.error("❌ Erro ao chamar Groq API:", err);
    // Fallback: se a API falhar, retorna mensagem amigável
    return {
      content: `📰 *${title}*\n\nResumo temporariamente indisponível. Leia o artigo original.`,
      tokensUsed: 0,
    };
  }
}

// Processa artigos não resumidos e salva resumos no banco
export async function summarizePendingArticles(): Promise<number> {
  // Por que: Busca artigos que ainda não têm summary (sem resumo)
  const articles = await prisma.article.findMany({
    where: { summary: null },
    take: 10, // Limite de segurança por execução
    orderBy: { createdAt: "desc" },
  });

  if (articles.length === 0) {
    console.log("📭 Nenhum artigo pendente de resumo.");
    return 0;
  }

  let count = 0;
  for (const article of articles) {
    console.log(`🤖 Resumindo: ${article.title.slice(0, 60)}...`);
    const result = await summarizeArticle(article.title, article.content || "");

    await prisma.summary.create({
      data: {
        articleId: article.id,
        model: MODEL,
        content: result.content,
        tokensUsed: result.tokensUsed,
      },
    });
    count++;

    // Pequena pausa entre chamadas para evitar rate limit
    if (articles.length > 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return count;
}
