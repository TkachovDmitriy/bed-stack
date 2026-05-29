# Build — Full Codebase Graph

Scan the entire project and produce a complete knowledge graph in `_bmad-output/graphs/`.

## What Success Looks Like

- `_bmad-output/graphs/index.graph.md` — master index listing every feature with a one-liner (~500 tokens total)
- `_bmad-output/graphs/{feature-name}.graph.md` — one file per feature (~500–1000 tokens each)
- `_bmad-output/graphs/manifest.json` — file mtime snapshot per feature for incremental updates

Every feature graph is self-contained: exports, cross-feature imports, DB tables, query keys, edge functions, and outbound invalidation edges.

## Scan Targets

| Path | What to extract |
|------|----------------|
| `src/features/*/` | Full feature graphs (primary target) |
| `src/components/*/` | Component name + one-line purpose |
| `src/hooks/` | Hook name + one-line purpose |
| `src/stores/` | Store name, state fields, actions |
| `src/pages/` | Page → route path mapping |
| `supabase/functions/*/` | Function name, HTTP method, external APIs called, tables touched |

## Extraction Patterns

For each feature folder, run these Grep patterns on its files:

| What | Pattern | File scope |
|------|---------|------------|
| Exports | `^export (function\|const\|interface\|type\|class\|enum)` | all `.ts` / `.tsx` |
| Cross-feature imports | `from ['"]@/features/` | all files |
| Shared imports | `from ['"]@/shared/\|@/hooks/\|@/stores/` | all files |
| DB tables | `supabase\.from\(['"]` | `*.api.ts` |
| Query keys | `queryKeys\|Keys\.\|queryKey:` | `*.constants.ts`, `*.query.ts` |
| Edge functions | `supabase\.functions\.invoke\(['"]` | `*.api.ts`, `*.query.ts` |
| Cache invalidation | `invalidateQueries` | `*.query.ts`, `*.hook.ts` |

## Feature Graph Format

Write each `_bmad-output/graphs/{feature-name}.graph.md` as:

```markdown
# {feature-name}
_Path: src/features/{feature-name}/_

## Exports
- `ExportName` — (component | hook | type | function | constant)

## Cross-Feature Imports
- `@/features/{other}` → `[SymbolA, SymbolB]`
- `@/shared/{module}` → `[SymbolC]`

## DB Tables
- `table_name` (read | write | read+write)

## Query Keys
- `featureKeys.all`
- `featureKeys.detail(id)`

## Edge Functions
- `function-name`

## Invalidates
- `otherFeatureKeys.list` → triggers refetch in `{other-feature}`
```

Omit sections that are empty. Keep each file under 60 lines.

## Index Format

Write `_bmad-output/graphs/index.graph.md` as:

```markdown
# Codebase Graph Index
_Generated: {date}_

## Features
| Feature | Path | Purpose |
|---------|------|---------|
| {name} | src/features/{name}/ | {one-line from index.tsx or hook} |

## Shared Components
| Name | Purpose |
|------|---------|

## Shared Hooks
| Name | Purpose |
|------|---------|

## Stores
| Name | State | Actions |
|------|-------|---------|

## Pages & Routes
| Page | Route |
|------|-------|

## Edge Functions
| Name | Method | Purpose |
|------|--------|---------|
```

## Manifest Format

Write `_bmad-output/graphs/manifest.json` as:
```json
{
  "generated": "ISO-8601 timestamp",
  "features": {
    "{feature-name}": {
      "path": "src/features/{feature-name}",
      "files": { "{filename}": "last-modified ISO string" }
    }
  }
}
```

Use `Bash: ls -l --time-style=+%Y-%m-%dT%H:%M:%S` or file stat to capture mtimes.

## After Building

Report: total features scanned, graph files written, and the path `_bmad-output/graphs/`. Remind the user to run `/graph build --update` after adding new features.
