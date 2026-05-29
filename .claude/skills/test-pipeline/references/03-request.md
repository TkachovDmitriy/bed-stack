# Stage 3: Request Test Generation (Supabase)

**Purpose:** Generate tests for Supabase edge functions and RPC calls introduced by the feature. Tests run against local Supabase (localhost:54321).

---

## Prerequisites Check

Confirm local Supabase is expected to be running on `localhost:54321`. Tests will use the service role key from environment for direct access.

Check `{project-root}/supabase/functions/__tests__/` exists — create the directory if not.

---

## Generate Tests

**Target location:** `supabase/functions/__tests__/{function-name}.test.ts`

If the file already exists, append new `describe`/`it` blocks — do not overwrite.

Tests use Deno's built-in test runner since edge functions run in Deno:

```typescript
import { assertEquals, assertExists } from 'jsr:@std/assert'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = 'http://localhost:54321'
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, serviceRoleKey)

Deno.test('{function-name} - {scenario}', async () => {
  const { data, error } = await supabase.functions.invoke('{function-name}', {
    body: { /* payload */ },
  })
  assertEquals(error, null)
  assertExists(data)
})
```

**Test each edge function for:**
- Valid authenticated request → correct response
- `[standard]` Unauthenticated request → 401
- `[standard]` Invalid payload → 400 with meaningful error
- `[full]` Database constraint violation → graceful error
- `[full]` Missing required fields → validation error

**Coverage rules:**
- `smoke` — one happy path test per function
- `standard` — happy path + auth guard + invalid payload
- `full` — all of the above + database error handling

---

## Update Sidecar

Update `.test-pipeline.md` Stage 3 (request):
- Status: `completed`
- Test file path(s) created or modified
- Number of tests generated
- Functions tested

---

## Progression

If mode is `all`, next load `./references/03-e2e.md`. Otherwise load `./references/04-run.md`.
