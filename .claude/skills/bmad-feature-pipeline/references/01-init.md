# Stage 1: Init

**Purpose:** Initialize the feature build pipeline by detecting continuation state, creating the sidecar progress file, and preparing for the first collaborative session.

---

## Continuation Detection

Check whether a sidecar file already exists alongside the story file. The sidecar follows the naming convention: `{story-filename}.pipeline.md` in the same directory as the story.

**If sidecar exists:** This is a resumed session. Read the sidecar to recover:
- Which stages are completed
- Decisions and artifacts produced so far
- Files created or modified
- Any open notes or blockers from the previous session

Present a resume summary to the user: what was done, where we left off, and what comes next. Ask: "Ready to continue from [stage name], or would you like to review what was done first?"

**If no sidecar exists:** This is a fresh start. Create the sidecar file now.

---

## Sidecar File

Create `{story-filename}.pipeline.md` in `{project-root}/_bmad-output/implementation-artifacts/` with this structure:

```markdown
---
story: {story-file-path}
started: {current-date}
last-updated: {current-date}
current-stage: 1-init
---

# Pipeline Changelog

## Stage 1 — Init
- Status: in-progress
- Started: {current-date}

## Stage 2 — Feature Understanding
- Status: pending

## Stage 3 — Analysis & Planning
- Status: pending

## Stage 4 — Data Layer
- Status: pending

## Stage 5 — API Layer
- Status: pending

## Stage 6 — Navigation
- Status: pending

## Stage 7 — Data Connections
- Status: pending

## Stage 8 — UI Development
- Status: pending

## Stage 9 — Refactor
- Status: pending

## Stage 10 — Review & Validation
- Status: pending
```

---

## Session Preparation

Confirm with the user:
1. The story file path is correct
2. Best practices reference is loaded: `{project-root}/.claude/rules/best-practices.md`
3. Any project context they want to share before starting (recent changes, known constraints, related features)

Update sidecar Stage 1 status to `completed` with the current date.

---

## Progression

When the user is ready, load `./references/02-feature-understanding.md`.
