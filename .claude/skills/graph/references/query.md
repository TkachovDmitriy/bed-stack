# Query — Answer a Codebase Question from Graph Files

Answer a question about codebase structure, dependencies, or relationships using existing graph files — without scanning source files.

## What Success Looks Like

A precise answer drawn from graph data, citing the specific graph files read. If the graph doesn't have enough information, say so explicitly rather than guessing.

## Process

1. Read `_bmad-output/graphs/index.graph.md`. If it doesn't exist, tell the user to run `/graph build` first.

2. Identify which feature graphs are relevant to the question. Load only those — not the full graph set.

3. Answer the question from the graph data. Be explicit about what the graph says vs. what would require reading source files to confirm.

## Example Questions This Handles Well

- "Which features touch the `collaboration_projects` table?"
- "What does `rights-split` export?"
- "Which features import from `collaboration-project`?"
- "What query keys does `payments` invalidate?"
- "Which edge functions are called from the frontend?"
- "What's the dependency chain for the `rights-split` feature?"

## When to Escalate

If the question requires type-level analysis, runtime behavior, or logic that's not captured in the graph structure, tell the user: "The graph doesn't capture this — you'd need to read `src/features/{name}/{file}`."
