# Stage 5: Constants

**Purpose:** Extract magic strings, static data, and hardcoded values into dedicated `*.consts.ts` files.

---

## Auto-Skip Condition

If Stage 2 analysis found **no magic strings or static data** in the target, skip this stage. Update sidecar Stage 5 as `skipped` and proceed to Stage 6.

---

## Collaboration Model

Present what will be extracted with proposed constant names. Get sign-off before making changes.

---

## What to Extract

- Hardcoded string literals used as labels, keys, route paths, or identifiers
- Static arrays or objects defined inside a component or hook (e.g. dropdown options, tab configs)
- Repeated literal values (numbers, strings) appearing in 2+ places
- Config-like values that could change (limits, thresholds, default values)

## What NOT to Extract

- Strings used only once, purely for JSX display text with no logic dependency — leave inline
- Tailwind class strings — leave inline
- Test fixture data

---

## Naming Conventions

- Use `SCREAMING_SNAKE_CASE` for primitive constants: `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`
- Use `camelCase` for object/array constants: `serviceCategories`, `filterOptions`
- Group related constants with a comment block or namespace object

```typescript
// Route paths
export const ROUTES = {
  ENGINEER_SERVICES: '/engineer-services',
  SERVICE_DETAIL: '/engineer-services/:id',
} as const

// Limits
export const MAX_SERVICE_IMAGES = 5
export const DEFAULT_PAGE_SIZE = 10
```

---

## Destination Rules

| Constant | Destination |
|----------|------------|
| Used in 1 feature | `{feature-name}.consts.ts` |
| Used in 2+ features | `src/shared/constants/{name}.consts.ts` |

---

## Execution

For each extraction:
1. Add the constant to the destination file with appropriate naming
2. Replace the inline value with the imported constant
3. Verify all references resolve

---

## Sidecar Update

Update sidecar Stage 5:
- Status: completed
- Constants extracted (list names and destination files)

---

## Progression

Load `./references/06-utils.md`.
