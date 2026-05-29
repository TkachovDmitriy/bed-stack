# Stage 2: Test Plan

**Purpose:** Build a structured test plan with specific test cases from the story context. Get user approval before starting the live session.

---

## Build Test Plan

Analyze the loaded context to extract all testable scenarios. Group by flow and role.

For each flow identified in the story, generate test cases in this format:

```
TC-{n}: {short title}
  Role:     {artist | engineer | listener | admin | unauthenticated}
  Route:    {url path}
  Action:   {what the user does}
  Expected: {what should happen}
  Type:     {happy path | edge case | error | role guard}
```

**Always include:**
- At least one happy path per main user action
- Role guard test (unauthorized user tries to access protected action)
- At least one error/empty state if the story mentions it

**Example for an order approval feature:**

```
TC-01: Engineer approves a pending order
  Role:     engineer
  Route:    /dashboard/orders/{id}
  Action:   Click "Approve Order" → confirm in dialog
  Expected: Order status changes to "Approved", escrow released
  Type:     happy path

TC-02: Artist cannot approve their own order
  Role:     artist
  Route:    /dashboard/orders/{id}
  Action:   Attempt to access approve action
  Expected: Approve button not visible or action blocked
  Type:     role guard

TC-03: Engineer approves already-approved order
  Role:     engineer
  Route:    /dashboard/orders/{id}
  Action:   Navigate to already-approved order
  Expected: Approve button disabled or not shown
  Type:     edge case
```

---

## Present Plan for Approval

Show the full test plan and ask:

"Here are **{n} test cases** for **{story title}**. Ready to start the QA session, or would you like to adjust the plan?"

Options:
- **[Y] Start session** — begin testing
- **[Add]** — add a test case
- **[Remove]** — remove a test case
- **[Edit]** — modify a test case

---

## Write Full Plan to Sidecar

When the user approves, write **all test cases in full detail** into the sidecar under Stage 2 — one block per TC. Do not write a summary line only. Each TC must be written in this format before any execution begins:

```markdown
### Flow {letter} — Story {n}: {Story Title} (TC-{n} – TC-{n})

**TC-{n}: {title}**
- Role: {role} | Route: {route} | Type: {type}
- Steps: {numbered action steps}
- Expected: {what should happen — specific, verifiable}
```

Group TCs by flow. All flows and all TCs must be written into the document **before Stage 3 begins**. This ensures the document is a complete, readable test plan that can be reviewed independently of the chat.

Update the sidecar Stage 2 status to `completed` and record the total TC count.

---

## Progression

When user approves and full plan is written to sidecar, load `./references/03-session.md`.
