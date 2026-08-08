import { Heart, LogOut, MapPin, PackageCheck, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

const accountItems = [
  { label: "Meus pedidos", href: "/meus-pedidos", icon: PackageCheck, detail: "Acompanhe pagamento, envio e entrega." },
  { label: "Dados pessoais", href: "/minha-conta", icon: UserRound, detail: "Atualize nome, telefone e e-mail." },
  { label: "Endereços", href: "/minha-conta", icon: MapPin, detail: "Gerencie seus endereços de entrega." },
  { label: "Favoritos", href: "/favoritos", icon: Heart, detail: "Produtos salvos para comprar depois." },
  { label: "Alterar senha", href: "/login", icon: ShieldCheck, detail: "Use redefinição segura por token temporário." },
  { label: "Sair", href: "/", icon: LogOut, detail: "Encerrar sessão com cookies seguros." }
];

export function AccountDashboard() {
  return (
    <section className="container-shell py-8">
      <h1 className="text-3xl font-black text-ink">Minha Conta</h1>
      <p className="mt-2 text-sm text-neutral-600">Área preparada para sessão persistente, pedidos, favoritos e endereços salvos.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accountItems.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href={item.href} className="glam-panel glam-hover rounded-lg p-5">
              <Icon className="size-6 text-rosebrand-600" />
              <h2 className="mt-4 text-lg font-black text-ink">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{item.detail}</p>
            </a>
          );
        })}
      </div>
      <Button href="/produtos" className="mt-8">Continuar comprando</Button>
    </section>
  );
}
