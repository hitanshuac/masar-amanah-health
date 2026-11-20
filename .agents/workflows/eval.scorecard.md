# Workflow: Evaluation Scorecard & 8-Dimension Jury Flywheel (`eval.scorecard`)

> **Goal:** Run the full 4-Phase Google Cloud Agent Evaluation Flywheel and 8-Dimension GITEX Judge Panel Audit (incorporating Stephen Gear's Microsoft Innovation Hub BXT & Storytelling Rubric) after any feature or UI iteration, updating `docs/specs/EVALUATION_SCORECARD.json` and verifying 0 high-priority loss clusters.

---

## Workflow Triggers
- Invoked manually or via `/eval.scorecard` when checking platform readiness.
- Executed before any GITEX 2026 or Abu Dhabi DoH submission milestone.
- Triggered after modifying any component, CSS file, clinical rule, or SOP protocol.

---

## Phase 1: Pre-Flight Environment & Contract Lock
1. **Verify Git Working Tree:**
   Ensure no untracked binaries or large temporary files exist in the repository.
   ```powershell
   git status --short
   ```
2. **Verify TypeScript Compilation:**
   ```powershell
   npm run lint
   ```
   *Gate:* Must exit with 0 errors.

---

## Phase 2: Programmatic 8-Dimension Scorecard Audit
Execute the automated evaluation flywheel script to evaluate AST, CSS, types, docs, and SOP registries:
```powershell
npm run eval:scorecard
```

### Evaluated Dimensions & Acceptance Criteria:
1. **Dim 1: First-5-Second Emotional & Visual Hook** (Target: $\ge 9.5/10$)
   - Arabic/English sovereign identity, GITEX badge, staggered entrance classes, spring CTA.
2. **Dim 2: Motion Choreography & State Transitions** (Target: $\ge 9.5/10$)
   - Spring curves (`cubic-bezier(0.22, 1, 0.36, 1)`), step crossfades, Bayesian ghost bars, loop closed celebration, `@media (prefers-reduced-motion)` parity.
3. **Dim 3: Humanized Clinical Storytelling vs Raw Telemetry** (Target: $\ge 9.5/10$)
   - Chief complaint badges, inline SVG trajectory sparklines, Sahatna live telemetry, **Named Personas (Khaled, Tariq, Dr. Mariam)**, **"The Moment That Matters (Today's Pain vs. 1-Tap Magic)"** narrative contrast banner, and **"Dr. Mariam Stays in Charge of Every Clinical Decision"** headline.
4. **Dim 4: Causal Graph & Bayesian DAG Visual Interactivity** (Target: $\ge 9.5/10$)
   - 4-layer root-tree, animated SVG flow connectors, visual Information-Gain shimmer bar, prior ghost indicators, 1-click active loop closure.
5. **Dim 5: Tactile Delight in Mode 2 Simulator & Trace** (Target: $\ge 9.5/10$)
   - Smooth rAF urgency counter (75 $\to$ 25), 74–90d biological spermatogenesis arc, role="switch" toggles, 5-gate DECIDE-AI trace cards, pure SVG QR code.
6. **Dim 6: Cognitive Load, Visual Hierarchy & Microsoft BXT** (Target: $\ge 9.5/10$)
   - Solid surfaces (zero blur/glassmorphism), tier severity colors, responsive controller bar, print stylesheet, **Microsoft BXT Matrix (5/5 Desirability, Feasibility, Viability)**, **5 Golden Questions Table**, **6 Judge Questions (with `[⚡ Outcome Differs from Prediction]`)**, and **Explicit Assumptions & Limitations (`1:03:56`)**.
7. **Dim 7: S-O-A-P Clinical Workflow Completeness & SOP-01..06 Rigor** (Target: $\ge 9.5/10$)
   - 6 registered SOPs, 24 SOAP steps, 72 1-click XML prompt prefill variations, 72 bilingual interactive follow-up questions with factual chart logging.
8. **Dim 8: AI Co-Pilot Safety, Prompt Injection Defense & Zero-PII OPSEC** (Target: $\ge 9.5/10$)
   - 0 persistent storage calls, 0 raw HTML injections, 0 local path leaks, 18/18 & 12/12 frozen contract, gzip budget compliance (JS < 150 kB, CSS < 20 kB).

---

## Phase 3: Clinical Test Harness & Hack2Skill Compliance
Run the complete clinical invariant and compliance test suites:
```powershell
npm run test:clinical
npm run test:compliance
```
*Gate:* 16/16 Clinical tests passing ($ICC = 1.000$) and 6/6 Compliance scans passing.

---

## Phase 4: Failure Cluster Loss Analysis & Remediation
Inspect console output from Phase 2:
1. If any **P0 (Security/Contract)** or **P1 (Clinical/Bayesian)** clusters appear:
   - **HALT SUBMISSION.** Fix contract drift or PII leaks immediately.
2. If any **P2 (Motion)**, **P3 (Storytelling)**, or **P4 (Polish)** clusters appear:
   - File remediation tickets in the sprint backlog according to priority.

---

## Phase 5: Production Build & Asset Verification
Run Vite production build:
```powershell
npm run build
```
Verify generated gzip bundle sizes:
- Main bundle JS gzip `< 150 kB`
- Main CSS gzip `< 20 kB`

---

## Phase 6: E2E Guided Loop Video Recording (4-Beat Story Arc)
When preparing visual submission assets:
```powershell
npm run demo:guided
```
Assert that:
- Chrome launches and completes all 7 stages automatically.
- Broadcast HUD displays the 4-Beat Story Arc framing Khaled (PT-001) and Tariq (PT-004) under Dr. Mariam's clinical supervision.
- Video and interactive presentation reel export to `~/Desktop/masar-amanah-demo-export/`.
- `verification-scorecard.json` reports 7/7 passed assertions.
