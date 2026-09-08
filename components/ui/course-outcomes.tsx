import {
  Activity,
  BarChart3,
  Box,
  Brain,
  CheckCircle2,
  Clock,
  Cloud,
  Code,
  Database,
  FunctionSquare,
  Gauge,
  Grid3x3,
  Layers,
  Layout,
  Link2,
  Lock,
  MessageSquare,
  Navigation,
  Puzzle,
  Route,
  Search,
  Server,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Table,
  TrendingUp,
  Wrench,
  Upload,
  type LucideIcon,
} from "lucide-react";

// `outcome.icon` is a free-text keyword authored in Sanity, not a closed
// enum — this maps the vocabulary seeded so far and falls back to a
// generic icon for anything else an author types.
const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  box: Box,
  brain: Brain,
  "check-circle": CheckCircle2,
  chart: BarChart3,
  clock: Clock,
  cloud: Cloud,
  code: Code,
  database: Database,
  function: FunctionSquare,
  gauge: Gauge,
  grid: Grid3x3,
  layers: Layers,
  layout: Layout,
  link: Link2,
  lock: Lock,
  "message-square": MessageSquare,
  navigation: Navigation,
  puzzle: Puzzle,
  route: Route,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  smartphone: Smartphone,
  table: Table,
  tool: Wrench,
  "trending-up": TrendingUp,
  upload: Upload,
};

interface Outcome {
  icon: string;
  title: string;
  description: string | null;
}

export function CourseOutcomes({ outcomes }: { outcomes: Outcome[] }) {
  if (outcomes.length === 0) return null;

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-8">
      <h2 className="font-display text-heading-1 text-neutral-900">What you&apos;ll learn</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {outcomes.map((outcome) => {
          const Icon = iconMap[outcome.icon] ?? Sparkles;
          return (
            <div
              key={outcome.title}
              className="rounded-md border border-neutral-200 p-5"
            >
              <Icon className="size-7 text-primary-500" strokeWidth={1.5} />
              <h3 className="mt-3 text-heading-3 text-neutral-900">{outcome.title}</h3>
              {outcome.description ? (
                <p className="mt-1 text-body text-neutral-500">{outcome.description}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
