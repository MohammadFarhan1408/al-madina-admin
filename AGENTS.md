# Agent notes — al-madina-admin

## This is a trimmed theme starter-kit, not the full commercial template

This app was scaffolded from a commercial MUI admin dashboard theme
(Materio/Materialize-style — signature `src/@core/`, `src/@layouts/`,
`src/@menu/` vendored folders). **Only the base scaffold survived.** There is
no demo/marketing page bundle anywhere in this repo — no shipped Roles &
Permissions page, no pricing cards, no "apps" gallery. If you're looking for a
pre-built template page to reuse for a new feature, **it does not exist here**
— stop looking and build from the app's own existing pages instead.

## New admin pages: reuse existing shared components first

Every list/CRUD page in this app (Products, Categories, Collections, Orders,
Customers, Reviews, Notifications, and anything added later) is assembled
from the same shared building blocks:

- `src/components/shared/PageHeader.tsx`
- `src/components/shared/Breadcrumbs.tsx`
- `src/components/shared/DataTable.tsx` (server-paginated by default; pass
  `manualPagination={false}` for small, fully-loaded lists — see
  `CategoriesView.tsx`)
- `src/components/shared/SearchField.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/ImageUpload.tsx` / `ZoomableImage.tsx`
- `@core/components/mui/TextField` (`CustomTextField`) for every form field
  — never a raw MUI `TextField`
- `src/libs/api/types.ts`'s `getErrorMessage(err, fallback)` for mutation
  error toasts

A new page is: `PageHeader` + `Breadcrumbs` + `DataTable` (+ toolbar) + a form
`Dialog`/`Drawer` built from `CustomTextField`/`MenuItem` + `ConfirmDialog`
for delete. **Do not invent a bespoke one-off layout per feature.** Only add
a new shared component when a genuine cross-page gap exists (that's how
`SearchField` and `ZoomableImage` came to exist — several pages needed the
same thing and had none).

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
