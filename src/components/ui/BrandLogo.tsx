import Image from "next/image";
import { SITE } from "@/lib/data";

/** Official Ash-Shajrah logo (white background lockup) */
export const LOGO_SRC = "/ash-shajrah-logo.png";

type BrandLogoProps = {
  variant?: "header" | "footer";
  className?: string;
  priority?: boolean;
};

const sizes = {
  header: { width: 180, height: 72, className: "h-12 w-auto sm:h-14 md:h-[3.75rem]" },
  footer: { width: 220, height: 88, className: "h-[4.5rem] w-auto sm:h-20" },
};

export function BrandLogo({
  variant = "header",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const { width, height, className: sizeClass } = sizes[variant];

  return (
    <Image
      src={LOGO_SRC}
      alt={SITE.name}
      width={width}
      height={height}
      priority={priority}
      className={`object-contain object-left ${sizeClass} ${className}`}
    />
  );
}
