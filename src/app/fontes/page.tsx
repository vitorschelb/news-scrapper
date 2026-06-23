// ============================================================
// Fontes — Gerenciamento de fontes de notícias
// ============================================================
// Por que: O usuário pode ver, adicionar, ativar/desativar
// e remover fontes. TLDR AI e Hugging Face já vêm pré-cadastradas.
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Rss, Code } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FontesPage() {
  const sites = await prisma.crawledSite.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fontes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as fontes de notícias que o NewsBot monitora.
        </p>
      </div>

      {/* Grid de fontes */}
      <div className="grid gap-4 md:grid-cols-2">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {site.url}
                  </CardDescription>
                </div>
                <Badge variant={site.isActive ? "success" : "secondary"}>
                  {site.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {site.type === "rss" ? (
                  <Rss className="h-4 w-4" />
                ) : (
                  <Code className="h-4 w-4" />
                )}
                <span>
                  Tipo: <strong>{site.type.toUpperCase()}</strong>
                </span>
                <span className="ml-auto">
                  {site._count.articles} artigos
                </span>
              </div>
              {site.feedUrl && (
                <a
                  href={site.feedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground block truncate"
                >
                  📡 {site.feedUrl}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como adicionar fontes?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Novas fontes são adicionadas via API ou diretamente no banco
            Supabase. Planejamos uma interface de cadastro em breve.
          </p>
          <p>
            Fontes do tipo <strong>RSS</strong> precisam de uma URL de feed.
            Fontes do tipo <strong>HTML</strong> precisam de um seletor CSS
            para encontrar os links dos artigos.
          </p>
          <p className="text-xs mt-4">
            💡 Dica: A maioria dos blogs de tecnologia tem RSS em
            <code className="bg-muted px-1 rounded"> /feed.xml</code> ou
            <code className="bg-muted px-1 rounded"> /rss</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
