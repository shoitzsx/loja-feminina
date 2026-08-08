"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { categories } from "@/lib/data";

export function CategoryCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const [paused, setPaused] = useState(false);

  function scrollByCard(direction: "left" | "right") {
    setPaused(true);
    scroller.current?.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "auto" });
    window.setTimeout(() => setPaused(false), 900);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!scroller.current) return;
    setPaused(true);
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: scroller.current.scrollLeft
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !scroller.current) return;
    const delta = event.clientX - drag.current.startX;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    scroller.current.scrollLeft = drag.current.scrollLeft - delta;
  }

  function endDrag() {
    drag.current.active = false;
    window.setTimeout(() => setPaused(false), 650);
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
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
      <div
        ref={scroller}
        className={`category-marquee no-scrollbar overflow-x-auto pb-2 ${paused ? "is-paused" : ""}`}
        tabIndex={0}
        aria-label="Carrossel infinito de categorias"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setPaused(true);
        }}
        onPointerLeave={() => {
          drag.current.active = false;
          setPaused(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
      >
        <div className="category-marquee__track">
          <CategoryGroup suffix="primary" />
          <CategoryGroup suffix="duplicate" ariaHidden />
        </div>
      </div>
    </section>
  );
}

function CategoryGroup({ suffix, ariaHidden = false }: { suffix: string; ariaHidden?: boolean }) {
  return (
    <div className="category-marquee__group" aria-hidden={ariaHidden}>
      {categories.map((category) => (
        <Link
          key={`${category.slug}-${suffix}`}
          href={`/categoria/${category.slug}`}
          tabIndex={ariaHidden ? -1 : undefined}
          className="group glam-hover relative h-56 w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-lg border border-rosebrand-200 bg-rosebrand-100 shadow-card sm:w-[260px]"
        >
          <Image src={category.image} alt={ariaHidden ? "" : category.description} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="280px" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-white">
            <span className="block text-lg font-black">{category.name}</span>
            <span className="mt-1 block text-xs leading-5 text-white/80">{category.description}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
