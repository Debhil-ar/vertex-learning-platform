import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "video" | "lesson" | "popular";

const variantClasses: Record<BadgeVariant, string> = {
  video: "bg-neutral-900 text-white",
  lesson: "bg-primary-100 text-primary-500",
  popular: "bg-primary-500 text-white",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 font-sans text-xs font-medium uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
