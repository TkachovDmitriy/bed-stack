# Stage 5: API Layer

**Purpose:** Implement the API layer — Supabase edge functions, custom React hooks, and React Query data-fetching — with full input/output validation using Zod.

**Best practices:** All work must comply with `{project-root}/.claude/rules/best-practices.md` and project conventions in `CLAUDE.md`.

---

## Collaboration Model

**Plan first:** Present the complete API layer plan — every hook, edge function, and validation schema — before writing any code. Get sign-off.

---

## Planning

Design the full API layer based on the data layer from Stage 4 and the architecture document:

**React Query Hooks** (in `src/hooks/`):
- One custom hook per data concern (query + mutation)
- Follow the naming pattern of existing hooks: `useFeatureName`, `useFeatureNameMutation`
- Use the Supabase client directly for simple CRUD; reserve edge functions for complex logic

**Edge Functions** (in `supabase/functions/`):
- Only create edge functions for operations that need server-side logic (payment, external APIs, complex transactions)
- Use `Deno.serve` — never the legacy `serve` import
- External deps via `npm:` or `jsr:` specifiers with pinned versions
- Shared utilities in `supabase/functions/_shared/`

**Zod Validation Schemas**:
- Define a Zod schema for every form input, API request body, and response shape
- Validate at system boundaries: user input and external API responses
- Place schemas in a `.type.ts` or inline with the hook if small

Present a table listing each hook/function with: name, purpose, input schema, output type, error cases.

---

## Implementation

Once approved, implement in order: types/schemas → hooks → edge functions.

For each hook:
- Handle loading, error, and success states
- Use early returns for error conditions
- Return typed data — no `any`
- Follow the pattern of existing hooks in `src/hooks/`

For each edge function:
- Validate request body with Zod at the top of the handler
- Return consistent error shapes
- Handle auth checks before business logic
- Document the function's purpose, inputs, and outputs inline

---

## Review

Present a summary of what was implemented:
- Hooks created with their return types
- Edge functions created with their endpoints
- Validation schemas covering which inputs

Ask the developer to verify the API layer fully covers the feature's data operations before proceeding.

---

## Sidecar Update

Update the sidecar changelog for Stage 5:
- Status: completed
- Files created (hooks, edge functions, schemas)
- Key validation decisions noted

---

## Progression

When the developer approves, load `./references/06-navigation.md`.
