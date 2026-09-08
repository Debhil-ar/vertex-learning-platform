import { Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  description: string;
  level: string;
  duration: string;
  moduleCount: number;
  avatarLetter: string;
  className?: string;
}

export function CourseCard({
  title,
  description,
  level,
  duration,
  moduleCount,
  avatarLetter,
  className,
}: CourseCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-sm bg-neutral-900 font-display text-lg font-bold text-white">
        {avatarLetter}
      </div>
      <h3 className="mt-4 text-heading-3 text-neutral-900">{title}</h3>
      <p className="mt-1 text-body text-neutral-500">{description}</p>
      <div className="mt-4 flex items-center gap-4 text-small text-neutral-500">
        <span>{level}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" strokeWidth={2} />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers className="size-3.5" strokeWidth={2} />
          {moduleCount} modules
        </span>
      </div>
    </div>
  );
}
