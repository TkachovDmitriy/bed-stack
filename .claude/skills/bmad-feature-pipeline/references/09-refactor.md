# Stage 9: Refactor (Optional)

**Purpose:** Scan all implementation files produced in Stages 4–8 for violations of the project best practices. If nothing significant is found, skip this stage entirely and proceed. If violations are found, propose and execute only the targeted fixes needed — not a full restructure.

---

## When to Skip

After scanning, if there are **no high-severity violations** and only minor or zero issues across all layers, announce that no meaningful refactor is needed and load `./references/09-review-validation.md` immediately. Do not manufacture work.

---

## Scan Scope

Read every file created or modified in Stages 4–8 (use the sidecar changelog as the file list). Scan against `{project-root}/.claude/rules/best-practices.md` and check for violations by layer:

**Types**
- Interfaces or types defined inline in component files instead of extracted to `*.types.ts`
- Types duplicated across files

**Constants**
- Magic strings, hardcoded labels, config values, or route paths inside components/hooks
- Static arrays/objects defined inside a component render scope

**Utils**
- Pure helper functions with no side effects living inside components or hooks
- Duplicated logic across files that belongs in a shared util

**API layer**
- Direct `supabase.from(...)` / `supabase.rpc(...)` / `supabase.storage(...)` calls inside components or hooks

**Query layer**
- Data fetching inside `useEffect` instead of React Query
- Missing error/loading state handling via React Query patterns

**Hook layer**
- Business logic, derived state, or event handlers living directly in component JSX
- `useState` + `useEffect` combinations that belong in a custom hook

**UI layer**
- Components over ~150 lines mixing layout, logic, and data concerns
- Repeated JSX patterns that should be a sub-component
- Missing early returns / guard clauses replacing nested conditionals
- Nested `if/else` where an `if-return` pattern applies
- Missing TypeScript types on props or return values

---

## Collaboration Model

Present a findings table (layer → violation → severity → file). If all severities are low and count is small, recommend skipping. Otherwise get sign-off on which fixes to apply before touching any file.

| Severity | Description | Action |
|----------|-------------|--------|
| **High** | Direct Supabase in component, `useEffect` data fetching, components >150 lines with mixed concerns | Fix |
| **Medium** | Magic strings, inline types, missing hook extraction | Fix if quick |
| **Low** | Minor naming, small style inconsistencies | Skip — not worth the churn |

Only fix High and agreed Medium findings. Do not refactor architecture or data flow — those are locked.

---

## Execution

Apply fixes one layer at a time (same order as refactor-pipeline: types → constants → utils → api → query → hook → ui). Present each change before writing. Skip any layer with no findings.

---

## Sidecar Update

Update the sidecar changelog for Stage 9:
- Status: completed or skipped
- Violations found (count by layer)
- Fixes applied or reason for skip

---

## Progression

When done (or skipped), load `./references/10-review-validation.md`.
