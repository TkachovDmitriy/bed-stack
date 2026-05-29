# Stage 2: Test Plan

**Purpose:** Analyze the loaded context and produce a test plan for user approval before any test code is written.

---

## Analyze Context

Read the story, architecture, and pipeline artifacts to extract:

**From the story:**
- User flows and acceptance criteria
- Roles involved (artist, engineer, listener, admin)
- Key actions the user performs
- Expected outcomes and error states

**From the architecture:**
- Components, hooks, and utilities introduced
- Supabase tables, edge functions, or RPC calls added
- Data flow and state management patterns

**From the pipeline:**
- Exactly which files were created or modified
- Which layers were changed (data, API, UI)

---

## Generate Test Plan

Based on mode and coverage, produce a structured test plan.

### E2E Plan (if mode includes `e2e`)

List Playwright scenarios grouped by flow:

```
E2E Test Plan — {story title}

Flow: {main user action from story}
  ✓ [smoke]    Happy path — {expected outcome}
  ✓ [standard] Edge case — {edge scenario}
  ✓ [full]     Error case — {error scenario}
  ✓ [full]     Unauthorized access — role guard works

Flow: {secondary flow if exists}
  ...

Test file: e2e/{feature-name}.spec.ts
```

Only include scenarios up to the selected coverage level.

### Unit Plan (if mode includes `unit`)

List functions and components to test:

```
Unit Test Plan — {story title}

Hook: use{HookName}
  ✓ returns correct data on success
  ✓ [standard] handles loading state
  ✓ [full] handles error state

Component: {ComponentName}
  ✓ renders without crashing
  ✓ [standard] shows correct content for each prop variant

Test files: src/hooks/__tests__/use{HookName}.test.ts
            src/components/__tests__/{ComponentName}.test.tsx
```

### Request Plan (if mode includes `request`)

List edge functions and RPC calls to test:

```
Request Test Plan — {story title}

Edge Function: {function-name}
  ✓ returns 200 for valid authenticated request
  ✓ [standard] returns 401 for unauthenticated request
  ✓ [standard] returns 400 for invalid payload
  ✓ [full] handles database error gracefully

Test file: supabase/functions/__tests__/{function-name}.test.ts
```

---

## Present Plan for Approval

Show the full plan and ask:

"Here's the test plan for **{story title}**. Does this look right, or would you like to adjust any scenarios before I generate the code?"

Options:
- **[Y] Approve** — proceed to generation
- **[Edit]** — user can specify additions, removals, or changes
- **[Skip mode]** — skip a specific mode if not needed now

Update sidecar Stage 2 status to `completed` with approved plan summary.

---

## Progression

When user approves, load the appropriate generation stage(s) based on mode:

- `unit` → load `./references/03-unit.md`
- `request` → load `./references/03-request.md`
- `e2e` → load `./references/03-e2e.md`
- `all` → load `03-unit.md` first, then `03-request.md`, then `03-e2e.md` in sequence
