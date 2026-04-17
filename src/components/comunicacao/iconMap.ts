import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getIcon(name: string): LucideIcon {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return Icon || Icons.FileText;
}

export const COR_PRESETS = [
  { label: "Azul (primary)", value: "bg-primary/10 text-primary" },
  { label: "Vermelho", value: "bg-red-500/10 text-red-600" },
  { label: "Roxo", value: "bg-purple-500/10 text-purple-600" },
  { label: "Verde", value: "bg-emerald-500/10 text-emerald-600" },
  { label: "Âmbar", value: "bg-amber-500/10 text-amber-600" },
  { label: "Azul claro", value: "bg-blue-500/10 text-blue-600" },
  { label: "Rosa", value: "bg-pink-500/10 text-pink-600" },
];
