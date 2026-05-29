# Stage 7: Data Connections

**Purpose:** Wire every page and component to the data layer — connecting UI shells to the hooks and API from Stage 5, ensuring complete functional coverage across all screens before visual polish begins.

**Best practices:** All work must comply with `{project-root}/.claude/rules/best-practices.md`.

---

## Collaboration Model

**Plan first:** Present the full wiring plan — for every page/screen, which hooks it uses, what data it displays, what mutations it triggers, how loading/error states are handled. Get sign-off.

---

## Planning

Map every screen from Stage 6 to its data requirements:

| Screen | Queries used | Mutations used | Loading state | Error state | Empty state |
|--------|-------------|----------------|---------------|-------------|-------------|
| ...    | ...         | ...            | ...           | ...         | ...         |

Identify:
- **Shared state** — data needed by multiple screens (use Zustand store or React Query cache)
- **Derived state** — computed values that shouldn't live in the server cache
- **Auth context** — which screens need `useAuth()` for user identity or role checks
- **Optimistic updates** — mutations that should update UI before server confirms

---

## Implementation

For each screen, wire data connections:

- Import and call the appropriate hooks from Stage 5
- Handle all three states: loading (skeleton/spinner), error (user-facing message), success (data display)
- Pass data down to child components via props — keep data fetching at the page level
- Implement form submissions using `react-hook-form` + Zod + the mutation hooks
- Apply role-based rendering where needed (show/hide elements based on user role)

Follow the project pattern: data fetching in page components, presentation in child components.

---

## Functional Completeness Check

After wiring all screens, verify:
- Every acceptance criterion from Stage 2 has a corresponding UI flow that works end-to-end
- All user actions (create, read, update, delete) are connected to their respective mutations
- No screen has unhandled loading or error states
- Role-based access is enforced in the UI (not just on the route level)
- No `any` types in data flow

Present the completeness matrix to the developer — acceptance criterion vs. wired screen.

---

## Sidecar Update

Update the sidecar changelog for Stage 7:
- Status: completed
- Screens wired
- State management decisions
- Any gaps found and resolved

---

## Progression

When the developer confirms functional completeness, load `./references/08-ui-development.md`.
