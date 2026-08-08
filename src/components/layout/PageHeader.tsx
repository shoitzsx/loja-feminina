export function PageHeader({ eyebrow = "Barb’s Closet", title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="border-b border-rosebrand-200 bg-rosebrand-100/70">
      <div className="container-shell animate-rise-in py-8">
        <p className="text-xs font-black uppercase text-rosebrand-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{subtitle}</p>}
      </div>
    </header>
  );
}
