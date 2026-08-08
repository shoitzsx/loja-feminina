import { Facebook, Instagram, Music2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-rosebrand-200 bg-rosebrand-50/95">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <section>
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
      <div className="border-t border-rosebrand-100 py-4 text-center text-xs text-neutral-500">
        © Barb’s Closet — Todos os direitos reservados.
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <section>
      <h2 className="text-sm font-black uppercase text-ink">{title}</h2>
      <div className="mt-4 grid gap-2 text-sm text-neutral-600">
        {links.map(([label, href]) => (
          <Link key={label} href={href} className="hover:text-rosebrand-600">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Social({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} className="grid size-10 place-items-center rounded-lg border border-rosebrand-200 bg-white/60 text-rosebrand-700 transition hover:-translate-y-0.5 hover:bg-rosebrand-100">
      {icon}
    </Link>
  );
}
