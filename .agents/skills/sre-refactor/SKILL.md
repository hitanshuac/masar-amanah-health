---
name: sre-refactor
description: 5-phase decomposition of God Objects and complex components into modular Single Responsibility Principle (SRP) units while preserving 100% of clinical contracts and test passes.
---

# SRE-Compliant Refactor (TypeScript / React)

Use this skill when refactoring large components (e.g., `Step4Results.tsx` or `server.ts`), reducing cyclomatic complexity, or modularizing functions with zero downtime.

## 5-Phase Decomposition Protocol

### Phase 1: Contract Baseline
- Identify the public interface/props of the target file.
- Verify existing tests pass before touching code: `npm run lint && npm run build`.

### Phase 2: Extraction Strategy
- Identify distinct responsibilities within the target (e.g., in `Step4Results.tsx`: Narrative Display vs. Facility Cards vs. Audit Accordion vs. Print Controls).
- Plan target files in `src/components/` with strict input/output props.

### Phase 3: Surgical Modularization
- Extract child components/modules one at a time.
- Keep the parent component as a thin orchestrator.
- Do NOT alter any clinical evaluation logic or data schemas (`types/screening.ts`).

### Phase 4: Typecheck & Compile Gate
- Execute `npm run lint` (`tsc --noEmit`).
- Ensure no implicit `any` and no broken import paths.

### Phase 5: Regression Verification
- Run the clinical engine test harness (`npm run test:clinical`).
- Verify all 16 resilience matrix scenarios (`RES-1` through `RES-16`) continue to pass.
