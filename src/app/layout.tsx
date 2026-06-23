// ============================================================
// Root Layout — HTML, fontes, ThemeProvider, Sidebar
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NewsBot — Resumo de notícias de tecnologia",
  description:
    "Dashboard do News Scrapper: configure fontes, agendamento e acompanhe o histórico de notícias de tecnologia resumidas por IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Sidebar />
          {/* Main content: offset pela sidebar (w-64) */}
          <main className="md:ml-64 min-h-screen p-6 md:p-8 lg:p-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
