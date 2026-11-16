# Masar Amanah Health (مسار أمانة) · Project Constitution

> **Status:** RATIFIED & LOCKED  
> **Jurisdiction:** Masar Amanah Health Architecture & Spec-Driven Development (SDD)  
> **Enforcement Scope:** Every code commit, PR, feature iteration, `/speckit.analyze`, and Evaluation Flywheel audit.

---

## 1. Preamble & Governance Hierarchy

Masar Amanah Health provides privacy-first deterministic male reproductive health screening with culturally dignified AI narratives and Abu Dhabi Department of Health (DoH) / ADPHC care routing. Because patient health, clinical safety, and data sovereignty in the UAE and GCC are sacred trusts (*Amanah*), all engineering operations must comply with a strict 5-Tier Safety & Conflict Hierarchy:

- **Tier 0 — Clinical Determinism & Zero-PII Sovereignty:** Clinical triage tiers (`TIER_1_EMERGENCY`, `TIER_2_ANDROLOGY_SPECIALIST`, `TIER_3_PRIMARY_CARE`, `TIER_4_LIFESTYLE`) and circuit breakers are computed 100% deterministically by `clinicalEngine.ts` and `diagnosticGraph/`. The LLM layer is strictly confined to cultural rephrasing; it may NEVER alter triage tiers, action codes, or triggered rules. Zero PII is persisted anywhere.
- **Tier 1 — Non-Destructive Invariant Protection:** Never delete or weaken clinical rules in `clinicalEngine.ts`, Bayesian DAG inference nodes, resilience test suites, or Express security headers (`server.ts`) without explicit human approval.
- **Tier 2 — Defensive Type & Contract Enforcement:** Enforce strict TypeScript types and JSON Schema synchronization with 0 drift at all times.
- **Tier 3 — Anti-Over-Engineering (YAGNI Ladder):** Prefer native TypeScript, React 19, and SVG primitives over heavy npm dependencies. Maintain zero bloat.
- **Tier 4 — Anti-AI-Slop Visual Standards:** Enforce solid, dignified surfaces (`bg-slate-50`, `bg-white`, `bg-emerald-950`). Forbid `backdrop-filter`, blur effects, neon gradients, and unvetted styling gimmicks.

---

## 2. Core Non-Negotiable Constitutional Articles

### Article I: Frozen Clinical Contract
1. **Input Interface Parity:** `ScreeningInput` in [`src/types/screening.ts`](../../src/types/screening.ts) must contain exactly **18 properties**:
   - Safety: `acutePain`, `painlessLump`, `age`, `heightCm`, `weightKg`, `bmi` (6)
   - Clinical History: `steroidsTrt`, `undescendedTesticle`, `varicocele`, `mumpsOrchitis` (4)
   - Lifestyle/Environment: `sittingHours`, `frequentHeat`, `tobaccoShisha` (3)
   - Semen Panel: `hasSemenReport`, `semenVolume`, `semenConcentration`, `semenMotility`, `semenMorphology` (5)
2. **Evaluation Interface Parity:** `ClinicalEvaluationResult` in [`src/types/screening.ts`](../../src/types/screening.ts) must contain exactly **12 properties**:
   - `triage_tier`, `action_code`, `circuit_breaker_triggered`, `circuit_breaker_type`, `triggered_rules`, `summary_en`, `summary_ar`, `audit_timestamp`, `algorithm_version`, `zero_pii_session_id`, `gates`, `evidenceIndex`.
3. **Contract Drift Guarantee:** [`docs/specs/contract.schema.json`](../../docs/specs/contract.schema.json) and [`docs/specs/response.schema.json`](../../docs/specs/response.schema.json) must remain 100% synchronized with TypeScript definitions at all times.

### Article II: Zero-PII Ephemerality & OPSEC
1. **Persistent Browser Storage Ban:** Total prohibited persistent storage invocations across all client code must be strictly **zero (0)**:
   - `localStorage` = 0
   - `sessionStorage` = 0
   - `indexedDB` = 0
   - `document.cookie` / cookie jars = 0
   - All state is strictly in-memory (React ephemeral memory) and disposed of immediately upon session termination.
2. **Zero Raw HTML Injection:** Prohibit `dangerouslySetInnerHTML` across all UI and AI components. All AI narrative outputs and formatted clinical facts must render via sanitized, safe tokenized components (`SafeNarrative.tsx`).
3. **OPSEC & Clean Working Tree:** Zero hardcoded local user machine paths (e.g. `c:/Users/`, `/home/`, `.gemini/antigravity`) may exist inside committed repository files. All file exports, traces, and demo recordings must route to standard home environment paths without dirtying Git tracked files.

### Article III: Universal S-O-A-P + SOP Co-Pilot Discipline
1. **Standardized 4-Step S-O-A-P Encounter Spine:** Every clinical scenario and Standard Operating Procedure (`SOP-01` through `SOP-06`) must implement the exact 4-step encounter spine:
   - **Step S (Subjective):** Patient intake, OLDCARTS interview, abstinence verification, and acute red-flag rule-outs.
   - **Step O (Objective):** Physical QC, WHO 6th Edition semen analysis parameters, and endocrine laboratory panels.
   - **Step A (Assessment):** Multi-label differential diagnosis, Shannon Information Gain ($\Delta H$) optimization, and open loop resolution.
   - **Step P (Plan):** 90-day spermatogenic cycle recovery simulation, Abu Dhabi DoH care routing, and Malaffi HL7 FHIR R4 handoff.
2. **AI Co-Pilot 1-Click Action Trio:** Every SOAP step within [`src/data/sopRegistry.ts`](../../src/data/sopRegistry.ts) must define three 1-click prompt injections requiring zero manual typing:
   - `prefillExpectedPrompt`: Encapsulated in `<sop_execution sop_id="..." step="...">`
   - `prefillDeviationPrompt`: Encapsulated in `<sop_deviation_injection sop_id="..." step="...">`
   - `prefillStuckPrompt`: Encapsulated in `<sop_inquiry sop_id="..." step="...">`
3. **Interactive Follow-Up Question Schema:** Each SOAP step must include an exact tuple of **3 interactive follow-up questions** (`[FollowUpQuestion, FollowUpQuestion, FollowUpQuestion]`) containing:
   - Bilingual question text (`questionEn`, `questionAr`)
   - Clinical rationale (`clinicalRationaleEn`, `clinicalRationaleAr`)
   - Interactive action pills (`actionYesLabelEn/Ar`, `actionNoLabelEn/Ar`)
   - Deterministic factual outcomes (`factIfYes`, `factIfNo`) logged directly to the clinical chart.

### Article IV: Performance & Motion Choreography Standards
1. **Production Bundle Budgets:**
   - Entry JavaScript: `< 150 kB` gzip (Current: ~130.7 kB gzip).
   - Entry CSS: `< 20 kB` gzip (Current: ~12.7 kB gzip).
2. **Choreographed Spring Physics:** Interactive state transitions and Bayesian probability updates must use fluid spring curves (`cubic-bezier(0.22, 1, 0.36, 1)`) with prior-to-posterior ghost bar indicators (`.bar-ghost`).
3. **Full Reduced Motion Parity:** Every animation, keyframe, and transition must provide strict 100% parity with `@media (prefers-reduced-motion: reduce)`, snapping instantly to completed state without duration or motion sickness triggers.
4. **Solid Surface UI (Anti-Slop):** Canvas must be `bg-slate-50`; cards must be solid `bg-white`; sovereign accents must use `bg-emerald-950` and `bg-emerald-800`. No fuzzy translucent layers or blur filters.

---

## 3. Operational Verification Gates

Before any build is deemed compliant or ready for submission, all 5 Core Verification Gates must pass with 100% conformance:

1. **Gate 1 (Type Integrity):** `npm run lint` (`tsc --noEmit`) $\to$ `0` errors.
2. **Gate 2 (Clinical Engine Invariant):** `npm run test:clinical` $\to$ `16/16` tests passed ($ICC = 1.000$).
3. **Gate 3 (Compliance & Security):** `npm run test:compliance` $\to$ `6/6` audits passed (WCAG 2.1 AA, Zero-PII, madge circular dependencies, bundle budgets, schema contract, OWASP SAST).
4. **Gate 4 (Production Build):** `npm run build` $\to$ Gzip assets strictly within bundle budgets.
5. **Gate 5 (Evaluation Flywheel Scorecard):** Automated Rubric & Scorecard Audit $\to$ Composite Jury Score $\ge 9.5/10$ across all 8 dimensions.
