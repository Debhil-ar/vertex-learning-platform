import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-400 disabled:bg-primary-200 disabled:text-white/70 px-4",
  secondary:
    "bg-white text-primary-500 border border-primary-500 hover:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-300 px-4",
  tertiary:
    "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 disabled:text-neutral-300 px-3",
  text: "text-neutral-700 hover:text-primary-500 disabled:text-neutral-300 px-0",
};

const baseClasses =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-md font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  href?: string;
}

export function Button({
  variant = "primary",
  icon,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
      {icon}
    </button>
  );
}
