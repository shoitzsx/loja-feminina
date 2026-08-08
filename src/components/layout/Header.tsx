"use client";

import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";

const navItems = [
  ["Início", "/"],
  ["Roupas", "/categoria/roupas"],
  ["Acessórios", "/categoria/acessorios"],
  ["Colares", "/categoria/colares"],
  ["Brincos", "/categoria/brincos"],
  ["Pulseiras", "/categoria/pulseiras"],
  ["Novidades", "/novidades"],
  ["Promoções", "/promocoes"],
  ["Mais vendidos", "/mais-vendidos"]
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { count } = useCart();

  useEffect(() => {
    const currentHeader = headerRef.current;
    if (!currentHeader) return;
    const headerElement: HTMLElement = currentHeader;

    const root = document.documentElement;
    let frame = 0;
    let lastScrolled = window.scrollY > 12;

    function syncHeaderHeight() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty("--header-height", `${Math.ceil(headerElement.getBoundingClientRect().height)}px`);
      });
    }

    function handleScroll() {
      const nextScrolled = window.scrollY > 12;
      if (nextScrolled === lastScrolled) return;
      lastScrolled = nextScrolled;
      setScrolled(nextScrolled);
    }

    setScrolled(lastScrolled);
    syncHeaderHeight();

    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(headerElement);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", syncHeaderHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", syncHeaderHeight);
      root.style.removeProperty("--header-height");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled ? "true" : "false"}
      className="fixed inset-x-0 top-0 z-40 border-b border-rosebrand-200 bg-rosebrand-50/98 shadow-card transition-[background-color,border-color,box-shadow] duration-200"
    >
      <div
        className={`pink-sheen overflow-hidden bg-[linear-gradient(90deg,#e60077,#ff1689,#d8a83d,#ff1689)] text-center text-xs font-semibold text-white transition-[max-height,padding,opacity] duration-200 ease-out ${
          scrolled ? "max-h-0 py-0 opacity-0" : "max-h-10 py-2 opacity-100"
        }`}
      >
        <div className="truncate px-4">Frete grátis acima de R$ 299 · Novidades glam toda semana</div>
      </div>

      <div
        className={`container-shell grid grid-cols-[auto_1fr_auto] items-center gap-3 transition-[min-height,padding] duration-200 ease-out lg:grid-cols-[auto_minmax(280px,1fr)_auto] ${
          scrolled ? "min-h-14 py-1.5" : "min-h-[72px] py-2"
        }`}
      >
        <button className="rounded-lg p-2 text-ink transition hover:bg-rosebrand-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="size-6" />
        </button>
        <Logo compact={scrolled} />
        <div className="hidden lg:block">
          <SearchBox />
        </div>
        <nav className="flex items-center justify-end gap-1">
          <Link href="/login" aria-label="Minha conta" className="rounded-lg p-2 text-ink transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
            <User className="size-5" />
          </Link>
          <Link href="/favoritos" aria-label="Favoritos" className="rounded-lg p-2 text-ink transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
            <Heart className="size-5" />
          </Link>
          <Link href="/carrinho" aria-label="Carrinho" className="relative rounded-lg p-2 text-ink transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
            <ShoppingBag className="size-5" />
            {count > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rosebrand-500 px-1 text-[11px] font-black text-white">{count}</span>}
          </Link>
        </nav>
      </div>

      <div className={`container-shell overflow-hidden transition-[max-height,padding,opacity] duration-200 ease-out lg:hidden ${scrolled ? "max-h-0 pb-0 opacity-0" : "max-h-16 pb-3 opacity-100"}`}>
        <div>
          <SearchBox compact />
        </div>
      </div>

      <nav className="hidden overflow-hidden border-t border-rosebrand-100 bg-white/38 transition-[max-height,opacity] duration-200 ease-out lg:block">
        <div className={`container-shell flex items-center gap-6 overflow-x-auto text-sm font-bold text-neutral-700 transition-[min-height] duration-200 ease-out ${scrolled ? "min-h-10" : "min-h-12"}`}>
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-2 py-2 transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-label="Fechar menu" />
          <div className="relative flex h-full w-[min(88vw,360px)] flex-col bg-rosebrand-50/98 p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <Logo compact />
              <button className="rounded-lg p-2 hover:bg-rosebrand-100" onClick={() => setOpen(false)} aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-4">
              <SearchBox compact />
            </div>
            <div className="grid gap-1">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-bold text-ink transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
