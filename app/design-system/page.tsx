import {
  Bell,
  Search,
  Play,
  FileText,
  Bookmark,
  BarChart2,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CourseCard } from "@/components/ui/course-card";
import { LessonCard } from "@/components/ui/lesson-card";
import { ResourceCard } from "@/components/ui/resource-card";
import { Nav } from "@/components/ui/nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-small font-medium text-primary-500">{number}</span>
        <h2 className="text-small font-medium uppercase tracking-wide text-neutral-500">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div>
      <div
        className="h-16 w-full rounded-sm border border-neutral-100"
        style={{ backgroundColor: hex }}
      />
      <p className="mt-2 text-body text-neutral-900">{name}</p>
      <p className="text-small text-neutral-500">{hex}</p>
    </div>
  );
}

const outlineIcons = [Bell, Search, Play, FileText, Bookmark, BarChart2, Clock, User];

export default function DesignSystemPage() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Nav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div>
          <p className="text-small font-medium uppercase tracking-wide text-primary-500">
            Design System
          </p>
          <h1 className="mt-1 text-display-2 font-display text-neutral-900">
            Vertex Design System
          </h1>
          <p className="mt-2 max-w-2xl text-body-lg text-neutral-500">
            A unified design language for the Vertex learning platform. Clean, modern and
            focused on clarity, consistency and intuitive learning experiences.
          </p>
        </div>

        <Section number="01" title="Colors">
          <div>
            <p className="mb-3 text-body font-medium text-neutral-700">Primary</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Swatch name="Primary 500" hex="#F97316" />
              <Swatch name="Primary 400" hex="#FB923C" />
              <Swatch name="Primary 300" hex="#FDBA74" />
              <Swatch name="Primary 200" hex="#FED7AA" />
              <Swatch name="Primary 100" hex="#FFEEE5" />
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-body font-medium text-neutral-700">Neutral</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              <Swatch name="Neutral 900" hex="#0F172A" />
              <Swatch name="Neutral 700" hex="#334155" />
              <Swatch name="Neutral 500" hex="#64748B" />
              <Swatch name="Neutral 300" hex="#CBD5E1" />
              <Swatch name="Neutral 200" hex="#E2E8F0" />
              <Swatch name="Neutral 100" hex="#F1F5F9" />
              <Swatch name="Neutral 50" hex="#FAFAFC" />
              <Swatch name="White" hex="#FFFFFF" />
            </div>
          </div>
        </Section>

        <Section number="02" title="Typography">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-display text-4xl font-bold text-neutral-900">Ag</p>
              <p className="mt-2 text-body font-medium text-neutral-900">Playfair Display</p>
              <p className="text-small text-neutral-500">Elegant · Readable · Timeless</p>
            </div>
            <div>
              <p className="font-sans text-4xl font-bold text-neutral-900">Ag</p>
              <p className="mt-2 text-body font-medium text-neutral-900">Inter</p>
              <p className="text-small text-neutral-500">Clean · Modern · Highly legible</p>
            </div>
          </div>
        </Section>

        <Section number="03" title="Type Scale">
          <div className="flex flex-col gap-4">
            <p className="text-display-1 font-display text-neutral-900">Display 1</p>
            <p className="text-display-2 font-display text-neutral-900">Display 2</p>
            <p className="text-heading-1 text-neutral-900">Heading 1</p>
            <p className="text-heading-2 text-neutral-900">Heading 2</p>
            <p className="text-heading-3 text-neutral-900">Heading 3</p>
            <p className="text-body-lg text-neutral-900">Body Large</p>
            <p className="text-body text-neutral-900">Body</p>
            <p className="text-small text-neutral-900">Small</p>
          </div>
        </Section>

        <Section number="04" title="Spacing System">
          <div className="flex items-end gap-4">
            {[4, 8, 12, 16, 24, 32, 40, 48, 64].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <div
                  className="rounded-xs bg-primary-100"
                  style={{ width: size, height: size }}
                />
                <span className="text-small text-neutral-500">{size}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section number="05" title="Radius &amp; Shadows">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-4">
              {[
                ["xs", "rounded-xs"],
                ["sm", "rounded-sm"],
                ["md", "rounded-md"],
                ["lg", "rounded-lg"],
                ["xl", "rounded-xl"],
                ["full", "rounded-full"],
              ].map(([label, cls]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`size-12 border border-neutral-200 bg-neutral-100 ${cls}`} />
                  <span className="text-small text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {[
                ["sm", "shadow-sm"],
                ["md", "shadow-md"],
                ["lg", "shadow-lg"],
                ["xl", "shadow-xl"],
              ].map(([label, cls]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`size-12 rounded-sm bg-white ${cls}`} />
                  <span className="text-small text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section number="06" title="Icons">
          <div className="flex flex-wrap gap-6">
            {outlineIcons.map((Icon, i) => (
              <Icon key={i} className="size-6 text-neutral-700" strokeWidth={2} />
            ))}
          </div>
        </Section>

        <Section number="07" title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Get Started</Button>
            <Button variant="secondary" icon={<ExternalLink className="size-4" strokeWidth={2} />}>
              Explore Courses
            </Button>
            <Button variant="tertiary" icon={<ExternalLink className="size-4" strokeWidth={2} />}>
              View Lesson
            </Button>
            <Button variant="text" icon={<Play className="size-4" strokeWidth={2} />}>
              Watch Video
            </Button>
            <Button variant="primary" disabled>
              Get Started
            </Button>
          </div>
        </Section>

        <Section number="08" title="Inputs">
          <div className="flex max-w-md flex-col gap-4">
            <SearchInput placeholder="Search anything..." shortcut="⌘K" />
            <Select defaultValue="relevant">
              <option value="relevant">Most Relevant</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </Select>
          </div>
        </Section>

        <Section number="09" title="Badges / Tags">
          <div className="flex gap-3">
            <Badge variant="video">Video</Badge>
            <Badge variant="lesson">Lesson</Badge>
            <Badge variant="popular">Popular</Badge>
          </div>
        </Section>

        <Section number="10" title="Status / Indicators">
          <div className="flex flex-wrap gap-6">
            <StatusIndicator status="in-progress" />
            <StatusIndicator status="completed" />
            <StatusIndicator status="now-playing" />
            <StatusIndicator status="locked" />
          </div>
        </Section>

        <Section number="11" title="Progress Bar">
          <ProgressBar value={35} showLabel className="max-w-md" />
        </Section>

        <Section number="12" title="Cards">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CourseCard
              avatarLetter="N"
              title="Next.js for Production"
              description="Build scalable, high-performance web applications with Next.js."
              level="Intermediate"
              duration="18h 24m"
              moduleCount={12}
            />
            <LessonCard
              kind="video"
              title="Data Fetching in Server Components"
              description="Learn how to fetch data on the server using async/await and Next.js best practices."
              meta="Lesson 5.1 · 12:45"
              actionLabel="Watch from 12:45"
            />
            <LessonCard
              kind="lesson"
              title="Data Fetching & Caching"
              description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
              meta="Module 5"
              actionLabel="View lesson"
            />
            <ResourceCard
              title="Caching and Revalidation Guide"
              description="Deep dive into Next.js caching strategies."
              meta="PDF · 1.2 MB"
            />
          </div>
        </Section>

        <Section number="13" title="Navigation">
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={["All Courses", "Next.js for Production", "Data Fetching & Caching"]} />
            <Pagination currentPage={1} totalPages={8} />
          </div>
        </Section>
      </main>
    </div>
  );
}
