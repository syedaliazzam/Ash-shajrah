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
  footer: {
    width: 400,
    height: 240,
    className: "h-auto w-[100px] sm:w-[115px] md:w-[125px] lg:w-[150px] xl:w-[160px]",
  },
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
      alt={`${SITE.name} logo`}
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${variant === "footer" ? "object-center" : "object-left"} ${sizeClass} ${className}`}
    />
  );
}
