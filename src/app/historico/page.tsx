// ============================================================
// Histórico — Log de entregas e artigos
// ============================================================
// Por que: Acompanhar o que foi enviado, quando, e status.
// Útil pra debug e pra ver o que chegou no WhatsApp.
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  // Últimos 20 envios
  const logs = await prisma.sendLog.findMany({
    take: 20,
    orderBy: { sentAt: "desc" },
    include: {
      summary: {
        include: {
          article: {
            include: { site: true },
          },
        },
      },
    },
  });

  // Stats dos envios
  const totalSent = await prisma.sendLog.count({ where: { status: "sent" } });
  const totalFailed = await prisma.sendLog.count({ where: { status: "failed" } });
  const totalArticles = await prisma.article.count();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o que já foi enviado para o seu WhatsApp.
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalSent}
            </div>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalFailed}
            </div>
            <p className="text-xs text-muted-foreground">Falhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{totalArticles}</div>
            <p className="text-xs text-muted-foreground">Artigos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de logs */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Envios</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              Nenhum envio realizado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5">
                    {log.status === "sent" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.summary.article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={log.status === "sent" ? "success" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {log.status === "sent" ? "Enviado" : "Falhou"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {log.summary.article.site.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.sentAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {log.errorMsg && (
                      <p className="text-xs text-red-500 mt-1">{log.errorMsg}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
