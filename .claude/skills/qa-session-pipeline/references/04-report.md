# Stage 4: Report

**Purpose:** Finalize the QA session log and generate a bug report scoped to the run (story or epic).

All artifacts are written to `{output-dir}` established in Stage 1:
```
_bmad-output/qa-sessions/{scope-id}/
  {scope-id}.qa-session.md     ← session log (already exists, update it)
  {scope-id}.bugs.md           ← bug report (create only if bugs found)
  screenshots/                 ← already populated during Stage 3
```

---

## Finalize QA Session Log

Update `{output-dir}{scope-id}.qa-session.md` — append the final summary section:

```markdown
## Stage 4 — Report
- Status: completed
- Session date: {date}
- Environment: {env} ({base-url})
- Total test cases: {n}
- Passed: {n} ✓
- Failed: {n} ✗
- Partial: {n} ⚠
- Bugs found: {n}

## Session Summary

| TC | Title | Story | Result | Bug |
|----|-------|-------|--------|-----|
| TC-01 | {title} | {story-id or —} | ✓ PASS | — |
| TC-02 | {title} | {story-id or —} | ✗ FAIL | BUG-01 |
| TC-03 | {title} | {story-id or —} | ⚠ PARTIAL | BUG-02 |

## Screenshots
{list of all screenshots taken with brief description}
```

Update frontmatter: `status: completed`, `last-updated: {date}`.

---

## Generate Bug Report

Only create if `bugs-found > 0`.

### Story scope — `{scope-id}.bugs.md`

Create `{output-dir}{scope-id}.bugs.md`:

```markdown
---
scope: story
story: {story-file-path}
session: {scope-id}.qa-session.md
env: {env}
base-url: {base-url}
date: {current-date}
total-bugs: {n}
status: open
---

# Bug Report — {story title}

## BUG-{n}: {one-line summary}

**Severity:** {critical | high | medium | low}
**Test case:** TC-{n}
**Found:** {date}
**Status:** open

### Description
{Clear description of what went wrong}

### Steps to Reproduce
1. Log in as {role}
2. Navigate to {route}
3. {action}
4. {action}

### Expected
{What should have happened according to the story}

### Actual
{What actually happened}

### Screenshot
`_bmad-output/qa-sessions/{scope-id}/screenshots/{filename}`

### Theoretical Fix

**Root cause:** {likely reason based on architecture knowledge}

**Approach:**
{How to fix it — clear direction, no code}

### Likely Affected Files
- `{file path}` — {why}
- `{file path}` — {why}

---
```

Repeat for each bug, ordered by severity (critical first).

---

### Epic scope — `{scope-id}.bugs.md`

Create `{output-dir}{scope-id}.bugs.md` with one combined file, bugs grouped by story:

```markdown
---
scope: epic
epic: {epic-file-path}
session: {scope-id}.qa-session.md
env: {env}
base-url: {base-url}
date: {current-date}
total-bugs: {n}
status: open
stories-with-bugs: {n}
---

# Bug Report — {epic title}

## Summary

| Story | Bugs | Critical | High | Medium | Low |
|-------|------|----------|------|--------|-----|
| {story-id-1} | {n} | {n} | {n} | {n} | {n} |
| {story-id-2} | {n} | {n} | {n} | {n} | {n} |
| **Total** | {n} | {n} | {n} | {n} | {n} |

---

## {Story ID}: {Story Title}

### BUG-{n}: {one-line summary}

**Severity:** {critical | high | medium | low}
**Test case:** TC-{n}
**Found:** {date}
**Status:** open

### Description
{Clear description of what went wrong}

### Steps to Reproduce
1. Log in as {role}
2. Navigate to {route}
3. {action}

### Expected
{What should have happened}

### Actual
{What actually happened}

### Screenshot
`_bmad-output/qa-sessions/{scope-id}/screenshots/{filename}`

### Theoretical Fix

**Root cause:** {likely reason}

**Approach:**
{How to fix it}

### Likely Affected Files
- `{file path}` — {why}

---

## {Next Story ID}: {Story Title}

{...repeat pattern for each story that has bugs}
```

Within each story section, order bugs by severity (critical first).
Stories with no bugs are omitted from the bug report entirely.

---

## Severity Guide

- **Critical** — feature completely broken, blocks the user flow entirely
- **High** — main functionality works but an important case fails
- **Medium** — edge case or secondary flow fails
- **Low** — cosmetic issue, minor UX problem, non-blocking

---

## Present Final Summary

```
QA Session complete — {story title | epic title}

Environment: {env} ({base-url})
Scope:       {story | epic ({n} stories)}

Results:
  {n} passed ✓
  {n} failed ✗
  {n} partial ⚠

Artifacts:
  Session log: _bmad-output/qa-sessions/{scope-id}/{scope-id}.qa-session.md
  Bug report:  _bmad-output/qa-sessions/{scope-id}/{scope-id}.bugs.md  ← (if bugs found)
  Screenshots: _bmad-output/qa-sessions/{scope-id}/screenshots/

{If bugs found:}
Next steps:
  Use {scope-id}.bugs.md as input for bug fixes.
  Each bug includes theoretical fix and affected files.
```
