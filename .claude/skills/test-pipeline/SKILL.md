---
name: test-pipeline
description: Generates and optionally runs tests (E2E Playwright, unit, Supabase request) for a feature story. Use when user says 'run test pipeline', 'write tests for this story', 'test-pipeline', or provides a story file to test.
---

# Test Pipeline

## Overview

This skill generates production-quality tests for an already-implemented feature — acting as a QA engineer who reads the story, architecture, and implementation changelog, then writes tests that verify the feature behaves correctly from the user's perspective.

E2E tests are the primary output and replace manual QA. Unit and request tests are supplementary layers. All test generation follows a **plan → approve → generate → optionally run** model. Existing tests are always appended to, never overwritten.

**Test locations:**
- E2E (Playwright): `{project-root}/e2e/`
- Unit (Vitest): alongside source files in `src/**/__tests__/`
- Request (Supabase): `{project-root}/supabase/functions/__tests__/`

**Modes:**
- `--mode=e2e` *(default)* — Playwright browser tests, full user flows
- `--mode=unit` — Vitest unit tests for hooks, utilities, components
- `--mode=request` — Tests for Supabase edge functions and RPC calls
- `--mode=all` — All three in order: unit → request → e2e

**Coverage:**
- `--coverage=smoke` — Happy path only
- `--coverage=standard` *(default)* — Happy path + key edge cases
- `--coverage=full` — Happy path + edge cases + negative/error scenarios

## On Activation

Load available config from `{project-root}/_bmad/config.yaml` if present.

**Detect story file path:**
- If a path was provided as an argument, confirm the file exists and proceed
- If no path provided, ask: "Please provide the path to your story file."

**Detect mode:**
- If `--mode` argument provided, use it
- If no mode provided, ask: "Which test mode? [e2e / unit / request / all] (default: e2e)"

**Detect coverage:**
- If `--coverage` argument provided, use it
- Otherwise default to `standard` silently

Once story path and mode are confirmed, load `./references/01-intake.md`.
