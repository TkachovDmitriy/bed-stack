# Stage 9: Review & Validation

**Purpose:** Comprehensive final review of the complete feature using multi-agent critique via `bmad-party-mode` and `bmad-brainstorming`. This stage catches what single-perspective review misses — gaps, edge cases, architectural inconsistencies, and UX issues.

---

## Collaboration Model

**Plan first:** Present what will be reviewed and which agents/lenses will be used. Get sign-off before launching the review.

---

## Preparation

Before launching the review, compile the feature's complete context:
- Original acceptance criteria from the story
- Architecture document produced in Stage 3
- All files created across Stages 4–8
- Sidecar changelog (decisions made, deviations from plan, known risks)

---

## Multi-Agent Review

### Party Mode Review

Invoke `bmad-party-mode` with the complete feature context. The multi-agent discussion should evaluate:

- **Acceptance criteria coverage** — does the implementation satisfy every criterion from the story?
- **Architecture integrity** — does the code follow the planned architecture? Are there shortcuts that create tech debt?
- **Security** — are RLS policies correct? Is auth enforced at every boundary? Any injection risks?
- **Best practices compliance** — does the code comply with `{project-root}/.claude/rules/best-practices.md`?
- **Edge cases** — what happens with empty states, concurrent users, network failures, invalid inputs?
- **Performance** — any N+1 queries, missing indexes, unoptimized renders?

### Brainstorming Session

Invoke `bmad-brainstorming` focused on:
- What could go wrong in production that we haven't tested for?
- What UX flows might confuse or frustrate users?
- Are there simpler implementations for any complex parts?
- What monitoring or observability is missing?

---

## Findings Triage

Consolidate findings into three categories:

| Category | Description | Action |
|----------|-------------|--------|
| **Blockers** | Acceptance criteria not met, security issues, broken flows | Fix before done |
| **Warnings** | Tech debt, missing edge case handling, performance concerns | Fix or document |
| **Suggestions** | Nice-to-haves, future improvements | Log for backlog |

Present the triaged findings to the developer. Fix all blockers together before signing off.

---

## Final Sign-Off

When all blockers are resolved:
- Confirm every acceptance criterion is met
- Update sidecar to `all-stages: completed`
- Present a final summary: what was built, files created, key decisions made

---

## Sidecar Final Update

Update the sidecar changelog for Stage 9:
- Status: completed
- Review findings summary
- Blockers fixed
- Feature declared complete

Pipeline is done.
