# Stage 7: API Layer

**Purpose:** Extract all raw Supabase calls into dedicated `*.api.ts` files, creating a clean data access layer that is independent of React and React Query.

---

## Auto-Skip Condition

If Stage 2 analysis found **no direct Supabase calls** in the target, skip this stage. Update sidecar Stage 7 as `skipped` and proceed to Stage 8.

---

## Collaboration Model

Present the list of Supabase calls to extract with proposed function signatures. Get sign-off before making changes.

---

## What to Extract

Any direct call to the Supabase client:
- `supabase.from('table').select(...)` — queries
- `supabase.from('table').insert(...)` — mutations
- `supabase.from('table').update(...)` — mutations
- `supabase.from('table').delete(...)` — mutations
- `supabase.rpc('function_name', ...)` — RPC calls
- `supabase.storage.from('bucket')...` — storage operations
- `supabase.auth.*` — auth operations (unless already in AuthContext)

## What NOT to Extract

- Auth operations already handled by `AuthContext` — do not duplicate
- Realtime subscriptions — these stay in hooks (they are lifecycle-bound)

---

## API Function Conventions

Each extracted function should:
- Be a plain `async` function (no hooks, no React)
- Accept typed parameters — use types from `*.types.ts`
- Return typed data or throw — let the caller handle loading/error state
- Have a descriptive name: `fetchEngineerServices`, `createServiceBooking`, `updateServiceStatus`
- Include a brief JSDoc comment describing what it does

```typescript
// engineer-services.api.ts

import { supabase } from '@/integrations/supabase/client'
import type { EngineerService, CreateServiceInput } from './engineer-services.types'

export async function fetchEngineerServices(engineerId: string): Promise<EngineerService[]> {
  const { data, error } = await supabase
    .from('engineer_services')
    .select('*')
    .eq('engineer_id', engineerId)

  if (error) throw error
  return data
}

export async function createEngineerService(input: CreateServiceInput): Promise<EngineerService> {
  const { data, error } = await supabase
    .from('engineer_services')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Destination Rules

| API function | Destination |
|-------------|------------|
| Used in 1 feature | `{feature-name}.api.ts` |
| Used in 2+ features | `src/shared/api/{name}.api.ts` |

---

## Execution

For each extraction:
1. Create the API function in the destination file
2. Remove the inline Supabase call from the source
3. Update the source to call the new function
4. Verify all imports resolve

---

## Sidecar Update

Update sidecar Stage 7:
- Status: completed
- API functions extracted (list names and destination files)

---

## Progression

Load `./references/08-query-layer.md`.
