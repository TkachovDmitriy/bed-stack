---
name: qa-session-pipeline
description: Interactive QA session using playwright-cli to test a feature story. Agent navigates the app like a real user, documents every step, and generates a bug report. Use when user says 'run qa session', 'qa-session-pipeline', or provides a story file to QA test.
---

# QA Session Pipeline

## Overview

This skill runs a live QA session against an already-implemented feature — acting as a QA engineer who reads the story, builds a test plan, then uses `playwright-cli` to navigate the app, click through flows, take screenshots, and document every result.

No test code is written. Instead, the agent produces artifacts in a self-contained folder:

```
_bmad-output/qa-sessions/{scope-id}/
  {scope-id}.qa-session.md    ← full session log with steps, results, screenshots
  {scope-id}.bugs.md          ← bug report (only if bugs found)
  screenshots/                ← all screenshots taken during the session
```

- **Story scope** → one session log + one bug report for the story
- **Epic scope** → one combined session log + one combined bug report across all stories, grouped by story

Every session follows: **setup → load context → build plan → execute → report**. The agent acts, observes, and documents — never assumes.

**Prerequisites:**
- `@playwright/cli` installed: `npm install -D @playwright/cli`
- Local Supabase running: `supabase start`
- Dev server running: `npm run dev` (port 8080) for local, or staging URL available

## On Activation

Load available config from `{project-root}/_bmad/config.yaml` if present.

**Check playwright-cli is available:**
```bash
npx playwright-cli --version
```
If missing, tell the user: "Install with: `npm install -D @playwright/cli`" and halt.

**Step 1 — Choose environment:**

Ask the user:
```
Which environment are you testing?
  [1] Local   (http://localhost:8080)
  [2] Staging (provide URL)
```
- If **[1]**: set `{base-url}` = `http://localhost:8080`
- If **[2]**: ask "Please provide the staging base URL (e.g. https://staging.sonarfair.com):" and set `{base-url}` to the provided value

Store `{env}` = `local` or `staging`.

**Step 2 — Choose scope:**

Ask the user:
```
What are you testing?
  [1] A specific story
  [2] A full epic (one combined report)
```
- If **[1]**: set `{scope}` = `story`
- If **[2]**: set `{scope}` = `epic`

**Step 3 — Detect file path:**

- If `{scope}` = `story`:
  - If a path was provided as an argument, confirm the file exists and proceed
  - If no path provided, ask: "Please provide the path to your story file."
- If `{scope}` = `epic`:
  - If a path was provided as an argument, confirm the file exists and proceed
  - If no path provided, ask: "Please provide the path to your epic file (e.g. docs/planning-artifacts/epics/epic-1-engineer-service.md)."

Once the file path is confirmed, load `./references/01-init.md`.
