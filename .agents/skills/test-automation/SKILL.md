---
name: test-automation
description: Generates automated clinical unit tests, contract validation suites, resilience regression scenarios, and mock fixtures for Node.js and TypeScript.
---

# Test Automation Skill (TypeScript / Node Edition)

Use this skill when asked to "write unit tests", "expand test coverage", "add resilience scenarios", or "verify edge cases" for clinical rules and API routes.

## Test Pyramid Requirements

1. **Tier 1: Clinical Unit Tests (Pure Logic):**
   - Test every rule in `clinicalEngine.ts` with boundary values:
     - Volume: `1.39 mL` (FAIL -> Tier 2) vs `1.40 mL` (PASS)
     - Motility: `41.9%` (FAIL -> Tier 2) vs `42.0%` (PASS)
     - BMI: `29.9` (PASS) vs `30.0` (FAIL -> Tier 3)
   - Test Circuit Breakers: `acuteSeverePain: true` must halt in <15ms with Tier 1.

2. **Tier 2: API Contract Tests (`/api/contextualize`):**
   - Test valid evaluation -> 200 OK + 5-section narrative.
   - Test missing `GEMINI_API_KEY` -> 200 OK + deterministic fallback narrative.
   - Test rate limiting -> 16th request in 1 minute returns 429.
   - Test malformed body -> 400 Bad Request (`ValidationError`).

3. **Tier 3: Synthetic Cohort Benchmarks:**
   - Execute the 100-profile UCI Fertility benchmark suite and assert:
     - 0 unhandled exceptions.
     - 100% classification matching expected guideline tier.
     - Execution time for all 100 profiles under 50ms.

## Verification Command
Run tests via:
```bash
npm run lint && npm run test:clinical && npm run test:compliance
```
