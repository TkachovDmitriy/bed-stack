# Stage 1: Init

**Purpose:** Initialize the refactor pipeline by detecting continuation state, creating the sidecar progress file, and confirming the target scope.

---

## Continuation Detection

Check whether a sidecar file already exists for this target. The sidecar naming convention: `{target-name}.refactor.md` in `{project-root}/_bmad-output/implementation-artifacts/`.

**If sidecar exists:** This is a resumed session. Read the sidecar to recover:
- Which stages are completed
- Decisions and findings produced so far
- Files created or modified
- Any open notes or blockers from the previous session

Present a resume summary: what was done, where we left off, what comes next. Ask: "Ready to continue from [stage name], or would you like to review what was done first?"

**If no sidecar exists:** Fresh start. Create the sidecar now.

---

## Sidecar File

Create `{target-name}.refactor.md` in `{project-root}/_bmad-output/implementation-artifacts/` with this structure:

```markdown
---
target: {target-path}
scope: {file | folder}
started: {current-date}
last-updated: {current-date}
current-stage: 1-init
---

# Refactor Pipeline Changelog

## Stage 1 — Init
- Status: in-progress
- Started: {current-date}

## Stage 2 — Analysis
- Status: pending

## Stage 3 — Folder Structure
- Status: pending

## Stage 4 — Types
- Status: pending

## Stage 5 — Constants
- Status: pending

## Stage 6 — Utils
- Status: pending

## Stage 7 — API Layer
- Status: pending

## Stage 8 — Query Layer
- Status: pending

## Stage 9 — Hook Layer
- Status: pending

## Stage 10 — UI Layer
- Status: pending

## Stage 11 — Validation
- Status: pending
```

---

## Session Preparation

Confirm with the user:
1. Target path is correct
2. Scope is understood: single file or folder (affects analysis depth)
3. Best practices reference is loaded: `{project-root}/.claude/rules/best-practices.md`
4. Any context to share before starting (known pain points, related features, recent changes)

Update sidecar Stage 1 status to `completed` with current date.

---

## Progression

When the user is ready, load `./references/02-analysis.md`.
