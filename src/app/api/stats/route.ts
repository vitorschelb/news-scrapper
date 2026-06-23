// ============================================================
// GET /api/stats — Estatísticas do dashboard
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalSites,
      activeSites,
      totalArticles,
      totalSummaries,
      totalSent,
      totalFailed,
    ] = await Promise.all([
      prisma.crawledSite.count(),
      prisma.crawledSite.count({ where: { isActive: true } }),
      prisma.article.count(),
      prisma.summary.count(),
      prisma.sendLog.count({ where: { status: "sent" } }),
      prisma.sendLog.count({ where: { status: "failed" } }),
    ]);

    // Última execução
    const lastSend = await prisma.sendLog.findFirst({
      orderBy: { sentAt: "desc" },
      select: { sentAt: true },
    });

    return NextResponse.json({
      totalSites,
      activeSites,
      totalArticles,
      totalSummaries,
      totalSent,
      totalFailed,
      lastExecution: lastSend?.sentAt || null,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Erro ao buscar stats" }, { status: 500 });
  }
}
