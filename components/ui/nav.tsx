import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavProps {
  className?: string;
}

export function Nav({ className }: NavProps) {
  return (
    <nav
      className={cn(
        "flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6",
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-xs bg-primary-500 font-display text-sm font-bold text-white">
          V
        </span>
        <span className="text-heading-3 text-neutral-900">Vertex</span>
      </Link>
      <div className="flex items-center gap-6 text-body text-neutral-700">
        <Link href="/courses" className="hover:text-primary-500">
          Courses
        </Link>
        <Link href="/my-learning" className="hover:text-primary-500">
          My Learning
        </Link>
      </div>
    </nav>
  );
}
