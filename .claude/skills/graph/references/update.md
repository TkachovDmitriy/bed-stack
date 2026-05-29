# Build --update — Incremental Graph Update

Re-scan only features whose files have changed since the last build. Merge results into existing graph files.

## What Success Looks Like

Only changed features are re-extracted and their graph files overwritten. Unchanged features are skipped entirely. `manifest.json` is updated with new mtimes. Index is regenerated to reflect any changes.

## Process

1. Read `_bmad-output/graphs/manifest.json`. If it doesn't exist, run the full build instead (load `references/build.md`).

2. For each feature in `manifest.json`, check whether any of its tracked files have a newer mtime than recorded. Use `Bash: stat -c %Y src/features/{name}/**` or glob the folder and compare.

3. For features with changes: re-run the extraction patterns from `references/build.md` and overwrite `_bmad-output/graphs/{feature-name}.graph.md`.

4. For features with no changes: skip entirely — do not re-read or rewrite their graph files.

5. Check for **new features** not in the manifest: Glob `src/features/*/` and compare against manifest keys. Extract and create graph files for any new ones.

6. Regenerate `_bmad-output/graphs/index.graph.md` to reflect any added, removed, or updated features.

7. Write the updated `manifest.json` with current mtimes for all scanned features.

## Report

Tell the user: how many features were re-scanned, how many were skipped, and whether any new features were discovered.
