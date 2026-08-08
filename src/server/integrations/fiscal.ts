export type FiscalIssueInput = {
  orderNumber: string;
  customerName: string;
  customerCpf?: string;
  items: Array<{ sku: string; name: string; quantity: number; total: number }>;
  total: number;
};

export async function requestInvoiceIssue(input: FiscalIssueInput) {
  if (!process.env.FISCAL_API_KEY) {
    console.info("[fiscal:pending] Invoice issue queued", input);
    return {
      provider: process.env.FISCAL_PROVIDER ?? "pending",
      status: "PENDING",
      message: "Configure provedor fiscal, CNPJ, regime tributário, certificado e natureza da operação."
    };
  }

  throw new Error("Fiscal API key configured, but Brazilian tax rules and provider mapping must be validated before live issuance.");
}
