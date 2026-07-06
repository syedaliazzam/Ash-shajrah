"use client";

import { ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "light";

interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald text-cream hover:bg-emerald-light shadow-lg shadow-emerald/25 hover:shadow-emerald/40",
  secondary:
    "bg-gold text-emerald-deep hover:bg-gold-soft shadow-lg shadow-gold/25 hover:shadow-gold/40",
  outline:
    "border-2 border-emerald/30 bg-white/50 text-emerald hover:border-emerald hover:bg-white/80",
  light:
    "border-2 border-cream/35 bg-white/10 text-cream backdrop-blur-sm hover:border-cream/60 hover:bg-white/20",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  ...rest
}: ButtonProps) {
  const classes = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${variants[variant]} ${className}`;

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} className={classes} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} {...(rest as any)}>
      {children}
    </button>
  );
}
