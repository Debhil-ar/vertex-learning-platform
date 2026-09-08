import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, showLabel, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-1.5 w-full flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel ? (
        <span className="shrink-0 font-sans text-sm text-neutral-500">
          {clamped}% complete
        </span>
      ) : null}
    </div>
  );
}
