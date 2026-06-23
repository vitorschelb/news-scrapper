// ============================================================
// GET /api/sites — Lista todas as fontes
// POST /api/sites — Cria nova fonte
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sites = await prisma.crawledSite.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json(sites);
  } catch (err) {
    console.error("GET /api/sites error:", err);
    return NextResponse.json({ error: "Erro ao buscar fontes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, feedUrl, type, selector } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "name e url são obrigatórios" },
        { status: 400 }
      );
    }

    const site = await prisma.crawledSite.create({
      data: {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        url,
        feedUrl: feedUrl || null,
        type: type || "rss",
        selector: selector || null,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma fonte com esse ID" }, { status: 409 });
    }
    console.error("POST /api/sites error:", err);
    return NextResponse.json({ error: "Erro ao criar fonte" }, { status: 500 });
  }
}
