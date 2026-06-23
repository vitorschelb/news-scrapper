// ============================================================
// WhatsApp — Envio de mensagens via whatsapp-web.js
// ============================================================
// Por que: Enviar os resumos diretamente no WhatsApp do usuário.
// whatsapp-web.js é uma biblioteca não-oficial que automatiza
// o WhatsApp Web via Puppeteer. É grátis, mas requer QR code
// na primeira vez.
//
// ⚠️ Atenção: Isso viola os ToS do WhatsApp. Use número
// secundário se estiver preocupado. A 3 msg/dia o risco é baixo.
// ============================================================

import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { prisma } from "./prisma";

// Tempo máximo para aguardar QR code (ms)
const QR_TIMEOUT = 60_000; // 60s

// Inicializa cliente do WhatsApp
// Por que: LocalAuth salva a sessão em disco (.wwebjs_auth/)
// para não precisar escanear QR toda vez. Em pipeline CI,
// esse diretório é commitado/persistido entre execuções.
function createClient(): Client {
  return new Client({
    authStrategy: new LocalAuth({
      // Por que: Caminho customizado para a raiz do projeto
      dataPath: ".wwebjs_auth",
    }),
    puppeteer: {
      // Por que: Em GitHub Actions, Chrome roda sem interface
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    },
  });
}

// Aguarda QR code e exibe no terminal
// Por que: Na primeira execução, o usuário precisa escanear
// o QR code com o WhatsApp. Em execuções subsequentes, a
// sessão salva evita essa etapa.
function waitForQr(client: Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("⏰ Timeout: QR code não escaneado em 60s"));
    }, QR_TIMEOUT);

    client.on("qr", (qr: string) => {
      // Exibe QR code no terminal para escanear
      console.log("\n📱 ESCANEIE O QR CODE ABAIXO COM O WHATSAPP:\n");
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      clearTimeout(timeout);
      console.log("✅ WhatsApp conectado!");
      resolve();
    });

    client.on("auth_failure", (msg: string) => {
      clearTimeout(timeout);
      reject(new Error(`❌ Falha de autenticação: ${msg}`));
    });

    client.on("disconnected", (reason: string) => {
      console.warn(`⚠️  WhatsApp desconectado: ${reason}`);
    });
  });
}

// Envia mensagem para um número
async function sendMessage(
  client: Client,
  to: string,
  message: string
): Promise<boolean> {
  try {
    // Formato: 5511999999999 (sem +, sem espaços)
    const chatId = `${to}@c.us`;
    await client.sendMessage(chatId, message);
    return true;
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err);
    return false;
  }
}

// Formata resumo para envio no WhatsApp
// Por que: WhatsApp tem limite de 4096 chars por mensagem.
// Resumos de ~80 palavras cabem tranquilamente.
function formatSummary(summary: {
  title: string;
  content: string;
  url: string;
  siteName: string;
}): string {
  return `🤖 *${summary.title}*\n\n${summary.content}\n\n🔗 ${summary.url}\n📡 _${summary.siteName}_`;
}

// --- Função principal: enviar resumos ---
// Por que: Pega os resumos mais recentes não-enviados e
// manda pro WhatsApp do usuário.
export async function sendSummaries(): Promise<{
  sent: number;
  failed: number;
}> {
  // Pega config (número do WhatsApp)
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  if (!config?.whatsappNumber) {
    console.warn(
      "⚠️  Número do WhatsApp não configurado. Acesse o dashboard > Configurações."
    );
    return { sent: 0, failed: 0 };
  }

  // Pega resumos recentes não-enviados
  // Por que: LEFT JOIN com SendLog — se não tem log, não foi enviado
  const summaries = await prisma.summary.findMany({
    where: {
      sendLog: null, // Não enviado ainda
    },
    include: {
      article: {
        include: { site: true },
      },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  if (summaries.length === 0) {
    console.log("📭 Nenhum resumo pendente de envio.");
    return { sent: 0, failed: 0 };
  }

  // Inicializa cliente
  const client = createClient();
  let sentCount = 0;
  let failedCount = 0;

  try {
    // Inicializa e aguarda conexão
    console.log("🔄 Iniciando WhatsApp...");
    client.initialize();
    await waitForQr(client);

    // Envia cada resumo
    for (const summary of summaries) {
      const message = formatSummary({
        title: summary.article.title,
        content: summary.content,
        url: summary.article.url,
        siteName: summary.article.site.name,
      });

      console.log(`📤 Enviando: ${summary.article.title.slice(0, 50)}...`);
      const success = await sendMessage(
        client,
        config.whatsappNumber,
        message
      );

      // Registra no banco
      await prisma.sendLog.create({
        data: {
          summaryId: summary.id,
          recipient: config.whatsappNumber,
          status: success ? "sent" : "failed",
          errorMsg: success ? null : "Falha no envio via WhatsApp",
        },
      });

      if (success) {
        sentCount++;
      } else {
        failedCount++;
      }

      // Pausa entre mensagens (evita flood)
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (err) {
    console.error("❌ Erro no WhatsApp:", err);
  } finally {
    // Por que: Sempre destruir o cliente pra não travar o processo
    client.destroy();
  }

  return { sent: sentCount, failed: failedCount };
}
