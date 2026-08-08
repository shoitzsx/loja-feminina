import { clsx } from "clsx";
import type { ReactNode } from "react";

const toneStyles = {
  pink: "pink-sheen bg-[linear-gradient(135deg,#ff1689,#ff69b9,#e60077)] text-white shadow-glow",
  gold: "bg-champagne text-white shadow-card",
  light: "bg-rosebrand-100 text-rosebrand-800",
  dark: "bg-plum text-white"
};

export function Badge({ children, tone = "pink", className }: { children: ReactNode; tone?: keyof typeof toneStyles; className?: string }) {
  return <span className={clsx("inline-flex items-center rounded px-2 py-1 text-[11px] font-black uppercase tracking-wide", toneStyles[tone], className)}>{children}</span>;
}
