# Stage 3: Unit Test Generation (Vitest)

**Purpose:** Generate Vitest unit tests for hooks, utilities, and components introduced by the feature. Focus on logic and behavior, not rendering details.

---

## Setup Check

Verify `{project-root}/vite.config.ts` has a `test` block. If not, note that vitest configuration is needed — do not block generation, but flag it for the user.

Expected config addition:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.ts'],
}
```

---

## Generate Tests

**Target locations:**
- Hooks: `src/hooks/__tests__/{hookName}.test.ts`
- Utilities: `src/lib/__tests__/{utilName}.test.ts`
- Components: `src/components/__tests__/{ComponentName}.test.tsx`

If a target file already exists, append new `describe`/`it` blocks — do not overwrite.

**Prioritize testing:**
1. Custom hooks introduced by the feature (highest value)
2. Pure utility functions with logic
3. Component rendering only when there's conditional logic worth verifying

**Skip boilerplate tests** — don't test that a component renders without crashing if there's no logic to verify.

**Test structure pattern:**

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '../test-utils'
import { use{HookName} } from '@/hooks/use{HookName}'

describe('use{HookName}', () => {
  it('{scenario}', async () => {
    const { result } = renderHook(() => use{HookName}(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({...})
  })
})
```

**Coverage rules:**
- `smoke` — one test per hook/function for the primary success case
- `standard` — success + loading state + one error case
- `full` — all of the above + edge inputs + boundary values

---

## Update Sidecar

Update `.test-pipeline.md` Stage 3 (unit):
- Status: `completed`
- Test file path(s) created or modified
- Number of tests generated
- Vitest config flag if missing

---

## Progression

If mode is `all`, next load `./references/03-request.md`. Otherwise load `./references/04-run.md`.
