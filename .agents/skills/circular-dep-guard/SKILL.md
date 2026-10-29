---
name: circular-dep-guard
description: Analyzes the TypeScript import tree to detect and eliminate circular dependencies before production bundling.
---

# Circular Dependency Guard (madge)

Use this skill when refactoring components or after adding new features to ensure import tree health.

## Execution Workflow
1. Execute `madge` on TypeScript source paths:
   ```bash
   npx --yes madge --circular --extensions ts,tsx src/ server.ts
   ```
2. If cycles are detected:
   - Identify the shared type or utility causing the cycle.
   - Extract the shared interface into `src/types/` to break the loop.
3. Assert: Zero circular dependencies found.
