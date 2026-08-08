"use client";

import { Facebook, Instagram, Music2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className={`footer-reveal mt-16 border-t border-rosebrand-200 bg-rosebrand-50/95 ${visible ? "is-visible" : ""}`}>
      <div className="container-shell grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <section className="transition duration-200 hover:-translate-y-0.5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
            Moda feminina, acessórios e semijoias selecionadas para looks elegantes, femininos e fáceis de comprar.
          </p>
        </section>
        <FooterGroup title="Atendimento" links={[["WhatsApp", "/contato"], ["E-mail", "/contato"], ["Seg a Sex · 9h às 18h", "/contato"]]} />
        <FooterGroup
          title="Institucional"
          links={[
            ["Sobre nós", "/sobre"],
            ["Política de Privacidade", "/politica-de-privacidade"],
            ["Termos", "/termos"],
            ["Trocas e Devoluções", "/trocas-e-devolucoes"],
            ["Entrega", "/politica-de-entrega"],
            ["Cookies", "/cookies"]
          ]}
        />
        <FooterGroup title="Minha conta" links={[["Login", "/login"], ["Pedidos", "/meus-pedidos"], ["Favoritos", "/favoritos"]]} />
        <section>
          <h2 className="text-sm font-black uppercase text-ink">Redes sociais</h2>
          <div className="mt-4 flex gap-2">
            <Social href="#" label="Instagram" icon={<Instagram className="size-4" />} />
            <Social href="#" label="TikTok" icon={<Music2 className="size-4" />} />
            <Social href="#" label="Facebook" icon={<Facebook className="size-4" />} />
          </div>
        </section>
      </div>
      <div className="border-t border-rosebrand-100 py-4 text-center text-xs text-neutral-500 transition-colors duration-200 hover:text-rosebrand-700">
        © Barb’s Closet — Todos os direitos reservados.
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <section className="transition duration-200 hover:-translate-y-0.5">
      <h2 className="text-sm font-black uppercase text-ink">{title}</h2>
      <div className="mt-4 grid gap-2 text-sm text-neutral-600">
        {links.map(([label, href]) => (
          <Link key={label} href={href} className="group w-fit transition-colors duration-200 hover:text-rosebrand-700">
            <span className="bg-gradient-to-r from-rosebrand-600 to-rosebrand-600 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-200 group-hover:bg-[length:100%_2px]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Social({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="grid size-10 place-items-center rounded-lg border border-rosebrand-200 bg-white/60 text-rosebrand-700 transition duration-200 hover:-translate-y-0.5 hover:rotate-3 hover:scale-105 hover:bg-rosebrand-100 hover:text-rosebrand-900">
      {icon}
    </Link>
  );
}
