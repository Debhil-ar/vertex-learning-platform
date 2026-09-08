import { type ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = ComponentPropsWithoutRef<"select">;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white px-4 pr-10 font-sans text-sm text-neutral-900 focus:border-primary-400 focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
        strokeWidth={2}
      />
    </div>
  );
}
