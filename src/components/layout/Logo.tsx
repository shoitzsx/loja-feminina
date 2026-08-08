import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="Barb's Closet - Início">
      <Image
        src="/brand/logo.svg"
        alt="Barb's Closet"
        width={compact ? 150 : 190}
        height={compact ? 45 : 58}
        priority
        className="h-auto w-[150px] sm:w-[190px]"
      />
    </Link>
  );
}
