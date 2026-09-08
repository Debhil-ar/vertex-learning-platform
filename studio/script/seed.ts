/**
 * One-time offline seed script for sample content (categories, instructors,
 * courses, modules, lessons). Run with `npm run seed` from `studio/`.
 *
 * Uses deterministic `_id`s + `createOrReplace` so re-running converges
 * instead of duplicating content. Never run from the Next.js app.
 */
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { createClient, type SanityClient } from '@sanity/client'
import dotenv from 'dotenv'

// studio/.env has the project id/dataset; the write token lives in the repo
// root .env.local (kept out of the Studio workspace since it's app-wide).
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET in studio/.env')
  process.exit(1)
}
if (!token) {
  console.error(
    'Missing SANITY_API_WRITE_TOKEN in .env.local. Add an Editor-scope token from ' +
      'manage.sanity.io -> your project -> API -> Tokens before running the seed script.',
  )
  process.exit(1)
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-09-08',
  useCdn: false,
})

const key = () => randomBytes(6).toString('hex')

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function portableText(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block' as const,
    _key: key(),
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: key(), text, marks: [] }],
  }))
}

function placeholderSvg(title: string, color: string): Buffer {
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
  <rect width="800" height="450" fill="${color}"/>
  <text x="40" y="225" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff" dominant-baseline="middle">${escaped}</text>
</svg>`
  return Buffer.from(svg, 'utf-8')
}

const assetCache = new Map<string, string>()

async function uploadPlaceholderImage(title: string, color: string): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  const cacheKey = `${title}|${color}`
  let assetId = assetCache.get(cacheKey)
  if (!assetId) {
    const svg = placeholderSvg(title, color)
    const asset = await client.assets.upload('image', svg, {
      filename: `${slugify(title)}.svg`,
      contentType: 'image/svg+xml',
    })
    assetId = asset._id
    assetCache.set(cacheKey, assetId)
  }
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
}

// ---------------------------------------------------------------------------
// Content data
// ---------------------------------------------------------------------------

const categories = [
  { slug: 'programming-fundamentals', title: 'Programming Fundamentals', description: 'Core language skills every developer builds on: syntax, types, and control flow.' },
  { slug: 'web-development', title: 'Web Development', description: 'Building modern, production-grade web applications end to end.' },
  { slug: 'data-science', title: 'Data Science', description: 'Working with data: storing it, querying it, and analyzing it at scale.' },
  { slug: 'ai-machine-learning', title: 'AI & Machine Learning', description: 'Machine learning foundations and applied large language model development.' },
  { slug: 'devops-cloud', title: 'DevOps & Cloud', description: 'Packaging, deploying, and operating software reliably in production.' },
  { slug: 'mobile-development', title: 'Mobile Development', description: 'Building native-feeling mobile apps with modern cross-platform tooling.' },
] as const

const instructors = [
  { slug: 'maya-chen', name: 'Maya Chen', expertise: ['JavaScript', 'TypeScript', 'Frontend'], bio: 'Maya has spent a decade building and teaching JavaScript, from vanilla DOM work to modern typed codebases. She previously led frontend platform teams at two Series B startups.' },
  { slug: 'daniel-okafor', name: 'Daniel Okafor', expertise: ['React', 'Next.js', 'Node.js'], bio: 'Daniel is a full-stack engineer who has shipped React and Node.js applications at scale, and now focuses on teaching pragmatic, production-ready patterns.' },
  { slug: 'priya-raman', name: 'Priya Raman', expertise: ['SQL', 'Python', 'Data Engineering'], bio: 'Priya is a data engineer who has designed schemas and pipelines for high-growth products, and enjoys demystifying databases and data analysis for newcomers.' },
  { slug: 'ethan-brooks', name: 'Ethan Brooks', expertise: ['Machine Learning', 'LLMs', 'Python'], bio: 'Ethan is an applied ML engineer who has built recommendation systems and, more recently, production LLM applications. He teaches ML from first principles.' },
  { slug: 'sofia-martinez', name: 'Sofia Martinez', expertise: ['Docker', 'Kubernetes', 'Cloud Infrastructure'], bio: 'Sofia is a platform engineer who has run containerized infrastructure at scale and now teaches DevOps practices to application developers.' },
  { slug: 'liam-turner', name: 'Liam Turner', expertise: ['React Native', 'Mobile', 'JavaScript'], bio: 'Liam has shipped several cross-platform mobile apps with React Native and focuses on teaching the patterns that make mobile apps feel native.' },
] as const

type LessonSeed = {
  title: string
  duration: string
  freePreview?: boolean
  keyPoints: string[]
  notes: string[]
  proTip?: string
  resourceTitle: string
  resourceDescription: string
}

type ModuleSeed = {
  title: string
  summary: string
  lessons: LessonSeed[]
}

type CourseSeed = {
  slug: string
  title: string
  summary: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  popular?: boolean
  studentCount: number
  categorySlug: (typeof categories)[number]['slug']
  instructorSlug: (typeof instructors)[number]['slug']
  color: string
  videoUrl: string
  outcomes: { icon: string; title: string; description: string }[]
  modules: ModuleSeed[]
}

const courses: CourseSeed[] = [
  {
    slug: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    summary: 'A ground-up course in JavaScript: syntax, types, functions, scope, and the async model that powers the modern web.',
    level: 'beginner',
    price: 49,
    popular: true,
    studentCount: 18420,
    categorySlug: 'programming-fundamentals',
    instructorSlug: 'maya-chen',
    color: '#F59E0B',
    videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    outcomes: [
      { icon: 'code', title: 'Core syntax and types', description: 'Read and write idiomatic JavaScript using its core types and operators.' },
      { icon: 'function', title: 'Functions and scope', description: 'Understand closures, scope, and the `this` keyword with confidence.' },
      { icon: 'clock', title: 'Asynchronous JavaScript', description: 'Work with callbacks, promises, and async/await to handle async work cleanly.' },
    ],
    modules: [
      {
        title: 'Syntax & Types',
        summary: 'The building blocks of the language: variables, primitive types, and operators.',
        lessons: [
          { title: 'Variables, let, const, and var', duration: '11:20', freePreview: true, keyPoints: ['Block vs function scope', 'Why const is the default', 'Hoisting behavior'], notes: ['JavaScript gives you three ways to declare a variable, and they behave differently enough that the choice matters. `let` and `const` are block-scoped, meaning they only exist inside the `{ }` they were declared in, while `var` is function-scoped and can leak in surprising ways.', 'Prefer `const` by default and reach for `let` only when a binding genuinely needs to be reassigned. This makes code easier to reason about, since a reader can trust that a `const` value never changes identity.'], proTip: 'Turn on a linter rule that bans `var` entirely — it removes an entire category of scoping bugs.', resourceTitle: 'Variable declarations reference', resourceDescription: 'A quick-reference comparison of let, const, and var.' },
          { title: 'Primitive types and type coercion', duration: '14:05', keyPoints: ['The seven primitive types', 'Truthy and falsy values', 'Common coercion pitfalls'], notes: ['JavaScript has seven primitive types: string, number, boolean, null, undefined, symbol, and bigint. Everything else — arrays, objects, functions — is an object under the hood.', 'Because JavaScript is loosely typed, values get coerced automatically in comparisons and arithmetic. Knowing the rules for `==` versus `===`, and which values are falsy, prevents a whole class of subtle bugs.'], resourceTitle: 'Type coercion cheat sheet', resourceDescription: 'A table of common coercion outcomes worth memorizing.' },
          { title: 'Operators and control flow', duration: '12:40', keyPoints: ['Comparison and logical operators', 'if/else and switch', 'Ternary and short-circuit patterns'], notes: ['Control flow in JavaScript will look familiar if you know any C-family language: `if`/`else`, `switch`, and the ternary operator all work as expected.', 'Logical operators like `&&` and `||` do more than boolean logic — they return one of their operands, which is why patterns like `value || defaultValue` and `condition && doSomething()` are so common in real codebases.'], resourceTitle: 'Control flow patterns', resourceDescription: 'Idiomatic patterns for conditionals used throughout the course.' },
        ],
      },
      {
        title: 'Functions & Scope',
        summary: 'How functions, closures, and `this` actually work under the hood.',
        lessons: [
          { title: 'Function declarations vs expressions vs arrows', duration: '13:15', keyPoints: ['Hoisting differences', 'Arrow functions and lexical this', 'When to choose each form'], notes: ['Function declarations are hoisted in full, so you can call them before their definition appears in the file. Function expressions and arrow functions are not — they follow normal variable hoisting rules.', 'Arrow functions don\'t bind their own `this`, `arguments`, or `super` — they inherit them from the enclosing scope. That makes them a natural fit for callbacks where you want `this` to stay tied to the surrounding context.'], resourceTitle: 'Function syntax comparison', resourceDescription: 'Side-by-side syntax and hoisting behavior for each function form.' },
          { title: 'Closures in practice', duration: '15:30', keyPoints: ['What a closure actually captures', 'Private state with closures', 'Common closure bugs in loops'], notes: ['A closure is just a function that remembers the variables from the scope it was created in, even after that outer function has returned. This is how you build private state without classes.', 'The classic gotcha is capturing a loop variable declared with `var` inside a closure created per iteration — every closure ends up sharing the same variable. Switching to `let`, which creates a new binding per iteration, fixes it.'], proTip: 'If a closure bug shows up, ask what variable it\'s actually capturing, not what value you expected.', resourceTitle: 'Closures deep dive', resourceDescription: 'Extra worked examples of closures used for memoization and private state.' },
          { title: 'Understanding this and binding', duration: '16:10', keyPoints: ['How this is determined at call time', 'call, apply, and bind', 'this in classes and event handlers'], notes: ['Unlike lexically scoped variables, `this` is determined by how a function is called, not where it\'s defined. A plain function call, a method call, and a call via `.call()`/`.apply()` all set `this` differently.', '`.bind()` returns a new function with `this` permanently fixed, which is why it shows up so often when passing class methods as callbacks.'], resourceTitle: 'this binding rules', resourceDescription: 'A decision tree for figuring out what this refers to in any call.' },
        ],
      },
      {
        title: 'Async & the Event Loop',
        summary: 'Callbacks, promises, async/await, and how the event loop ties it all together.',
        lessons: [
          { title: 'The event loop and the call stack', duration: '14:50', keyPoints: ['Call stack vs task queue', 'Why setTimeout(fn, 0) still waits', 'Microtasks vs macrotasks'], notes: ['JavaScript is single-threaded, but it feels concurrent because of the event loop: the call stack runs synchronous code to completion, then the loop pulls queued callbacks off the task queue.', 'Promises resolve via the microtask queue, which is drained before the next macrotask (like a `setTimeout` callback) runs. That ordering explains a lot of async behavior that looks surprising at first.'], resourceTitle: 'Event loop visualized', resourceDescription: 'A walkthrough of call stack and queue ordering with real examples.' },
          { title: 'Promises from the ground up', duration: '17:00', keyPoints: ['Creating and chaining promises', 'Error handling with .catch', 'Promise.all and Promise.race'], notes: ['A promise represents a value that may not exist yet. It has three states — pending, fulfilled, rejected — and once settled, it never changes state again.', '`.then()` chains let you compose async steps without nesting callbacks, and `.catch()` catches any rejection from earlier in the chain, not just the immediately preceding step.'], resourceTitle: 'Promise combinators reference', resourceDescription: 'When to use Promise.all vs allSettled vs race.' },
          { title: 'Async/await in real code', duration: '13:45', keyPoints: ['Async/await as promise sugar', 'try/catch for async errors', 'Sequential vs parallel awaits'], notes: ['`async`/`await` is syntax sugar over promises: an `async` function always returns a promise, and `await` pauses execution until that promise settles.', 'A common mistake is awaiting independent promises one at a time, which serializes work that could run in parallel. Kick off the promises first, then await them together with `Promise.all`.'], proTip: 'If two awaited calls don\'t depend on each other, start both before awaiting either.', resourceTitle: 'Async/await patterns', resourceDescription: 'Common patterns and anti-patterns for async/await in real apps.' },
        ],
      },
    ],
  },
  {
    slug: 'typescript-for-application-developers',
    title: 'TypeScript for Application Developers',
    summary: 'Add static types to real applications: the type system, generics, and how to type React and Node code confidently.',
    level: 'intermediate',
    price: 59,
    studentCount: 9310,
    categorySlug: 'programming-fundamentals',
    instructorSlug: 'maya-chen',
    color: '#3B82F6',
    videoUrl: 'https://www.youtube.com/watch?v=gieEQFIfgYc',
    outcomes: [
      { icon: 'shield', title: 'A safer type system', description: 'Model real data shapes with interfaces, unions, and generics.' },
      { icon: 'puzzle', title: 'Typing real apps', description: 'Apply TypeScript to React components and Node APIs.' },
      { icon: 'settings', title: 'Compiler configuration', description: 'Configure tsconfig for strict, productive type checking.' },
    ],
    modules: [
      {
        title: 'The Type System',
        summary: 'Core types, interfaces, and how TypeScript infers and narrows types.',
        lessons: [
          { title: 'Basic types and type inference', duration: '10:50', freePreview: true, keyPoints: ['Primitive and array types', 'When to annotate vs let inference work', 'The any and unknown escape hatches'], notes: ['TypeScript infers types wherever it can, so you rarely need to annotate a simple `const count = 0`. Annotate function parameters and return types, since those are the boundaries where inference can\'t see the caller\'s intent.', '`any` disables type checking entirely for a value, while `unknown` still forces you to narrow before use — prefer `unknown` whenever a value\'s type is genuinely unclear.'], resourceTitle: 'Type inference rules', resourceDescription: 'Where TypeScript infers types automatically, and where it needs help.' },
          { title: 'Interfaces and type aliases', duration: '12:15', keyPoints: ['Interface vs type syntax', 'Extending and composing shapes', 'Optional and readonly properties'], notes: ['Interfaces and type aliases both describe object shapes, and for most everyday use they\'re interchangeable. Interfaces support declaration merging and are the more common choice for public object shapes.', 'Optional properties (`age?: number`) and `readonly` modifiers let you express exactly which fields are required and which can\'t be reassigned after creation.'], resourceTitle: 'Interfaces vs type aliases', resourceDescription: 'A practical guide to picking one over the other.' },
          { title: 'Union and literal types', duration: '11:35', keyPoints: ['Modeling a fixed set of states', 'Discriminated unions', 'Narrowing with typeof and in'], notes: ['A union type like `"idle" | "loading" | "error"` models a fixed set of states far more precisely than a loose `string`. The compiler will catch any typo or missing case.', 'Discriminated unions — objects that share a common literal field like `type` — let you narrow to the exact shape in a `switch`, and TypeScript will flag it if you forget a case.'], resourceTitle: 'Discriminated union patterns', resourceDescription: 'Modeling state machines with discriminated unions.' },
        ],
      },
      {
        title: 'Generics & Advanced Types',
        summary: 'Writing reusable, type-safe functions and utilities with generics.',
        lessons: [
          { title: 'Writing your first generic function', duration: '13:00', keyPoints: ['Generic type parameters', 'Constraining generics with extends', 'Generic defaults'], notes: ['A generic function like `function first<T>(items: T[]): T` stays reusable across any array type while still giving you full type safety on the return value.', 'Constraining a generic with `extends` — `function getLength<T extends { length: number }>(item: T)` — lets you rely on shared structure without locking the function to one concrete type.'], resourceTitle: 'Generics from scratch', resourceDescription: 'Worked examples building generic utilities step by step.' },
          { title: 'Utility types you\'ll actually use', duration: '14:20', keyPoints: ['Partial, Pick, and Omit', 'Record for dictionary shapes', 'ReturnType and Parameters'], notes: ['TypeScript ships a set of built-in utility types that cover most everyday transformations: `Partial<T>` makes every field optional, `Pick<T, K>` and `Omit<T, K>` select or exclude fields.', '`ReturnType<typeof fn>` and `Parameters<typeof fn>` let you derive types from existing functions instead of duplicating a shape by hand, which keeps types and implementation in sync.'], proTip: 'Reach for a utility type before writing a new interface that\'s just a small variation of an existing one.', resourceTitle: 'Utility types reference', resourceDescription: 'The full list of built-in utility types with examples.' },
          { title: 'Mapped and conditional types', duration: '15:45', keyPoints: ['Mapping over keys', 'Conditional types with extends', 'infer for extracting nested types'], notes: ['Mapped types let you transform every property of an existing type in one pass, which is how utility types like `Partial` and `Readonly` are implemented under the hood.', 'Conditional types (`T extends U ? X : Y`) combined with `infer` let you extract a nested type from a more complex one, such as pulling the element type out of an array type.'], resourceTitle: 'Advanced type-level programming', resourceDescription: 'Mapped and conditional type recipes for library-style code.' },
        ],
      },
      {
        title: 'TypeScript in Real Apps',
        summary: 'Configuring the compiler and typing React components and API layers.',
        lessons: [
          { title: 'Configuring tsconfig for strict mode', duration: '11:10', keyPoints: ['What strict mode actually enables', 'noImplicitAny and strictNullChecks', 'Incremental adoption in existing codebases'], notes: ['`"strict": true` in tsconfig turns on a bundle of checks, including `noImplicitAny` and `strictNullChecks`, that catch the majority of real-world type bugs.', 'In an existing JavaScript codebase, enabling strict mode all at once is often too disruptive — enabling individual flags first, or using `// @ts-expect-error` sparingly, lets you migrate incrementally.'], resourceTitle: 'tsconfig strict flags explained', resourceDescription: 'What each strict-mode flag checks and why it matters.' },
          { title: 'Typing React props and state', duration: '13:55', keyPoints: ['Typing component props', 'useState and useReducer generics', 'Typing event handlers'], notes: ['Typing props as an interface gives you autocomplete and catches missing or misspelled props at the call site, long before the component ever renders.', '`useState<T>()` and `useReducer` both accept a generic type parameter when the value being managed isn\'t obvious from its initial value, such as a nullable object.'], resourceTitle: 'Typed React patterns', resourceDescription: 'Typing props, state, and events in function components.' },
          { title: 'Typing a fetch layer and API responses', duration: '14:30', keyPoints: ['Typing fetch responses safely', 'Validating untrusted data at the boundary', 'Sharing types between client and server'], notes: ['A fetch response is `unknown` at runtime no matter what type you write in code — the compiler can\'t verify what a network call actually returns, only what you tell it to expect.', 'Validating the response shape at the boundary (with a schema library, or at minimum a type guard) turns an assumption into a checked fact, and is worth doing anywhere untrusted data enters your app.'], resourceTitle: 'Typing network boundaries', resourceDescription: 'Patterns for keeping fetch layers honestly typed.' },
        ],
      },
    ],
  },
  {
    slug: 'react-and-nextjs-masterclass',
    title: 'React & Next.js Masterclass',
    summary: 'Build production React applications with Next.js: routing, data fetching, server and client components, and state management.',
    level: 'intermediate',
    price: 79,
    popular: true,
    studentCount: 24150,
    categorySlug: 'web-development',
    instructorSlug: 'daniel-okafor',
    color: '#10B981',
    videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    outcomes: [
      { icon: 'layout', title: 'Component architecture', description: 'Structure React apps with reusable, composable components.' },
      { icon: 'route', title: 'App Router fundamentals', description: 'Use file-based routing, layouts, and server components in Next.js.' },
      { icon: 'database', title: 'Data fetching and caching', description: 'Fetch and cache data on the server and revalidate it correctly.' },
    ],
    modules: [
      {
        title: 'React Component Fundamentals',
        summary: 'Building blocks of React: components, props, state, and effects.',
        lessons: [
          { title: 'Components, props, and composition', duration: '12:30', freePreview: true, keyPoints: ['Function components as the default', 'Passing and typing props', 'Composing with children'], notes: ['A React component is just a function that returns JSX describing what should render. Props are the read-only inputs to that function, and composing smaller components is how larger UIs get built.', 'The `children` prop is what makes wrapper components like layouts and cards possible — any JSX nested inside a component tag is passed through as `children` automatically.'], resourceTitle: 'Component composition patterns', resourceDescription: 'Common composition patterns for reusable UI.' },
          { title: 'State with useState', duration: '13:10', keyPoints: ['When state triggers a re-render', 'Updating state based on previous state', 'Lifting state up'], notes: ['Calling a `useState` setter schedules a re-render with the new value — React doesn\'t mutate the old value in place, which is why you always replace state rather than modify it directly.', 'When two sibling components need the same piece of state, lifting it up to their nearest common parent and passing it down as props is the standard fix, before reaching for a state management library.'], resourceTitle: 'useState patterns', resourceDescription: 'Common state update patterns, including functional updates.' },
          { title: 'Side effects with useEffect', duration: '14:45', keyPoints: ['What belongs in an effect', 'The dependency array', 'Cleanup functions'], notes: ['`useEffect` synchronizes a component with something outside React — a subscription, a timer, or data fetching — not general-purpose "run this after render" logic.', 'The dependency array tells React when to re-run the effect; an empty array means "once on mount," and omitting it means "after every render," which is rarely what you want.'], proTip: 'If you\'re fetching data with useEffect just to have it on mount, check whether a server component could fetch it instead.', resourceTitle: 'useEffect dependency rules', resourceDescription: 'How to reason about the dependency array correctly.' },
        ],
      },
      {
        title: 'Routing & Layouts with the App Router',
        summary: 'File-based routing, nested layouts, and the server/client component split.',
        lessons: [
          { title: 'File-based routing basics', duration: '11:50', keyPoints: ['Folders as route segments', 'page.tsx and layout.tsx', 'Dynamic segments with brackets'], notes: ['In the App Router, a folder under `app/` becomes a URL segment, and a `page.tsx` file inside it makes that segment a navigable route. Folders without a `page.tsx` are just organizational.', 'Dynamic segments like `app/courses/[slug]/page.tsx` capture part of the URL as a route parameter, available to the page component as a prop.'], resourceTitle: 'App Router file conventions', resourceDescription: 'The full list of special files and what each one does.' },
          { title: 'Nested layouts and templates', duration: '12:20', keyPoints: ['Shared UI with layout.tsx', 'Layouts preserve state across navigation', 'template.tsx for reset-on-navigate UI'], notes: ['A `layout.tsx` wraps every page beneath it in the folder tree and, unlike a page, stays mounted across navigations within that segment — its state doesn\'t reset when you move between sibling pages.', 'A `template.tsx` looks similar but re-mounts on every navigation, which matters for things like enter animations that should replay each time.'], resourceTitle: 'Layouts vs templates', resourceDescription: 'When to reach for a layout versus a template.' },
          { title: 'Server components vs client components', duration: '16:00', keyPoints: ['Server components by default', '"use client" and where the boundary goes', 'What can and can\'t run on the server'], notes: ['Every component in the App Router is a server component by default — it renders on the server and never ships its code to the browser, which keeps bundles smaller and lets it touch server-only resources directly.', 'Adding `"use client"` at the top of a file opts that component (and everything it imports) into the client bundle. The boundary should sit as low in the tree as possible — usually just the interactive piece, not the whole page.'], resourceTitle: 'Server vs client component boundary', resourceDescription: 'A decision guide for where to place the "use client" boundary.' },
        ],
      },
      {
        title: 'Data Fetching and Caching',
        summary: 'Fetching data on the server, caching it, and revalidating it correctly.',
        lessons: [
          { title: 'Fetching data in server components', duration: '13:40', keyPoints: ['Awaiting fetch directly in components', 'Parallel vs sequential fetches', 'Passing fetched data down as props'], notes: ['A server component can be an `async` function and `await` a fetch directly — there\'s no separate data-fetching hook needed, since the fetch happens before the component ever renders to HTML.', 'As with any async code, kick off independent fetches before awaiting either one, so they run in parallel rather than one blocking the next.'], resourceTitle: 'Server component data fetching', resourceDescription: 'Patterns for fetching and passing data through server components.' },
          { title: 'Caching and revalidation', duration: '15:15', keyPoints: ['The fetch cache by default', 'Time-based revalidation', 'On-demand revalidation with tags'], notes: ['By default, fetches in the App Router are cached, so repeat requests for the same data don\'t hit the origin every time — this is what makes static-feeling pages fast even when they fetch real data.', 'Time-based revalidation (`{ next: { revalidate: 60 } }`) refreshes the cache on an interval, while tag-based revalidation lets a server action or webhook invalidate exactly the data that changed.'], proTip: 'Reach for on-demand revalidation with tags before you reach for a shorter time-based interval — it keeps data fresh without over-fetching.', resourceTitle: 'Caching and revalidation guide', resourceDescription: 'The full set of caching options and when to use each.' },
          { title: 'Loading and error states', duration: '10:55', keyPoints: ['loading.tsx and Suspense boundaries', 'error.tsx as a route-level error boundary', 'Streaming UI progressively'], notes: ['A `loading.tsx` file automatically wraps a route segment in a Suspense boundary, showing that fallback while the segment\'s data is being fetched — no manual Suspense wiring required.', 'An `error.tsx` file catches errors thrown anywhere in that segment\'s tree and renders a fallback UI instead of crashing the whole page, and it must be a client component since it uses React state to offer a retry.'], resourceTitle: 'Loading and error UI conventions', resourceDescription: 'How loading.tsx and error.tsx compose with Suspense.' },
        ],
      },
    ],
  },
  {
    slug: 'nodejs-backend-engineering',
    title: 'Node.js Backend Engineering',
    summary: 'Design and build production backend services with Node.js: APIs, databases, authentication, and background jobs.',
    level: 'intermediate',
    price: 69,
    studentCount: 13870,
    categorySlug: 'web-development',
    instructorSlug: 'daniel-okafor',
    color: '#22C55E',
    videoUrl: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
    outcomes: [
      { icon: 'server', title: 'API design', description: 'Design REST APIs with clear resource boundaries and validation.' },
      { icon: 'lock', title: 'Authentication', description: 'Implement token-based authentication and route protection.' },
      { icon: 'layers', title: 'Background work', description: 'Offload slow work to background jobs and queues.' },
    ],
    modules: [
      {
        title: 'Building REST APIs',
        summary: 'Structuring routes, controllers, and validation for a REST API.',
        lessons: [
          { title: 'Structuring an Express-style API', duration: '12:10', freePreview: true, keyPoints: ['Routes, controllers, and services', 'Middleware order matters', 'Separating concerns by layer'], notes: ['A maintainable API separates routing (what URL maps to what handler), controllers (translating a request into a call), and services (the actual business logic) — mixing all three in one file gets unwieldy fast.', 'Middleware runs in the order it\'s registered, which is why body parsing, authentication, and error handling middleware each need to sit in a specific place in the chain.'], resourceTitle: 'API layering conventions', resourceDescription: 'A reference structure for routes, controllers, and services.' },
          { title: 'Request validation', duration: '13:25', keyPoints: ['Validating at the boundary', 'Schema-based validation libraries', 'Returning clear validation errors'], notes: ['Every request body, query param, and route param is untrusted input until validated — trusting it directly is how malformed data and injection bugs end up deep in your business logic.', 'Schema-based validation libraries let you declare the expected shape once and get both a type and a runtime check from it, instead of hand-writing scattered if-checks.'], resourceTitle: 'Request validation patterns', resourceDescription: 'Validating request bodies with a schema library.' },
          { title: 'Error handling middleware', duration: '11:40', keyPoints: ['Centralizing error handling', 'Distinguishing operational vs programmer errors', 'Consistent error response shapes'], notes: ['A single error-handling middleware at the end of the chain keeps error formatting consistent and stops every route handler from needing its own try/catch boilerplate.', 'Operational errors (a missing record, bad input) should return a clean, expected error response, while unexpected programmer errors should be logged loudly rather than silently swallowed.'], resourceTitle: 'Centralized error handling', resourceDescription: 'A pattern for one error-handling middleware per API.' },
        ],
      },
      {
        title: 'Databases & Persistence',
        summary: 'Connecting to a database, modeling data, and managing schema changes.',
        lessons: [
          { title: 'Connecting to a database safely', duration: '12:50', keyPoints: ['Connection pooling', 'Environment-based configuration', 'Handling connection failures'], notes: ['A connection pool reuses a fixed set of database connections across requests instead of opening a new one per request, which is both faster and avoids exhausting the database\'s connection limit under load.', 'Database credentials belong in environment variables, never hardcoded, and the app should fail fast with a clear error if a required connection variable is missing at startup.'], resourceTitle: 'Connection pooling basics', resourceDescription: 'Why pooling matters and how to configure pool size.' },
          { title: 'Modeling data with an ORM', duration: '14:05', keyPoints: ['Defining models and relationships', 'Migrations for schema changes', 'Querying with an ORM vs raw SQL'], notes: ['An ORM lets you define your data model in code and generates the corresponding SQL, which is convenient for common queries but worth stepping around for anything performance-critical.', 'Migrations are versioned, ordered scripts that evolve your schema over time — every schema change should go through a migration, never a manual edit to the production database.'], resourceTitle: 'Migrations workflow', resourceDescription: 'Writing and running migrations safely across environments.' },
          { title: 'Transactions and data integrity', duration: '13:30', keyPoints: ['When you need a transaction', 'Commit and rollback', 'Isolation levels at a glance'], notes: ['A transaction groups multiple writes so they either all succeed or all roll back together — essential whenever an operation touches more than one related record, like transferring a balance between two accounts.', 'Isolation levels control how much one transaction can see of another\'s in-progress writes; the default level in most databases is a safe starting point until you have a specific reason to change it.'], resourceTitle: 'Transactions explained', resourceDescription: 'When and how to wrap writes in a transaction.' },
        ],
      },
      {
        title: 'Auth & Background Jobs',
        summary: 'Token-based authentication, route protection, and offloading slow work.',
        lessons: [
          { title: 'Token-based authentication', duration: '15:20', keyPoints: ['Issuing and verifying tokens', 'Storing tokens safely on the client', 'Refresh token flows'], notes: ['A token-based auth flow issues a signed token on login that the client sends with every subsequent request, letting the server verify identity without a server-side session store.', 'Access tokens are typically short-lived, with a longer-lived refresh token used to silently obtain a new one — this limits the damage window if an access token is ever leaked.'], resourceTitle: 'Token auth flow diagram', resourceDescription: 'The full login, access, and refresh token lifecycle.' },
          { title: 'Protecting routes with middleware', duration: '11:15', keyPoints: ['Auth middleware pattern', 'Role-based access checks', 'Returning 401 vs 403 correctly'], notes: ['An auth middleware verifies the incoming token once and attaches the resulting user to the request, so every downstream handler can trust `req.user` without re-checking it.', 'A 401 means "we don\'t know who you are," while a 403 means "we know who you are, and you\'re not allowed" — conflating the two makes API errors harder for clients to handle correctly.'], resourceTitle: 'Auth middleware pattern', resourceDescription: 'A reusable middleware for verifying tokens and roles.' },
          { title: 'Background jobs and queues', duration: '14:40', keyPoints: ['What belongs in a background job', 'Queue-based processing', 'Retries and idempotency'], notes: ['Anything slow or unreliable — sending an email, generating a report, calling a flaky third-party API — belongs in a background job so it doesn\'t block the request that triggered it.', 'A job queue decouples "enqueue the work" from "do the work," and a good job is idempotent, so a retry after a partial failure doesn\'t double-charge a customer or send a duplicate email.'], proTip: 'Design every background job to be safely retryable before you ship it, not after the first failure.', resourceTitle: 'Background job design', resourceDescription: 'Designing idempotent, retryable background jobs.' },
        ],
      },
    ],
  },
  {
    slug: 'sql-and-database-design',
    title: 'SQL & Database Design',
    summary: 'Learn relational database design and SQL from first principles: schema design, joins, indexing, and query performance.',
    level: 'beginner',
    price: 49,
    studentCount: 15230,
    categorySlug: 'data-science',
    instructorSlug: 'priya-raman',
    color: '#6366F1',
    videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    outcomes: [
      { icon: 'table', title: 'Schema design', description: 'Design normalized relational schemas for real applications.' },
      { icon: 'search', title: 'Querying with SQL', description: 'Write joins, aggregations, and subqueries confidently.' },
      { icon: 'gauge', title: 'Query performance', description: 'Use indexes and query plans to speed up slow queries.' },
    ],
    modules: [
      {
        title: 'Relational Design Fundamentals',
        summary: 'Tables, keys, relationships, and normalization.',
        lessons: [
          { title: 'Tables, rows, and primary keys', duration: '10:30', freePreview: true, keyPoints: ['What makes a good primary key', 'Natural vs surrogate keys', 'Uniqueness constraints'], notes: ['A primary key uniquely identifies each row in a table, and every table should have one — without it, you can\'t reliably reference a specific row from anywhere else.', 'A surrogate key (an auto-incrementing id) is usually a safer default than a natural key (like an email address), since natural keys can change or turn out not to be as unique as assumed.'], resourceTitle: 'Choosing a primary key', resourceDescription: 'Trade-offs between natural and surrogate keys.' },
          { title: 'Foreign keys and relationships', duration: '12:45', keyPoints: ['One-to-many relationships', 'Many-to-many via join tables', 'Referential integrity'], notes: ['A foreign key links a row in one table to a row in another, and the database enforces that the referenced row actually exists — this is referential integrity, and it prevents orphaned data.', 'A many-to-many relationship, like students and courses, needs a join table in between holding one row per pairing, since a plain foreign key can only point to one row.'], resourceTitle: 'Modeling relationships', resourceDescription: 'One-to-many and many-to-many patterns with examples.' },
          { title: 'Normalization in practice', duration: '14:00', keyPoints: ['Why duplication causes bugs', 'First, second, and third normal form', 'When to intentionally denormalize'], notes: ['Normalization is the process of structuring tables to eliminate redundant data, so a fact is stored in exactly one place and updating it can never leave the database in an inconsistent state.', 'Third normal form is a reasonable default for most application schemas, but deliberately denormalizing — duplicating a value for read performance — is sometimes the right trade-off once you understand the rules well enough to break them intentionally.'], resourceTitle: 'Normal forms explained', resourceDescription: 'A walkthrough of 1NF through 3NF with examples.' },
        ],
      },
      {
        title: 'Querying with SQL',
        summary: 'Selecting, filtering, joining, and aggregating data.',
        lessons: [
          { title: 'SELECT, WHERE, and filtering', duration: '11:20', keyPoints: ['Filtering rows with WHERE', 'Combining conditions', 'Sorting and limiting results'], notes: ['A `SELECT` statement is how you read data: which columns, from which table, filtered by a `WHERE` clause that narrows the rows down to the ones you actually want.', 'Combining conditions with `AND`/`OR` and controlling result order with `ORDER BY` and `LIMIT` covers the vast majority of everyday read queries.'], resourceTitle: 'SELECT statement anatomy', resourceDescription: 'The clauses of a SELECT statement and the order they run in.' },
          { title: 'JOINs across tables', duration: '15:10', keyPoints: ['Inner vs left joins', 'Joining across more than two tables', 'Avoiding accidental row duplication'], notes: ['An inner join returns only rows that match in both tables, while a left join keeps every row from the left table even when there\'s no match on the right, filling the gap with nulls.', 'Joining across several tables at once can silently multiply row counts if a relationship is one-to-many at more than one level — it\'s worth sanity-checking result counts against what you expect.'], proTip: 'When a join result looks too big, check for an unintended one-to-many relationship before assuming the data is wrong.', resourceTitle: 'JOIN types compared', resourceDescription: 'Visual comparison of inner, left, right, and full joins.' },
          { title: 'Aggregations and GROUP BY', duration: '13:35', keyPoints: ['COUNT, SUM, AVG', 'GROUP BY and per-group aggregates', 'Filtering groups with HAVING'], notes: ['Aggregate functions like `COUNT`, `SUM`, and `AVG` collapse many rows into one summary value, and `GROUP BY` lets you compute that summary separately for each distinct value of a column.', '`HAVING` filters groups after aggregation, which is why it exists separately from `WHERE` — `WHERE` filters rows before they\'re grouped, so it can\'t reference an aggregate result.'], resourceTitle: 'GROUP BY and HAVING', resourceDescription: 'The difference between WHERE and HAVING, with examples.' },
        ],
      },
      {
        title: 'Performance & Indexing',
        summary: 'Reading query plans and using indexes to speed up slow queries.',
        lessons: [
          { title: 'How indexes actually work', duration: '14:15', keyPoints: ['B-tree indexes at a glance', 'What makes a column worth indexing', 'The write cost of an index'], notes: ['An index is a separate, sorted structure that lets the database find matching rows without scanning the whole table — similar to an index at the back of a book.', 'Every index speeds up reads that use it but slows down writes slightly, since the index has to be updated too, so indexing every column isn\'t automatically the right call.'], resourceTitle: 'Index fundamentals', resourceDescription: 'How B-tree indexes speed up lookups.' },
          { title: 'Reading a query plan', duration: '13:50', keyPoints: ['EXPLAIN output basics', 'Spotting a full table scan', 'Estimated vs actual row counts'], notes: ['`EXPLAIN` shows you how the database actually plans to execute a query — which indexes it will use, in what order it will join tables, and roughly how many rows it expects at each step.', 'A full table scan on a large table is usually the first sign a query needs an index; the query plan will call this out explicitly rather than leaving you to guess.'], resourceTitle: 'Reading EXPLAIN output', resourceDescription: 'A guide to the fields in a typical query plan.' },
          { title: 'Composite indexes and column order', duration: '12:25', keyPoints: ['Multi-column indexes', 'Why column order matters', 'Covering indexes'], notes: ['A composite index spans multiple columns, and the order of those columns matters: an index on `(a, b)` speeds up queries filtering on `a` alone or on `a` and `b` together, but not on `b` alone.', 'A covering index includes every column a query needs, letting the database satisfy the query from the index alone without touching the underlying table at all.'], resourceTitle: 'Composite index ordering', resourceDescription: 'How to choose column order for a multi-column index.' },
        ],
      },
    ],
  },
  {
    slug: 'python-for-data-science',
    title: 'Python for Data Science',
    summary: 'Use Python and its data ecosystem to clean, analyze, and visualize real datasets.',
    level: 'beginner',
    price: 59,
    popular: true,
    studentCount: 21040,
    categorySlug: 'data-science',
    instructorSlug: 'priya-raman',
    color: '#8B5CF6',
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    outcomes: [
      { icon: 'code', title: 'Python fundamentals', description: 'Write clean Python for data manipulation tasks.' },
      { icon: 'table', title: 'Working with dataframes', description: 'Clean, filter, and transform tabular data with pandas.' },
      { icon: 'chart', title: 'Data visualization', description: 'Build clear charts to communicate findings.' },
    ],
    modules: [
      {
        title: 'Python Essentials for Data Work',
        summary: 'The Python fundamentals data analysis is built on.',
        lessons: [
          { title: 'Lists, dicts, and comprehensions', duration: '12:00', freePreview: true, keyPoints: ['Lists and dictionaries as core structures', 'List comprehensions', 'When to reach for a dict vs a list'], notes: ['Lists and dictionaries cover the majority of everyday Python data structures: a list for an ordered sequence, a dict for looking values up by key.', 'A list comprehension — `[x * 2 for x in values]` — expresses a transform-and-filter in one readable line, and is generally preferred over an equivalent manual loop.'], resourceTitle: 'Comprehension patterns', resourceDescription: 'List, dict, and set comprehension examples.' },
          { title: 'Functions and modules', duration: '11:30', keyPoints: ['Defining functions with default args', 'Organizing code into modules', 'Importing selectively'], notes: ['Python functions support default argument values and keyword arguments, which makes call sites more readable than positional-only arguments once a function has more than two or three parameters.', 'Splitting code into modules and importing only what you need keeps files focused and makes it obvious where a given function actually lives.'], resourceTitle: 'Module organization', resourceDescription: 'Structuring a small data project into modules.' },
          { title: 'Working with files and paths', duration: '10:45', keyPoints: ['Reading and writing files safely', 'Using context managers', 'Path handling across operating systems'], notes: ['Opening a file with a `with` block guarantees it gets closed even if an error occurs partway through reading it, which is why context managers are the standard way to handle files.', 'Using a path library instead of hand-built string paths avoids subtle bugs when code runs on a different operating system than it was written on.'], resourceTitle: 'File handling patterns', resourceDescription: 'Safe file reading and writing with context managers.' },
        ],
      },
      {
        title: 'Data Manipulation with pandas',
        summary: 'Loading, cleaning, and transforming tabular data with dataframes.',
        lessons: [
          { title: 'Loading and inspecting a dataframe', duration: '13:20', keyPoints: ['Reading CSVs into a dataframe', 'head, info, and describe', 'Understanding dtypes'], notes: ['A dataframe is pandas\' core structure for tabular data — rows and named columns, much like a spreadsheet or a SQL table, but manipulable directly in code.', 'Before doing anything else with a new dataset, `.info()` and `.describe()` give a fast first read on column types, missing values, and the general shape of the data.'], resourceTitle: 'First-look dataframe checklist', resourceDescription: 'The commands worth running on any new dataset.' },
          { title: 'Cleaning messy data', duration: '15:05', keyPoints: ['Handling missing values', 'Fixing inconsistent types', 'Removing duplicates'], notes: ['Real-world data almost always has missing values, and the right fix — dropping the row, filling with a default, or interpolating — depends entirely on what the data represents and why it\'s missing.', 'Duplicate rows and inconsistent types (a numeric column stored as text, for instance) are two of the most common data-cleaning issues, and pandas has direct methods for both.'], proTip: 'Always check why data is missing before deciding how to fill it — the reason often changes the right answer.', resourceTitle: 'Data cleaning checklist', resourceDescription: 'A repeatable process for cleaning a new dataset.' },
          { title: 'Filtering, grouping, and merging', duration: '14:40', keyPoints: ['Boolean filtering', 'groupby for per-category summaries', 'Merging two dataframes'], notes: ['Boolean filtering (`df[df["price"] > 100]`) is the pandas equivalent of a SQL `WHERE` clause, and it composes with other operations just as naturally.', '`groupby` combined with an aggregation mirrors SQL\'s `GROUP BY`, letting you compute a per-category summary, while `merge` combines two dataframes much like a SQL join.'], resourceTitle: 'pandas to SQL mapping', resourceDescription: 'Common pandas operations mapped to their SQL equivalents.' },
        ],
      },
      {
        title: 'Visualization & Analysis',
        summary: 'Turning cleaned data into charts and basic statistical summaries.',
        lessons: [
          { title: 'Charting with matplotlib', duration: '12:55', keyPoints: ['Line, bar, and scatter plots', 'Labeling axes and titles clearly', 'Saving figures for reports'], notes: ['matplotlib covers the core chart types — line, bar, scatter, histogram — and while its default styling is plain, it\'s reliable and works everywhere.', 'A chart without axis labels and a title is hard to trust or reuse; labeling clearly should be a habit, not an afterthought once the chart already looks right.'], resourceTitle: 'matplotlib quick reference', resourceDescription: 'The most-used matplotlib chart types and options.' },
          { title: 'Descriptive statistics', duration: '11:15', keyPoints: ['Mean, median, and when they diverge', 'Standard deviation and variance', 'Spotting outliers'], notes: ['Mean and median can diverge sharply on skewed data — a handful of very large values can pull the mean far from what most of the data actually looks like, which is why checking both matters.', 'Standard deviation quantifies how spread out values are around the mean, and unusually large or small values relative to that spread are worth a second look before trusting a summary statistic.'], resourceTitle: 'Descriptive stats cheat sheet', resourceDescription: 'When to use mean vs median, and how to spot outliers.' },
          { title: 'From analysis to a shareable report', duration: '13:00', keyPoints: ['Structuring a findings summary', 'Choosing the right chart for the finding', 'Documenting assumptions'], notes: ['A good analysis ends with a clear written summary of what was found, not just a folder of charts — the reader shouldn\'t have to reverse-engineer the conclusion from the visuals.', 'Every analysis rests on assumptions (how missing data was handled, what date range was used); writing those down next to the findings saves confusion later when someone revisits the work.'], resourceTitle: 'Analysis report template', resourceDescription: 'A simple structure for writing up a data analysis.' },
        ],
      },
    ],
  },
  {
    slug: 'machine-learning-foundations',
    title: 'Machine Learning Foundations',
    summary: 'Core machine learning concepts and algorithms: supervised learning, model evaluation, and the practical workflow of training a model.',
    level: 'intermediate',
    price: 89,
    popular: true,
    studentCount: 19860,
    categorySlug: 'ai-machine-learning',
    instructorSlug: 'ethan-brooks',
    color: '#EC4899',
    videoUrl: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
    outcomes: [
      { icon: 'brain', title: 'Core ML concepts', description: 'Understand supervised learning, features, and labels.' },
      { icon: 'trending-up', title: 'Model training workflow', description: 'Train, validate, and tune models the right way.' },
      { icon: 'check-circle', title: 'Evaluation and metrics', description: 'Choose the right metric for a given problem.' },
    ],
    modules: [
      {
        title: 'Supervised Learning Basics',
        summary: 'Features, labels, and the core supervised learning workflow.',
        lessons: [
          { title: 'Features, labels, and datasets', duration: '13:10', freePreview: true, keyPoints: ['What a feature and a label are', 'Train/test splits', 'Why leaking test data breaks evaluation'], notes: ['A supervised learning problem starts with features (the inputs) and labels (the outcome you want to predict) — every algorithm in this module learns a mapping from one to the other.', 'Splitting data into train and test sets, and never touching the test set until final evaluation, is what makes a reported accuracy trustworthy rather than optimistic.'], resourceTitle: 'Train/test split guide', resourceDescription: 'Why and how to split data before training.' },
          { title: 'Linear regression from scratch', duration: '15:40', keyPoints: ['Fitting a line to data', 'The cost function', 'Gradient descent intuition'], notes: ['Linear regression fits a straight line (or hyperplane, with more features) that minimizes the distance between its predictions and the actual labels — the cost function quantifies that distance.', 'Gradient descent finds the line\'s parameters by repeatedly nudging them in the direction that reduces the cost function, a small step at a time, until it converges.'], resourceTitle: 'Gradient descent visualized', resourceDescription: 'A step-by-step walkthrough of gradient descent converging.' },
          { title: 'Classification with logistic regression', duration: '14:25', keyPoints: ['Regression vs classification', 'The sigmoid function', 'Decision boundaries'], notes: ['Classification predicts a category rather than a continuous number, and logistic regression adapts linear regression\'s approach by squashing its output through a sigmoid into a 0-to-1 probability.', 'The decision boundary is the line (or surface) where the model is equally split between classes — everything on one side gets one label, everything on the other gets the other.'], resourceTitle: 'Logistic regression explained', resourceDescription: 'From linear regression to classification via the sigmoid.' },
        ],
      },
      {
        title: 'Model Evaluation',
        summary: 'Choosing the right metric and avoiding overfitting.',
        lessons: [
          { title: 'Accuracy, precision, and recall', duration: '14:00', keyPoints: ['Why accuracy alone can mislead', 'Precision vs recall trade-off', 'Choosing a metric for the problem'], notes: ['Accuracy can look great on an imbalanced dataset while the model is actually useless — a model that always predicts "not fraud" can be 99% accurate if fraud is rare, while catching zero real cases.', 'Precision and recall trade off against each other, and which one matters more depends entirely on the cost of a false positive versus a false negative for that specific problem.'], resourceTitle: 'Precision vs recall guide', resourceDescription: 'Choosing between precision and recall for a given problem.' },
          { title: 'Overfitting and underfitting', duration: '13:20', keyPoints: ['Recognizing overfitting from train/test gaps', 'Model complexity and bias-variance', 'Regularization as a fix'], notes: ['Overfitting shows up as a model that performs great on training data but noticeably worse on the test set — it has memorized noise in the training data rather than learning the real pattern.', 'Regularization penalizes overly complex models during training, which trades a small amount of training accuracy for meaningfully better generalization to new data.'], proTip: 'A large gap between train and test performance is the single clearest signal to check for overfitting.', resourceTitle: 'Bias-variance tradeoff', resourceDescription: 'How model complexity relates to overfitting and underfitting.' },
          { title: 'Cross-validation in practice', duration: '12:35', keyPoints: ['Why one train/test split isn\'t enough', 'K-fold cross-validation', 'Using CV for hyperparameter tuning'], notes: ['A single train/test split gives one noisy estimate of performance; k-fold cross-validation repeats the split k times and averages the result, giving a far more reliable estimate.', 'Cross-validation is also how you safely tune hyperparameters — trying each candidate value across multiple folds instead of accidentally overfitting to one particular test set.'], resourceTitle: 'K-fold cross-validation', resourceDescription: 'How k-fold CV works and how to use it for tuning.' },
        ],
      },
      {
        title: 'From Notebook to Practice',
        summary: 'Feature engineering, model selection, and the practical ML workflow.',
        lessons: [
          { title: 'Feature engineering basics', duration: '14:50', keyPoints: ['Scaling and normalizing features', 'Encoding categorical variables', 'Creating new features from existing ones'], notes: ['Many algorithms are sensitive to feature scale, so numeric features are typically normalized or standardized before training so no single feature dominates just because of its raw magnitude.', 'Categorical variables need to be encoded into numbers before most algorithms can use them — one-hot encoding is the most common approach for a small number of categories.'], resourceTitle: 'Feature engineering checklist', resourceDescription: 'Scaling, encoding, and creating features before training.' },
          { title: 'Choosing a model for the problem', duration: '13:45', keyPoints: ['Matching model complexity to data size', 'Interpretability vs raw performance', 'Starting simple before reaching for complexity'], notes: ['A simple model like logistic regression is often a better starting point than a complex one, both because it\'s faster to iterate on and because it gives you an interpretable baseline to beat.', 'Interpretability matters more in some domains than others — a model deciding loan approvals needs to be explainable in a way a model recommending movies doesn\'t.'], resourceTitle: 'Model selection guide', resourceDescription: 'Matching model choice to data size and interpretability needs.' },
          { title: 'A complete training workflow, end to end', duration: '16:20', keyPoints: ['The full pipeline from raw data to trained model', 'Where each earlier lesson fits in', 'Common pitfalls at each stage'], notes: ['A real ML workflow strings together everything from this module: clean and split the data, engineer features, train a few candidate models, evaluate them with the right metric, and only then pick a winner.', 'The most common pitfall isn\'t a bad algorithm — it\'s a mistake earlier in the pipeline, like a leaked feature or a metric that doesn\'t match what the business actually cares about.'], resourceTitle: 'End-to-end ML workflow', resourceDescription: 'A reference pipeline tying every stage together.' },
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering-and-llm-applications',
    title: 'Prompt Engineering & LLM Applications',
    summary: 'Design reliable prompts and build real applications on top of large language models.',
    level: 'intermediate',
    price: 79,
    studentCount: 16720,
    categorySlug: 'ai-machine-learning',
    instructorSlug: 'ethan-brooks',
    color: '#F43F5E',
    videoUrl: 'https://www.youtube.com/watch?v=_ZvnD73m40o',
    outcomes: [
      { icon: 'message-square', title: 'Prompt design', description: 'Write prompts that reliably produce the output you want.' },
      { icon: 'tool', title: 'Structured output', description: 'Get validated, structured responses from an LLM.' },
      { icon: 'link', title: 'Grounded applications', description: 'Build LLM apps that stay grounded in real data.' },
    ],
    modules: [
      {
        title: 'Prompt Design Fundamentals',
        summary: 'The core techniques for getting reliable output from an LLM.',
        lessons: [
          { title: 'Anatomy of an effective prompt', duration: '11:45', freePreview: true, keyPoints: ['System vs user messages', 'Being explicit about format', 'Giving the model room to reason'], notes: ['A system message sets standing behavior for the whole conversation, while user messages carry the specific request — separating the two makes an application\'s prompts far easier to maintain.', 'The single highest-leverage change to a prompt is usually being explicit about the exact output format you want, rather than leaving it to the model to guess.'], resourceTitle: 'Prompt structure checklist', resourceDescription: 'A checklist for structuring a reliable prompt.' },
          { title: 'Few-shot examples and in-context learning', duration: '13:10', keyPoints: ['Showing examples instead of describing rules', 'How many examples is enough', 'Keeping examples representative'], notes: ['Showing the model two or three worked examples of the input-output pattern you want is often more reliable than trying to describe the rule in the abstract.', 'Examples should be genuinely representative of the range of real inputs — a set of examples that\'s too narrow can make the model overfit to one pattern and miss edge cases.'], resourceTitle: 'Few-shot prompting guide', resourceDescription: 'How many examples to use and how to pick them.' },
          { title: 'Chain-of-thought and reasoning prompts', duration: '14:30', keyPoints: ['Asking the model to reason step by step', 'When reasoning helps vs adds noise', 'Separating reasoning from the final answer'], notes: ['Asking a model to work through a problem step by step before giving a final answer measurably improves accuracy on tasks that require multi-step reasoning, like math or multi-part logic.', 'For simple lookups or classifications, forcing step-by-step reasoning can add latency and cost without improving the answer — it\'s a tool for genuinely hard problems, not a default for everything.'], resourceTitle: 'Chain-of-thought prompting', resourceDescription: 'When step-by-step reasoning prompts help and when they don\'t.' },
        ],
      },
      {
        title: 'Structured Output & Tool Use',
        summary: 'Getting validated structured data and calling external tools from an LLM.',
        lessons: [
          { title: 'Getting structured JSON output', duration: '13:50', keyPoints: ['Describing an output schema', 'Validating output before trusting it', 'Handling malformed responses'], notes: ['Describing the exact JSON shape you want, ideally backed by a schema the model is asked to conform to, dramatically increases how often the response actually parses correctly.', 'Even with a clear schema, validate the model\'s output before using it downstream — a schema library that both validates and gives you a typed result is the standard approach.'], resourceTitle: 'Structured output patterns', resourceDescription: 'Schema-constrained prompting and output validation.' },
          { title: 'Tool calling and function schemas', duration: '15:00', keyPoints: ['Describing tools the model can call', 'The request-response loop for tool calls', 'Validating tool arguments before executing'], notes: ['Tool calling lets a model decide, based on the conversation, that it needs to call a specific function with specific arguments — the model itself never executes anything, it just describes the call.', 'The application is responsible for validating any arguments the model produces before actually executing the tool, since the model can hallucinate a plausible-looking but invalid argument.'], proTip: 'Never execute a tool call\'s arguments without validating them first — treat model output as untrusted input.', resourceTitle: 'Tool calling walkthrough', resourceDescription: 'The full request-response loop for tool/function calling.' },
          { title: 'Grounding responses in real data', duration: '14:15', keyPoints: ['Why ungrounded generation invites hallucination', 'Retrieval before generation', 'Citing sources in the response'], notes: ['A model asked to answer purely from its training data will sometimes generate a plausible-sounding but false answer — grounding means retrieving real, relevant data and having the model answer from that instead.', 'An application that surfaces where an answer came from — which document, which record — lets a user verify the claim instead of trusting it blindly.'], resourceTitle: 'Grounded generation patterns', resourceDescription: 'Retrieval-then-generation patterns to reduce hallucination.' },
        ],
      },
      {
        title: 'Building Real LLM Applications',
        summary: 'Putting prompting and structured output together into a working application.',
        lessons: [
          { title: 'Designing an LLM-powered search flow', duration: '15:35', keyPoints: ['Turning a query into a structured search', 'Ranking and merging results', 'Handling the empty-result case'], notes: ['An LLM-powered search flow typically turns a natural-language query into one or more structured queries against real data, then merges and ranks whatever comes back — the model orchestrates, the data grounds.', 'An empty result should be an explicit, designed state — pointing the user somewhere useful — rather than a blank page or a hallucinated answer papering over the gap.'], resourceTitle: 'LLM search flow design', resourceDescription: 'A reference architecture for LLM-powered search.' },
          { title: 'Streaming responses to the user', duration: '11:55', keyPoints: ['Why streaming improves perceived latency', 'Server-sent events vs polling', 'Rendering partial structured output'], notes: ['Streaming a response token by token lets a user start reading well before the full answer is ready, which matters more for perceived speed than the total generation time usually does.', 'Rendering partial structured output as it streams in is trickier than plain text, since a JSON object isn\'t valid until it\'s complete — most applications buffer until a safe parse point.'], resourceTitle: 'Streaming UI patterns', resourceDescription: 'Handling streamed text and structured output on the client.' },
          { title: 'Evaluating and iterating on prompts', duration: '13:05', keyPoints: ['Building a small evaluation set', 'Comparing prompt versions objectively', 'Catching regressions before shipping'], notes: ['A small, fixed set of representative inputs with known-good expected outputs turns "does this prompt work" from a vibe into something you can actually measure across changes.', 'Every prompt change should be checked against that evaluation set before shipping — it\'s the same discipline as a regression test suite, just applied to prompts instead of code.'], resourceTitle: 'Prompt evaluation workflow', resourceDescription: 'Building and running a lightweight prompt evaluation set.' },
        ],
      },
    ],
  },
  {
    slug: 'docker-and-kubernetes-for-developers',
    title: 'Docker & Kubernetes for Developers',
    summary: 'Containerize applications with Docker and orchestrate them in production with Kubernetes.',
    level: 'intermediate',
    price: 79,
    studentCount: 12480,
    categorySlug: 'devops-cloud',
    instructorSlug: 'sofia-martinez',
    color: '#0EA5E9',
    videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    outcomes: [
      { icon: 'box', title: 'Containerizing apps', description: 'Package applications into portable, reproducible Docker images.' },
      { icon: 'grid', title: 'Kubernetes fundamentals', description: 'Deploy and scale containers with Kubernetes primitives.' },
      { icon: 'activity', title: 'Operating in production', description: 'Configure health checks, scaling, and rollouts safely.' },
    ],
    modules: [
      {
        title: 'Containerizing Applications with Docker',
        summary: 'Building images, writing Dockerfiles, and running containers.',
        lessons: [
          { title: 'Images, containers, and the Dockerfile', duration: '12:20', freePreview: true, keyPoints: ['Image vs container distinction', 'Writing a basic Dockerfile', 'Layer caching'], notes: ['An image is a read-only template; a container is a running instance of that image — the same image can produce many independent, isolated containers.', 'Docker builds an image layer by layer and caches each one, which is why ordering a Dockerfile\'s steps from least- to most-frequently-changing dramatically speeds up rebuilds.'], resourceTitle: 'Dockerfile best practices', resourceDescription: 'Layer ordering and caching for faster builds.' },
          { title: 'Multi-stage builds', duration: '13:40', keyPoints: ['Separating build and runtime stages', 'Shrinking final image size', 'Copying only what production needs'], notes: ['A multi-stage build uses one stage with all the build tooling to compile or bundle the app, then copies only the finished artifact into a slim final stage — the build tools never ship to production.', 'Smaller production images start faster, have a smaller attack surface, and are cheaper to store and transfer, which matters at scale even when the size difference looks small locally.'], resourceTitle: 'Multi-stage build examples', resourceDescription: 'Multi-stage Dockerfiles for common app types.' },
          { title: 'Networking and volumes', duration: '14:10', keyPoints: ['Container-to-container networking', 'Persisting data with volumes', 'Port mapping to the host'], notes: ['Containers on the same Docker network can reach each other by name, which is how a multi-container app (an API and a database, say) talks to itself without hardcoded IPs.', 'A container\'s filesystem is ephemeral by default — a volume is how you persist data (like a database\'s files) across container restarts and rebuilds.'], resourceTitle: 'Docker networking and volumes', resourceDescription: 'How container networking and persistent volumes work together.' },
        ],
      },
      {
        title: 'Kubernetes Fundamentals',
        summary: 'Pods, deployments, and services — the core building blocks.',
        lessons: [
          { title: 'Pods, deployments, and the API server', duration: '15:00', keyPoints: ['A pod as the smallest deployable unit', 'Deployments manage pod replicas', 'Declarative config via the API server'], notes: ['A pod is the smallest thing you deploy in Kubernetes — usually one container, sometimes a couple tightly coupled ones sharing a network namespace.', 'You rarely create pods directly; a Deployment describes the desired state (how many replicas, which image) and the cluster continuously works to match reality to that description.'], resourceTitle: 'Kubernetes object model', resourceDescription: 'How pods, deployments, and the API server fit together.' },
          { title: 'Services and networking', duration: '13:25', keyPoints: ['Why pods need a stable network identity', 'ClusterIP vs LoadBalancer services', 'Service discovery by name'], notes: ['Pods are ephemeral and get a new IP every time they restart, so a Service provides a stable network identity in front of a changing set of pod IPs.', 'A ClusterIP service is reachable only inside the cluster, while a LoadBalancer service provisions external access — picking the right type depends on whether the workload needs to be public.'], resourceTitle: 'Kubernetes service types', resourceDescription: 'ClusterIP, NodePort, and LoadBalancer compared.' },
          { title: 'ConfigMaps and secrets', duration: '12:15', keyPoints: ['Externalizing configuration', 'Secrets vs ConfigMaps', 'Mounting config as env vars or files'], notes: ['A ConfigMap externalizes non-sensitive configuration from the container image, so the same image can run with different settings in different environments.', 'Secrets work similarly but are meant for sensitive values; they\'re base64-encoded rather than encrypted by default, so real secret management usually layers additional encryption or an external secrets manager on top.'], resourceTitle: 'Config and secrets management', resourceDescription: 'Patterns for externalizing config in Kubernetes.' },
        ],
      },
      {
        title: 'Operating in Production',
        summary: 'Health checks, scaling, and safe rollouts.',
        lessons: [
          { title: 'Liveness and readiness probes', duration: '13:00', keyPoints: ['Liveness vs readiness distinction', 'What a good probe checks', 'Consequences of a bad probe'], notes: ['A liveness probe asks "should this container be restarted," while a readiness probe asks "should this pod receive traffic right now" — conflating the two can cause unnecessary restarts or traffic sent to a pod that isn\'t ready.', 'A probe that checks too little (just "is the process running") misses real failures, while one that checks too much (a full downstream dependency check) can cause cascading restarts when a dependency has a blip.'], resourceTitle: 'Probe design guide', resourceDescription: 'Designing liveness and readiness checks that catch real failures.' },
          { title: 'Autoscaling based on load', duration: '12:40', keyPoints: ['Horizontal pod autoscaling', 'Choosing a scaling metric', 'Scaling limits and cooldowns'], notes: ['A Horizontal Pod Autoscaler adjusts the number of running replicas based on a metric like CPU utilization, adding capacity under load and scaling back down when it\'s no longer needed.', 'Setting sensible min/max replica bounds and a cooldown period prevents the autoscaler from thrashing — rapidly scaling up and down in response to short-lived spikes.'], resourceTitle: 'Autoscaling configuration', resourceDescription: 'Setting sensible bounds and metrics for autoscaling.' },
          { title: 'Rolling updates and rollbacks', duration: '14:20', keyPoints: ['How a rolling update replaces pods gradually', 'Rolling back a bad deploy', 'Zero-downtime deploy strategies'], notes: ['A rolling update replaces old pods with new ones a few at a time, keeping the service available throughout — the opposite of taking everything down and back up at once.', 'If a new version turns out to be broken, rolling back to the previous version is a single command, since Kubernetes keeps track of prior deployment revisions.'], proTip: 'Always verify a rollout with a readiness check before it\'s considered part of the healthy fleet, not just deployed.', resourceTitle: 'Rolling update strategy', resourceDescription: 'Configuring safe, zero-downtime rolling updates.' },
        ],
      },
    ],
  },
  {
    slug: 'react-native-mobile-app-development',
    title: 'React Native Mobile App Development',
    summary: 'Build cross-platform mobile apps with React Native: navigation, native modules, and shipping to app stores.',
    level: 'intermediate',
    price: 69,
    studentCount: 10650,
    categorySlug: 'mobile-development',
    instructorSlug: 'liam-turner',
    color: '#14B8A6',
    videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
    outcomes: [
      { icon: 'smartphone', title: 'Cross-platform UI', description: 'Build UI that feels native on both iOS and Android.' },
      { icon: 'navigation', title: 'Navigation patterns', description: 'Implement stack, tab, and modal navigation.' },
      { icon: 'upload', title: 'Shipping to app stores', description: 'Prepare and submit a build to the App Store and Play Store.' },
    ],
    modules: [
      {
        title: 'React Native Fundamentals',
        summary: 'Core components, styling, and the platform differences to expect.',
        lessons: [
          { title: 'Core components and styling', duration: '12:10', freePreview: true, keyPoints: ['View, Text, and core primitives', 'Styling with StyleSheet', 'Flexbox layout by default'], notes: ['React Native replaces HTML elements with a small set of core components — `View`, `Text`, `Image` — that render to real native views on each platform rather than a webview.', 'Layout uses Flexbox by default for every view, unlike the web where you opt into Flexbox — this makes cross-platform layout far more predictable out of the box.'], resourceTitle: 'Core components reference', resourceDescription: 'The essential React Native components and their props.' },
          { title: 'Handling platform differences', duration: '13:30', keyPoints: ['Platform.select and Platform.OS', 'Platform-specific file extensions', 'When a difference is worth branching on'], notes: ['`Platform.OS` and `Platform.select()` let you branch behavior or styling per platform when iOS and Android genuinely need to differ — a shadow versus an elevation property, for instance.', 'For larger platform-specific implementations, a `.ios.tsx`/`.android.tsx` file pair lets the bundler pick the right file automatically, keeping platform-specific code cleanly separated.'], resourceTitle: 'Platform-specific code patterns', resourceDescription: 'Platform.select vs platform-specific file extensions.' },
          { title: 'Handling touch and gestures', duration: '11:50', keyPoints: ['Touchable components', 'Basic gesture handling', 'Feedback on press'], notes: ['Touchable components (`Pressable` and its predecessors) are how you make any view respond to taps, with built-in support for visual feedback on press.', 'More complex gestures — swipes, pinches, drags — typically need a dedicated gesture library, since the core touchables only cover simple tap interactions.'], resourceTitle: 'Touch handling guide', resourceDescription: 'Touchable components and basic gesture patterns.' },
        ],
      },
      {
        title: 'Navigation',
        summary: 'Stack, tab, and modal navigation patterns.',
        lessons: [
          { title: 'Stack navigation basics', duration: '13:15', keyPoints: ['Pushing and popping screens', 'Passing params between screens', 'Header configuration per screen'], notes: ['Stack navigation pushes a new screen on top of the current one, with a back gesture or button to pop back — the standard pattern for drilling into a detail view from a list.', 'Params passed when navigating to a screen are how that screen receives context, like an item id, without global state — the receiving screen reads them directly from its route.'], resourceTitle: 'Stack navigator patterns', resourceDescription: 'Passing params and configuring headers per screen.' },
          { title: 'Tab and drawer navigation', duration: '12:40', keyPoints: ['Bottom tabs for top-level sections', 'Nesting a stack inside a tab', 'Drawer navigation as an alternative'], notes: ['Bottom tab navigation is the standard pattern for a handful of top-level app sections, with each tab often containing its own nested stack navigator for drilling deeper.', 'Drawer navigation is a reasonable alternative when there are more top-level destinations than comfortably fit as tabs, at the cost of being one tap less discoverable.'], resourceTitle: 'Tab vs drawer navigation', resourceDescription: 'When to choose tabs versus a drawer for top-level navigation.' },
          { title: 'Modals and nested navigators', duration: '14:05', keyPoints: ['Presenting a modal over the current stack', 'Combining multiple navigator types', 'Passing data back after a modal closes'], notes: ['A modal presents a screen over the current navigation stack rather than pushing into it, which is the right pattern for a focused task like a form that isn\'t part of the main flow.', 'Real apps typically nest several navigator types — tabs containing stacks, a stack containing a modal — and understanding how navigation state composes across that nesting avoids a lot of confusion.'], resourceTitle: 'Nested navigator composition', resourceDescription: 'Combining stack, tab, and modal navigators.' },
        ],
      },
      {
        title: 'Native Modules & Shipping',
        summary: 'Accessing native device features and preparing an app store release.',
        lessons: [
          { title: 'Accessing native device features', duration: '13:50', keyPoints: ['Using a library that wraps native APIs', 'Requesting permissions correctly', 'Handling denied permissions gracefully'], notes: ['Most native device features — camera, location, notifications — are accessed through a library that wraps the underlying native API in a consistent JavaScript interface, rather than writing native code yourself.', 'Every permission request should have a graceful fallback for when the user denies it — the app shouldn\'t crash or become unusable, just lose the feature that needed that permission.'], resourceTitle: 'Native permissions guide', resourceDescription: 'Requesting and handling device permissions gracefully.' },
          { title: 'Preparing a release build', duration: '14:30', keyPoints: ['Debug vs release builds', 'App icons, splash screens, and versioning', 'Signing a build for each platform'], notes: ['A release build strips debug tooling and optimizes the JavaScript bundle, and is the only build type that app stores will accept for submission.', 'Both platforms require the build to be signed with a certificate before it can be submitted — losing that signing identity later can make it impossible to publish updates to an existing app listing.'], proTip: 'Back up your signing credentials the moment you generate them — losing them can permanently block future updates to a live app.', resourceTitle: 'Release build checklist', resourceDescription: 'Everything to check before submitting a release build.' },
          { title: 'Submitting to the App Store and Play Store', duration: '15:10', keyPoints: ['Store listing requirements', 'Review process expectations', 'Handling a rejected submission'], notes: ['Both stores require a complete listing — screenshots, description, privacy details — before they\'ll even begin reviewing a submission, so preparing these ahead of time avoids a slow back-and-forth.', 'A rejection almost always comes with a specific reason; reading it carefully and addressing exactly that issue is faster than guessing and resubmitting blindly.'], resourceTitle: 'App store submission guide', resourceDescription: 'Listing requirements and what to expect from review.' },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log(`Seeding ${projectId}/${dataset}...`)

  let categoryTx = client.transaction()
  for (const c of categories) {
    categoryTx = categoryTx.createOrReplace({
      _id: `category-${c.slug}`,
      _type: 'category',
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      description: c.description,
    })
  }
  await categoryTx.commit()
  console.log(`Upserted ${categories.length} categories.`)

  let instructorTx = client.transaction()
  for (const i of instructors) {
    instructorTx = instructorTx.createOrReplace({
      _id: `instructor-${i.slug}`,
      _type: 'instructor',
      name: i.name,
      slug: { _type: 'slug', current: i.slug },
      expertise: [...i.expertise],
      bio: i.bio,
    })
  }
  await instructorTx.commit()
  console.log(`Upserted ${instructors.length} instructors.`)

  let lessonCount = 0
  for (const course of courses) {
    const posterImage = await uploadPlaceholderImage(course.title, course.color)
    const coverImage = posterImage

    // Create every lesson for this course first, then build modules that
    // reference them, then the course that embeds those modules — referenced
    // documents before referencers, per the migration skill's guardrail.
    const moduleObjects: Record<string, unknown>[] = []

    for (const mod of course.modules) {
      let lessonTx = client.transaction()
      const lessonRefs: { _type: 'reference'; _ref: string; _key: string }[] = []

      for (const lesson of mod.lessons) {
        const lessonSlug = slugify(`${course.slug}-${lesson.title}`)
        const lessonId = `lesson-${lessonSlug}`
        lessonTx = lessonTx.createOrReplace({
          _id: lessonId,
          _type: 'lesson',
          title: lesson.title,
          slug: { _type: 'slug', current: lessonSlug },
          videoUrl: course.videoUrl,
          poster: posterImage,
          duration: lesson.duration,
          freePreview: lesson.freePreview ?? false,
          studentCount: Math.round(course.studentCount * (0.2 + Math.random() * 0.3)),
          notes: portableText(lesson.notes),
          keyPoints: lesson.keyPoints,
          proTip: lesson.proTip,
          resources: [
            {
              _type: 'resource',
              _key: key(),
              type: 'link',
              title: lesson.resourceTitle,
              description: lesson.resourceDescription,
              url: `https://vertex.dev/resources/${lessonSlug}`,
            },
          ],
        })
        lessonRefs.push({ _type: 'reference', _ref: lessonId, _key: key() })
        lessonCount += 1
      }

      await lessonTx.commit()

      moduleObjects.push({
        _type: 'module',
        _key: key(),
        title: mod.title,
        summary: mod.summary,
        lessons: lessonRefs,
      })
    }

    await client.createOrReplace({
      _id: `course-${course.slug}`,
      _type: 'course',
      title: course.title,
      slug: { _type: 'slug', current: course.slug },
      summary: course.summary,
      coverImage,
      level: course.level,
      price: course.price,
      popular: course.popular ?? false,
      studentCount: course.studentCount,
      outcomes: course.outcomes.map((o) => ({ _type: 'outcome', _key: key(), ...o })),
      instructor: { _type: 'reference', _ref: `instructor-${course.instructorSlug}` },
      category: { _type: 'reference', _ref: `category-${course.categorySlug}` },
      modules: moduleObjects,
    })
    console.log(`Upserted course "${course.title}" (${course.modules.length} modules, ${course.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons).`)
  }

  console.log(
    `Done. ${categories.length} categories, ${instructors.length} instructors, ${courses.length} courses, ${lessonCount} lessons.`,
  )
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
