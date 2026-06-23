// ============================================================
// Seed — Dados iniciais do banco
// ============================================================
// Por que: Na primeira vez que o projeto rodar, precisamos de
// fontes padrão (TLDR AI + Hugging Face) e config inicial.
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // --- AppConfig (singleton) ---
  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      deliveryTimes: JSON.stringify(["08:00", "12:00", "18:00"]),
      whatsappNumber: "",
    },
  });
  console.log("  ✅ AppConfig criada");

  // --- Fontes padrão ---
  const sources = [
    {
      name: "TLDR AI",
      url: "https://tldr.tech/ai",
      feedUrl: "https://tldr.tech/api/ai/rss",
      type: "rss",
      isActive: true,
    },
    {
      name: "Hugging Face Blog",
      url: "https://huggingface.co/blog",
      feedUrl: "https://huggingface.co/blog/feed.xml",
      type: "rss",
      isActive: true,
    },
  ];

  for (const source of sources) {
    await prisma.crawledSite.upsert({
      where: { id: source.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: source.name.toLowerCase().replace(/\s+/g, "-"),
        ...source,
      },
    });
    console.log(`  ✅ Fonte criada: ${source.name}`);
  }

  console.log("🎉 Seed completo!");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
