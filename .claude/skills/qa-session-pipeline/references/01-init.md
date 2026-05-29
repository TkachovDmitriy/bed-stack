# Stage 1: Init

**Purpose:** Detect continuation, load all context artifacts, and initialize the QA session sidecar.

---

## Output Folder Convention

All QA session artifacts live in a single self-contained folder:

```
_bmad-output/qa-sessions/{scope-id}/
  {scope-id}.qa-session.md    ← session log
  {scope-id}.bugs.md          ← bug report (created only if bugs found)
  screenshots/                ← all screenshots for this run
    TC01-step1-{desc}.png
```

Where `{scope-id}` is derived from the file provided:
- **Story scope**: the story filename without extension (e.g. `1-3-artist-submits-service-request`)
- **Epic scope**: the epic filename without extension (e.g. `epic-1-engineer-service`)

Derive `{scope-id}` now from the confirmed file path and set `{output-dir}` = `{project-root}/_bmad-output/qa-sessions/{scope-id}/`.

---

## Continuation Detection

Check whether a sidecar already exists at `{output-dir}{scope-id}.qa-session.md`.

**If sidecar exists:** This is a resumed session. Read it to recover:
- Which test cases were completed
- Bugs already documented
- Where the session left off

Present a resume summary and ask: "Resume from [last test case], or restart the session from scratch?"

**If no sidecar exists:** Fresh session. Create the output folder and sidecar now.

```bash
mkdir -p "{output-dir}screenshots"
```

---

## Load Context Artifacts

**Story scope** — read three artifacts:
1. **Story file** — user flows, acceptance criteria, roles involved
2. **Architecture file** — `{story-id}.architecture.md` in `_bmad-output/implementation-artifacts/`
3. **Pipeline file** — `{story-id}.pipeline.md` in `_bmad-output/implementation-artifacts/`

**Epic scope** — read the epic file, then for each story referenced in it:
1. **Epic file** — all stories listed, overall goals
2. **Story architecture files** — `{story-id}.architecture.md` for each story in `_bmad-output/implementation-artifacts/`
3. **Story pipeline files** — `{story-id}.pipeline.md` for each story in `_bmad-output/implementation-artifacts/`

Extract from all loaded files:
- All routes/pages introduced or modified
- User roles that interact with the feature
- Key actions and expected outcomes
- Edge cases and error states mentioned

If architecture or pipeline files are missing, warn but continue with what is available.

---

## Create Sidecar

Create `{output-dir}{scope-id}.qa-session.md`:

**Story scope:**
```markdown
---
scope: story
story: {story-file-path}
env: {env}
base-url: {base-url}
started: {current-date}
last-updated: {current-date}
status: in-progress
bugs-found: 0
output-dir: _bmad-output/qa-sessions/{scope-id}/
---

# QA Session — {story title}

## Stage 1 — Init
- Status: completed
- Scope: story
- Environment: {env} ({base-url})
- Story: {story-file-path}
- Architecture: {found / not found}
- Pipeline: {found / not found}
- Routes under test: {extracted routes}
- Roles under test: {extracted roles}

## Stage 2 — Test Plan
- Status: pending
<!-- Full TC details will be written here during Stage 2 before execution begins.
     Each TC includes: role, route, type, steps, expected outcome. -->

## Stage 3 — QA Session
- Status: pending
<!-- TC execution results will be appended here during Stage 3.
     Each TC entry includes: steps taken, result, screenshots, verdict, and any bugs found. -->

## Stage 4 — Report
- Status: pending
```

**Epic scope:**
```markdown
---
scope: epic
epic: {epic-file-path}
env: {env}
base-url: {base-url}
started: {current-date}
last-updated: {current-date}
status: in-progress
bugs-found: 0
output-dir: _bmad-output/qa-sessions/{scope-id}/
stories:
  - {story-id-1}
  - {story-id-2}
  - ...
---

# QA Session — {epic title}

## Stage 1 — Init
- Status: completed
- Scope: epic
- Environment: {env} ({base-url})
- Epic: {epic-file-path}
- Stories: {n} stories loaded
- Architecture files: {n found / n missing}
- Pipeline files: {n found / n missing}
- Routes under test: {extracted routes — all stories combined}
- Roles under test: {extracted roles — all stories combined}

## Stage 2 — Test Plan
- Status: pending
<!-- Full TC details will be written here during Stage 2 before execution begins.
     Grouped by flow. Each TC includes: role, route, type, steps, expected outcome. -->

## Stage 3 — QA Session
- Status: pending
<!-- TC execution results will be appended here during Stage 3.
     Each TC entry includes: steps taken, result, screenshots, verdict, and any bugs found. -->

## Stage 4 — Report
- Status: pending
```

---

## Auth Credentials Setup

Determine how the agent will authenticate during the QA session.

### Step 1 — Check for seed accounts

Query local Supabase for test accounts:

```bash
npx supabase db execute "SELECT email FROM auth.users WHERE email LIKE '%local%' OR email LIKE '%test%' LIMIT 10"
```

**If seed accounts found:**
- Map each role needed to the appropriate seed account
- Store the mapping in session memory (never written to any file)
- Note in the sidecar: "Auth: seed accounts detected"

**If no seed accounts found:**
- Ask the user for credentials per role needed:

```
No seed accounts found.

Please provide credentials for the roles needed in this session:
(Stored only in session memory — never saved to any file)

{for each role}
  {Role} email:    ___
  {Role} password: ___
```

- Store credentials in session memory only
- Note in the sidecar: "Auth: manual credentials provided"

### Credential safety rule

**Never write credentials to any file.** Only log that authentication succeeded or failed.

---

## Confirm with User

Present intake summary:

```
Scope:       {story: "{story title}" | epic: "{epic title}" ({n} stories)}
Environment: {env} — {base-url}
Routes:      {list of routes to test}
Roles:       {list of roles involved}

Context loaded:
  ✓/✗ Architecture file(s)
  ✓/✗ Pipeline file(s)

Auth:
  ✓ seed accounts / ✓ manual credentials provided

Output folder: _bmad-output/qa-sessions/{scope-id}/

Prerequisites:
  playwright-cli: ✓ installed
  Supabase local: please confirm running (supabase start)
  Dev server:     please confirm running (npm run dev / staging URL)
```

Ask: "Ready to build the test plan?"

---

## Progression

When user confirms, load `./references/02-plan.md`.
