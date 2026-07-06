"use client";

import * as React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "light";

type BaseButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonAsButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLinkProps = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

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
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, target, rel, ...anchorProps } = props as ButtonAsLinkProps;

    const isExternal =
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { href, ...buttonProps } = props as ButtonAsButtonProps;

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
