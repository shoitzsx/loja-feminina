import { Star } from "lucide-react";
import { initialsOf, purchaseLabel, sampleReviews, type Review } from "@/lib/sample-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden="true" className={`size-4 ${n <= rating ? "fill-champagne text-champagne" : "text-rosebrand-200"}`} />
      ))}
    </span>
  );
}

function Avatar({ review }: { review: Review }) {
  if (review.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={review.avatarUrl} alt="" className="size-10 rounded-full object-cover" />;
  }
  return (
    <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-brand-gradient text-sm font-black text-on-accent">
      {initialsOf(review.author)}
    </span>
  );
}

/** Seção de avaliações. Hoje usa dados de exemplo (fictícios); ver src/lib/sample-reviews.ts. */
export function ProductReviews() {
  const average = sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length;

  return (
    <section className="mt-12" aria-labelledby="avaliacoes">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">Quem comprou, recomenda</p>
          <h2 id="avaliacoes" className="mt-1 text-2xl font-black text-ink">
            Avaliações
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={Math.round(average)} />
          <span className="text-sm font-bold text-ink">
            {average.toFixed(1)} · {sampleReviews.length} avaliações
          </span>
        </div>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {sampleReviews.map((review) => (
          <li key={review.id} className="glam-panel rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Avatar review={review} />
              <div>
                <p className="font-black text-ink">{review.author}</p>
                <p className="text-xs text-muted">{purchaseLabel(review.purchasedAt)}</p>
              </div>
            </div>
            <div className="mt-3">
              <Stars rating={review.rating} />
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/80">{review.comment}</p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted">Avaliações de exemplo, só para mostrar como vai ficar. As verdadeiras aparecem quando a loja abrir as avaliações dos clientes.</p>
    </section>
  );
}
