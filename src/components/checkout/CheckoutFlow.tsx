"use client";

import { CheckCircle2, CreditCard, MapPin, UserRound, WalletCards } from "lucide-react";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { shippingOptions } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { calculateCartPricing } from "@/lib/pricing";
import type { CheckoutPayload } from "@/lib/types";

const steps = [
  { id: 1, label: "Identificação", icon: UserRound },
  { id: 2, label: "Endereço", icon: MapPin },
  { id: 3, label: "Entrega", icon: WalletCards },
  { id: 4, label: "Pagamento", icon: CreditCard },
  { id: 5, label: "Confirmação", icon: CheckCircle2 }
];

export function CheckoutFlow() {
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [shippingOptionId, setShippingOptionId] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPayload["paymentMethod"]>("PIX");
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; message: string } | null>(null);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    cpf: "",
    phone: "",
    email: ""
  });
  const [address, setAddress] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: ""
  });

  const pricing = useMemo(() => calculateCartPricing(items, coupon, shippingOptionId), [coupon, items, shippingOptionId]);

  async function lookupCep(zipCode: string) {
    const clean = zipCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const response = await fetch(`/api/cep?cep=${clean}`);
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          setAddress((current) => ({
            ...current,
            zipCode: data.address.zipCode,
            street: data.address.street,
            district: data.address.district,
            city: data.address.city,
            state: data.address.state
          }));
        }
      }
    } finally {
      setLoadingCep(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    const payload: CheckoutPayload = {
      customer,
      address,
      items,
      couponCode: coupon,
      shippingOptionId,
      paymentMethod
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar o pedido.");
      setConfirmation({ orderNumber: data.order.orderNumber, message: data.order.confirmation });
      clearCart();
      setStep(5);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro no checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length && !confirmation) {
    return (
      <section className="container-shell py-12">
        <div className="glam-panel rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-ink">Seu carrinho está vazio</h1>
          <Button href="/produtos" className="mt-5">
            Escolher produtos
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="glam-panel rounded-lg p-5">
        <div className="mb-6 grid grid-cols-5 gap-2">
          {steps.map((item) => {
            const Icon = item.icon;
            const active = item.id <= step;
            return (
              <div key={item.id} className={active ? "pink-sheen rounded-lg bg-[linear-gradient(135deg,#ff1689,#ff5fb0,#e60077)] p-2 text-white shadow-card" : "rounded-lg bg-white/55 p-2 text-neutral-500"}>
                <Icon className="mx-auto size-5" />
                <span className="mt-1 block truncate text-center text-[11px] font-black">{item.label}</span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <Panel title="Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" value={customer.firstName} onChange={(value) => setCustomer({ ...customer, firstName: value })} required />
              <Field label="Sobrenome" value={customer.lastName} onChange={(value) => setCustomer({ ...customer, lastName: value })} required />
              <Field label="CPF" value={customer.cpf} onChange={(value) => setCustomer({ ...customer, cpf: value })} />
              <Field label="Telefone" value={customer.phone} onChange={(value) => setCustomer({ ...customer, phone: value })} required />
              <Field label="E-mail" type="email" value={customer.email} onChange={(value) => setCustomer({ ...customer, email: value })} required className="sm:col-span-2" />
            </div>
          </Panel>
        )}

        {step === 2 && (
          <Panel title="Endereço">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CEP" value={address.zipCode} onChange={(value) => setAddress({ ...address, zipCode: value })} onBlur={() => lookupCep(address.zipCode)} required helper={loadingCep ? "Buscando endereço..." : undefined} />
              <Field label="Rua" value={address.street} onChange={(value) => setAddress({ ...address, street: value })} required />
              <Field label="Número" value={address.number} onChange={(value) => setAddress({ ...address, number: value })} required />
              <Field label="Complemento" value={address.complement} onChange={(value) => setAddress({ ...address, complement: value })} />
              <Field label="Bairro" value={address.district} onChange={(value) => setAddress({ ...address, district: value })} required />
              <Field label="Cidade" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} required />
              <Field label="Estado" value={address.state} onChange={(value) => setAddress({ ...address, state: value.toUpperCase() })} required />
            </div>
          </Panel>
        )}

        {step === 3 && (
          <Panel title="Entrega">
            <div className="grid gap-3">
              {shippingOptions.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-rosebrand-200 bg-white/55 p-4 transition hover:bg-rosebrand-100">
                  <span>
                    <span className="block font-black text-ink">{option.label}</span>
                    <span className="text-sm text-neutral-500">{option.estimate}</span>
                  </span>
                  <span className="flex items-center gap-3 font-black text-rosebrand-700">
                    {pricing.subtotal >= 299 || option.price === 0 ? "Grátis" : formatMoney(option.price)}
                    <input type="radio" name="shipping" checked={shippingOptionId === option.id} onChange={() => setShippingOptionId(option.id)} className="size-5 accent-rosebrand-500" />
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        )}

        {step === 4 && (
          <Panel title="Pagamento">
            <p className="mb-4 text-sm leading-6 text-neutral-600">
              A arquitetura está pronta para tokenização pelo gateway. A loja nunca deve armazenar número completo de cartão nem CVV.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["PIX", "PIX"],
                ["CREDIT_CARD", "Cartão de crédito"],
                ["DEBIT_CARD", "Cartão de débito"],
                ["BOLETO", "Boleto"]
              ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center justify-between rounded-lg border border-rosebrand-200 bg-white/55 p-4 font-bold transition hover:bg-rosebrand-100">
                  {label}
                  <input type="radio" checked={paymentMethod === value} onChange={() => setPaymentMethod(value as CheckoutPayload["paymentMethod"])} className="size-5 accent-rosebrand-500" />
                </label>
              ))}
            </div>
          </Panel>
        )}

        {step === 5 && confirmation && (
          <Panel title="Pedido recebido">
            <div className="rounded-lg bg-rosebrand-100 p-5 shadow-card">
              <CheckCircle2 className="size-10 text-rosebrand-600" />
              <p className="mt-3 text-xl font-black text-ink">Pedido {confirmation.orderNumber}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{confirmation.message}</p>
            </div>
            <Button href="/meus-pedidos" className="mt-5">
              Acompanhar pedido
            </Button>
          </Panel>
        )}

        {step < 5 && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Voltar
            </Button>
            <Button type="submit" disabled={submitting}>
              {step === 4 ? "Criar pedido seguro" : "Continuar"}
            </Button>
          </div>
        )}
      </form>

      <aside className="glam-panel h-fit rounded-lg p-5">
        <h2 className="text-lg font-black text-ink">Resumo do pedido</h2>
        <div className="mt-4 grid gap-3">
          {pricing.lines.map((line) => (
            <div key={line.variantId} className="grid grid-cols-[56px_1fr_auto] gap-3">
              <Image src={line.image} alt="" width={56} height={56} className="aspect-square rounded object-cover" />
              <div>
                <p className="text-sm font-bold text-ink">{line.name}</p>
                <p className="text-xs text-neutral-500">{line.quantity}x · {line.size}</p>
              </div>
              <p className="text-sm font-black text-rosebrand-700">{formatMoney(line.subtotal)}</p>
            </div>
          ))}
        </div>
        <label className="mt-5 block text-sm font-bold text-ink">
          Cupom
          <input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3" placeholder="BARBS10" />
        </label>
        {pricing.couponMessage && <p className="mt-2 text-xs font-bold text-rosebrand-700">{pricing.couponMessage}</p>}
        <dl className="mt-5 grid gap-2 text-sm">
          <Summary label="Subtotal" value={formatMoney(pricing.subtotal)} />
          <Summary label="Descontos" value={`-${formatMoney(pricing.productDiscount + pricing.couponDiscount)}`} />
          <Summary label="Frete" value={pricing.shipping === 0 ? "Grátis" : formatMoney(pricing.shipping)} />
          <div className="mt-3 flex justify-between border-t border-rosebrand-100 pt-4 text-base font-black">
            <dt>Total</dt>
            <dd>{formatMoney(pricing.total)}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-2xl font-black text-ink">{title}</h1>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  helper,
  className,
  onBlur
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
  className?: string;
  onBlur?: () => void;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-bold text-ink">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} required={required} className="mt-2 h-11 w-full rounded-lg border border-rosebrand-200 bg-white/80 px-3 text-sm" />
      {helper && <span className="mt-1 block text-xs font-bold text-rosebrand-600">{helper}</span>}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-neutral-600">
      <dt>{label}</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  );
}
