---
name: contract-drift-guard
description: Compares TypeScript interface definitions with JSON Schema contracts to prevent silent API drift between client, server, and documentation.
---

# Contract Drift Guard Skill

Use this skill whenever modifying `ScreeningInput`, `ClinicalEvaluationResult`, or API endpoints.

## Execution Workflow
1. Inspect `src/types/screening.ts` and `docs/specs/contract.schema.json`.
2. Verify that every key in the TypeScript interface exists in the JSON Schema `properties` definition with matching types (e.g., `boolean`, `number`, `enum`).
3. Verify that `docs/specs/response.schema.json` matches the narrative generator output structure.
4. Fail with an explicit diff if an interface contains unmapped or mismatched fields.
