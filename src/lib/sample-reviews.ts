/**
 * AVALIAÇÕES DE EXEMPLO (fictícias), só para mostrar o layout enquanto o banco não existe.
 * Quando houver banco e login reais, remover este arquivo e ler as avaliações verdadeiras.
 */
export type Review = {
  id: string;
  author: string;
  /** Foto de perfil, quando a cliente tiver uma. Sem foto, mostra as iniciais. */
  avatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  /** Mês e ano da compra, formato "AAAA-MM". */
  purchasedAt: string;
};

export const sampleReviews: Review[] = [
  { id: "r1", author: "Mariana S.", rating: 5, comment: "Chegou lindo e bem embalado. O acabamento é muito melhor do que eu esperava.", purchasedAt: "2026-10" },
  { id: "r2", author: "Camila R.", rating: 4, comment: "Combinou com vários looks. Só achei o brilho um pouco mais discreto que na foto, mas gostei bastante.", purchasedAt: "2026-09" },
  { id: "r3", author: "Fernanda L.", rating: 5, comment: "Amei! Já pedi outro para dar de presente.", purchasedAt: "2026-09" }
];

export function initialsOf(name: string): string {
  const parts = name.replace(/\./g, "").trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function purchaseLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `Comprou em ${MONTHS[month - 1]}/${year}`;
}
