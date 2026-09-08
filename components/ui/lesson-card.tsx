import { Play, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  kind: "video" | "lesson";
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  className?: string;
}

export function LessonCard({
  kind,
  title,
  description,
  meta,
  actionLabel,
  className,
}: LessonCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <Badge variant={kind}>{kind}</Badge>
      <h3 className="mt-3 text-heading-3 text-neutral-900">{title}</h3>
      <p className="mt-1 text-body text-neutral-500">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-small text-neutral-500">{meta}</span>
        {kind === "video" ? (
          <Button variant="text" icon={<Play className="size-4" strokeWidth={2} />}>
            {actionLabel}
          </Button>
        ) : (
          <Button variant="tertiary" icon={<ExternalLink className="size-4" strokeWidth={2} />}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
