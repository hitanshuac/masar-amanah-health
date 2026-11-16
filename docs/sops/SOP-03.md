# SOP-03: False-Normal WHO Line Override & IFHAS MACE Escalation

**Protocol ID:** `SOP-03`  
**Target Archetype:** `MALAFFI-PT-001` (Subfertile "Normal" Trap)  
**Clinical Category:** Andrology & Cardiometabolic Precursor  
**Encounter Phase:** Day 0 Intake / Multi-Visit Longitudinal  
**Framework:** Universal 4-Step S-O-A-P Clinical Encounter  

---

## 1. Clinical Purpose & Rationale
To identify and override the widespread "False-Normal" trap in male subfertility screening. When semen analysis results are reviewed line-by-line against isolated 5th-percentile cutoffs, a patient whose volume, concentration, motility, and morphology individually hover just above minimum thresholds can be mistakenly told their sample is "completely normal." However, the composite **Total Motile Sperm Count (TMSC)** represents the true functional fertile yield:

$$\text{TMSC} = \text{Volume (mL)} \times \text{Concentration (M/mL)} \times \left(\frac{\text{Total Motility (\%)}}{100}\right)$$

For `MALAFFI-PT-001`: $1.5\text{ mL} \times 16.0\text{ M/mL} \times 0.43 = 10.32\text{ Million}$, which falls far below the $20\text{ Million}$ subfertility threshold. Furthermore, male subfertility is an established clinical canary for endothelial dysfunction, insulin resistance, and premature cardiovascular disease (MACE).

---

## 2. 4-Step S-O-A-P Workflow

### S: Subjective Intake & Reconciliation
- **Chief Complaint:** Unassisted conception delay of 14 months; previous provider informed patient his semen test was "normal."
- **Medication Audit:** Active use of Finasteride 1mg oral daily for androgenetic alopecia over the past 6 months.
- **Cardiometabolic History:** Sedentary office occupation, subtle fatigue, positive paternal history of early myocardial infarction.
- **Gate Check:** `[✓ Verify 14-Month History & Medication Reconcile]`.

### O: Objective QC & The WHO Paradox
- **Side-by-Side Parameter Evaluation:**
  - Volume: $1.5\text{ mL}$ (Threshold: $\ge 1.4\text{ mL}$) $\rightarrow$ **PASS**
  - Concentration: $16.0\text{ M/mL}$ (Threshold: $\ge 16.0\text{ M/mL}$) $\rightarrow$ **PASS**
  - Total Motility: $43\%$ (Threshold: $\ge 42\%$) $\rightarrow$ **PASS**
  - Normal Morphology: $4\%$ (Threshold: $\ge 4.0\%$) $\rightarrow$ **PASS**
  - **Composite TMSC Calculation:** $10.32\text{ Million}$ (Threshold: $\ge 20.0\text{ Million}$) $\rightarrow$ **FAIL (SUBFERTILE TRAP)**
- **Plane A Longitudinal Vitals Drift (Malaffi EHR):**
  - Total Testosterone: declined from $520\text{ ng/dL}$ to $460\text{ ng/dL}$.
  - Glycated Hemoglobin (HbA1c): shifted upward from $5.2\%$ to $5.3\%$.
  - Sahatna Wearable Resting Heart Rate: $72\text{ bpm}$.

### A: Assessment & MACE Correlation
- **Syndrome Triggered:** `SYN_FALSE_NORMAL_SUBFERTILITY` (TMSC $10.32\text{M} < 20\text{M}$).
- **Escalation Triggered:** `ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR` (ICD-10 `I25.10` / `E88.81`).
- **Pharmacological Factor:** 5-Alpha Reductase Inhibitor-induced seminal parameter attenuation.
- **Triage Level:** **TIER_2_ANDROLOGY_SPECIALIST** + Parallel Primary Care Cardiometabolic Pathway.

### P: Plan & Dual Referral Handoff
- **Specialist Referral:** Male Infertility / Andrology Specialist consultation at HealthPlus Fertility Center Abu Dhabi or Cleveland Clinic Abu Dhabi.
- **Medication Plan:** Discuss 3–6 month Finasteride cessation trial with treating dermatologist/urologist to evaluate spontaneous spermatogenic rebound.
- **IFHAS Primary Care Referral:** SEHA Ambulatory Healthcare Services (AHS) clinic for comprehensive lipid profile, fasting glucose, and blood pressure monitoring.
- **Longitudinal Cadence:** Repeat semen analysis scheduled at $+90\text{ days}$ post-washout.

---

## 3. Exception & Deviation Handling
- **Deviation (Patient Reluctance on TMSC Concept):** If the patient questions why his previous clinician marked his test "normal," the AI Co-Pilot generates an educational visual explanation demonstrating that lower-quartile parameters in four dimensions compound into subfertility.
- **Deviation (Accelerated Longitudinal Decay):** If repeat TMSC demonstrates velocity $<-20\%/\text{month}$, expedite scrotal Doppler to rule out grade 3 clinical varicocele or subclinical orchitis.

