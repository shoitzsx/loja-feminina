"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { categories } from "@/lib/data";

export function CategoryCarousel() {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: "left" | "right") {
    scroller.current?.scrollBy({ left: direction === "left" ? -260 : 260, behavior: "smooth" });
  }

  return (
    <section className="container-shell animate-rise-in py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-rosebrand-600">Compre por categoria</p>
          <h2 className="mt-1 text-2xl font-black text-ink">Escolhas queridinhas</h2>
        </div>
        <div className="flex gap-2">
          <button className="grid size-10 place-items-center rounded-lg border border-rosebrand-200 bg-rosebrand-50/90 shadow-card transition hover:-translate-y-0.5 hover:bg-rosebrand-100" onClick={() => scrollByCard("left")} aria-label="Categorias anteriores">
            <ChevronLeft className="size-5" />
          </button>
          <button className="grid size-10 place-items-center rounded-lg border border-rosebrand-200 bg-rosebrand-50/90 shadow-card transition hover:-translate-y-0.5 hover:bg-rosebrand-100" onClick={() => scrollByCard("right")} aria-label="Próximas categorias">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2" tabIndex={0} aria-label="Carrossel de categorias">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="group glam-hover relative h-56 w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-lg border border-rosebrand-200 bg-rosebrand-100 shadow-card sm:w-[260px]"
          >
            <Image src={category.image} alt={category.description} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="280px" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-white">
              <span className="block text-lg font-black">{category.name}</span>
              <span className="mt-1 block text-xs leading-5 text-white/80">{category.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
