# Stage 4: Types

**Purpose:** Extract all TypeScript interfaces and types from component, hook, and utility files into dedicated `*.types.ts` files.

---

## Auto-Skip Condition

If Stage 2 analysis found **no inline type definitions** in the target, skip this stage. Update sidecar Stage 4 as `skipped` and proceed to Stage 5.

---

## Collaboration Model

Present what will be extracted and where it will go. Get sign-off before making changes.

---

## What to Extract

- `interface` and `type` declarations defined inside component, hook, or utility files
- Props interfaces (e.g. `interface ServiceCardProps`)
- Domain model types (e.g. `interface EngineerService`, `type ServiceStatus`)
- Zod schema types inferred with `z.infer<typeof ...>` — keep the Zod schema co-located with validation logic; only extract the inferred type if reused elsewhere
- Re-exported types from third-party libraries that are used across multiple files

## What NOT to Extract

- Types used only once, locally, in a small function — leave them inline
- Generic utility types (`Maybe<T>`, `Nullable<T>`) — these belong in `src/shared/types/` if they don't exist there already
- Zod schemas themselves — stay with the validation logic

---

## Destination Rules

| Type | Destination |
|------|------------|
| Props interface for a component | `{feature-name}.types.ts` in same feature folder |
| Domain model type used in 1 feature | `{feature-name}.types.ts` |
| Domain model type used in 2+ features | `src/shared/types/{name}.types.ts` |

---

## Execution

For each extraction:
1. Move the type definition to the destination file
2. Add the import in the source file
3. Verify all references still resolve

---

## Sidecar Update

Update sidecar Stage 4:
- Status: completed
- Types extracted (list names and destination files)

---

## Progression

Load `./references/05-constants.md`.
