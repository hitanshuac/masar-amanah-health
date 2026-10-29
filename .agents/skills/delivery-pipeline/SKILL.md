---
name: delivery-pipeline
description: Runs the four-stage delivery pipeline (product spec, UI/UX spec and CSS, full-stack implementation, QA gate) in order, checking each stage's acceptance checklist before moving on. Use when the user asks to take a feature or app from idea to release, says "run the pipeline", or wants a spec-first build with a QA verdict.
---

# Delivery Pipeline

Read the project inputs in AGENTS.md first. Run stages in order; do not skip a gate.

| Stage | Skill | Reads | Writes | Gate |
|---|---|---|---|---|
| 1 | pm-product-strategist | AGENTS.md | docs/specs/PRODUCT_SPEC.md | Acceptance all pass |
| 2 | ux-reference-designer | PRODUCT_SPEC.md | DESIGN_SPEC.md, src/styles/*.css | Acceptance all pass |
| 3 | fullstack-architect | both specs | app code, schemas, DECISIONS.md | build green, runs offline |
| 4 | qa-production-guard | everything | QA_REPORT.md | verdict GO |

Rules:
- After each stage, print its Acceptance checklist as pass/fail and STOP for user approval if any item fails.
- On NO-GO, route each failing requirement ID to its owning stage, fix, then rerun stage 4.
- Never edit an upstream spec silently; log changes in DECISIONS.md.
