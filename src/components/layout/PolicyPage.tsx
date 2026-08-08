import { PageHeader } from "./PageHeader";

export function PolicyPage({ title, sections }: { title: string; sections: Array<[string, string]> }) {
  return (
    <>
      <PageHeader title={title} subtitle="Documento base para adequação LGPD. Revise com assessoria jurídica antes da publicação definitiva." />
      <section className="container-shell grid gap-4 py-8">
        {sections.map(([heading, text]) => (
          <article key={heading} className="glam-panel glam-hover rounded-lg p-5">
            <h2 className="text-lg font-black text-ink">{heading}</h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600">{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
