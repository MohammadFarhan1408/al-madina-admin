# Agent notes — al-madina-admin

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, styled entirely with
Tailwind CSS 4 (`@theme` tokens in `src/app/globals.css`) and `classnames`
for conditional classes. There is **no MUI/Emotion here anymore** — the app
was originally scaffolded from a commercial MUI admin theme, but every MUI
dependency, the `@core`/`@layouts`/`@menu` vendored folders, and all
Theme-branded components have been fully removed. Don't look for
`CustomTextField`, `OptionMenu`, `CustomTabList`, or any `@core` import —
none of it exists; the equivalents below replaced it.

## Architecture: layer + feature

- `src/features/<domain>/{api,hooks,components,schema,types}` — one folder
  per business domain (products, orders, customers, collections,
  categories, coupons, roles, tags, reviews, notifications, dashboard,
  auth). API calls live only in `hooks/` (TanStack Query), request/response
  validation only in `schema.ts` (Zod), and types only in `types.ts`. Don't
  put a fetch call or a Zod schema directly in a component.
- `src/views/<domain>/<Domain>View.tsx` — page-level composition (the
  list/detail/create/edit screen itself). `src/app/<route>/page.tsx` files
  are thin wrappers that just import and render the matching view — if a
  route file grows a `useState`/`useEffect`, that logic belongs in the view
  instead.
- Nav entries live in `src/data/navigation/sidebarNavData.ts`.

## UI layer: `components/ui/` (primitives) + `components/shared/` (composed)

`src/components/ui/` holds style-agnostic, `forwardRef` primitives (Button,
Input, Select, Card, Modal, Dropdown, Table, Field, IconButton, DateInput,
Popover, Radio, Skeleton, EmptyState, etc.). House style for these:

- Variant/size/tone lookup tables are named `const`s at module scope
  (`sizeClasses`, `colorClasses`, …) above the component — never an inline
  ternary chain buried in JSX.
- `Field.tsx` exports the shared control surface (`controlBase`,
  `controlHeight`, `controlTone`, `controlState`) that `Input`, `Select`,
  `Combobox`, `SearchSelect` all build on, so every form control has an
  identical height, border, focus ring and error state. Reuse these before
  writing new control-surface classes.
- Types stay colocated in the component file (matches `Button.tsx`/
  `Card.tsx`/`Field.tsx`) — only split out a `*.types.ts` if a type needs to
  be imported by 3+ files outside the component itself.

`src/components/shared/` is this app's own reusable page-building layer —
`DataTable`, `PageHeader`, `Breadcrumbs`, `ConfirmDialog`, `ImageUpload`/
`ZoomableImage`, `DetailSection`/`DetailRow`, `SeoFieldsSection`,
`StatusChip`, `RowActions`, `SearchField`, `PriceRangeFilter`. Every list/
CRUD page is assembled from these:

- `PageHeader` + `Breadcrumbs` + `DataTable` (server-paginated by default;
  pass `manualPagination={false}` for a small, fully-loaded list — see
  `CategoriesView.tsx`) + a toolbar + `RowActions` (the "⋮" kebab menu,
  built on `ui/Dropdown`) for 2+ row actions — skip it for a single action.
- `ConfirmDialog` for delete confirmations.
- `DetailSection`/`DetailRow` for read-only key/value blocks on Detail
  pages; `ProductDetailView.tsx`/`OrderDetailView.tsx` are good references
  for a multi-section Detail layout.
- `StatusChip` for any domain enum (order/payment status, loyalty tier,
  product badge, active/inactive) — it centralizes the string→colour
  mapping in one `COLOR_MAP`; don't hand-roll another status→colour switch.
- Multi-section Create/Edit forms (Product-style, 10+ fields) use a
  2-column `Grid` of `Card`s — check `ProductForm.tsx` first before
  inventing a one-off layout.

**Reuse before adding**: check `components/ui/` and `components/shared/`
first for anything you're about to build (a new field type, a new list
layout, a new dialog shape). Only add a new shared component when a genuine
cross-page gap exists — that's how `SearchField`, `ZoomableImage` and
`PriceRangeFilter` came to exist.

## Cross-cutting infra

- `src/libs/format.ts` — the only place for `formatCurrency`/`formatDate`/
  `formatDateTime`/`humanize`. Don't call `Intl.NumberFormat`/
  `Intl.DateTimeFormat` directly elsewhere.
- `src/libs/api/` — the Axios client and shared API response types
  (`getErrorMessage(err, fallback)` for mutation error toasts).
- `src/contexts/`, `src/hooks/` — app-wide context/hooks (toast, filter
  reset) used across features.
- `src/app/globals.css` — the single source of truth for design tokens
  (`@theme { --color-*, --radius-*, --shadow-*, --text-* }`), plus a
  hand-rolled minimal preflight and two bespoke utilities (`.am-corner-*`,
  `.am-deco-bg`) for the Art Deco corner-frame motif. No `@apply`, no second
  styling system — don't introduce one.

## Where things are documented

- `docs/architecture.md`, `docs/api-reference.md`, `docs/authentication.md`,
  `docs/business-rules.md`, `docs/database.md`, `docs/deployment.md`,
  `docs/mobile-flow.md`, `docs/admin-flow.md` — workspace-level docs, one
  level up (`../docs/`). Read these before assuming how the backend or the
  mobile app behaves.
- `.claude/CLAUDE.md` at the workspace root — permanent project memory.

## Authorization stays simple — don't rewire it casually

Authorization is a plain 3-value `role` enum (`user|manager|admin`) on the
`User` model, enforced by `requireRole` middleware in the backend
(`al-madina-api/src/middlewares/auth.middleware.ts`). Even if a Role/
Permission data model exists for display purposes, treat it as informational
unless a task explicitly asks you to change how routes are authorized —
that's a security-sensitive change that needs its own explicit sign-off.
