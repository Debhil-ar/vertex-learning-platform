import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavProps {
  className?: string;
  current?: "courses" | "my-learning";
}

export function Nav({ className, current }: NavProps) {
  return (
    <nav
      className={cn(
        "flex h-16 items-center border-b border-neutral-200 bg-white px-4 sm:px-6",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-xs bg-primary-500 font-display text-sm font-bold text-white">
            V
          </span>
          <span className="text-heading-3 text-neutral-900">Vertex</span>
        </Link>
        <div className="flex items-center gap-3 whitespace-nowrap text-body text-neutral-700 sm:gap-6">
          <Link
            href="/courses"
            className={cn(
              "hover:text-primary-500",
              current === "courses" && "text-primary-500",
            )}
          >
            Courses
          </Link>
          <Link
            href="/my-learning"
            className={cn(
              "hover:text-primary-500",
              current === "my-learning" && "text-primary-500",
            )}
          >
            My Learning
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="text-neutral-700 hover:text-primary-500"
          >
            <Bell className="size-5" strokeWidth={2} />
          </button>
          <Image
            src="/avatar-placeholder.svg"
            alt="Your account"
            width={36}
            height={36}
            className="size-9 rounded-full"
          />
        </div>
      </div>
    </nav>
  );
}
