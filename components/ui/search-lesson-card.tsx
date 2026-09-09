import { CheckCircle2, ExternalLink, FileText, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchResultCard } from "@/lib/search";

interface SearchLessonCardProps {
  result: SearchResultCard;
  className?: string;
}

export function SearchLessonCard({ result, className }: SearchLessonCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row",
        className,
      )}
    >
      {result.keyPoints.length > 0 ? (
        <div className="flex w-full shrink-0 flex-col justify-between rounded-sm bg-neutral-50 p-4 sm:w-56">
          <div>
            <FileText className="size-4 text-neutral-500" strokeWidth={2} />
            <ul className="mt-3 flex flex-col gap-2">
              {result.keyPoints.map((point) => (
                <li key={point} className="text-small text-neutral-700">
                  • {point}
                </li>
              ))}
            </ul>
          </div>
          <CheckCircle2 className="mt-3 size-5 self-end text-neutral-400" strokeWidth={2} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-xs font-display text-xs font-bold text-white",
                result.avatarBg,
              )}
            >
              {result.avatarLetter}
            </span>
            <span className="text-small text-neutral-500">{result.courseTitle}</span>
          </div>
          <Badge variant="lesson">Lesson</Badge>
        </div>

        <h3 className="mt-3 text-heading-3 text-neutral-900">{result.title}</h3>
        {result.description ? (
          <p className="mt-1 text-body text-neutral-500">{result.description}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {result.moduleLabel ? (
            <span className="inline-flex items-center gap-1 text-small text-neutral-500">
              <Layers className="size-3.5" strokeWidth={2} />
              {result.moduleLabel}
            </span>
          ) : (
            <span />
          )}
          <Button
            variant="tertiary"
            href={`/lessons/${result.slug}`}
            icon={<ExternalLink className="size-4" strokeWidth={2} />}
          >
            View lesson
          </Button>
        </div>
      </div>
    </div>
  );
}
