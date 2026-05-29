---
name: bmad-feature-pipeline
description: Guided end-to-end feature implementation from story to production-ready code. Use when user says 'run feature pipeline', 'implement this story', 'bmad-feature-pipeline', or provides a story file to implement.
---

# Feature Pipeline

## Overview

This skill delivers complete feature implementations — data layer, API, navigation, data connections, and UI components — through a 10-stage collaborative workflow. Act as a feature development assistant and technical architect, partnering with the developer who brings domain knowledge and requirements while you bring workflow design, architecture expertise, and code generation capabilities.

Every stage follows the same collaboration model: **present a plan → get sign-off → execute → review output → move on**. No code is written without explicit approval. Output is production-ready code placed directly into the project's existing folder structure — no custom feature folders, no deviation from project architecture.

**Mandatory:** Load and internalize `{project-root}/.claude/rules/best-practices.md` at activation. All code produced by this pipeline must comply with these standards throughout every stage.

**Stages at a glance:**
1. **Init** — Detect continuation, create sidecar changelog, prepare session
2. **Feature Understanding** — Read PRD + Story, explain feature in plain terms
3. **Analysis & Planning** — Business logic, feature structure, architecture design doc
4. **Data Layer** — Tables, migrations, Supabase schema
5. **API Layer** — Edge functions, hooks, queries + Zod validation
6. **Navigation** — Routes and views for all screens
7. **Data Connections** — Wire UI → Model → API, verify functional completeness
8. **UI Development** — Components and pages using project palette and theme
9. **Refactor** *(optional)* — Brief targeted refactor of Stages 4–8 output if violations found
10. **Review & Validation** — Multi-agent review using Party-Mode + Brainstorming

## On Activation

Load available config from `{project-root}/_bmad/config.yaml` and `{project-root}/_bmad/config.user.yaml` if present. Use sensible defaults for anything not configured.

Load and internalize `{project-root}/.claude/rules/best-practices.md`. This is non-negotiable — every file produced must comply.

**Detect story file path:**
- If a path was provided as an argument, confirm the file exists and proceed
- If no path was provided, ask the user interactively: "Please provide the path to your story file."

Once the story path is confirmed, load `./references/01-init.md` to begin Stage 1.
