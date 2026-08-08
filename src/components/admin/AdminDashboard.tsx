"use client";

import { BarChart3, Boxes, Package, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/data";
import { formatMoney } from "@/lib/format";

const recentOrders = [
  { number: "BC24081926", customer: "Cliente Exemplo", payment: "PIX pendente", status: "pagamento pendente", total: 369.8 },
  { number: "BC24081418", customer: "Marina Costa", payment: "Cartão aprovado", status: "preparando pedido", total: 149.9 },
  { number: "BC24080902", customer: "Ana Beatriz", payment: "PIX aprovado", status: "enviado", total: 249.8 }
];

export function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");

  function authorize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAuthorized(form.get("code") === "BARBS-ADMIN");
    setMessage(form.get("code") === "BARBS-ADMIN" ? "" : "Código inválido para o MVP.");
  }

  const lowStock = useMemo(
    () => products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))).filter(({ variant }) => variant.stock <= variant.lowStockAlert),
    []
  );

  if (!authorized) {
    return (
      <section className="container-shell grid min-h-[70vh] place-items-center py-10">
        <form onSubmit={authorize} className="glam-panel w-full max-w-md animate-soft-pop rounded-lg p-6">
          <ShieldCheck className="mx-auto size-10 text-rosebrand-600" />
          <h1 className="mt-4 text-center text-2xl font-black text-ink">Painel administrativo</h1>
          <p className="mt-2 text-center text-sm leading-6 text-neutral-600">
            Acesso de demonstração. Em produção, use sessão segura, RBAC, MFA opcional e auditoria.
          </p>
          <label className="mt-5 block text-sm font-bold text-ink">
            Código do MVP
            <input name="code" type="password" placeholder="BARBS-ADMIN" className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3" />
          </label>
          <Button type="submit" className="mt-4 w-full">Entrar</Button>
          {message && <p className="mt-3 rounded-lg bg-rosebrand-100 p-3 text-sm font-bold text-rosebrand-800">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="container-shell py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">Admin Barb’s Closet</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Dashboard</h1>
        </div>
        <Button type="button" variant="secondary" onClick={() => setAuthorized(false)}>Sair do painel</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<BarChart3 className="size-5" />} label="Faturamento" value={formatMoney(12840.7)} />
        <Metric icon={<ShoppingCart className="size-5" />} label="Pedidos" value="126" />
        <Metric icon={<Package className="size-5" />} label="Produtos vendidos" value="342" />
        <Metric icon={<Users className="size-5" />} label="Novos clientes" value="38" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminSection title="Pedidos recentes">
          <div className="overflow-x-auto">
            <table className="min-w-[620px] w-full text-left text-sm">
              <thead className="bg-rosebrand-100">
                <tr>
                  {["Pedido", "Cliente", "Pagamento", "Status", "Total"].map((head) => (
                    <th key={head} className="px-4 py-3 font-black">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.number} className="border-t border-rosebrand-100">
                    <td className="px-4 py-3 font-black">{order.number}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.payment}</td>
                    <td className="px-4 py-3"><Badge tone="light">{order.status}</Badge></td>
                    <td className="px-4 py-3 font-black text-rosebrand-700">{formatMoney(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>

        <AdminSection title="Estoque baixo">
          <div className="grid gap-3">
            {lowStock.map(({ product, variant }) => (
              <div key={variant.id} className="flex items-center justify-between rounded-lg border border-rosebrand-200 bg-white/50 p-3">
                <span>
                  <span className="block text-sm font-black text-ink">{product.name}</span>
                  <span className="text-xs text-neutral-500">{variant.sku} · {variant.size ?? "Único"}</span>
                </span>
                <Badge>{variant.stock} un.</Badge>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminSection title="Produtos">
          <AdminForm fields={["Nome", "SKU", "Preço", "Categoria", "Tamanho", "Cor", "Material", "Estoque"]} button="Salvar produto" />
        </AdminSection>
        <AdminSection title="Banners">
          <AdminForm fields={["Título", "Subtítulo", "Imagem", "CTA", "Link", "Data inicial", "Data final"]} button="Atualizar banner" />
        </AdminSection>
        <AdminSection title="Categorias">
          <AdminForm fields={["Nome", "Slug", "Descrição", "Imagem"]} button="Salvar categoria" />
        </AdminSection>
        <AdminSection title="Cupons">
          <AdminForm fields={["Código", "Valor", "Porcentagem", "Validade", "Limite de uso"]} button="Salvar cupom" />
        </AdminSection>
      </div>

      <AdminSection title="Integrações e segurança" className="mt-8">
        <div className="grid gap-3 text-sm leading-6 text-neutral-700 md:grid-cols-2">
          <p>Pagamentos: confirmar status apenas por webhook assinado do gateway.</p>
          <p>Nota fiscal: emissão depende de provedor fiscal, CNPJ, certificado e regras reais.</p>
          <p>WhatsApp: mensagens automáticas exigem WhatsApp Business Platform e templates aprovados.</p>
          <p>Privacidade: acesso a clientes deve respeitar permissões, necessidade e logs de auditoria.</p>
        </div>
      </AdminSection>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="glam-panel glam-hover rounded-lg p-5">
      <div className="text-rosebrand-600">{icon}</div>
      <p className="mt-3 text-sm font-bold text-neutral-600">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </article>
  );
}

function AdminSection({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glam-panel rounded-lg p-5 ${className}`}>
      <h2 className="mb-4 text-xl font-black text-ink">{title}</h2>
      {children}
    </section>
  );
}

function AdminForm({ fields, button }: { fields: string[]; button: string }) {
  return (
    <form className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field} className="block">
          <span className="text-sm font-bold text-ink">{field}</span>
          <input className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm" />
        </label>
      ))}
      <Button type="button" className="sm:col-span-2">
        <Boxes className="size-4" />
        {button}
      </Button>
    </form>
  );
}
