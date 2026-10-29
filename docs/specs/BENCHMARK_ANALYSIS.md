# Clinical Triage & Healthcare UX Benchmark Analysis — Masar Amanah Health (مسار أمانة)

> GITEX 2026 · Future Health Challenge · Male Reproductive Health Track
> Platform: Masar Amanah Health · Algorithm: v1.4-AUA2021-WHO6-UAE
> Target Audience: Clinical Evaluation Committees, Innovation Judges, Regulatory Decision-Makers

---

## Executive Summary

Digital clinical triage systems are evaluated on four non-negotiable vectors:
1. **Clinical Safety & Determinism** (Zero hallucination on triage level, red-flag interception, and care escalation).
2. **Cognitive Ergonomics & Design Standards** (Adherence to clinically tested healthcare design systems such as NHS Digital, IBM Carbon Health, and USWDS).
3. **Data Stewardship & Trust** (Elimination of privacy friction in sensitive, stigmatized medical conditions).
4. **Actionable Care Continuity** (Direct routing to accredited in-person clinical facilities).

This document benchmarks **Masar Amanah Health (مسار أمانة)** against industry-standard commercial tools, national public health services, and open-source clinical algorithms, detailing architectural decisions and clinical UX justifications.

---

## 1. Comparative Architecture Matrix

| Dimension | Infermedica (Symptomate) | NHS 111 Online | Ada / Buoy Health | AIPOCH Triage Engine | **Masar Amanah Health (مسار أمانة)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Architecture** | Probabilistic Bayesian network + proprietary knowledge graph | Deterministic decision-tree algorithm (NHS Pathways) | Probabilistic Bayesian inference + conversational AI | Deterministic Python rules engine | **Deterministic-First Hybrid (Pure TS rules engine + Gemini 2.5 Flash cultural rephraser)** |
| **Privacy Architecture** | Session tracking, IP logging, user profiling | Postcode, age, GP registration, phone/email capture | Mandatory registered accounts, long-term health history | Local/offline script (variable PII) | **Zero-PII by Design (0 cookies, 0 databases, 0 identifiers, ephemeral in-memory sessions)** |
| **Input Modality** | Free-text search followed by disambiguation | Strict "One question per page" radio cards | Interactive visual pickers + free-text search | JSON / CLI input | **100% Constrained Input (Segmented radio cards, biometric sliders, WHO 6th percentile gauges)** |
| **Emergency Red-Flag Interception** | Intermittent safety checks during questionnaire | **Zero-latency hard-stop** (immediate emergency break-out) | Flags red symptoms but continues to final screen | Terminal classification flag | **Stage 2 Safety Circuit Breaker (Instant modal takeover at 0ms LLM latency for acute symptoms)** |
| **Decision Explainability (CDS)** | Black-box probabilistic risk scores; limited rationale | NHS clinical decision pathway codes | "X% of people with these symptoms have condition Y" | Audit-ready rule trace | **3-Tier Role Switcher with verifiable guideline citations (WHO 6th Ed, AUA/ASRM, EAU) + JSON audit export** |
| **Cultural & Linguistic Ergonomics** | Multi-language translation (literal medical translation) | UK-English only | Multi-language translation | English only | **Bilingual Native RTL/LTR with culturally dignified Modern Standard Arabic (*الفصحى*) tailored to GCC** |
| **Care Routing Integration** | Generic clinic locator or API partner webhook | Direct NHS 111 dispatch, GP booking, or Urgent Treatment Centre | Telehealth affiliate referrals | None (raw triage output) | **Department of Health (DoH) Abu Dhabi Network Routing (SSMC, CCAD, HealthPlus Fertility, SEHA AHS)** |

---

## 2. Healthcare Design Systems Conformance Audit

Medical triage interfaces operate under high cognitive load, patient anxiety, and strict clinical liability. Generic web UI frameworks (e.g., standard Bootstrap or unstyled components) fail to account for medical risk communication. Masar Amanah is built against the world's three leading healthcare design systems:

### A. The NHS Digital Design System (The Benchmark for Clinical UX)
Used across the UK National Health Service, this is widely considered the world's most rigorously tested healthcare design system.
* **The "One Thing Per Page" / Wizard Chunking:**
  * *Clinical Rationale:* Patients experiencing intimate health concerns experience elevated cortisol and cognitive distraction. Presenting sprawling multi-field forms increases abandonment and missed symptom reporting.
  * *Masar Amanah Implementation:* Implemented via `StepIndicator.tsx` into 4 logical, non-threatening stages: Safety Gate $\to$ Clinical History $\to$ Lifestyle & Semen Panel $\to$ Triage & Care Plan.
* **Standardized Care Cards:**
  * *Clinical Rationale:* Triage outcomes must convey clear, unambiguous urgency levels using universally recognizable visual tokens.
  * *Masar Amanah Implementation:* Adheres in `Step4Results.tsx` with semantic HSL tokens:
    * 🔴 **Tier 1 (Rose-600):** Immediate Emergency Care / Surgical Fast-Track (Testicular Torsion / Mass)
    * 🟡 **Tier 2 (Amber-600):** Specialized Andrology & Reproductive Specialist Referral
    * 🔵 **Tier 3 (Sky-600):** Primary Healthcare & Metabolic Optimization
    * 🟢 **Tier 4 (Emerald-800):** Proactive Lifestyle & Self-Guided Thermoregulation
* **Warning Callout Boxes:**
  * *Clinical Rationale:* High-contrast visual containers with bold vertical accent lines reserved strictly for medical danger signals.
  * *Masar Amanah Implementation:* `Step1Safety.tsx` utilizes amber/rose warning callouts with pulse indicators when acute pain or painless mass indicators are selected.

### B. IBM Carbon for Healthcare (CDS & Explainability)
IBM's clinical extension of the Carbon Design System focuses on Clinical Decision Support (CDS) and machine-learning explainability for clinicians:
* **Audit Traces & Guideline Attribution:**
  * *Clinical Rationale:* Clinicians and auditors reject "black-box" outputs. Every recommendation must display the triggering rule and published medical literature source.
  * *Masar Amanah Implementation:* Features a dedicated **Deterministic Clinical Audit Trail** (`Step4Results.tsx:320-375`) displaying:
    * Machine-readable rule IDs (e.g., `RULE_WHO6_OLIGOZOOSPERMIA`, `RULE_HIST_ANABOLIC_STEROIDS_TRT`)
    * Quantitative threshold comparison: Measured Value vs. Clinical Limit
    * Primary guideline citations (*WHO 6th Edition, Table 2.1; AUA/ASRM Male Infertility Guidelines; EAU Guidelines*).
* **Tonal Hierarchy & Reduced Eye Strain:**
  * *Clinical Rationale:* Soft, solid surfaces without distracting alpha layering or motion artifacts.
  * *Masar Amanah Implementation:* Complies with `UX-1`, `UX-12`, and `UX-13` by utilizing solid surfaces (`bg-slate-50`, `bg-emerald-950`) rather than illegible blurred overlays.

### C. US Web Design System (USWDS) — Health Guidelines
Mandated across US federal health platforms (CDC, HHS):
* **Clear Distinction Between Screening & Diagnosis:**
  * *Clinical Rationale:* Clear visual boundaries between educational triage and legal diagnostic liability.
  * *Masar Amanah Implementation:* Persistent disclaimers in `Header.tsx`, `Step4Results.tsx`, and Section 5 of the generated narrative emphasizing that the tool is an educational screening algorithm.
* **Plain Language & Reading Accessibility:**
  * *Clinical Rationale:* Patient-facing communication must target grade-6 reading comprehension.
  * *Masar Amanah Implementation:* Solved through the **Role Switcher** (`Step4Results.tsx`), rendering compassionate, destigmatized prose for patients while reserving technical biochemical depth for `Clinician Companion` and `System Auditor` modes.

---

## 3. UI/UX Input Best Practices: Why Masar Amanah Eliminates NLP Chatbots

Traditional symptom checkers that rely on free-text natural language processing (NLP) introduce three critical clinical failure points:
1. **Adversarial Prompt Injection & Drift:** Free-text input allows prompt injection, altering AI behavior or bypassing safety filters.
2. **Omission of Critical Negatives:** Patients rarely volunteer pertinent negative symptoms (e.g., "no pain radiating to the groin"), causing misclassification.
3. **Slang & Colloquial Ambiguity:** In regional dialects (e.g., Khaleeji Arabic vs. Levant Arabic), colloquial terms for reproductive discomfort vary widely, leading to NLP misinterpretation.

```
[ Traditional NLP Checkers ]                 [ Masar Amanah Health Engine ]
Free-text typing ("hurts down there")         Constrained Sliders & Segmented Cards
        │                                                    │
        ▼                                                    ▼
❌ Typo / slang ambiguity                     ✅ Exact quantitative measurement
❌ Missed negative symptoms                   ✅ Forced clinical risk verification
❌ Prompt injection vulnerabilities           ✅ Zero prompt injection attack surface
❌ Latency: 2–5 seconds LLM round-trip        ✅ Latency: 0ms deterministic calculation
```

### Specific Input Innovations in Masar Amanah:
- **Real-Time WHO 6th Edition Reference Gauges:** Numeric sliders in `Step3Lifestyle.tsx` visually map inputs against published 5th percentile lower reference limits (Volume: $1.4\text{ mL}$, Concentration: $15.0 \times 10^6/\text{mL}$, Motility: $42.0\%$, Morphology: $4.0\%$).
- **Zero-Latency Circuit Breakers:** Red-flag symptoms trigger an immediate hard-stop modal (`SafetyCircuitBreakerModal.tsx`) with zero network round-trip, directing users to 999 or emergency surgical care.
- **Dynamic Biometric Derivation:** Height and weight dynamically compute BMI in real-time, triggering metabolic aromatase warnings for $\text{BMI} \ge 30.0$.

---

## 4. Output Best Practices & Regional Abu Dhabi Care Continuity

An assessment without a clear next step induces anxiety and fails the clinical care loop. Masar Amanah integrates end-to-end routing within the **Department of Health (DoH) Abu Dhabi network**:

```
+-------------------------------------------------------------------------+
| [CARE CARD BANNER]                                                      |
| Level: TIER 2 - SPECIALIST ANDROLOGY EVALUATION                         |
| Action Code: REFERRAL_MALE_FERTILITY_SPECIALIST                        |
+-------------------------------------------------------------------------+
| [EMPATHETIC CULTURAL NARRATIVE (GEMINI 2.5 FLASH / DETERMINISTIC)]      |
| 1. Overview (نظرة عامة) - Sacred stewardship & proactive vitality      |
| 2. Clinical Observations - WHO 6th Edition comparative percentiles      |
| 3. Recommended Care Pathway & Doctor Discussion Points                  |
| 4. Discreet Daily Wellness Steps - Scrotal thermoregulation habits      |
| 5. Medical Disclaimer                                                   |
+-------------------------------------------------------------------------+
| [LOCAL ABU DHABI HEALTHCARE DIRECTORY]                                  |
| 🏥 Cleveland Clinic Abu Dhabi - Andrology Clinic [Call / Direction]     |
| 🏥 HealthPlus Fertility Center - Al Bateen [Call / Direction]           |
+-------------------------------------------------------------------------+
| [EXPLAINABLE CLINICAL AUDIT DRAWER]                                     |
| ▸ Trigger: RULE_WHO6_OLIGOZOOSPERMIA (<15.0 M/mL)                       |
| ▸ Source: WHO Laboratory Manual for Semen Examination (6th Ed, 2021)    |
| [Download JSON Audit] • [Print Doctor Sheet] • [Wipe Memory Session]    |
+-------------------------------------------------------------------------+
```

---

## 5. Summary of Competitive Differentiators for Selection Committees

1. **Zero-PII Architecture as a Clinical Enabler:**
   - Eliminates the 60%+ dropout rate seen in conventional digital health platforms that mandate phone numbers or Emirates IDs.
   - 100% ephemeral in-memory state; zero databases; zero cookies; zero tracking scripts.
2. **Cultural Dignity (*Amanah*) vs. Pathology Alarmism:**
   - Replaces stigmatizing Western terminology (*"Deficient"*, *"Impaired"*, *"Pathological"*) with cultural empowerment, health stewardship (*Amanah*), and proactive family wellness in Modern Standard Arabic (*الفصحى*).
3. **Deterministic Single Source of Truth:**
   - Clinical tiers, referral codes, and guideline citations are computed by pure TypeScript code, completely immune to LLM hallucination, sycophancy, or drift.
   - The generative AI layer (Gemini 2.5 Flash) rephrases empathetic narrative only; if the API key is missing or network fails, the deterministic cultural engine seamlessly provides the identical structured report with zero downtime.
4. **Physician Discussion Sheet:**
   - High-contrast print view (`window.print`) strips web controls and navigation, giving patients an anonymous, professional summary to hand directly to their urologist in Abu Dhabi.
