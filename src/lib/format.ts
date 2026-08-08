export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function installmentText(value: number, maxInstallments = 6) {
  const installment = value / maxInstallments;
  return `${maxInstallments}x de ${formatMoney(installment)} sem juros`;
}

export function discountPercent(price: number, salePrice?: number) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
