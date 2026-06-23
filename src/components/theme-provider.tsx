"use client";

// ============================================================
// Theme Provider — Tema claro/escuro com next-themes
// ============================================================
// Por que: next-themes gerencia o tema sem flicker e
// integra perfeitamente com Tailwind/shacn/ui.
// ============================================================

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
