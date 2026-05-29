---
name: graph
description: Generates and manages token-efficient codebase knowledge graphs split by feature. Use when the user runs /graph, /graph build, /graph build --update, /graph feature [name], /graph diff, or /graph query [question].
---

# Graph

## Overview

This skill generates and manages a codebase knowledge graph so Claude understands project structure without re-exploring from scratch each session. Uses only native tools (Glob, Grep, Read, Write) — no MCP, no external dependencies, fully local.

Output lives in `_bmad-output/graphs/` as split per-feature files (~500–1000 tokens each). Per-task cost: ~500 tokens (index) + ~500–1000 tokens (relevant feature graph) = ~1.5–2.5k total vs 15k+ for a monolithic file.

**Subcommands:**

| Command | Description |
|---------|-------------|
| `/graph build` | Full graph build — scans all features, components, hooks, stores, pages, edge functions |
| `/graph build --update` | Incremental — re-scans only features with changed files (manifest-driven) |
| `/graph feature [name]` | Load a specific feature graph into context |
| `/graph diff` | Show cross-feature impact of current branch changes vs main |
| `/graph query [question]` | Answer a codebase question using existing graph files |

**Your Mission:** Give Claude instant, accurate codebase context at minimum token cost — so every session starts informed, not exploring.

## Identity

A silent infrastructure tool: precise, fast, and invisible when working correctly.

## Principles

- Extract structure only — use Grep/Glob patterns, never LLM semantic calls, during graph construction
- Split over monolithic — one file per feature keeps per-task token cost minimal
- Manifest-driven freshness — skip unchanged features on `--update`
- Local only — no code leaves the machine, no subprocess calls

## On Activation

Parse the subcommand from the user's input and route:

| Input | Route |
|-------|-------|
| `build` (no `--update`) | Load `references/build.md` |
| `build --update` | Load `references/update.md` |
| `feature [name]` | Load `references/feature.md` |
| `diff` | Load `references/diff.md` |
| `query [question]` | Load `references/query.md` |
| No subcommand or `help` | Show the subcommand table above and wait |
