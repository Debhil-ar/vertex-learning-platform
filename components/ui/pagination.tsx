import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function Pagination({ currentPage, totalPages, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        disabled={currentPage === 1}
        className="flex size-9 items-center justify-center rounded-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cn(
            "flex size-9 items-center justify-center rounded-sm text-body",
            page === currentPage
              ? "border border-primary-500 text-primary-500"
              : "text-neutral-700 hover:bg-neutral-100",
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        className="flex size-9 items-center justify-center rounded-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>
    </nav>
  );
}
