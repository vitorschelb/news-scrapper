// ============================================================
// Agendamento — Configuração dos horários de entrega
// ============================================================
// Por que: O usuário pode personalizar os 3 horários diários
// de entrega. Padrão: 08h, 12h, 18h BRT.
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Sun, Moon, Coffee } from "lucide-react";

export const dynamic = "force-dynamic";

// Ícone pra cada horário
function getTimeIcon(hour: string) {
  const h = parseInt(hour.split(":")[0], 10);
  if (h < 12) return <Coffee className="h-4 w-4" />;
  if (h < 18) return <Sun className="h-4 w-4" />;
  return <Moon className="h-4 w-4" />;
}

function getTimeLabel(hour: string) {
  const h = parseInt(hour.split(":")[0], 10);
  if (h < 12) return "Matinal";
  if (h < 14) return "Almoço";
  if (h < 18) return "Tarde";
  return "Noturna";
}

export default async function AgendamentoPage() {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  const times: string[] = config?.deliveryTimes
    ? JSON.parse(config.deliveryTimes)
    : ["08:00", "12:00", "18:00"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamento</h1>
        <p className="text-muted-foreground mt-1">
          Configure os horários das entregas diárias de notícias.
        </p>
      </div>

      {/* Grid de horários */}
      <div className="grid gap-4 md:grid-cols-3">
        {times.map((time) => (
          <Card key={time}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {getTimeLabel(time)}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold mt-2">
                {time}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                {getTimeIcon(time)}
                {time === "08:00"
                  ? "Resumo da manhã — comece o dia informado"
                  : time === "12:00"
                  ? "Resumo do almoço — pausa para ler"
                  : "Resumo da noite — feche o dia atualizado"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {times.map((time, i) => (
                <div key={time} className="relative pl-10">
                  <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div>
                    <p className="font-medium">
                      Entrega {i + 1}: {time} BRT
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i === 0
                        ? "Scraping das fontes → Resumo IA → Envio WhatsApp"
                        : i === 1
                        ? "Scraping das fontes → Resumo IA → Envio WhatsApp"
                        : "Scraping das fontes → Resumo IA → Envio WhatsApp"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como alterar?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Os horários são configurados em duas camadas:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <strong>GitHub Actions</strong> — os cron expressions em
              <code className="bg-muted px-1 rounded"> .github/workflows/daily-news.yml</code>
            </li>
            <li>
              <strong>Dashboard</strong> — os horários exibidos aqui vêm do banco
              (em breve editável pela interface)
            </li>
          </ol>
          <p className="text-xs mt-4">
            💡 Ambos precisam estar sincronizados. Por enquanto, altere
            diretamente no YAML do workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
