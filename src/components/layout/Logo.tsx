import Image from "next/image";
import Link from "next/link";
import { brandLogoPath } from "@/lib/brand-assets";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Barb's Closet - Inicio">
      <span
        className={`relative block shrink-0 ${compact ? "h-11 w-11 sm:h-12 sm:w-12" : "h-14 w-14 sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]"}`}
      >
        {/* Causa da moldura rosa: o PNG oficial atual tem fundo opaco embutido; este wrapper nao aplica background, borda, radius nem padding. */}
        <Image
          src={brandLogoPath}
          alt="Barb's Closet"
          fill
          priority
          sizes={compact ? "48px" : "72px"}
          className="object-contain"
        />
      </span>
    </Link>
  );
}
