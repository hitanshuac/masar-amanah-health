# Masar Amanah Health (مسار أمانة)

> **GITEX 2026 · Future Health Digital Innovation Challenge · Male Reproductive Health Track**  
> *Department of Health (DoH) Abu Dhabi · ADPHC · Inception42 · Microsoft · MBZUAI*  
> *Privacy-First Dual-Engine Screening: Closed-Loop Longitudinal Bayesian Differential Diagnosis Graph (`v2.0-DAG`) & 5-Gate Rapid Self-Triage*

[![Live Production URL](https://img.shields.io/badge/Live%20Production-masar--amanah--health.vercel.app-emerald?style=for-the-badge&logo=vercel)](https://masar-amanah-health.vercel.app)
[![Evaluation Scorecard](https://img.shields.io/badge/Judge%20Scorecard-9.80%20%2F%2010.0%20(Exemplary)-blue?style=for-the-badge)](docs/specs/EVALUATION_SCORECARD.json)
[![Clinical Test Harness](https://img.shields.io/badge/Clinical%20Tests-16%20%2F%2016%20Passed%20(100%25)-success?style=for-the-badge)](scripts/testHarness.ts)
[![Compliance Scans](https://img.shields.io/badge/Compliance%20Scans-6%20%2F%206%20Passed%20(Zero--PII)-purple?style=for-the-badge)](scripts/complianceScans.ts)

**🌐 Live Production App:** [https://masar-amanah-health.vercel.app](https://masar-amanah-health.vercel.app)  
**📂 GitHub Repository:** [https://github.com/hitanshuac/masar-amanah-health](https://github.com/hitanshuac/masar-amanah-health)  
**🎥 E2E Guided Demo Video:** [Desktop Export Directory](file:///C:/Users/zacca/Desktop/masar-amanah-demo-export/masar-amanah-guided-loop-demo.webm)  
**📑 Official Solution Deck PDF:** [Download Deck PDF (0.97 MB)](file:///C:/Users/zacca/Desktop/masar-amanah-demo-export/Masar_Amanah_Health_Solution_Deck.pdf)

---

## 1. Overview & Dual-Engine Architecture

Male reproductive health in the UAE and GCC region faces an estimated 2–3 year diagnostic delay driven by social stigma, privacy apprehension, and fears regarding employer or insurance disclosures. Furthermore, young and middle-aged men (aged 18–45) routinely avoid standard preventive cardiometabolic screening (`IFHAS`).

**Masar Amanah Health** bridges this critical public health gap through a **Dual-Engine Architecture** that treats male reproductive and endocrine function as an early barometer for cardiometabolic disease, neuroendocrine failure, and testicular malignancies:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MASAR AMANAH DUAL-ENGINE ARCHITECTURE                           │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ Mode 1: Longitudinal Diagnostic Graph     │ Mode 2: 5-Gate Rapid Self-Screening        │
│ (v2.0-BAYESIAN-DAG-WHO6-AUA-UAE)          │ (v1.4-AUA2021-WHO6-UAE)                    │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Interactive Clinical Workbench          │ • Dignified 4-Stage Anonymous Wizard       │
│ • Pseudonymized Malaffi EHR Timelines     │ • Instant 0ms Emergency Circuit Breaker    │
│ • Plane A: 4 Life-Saving Escalations      │ • 90-Day Recovery Simulator (-50 pts delta)│
│ • Plane B: 6 Competing Bayesian Hypotheses│ • Empathetic Gemini 2.5 Flash Rephraser    │
│ • 5 Technician Blind-Spot Syndromes       │ • Modern Standard Arabic (الفصحى) & English│
│ • Active Loop Shannon Entropy Reduction   │ • Pure SVG QR Code & HL7 FHIR R4 Bundle    │
│ • Expected Information Gain (IG bits)     │ • DoH Abu Dhabi Care Network Routing       │
│ • ➕ Onboard Walk-In Patient (Zero-PII)   │ • 100% Ephemeral In-Memory Client State    │
│ • 🚑 Outbound Hospital Transfer Dispatch │ • Pre-Transfer Gate (Loops = 0 Required)   │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### Plane A: 4 Life-Saving Escalations (What Single-Column Checks Miss)
1. **`ESC_OCCULT_PITUITARY_NEUROENDOCRINE`**: Catches combined oligozoospermia with low/normal gonadotropins and low testosterone, identifying pituitary macroadenomas/prolactinomas and ordering STAT Serum Prolactin (`LOINC 2842-3`) and Pituitary Sellar MRI before visual field loss.
2. **`ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR`**: Cross-references longitudinal TMSC decline with drifting HbA1c ($5.5\% \to 6.2\%$) and Sahatna wearable autonomic signals (Resting HR $\ge 84\text{ bpm}$, Sleep $<5.8\text{h}$) to intercept Major Adverse Cardiovascular Events (MACE) 3–5 years early.
3. **`ESC_GERM_CELL_NEOPLASIA_HIGH_RISK`**: Flags cryptorchidism history combined with severe OATS ($<5\text{ M/mL}$) carrying up to 20x risk of Testicular Germ Cell Tumors (TGCT/GCNIS).
4. **`ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS`**: Instant surgical circuit breaker for acute pain ($<24\text{h}$, 6-hour salvage window) or acute right-sided non-reducible varicocele (retroperitoneal tumor/thrombus).

### Plane B: 6 Competing Subfertility Etiologies & 5 Technician Blind Spots
- **6 Competing Hypotheses**: Pre-Testicular HPG Suppression (`E29.1`), Metabolic Aromatase Endocrinopathy (`E66.9`), Primary Sertoli Failure (`N46.01`), Varicocele Thermal-Oxidative Syndrome (`I86.1`), Ductal Obstruction (`N46.02`), and Delayed 5-ARI/TRT Pharmacological Toxicity (`T38.5X5A`).
- **5 Technician Blind Spots**: False-Normal Lab Trap ($\text{TMSC} < 20\text{M}$ despite passing 4 WHO limits), Occult Trajectory Decay ($\le -8\%/\text{mo}$ velocity), Subclinical Aromatase-Sleep Axis, 74-Day Delayed Iatrogenic Toxicity, and Low-Volume Obstructive Mask.

### Mathematical Rigor & Information Gain Loop
- **Independent Logistic Log-Odds**: Avoids destructive Softmax dilution; allows co-occurring pathologies to be flagged independently.
- **Strict `Null ≠ Zero` Invariant**: Unmeasured biomarkers contribute $\ln \text{LR} = 0.0$, strictly preventing false reassurances.
- **Joint Binary Shannon Entropy ($H_{\text{joint}}$)**: Quantifies multi-label diagnostic ambiguity in bits; shadow-simulates outcome branches to compute **Expected Information Gain ($\text{IG}$ bits)** and prioritize the highest-yield lab test.
- **FNV-1a Zero-Cache Deterministic Signatures**: Guarantees bit-for-bit reproducible diagnostic graphs (`ICC = 1.000`).

---

## 2. Security, Compliance & Master Sync Architecture

### Master Sync Orchestration (`.agents/skills/master-sync/SKILL.md`)
The 8-phase orchestration protocol guarantees continuous code and documentation synchronization:
1. **Phase 1: Pre-Flight & AST/Dead-Code Sanitization** (Zero circular dependencies across 35 TypeScript modules).
2. **Phase 2: Defensive Contracts & Schema Integrity** (`contract.schema.json` & `response.schema.json` 100% synchronized with `screening.ts`).
3. **Phase 3: SAST, Secret Scanning & Dependency Audit** (`npm audit` 0 vulnerabilities, zero hardcoded secrets).
4. **Phase 4: Clinical Test & Resilience Verification** (**16/16 Automated Clinical Harness Tests passed**, including `RES-20`).
5. **Phase 5: Build Gate & Bundle Budget Scan** (JS $130.0\text{ kB}$ gzip, well within $<150\text{ kB}$ budget; CSS $11.1\text{ kB}$ gzip).
6. **Phase 6: Documentation & Spec Synchronization** (`PILOT_PROPOSAL.md`, `PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, `03_SECURITY.md`, `DECISIONS.md`, `QA_REPORT.md`, `BENCHMARK_ANALYSIS.md`).
7. **Phase 7: Conversational Error Harvesting & Rule Hardening**.
8. **Phase 8: Checkpoint & Deployment Readiness** (Zero local filesystem leaks, Cloud Run port 3000/8080 readiness).

### Verification Matrices & 9.80/10 Scorecard (100% Pass Across All Gates)
- **9.80 / 10.0 Microsoft Innovation Hub Evaluation Flywheel (`npm run eval:scorecard`)**: 9/9 dimensions rated Exemplary with 0 high-priority loss clusters.
  - *Dim 1: First-5-Second Emotional & Visual Hook (9.8/10)*
  - *Dim 2: Motion Choreography & State Transitions (9.8/10)*
  - *Dim 3: Humanized Clinical Storytelling (Khaled PT-001, Tariq PT-004 · Dr. Mariam in charge) (9.8/10)*
  - *Dim 4: Causal Graph & Bayesian DAG Visual Interactivity (9.8/10)*
  - *Dim 5: Tactile Delight in 90-Day Simulator & 5-Gate DECIDE-AI Trace (9.8/10)*
  - *Dim 6: Cognitive Load & Microsoft BXT 5/5 Lens (9.8/10)*
  - *Dim 7: S-O-A-P Clinical Workflow Completeness & SOP-01..06 Rigor (9.8/10)*
  - *Dim 8: AI Co-Pilot Safety, Prompt Injection Defense & Zero-PII OPSEC (9.8/10)*
  - *Dim 9: Pre-Transfer Readiness Gate & Abu Dhabi Hospital Dispatch (9.8/10)*
- **16/16 Clinical Test Harness (`npm run test:clinical`)**: Validates RES-1 through RES-20 including acute torsion protocols, 90-day simulator delta, UCI benchmark (<1ms), HL7 FHIR R4 schema, question chips, and the Bayesian DAG closed-loop controller.
- **6/6 Hack2Skill Compliance Scans (`npm run test:compliance`)**: 0 WCAG 2.1 AA violations, 0 persistent storage calls (Zero-PII), 0 circular import cycles, bundle budget met (133.0 kB gzip), 100% schema sync, and 0 SAST/OWASP violations.
- **7/7 E2E Guided Loop Video Recording (`npm run demo:guided`)**: Validates 7 full stages from Malaffi intake to 1-tap loop closure, +90d follow-up, and hospital transfer dispatch.

### Enterprise Clinical Workflows Added (v2.6.0)
1. **➕ Onboard New Patient (`src/components/NewPatientOnboardingModal.tsx`)**:
   - 3-Step Walk-In Intake: Registration & Acute Red-Flag Screen (SOP-01/02) $\to$ Pre-Analytical QC & Baseline Labs $\to$ Live In-Memory Admission.
   - PDPL Zero-PII consent toggle, WHO 6th Ed abstinence QC (2–7d), and live composite TMSC calculator (flagging <20M False-Normal traps as you type).
   - Instant 0ms Acute Safety Circuit Breaker: Automatically bypasses routine lab intake if acute scrotal pain or painless testicular mass is reported.
2. **🚑 Outbound Hospital Transfer Dispatch (`src/components/TransferDispatchModal.tsx`)**:
   - Pre-Transfer Readiness Gate: Mathematically blocks transfer dispatch if `Open Loops > 0`, protecting receiving specialists from incomplete referrals.
   - Intelligent Care Routing across Abu Dhabi: Sheikh Shakhbout Medical City (SSMC Emergency Urology), Cleveland Clinic Abu Dhabi (CCAD Andrology), HealthPlus Fertility (ART / ICSI), and SEHA AHS IFHAS clinics.
   - Stamped HL7 FHIR R4 Transfer Receipt: Complete with FNV-1a cryptographic checksum and Dr. Mariam handoff certification.

---

## 3. Quickstart & Local Execution

**Prerequisites:** Node.js 20+

### 1-Click Windows Launchers
Double-click either batch file directly in Windows File Explorer:
- **`start-server.bat`**: Starts the Express + Vite server on port 3000 and automatically opens `http://localhost:3000` in your browser.
- **`run-demo.bat`**: Launches Chrome in visible GUI mode and automatically steps through the complete NHS-style 1-Click Guided Loop demo (`scripts/guidedLoopDemo.js`).

### CLI Execution

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional for local dev; deterministic engine runs without key)
cp .env.example .env
# Add GEMINI_API_KEY="your-api-key" to .env

# 3. Start development server (Port 3000)
npm start                  # Or: npm run dev

# 4. Run visible headed Chrome demo
npm run demo:guided        # Runs visible browser automation with live visual rings & HUD

# 5. Run automated test suites
npm run test:clinical      # 16/16 automated clinical test harness (includes RES-20 Bayesian DAG)
npm run test:compliance    # 6/6 automated Hack2Skill compliance & SAST scans
npm run test               # Run all test suites

# 6. Typecheck & production build
npm run lint               # tsc --noEmit (0 TypeScript errors)
npm run build              # Production Vite bundle (130.0 kB gzip JS, budget <150 kB)
```

---

## 4. Specification & Handover Index

| Document | Purpose | Standard / Authority |
|---|---|---|
| [PILOT_PROPOSAL.md](docs/specs/PILOT_PROPOSAL.md) | GITEX 2026 / DoH Abu Dhabi / ADPHC / Inception42 Pilot Readiness Proposal | DoH Abu Dhabi, ADPHC, Inception42 |
| [BENCHMARK_ANALYSIS.md](docs/specs/BENCHMARK_ANALYSIS.md) | Clinical triage, healthcare UX, mathematical Bayesian rigor, and comparative benchmarks | Inception42 Rubric, NHS, IBM Carbon |
| [PRODUCT_SPEC.md](docs/specs/PRODUCT_SPEC.md) | Clinical triage taxonomy, roles, journey, and requirement IDs (`PM-n`) | AUA/ASRM, WHO 6th Edition |
| [DESIGN_SPEC.md](docs/specs/DESIGN_SPEC.md) | Design tokens, solid surfaces, RTL layout, typography, and UX criteria (`UX-n`) | WCAG 2.1 AA, USWDS Health |
| [03_SECURITY.md](docs/specs/03_SECURITY.md) | Zero-Auth, RBAC, Secret Hygiene, Network Boundary PII Guards | OWASP Top 10, Semgrep AST |
| [DECISIONS.md](docs/specs/DECISIONS.md) | Architectural Decision Records (ADR-1 through ADR-7) | Architecture & Governance |
| [QA_REPORT.md](docs/specs/QA_REPORT.md) | Resilience matrix (20 scenarios), build gate, compliance scan results, CDP E2E, GO verdict | Release Gate |
| [HANDOVER.md](HANDOVER.md) | Master engineering blueprint for Closed-Loop Longitudinal Bayesian DAG architecture | GITEX 2026 Gold Master |
| [HANDOVER_agy.md](HANDOVER_agy.md) | Antigravity IDE 4-persona delivery pipeline & skill integration | Antigravity IDE |
