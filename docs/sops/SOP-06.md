# SOP-06: +90-Day Spermatogenic Cycle Follow-Up — Recovery vs. Non-Responder Pivot

**Protocol ID:** `SOP-06`  
**Target Archetype:** `MALAFFI-PT-003` (Metabolic Hypogonadism / Longitudinal Cycle)  
**Clinical Category:** Longitudinal Monitoring & Follow-Up  
**Encounter Phase:** 🗓️ Day +90 Return Visit  
**Framework:** Universal 4-Step S-O-A-P Clinical Encounter  

---

## 1. Clinical Purpose & Rationale
Human spermatogenesis requires approximately 74 days ($\approx 64\text{ days}$ for testicular spermatogenesis $+ 10\text{–}14\text{ days}$ for epididymal transit and storage). Consequently, performing repeat semen analysis prior to 90 days following a therapeutic, metabolic, or surgical intervention reflects premature noise rather than biological efficacy.

At the **Day +90 milestone**, clinicians face a binary branch point:
1. **Spermatogenic Responders:** Document parameter expansion (TMSC $\ge 20\text{M}$), de-escalate urgency, and transition to self-directed maintenance or timed intercourse.
2. **Biological Non-Responders:** In patients whose TMSC remains severely subfertile ($<5\text{M}$) despite documented metabolic adherence and weight reduction, occult genetic etiology (Klinefelter syndrome $47,\text{XXY}$ mosaicism, Y-chromosome microdeletions in $\text{AZFa/b/c}$ regions) must be urgently screened, and fast-track Assisted Reproductive Technology (IVF/ICSI) referral initiated to prevent age-related female partner decline.

---

## 2. 4-Step S-O-A-P Workflow

### S: Subjective Intake & Adherence Audit (🗓️ Day +90)
- **Time Elapsed:** Exactly 92 days since initial baseline consultation.
- **Intervention Audit:**
  - Body weight reduction: achieved $7.5\%$ body mass loss (BMI reduced from $34.2$ to $31.6\text{ kg/m}^2$).
  - Sedentary behavior: reduced daily sitting from $9.5\text{ h}$ to $5.5\text{ h}$; daily steps increased to $>8,500$.
  - Medication compliance: full compliance with prescribed aromatase inhibitor / antioxidant regimen.
  - Heat avoidance: eliminated saunas, steam rooms, and hot jacuzzis.
- **Gate Check:** `[✓ Verify Day +90 Return Visit Adherence]`.

### O: Objective QC & Re-Evaluation
- **Comparative Semen Parameter Delta:**
  - Volume: $1.8\text{ mL} \rightarrow 2.4\text{ mL}$
  - Concentration: $14.2\text{ M/mL} \rightarrow 25.0\text{ M/mL}$
  - Total Motility: $38\% \rightarrow 55\%$
  - Normal Morphology: $3\% \rightarrow 5\%$
  - **TMSC Evolution:** $9.7\text{ Million} \rightarrow \mathbf{33.0\text{ Million}}$ ($>20\text{M}$ threshold crossed)
- **Comparative Endocrine Profile:**
  - Total Testosterone: $280\text{ ng/dL} \rightarrow 450\text{ ng/dL}$
  - Serum Estradiol: $42\text{ pg/mL} \rightarrow 26\text{ pg/mL}$
  - Testosterone-to-Estradiol Ratio ($T/E_2$): normalized from $6.6 \rightarrow 17.3$ ($>10$ threshold).

### A: Assessment & Longitudinal Resolution

```
                       [Day +90 Encounter]
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
       [Path A: Responder]           [Path B: Non-Responder]
       TMSC >= 20 Million             TMSC < 5 Million
       T/E2 Ratio > 10                Persistent Severe Defect
                 │                             │
                 ▼                             ▼
    Resolved Metabolic Defect        Occult Genetic Subfertility
    0 Open Loops (Closed ✓)          Karyotype (47,XXY) + AZF
    Certainty: 95.4%                 Fast-Track IVF/ICSI (ART)
```

#### Path A (Predicted Outcome — Spermatogenic Recovery):
- **Clinical Evaluation:** Document marked therapeutic response to metabolic aromatase suppression.
- **Loop Status:** Open Loop #2 resolved; **$0\text{ Open Loops (All Loops Closed ✓)}$**.
- **Cryptographic Lock:** Encounter hash locked with FNV-1a 32-bit checksum.

#### Path B (Unexpected Non-Responder — Genetic Pivot):
- **Deviation Trigger:** Clicks `[⚡ Outcome Differs: Non-Responder at Day +90]`.
- **Differential Shift:** Shift primary suspicion to **Occult Genetic Subfertility (`ICD-10 Q98.0` / Klinefelter, `Z84.82` Y-Microdeletion)**.
- **Interactive Prompts & Orders:**
  - Order Peripheral Blood Karyotype (G-banding).
  - Order Y-Chromosome Microdeletion multiplex PCR for $\text{AZFa}$, $\text{AZFb}$, $\text{AZFc}$.
  - Coordinate urgent ovarian reserve testing (AMH / Antral Follicle Count) for female partner.

### P: Plan & Transition of Care
- **Responder Plan:** Transition to Tier 4 Lifestyle Maintenance, continue active Sahatna wearable tracking, trial of timed natural conception for 6 months.
- **Non-Responder Plan:** Expedited handoff to HealthPlus Fertility Center Abu Dhabi or Cleveland Clinic Abu Dhabi for intracytoplasmic sperm injection (ICSI) with potential testicular sperm extraction backup.
- **Malaffi Handoff:** Complete dual-encounter longitudinal HL7 FHIR R4 RiskAssessment bundle generated.

---

## 3. Strict Quality Metrics
- Never pronounce therapeutic failure prior to the 74–90 day biological cycle.
- In persistent non-responders, every additional 3 months of delay risks female ovarian reserve depletion.

