import Image from "next/image";
import Link from "next/link";
import { brandLogoPath } from "@/lib/brand-assets";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Barb's Closet - Inicio">
      <span className={`relative block ${compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-20 sm:h-20 sm:w-24"}`}>
        <Image
          src={brandLogoPath}
          alt="Barb's Closet"
          fill
          priority
          sizes={compact ? "64px" : "96px"}
          className="object-contain drop-shadow-[0_8px_16px_rgba(247,37,133,0.18)]"
        />
      </span>
    </Link>
  );
}
