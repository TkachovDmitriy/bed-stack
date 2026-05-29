# Stage 8: UI Development

**Purpose:** Build all UI components and polish every page using the project's Shadcn UI component library, Radix UI primitives, Tailwind CSS, and the established palette and theme. Data is already wired — this stage is about the visual layer.

**Best practices:** All work must comply with `{project-root}/.claude/rules/best-practices.md`.

---

## Collaboration Model

**Plan first:** Present the component breakdown for each page — which Shadcn/Radix components to use, the layout structure, responsive behavior, and any custom components needed. Get sign-off.

---

## Planning

For each page/screen, plan:

- **Layout structure** — page layout, grid/flex arrangement, responsive breakpoints (mobile-first)
- **Component selection** — which Shadcn UI components (`Button`, `Card`, `Dialog`, `Form`, `Table`, `Sheet`, etc.) cover each UI element
- **Custom components** — what needs to be built that doesn't exist in Shadcn (place in `src/components/` using the micro-folder pattern)
- **Theme compliance** — use CSS variables and the project's slate base color palette; no hardcoded colors
- **Empty and loading states** — skeleton loaders, empty state illustrations, error states per component
- **Accessibility** — ARIA labels, keyboard navigation, focus management for modals/dialogs

Present the plan as a screen-by-screen component tree.

---

## Implementation

Build page by page. For each screen:

- Use Shadcn UI components as the base — extend via `className` and Tailwind utilities
- Follow the component structure order: export declaration → subcomponents → helpers → static content → types
- Break down complex layouts into smaller focused components with minimal props
- Use composition over configuration for complex UI elements
- Apply responsive design using Tailwind's mobile-first breakpoints (`sm:`, `md:`, `lg:`)
- Optimize images: WebP format, size attributes, `loading="lazy"`
- Wrap async boundaries in `<Suspense>` with appropriate fallbacks
- Use dynamic imports for non-critical components

Custom component files follow the naming convention: `lowercase-with-dashes.tsx` in a feature subfolder under `src/components/`.

---

## Review

After each screen is complete, present it with:
- Components used
- Responsive behavior confirmed
- Accessibility considerations applied
- Any deviations from the plan and why

Ask the developer to confirm the page meets the visual and functional expectations before moving to the next.

---

## Sidecar Update

Update the sidecar changelog for Stage 8:
- Status: completed
- Components created
- Design decisions noted
- Screens completed

---

## Progression

When all screens are approved, load `./references/09-refactor.md`.
