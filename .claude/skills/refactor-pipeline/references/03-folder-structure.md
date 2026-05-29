# Stage 3: Folder Structure

**Purpose:** Reorganize the target's file and folder layout to match the feature-centralized + `shared/` convention before any code is modified. Getting structure right first prevents churn in later layers.

---

## Collaboration Model

Present the exact file moves as a before/after tree. Get explicit sign-off before executing any moves.

---

## Structure Rules

### Feature folder (single feature, self-contained)
```
src/features/{feature-name}/
├── index.tsx                        # main component (UI only)
├── components/                      # sub-components (flat — no nesting)
│   ├── {sub-component-a}.tsx
│   └── {sub-component-b}.tsx
├── {feature-name}.types.ts
├── {feature-name}.consts.ts
├── {feature-name}.utils.ts
├── {feature-name}.api.ts
├── {feature-name}.query.ts
└── {feature-name}.hook.ts
```

### Shared (used by 2+ features)
```
src/shared/
├── api/
├── queries/
├── hooks/
├── utils/
├── constants/
└── types/
```

### File naming rules
| Content | Suffix | Example |
|---------|--------|---------|
| Interfaces / types | `.types.ts` | `engineer-services.types.ts` |
| Constants / static data | `.consts.ts` | `engineer-services.consts.ts` |
| Pure utility functions | `.utils.ts` | `engineer-services.utils.ts` |
| Raw Supabase calls | `.api.ts` | `engineer-services.api.ts` |
| React Query hooks | `.query.ts` | `engineer-services.query.ts` |
| Custom UI/state hooks | `.hook.ts` | `use-engineer-services.hook.ts` |
| Main component | `index.tsx` | `engineer-services/index.tsx` |
| Sub-components | `.tsx` (flat) | `service-card.tsx` |

---

## What to Do

1. **Map the current structure** — list all existing files in the target
2. **Propose moves** — show before/after file tree, including:
   - Files to rename (apply suffix conventions)
   - Files to move (into feature folder or `shared/`)
   - New empty files to create as placeholders for later layers
   - Files with no changes (note them explicitly)
3. **Handle shared/ promotions** — create destination files in `src/shared/` for any candidates identified in Stage 2
4. **Present the plan** — show the full before/after tree and get sign-off

---

## Execution

After sign-off:
- Move and rename files
- Update all import paths affected by the moves
- Do not modify file contents beyond import path corrections at this stage
- Verify no broken imports remain

---

## Sidecar Update

Update sidecar Stage 3:
- Status: completed
- List of files moved/renamed
- Import paths updated count
- Shared/ files created

---

## Progression

When the developer confirms structure looks correct, determine the next applicable layer from the analysis plan and load the corresponding reference file.
