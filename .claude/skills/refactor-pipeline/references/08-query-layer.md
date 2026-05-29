# Stage 8: Query Layer

**Purpose:** Wrap API functions in React Query hooks (`useQuery`, `useMutation`) to provide loading states, error handling, caching, and invalidation — moving data-fetching concerns out of components and raw hooks.

---

## Auto-Skip Condition

If Stage 2 analysis found **no data fetching that needs React Query wrapping** (API layer is already fully wrapped), skip this stage. Update sidecar Stage 8 as `skipped` and proceed to Stage 9.

---

## Collaboration Model

Present the list of query/mutation hooks to create with their query keys and dependencies. Get sign-off before making changes.

---

## What to Create

For each API function extracted in Stage 7 (or already existing):

- **Read operations** → `useQuery` hook
- **Write operations** (insert/update/delete) → `useMutation` hook with cache invalidation

## Query Hook Conventions

```typescript
// engineer-services.query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEngineerServices, createEngineerService } from './engineer-services.api'
import type { CreateServiceInput } from './engineer-services.types'

// Query keys — colocated, typed as const
export const engineerServicesKeys = {
  all: ['engineer-services'] as const,
  byEngineer: (engineerId: string) => [...engineerServicesKeys.all, engineerId] as const,
}

export function useEngineerServices(engineerId: string) {
  return useQuery({
    queryKey: engineerServicesKeys.byEngineer(engineerId),
    queryFn: () => fetchEngineerServices(engineerId),
    enabled: !!engineerId,
  })
}

export function useCreateEngineerService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createEngineerService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engineerServicesKeys.all })
    },
  })
}
```

## Query Key Rules

- Always define query keys as a `const` object in the same file
- Keys must be hierarchical to support targeted invalidation
- Export keys so other features can invalidate if needed

## Migration: useEffect data fetching

If the target has `useEffect` + `useState` for data fetching, replace with `useQuery`:

```typescript
// Before — remove this pattern
useEffect(() => {
  setLoading(true)
  supabase.from('engineer_services').select('*').then(({ data }) => {
    setServices(data)
    setLoading(false)
  })
}, [])

// After — query hook handles this
const { data: services, isLoading } = useEngineerServices(engineerId)
```

---

## Destination Rules

| Query hook | Destination |
|-----------|------------|
| Used in 1 feature | `{feature-name}.query.ts` |
| Used in 2+ features | `src/shared/queries/{name}.query.ts` |

---

## Execution

For each hook:
1. Create the query/mutation hook in the destination file
2. Update all call sites to use the new hook
3. Remove the replaced `useEffect` + `useState` data fetching patterns
4. Verify loading/error states are correctly surfaced in components

---

## Sidecar Update

Update sidecar Stage 8:
- Status: completed
- Query hooks created (list names and destination files)
- useEffect patterns replaced count

---

## Progression

Load `./references/09-hook-layer.md`.
