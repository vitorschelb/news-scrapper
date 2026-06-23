// ============================================================
// Utilitários — cn() para Tailwind + shadcn/ui
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Por que: shadcn/ui usa essa função para mesclar classes do
// Tailwind sem conflitos. O twMerge resolve conflitos de
// classes (ex: "px-4 px-6" vira "px-6").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
