// ============================================================
// Home — Dashboard principal
// ============================================================
// Por que: Visão geral do sistema: stats, últimas notícias,
// status das entregas.
// ============================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Globe, FileText, MessageSquare, Activity } from "lucide-react";

// Por que: Forçamos SSR para buscar dados do banco.
// Em produção (Vercel + Supabase), a conexão é rápida.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Busca dados em paralelo
  const [totalSites, totalArticles, totalSummaries, totalSent, recentSummaries] =
    await Promise.all([
      prisma.crawledSite.count({ where: { isActive: true } }),
      prisma.article.count(),
      prisma.summary.count(),
      prisma.sendLog.count({ where: { status: "sent" } }),
      prisma.summary.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            include: { site: true },
          },
        },
      }),
    ]);

  const stats = [
    {
      title: "Fontes Ativas",
      value: totalSites,
      icon: Globe,
      description: "fontes configuradas",
    },
    {
      title: "Artigos Coletados",
      value: totalArticles,
      icon: FileText,
      description: "desde o início",
    },
    {
      title: "Resumos Gerados",
      value: totalSummaries,
      icon: Activity,
      description: "por IA (Groq)",
    },
    {
      title: "Mensagens Enviadas",
      value: totalSent,
      icon: MessageSquare,
      description: "via WhatsApp",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-muted-foreground mt-1">
          Resumo de notícias de tecnologia para devs, entregue no seu WhatsApp.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Últimos resumos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Resumos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSummaries.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              Nenhum resumo gerado ainda. A pipeline diária vai começar após o deploy.
            </p>
          ) : (
            <div className="space-y-4">
              {recentSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <a
                        href={summary.article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline line-clamp-1"
                      >
                        {summary.article.title}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {summary.content}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {summary.article.site.name}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pipeline</span>
            <Badge variant="success">Ativo</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horários</span>
            <span>08:00 • 12:00 • 18:00 BRT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modelo IA</span>
            <span>Llama 3.3 70B (Groq)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              R$ 0,00/mês
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
