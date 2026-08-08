import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/format";

const orders = [
  {
    number: "BC24081926",
    date: "07/08/2026",
    status: "pagamento pendente",
    total: 369.8,
    items: "Vestido Midi Rosa Glam, Colar Prata Ponto de Luz"
  },
  {
    number: "BC24081418",
    date: "02/08/2026",
    status: "enviado",
    total: 149.9,
    items: "Pulseira Prata Charms"
  }
];

export function OrdersView() {
  return (
    <section className="container-shell py-8">
      <h1 className="text-3xl font-black text-ink">Meus pedidos</h1>
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
            {orders.map((order) => (
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
    </section>
  );
}
