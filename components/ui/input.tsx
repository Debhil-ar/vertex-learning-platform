import { type ComponentPropsWithoutRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends ComponentPropsWithoutRef<"input"> {
  shortcut?: string;
}

export function SearchInput({ className, shortcut, ...props }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 focus-within:border-primary-400",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
      <input
        type="text"
        className="h-full w-full font-sans text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        {...props}
      />
      {shortcut ? (
        <kbd className="shrink-0 font-sans text-xs text-neutral-500">{shortcut}</kbd>
      ) : null}
    </div>
  );
}
