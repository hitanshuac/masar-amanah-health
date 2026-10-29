# Product Specification — Masar Amanah Health (مسار أمانة)

> GITEX 2026 · Future Health Challenge · Male Reproductive Health Track
> Algorithm: v1.4-AUA2021-WHO6-UAE · Zero-PII Architecture

---

## Curation Policy {#curation}

- PM-1: Each screening session surfaces a maximum of 12 triggered clinical rules, ranked by severity (critical > high > moderate > low), then by rule category priority (EMERGENCY > ANDROLOGY > METABOLIC > LIFESTYLE).
- PM-2: No duplicate rules shall appear in a single evaluation; each `rule_id` fires at most once per session.
- PM-3: Clinical rules are sourced exclusively from: WHO 6th Edition Semen Manual (2021), AUA/ASRM Male Infertility Best Practice Guidelines, EAU Infertility Guidelines, and Endocrine Society Clinical Practice Guidelines.
- PM-4: The LLM cultural narrative layer (Stage 4) rephrases but never alters the deterministic triage tier, action code, or triggered rule set.
- PM-5: When no rules are triggered, the UI must still display a positive Tier 4 Lifestyle guidance — never a blank or empty state.

## Taxonomy & Urgency {#taxonomy}

- PM-6: **Emergency (Tier 1)** — Inclusion: Acute scrotal pain (<24h onset) OR painless firm testicular mass. Urgency: 90–100 (BREAKING). Action: Immediate ED referral.
- PM-7: **Andrology Specialist (Tier 2)** — Inclusion: Exogenous androgen use OR cryptorchidism OR varicocele OR any WHO 6th Ed semen threshold failure (volume <1.4mL, concentration <15M/mL, motility <42%, morphology <4%). Urgency: 60–89 (NOTABLE). Action: Specialist referral.
- PM-8: **Primary Care (Tier 3)** — Inclusion: BMI ≥30 (adipose aromatization) OR post-pubertal mumps orchitis. Urgency: 30–59 (NORMAL-ELEVATED). Action: PCP workup referral.
- PM-9: **Lifestyle Optimization (Tier 4)** — Inclusion: Sedentary ≥8hrs/day, frequent heat exposure, tobacco/shisha use, or no risk factors. Urgency: 0–29 (NORMAL). Action: Self-guided optimization.
- PM-10: Urgency score bands — `0–29: normal`, `30–59: normal-elevated`, `60–89: notable`, `90–100: breaking`. Each clinical rule maps to exactly one band.

## Personalization {#roles}

- PM-11: **Patient role** — Default. Sees culturally framed narrative, care directory cards, and discreet daily wellness steps. "Why this matters": _Your reproductive health is a vital part of overall well-being; this screening gives you private, evidence-based clarity to take proactive steps._
- PM-12: **Clinician Companion role** — Sees full deterministic JSON audit trail expanded by default, raw rule IDs, measured values vs. thresholds, and guideline source citations. "Why this matters": _Accelerate clinical intake by reviewing pre-screened WHO/AUA parameters before the patient visit._
- PM-13: **System Auditor role** — Sees engine version, algorithm hash, timestamp, zero-PII session ID, and full request/response contract. "Why this matters": _Verify algorithmic integrity, audit trail completeness, and zero-PII compliance for regulatory review._
- PM-14: Role selection is available from the header with a default of `patient`. Role preference is held in memory only and purged on session reset.
- PM-15: Every triggered rule displays its `guideline_source` citation regardless of role.

## Alert Policy {#alerts}

- PM-16: Tier 1 (BREAKING, urgency ≥90): Safety Circuit Breaker fires instantly with zero LLM latency. Full-screen modal with emergency facility contact and "Call 999" one-click action.
- PM-17: Tier 2 (NOTABLE, urgency ≥60): In-app banner at top of results with amber severity styling and "Book Andrology Consultation" one-click action linking to the recommended facility.
- PM-18: System notifications (Web Notification API) are requested only on explicit user gesture (e.g., "Enable alerts" button). If denied or unsupported, the in-app banner is always the fallback.
- PM-19: Every alert carries exactly one actionable follow-up: Emergency → "Call 999 Now", Andrology → "View Specialist Directory", Primary Care → "Find Nearest SEHA Center", Lifestyle → "View Daily Wellness Guide".
- PM-20: Alert visual severity mapping: Tier 1 = rose/red, Tier 2 = amber/orange, Tier 3 = sky/blue, Tier 4 = emerald/green.

## User Journey {#journey}

| Step | Description | Success Metric |
|---|---|---|
| PM-21: First Load | Landing page renders with hero, 5-stage pipeline explainer, and CTA | Time-to-interactive < 2s on 3G |
| PM-22: Privacy Consent | User reads Zero-PII guarantee; optional "Why Zero-PII?" modal | Modal open rate > 15% |
| PM-23: Step 1 — Safety Gate | Age/BMI/height/weight + red flag toggles | Completion rate > 90% |
| PM-24: Step 2 — Clinical History | Andrology risk factor toggles (steroids, varicocele, etc.) | Completion rate > 85% |
| PM-25: Step 3 — Lifestyle & Semen | Lifestyle factors + optional WHO semen panel | Optional panel engagement > 30% |
| PM-26: Triage Execution | Deterministic engine evaluates; tier + rules displayed | Engine response < 50ms |
| PM-27: AI Narrative | Gemini 2.5 Flash cultural rephraser generates compassionate report | Narrative load < 5s; fallback < 100ms |
| PM-28: Care Routing | Abu Dhabi facility cards shown with phone, map, badge | Click-through to facility > 20% |
| PM-29: Export | User prints or copies the zero-PII physician discussion sheet | Export action rate > 10% |
| PM-30: Session Purge | "Purge & Restart" wipes all in-memory state | Memory cleared; UI returns to Welcome |

---

## Phase-2 Hackathon Upgrades {#phase2}

- PM-31: **Judge Demo Archetype Bar & Benchmark Runner** — System Auditor mode must provide a one-click judge demo archetype selector with 5 pre-configured clinical presets (Acute Emergency, Varicocele/Steroid Subfertility, Metabolic Obesity, Heat/Sedentary Lifestyle, and Optimal Baseline) plus an automated benchmark runner executing the 100-profile UCI Fertility benchmark dataset with real-time pass/fail and concordance metrics.
- PM-32: **Interactive 90-Day Spermatogenesis Recovery Simulator** — Step 4 results interface must provide an interactive 90-day recovery projection simulator modeling human spermatogenesis biological cycles (72–90 days), enabling real-time counterfactual toggling of modifiable risk factors (smoking/shisha cessation, BMI normalization, heat mitigation, gonadotoxin discontinuation) to calculate projected semen parameter trajectory and updated tier status without re-running full triage.
- PM-33: **Ephemeral Multimodal Lab Scanner** — Step 3 must provide a client-side multimodal lab report scanner extracting exclusively numeric WHO 6th Edition semen parameters (volume, sperm concentration, total motility, progressive motility, normal morphology) directly into UI sliders with zero image persistence, zero server-side transmission, and immediate memory disposal post-extraction.
- PM-34: **HL7 FHIR R4 RiskAssessment & QR Code Interoperability** — Doctor Discussion Print Sheet must support one-click export conforming to the HL7 FHIR R4 `RiskAssessment` resource bundle specification and generate a client-side SVG QR code encoding the structured clinical evaluation payload for seamless interoperability with Abu Dhabi Health Information Exchange (Malaffi).
- PM-35: **Constrained Enum Follow-Up Question Chips** — Step 4 cultural narrative interface must display a curated set of enum-driven, closed-domain follow-up question chips below `SafeNarrative.tsx` with zero free-text input fields to eliminate PII leakage risk while providing instant, dignified bilingual (AR/EN) educational answers with medical evidence citations.

---

## Acceptance

- [x] Every category has an inclusion rule (PM-6 through PM-9)
- [x] Every threshold is a number (PM-10 urgency bands)
- [x] Every role has a lens sentence (PM-11 through PM-13)
- [x] Every alert path has a non-system-notification fallback (PM-16 through PM-19)
- [x] Every journey step has a metric (PM-21 through PM-30)
- [x] No requirement names a language, framework or vendor (clinical & interoperability standards only)
- [x] Phase-2 Hackathon upgrades define testable functional requirements (PM-31 through PM-35)

## Handoff
→ `ux-reference-designer`: categories (PM-6..9), roles (PM-11..13), alert channels (PM-16..20), journey (PM-21..30), demo bar & benchmark runner UI (PM-31), 90-day recovery simulator (PM-32), lab scanner dropzone (PM-33), FHIR QR code print sheet (PM-34), question chips (PM-35).
→ `fullstack-architect`: taxonomy (PM-6..10), urgency bands (PM-10), role enum (PM-14), thresholds (PM-6..9), source list (PM-3), benchmark runner dataset (PM-31), recovery projection math (PM-32), multimodal extraction pipeline (PM-33), FHIR R4 bundle & SVG QR generation (PM-34), constrained question enum graph (PM-35).

