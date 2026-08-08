import Image from "next/image";
import Link from "next/link";
import { brandLogoPath } from "@/lib/brand-assets";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Barb's Closet - Inicio">
      <span
        className={`relative block shrink-0 overflow-hidden rounded-[14px] bg-transparent transition-[height,width] duration-[250ms] ease-in-out ${compact ? "h-7 w-7" : "h-11 w-11"}`}
      >
        {/* A moldura/fundo rosa vem do proprio /brand/logo.png, que tem pixels opacos nos cantos; este container nao aplica background. Envie uma logo com fundo transparente para remover totalmente esse bloco rosa. */}
        <Image
          src={brandLogoPath}
          alt="Barb's Closet"
          fill
          priority
          sizes={compact ? "28px" : "44px"}
          className="object-contain"
        />
      </span>
    </Link>
  );
}
