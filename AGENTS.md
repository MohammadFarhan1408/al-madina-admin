# Agent notes — al-madina-admin

## This is a trimmed theme starter-kit, not the full commercial template

This app was scaffolded from a commercial MUI admin dashboard theme
(Theme/Materio-style — signature `src/@core/`, `src/@layouts/`, `src/@menu/`
vendored folders). **Only the base scaffold survived in this repo.** There is
no demo/marketing page bundle checked into this repo — no shipped Product/
Order/Customer detail pages, no pricing cards, no "apps" gallery. The full
commercial source (with all of that) exists **outside this repo** — see the
next section before concluding a pattern "doesn't exist in Theme".

## Before building any UI: check Theme first — including the full source

Before writing a new component, layout, or page — detail view, form, table,
dialog/drawer, pagination, filter bar, upload widget, profile/account page,
breadcrumbs, whatever — **check what Theme already provides first**, in two
places:

1. **This repo's `src/@core/`, `src/@layouts/`, `src/@menu/` first** — fastest
   check, already here. It's thin: MUI primitive wrappers (`TextField`,
   `Autocomplete`, `Avatar`, `Badge`, `Chip`, `IconButton`, `TabList`) plus
   two genuinely reusable, fully-functional components worth checking before
   reaching for anything else: `@core/components/option-menu/` (kebab-menu
   dropdown — used for list-table row actions project-wide) and
   `@core/components/custom-inputs/` (selectable radio/checkbox cards).
2. **The full commercial Theme v10.11.1 source, outside this repo** — the
   licensed package this starter-kit was cut from. It moves between machines/
   download folders, so **ask the user for its current path** if you don't
   already have it in context; don't assume it's unavailable just because
   it's not vendored here. Once located, its
   `nextjs-version/typescript-version/full-version/src/views/apps/ecommerce/`
   is the closest reference for this project's admin (products, orders,
   customers, reviews, settings all have full demo implementations there).

**Important when adapting a full-version pattern**: many of its demo files
are non-functional placeholders — hardcoded data arrays, no real mutations,
no loading states, fake two-step "success" dialogs. Compare against this
repo's actual `src/components/shared/*` / `src/features/*` implementation
before replacing anything with it — several of our components (`DataTable`,
`ConfirmDialog`, `ImageUpload`) are already more capable than Theme's own
demo equivalents (server+client dual-mode pagination, real async mutations
with loading states, real Cloudinary upload wiring). **Adopt Theme's
layout/visual pattern onto our existing logic — don't copy-paste their demo
code wholesale**, and say explicitly when a piece of this repo's UI is
already better than the source it's being compared against, rather than
replacing it reflexively.

This repo's own `src/components/shared/` layer (`DataTable`, `PageHeader`,
`Breadcrumbs`, `ImageUpload`, `ConfirmDialog`, `DetailSection`/`DetailRow`,
`SeoFieldsSection`, etc.) exists because the trimmed `@core` has no bundled
detail-page, profile-page, or upload-widget template — treat that shared
layer as this app's own Theme-equivalent and reuse it before adding
anything new.

## New admin pages: reuse existing shared components first

Every list/CRUD page in this app (Products, Categories, Collections, Orders,
Customers, Reviews, Notifications, and anything added later) is assembled
from the same shared building blocks:

- `src/components/shared/PageHeader.tsx`
- `src/components/shared/Breadcrumbs.tsx`
- `src/components/shared/DataTable.tsx` (server-paginated by default; pass
  `manualPagination={false}` for small, fully-loaded lists — see
  `CategoriesView.tsx`. Pagination footer is Theme-style: "Showing X to Y of
  Z entries" + a rounded page-number `Pagination`, not the raw MUI
  `TablePagination` prev/next arrows.)
- `src/components/shared/SearchField.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/ImageUpload.tsx` / `ZoomableImage.tsx` (drop-zone
  visual matches Theme's dashed-border card look; upload logic is our own,
  wired to Cloudinary)
- `src/components/shared/DetailSection.tsx` / `DetailRow.tsx` — read-only
  key/value blocks for Detail pages
- `@core/components/mui/TextField` (`CustomTextField`) for every form field
  — never a raw MUI `TextField`
- `@core/components/option-menu` (`OptionMenu`) for list-table row actions
  with 2+ items — one visible primary `IconButton` (View/Edit) + the rest in
  the kebab menu. Skip it for a single action (e.g. Orders' View-only,
  Reviews' Delete-only) — a one-item kebab is a regression, not a pattern.
- `@core/components/mui/TabList` (`CustomTabList`) + MUI Lab
  `TabContext`/`TabPanel` for a Detail page with a left profile-card + right
  tabbed-content layout (see `CustomerDetailView.tsx`)
- `src/libs/api/types.ts`'s `getErrorMessage(err, fallback)` for mutation
  error toasts

A new list page is: `PageHeader` + `Breadcrumbs` + `DataTable` (+ toolbar,
row actions via `OptionMenu`) + a dedicated Create/Edit page (form component
shared between both, per the List→Detail→Create→Edit convention) +
`ConfirmDialog` for delete. A Detail page with enough content to warrant more
than a flat `DetailSection` stack (Customer/Order-style records) uses the
left-card + right-tabs or header + 2-column-card-grid layout — check an
existing Detail view of similar shape first. Multi-section Create/Edit forms
(Product-style, 10+ fields) use a 2-column `Grid` of `Card`s (content left,
pricing/organize/SEO right) rather than one long column — check
`ProductForm.tsx` first. **Do not invent a bespoke one-off layout per
feature** — only add a new shared component when a genuine cross-page gap
exists (that's how `SearchField` and `ZoomableImage` came to exist —
several pages needed the same thing and had none).

Feature code lives in `src/features/<domain>/{api,hooks,components,schema,
types}`; the page itself lives in `src/views/<domain>/<Domain>View.tsx`,
routed from `src/app/(dashboard)/<domain>/page.tsx`, with a nav entry in
`src/data/navigation/verticalMenuData.tsx` (and `horizontalMenuData.tsx`).

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
