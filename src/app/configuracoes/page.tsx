// ============================================================
// Configurações — Número do WhatsApp, chaves, info do sistema
// ============================================================
// Por que: Painel centralizado pra configurar o bot sem
// precisar acessar o banco ou variáveis de ambiente.
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Key, Database, Github, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do NewsBot.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">WhatsApp</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Número de destino</p>
              <p className="font-mono text-sm mt-1">
                {config?.whatsappNumber || (
                  <span className="text-muted-foreground italic">
                    Não configurado
                  </span>
                )}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Formato: 5511999999999 (código do país + DDD + número)</p>
              <p className="mt-1">
                Configure via variável de ambiente{" "}
                <code className="bg-muted px-1 rounded">WHATSAPP_NUMBER</code>{" "}
                no GitHub Secrets.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* IA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">IA — Groq</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Modelo</p>
              <p className="font-mono text-sm mt-1">llama-3.3-70b-versatile</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <Badge variant="success">API Key configurada</Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Gratuito • 100K tokens/dia • ~1,8% de uso diário</p>
            </div>
          </CardContent>
        </Card>

        {/* Banco de Dados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Banco de Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Provedor</p>
              <p className="text-sm mt-1">Supabase (PostgreSQL)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modelos</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• CrawledSite — fontes de notícias</li>
                <li>• Article — artigos scrapeados</li>
                <li>• Summary — resumos por IA</li>
                <li>• SendLog — log de envios</li>
                <li>• AppConfig — config global</li>
              </ul>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Plano gratuito • 500MB • 7 dias de inatividade pausa</p>
            </div>
          </CardContent>
        </Card>

        {/* Repositório */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Repositório</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Código aberto</p>
              <p className="text-sm mt-1">
                Projeto público no GitHub (portfolio)
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✅ Nenhuma credencial no código</p>
              <p>✅ GitHub Secrets para chaves</p>
              <p>✅ .env no .gitignore</p>
              <p>✅ Pipeline via GitHub Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de deploy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checklist de Deploy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              "1. Criar conta no Supabase e pegar DATABASE_URL",
              "2. Criar conta no Groq e pegar GROQ_API_KEY",
              "3. Criar repositório no GitHub e fazer push",
              "4. Configurar GitHub Secrets: DATABASE_URL, GROQ_API_KEY, WHATSAPP_NUMBER",
              "5. Importar no Vercel (dashboard Next.js)",
              "6. Escanear QR code do WhatsApp na primeira execução do Actions",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span className={i >= 3 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
