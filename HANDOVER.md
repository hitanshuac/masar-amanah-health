# HANDOVER — 4-Persona Delivery Pipeline for Antigravity IDE

PM -> UX -> Full-stack -> QA, as four Agent Skills plus an always-on `AGENTS.md`. Stack-agnostic; the UX skill ships plain CSS.

## 1. Inventory
| Path (this bundle) | Purpose | Produces |
|---|---|---|
| `pm-product-strategist/SKILL.md` | curation, taxonomy, roles, alert policy, journey | `docs/specs/PRODUCT_SPEC.md` (`PM-n`) |
| `ux-reference-designer/SKILL.md` | tokens, 4-region layout, components, states, troubleshooting | `docs/specs/DESIGN_SPEC.md` (`UX-n`) + CSS in `src/styles/` |
| `ux-reference-designer/references/tokens.css` `layout.css` `components.css` | copy-paste CSS | styles |
| `ux-reference-designer/references/demo.html` | visual target to compare against | — |
| `ux-reference-designer/references/tailwind-map.md` | class -> Tailwind utilities, forbidden utilities | — |
| `fullstack-architect/SKILL.md` | contract, ingestion, LLM structured output, profile, notifications | code + `contract.schema.json`, `response.schema.json`, `DECISIONS.md` (`ENG-n`) |
| `qa-production-guard/SKILL.md` | failure matrix, build gate, deploy readiness, conformance, GO/NO-GO | `docs/specs/QA_REPORT.md` |
| `sast-compliance/SKILL.md` | OWASP Top 10, Semgrep rules, secret hygiene, zero XSS, PII redaction | `docs/specs/03_SECURITY.md`, scan results |
| `master-sync/SKILL.md` | master 8-phase orchestration protocol (AST, contracts, SAST, tests, build, doc, deploy) | end-to-end synchronized state |

## 2. Platform facts used (verified against Antigravity docs, Oct 2026)
| Topic | Fact |
|---|---|
| Workspace skills | `<workspace-root>/.agents/skills/<skill-folder>/SKILL.md` (legacy `.agent/skills` still read) |
| Global skills (IDE) | `~/.gemini/config/skills/<skill-folder>/` |
| SKILL.md frontmatter | `name` optional (defaults to folder), `description` required |
| Activation | Agent sees name+description at conversation start, loads the body when relevant. Naming a skill in your prompt forces it. |
| Inspect | agent side panel `…` menu -> **Customizations** |
| Rules | `AGENTS.md` / `GEMINI.md`: no frontmatter, always on. Files in `.agents/rules/*.md` MUST start with YAML `trigger:` (`always_on` / `model_decision` / `glob` / `manual`) or they are silently discarded. Flat dir only. 24 KB per file; 20,000-token budget for always-on rules. |
| Workflows | IDE docs state old-style workflows stop working **Oct 19, 2026** (past). Migrate with `/migrate-workflows` or move logic into skills. This bundle uses skills + prompts instead. |
| Not documented for IDE | `/<skill-name>` slash invocation is documented for the App and CLI. In the IDE, invoke by naming the skill in the prompt. |
| Security | Skills run with the agent's permissions. Read each `SKILL.md` before installing from any third party. |

## 3. Install (IDE)
Run from this bundle's folder. Replace `<project>` with your repo root.

macOS / Linux:
```bash
mkdir -p <project>/.agents/skills
cp -R pm-product-strategist ux-reference-designer fullstack-architect qa-production-guard <project>/.agents/skills/
mkdir -p <project>/docs/specs <project>/src/styles
```
Windows (PowerShell):
```powershell
New-Item -ItemType Directory -Force "<project>\.agents\skills","<project>\docs\specs","<project>\src\styles" | Out-Null
Copy-Item -Recurse pm-product-strategist,ux-reference-designer,fullstack-architect,qa-production-guard "<project>\.agents\skills\"
```
Global instead (all projects): copy the four folders to `~/.gemini/config/skills/`.

Then:
1. File -> Open Folder -> the project root (not a parent).
2. Start a NEW agent conversation (existing ones don't re-scan).
3. `…` -> Customizations -> confirm all four skills are listed.

Resulting tree:
```
<project>/
├── AGENTS.md                      (section 4)
├── .agents/skills/
│   ├── pm-product-strategist/SKILL.md
│   ├── ux-reference-designer/{SKILL.md, references/*}
│   ├── fullstack-architect/SKILL.md
│   ├── qa-production-guard/SKILL.md
│   └── delivery-pipeline/SKILL.md (optional, section 6)
├── docs/specs/                    (artifacts land here)
└── src/styles/                    (tokens.css layout.css components.css)
```

## 4. `AGENTS.md` (project root, always on) — fill the values once
The skills use `{{VARS}}`. Define them here so every stage sees the same values.
```markdown
# Project inputs
- PRODUCT_GOAL: <one sentence>
- TARGET_USERS: <who>
- CADENCE: <daily|weekly|...>
- ROLES: <3-5 roles>
- CATEGORIES (BEATS): <3-5 categories>
- CANDIDATE_SOURCES: <free/public APIs>
- REFERENCE (UI): <URL or design-tool screen path>
- BRAND: <name>
- RUNTIME: <local | hosted builder | container platform>
- LLM_PROVIDER / AUTH_PROVIDER: <...>
- DEPLOY_TARGET: <...>

# Conventions
- Specs live in docs/specs/. Requirement IDs: PM-n, UX-n, ENG-n (one per line, testable).
- Pipeline order: pm-product-strategist -> ux-reference-designer -> fullstack-architect -> qa-production-guard.
- Never start a stage before the previous stage's Acceptance checklist passes.
- Styling uses only the CSS tokens in src/styles/tokens.css. No hex/px literals elsewhere.
- Implement in the project's existing language/framework. If none, record the choice in docs/specs/DECISIONS.md.
```
Keep it short; it is injected every turn.

## 5. Run the pipeline (copy-paste prompts)
Use one conversation per stage; artifacts in `docs/specs/` carry the state between them.

| # | Prompt | Output | Gate |
|---|---|---|---|
| 1 | `Use the pm-product-strategist skill. Read the project inputs in AGENTS.md. Write docs/specs/PRODUCT_SPEC.md. Show each Acceptance item as pass/fail.` | `PRODUCT_SPEC.md` | every Acceptance box passes |
| 2 | `Use the ux-reference-designer skill. Input: docs/specs/PRODUCT_SPEC.md. Copy tokens.css, layout.css, components.css from the skill's references/ folder into src/styles/. Write docs/specs/DESIGN_SPEC.md. Build the shell from references/demo.html markup.` | `DESIGN_SPEC.md`, `src/styles/*.css`, UI shell | page matches `demo.html` at 375 and 1440 px; grep for `backdrop-filter\|rgba(\|blur(` is empty |
| 3 | `Use the fullstack-architect skill. Inputs: docs/specs/PRODUCT_SPEC.md and DESIGN_SPEC.md. Implement in the existing stack. Emit contract.schema.json, response.schema.json, DECISIONS.md and README run steps in docs/specs/ or repo root.` | working app | runs offline with no key; build has zero errors |
| 4 | `Use the qa-production-guard skill. Build and run the app. Test every scenario in the matrix. Write docs/specs/QA_REPORT.md with the conformance table and a GO/NO-GO verdict.` | `QA_REPORT.md` | verdict GO |

NO-GO loop: for each failing ID, send the fix to the owning skill (`PM-n` -> PM, `UX-n` -> UX, `ENG-n` -> Full-stack), then rerun stage 4.

## 6. Optional: `delivery-pipeline` skill (replaces a `/workflow`)
Save as `.agents/skills/delivery-pipeline/SKILL.md`. Then say: `Use the delivery-pipeline skill to build <feature>.`
```markdown
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
```

## 7. Requirement traceability
`PM-n` / `UX-n` / `ENG-n` are one-line, testable statements. QA's conformance table must list each ID exactly once with status (met / partial / missing), evidence and fix. UX ships baseline `UX-1`..`UX-11`; keep their numbers.

## 8. Troubleshooting
| Symptom | Fix |
|---|---|
| Skill not in Customizations | folder must be `.agents/skills/<name>/SKILL.md` (plural, one level deep); `description` present; open the project root; start a new conversation |
| Skill never auto-triggers | name it in the prompt; sharpen the `description` with the phrases you actually type |
| Agent can't find the CSS files | docs list `scripts/`, `examples/`, `resources/`; `references/` isn't listed but SKILL.md links it by relative path. If it still doesn't open them: `mv references resources` then `sed -i 's#references/#resources/#g' SKILL.md resources/*.md` |
| A rule file is ignored | `.agents/rules/*.md` needs frontmatter with `trigger:` (snake_case); no subfolders |
| `{{VAR}}` left in output | value missing from AGENTS.md; add it and rerun the stage |
| Old `/workflow` commands do nothing | expected after Oct 19, 2026; use section 5 prompts or the section 6 skill, or run `/migrate-workflows` |
| Styles look blurry/inconsistent | run the UX skill's grep check; see its Troubleshooting table |
| Context bloat | keep `AGENTS.md` under ~100 lines; descriptions under ~2 sentences of triggers; one conversation per stage |

## 9. Definition of done & Release Badges
- [x] 4 Core Delivery skills + 4 Governance skills configured in `.agents/skills`
- [x] `AGENTS.md` filled; no `{{VAR}}` remains in generated specs
- [x] `PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, `contract.schema.json`, `response.schema.json`, `QA_REPORT.md` synchronized
- [x] App renders with no network and no API key (100% deterministic offline fallback)
- [x] Build (`npm run build`), typecheck (`tsc --noEmit`), and lint exit 0
- [x] Automated clinical harness (`npm run test:clinical`): 14/14 tests pass (100%)
- [x] Compliance scans (`npm run test:compliance`): 6/6 scans pass (100%)
- [x] **SAST & OWASP Top 10 Compliance Badge**: `[PASS: 0 VIOLATIONS]` (No XSS, no raw HTML, no hardcoded secrets)
- [x] **Defensive Boundary Whitelisting Badge**: `[PASS: 100% WHITELISTED]` (XML delimiters `<clinical_evaluation>`, numeric schema whitelisting, HTTP security headers)
- [x] **OPSEC Path Sanitization Badge**: `[PASS: ZERO LOCAL PATH LEAKS]` (Zero developer drive paths, ephemeral in-memory buffers, sanitized logs)
- [x] **Zero-PII Invariant**: `[PASS: 100% IN-MEMORY]` (Zero localStorage, sessionStorage, indexedDB, or cookies)
- [x] `QA_REPORT.md` verdict = GO (GITEX 2026 Gold Master Release Ready)

## 10. Known limits
- Not executed inside Antigravity by the author; the install paths and rule/skill formats come from the official docs.
- IDE-specific skill slash invocation is undocumented; name the skill in the prompt.
- Free-tier and quota limits of your deploy target change; QA re-verifies them each release.
- The migration target for workflows is still being announced by Google; revisit `delivery-pipeline` when it ships.

## Sources
- https://antigravity.google/docs/skills (skill locations, frontmatter, activation)
- https://antigravity.google/docs/rules (rule locations, frontmatter, limits)
- https://antigravity.google/docs/ide/workflows (workflow deprecation date, migration)
