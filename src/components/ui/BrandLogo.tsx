import Image from "next/image";
import { SITE } from "@/lib/data";

/** Official Ash-Shajrah logo — transparent PNG */
export const LOGO_SRC = "/ash-shajrah-logo.png";

type BrandLogoProps = {
  variant?: "header" | "footer";
  className?: string;
  priority?: boolean;
};

const sizes = {
  header: { width: 200, height: 120, className: "h-14 w-auto sm:h-16 md:h-[4.25rem]" },
  footer: { width: 240, height: 144, className: "h-[5.5rem] w-auto sm:h-24" },
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
