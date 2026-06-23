// ============================================================
// PATCH /api/sites/[id] — Atualiza fonte
// DELETE /api/sites/[id] — Remove fonte
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const site = await prisma.crawledSite.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(site);
  } catch (err) {
    console.error(`PATCH /api/sites/${params.id} error:`, err);
    return NextResponse.json({ error: "Erro ao atualizar fonte" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.crawledSite.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/sites/${params.id} error:`, err);
    return NextResponse.json({ error: "Erro ao remover fonte" }, { status: 500 });
  }
}
