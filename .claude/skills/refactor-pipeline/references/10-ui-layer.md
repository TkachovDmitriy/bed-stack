# Stage 10: UI Layer

**Purpose:** Decompose large or mixed-concern components into smaller, focused UI components. After all logic has been extracted in previous stages, this stage makes the remaining JSX clean and composable.

---

## Auto-Skip Condition

If Stage 2 analysis found **no components requiring decomposition** (all components are already lean and focused), skip this stage. Update sidecar Stage 10 as `skipped` and proceed to Stage 11.

---

## Collaboration Model

Present the decomposition plan — which components to split, what each sub-component will contain, and the proposed names. Get sign-off before making changes.

---

## When to Split a Component

Split when a component:
- Exceeds ~100 lines after logic extraction (stages 7–9)
- Contains clearly distinct visual regions (e.g. header, body, actions)
- Renders a repeated pattern that could be a standalone item (e.g. a card in a list)
- Has a large conditional block that renders a completely different UI

Do NOT split just to hit a line count. If a 120-line component is clean and coherent, leave it.

---

## Sub-Component Rules

- **Co-locate** sub-components in the `components/` folder of the feature (flat — no nesting)
- **Name** after what they represent, not where they appear: `service-card.tsx` not `engineer-services-list-item.tsx`
- **Props** should be minimal and typed — define props interface in the same file or in `*.types.ts` if reused
- **Named exports** always
- **No logic** — sub-components receive data via props and render it; any logic should already be in hooks

```
src/features/engineer-services/
├── index.tsx                     # orchestrates layout, passes data down
└── components/
    ├── service-card.tsx          # renders one service
    ├── service-filters.tsx       # filter controls
    └── service-empty-state.tsx   # empty/zero state UI
```

---

## Component Structure Order

Follow this order within every component file:

1. Component declaration (named export)
2. Sub-components (if small and only used here)
3. Helper render functions (if needed)
4. Static content (labels, copy defined as `const` above return)
5. TypeScript interfaces/types (if not in `*.types.ts`)

---

## Naming Conventions

- Files: `lowercase-with-dashes.tsx`
- Components: `PascalCase`
- Props interfaces: `{ComponentName}Props`
- Boolean props: `isDisabled`, `hasError`, `shouldShow`

---

## Execution

For each split:
1. Create the sub-component file in `components/`
2. Extract the JSX block into the new component
3. Define and pass the required props
4. Replace the extracted block in the parent with the new component
5. Verify rendering is unchanged

---

## Sidecar Update

Update sidecar Stage 10:
- Status: completed
- Components split (list original → sub-components created)
- Final line count of main component noted

---

## Progression

Load `./references/11-validation.md`.
