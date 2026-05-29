# Stage 11: Validation

**Purpose:** Verify the refactored code meets naming conventions, SOLID principles, and best-practices.md standards. Produce the final refactor artifact summarizing all changes.

---

## Validation Checklist

Work through each check. Flag any failures with file and line reference. Fix minor issues directly; flag major issues for developer decision.

### File & Naming Conventions

- [ ] All files use `lowercase-with-dashes` naming
- [ ] Correct suffixes applied: `.types.ts`, `.consts.ts`, `.utils.ts`, `.api.ts`, `.query.ts`, `.hook.ts`
- [ ] Components use `PascalCase`, files use `lowercase-with-dashes.tsx`
- [ ] Boolean variables prefixed: `isLoading`, `hasError`, `shouldRefresh`
- [ ] Hook files prefixed with `use`
- [ ] No files named generically (`utils.ts`, `helpers.ts`, `types.ts` without feature prefix)

### TypeScript

- [ ] No `any` types introduced (existing `any` from `noImplicitAny: false` is acceptable if pre-existing)
- [ ] Props interfaces defined and exported
- [ ] Function return types explicit where non-obvious
- [ ] `interface` used over `type` for object shapes

### Component Quality

- [ ] Components contain no direct Supabase calls
- [ ] Components contain no `useEffect` data fetching
- [ ] No large inline business logic blocks
- [ ] Named exports used throughout
- [ ] `function` keyword used for pure functions (not arrow functions at top level)
- [ ] No unnecessary `useEffect` or `useState` remaining in components

### API Layer

- [ ] All Supabase calls in `*.api.ts` files
- [ ] API functions are plain async functions (no hooks)
- [ ] Error handling: `if (error) throw error` pattern used
- [ ] No direct `supabase` client calls in components or hooks

### Query Layer

- [ ] Query keys defined as typed `const` objects
- [ ] `useMutation` hooks invalidate relevant query keys on success
- [ ] `enabled` guard used where query depends on a nullable param
- [ ] No `useEffect` data fetching remaining

### Hook Layer

- [ ] Custom hooks extract coherent units of logic
- [ ] Hooks return only what consumers need
- [ ] No logic duplication between hooks and components

### SOLID Principles (functional interpretation)

- [ ] **Single Responsibility** — each file does one thing (component renders, hook manages state, api fetches, utils transforms)
- [ ] **Open/Closed** — logic extended via composition, not by modifying existing functions
- [ ] **Dependency Inversion** — components depend on hooks/queries, not directly on Supabase

### Folder Structure

- [ ] Feature folder follows the feature-centralized convention
- [ ] `shared/` contains only items used by 2+ features
- [ ] `components/` sub-folder is flat (no nested component folders)
- [ ] No cross-feature imports (features only import from `shared/` or their own folder)

---

## Produce Refactor Artifact

Save the completed artifact to `{project-root}/_bmad-output/implementation-artifacts/{target-name}.refactor.md`:

```markdown
---
target: {target-path}
scope: {file | folder}
completed: {current-date}
stages-executed: [list of non-skipped stages]
stages-skipped: [list of skipped stages]
---

# Refactor Summary: {target-name}

## What Changed

### Folder Structure
- [before/after file tree or description of moves]

### Types Extracted
- `{TypeName}` → `{destination-file}`

### Constants Extracted
- `{CONSTANT_NAME}` → `{destination-file}`

### Utils Extracted
- `{functionName}` → `{destination-file}`

### API Functions Created
- `{functionName}()` → `{destination-file}`

### Query Hooks Created
- `{useHookName}()` → `{destination-file}`

### Custom Hooks Created
- `{useHookName}()` → `{destination-file}`

### Components Decomposed
- `{ComponentName}` split into: {list sub-components}

### Shared/ Promotions
- `{name}` promoted to `src/shared/{layer}/` — used by: {feature list}

## Shared/ Candidates (flagged, not moved)
- `{name}` in `{file}` — similar to `{existing-shared-file}`. Review for consolidation.

## Validation Results
- Checks passed: {n}
- Issues fixed: {list}
- Issues flagged for review: {list}

## Files Modified
{list of all files touched}

## Files Created
{list of all new files}
```

---

## Sidecar Update

Update sidecar Stage 11:
- Status: completed
- Validation issues found and resolved
- Artifact path noted

---

## Done

Present the artifact location to the developer. Offer to run `bmad-review-adversarial-general` on the refactored code if they want a deeper quality check.
