# SOP-02: Emergency STAT Torsion & Scrotal Mass Circuit Breaker

**Protocol ID:** `SOP-02`  
**Target Archetype:** `MALAFFI-PT-005` (Acute Scrotal Surgical Emergency)  
**Clinical Category:** Emergency Triage  
**Encounter Phase:** Day 0 Intake (STAT <12h)  
**Framework:** Universal 4-Step S-O-A-P Clinical Encounter  

---

## 1. Clinical Purpose & Rationale
To enforce an instantaneous, zero-delay clinical safety circuit breaker for surgical emergencies of the scrotum. Testicular torsion carries a critical surgical salvage window: testicular viability drops from $>90\%$ at $<6\text{ hours}$ to $<50\%$ at $12\text{ hours}$, and $<10\%$ after $24\text{ hours}$. Similarly, any firm, painless testicular mass represents a potential testicular germ cell tumor (GCT) requiring urgent Doppler ultrasound and urological oncology evaluation. Standard fertility intake and routine semen processing are strictly contraindicated.

---

## 2. 4-Step S-O-A-P Workflow

### S: Subjective Intake & Red-Flag Triage
- **Chief Complaint:** Acute unilateral scrotal pain, swelling, or newly noticed testicular mass.
- **OLDCARTS Interrogation:**
  - **Onset:** Sudden vs. gradual.
  - **Location & Radiation:** Unilateral hemiscrotum radiating to the ipsilateral inguinal canal or lower quadrant.
  - **Duration:** Precise hours since symptom onset (salvage clock active).
  - **Associated Symptoms:** Nausea, vomiting, diaphoresis (autonomic spermatic plexus activation).
- **Gate Check:** `[🚨 Trigger STAT Emergency Circuit Breaker (<12h Salvage)]`.

### O: Objective QC & Diagnostic Bypass
- **Physical Examination Findings:**
  - Asymmetrical high-riding transverse testicle.
  - Absence of the ipsilateral cremasteric reflex (99% sensitivity for torsion).
  - Negative Prehn sign (elevation of scrotum does not relieve pain).
  - Tachycardia (e.g., HR 108 bpm) reflecting intense acute somatic pain.
- **Diagnostic Bypass Protocol:** Immediately bypass routine semen analysis, centrifugation, and endocrine waitlists.
- **STAT Prerequisite:** Bedside high-frequency color Doppler scrotal ultrasonography (evaluating resistive indices and absence of testicular parenchymal vascular flow).

### A: Assessment & Emergency Verdict
- **Primary Diagnosis:** Acute Testicular Torsion (`N44.00`) or Testicular Mass Suspicious for Malignancy (`C62.90`).
- **Triage Level:** **TIER_1_EMERGENCY** (Governed by Rule `RES-5` / `RES-6`).
- **Clinical Directive:** Immediate surgical exploration within the remaining salvage window; immediate bilateral orchiopexy indicated upon torsion confirmation.
- **Prohibited Action:** LLM rephrasing, downgrade of triage tier, or outpatient observation.

### P: Plan & Direct Hospital Transfer
- **Emergency Disposition:** Direct hospital dispatch to 24/7 Tertiary Urology Center:
  - Sheikh Shakhbout Medical City (SSMC) Emergency Department, Abu Dhabi.
  - Cleveland Clinic Abu Dhabi (CCAD) Emergency Medicine Institute.
- **Pre-Arrival Notification:** Dispatch electronic emergency notice via Malaffi to receiving urologist on call.
- **Patient Directives:** Strict Nil Per Os (NPO) status in anticipation of urgent surgical anesthesia; transport via ambulance or accompanied driver (driving contraindicated).
- **Malaffi Token:** Instant emergency HL7 FHIR R4 RiskAssessment record dispatched.

---

## 3. Exception & Deviation Handling
- **Deviation (Spontaneous Pain Resolution):** If scrotal pain abates spontaneously before evaluation, document *intermittent testicular torsion with spontaneous detorsion*. Emergency Doppler ultrasound and semi-urgent elective bilateral orchiopexy remain strictly indicated due to high recurrence and infarction risk.
- **Deviation (Epididymo-Orchitis):** If Doppler demonstrates intact or hyperemic testicular flow with epididymal hypervascularity and pyuria, reclassify to acute epididymo-orchitis, initiate targeted antibiotics, and refer to outpatient urology.

