// ============================================================
// GET /api/config — Retorna configuração global
// PATCH /api/config — Atualiza configuração
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json(config);
  } catch (err) {
    console.error("GET /api/config error:", err);
    return NextResponse.json({ error: "Erro ao buscar config" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const config = await prisma.appConfig.update({
      where: { id: "default" },
      data: body,
    });
    return NextResponse.json(config);
  } catch (err) {
    console.error("PATCH /api/config error:", err);
    return NextResponse.json({ error: "Erro ao atualizar config" }, { status: 500 });
  }
}
