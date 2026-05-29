# Diff — Cross-Feature Impact Analysis

Show which features are affected by the current branch's changes and what downstream effects to expect.

## What Success Looks Like

A clear impact report: which features changed, which other features depend on them (via imports or query key invalidation), and what to watch for when reviewing or testing.

## Process

1. Run `git diff main...HEAD --name-only` to get all changed files on the current branch.

2. Map each changed file to its feature by path prefix (`src/features/{name}/` → feature name).

3. Read `_bmad-output/graphs/index.graph.md`. If it doesn't exist, tell the user to run `/graph build` first.

4. For each changed feature, read its `_bmad-output/graphs/{feature-name}.graph.md`.

5. Scan all other feature graph files for cross-feature imports that reference the changed features, and for `Invalidates` edges that point to the changed features' query keys.

6. Produce the impact report.

## Report Format

```
## Changed Features
- {feature-name} — {N} files changed

## Direct Dependents (import this feature)
- {other-feature} imports [{SymbolA}, {SymbolB}] from {changed-feature}

## Cache Invalidation Chain
- {changed-feature} invalidates {otherKeys.list} → triggers refetch in {other-feature}

## Test Surface
Files to verify beyond the changed features: [list]
```

Keep the report concise — flag only real dependencies, not coincidental file proximity.
