# Technology Stack & Coding Standards

## 1. Core Stack
- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 4.x (No tailwind.config.ts, CSS-first config)
- **Library**: React 19.2.3 (RSC & Server Actions native)
- **UI Architecture**: shadcn/ui (Style: New York, CSS Variables)
- **Icons**: `lucide-react` Only

## 2. State & Data
- **Server State**: React Server Components (RSC) + Server Actions
- **Client State**: `useState`, `useReducer` (React 19 Hooks)
- **Database**: Supabase
- **ORM**: Supabase JS Client (`@supabase/supabase-js` ^2.90, `@supabase/ssr` ^0.8)
- **Data Access Rule**: Sensitive reads/writes must run on the server (RSC, Server Actions, or Route Handlers) only.
- **RLS**: Assume Row Level Security is enabled (default deny).

## 3. Forms & Validation
- **Form Management**: `react-hook-form` ^7.71
- **Schema Validation**: `zod` ^4.3
- **Resolver**: `@hookform/resolvers`
- **Pattern**: One Zod schema per form. Do not duplicate validation logic.

## 4. Key Libraries
- **Dates**: `date-fns` ^4.1
- **Toasts**: `sonner` ^2.0
- **Utilities**: `clsx`, `tailwind-merge`
- **Animations**: `tw-animate-css`

## 5. Coding Patterns
- **Server Actions**: Use for all mutations.
- **Server Action Result**: Prefer a consistent shape `{ ok: true, data: T } | { ok: false, error: string }`.
- **Type Safety**: No `any`. Use `unknown` if necessary.
- **File Naming**: `kebab-case` for files/folders.
- **Components**: Functional components only.

## 6. CSS Rules
- **Print**: use `@media print` with explicit page sizing (e.g., thermal labels).
- **Z-Index**: Use Tailwind's z-index scale.
