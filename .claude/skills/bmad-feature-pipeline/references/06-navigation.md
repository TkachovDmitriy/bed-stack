# Stage 6: Navigation

**Purpose:** Implement all routes and page shell components for the feature before building any UI content. Establishing navigation first ensures UI development in Stage 8 has stable targets to render into.

**Best practices:** All work must comply with `{project-root}/.claude/rules/best-practices.md`.

---

## Collaboration Model

**Plan first:** Present the complete navigation plan — every route, its path, the component it renders, and where it fits in the router config. Get sign-off.

---

## Planning

Based on the architecture document, identify every screen/page this feature requires:

- **Route paths** — URL structure, path params, query params
- **Router placement** — does this route belong in `mainRoutes.tsx` (public) or `dashboardRoutes.tsx` (authenticated)?
- **Role guards** — does the route need `ArtistOnlyRoute`, `EngineerOnlyRoute`, or other role protection from `src/components/dashboard/RouteProtection`?
- **Page hierarchy** — nested routes, shared layouts, parent/child relationships
- **Navigation links** — does this feature need entries in `DashboardNavigation`, `UserNavigation`, or `buildMobileMenu`?

Present the plan as a route table: path | component | layout | guard | nav entry.

---

## Implementation

Once approved:

1. Create page shell components in the appropriate `src/pages/` subfolder — named exports, TypeScript, no implementation logic yet (just a `<div>` with the page name so routes are testable)
2. Register all routes in `src/router/mainRoutes.tsx` or `src/router/dashboardRoutes.tsx`
3. Add navigation entries where needed (dashboard nav, user nav, mobile menu)
4. Apply role guards to protected routes

Page shells use lowercase-with-dashes filenames (e.g., `src/pages/dashboard/feature-name-page.tsx`).

---

## Verification

After implementing, trace every route and confirm:
- All routes resolve to a component (no missing imports)
- Role guards are correctly applied
- Navigation entries point to the right paths
- No existing routes are broken

---

## Sidecar Update

Update the sidecar changelog for Stage 6:
- Status: completed
- Routes registered
- Navigation changes made
- Page shells created

---

## Progression

When the developer approves, load `./references/07-data-connections.md`.
