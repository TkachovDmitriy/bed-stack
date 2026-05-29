# Feature — Load Feature Graph into Context

Load a specific feature's graph file to give Claude focused context for the current task.

## What Success Looks Like

The feature's graph is read and summarized in context. Claude knows the feature's exports, dependencies, DB tables, query keys, and cross-feature relationships — without scanning any source files.

## Process

1. Read `_bmad-output/graphs/index.graph.md`. If it doesn't exist, tell the user to run `/graph build` first.

2. Check if the requested feature name exists in the index. If ambiguous or not found, list available feature names from the index and ask the user to clarify.

3. Read `_bmad-output/graphs/{feature-name}.graph.md`.

4. Summarize what was loaded: exports, DB tables touched, cross-feature dependencies, and any outbound invalidation edges.

## Usage Note

When working on a task that spans multiple features, the user can call `/graph feature [name]` multiple times to load each relevant slice. Each call adds ~500–1000 tokens of targeted context.
