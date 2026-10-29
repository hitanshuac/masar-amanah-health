---
trigger: always_on
description: Core agentic governance adapted from antigravity-agentic-governance-template for Masar Amanah Health
---

# Core Agentic Governance (Masar Amanah Health)

## 1. 5-Tier Safety & Conflict Hierarchy
When instructions conflict, resolve strictly in this order:
- **Tier 0 (Clinical Determinism & Zero-PII):** Never persist PII, never create databases/cookies, and never allow an LLM to compute or alter clinical triage tiers (`EMERGENCY`, `ANDROLOGY`, `PRIMARY_CARE`, `LIFESTYLE`).
- **Tier 1 (Non-Destructive Execution):** Never delete existing clinical rules (`clinicalEngine.ts`), resilience tests, or security headers (`server.ts`) without explicit user confirmation.
- **Tier 2 (Defensive Contracts):** Enforce strict TypeScript types and JSON schema validation (`ValidationError`) at every API boundary; always maintain a `<10ms` deterministic fallback when offline or rate-limited.
- **Tier 3 (Anti-Over-Engineering / 7-Step YAGNI Ladder):** Prefer native TypeScript/React/SVG over new npm dependencies. Never install external libraries for tasks solvable in <50 lines of standard code.
- **Tier 4 (Anti-AI-Slop UI):** Enforce solid surfaces (`bg-slate-50`, `bg-white`, `bg-emerald-950`). Never use `backdrop-filter`, `blur()`, neon gradients, or `dangerouslySetInnerHTML`.

## 2. Environment Lock
- Workspace Stack: **Node.js 20+ · Express · React 19 · TypeScript · Vite · Tailwind CSS v4**.
- Never generate Python, FastAPI, Ruff, Pytest, or DuckDB files in this repository.

## 3. SRE Inner/Outer Verification Gate
After every multi-file code edit:
1. **Inner Loop:** Run `npm run lint` (`tsc --noEmit`) and fix any type errors immediately.
2. **Outer Loop:** Run `npm run build` and the clinical engine test harness to confirm 0 regressions before reporting completion.
