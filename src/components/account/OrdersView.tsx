import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/server/my-orders";

const sampleOrders = [
  { number: "BC24081926", date: "07/08/2026", status: "pagamento pendente", total: 369.8, items: "Vestido Midi Rosa Glam, Colar Prata Ponto de Luz" },
  { number: "BC24081418", date: "02/08/2026", status: "enviado", total: 149.9, items: "Pulseira Prata Charms" }
];

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "pagamento pendente",
  PAID: "pago",
  PREPARING: "preparando pedido",
  SHIPPED: "enviado",
  DELIVERED: "entregue",
  CANCELED: "cancelado",
  REFUNDED: "reembolsado"
};

type Props = { mode: "sample" | "anonymous" | "real"; orders?: OrderSummary[] };

export function OrdersView({ mode, orders = [] }: Props) {
  if (mode === "anonymous") {
    return (
      <section className="container-shell grid min-h-[50vh] place-items-center py-10">
        <div className="glam-panel max-w-md rounded-lg p-6 text-center">
          <h1 className="text-2xl font-black text-ink">Meus pedidos</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Entre na sua conta para ver seus pedidos.</p>
          <Button href="/login" className="mt-5">Entrar</Button>
        </div>
      </section>
    );
  }

  const rows =
    mode === "real"
      ? orders.map((order) => ({
          number: order.number,
          date: new Date(order.date).toLocaleDateString("pt-BR"),
          status: statusLabel[order.status] ?? order.status.toLowerCase(),
          total: order.totalCents / 100,
          items: order.items
        }))
      : sampleOrders;

  return (
    <section className="container-shell py-8">
      <h1 className="text-3xl font-black text-ink">Meus pedidos</h1>
      {mode === "sample" && <p className="mt-2 text-sm text-muted">Pedidos de exemplo, apenas para demonstração.</p>}
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="glam-panel mt-6 overflow-x-auto rounded-lg">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-rosebrand-100 text-ink">
              <tr>
                {["Pedido", "Data", "Produtos", "Status", "Total"].map((head) => (
                  <th key={head} className="px-4 py-3 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.number} className="border-t border-rosebrand-100">
                  <td className="px-4 py-4 font-black">{order.number}</td>
                  <td className="px-4 py-4">{order.date}</td>
                  <td className="px-4 py-4">{order.items}</td>
                  <td className="px-4 py-4"><Badge tone={order.status === "enviado" ? "gold" : "light"}>{order.status}</Badge></td>
                  <td className="px-4 py-4 font-black text-rosebrand-700">{formatMoney(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
