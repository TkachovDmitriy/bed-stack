# Stage 6: Utils

**Purpose:** Extract pure helper functions into `*.utils.ts` files, and flag any duplicates already present in `src/shared/utils/` for developer review.

---

## Auto-Skip Condition

If Stage 2 analysis found **no extractable pure functions** in the target, skip this stage. Update sidecar Stage 6 as `skipped` and proceed to Stage 7.

---

## Collaboration Model

Present the list of functions to extract, their proposed destinations, and any deduplication flags. Get sign-off before making changes.

---

## What to Extract

A function qualifies for extraction if:
- It has no side effects (no state mutations, no API calls, no DOM access)
- It takes inputs and returns a value deterministically
- It is not tightly bound to React lifecycle (no hooks inside)
- It could be unit tested in isolation

Examples: formatters, validators, calculators, transformers, parsers, sorters, mappers.

## What NOT to Extract

- Functions that call `useState`, `useRef`, `useEffect` — these belong in hooks
- Functions that call Supabase directly — these belong in the API layer
- One-liners used only once — keep inline
- Event handlers (onClick, onChange) — stay in component or hook

---

## Deduplication Check

Before extracting, scan `src/shared/utils/` for functions with similar names or behavior to what you're about to extract.

**If a match is found:**
- Flag it to the developer: "This function looks similar to `formatCurrency` in `src/shared/utils/currency.utils.ts`. Should we reuse the existing one instead?"
- Do NOT auto-replace — wait for developer decision
- If developer confirms reuse: delete the local function, import from shared
- If developer wants to keep local: extract as planned

---

## Destination Rules

| Util | Destination |
|------|------------|
| Used in 1 feature | `{feature-name}.utils.ts` |
| Used in 2+ features | `src/shared/utils/{name}.utils.ts` |

---

## Execution

For each extraction:
1. Move the function to the destination file with its JSDoc comment (if any)
2. Add the import in the source file
3. Verify all call sites still resolve

---

## Sidecar Update

Update sidecar Stage 6:
- Status: completed
- Utils extracted (list function names and destination files)
- Deduplication flags raised and decisions recorded

---

## Progression

Load `./references/07-api-layer.md`.
