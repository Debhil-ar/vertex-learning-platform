import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = string | { label: string; href?: string };

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-body text-neutral-500", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? undefined : item.href;
        return (
          <span key={label} className="flex items-center gap-2">
            {href && !isLast ? (
              <Link href={href} className="hover:text-neutral-900">
                {label}
              </Link>
            ) : (
              <span className={isLast ? "text-neutral-900" : undefined}>{label}</span>
            )}
            {!isLast ? <ChevronRight className="size-3.5" strokeWidth={2} /> : null}
          </span>
        );
      })}
    </nav>
  );
}
