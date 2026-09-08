import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  title: string;
  description: string;
  meta: string;
  className?: string;
}

export function ResourceCard({ title, description, meta, className }: ResourceCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <FileText className="size-5 shrink-0 text-neutral-700" strokeWidth={2} />
      <div className="flex-1">
        <h3 className="text-heading-3 text-neutral-900">{title}</h3>
        <p className="mt-1 text-body text-neutral-500">{description}</p>
        <span className="mt-3 block text-small text-neutral-500">{meta}</span>
      </div>
      <ExternalLink className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
    </div>
  );
}
