import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  items: string[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-body text-neutral-500", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item} className="flex items-center gap-2">
            <span className={isLast ? "text-neutral-900" : undefined}>{item}</span>
            {!isLast ? <ChevronRight className="size-3.5" strokeWidth={2} /> : null}
          </span>
        );
      })}
    </nav>
  );
}
