# Stage 9: Hook Layer

**Purpose:** Extract UI state logic, derived state, event handlers, and side effects from components into dedicated `*.hook.ts` files, leaving components responsible only for rendering.

---

## Auto-Skip Condition

If Stage 2 analysis found **no extractable hook logic** (components are already lean), skip this stage. Update sidecar Stage 9 as `skipped` and proceed to Stage 10.

---

## Collaboration Model

Present what will be extracted into each hook — inputs, outputs, and what the component will look like after. Get sign-off before making changes.

---

## What to Extract

- `useState` + related setters that manage a coherent piece of UI state
- `useEffect` calls that are not data fetching (already handled in Stage 8)
- `useCallback` / `useMemo` blocks with non-trivial logic
- Event handlers with business logic (not just simple setters)
- Derived state computed from multiple sources
- Form logic (react-hook-form setup, Zod schema, submit handler)
- Combining query results with local state

## What NOT to Extract

- A single `useState` with a trivial setter — leave inline
- `useRef` for DOM refs — stays in component
- Simple `onClick` that just calls a mutation — can stay inline
- Logic already in query hooks from Stage 8

---

## Hook Conventions

```typescript
// use-engineer-service-form.hook.ts

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceSchema } from './engineer-services.types'
import { useCreateEngineerService } from './engineer-services.query'
import type { CreateServiceInput } from './engineer-services.types'

export function useEngineerServiceForm(onSuccess?: () => void) {
  const { mutate: createService, isPending } = useCreateEngineerService()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { title: '', price: 0, category: '' },
  })

  function handleSubmit(values: CreateServiceInput) {
    createService(values, { onSuccess })
  }

  return { form, isPending, handleSubmit: form.handleSubmit(handleSubmit) }
}
```

## Hook Interface Rules

- Return only what the component needs — don't expose internal state unnecessarily
- Name the hook after what it manages: `useEngineerServiceForm`, `useServiceFilters`, `useServiceCardState`
- Prefix with `use` always
- Accept only what the hook genuinely needs as parameters

---

## Destination Rules

| Hook | Destination |
|------|------------|
| Used in 1 feature | `{feature-name}.hook.ts` or `use-{name}.hook.ts` |
| Used in 2+ features | `src/shared/hooks/use-{name}.hook.ts` |

---

## What the Component Should Look Like After

After extraction, the component should:
- Import and call the hook
- Destructure only what it renders
- Contain no business logic, only JSX and event wiring

```tsx
// Before — business logic in component
function ServiceForm() {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ... 40 lines of logic

  return <form>...</form>
}

// After — clean component
function ServiceForm() {
  const { form, isPending, handleSubmit } = useEngineerServiceForm()
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Execution

For each hook:
1. Create the hook file with the extracted logic
2. Update the component to import and use the hook
3. Verify the component still behaves correctly
4. Verify the hook is properly typed

---

## Sidecar Update

Update sidecar Stage 9:
- Status: completed
- Hooks extracted (list names and destination files)
- Components simplified (note before/after line counts if significant)

---

## Progression

Load `./references/10-ui-layer.md`.
