# SOP-01: First-Time Walk-In Registration & Pre-Analytical Quality Control

**Protocol ID:** `SOP-01`  
**Target Archetype:** `MALAFFI-PT-006` (Optimal Baseline Reference)  
**Clinical Category:** Triage & Quality Assurance  
**Encounter Phase:** Day 0 Intake  
**Framework:** Universal 4-Step S-O-A-P Clinical Encounter  

---

## 1. Clinical Purpose & Rationale
To enforce strict pre-analytical specimen collection standards according to the **WHO Laboratory Manual for the Examination and Processing of Human Semen (6th Edition, 2021)**. In male reproductive health screening, pre-analytical variability accounts for over 60% of diagnostic discrepancies. Without verifying ejaculatory abstinence (2–7 days), specimen collection completeness, and rapid thermal transport (<60 min at 20–37°C), false diagnoses of oligozoospermia or asthenozoospermia frequently occur.

---

## 2. 4-Step S-O-A-P Workflow

### S: Subjective Intake & OLDCARTS Screen
- **Chief Complaint:** First-time routine fertility screening or preconception counseling.
- **Abstinence Audit:** Interrogate exact duration of ejaculatory abstinence. Must strictly fall between 48 hours (2 days) and 168 hours (7 days).
- **Red-Flag Screen:** Verify absence of acute scrotal pain (torsion rule-out) and firm palpable testicular masses.
- **Medication Audit:** Confirm zero 5-alpha reductase inhibitors (Finasteride/Dutasteride) or exogenous testosterone/anabolic steroids.
- **Gate Check:** `[✓ Verify Intake & Pre-Analytical QC (2–7d Abstinence)]`.

### O: Objective QC & Semen Parameters
- **Physical QC:** Liquefaction within 60 minutes at 37°C; normal seminal viscosity; normal translucent-grey appearance; pH 7.2–8.0.
- **Microscopic Examination (WHO 6th Ed Lower Reference Limits):**
  - Volume: $\ge 1.4\text{ mL}$ (Patient: $3.2\text{ mL}$)
  - Concentration: $\ge 16.0\times 10^6\text{ /mL}$ (Patient: $56.5\times 10^6\text{ /mL}$)
  - Progressive Motility: $\ge 30\%$ (Patient: $62\%$)
  - Normal Morphology: $\ge 4.0\%$ (Patient: $6.0\%$)
  - Total Motile Sperm Count (TMSC): $> 20\times 10^6$ (Patient: $112.1\times 10^6$)
- **Endocrine Panel:** Total Testosterone, LH, FSH, Estradiol, Prolactin within adult male reference limits.

### A: Assessment & Differential
- **Primary Diagnosis:** Normozoospermia (ICD-10 `Z31.41` — Procreative management / normal male reproductive parameters).
- **Certainty Level:** $94.8\%$ diagnostic certainty with $0\text{ Open Loops}$.
- **Differential Rule-Outs:**
  - Ruled out Primary Testicular Sertoli Failure (`N46.01`).
  - Ruled out Ductal Obstruction (`N46.02`).
  - Ruled out Hypogonadotropic Hypogonadism (`E23.0`).

### P: Plan & Longitudinal Surveillance
- **Tier Classification:** Tier 4 — Self-Directed Proactive Lifestyle Optimization.
- **Preventative Counsel:** Scrotal thermoregulation (avoid laptops on lap, saunas, hot baths); antioxidant-rich nutrition; smoking cessation.
- **Digital Health Integration:** Synchronize Sahatna wearable device for resting heart rate (target 60–72 bpm) and sleep tracking.
- **Malaffi Handoff:** Issue validated HL7 FHIR R4 RiskAssessment bundle with zero personally identifiable data.
- **Follow-up Cadence:** Routine annual preventative health check (12 months).

---

## 3. Exception & Deviation Handling
- **Deviation (Abstinence <48h):** If abstinence is under 2 days, volume and concentration may be artificially depressed. The AI Co-Pilot recommends a 14-day specimen recollection hold rather than documenting subfertility.
- **Deviation (Abstinence >7d):** Elevated oxidative stress and reduced sperm motility. Advise scheduled ejaculation and repeat analysis in 7–10 days.
- **Deviation (Initial fraction lost):** If the initial ejaculate fraction was spilled, discard sample and reschedule after 48h abstinence.

