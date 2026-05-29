# Stage 1: Intake

**Purpose:** Load all context for the story, detect existing tests, detect continuation, and create the sidecar artifact.

---

## Continuation Detection

Check whether a sidecar file already exists for this story. The sidecar is named `{story-filename}.test-pipeline.md` and lives in `{project-root}/_bmad-output/implementation-artifacts/`.

**If sidecar exists:** This is a resumed session. Read it to recover:
- Which modes were completed
- Which test files were created or modified
- Results from any previous test runs

Present a resume summary and ask: "Ready to continue from [next stage], or review what was done first?"

**If no sidecar exists:** Fresh start. Create the sidecar now (see below).

---

## Load Context Artifacts

Locate and read all three artifacts relative to the story file path:

1. **Story file** — the story itself (provided by user)
2. **Architecture file** — `{story-filename}.architecture.md` in `{project-root}/_bmad-output/implementation-artifacts/`
3. **Pipeline file** — `{story-filename}.pipeline.md` in `{project-root}/_bmad-output/implementation-artifacts/`

If any artifact is missing, warn the user but continue with what's available. The pipeline file is most critical — it tells us exactly what files were created or modified.

**Do not read source code files directly.** Extract all context from the three artifacts above.

---

## Detect Existing Tests

Based on the mode selected, scan for existing test files related to this story's features:

- **e2e:** Check `{project-root}/e2e/` for relevant `.spec.ts` files
- **unit:** Check `src/**/__tests__/` for relevant `.test.ts` files
- **request:** Check `supabase/functions/__tests__/` for relevant test files

Note which files exist — generation will append to them, not overwrite.

**Check for Playwright config:**

If mode includes `e2e`, check whether `{project-root}/playwright.config.ts` exists. If not, flag it — Stage 3 (e2e) will create it.

---

## Sidecar File

Create `{story-filename}.test-pipeline.md` in `{project-root}/_bmad-output/implementation-artifacts/`:

```markdown
---
story: {story-file-path}
mode: {selected-mode}
coverage: {selected-coverage}
started: {current-date}
last-updated: {current-date}
---

# Test Pipeline Changelog

## Stage 1 — Intake
- Status: completed
- Story: {story-file-path}
- Architecture: {found/not found}
- Pipeline: {found/not found}
- Existing tests: {list or "none"}

## Stage 2 — Test Plan
- Status: pending

## Stage 3 — Test Generation ({mode})
- Status: pending

## Stage 4 — Run
- Status: pending
```

---

## Confirm with User

Present a brief intake summary:

```
Story: {story title from file}
Mode: {mode} | Coverage: {coverage}

Context loaded:
  ✓/✗ Architecture file
  ✓/✗ Pipeline file

Existing tests found:
  {list of existing test files, or "none — will create new files"}

Playwright config: {exists / will be created}
```

Ask: "Looks good? Ready to generate the test plan?"

---

## Progression

When user confirms, load `./references/02-plan.md`.
