# Stage 3: QA Session

**Purpose:** Execute each test case using playwright-cli. Document every step, result, and screenshot. Flag bugs immediately as they are found.

---

## Session Rules

- Execute one test case at a time
- Document every action before and after executing it
- Take a screenshot after each meaningful state change
- Never assume — if unsure what you see, describe it exactly
- A bug is anything that deviates from the Expected outcome in the test plan

---

## Test Case Execution Pattern

Read all test cases from the **Stage 2 — Test Plan** section of the sidecar. The full TC details (role, route, steps, expected outcome) are written there before execution begins. Never execute a TC that is not documented in the sidecar.

For each test case from the approved plan:

### Announce the test
```
---
### TC-{n}: {title}
Role: {role} | Route: {route} | Type: {type}
```

### Execute steps using playwright-cli

Use these commands as needed:
```bash
npx playwright-cli navigate {base-url}{route}
npx playwright-cli screenshot --output {output-dir}screenshots/TC{n}-step{step}-{desc}.png
npx playwright-cli click "{selector or visible text}"
npx playwright-cli type "{selector}" "{value}"
npx playwright-cli wait-for-selector "{selector}"
npx playwright-cli evaluate "document.querySelector('{selector}')?.textContent"
```

For authenticated flows, navigate to the login page first and sign in as the appropriate role using test credentials. Document the login step only once per role change.

### Document each step

After each command, append to the sidecar:

```markdown
**Step {n}:** {action description}
- Command: `{playwright-cli command used}`
- Result: {what happened — be specific}
- Screenshot: {filename or "none"}
```

### Evaluate outcome

After all steps, record the verdict:

```markdown
**Verdict:** ✓ PASS | ✗ FAIL | ⚠ PARTIAL

{If PASS: brief confirmation that expected outcome was met}
{If FAIL: exact description of what went wrong vs expected}
{If PARTIAL: what worked and what didn't}
```

### On FAIL or PARTIAL — capture bug

Immediately document the bug inline in the sidecar and flag it for the bug report:

```markdown
**🐛 Bug found — BUG-{n}**
- Test case: TC-{n}
- Summary: {one-line description}
- Steps to reproduce: {exact steps taken}
- Expected: {from test plan}
- Actual: {what actually happened}
- Screenshot: {filename}
```

Increment `bugs-found` counter in the sidecar frontmatter.

---

## Between Test Cases

After each test case verdict, ask:
"TC-{n} complete ({PASS/FAIL}). Continue to TC-{n+1}, or pause here?"

This lets the user stop mid-session without losing progress.

---

## Screenshot Organization

Save all screenshots to: `{output-dir}screenshots/`

Naming: `TC{n}-step{n}-{short-description}.png`

---

## Update Sidecar

After each test case, update Stage 3 in the sidecar:

```markdown
## Stage 3 — QA Session
- Status: in-progress
- Completed: TC-01 ✓, TC-02 ✗, TC-03 ✓ ...
- Bugs found: {count}
```

---

## Progression

When all test cases are complete (or user chooses to end session), load `./references/04-report.md`.
