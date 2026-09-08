import { Circle, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "in-progress" | "completed" | "now-playing" | "locked";

const statusConfig: Record<Status, { icon: typeof Circle; label: string; className: string }> = {
  "in-progress": { icon: Circle, label: "In Progress", className: "text-primary-500" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-emerald-500" },
  "now-playing": { icon: PlayCircle, label: "Now Playing", className: "text-primary-500" },
  locked: { icon: Lock, label: "Locked", className: "text-neutral-500" },
};

interface StatusIndicatorProps {
  status: Status;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const { icon: Icon, label, className: statusClassName } = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-sm text-neutral-700",
        className,
      )}
    >
      <Icon className={cn("size-4", statusClassName)} strokeWidth={2} />
      {label}
    </span>
  );
}
