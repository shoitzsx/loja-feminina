"use client";

import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";

type HeaderMode = "expanded" | "compact";
type ScrollDirection = "down" | "up" | "idle";

const COMPACT_SCROLL_THRESHOLD = 80;
const EXPANDED_HEADER_FALLBACK_HEIGHT = 152;
const ANIMACAO_MENU_LATERAL_MS = 260;
const BLOQUEIO_BACKDROP_APOS_ABERTURA_MS = 120;

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
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [mode, setMode] = useState<HeaderMode>("expanded");
  const [headerHeight, setHeaderHeight] = useState(EXPANDED_HEADER_FALLBACK_HEIGHT);
  const headerRef = useRef<HTMLElement>(null);
  const modeRef = useRef<HeaderMode>("expanded");
  const heightRef = useRef(EXPANDED_HEADER_FALLBACK_HEIGHT);
  const lastScrollYRef = useRef(0);
  const scrollFrameRef = useRef(0);
  const measureFrameRef = useRef(0);
  const transitionFrameRef = useRef(0);
  const fechamentoMenuRef = useRef<number | null>(null);
  const aberturaMenuEmMsRef = useRef(0);
  const { count } = useCart();
  const isCompact = mode === "compact";

  function abrirMenu() {
    if (fechamentoMenuRef.current) {
      window.clearTimeout(fechamentoMenuRef.current);
      fechamentoMenuRef.current = null;
    }

    aberturaMenuEmMsRef.current = performance.now();
    setMenuVisivel(true);
    setMenuAberto(true);
  }

  function fecharMenu() {
    setMenuAberto(false);

    if (fechamentoMenuRef.current) {
      window.clearTimeout(fechamentoMenuRef.current);
    }

    fechamentoMenuRef.current = window.setTimeout(() => {
      setMenuVisivel(false);
      fechamentoMenuRef.current = null;
    }, ANIMACAO_MENU_LATERAL_MS);
  }

  function fecharMenuBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (performance.now() - aberturaMenuEmMsRef.current < BLOQUEIO_BACKDROP_APOS_ABERTURA_MS) return;
    fecharMenu();
  }

  useEffect(() => {
    if (!menuVisivel) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuVisivel]);

  useEffect(() => {
    return () => {
      if (!fechamentoMenuRef.current) return;
      window.clearTimeout(fechamentoMenuRef.current);
      fechamentoMenuRef.current = null;
    };
  }, []);

  useEffect(() => {
    const currentHeader = headerRef.current;
    if (!currentHeader) return;
    const headerElement: HTMLElement = currentHeader;
    const root = document.documentElement;

    function setMeasuredHeight(nextHeight: number) {
      if (nextHeight === heightRef.current) return;
      heightRef.current = nextHeight;
      setHeaderHeight(nextHeight);
      root.style.setProperty("--header-height", `${nextHeight}px`);
    }

    function measureHeaderHeight() {
      window.cancelAnimationFrame(measureFrameRef.current);
      measureFrameRef.current = window.requestAnimationFrame(() => {
        setMeasuredHeight(Math.ceil(headerElement.getBoundingClientRect().height));
      });
    }

    function measureDuringTransition() {
      const startedAt = performance.now();

      function tick(now: number) {
        setMeasuredHeight(Math.ceil(headerElement.getBoundingClientRect().height));
        if (now - startedAt < 320) {
          transitionFrameRef.current = window.requestAnimationFrame(tick);
        }
      }

      window.cancelAnimationFrame(transitionFrameRef.current);
      transitionFrameRef.current = window.requestAnimationFrame(tick);
    }

    function setHeaderMode(nextMode: HeaderMode) {
      if (nextMode === modeRef.current) return;
      modeRef.current = nextMode;
      setMode(nextMode);
      measureDuringTransition();
    }

    function resolveMode(scrollY: number, direction: ScrollDirection): HeaderMode {
      if (scrollY <= 0) return "expanded";
      if (direction === "up") return "compact";
      if (modeRef.current === "compact") return "compact";
      return scrollY > COMPACT_SCROLL_THRESHOLD ? "compact" : "expanded";
    }

    function evaluateScroll() {
      scrollFrameRef.current = 0;
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollYRef.current;
      const direction: ScrollDirection = currentScrollY > previousScrollY ? "down" : currentScrollY < previousScrollY ? "up" : "idle";

      lastScrollYRef.current = currentScrollY;
      setHeaderMode(resolveMode(currentScrollY, direction));
    }

    function handleScroll() {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = window.requestAnimationFrame(evaluateScroll);
    }

    lastScrollYRef.current = Math.max(window.scrollY, 0);
    modeRef.current = lastScrollYRef.current <= 0 ? "expanded" : "compact";
    setMode(modeRef.current);
    measureHeaderHeight();

    const observer = new ResizeObserver(measureHeaderHeight);
    observer.observe(headerElement);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measureHeaderHeight);

    return () => {
      window.cancelAnimationFrame(scrollFrameRef.current);
      window.cancelAnimationFrame(measureFrameRef.current);
      window.cancelAnimationFrame(transitionFrameRef.current);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measureHeaderHeight);
      root.style.removeProperty("--header-height");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-mode={mode}
      data-header-height={headerHeight}
      className="fixed inset-x-0 top-0 z-40 border-b border-rosebrand-200 bg-rosebrand-50/98 shadow-card"
    >
      <div className={`overflow-hidden transition-[max-height,opacity] duration-[250ms] ease-in-out ${isCompact ? "max-h-0 opacity-0" : "max-h-9 opacity-100"}`}>
        <div className="pink-sheen flex h-9 items-center justify-center bg-[linear-gradient(90deg,#e60077,#ff1689,#d8a83d,#ff1689)] px-4 text-center text-xs font-semibold text-white">
          <span className="truncate">Frete grátis acima de R$ 299 · Novidades glam toda semana</span>
        </div>
      </div>

      <div className={`container-shell grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 transition-[min-height,padding] duration-[250ms] ease-in-out lg:grid-cols-[auto_minmax(280px,1fr)_auto] lg:gap-4 ${isCompact ? "min-h-[56px] py-1.5" : "min-h-[60px] py-2"}`}>
        <button className="rounded-lg p-2 text-ink transition hover:bg-rosebrand-100 lg:hidden" onClick={abrirMenu} aria-label="Abrir menu">
          <Menu className="size-6" />
        </button>
        <Logo compact={isCompact} />
        <div className={`${isCompact ? "block" : "hidden lg:block"} min-w-0`}>
          <SearchBox compact={isCompact} />
        </div>
        <nav className="flex shrink-0 items-center justify-end gap-1">
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

      <div className={`container-shell overflow-hidden transition-[max-height,padding,opacity] duration-[250ms] ease-in-out lg:hidden ${isCompact ? "max-h-0 pb-0 opacity-0" : "max-h-16 pb-3 opacity-100"}`}>
        <SearchBox compact />
      </div>

      <nav className={`hidden overflow-hidden bg-white/38 transition-[max-height,border-color,opacity] duration-[250ms] ease-in-out lg:block ${isCompact ? "max-h-0 border-t-0 border-transparent opacity-0" : "max-h-12 border-t border-rosebrand-100 opacity-100"}`}>
        <div className="container-shell flex h-12 items-center gap-6 overflow-x-auto text-sm font-bold text-neutral-700">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-2 py-2 transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {menuVisivel && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className={`absolute inset-0 bg-ink/40 transition-opacity duration-[260ms] ease-out ${menuAberto ? "opacity-100" : "opacity-0"}`}
            onClick={fecharMenuBackdrop}
            aria-hidden="true"
          />
          <div className={`${menuAberto ? "animar-menu-lateral-abrir" : "animar-menu-lateral-fechar"} absolute left-0 top-0 flex h-[100dvh] w-[min(88vw,360px)] max-w-full flex-col overflow-y-auto border-r border-rosebrand-200 bg-rosebrand-50 p-5 shadow-soft`}>
            <div className="mb-5 flex items-center justify-between">
              <Logo compact />
              <button className="rounded-lg p-2 hover:bg-rosebrand-100" onClick={fecharMenu} aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-4">
              <SearchBox compact />
            </div>
            <div className="grid gap-1">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} onClick={fecharMenu} className="rounded-lg px-3 py-3 text-sm font-bold text-ink transition hover:bg-rosebrand-100 hover:text-rosebrand-700">
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
