import { FileText, ExternalLink, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  title: string;
  description: string;
  meta?: string;
  icon?: LucideIcon;
  href?: string;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  meta,
  icon: Icon = FileText,
  href,
  className,
}: ResourceCardProps) {
  const content = (
    <>
      <Icon className="size-5 shrink-0 text-primary-500" strokeWidth={2} />
      <div className="flex-1">
        <h3 className="text-heading-3 text-neutral-900">{title}</h3>
        <p className="mt-1 text-body text-neutral-500">{description}</p>
        {meta ? <span className="mt-3 block text-small text-neutral-500">{meta}</span> : null}
      </div>
      <ExternalLink className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
    </>
  );

  const classes = cn(
    "flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
    className,
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}
