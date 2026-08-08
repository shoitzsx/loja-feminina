export type CepAddress = {
  zipCode: string;
  street: string;
  district: string;
  city: string;
  state: string;
};

export async function lookupCep(zipCode: string): Promise<CepAddress | null> {
  const normalized = zipCode.replace(/\D/g, "");
  if (normalized.length !== 8) return null;

  if (process.env.CEP_PROVIDER === "viacep") {
    const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`, {
      next: { revalidate: 60 * 60 * 24 * 7 }
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string; cep?: string };
    if (data.erro) return null;
    return {
      zipCode: data.cep ?? normalized,
      street: data.logradouro ?? "",
      district: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? ""
    };
  }

  return null;
}
