import Link from "next/link";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";

const variants: Record<ButtonVariant, string> = {
  primary: "pink-sheen bg-[linear-gradient(135deg,#ff1689,#ff4fac,#e60077)] text-white shadow-glow hover:shadow-soft",
  secondary: "border border-rosebrand-300 bg-rosebrand-50/90 text-rosebrand-800 shadow-card hover:border-rosebrand-500 hover:bg-rosebrand-100",
  ghost: "text-ink hover:bg-rosebrand-100/70",
  dark: "bg-plum text-white shadow-card hover:bg-ink"
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & (AnchorHTMLAttributes<HTMLAnchorElement> | ButtonHTMLAttributes<HTMLButtonElement>);

export function Button({ href, children, variant = "primary", className: customClassName, ...rest }: ButtonProps) {
  const className = clsx(base, variants[variant], customClassName);

  if (href) {
    return (
      <Link href={href} className={className} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? "button"} className={className} {...buttonProps}>
      {children}
    </button>
  );
}
