# SOP-04: Pre-Referral NULL Endocrine Hold — Predicted High FSH vs. Unexpected Normal FSH Obstruction Pivot

**Protocol ID:** `SOP-04`  
**Target Archetype:** `MALAFFI-PT-004` (Varicocele Progressive Decline & Diagnostic Uncertainty)  
**Clinical Category:** Endocrine Discrimination & Bayesian Loop  
**Encounter Phase:** Day +2 Lab Hold  
**Framework:** Universal 4-Step S-O-A-P Clinical Encounter  

---

## 1. Clinical Purpose & Rationale
In patients presenting with severe oligozoospermia or non-obstructive azoospermia, referring immediately to an IVF center without discriminating serum gonadotropins is clinically irresponsible and cost-inefficient. When Serum Follicle-Stimulating Hormone (FSH) and Luteinizing Hormone (LH) remain unmeasured (`NULL`), high diagnostic entropy persists because two fundamentally opposing etiologies remain entangled:

1. **Primary Testicular Sertoli Cell Failure (`N46.01`):** Hypergonadotropic hypogonadism requiring micro-dissection TESE (Micro-TESE) or ICSI.
2. **Post-Testicular Ductal Obstruction (`N46.02`):** Normal spermatogenesis with mechanical outflow obstruction amenable to reconstructive microsurgery (vasoepididymostomy / TURED) or simple percutaneous epididymal sperm aspiration (PESA).

This SOP governs closing **Open Loop #1** (resolving missing discriminator lab via Shannon information gain) and **Open Loop #2** (verifying periodic $+90\text{d}$ return encounter) with complete cryptographic FNV-1a verification.

---

## 2. 4-Step S-O-A-P Workflow

### S: Subjective Intake & Multi-Visit Malaffi Timeline
- **Patient Profile:** 31-year-old male with 24-month primary conception delay and progressive sperm decline (velocity $-28\%/\text{year}$).
- **Symptoms & History:** Scrotal dragging heaviness on prolonged standing consistent with Grade 3 left varicocele; occupational exposure to radiant heat.
- **Loop Status at Entry:** **2 Open Loops (Action Required)**
  - Open Loop #1: Missing endocrine discriminator panel (FSH/LH is `NULL`).
  - Open Loop #2: Unverified $+90\text{-day}$ spermatogenic cycle follow-up encounter.
- **Gate Check:** `[✓ Confirm 2 Open Clinical Loops on Malaffi Timeline]`.

### O: Objective QC & The Missing Endocrine Discriminators
- **Semen Analysis (Severe Oligozoospermia):**
  - Volume: $2.1\text{ mL}$
  - Concentration: $3.2\times 10^6\text{ /mL}$ (Severe impairment)
  - Motility: $22\%$
  - Morphology: $2\%$
- **Endocrine Panel Status:**
  - Serum FSH: **NULL (Amber Alert)** $\rightarrow$ Information Gain Rank #1 ($\Delta H = -1.946\text{ bits}$)
  - Serum LH: **NULL**
  - Total Testosterone: **NULL**
- **Baseline Prior Probability:** Primary Testicular Sertoli Failure prior $P_0 = 45.0\%$. Joint Shannon Entropy $H_{\text{joint}} = 2.62\text{ bits}$.

### A: Assessment — Dual Branch Resolution

```
                      [Severe Oligozoospermia]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        [Path A: Predicted]          [Path B: Unexpected Pivot]
          High FSH (24.2 IU/L)          Normal FSH (4.2 IU/L)
                   │                           │
                   ▼                           ▼
      Primary Testicular Failure           Post-Testicular Ductal
          Sertoli Collapse                    Obstruction (N46.02)
          Certainty: 94.2%              Certainty: 91.5%
          ΔH = -1.946 bits              Requires Seminal Fructose & US
```

#### Path A (Predicted Outcome — 1 Click):
- **Action:** Technician clicks `[✓ Inject Predicted Lab (High FSH = 24.2 IU/L)]`.
- **Posterior Convergence:** Primary Testicular Failure surges from $45.0\%$ to **$94.2\%$**.
- **Entropy Drop:** Joint Shannon Entropy drops by **$\Delta H = -1.946\text{ bits}$**.
- **Loop 1 Closed:** Open Loops decrease from $2 \rightarrow 1$.
- **Close Loop 2:** Technician clicks `[✓ Verify +90d Return Visit]`.
- **Status:** **$0\text{ Open Loops (All Loops Closed ✓)}$** with deterministic FNV-1a hash lock.

#### Path B (Unexpected Outcome — AI Co-Pilot Pivot):
- **Trigger:** Technician clicks `[⚡ Outcome Differs: Normal FSH (4.2 IU/L) -> Pivot via AI Co-Pilot]`.
- **Prompt Injection:** Structured XML prompt `<sop_deviation_injection>` shifts Bayesian posterior from Sertoli Failure toward **Post-Testicular Ductal Obstruction (`ICD-10 N46.02`)**.
- **Targeted Interactive Questions:** AI Co-Pilot immediately generates follow-up checks:
  1. Low ejaculate volume / acidic pH?
  2. Seminal fructose presence?
  3. Scrotal ultrasound signs of dilated rete testis or epididymal tubular ectasia?

### P: Plan & Converged Mode 2 Bridge
- **1-Click Bridge:** Active loop controller bridges patient to **Step 4 Results (Connected Malaffi Graph Proof Banner, 5-Gate Trace, 90-Day Recovery Simulator, and HL7 FHIR R4 Bundle)**.
- **Surgical Routing:** Referral for left subinguinal microsurgical varicocelectomy vs. Micro-TESE.

---

## 3. Strict Guardrails
- A patient with $2\text{ Open Loops}$ must never be finalized into Step 4 until both loops are deterministically resolved.
- FNV-1a hash algorithm ensures that input modifications and resolution values produce an immutable 32-bit verification signature.

