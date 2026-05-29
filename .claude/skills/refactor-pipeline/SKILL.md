---
name: refactor-pipeline
description: Guided layer-by-layer refactor pipeline for React/TypeScript codebases. Use when user says 'run refactor pipeline', 'refactor this component', 'refactor this feature', or provides a file or folder to refactor.
argument-hint: "[file-path or folder-path]"
---

# Refactor Pipeline

## Overview

This skill delivers structured, layer-by-layer refactors — separating concerns across types, constants, utils, API, queries, hooks, and UI — through an 11-stage collaborative workflow. Act as a refactor architect, partnering with the developer to analyse existing code, propose a clean structure, and execute changes one layer at a time.

Every stage follows the same collaboration model: **present a plan → get sign-off → execute → review output → move on**. No code is changed without explicit approval. Output follows the project's feature-centralized folder structure with `shared/` promotion for cross-feature dependencies.

**Mandatory:** Load and internalize `{project-root}/.claude/rules/best-practices.md` at activation. All code produced must comply throughout every stage.

**Stages at a glance:**
1. **Init** — Detect continuation, create sidecar changelog, confirm target
2. **Analysis** — Scan target, map violations by layer, detect `shared/` candidates, propose refactor plan + folder structure
3. **Folder Structure** — Reorganize files/folders per feature-centralized + `shared/` model
4. **Types** — Extract interfaces/types → `*.types.ts`
5. **Constants** — Extract magic strings/static data → `*.consts.ts`
6. **Utils** — Extract pure helpers → `*.utils.ts`, flag `shared/` duplicates
7. **API Layer** — Extract raw Supabase calls → `*.api.ts`
8. **Query Layer** — Wrap API in React Query hooks → `*.query.ts`
9. **Hook Layer** — Extract UI/state logic → `*.hook.ts`
10. **UI Layer** — Decompose large components, apply naming conventions
11. **Validation** — Naming, SOLID, best-practices.md compliance + produce refactor artifact

Stages 4–10 are **auto-skipped** when nothing applies to the target.

## Folder Structure Convention

### Feature-centralized (self-contained feature)
```
src/features/{feature-name}/
├── index.tsx                          # main component (UI only)
├── components/                        # sub-components (flat)
│   ├── sub-component-a.tsx
│   └── sub-component-b.tsx
├── {feature-name}.types.ts
├── {feature-name}.consts.ts
├── {feature-name}.utils.ts
├── {feature-name}.api.ts              # raw Supabase calls
├── {feature-name}.query.ts            # React Query hooks
└── {feature-name}.hook.ts             # UI/state logic
```

### Shared (used by 2+ features)
```
src/shared/
├── api/          # *.api.ts
├── queries/      # *.query.ts
├── hooks/        # *.hook.ts
├── utils/        # *.utils.ts
├── constants/    # *.consts.ts
└── types/        # *.types.ts
```

### Promotion rule
| Used by | Lives in |
|---------|----------|
| 1 feature | `features/{feature-name}/` |
| 2+ features | `shared/` |

## On Activation

Load and internalize `{project-root}/.claude/rules/best-practices.md`. This is non-negotiable — every file produced must comply.

**Detect target path:**
- If a path was provided as an argument, confirm it exists and determine scope (single file or folder)
- If no path provided, ask: "Please provide the path to the file or folder you want to refactor."

Once the target is confirmed, load `./references/01-init.md` to begin Stage 1.
