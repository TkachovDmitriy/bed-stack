# Stage 3: Analysis & Planning

**Purpose:** Analyze business logic, plan the full feature structure, and produce an architecture design document that will guide all subsequent implementation stages.

---

## Collaboration Model

**Plan first:** Present what you'll analyze and what the architecture design document will contain. Get sign-off before proceeding.

---

## Analysis

With the feature understanding from Stage 2, analyze:

- **Business logic** — Rules, validations, edge cases, state transitions, role-based behavior
- **Data flows** — How data moves through the feature: user input → validation → persistence → display
- **Integration points** — Existing features, shared hooks, shared components, auth context this feature touches
- **Role-based behavior** — How Artist, Engineer, and Listener roles affect the feature's behavior and access
- **Risk areas** — Complexity hotspots, potential performance concerns, security considerations (RLS, auth guards)

Scan the codebase for relevant patterns to reuse — existing hooks, components, utilities, and conventions that apply to this feature.

---

## Architecture Design Document

Produce a design document and save it as `{project-root}/_bmad-output/implementation-artifacts/{story-filename}.architecture.md`.

The document should cover:

1. **Feature overview** — one paragraph, purpose and scope
2. **Business rules** — numbered list of rules that implementation must enforce
3. **Data model** — entities, relationships, fields needed (high level — detail comes in Stage 4)
4. **Layer breakdown:**
   - Data layer: tables, RLS requirements
   - API layer: edge functions and/or hooks needed
   - Navigation: screens/pages and their routes
   - UI: component tree, shared vs. feature-specific components
5. **Integration map** — what existing code this feature connects to
6. **Security considerations** — auth guards, RLS policies, input validation boundaries
7. **Open risks** — anything that could derail implementation

---

## Sign-Off

Present the architecture document to the developer. Discuss trade-offs and alternatives for any non-obvious decisions. Reach explicit agreement before any code is written.

---

## Sidecar Update

Update the sidecar changelog for Stage 3:
- Status: completed
- Architecture document path noted
- Key architectural decisions recorded

---

## Progression

When the developer approves the architecture, load `./references/04-data-layer.md`.
