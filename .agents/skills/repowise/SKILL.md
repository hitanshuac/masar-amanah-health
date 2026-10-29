---
name: repowise
description: Analyzes repository architecture, generates an AST-based dependency graph, maps module coupling, and explains cross-file imports for TypeScript/React.
---

# Repowise — TypeScript Architecture & Dependency Mapper

Use this skill when asked to "map the codebase", "trace dependencies", "find circular imports", or understand module coupling before a major refactor.

## Execution Workflow

1. **Dependency Analysis:**
   - Scan `package.json`, `tsconfig.json`, `server.ts`, and `src/`.
   - Identify module dependencies: UI components (`src/components/`) -> Clinical Engine (`src/lib/clinicalEngine.ts`) -> API Handlers (`server.ts`).
   - Flag any circular dependencies between client and server code.

2. **AST Surface Extraction:**
   - Map all public exports, interfaces, and function signatures.
   - Trace how `ScreeningInput` travels from `Step1Safety.tsx` through `Step3Lifestyle.tsx` to `evaluateClinicalRisk()` and finally to `/api/contextualize`.

3. **Coupling & Risk Report:**
   Output a compact ASCII graph:

   ```
   server.ts ──► contextualizeHandler.ts ──► deterministicNarrative.ts
      │
      └──► dist/ (Static SPA) ──► App.tsx ──► Step1..Step4 ──► clinicalEngine.ts
   ```

   Highlight high-fan-in files (e.g., `types/screening.ts`, `clinicalEngine.ts`) where edits risk breaking multiple components.
