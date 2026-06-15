import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "light";

interface ButtonProps {
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
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
