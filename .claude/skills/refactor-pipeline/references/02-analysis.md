# Stage 2: Analysis

**Purpose:** Scan the target, map all violations by layer, detect `shared/` candidates, and produce a refactor plan with proposed folder structure for sign-off before any code changes.

---

## Collaboration Model

**Plan first:** Announce what you will scan and what the analysis will produce. Get sign-off, then execute.

---

## Scope Detection

Determine the refactor scope from the target path:

- **Single file** — analyse that file only; identify what should be extracted and where it should go
- **Feature folder** — analyse all files in the folder; map the full layer breakdown and folder reorganization needed

---

## Analysis Pass

Read all target files. For each, identify violations grouped by layer:

### Layer Violations to Detect

**Types layer**
- Interfaces or types defined inline in component files
- Types duplicated across files
- Missing or misplaced type files

**Constants layer**
- Magic strings (hardcoded labels, keys, route paths, config values)
- Static arrays or objects defined inside components or hooks
- Repeated literal values across files

**Utils layer**
- Pure helper functions defined inside components or hooks
- Duplicated logic across files that could be a shared util
- Functions with no side effects that don't belong in a hook

**API layer**
- Direct `supabase.from(...)`, `supabase.rpc(...)`, `supabase.storage(...)` calls inside components or hooks
- Inline query construction that should be an abstracted API function

**Query layer**
- Missing `useQuery` / `useMutation` wrappers around Supabase calls
- Data fetching logic inside `useEffect` instead of React Query
- No error/loading state handling via React Query patterns

**Hook layer**
- Business logic, derived state, or event handlers living directly in component JSX
- `useState` + `useEffect` combinations that belong in a custom hook
- Props drilling that signals missing hook abstraction

**UI layer**
- Components over ~150 lines that mix layout, logic, and data concerns
- Repeated JSX patterns that should be extracted into sub-components
- Conditional rendering blocks large enough to be their own component

---

## Shared/ Candidate Detection

Scan `src/` (outside the target) for:
- Functions, types, constants, or hooks defined in the target that are **already imported elsewhere**
- Patterns in the target that **duplicate** something already in `src/shared/`

Flag each candidate with:
- What it is
- Where it's currently used (list all files)
- Recommended destination in `src/shared/`

---

## Refactor Plan Output

Produce a structured refactor plan covering:

1. **Target summary** — what the target currently does, scope, file count
2. **Violations by layer** — table of findings, severity (high/medium/low), and recommended action
3. **Shared/ candidates** — list of things to promote, with usage locations
4. **Proposed folder structure** — show the before/after file tree
5. **Layer execution order** — which layers apply (auto-skip empties), estimated change size per layer
6. **Risks** — anything that could break during refactor (imports, re-exports, prop interfaces, etc.)

---

## Sign-Off

Present the refactor plan to the developer. Discuss any non-obvious moves. Allow the developer to:
- Exclude specific layers ("skip utils, nothing to extract")
- Adjust the proposed folder structure
- Mark shared/ candidates as "keep local" if not appropriate to promote

Reach explicit agreement before proceeding.

---

## Sidecar Update

Update sidecar Stage 2:
- Status: completed
- Violations count per layer
- Shared/ candidates count
- Proposed folder structure noted
- Layers to execute (skipped layers listed)

---

## Progression

When the developer approves the plan, load `./references/03-folder-structure.md`.
