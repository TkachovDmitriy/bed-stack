# Stage 4: Run Tests

**Purpose:** Optionally execute the generated tests and report results. Update the sidecar with final status.

---

## Ask to Run

Present a summary of what was generated:

```
Tests generated:
  {list of files created/modified}
  {total test count} tests across {mode(s)}

Run tests now?
[Y] Yes — execute and show results
[N] No — leave for CI or manual run
```

Wait for user response.

---

## If User Says No

Update sidecar and close:

```
Stage 4 — Run
- Status: skipped
- Note: Tests left for CI/manual execution
```

Show commands the user can run manually:

```bash
# E2E tests (requires: supabase start + npm run dev)
npx playwright test

# Unit tests
npx vitest run

# Supabase function tests
deno test supabase/functions/__tests__/
```

Proceed to final summary.

---

## If User Says Yes

Run the appropriate command(s) based on mode:

| Mode | Command |
|------|---------|
| `e2e` | `npx playwright test` |
| `unit` | `npx vitest run` |
| `request` | `deno test supabase/functions/__tests__/` |
| `all` | All three in sequence |

**Before running E2E:** Warn the user that Supabase local must be running (`supabase start`) and dev server will be started automatically via `webServer` config.

---

## Report Results

After execution, show results clearly:

```
Test Results — {story title}

✓ {n} passed
✗ {n} failed
  {test name}: {error message}

Duration: {time}
```

**If all tests pass:**

Mark Stage 4 as completed. Proceed to final summary.

**If tests fail:**

```
{n} test(s) failed. Would you like me to:
[F] Fix the failing tests
[I] Ignore and continue (mark as known failures in sidecar)
[D] Show full error details
```

If user chooses Fix: analyze the error, update the test code (not the feature code), re-run once. If still failing, report and let user decide.

---

## Final Summary

Update sidecar Stage 4 and finalize the document:

```markdown
## Stage 4 — Run
- Status: completed / skipped
- Results: {n} passed, {n} failed
- Run date: {date}

## Summary
- Total tests: {count}
- Files created: {list}
- Files modified: {list}
- Flags: {any warnings — missing testids, missing vitest config, etc.}
```

Present to user:

```
Test pipeline complete for: {story title}

Generated:
  ✓ {n} E2E tests → e2e/{file}.spec.ts
  ✓ {n} unit tests → src/...
  ✓ {n} request tests → supabase/functions/__tests__/...

Sidecar: _bmad-output/implementation-artifacts/{story}.test-pipeline.md

{Any flags or next steps}
```
