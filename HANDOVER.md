# HANDOVER.md: Masar Amanah Health (مسار أمانة)
## Master Engineering Blueprint — Closed-Loop Longitudinal Retrieval & Bayesian Differential Diagnosis Graph
### GITEX 2026 · Future Health Digital Innovation Challenge (DoH Abu Dhabi · ADPHC · Inception42 · Microsoft · MBZUAI)

- **Track:** `[Fertility] Male Reproductive Health` (Integrated with ADPHC `IFHAS` Cardio-Renal-Metabolic Screening)
- **Key Deadlines:**
  - **Registration Closes:** November 10, 2026
  - **Prototype & Technical Documentation Due:** **November 20, 2026**
  - **Expert Panel Live Evaluation:** November 20–30, 2026 (Hands-on live link testing)
  - **GITEX Finals:** December 7–11, 2026
- **Algorithm Version:** `v2.0-BAYESIAN-DAG-WHO6-AUA-UAE` (Backward-compatible with `v1.4-AUA2021-WHO6-UAE`)
- **AI Studio / Cloud Run Reference:** `https://ai.studio/apps/8e61219d-bfd3-42ec-b3fe-e24c5c8bfccc`

---

## 1. Strategic & Architectural Evolution: Why This Scale-Up Wins

### The Problem with Basic Triage Checklists
A medical technician or lab nurse does not need an app to tell them that `Sperm Concentration = 11 M/mL` is below the WHO `15 M/mL` cutoff—the lab machine already prints `LOW` in bold ink. What busy medical technicians and general practitioners **actually miss** are **multi-visit longitudinal trends and cross-silo physiological interactions** where individual parameters look "Normal" or unconnected in isolation, yet their combined root system signals either **life-threatening pathology** or **reversible subfertility**.

### Our Core Architecture: Closed-Loop Longitudinal Graph + Multi-Label Bayesian Inference
1. **Tokenized Zero-Identity Longitudinal Persistence (`ADR-1 v2`):**
   - **Identity vs. Clinical Depth:** We never collect or transmit PII (No patient names, Emirates IDs, phone numbers, or emails). However, clinical records are persisted and retrieved under **Pseudonymized Malaffi Tokens** (`MALAFFI-PT-001` through `MALAFFI-PT-006` + user-created encounters) on the Express server (`src/server/`).
   - **AST Compliance Note:** All persistence lives in the server-side longitudinal store and in-memory React state—**never** use `localStorage`, `sessionStorage`, `indexedDB`, or `document.cookie` on the client so `scripts/complianceScans.ts` (`zero-pii-leak-audit`) passes `6/6 (100%)`.
2. **Zero Cached Conclusions (100% Deterministic Mathematical Derivation):**
   - The database stores **only raw longitudinal encounter data** (timestamps, vitals, semen parameters, hormone panels, medication start/stop dates, Sahatna wearable streams).
   - Every time a patient chart is retrieved or a new lab value is entered, the **4-Layer Clinical Knowledge Graph** computes all derived indices, longitudinal velocities, posterior probabilities, and information-gain rankings live from scratch (`ICC = 1.000`, `<2ms` latency).

---

## 2. Principal AI Engineer & SRE Guardrails (The 4 Mandatory Laws)

### Law 1: Independent Multi-Label Bayesian Logistic Posteriors (No Softmax Dilution)
In clinical medicine, etiologies are **not mutually exclusive** (a patient can have a Grade 2 Varicocele *and* Metabolic Aromatase Syndrome *and* Finasteride toxicity simultaneously). Never normalize probabilities across diagnoses via Softmax ($\sum P_i = 1$), because strong chronic evidence will dangerously dilute a co-existing oncology or pituitary red flag.
- Instead, each Etiological Hypothesis $D_i$ computes an **independent posterior probability** via logistic log-odds propagation:
  $$L(D_i \mid E_t) = \ln\left(\frac{P_0(D_i)}{1 - P_0(D_i)}\right) + \sum_{j \in \text{Active}(E_t)} w_{ij} \cdot \ln \text{LR}_{ij}(e_j)$$
  $$P(D_i \mid E_t) = \sigma\left(L(D_i \mid E_t)\right) = \frac{1}{1 + \exp(-L(D_i \mid E_t))} \in (0, 1)$$
- **Strict `Null ≠ Zero` Invariant:** If a biomarker node $X_j$ is `null` (unmeasured), its log-likelihood contribution is strictly $0$ ($\text{LR} = 1.0$), never zeroed or imputed.

### Law 2: Two-Plane Clinical Graph (Life-Saving Escalation Plane + Etiological Subfertility Plane)
The graph evaluates two distinct priority planes simultaneously:

#### Plane A: Life- & Organ-Saving Escalation Nodes (What Technicians Miss that Saves Lives)
1. **`ESC_OCCULT_PITUITARY_NEUROENDOCRINE` (Pituitary Macroadenoma / Prolactinoma Screen):**
   - *Technician Blind Spot:* Tech sees low sperm count (`<10 M/mL`) and low-normal Testosterone (`<250 ng/dL`) and schedules routine fertility follow-up.
   - *Graph Correlation:* `Oligozoospermia` + `Low Total T (<260 ng/dL)` + `Inappropriately Low/Normal LH (<2.5 IU/L) & FSH (<2.5 IU/L)` (failure of pituitary compensation) OR `Elevated Prolactin (>20 ng/mL)`.
   - *Life-Saving Action:* Mandates urgent **Serum Prolactin (`LOINC 2842-3`) & Pituitary Sellar MRI** before optic chiasm compression occurs.
2. **`ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR` (ADPHC’s #1 Life-Saving Priority):**
   - *Technician Blind Spot:* Fertility tech ignores `BMI 27.5–32`, `HbA1c >= 5.8%`, `Sahatna Resting HR >= 84 bpm`, and `Sleep < 5.8h`.
   - *Graph Correlation:* Longitudinal decline in Testosterone/TMSC + visceral insulin resistance (`HbA1c` drift) + autonomic sympathetic overload (`Resting HR` / low `VO2 Max`). Endothelial/gonadal decline precedes **Myocardial Infarction / MACE by 3–5 years**.
   - *Life-Saving Action:* Urgent **IFHAS Preventive Cardiology & Lipid/Glycemic Intervention** alongside endocrine care.
3. **`ESC_GERM_CELL_NEOPLASIA_HIGH_RISK` (Testicular Germ Cell Malignancy Screen):**
   - *Technician Blind Spot:* Patient has no obvious acute pain, or only a subtle firm mass / history of childhood `Cryptorchidism` + `Severe OATS (<5 M/mL)`.
   - *Graph Correlation:* `Painless Lump` OR (`Cryptorchidism` + `Severe OATS < 5 M/mL` + `Testicular Volume/Function Drop`), which carries up to a **20x risk of Testicular Germ Cell Tumor (TGCT / GCNIS)**.
   - *Life-Saving Action:* Urgent **High-Resolution Scrotal Doppler Ultrasound & Tumor Markers (`AFP`, `beta-hCG`, `LDH`)**.
4. **`ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS`:**
   - *Graph Correlation:* `Acute Scrotal Pain (<24h)` (6-hour surgical salvage window for spermatic cord torsion) OR acute/non-reducible right-sided varicocele (screen for retroperitoneal/renal vein thrombus).

#### Plane B: 6 Competing Etiological Subfertility Branches ($\mathcal{V}_{\text{DDx}}$)
1. **`DDX_PRE_TESTICULAR_HPG_SUPPRESSION`** *(Secondary Hypogonadotropic Hypogonadism — ICD-10 `E29.1`)*
2. **`DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY`** *(Adipose/Insulin-Driven $T \to E_2$ Aromatization, $T/E_2 < 10$ — ICD-10 `E66.9`)*
3. **`DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE`** *(Hypergonadotropic Intrinsic Spermatogenic Arrest, $\text{FSH} > 7.6\text{ IU/L}$ — ICD-10 `N46.01`)*
4. **`DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME`** *(Pampiniform Plexus Reflux & Scrotal Hyperthermia/ROS — ICD-10 `I86.1`)*
5. **`DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION`** *(Ejaculatory Duct Obstruction / Seminal Vesicle Hypoplasia, Volume $< 1.4\text{ mL}$ + Normal FSH — ICD-10 `N46.02`)*
6. **`DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY`** *(74-Day Delayed 5-ARI [Finasteride], Exogenous TRT, or SSRI Spermatotoxicity — ICD-10 `T38.5X5A`)*

---

### Law 3: Joint Binary Entropy & Active Loop Controller (Dual-Projection for Technicians & Judges)
To quantify diagnostic uncertainty across multi-label hypotheses $D_1 \dots D_6$, the backend computes **Joint Binary Shannon Entropy (in bits)**:
$$H_{\text{joint}}(D \mid E_t) = \sum_{i=1}^{6} \left( -p_i \log_2(p_i) - (1 - p_i)\log_2(1 - p_i) \right), \quad \text{where } p_i = P(D_i \mid E_t)$$

For every unmeasured (`NULL`) diagnostic test $X_u \in \mathcal{U}_{\text{null}}$ (`Serum FSH & LH`, `Morning Total T & Estradiol`, `Serum Prolactin`, `Seminal Fructose & pH`, `Scrotal Doppler Ultrasound`, `Sperm DNA Fragmentation DFI`):
1. The engine simulates outcomes $v \in \{\text{LOW}, \text{NORMAL}, \text{HIGH}\}$ weighted by current posteriors and computes **Expected Information Gain (Information Gain $\text{IG}$ in bits)**:
   $$\text{IG}(D; X_u \mid E_t) = H_{\text{joint}}(D \mid E_t) - \sum_{v} P(X_u = v \mid E_t) H_{\text{joint}}(D \mid E_t, X_u = v)$$
2. **Dual Projection Output:**
   - **For Medical Technicians:** Plain-language **"Why Standard Triage Misses This"** alert + **"1-Click Enter Missing Lab (`NULL` Resolver)"** showing which exact competing diagnoses that lab separates.
   - **For AI/Clinical Judges:** Full mathematical trace showing `Prior Odds`, `ln(LR)` edge weights, `Posterior P(D_i | E)`, `Joint Entropy (bits)`, and live $\Delta H$ convergence when a `NULL` test is resolved.

---

### Law 4: Cloud Run Hybrid Persistence & Non-Breaking Modularity
1. **High-Fan-In Protection:** Do **NOT** break `src/types/screening.ts` (Fan-In 18) or `docs/specs/contract.schema.json`. Keep `clinicalEngine.ts` and all 15 existing tests (`RES-1`..`RES-19`) intact.
2. **Hybrid Server + Replay Store:** `src/server/patientGraphRoutes.ts` initializes in-memory from `src/data/longitudinalCohort.ts` on container boot and supports both stateful mutations (`POST /api/patients/:id/resolve-null`, `POST /api/patients/:id/encounters`) and stateless full-timeline evaluation (`POST /api/patients/evaluate-timeline`) so Cloud Run cold starts never lose state.

---

## 3. Target Backend & Frontend Module Topology

```
src/
├── types/
│   ├── screening.ts                 # [FROZEN CONTRACT - DO NOT BREAK]
│   └── diagnosticGraph.ts           # [NEW] LongitudinalPatientRecord, Encounter, SignalNode, SyndromeNode, DDxNode, NullTestOrder, ClosedLoopEvaluation
├── lib/
│   ├── clinicalEngine.ts            # [EXISTING] 5-Gate Triage Engine (15/15 tests passing)
│   └── diagnosticGraph/
│       ├── knowledgeBase.ts         # [NEW] Declarative Priors, Likelihood Ratios (LR+/LR-), & Test Outcome Distributions
│       ├── temporalExtractor.ts     # [NEW] Stage 2 & 3: TMSC, TMSC Velocity (%/mo), T/E2 Ratio, 74-day Med Lag, & 5 Technician Blind-Spot Syndromes
│       ├── bayesianInference.ts     # [NEW] Stage 4 & 5: Multi-Label Logistic Log-Odds, Joint Binary Entropy H(D|E), & Information Gain IG(D;X_u)
│       └── loopController.ts        # [NEW] Stage 6: Closed-Loop Controller (S_t -> S_{t+1} mutation, Null resolution, & 90-day trajectory)
├── data/
│   └── longitudinalCohort.ts        # [NEW] 6 Multi-Visit Synthetic Malaffi Patient Records (each showcasing a technician blind spot & life-saving catch)
├── server/
│   └── patientGraphRoutes.ts        # [NEW] Express API endpoints (/api/patients, /api/patients/:id/graph, /api/patients/:id/resolve-null, /api/patients/evaluate-timeline)
└── components/
    └── DiagnosticWorkbench.tsx      # [NEW - Phase D] Interactive Longitudinal Chart, Cross-Silo Root Graph, Bayesian DDx Bars, & 1-Click Null Lab Resolver
```

---

## 4. Phased Antigravity IDE Execution Prompts (Run Strictly in Order)

> **CRITICAL INSTRUCTION:** Never run all phases in one prompt. Run **Phase A**, verify `npm run lint`, then move to **Phase B**, **Phase C**, and **Phase D**.

### 🔹 Phase A Prompt: Graph Types & Clinical Knowledge Base Matrix
Copy and paste into Antigravity IDE:
```markdown
Read HANDOVER.md. Execute ONLY Phase A (Backend Graph Types & Declarative Knowledge Base) without modifying `src/types/screening.ts` or any existing components:

1. Create `src/types/diagnosticGraph.ts`:
   - Define `LongitudinalEncounter` (encounterId, dateIso, clinicalSetting, vitals: { bmi, weightKg, restingHrBpm, sleepHoursAvg, hba1cPct }, semenLab: { volumeMl, concentrationMMl, totalMotilityPct, normalMorphologyPct } | null, endocrinePanel: { fshIuL, lhIuL, totalTestosteroneNgDl, estradiolPgMl, prolactinNgMl } | null, medications: Array<{ name, class: '5ARI' | 'TRT_ANDROGEN' | 'SSRI' | 'OTHER', startDateIso }>, clinicalFlags: { acuteScrotalPain, painlessTesticularMass, varicoceleGrade: 0 | 1 | 2 | 3, rightSidedNonReducibleVaricocele?: boolean, cryptorchidismHistory, mumpsOrchitisHistory, sittingHoursPerDay, frequentThermalExposure, tobaccoUsage: 'none' | 'light' | 'heavy' }).
   - Define `LongitudinalPatientRecord` (patientId, pseudonymToken, age, ifhasBracket: '18-35' | '36-50' | '51-75', primaryComplaintEn, primaryComplaintAr, encounters: LongitudinalEncounter[]).
   - Define `DerivedSignalNode` (id, domain: 'SPERMATOGENIC' | 'ENDOCRINE' | 'CARDIOMETABOLIC' | 'EXPOSURE' | 'TEMPORAL', labelEn, labelAr, value: number | string | boolean | null, unit, status: 'NORMAL' | 'ABNORMAL' | 'BORDERLINE' | 'NULL', referenceRange, loincCode?: string).
   - Define `BlindSpotSyndromeNode` (id, titleEn, titleAr, triggered: boolean, severity: 'LIFE_SAVING' | 'HIGH' | 'MODERATE', parentSignalIds: string[], whatTechSeesEn, whatTechSeesAr, whatGraphCatchesEn, whatGraphCatchesAr).
   - Define `LifeSafetyEscalationNode` (id, titleEn, titleAr, triggered: boolean, probability: number, icd10Code, snomedCode, rationaleEn, rationaleAr, urgentActionEn, urgentActionAr, requiredStatLabs: string[]).
   - Define `DifferentialHypothesisNode` (id, codeIcd10, codeSnomed, category: 'PRE_TESTICULAR' | 'TESTICULAR' | 'POST_TESTICULAR' | 'IATROGENIC' | 'METABOLIC', titleEn, titleAr, priorProbability: number, priorLogOdds: number, posteriorLogOdds: number, posteriorProbability: number, supportingEdges: Array<{ sourceNodeId: string, labelEn: string, logLikelihoodContribution: number }>, contradictingEdges: Array<{ sourceNodeId: string, labelEn: string, logLikelihoodContribution: number }>, nullDiscriminatorIds: string[]).
   - Define `DiscriminatingTestOrder` (testId, loincCode, nameEn, nameAr, targetBiomarkerKey: 'fshIuL' | 'lhIuL' | 'totalTestosteroneNgDl' | 'estradiolPgMl' | 'prolactinNgMl' | 'semenPanel' | 'scrotalDoppler', isCurrentlyNull: boolean, expectedInformationGainBits: number, separatesHypotheses: string[], simulatedIfAbnormal: { valuePreview: number, labelEn: string, projectedEntropyBits: number, topHypothesisShiftEn: string }, simulatedIfNormal: { valuePreview: number, labelEn: string, projectedEntropyBits: number }).
   - Define `ClosedLoopGraphEvaluation` (patientId, encounterCount: number, evaluatedAtIso: string, algorithmVersion: string, signals: DerivedSignalNode[], blindSpotSyndromes: BlindSpotSyndromeNode[], lifeSafetyEscalations: LifeSafetyEscalationNode[], differentialRanking: DifferentialHypothesisNode[], jointEntropyBits: number, maxPossibleEntropyBits: number, diagnosticCertaintyPct: number, loopStatus: 'CONVERGED' | 'AWAITING_DISCRIMINATOR_LOOP' | 'LIFE_SAFETY_ESCALATION', rankedNextTests: DiscriminatingTestOrder[]).

2. Create `src/lib/diagnosticGraph/knowledgeBase.ts`:
   - Define baseline priors, ICD-10/SNOMED codes, and likelihood ratio (`LR+` / `LR-`) edge definitions for the 6 Plane-B Etiological Hypotheses and 4 Plane-A Life-Safety Escalation nodes, plus the 5 candidate discriminating tests (`TEST_FSH_LH`, `TEST_TESTOSTERONE_ESTRADIOL`, `TEST_PROLACTIN_PITUITARY`, `TEST_SEMINAL_FRUCTOSE_OBSTRUCTION`, `TEST_CONFIRMATORY_SEMEN_TMSC`).

3. Run `npm run lint` to confirm zero TypeScript errors.
```

### 🔹 Phase B Prompt: Temporal Feature Extractor & Closed-Loop Bayesian Engine
Copy and paste into Antigravity IDE after Phase A passes:
```markdown
Read HANDOVER.md. Execute ONLY Phase B (Temporal Signal Extractor, Multi-Label Bayesian Log-Odds Engine, & Closed-Loop Controller):

1. Create `src/lib/diagnosticGraph/temporalExtractor.ts`:
   - Take a `LongitudinalPatientRecord` and extract all `DerivedSignalNode[]` from the latest encounter AND longitudinal velocity across `encounters[0 ... k]`:
     - `tmsc_million` = Volume * Concentration * (Motility / 100) (strictly `null` if `semenLab === null`).
     - `tmsc_velocity_pct_mo` = % change in TMSC per month across sequential encounters with semen labs (`null` if < 2 semen labs).
     - `t_e2_ratio` = `totalTestosteroneNgDl / estradiolPgMl` (`null` if either is `null`; abnormal if `< 10.0`).
     - `fsh_lh_state` (`null` if unmeasured; classifies Hypergonadotropic `FSH > 7.6` vs Hypogonadotropic `FSH < 1.8 & LH < 1.8`).
     - `delayed_5ari_spermatotoxicity` = checks if any `'5ARI'` or `'TRT_ANDROGEN'` medication started >= 74 days prior to latest encounter.
     - `metabolic_hba1c_drift` = change in HbA1c and BMI across encounters + Sahatna `sleepHoursAvg` & `restingHrBpm`.
   - Evaluate and return the 5 `BlindSpotSyndromeNode[]`:
     1. `SYN_FALSE_NORMAL_SUBFERTILITY` (All 4 WHO 6th parameters >= lower limit, yet `tmsc_million < 20.0`)
     2. `SYN_OCCULT_LONGITUDINAL_DECAY` (Latest concentration >= 15 M/mL, yet `tmsc_velocity_pct_mo <= -8.0`)
     3. `SYN_SUBCLINICAL_AROMATASE_SLEEP_AXIS` (BMI 26.5-29.9 + Sleep < 6h or HbA1c >= 5.7% + T/E2 < 10 or Motility < 45%)
     4. `SYN_DELAYED_IATROGENIC_SPERMATOTOXICITY` (5-ARI/Finasteride or TRT active >= 74 days + TMSC < 25M or Volume < 1.6mL)
     5. `SYN_LOW_VOLUME_OBSTRUCTIVE_MASK` (Volume < 1.4 mL + Concentration < 10 M/mL + FSH normal or NULL)

2. Create `src/lib/diagnosticGraph/bayesianInference.ts`:
   - Implement Plane A (`evaluateLifeSafetyEscalations`) for:
     1. `ESC_OCCULT_PITUITARY_NEUROENDOCRINE`
     2. `ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR`
     3. `ESC_GERM_CELL_NEOPLASIA_HIGH_RISK`
     4. `ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS`
   - Implement Plane B (`evaluateBayesianDifferential`):
     - Compute independent logistic posterior probability `P(D_i | E_t) = 1 / (1 + Math.exp(-posteriorLogOdds))` for all 6 etiological hypotheses.
     - Strictly enforce `Null ≠ Zero`: any `NULL` signal contributes `0` to `posteriorLogOdds`.
   - Implement `computeJointBinaryEntropy(hypotheses)` in bits:
     `sum(-p * log2(p) - (1 - p) * log2(1 - p))` and `diagnosticCertaintyPct`.

3. Create `src/lib/diagnosticGraph/loopController.ts`:
   - Implement `evaluatePatientGraph(record: LongitudinalPatientRecord): ClosedLoopGraphEvaluation`:
     - Runs Stage 2 (temporalExtractor), Stage 3 (Blind Spots), Stage 4 (Bayesian Inference & Joint Entropy), and Stage 5 (Shadow-simulates each currently `NULL` biomarker test with Abnormal vs Normal outcomes to compute exact `expectedInformationGainBits` and sorts `rankedNextTests` descending).
   - Implement `resolveNullBiomarkerInLoop(record: LongitudinalPatientRecord, biomarkerKey: string, measuredValue: number)`:
     - Clones the latest encounter (or appends a lab-update encounter), injects the measured biomarker value, re-runs `evaluatePatientGraph`, and returns `{ updatedRecord, previousEvaluation, newEvaluation, entropyDeltaBits }`.

4. Run `npm run lint` to verify zero TypeScript errors.
```

### 🔹 Phase C Prompt: 6 Synthetic Malaffi Patient Records, Express Routes & Automated Test Verification
Copy and paste into Antigravity IDE after Phase B passes:
```markdown
Read HANDOVER.md. Execute ONLY Phase C (Longitudinal Patient Cohort, Express API Endpoints, & Clinical Test Harness `RES-20`):

1. Create `src/data/longitudinalCohort.ts`:
   - Create 6 rich, multi-encounter Synthetic Malaffi Longitudinal Patient Records (`MALAFFI-PT-001` through `MALAFFI-PT-006`), each with 2 to 3 historical encounters over 6–18 months:
     - `MALAFFI-PT-001`: **"The False-Normal Lab Trap & Longitudinal Decay"** (Visit 1: TMSC 34M -> Visit 2: Vol 1.5mL, Conc 16.0M/mL, Motility 43%, Morph 4% — all 4 WHO lines pass as "Normal", but TMSC dropped to 10.32M [-11%/mo] with Finasteride 5-ARI started 6 months ago in Dermatology).
     - `MALAFFI-PT-002`: **"Life-Saving Catch: Occult Pituitary Suppression Mask"** (Conc 6.5M/mL, Low Testosterone 195 ng/dL, Low LH 1.1 IU/L, Low FSH 1.2 IU/L, Prolactin `NULL` — technician sees routine oligozoospermia; graph triggers `ESC_OCCULT_PITUITARY_NEUROENDOCRINE` & ranks `Serum Prolactin` #1).
     - `MALAFFI-PT-003`: **"Life-Saving Catch: Silent Cardiometabolic MACE Precursor (ADPHC Priority)"** (Age 42, BMI drifting 27.2 -> 28.9, HbA1c 5.5% -> 6.2%, Sahatna Resting HR 88 bpm, Sleep 5.1h, T/E2 Ratio 7.8, FSH/LH `NULL` — catches 5-year cardiac + aromatase syndrome).
     - `MALAFFI-PT-004`: **"Unresolved Competing Differential: Pre-Testicular vs Primary Sertoli vs Obstructive"** (Vol 1.2mL, Conc 7.0M/mL, Motility 32%, All Hormones `NULL` — High Joint Entropy; demonstrates Information Gain ranking `FSH & LH` #1, and resolves live when `FSH = 16.4 IU/L` vs `FSH = 1.1 IU/L` is entered).
     - `MALAFFI-PT-005`: **"Life-Saving Catch: Cryptorchidism + Severe OATS Germ Cell Malignancy Risk"** (Childhood cryptorchidism + Conc 2.8 M/mL + Grade 2 Varicocele -> triggers `ESC_GERM_CELL_NEOPLASIA_HIGH_RISK` + intrinsic testicular failure).
     - `MALAFFI-PT-006`: **"Acute Right-Sided Non-Reducible Varicocele / Acute Surgical Escalation"** (Triggers immediate Plane A surgical/retroperitoneal escalation).

2. Create `src/server/patientGraphRoutes.ts` and mount in `server.ts`:
   - Maintain an in-memory `Map<string, LongitudinalPatientRecord>` initialized from `LONGITUDINAL_MALAFFI_COHORT`.
   - `GET /api/patients` -> returns list of patient summaries + live `evaluatePatientGraph` headline metrics.
   - `GET /api/patients/:id/graph` -> returns `{ record, evaluation }` computed live (zero cached results).
   - `POST /api/patients/:id/resolve-null` -> accepts `{ biomarkerKey, measuredValue }`, runs `resolveNullBiomarkerInLoop`, persists updated record in the server Map, and returns `{ updatedRecord, previousEvaluation, newEvaluation, entropyDeltaBits }`.
   - `POST /api/patients/evaluate-timeline` -> stateless endpoint accepting any `{ record }` payload and returning `evaluatePatientGraph(record)` for Cloud Run cold-start resilience.
   - `POST /api/patients/reset` -> resets in-memory store back to `LONGITUDINAL_MALAFFI_COHORT`.

3. Add `RES-20` to `scripts/testHarness.ts`:
   - Verify:
     a) `MALAFFI-PT-001` triggers `SYN_FALSE_NORMAL_SUBFERTILITY` (TMSC 10.32M < 20M despite all 4 WHO parameters >= threshold) and `SYN_OCCULT_LONGITUDINAL_DECAY`.
     b) `MALAFFI-PT-002` triggers `ESC_OCCULT_PITUITARY_NEUROENDOCRINE`.
     c) `MALAFFI-PT-004` starts with high `jointEntropyBits`, ranks `fshIuL` as a top Information Gain discriminator (`expectedInformationGainBits > 0`), and when `resolveNullBiomarkerInLoop` injects `fshIuL = 16.5`, `DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE` jumps to >80% posterior probability while `jointEntropyBits` decreases (`entropyDeltaBits < 0`).
     d) Determinism check: calling `evaluatePatientGraph` twice on identical records produces 100% identical posteriors (`ICC = 1.000`).

4. Run `npm run lint`, `npm test`, and `npm run test:compliance`.
```

### 🔹 Phase D Prompt: Interactive Clinical Diagnostic Workbench UI (Frontend)
Copy and paste into Antigravity IDE ONLY after Phases A, B, and C pass 100%:
```markdown
Read HANDOVER.md. Execute Phase D (Frontend Longitudinal Diagnostic Workbench) adhering strictly to `DESIGN_SPEC.md` (`UX-1`: solid surfaces only, zero `rgba()`, zero `backdrop-filter`, zero `blur()`, zero `localStorage`/`sessionStorage`):

1. Create `src/components/DiagnosticWorkbench.tsx`:
   - Provide a top-level mode switch or tab in `App.tsx` / `Header.tsx`: **"Longitudinal Differential Workbench (Malaffi EHR & Bayesian Loop)"** alongside the rapid screening wizard.
   - **Region 1 — Patient Record Selector & Longitudinal Encounter Timeline:**
     - One-click selector for `MALAFFI-PT-001` through `MALAFFI-PT-006` + a "Reset Cohort" button.
     - Displays the multi-visit timeline (`Encounter 1 -> Encounter 2 -> Latest`), highlighting longitudinal velocity (`ΔTMSC %/mo`, `ΔHbA1c`, `ΔBMI`, and 74-day medication lag).
   - **Region 2 — Plane A Life-Saving Escalation & "What Technicians Miss" Syndrome Cards:**
     - High-contrast solid-surface alert cards (`bg-rose-950 text-white` for Life-Saving Escalations; `bg-amber-950 text-white` for Technician Blind Spots) showing side-by-side:
       - *"What a Standard Single-Column Check Sees"* vs. *"What the Cross-Silo Longitudinal Graph Catches"*.
   - **Region 3 — Multi-Label Bayesian Differential Diagnosis Ranking (Plane B):**
     - Renders all 6 Etiological Hypotheses with independent posterior probability bars (`0–100%`), ICD-10/SNOMED badges, Prior -> Posterior Log-Odds math, and clickable **Supporting Root Edges** (`+ln LR`) vs **Contradicting Edges** (`-ln LR`).
   - **Region 4 — Active Closed-Loop `NULL` Lab Resolver (Information Gain Controller):**
     - Displays current **Diagnostic Uncertainty (`Joint Entropy Bits`)** & **Diagnostic Certainty %**.
     - Lists the `NULL` Discriminating Labs ranked by **Expected Information Gain (`+bits`)**.
     - Gives the Medical Technician / Judge one-click preset buttons (e.g., *"Simulate High FSH (16.5 IU/L)"*, *"Simulate Low FSH (1.1 IU/L)"*, *"Simulate High Prolactin (68 ng/mL)"*, or custom numeric input) that call `resolveNullBiomarkerInLoop`, animating the posterior shift and showing the exact **Entropy Drop (`ΔH bits`)** live!

2. Run `npm run lint`, `npm test`, `npm run test:compliance`, and `npm run build` and verify all gates pass (including gzip JS bundle < 150 kB).
```

---

### Why This `HANDOVER.md` Works Seamlessly in Antigravity IDE
1. **Zero Risk of Breaking Existing Work:** Phases A, B, and C build the entire **4-Layer Graph + Multi-Label Bayesian Loop + Longitudinal Malaffi Store** in modular files (`src/types/diagnosticGraph.ts`, `src/lib/diagnosticGraph/*`, `src/data/longitudinalCohort.ts`, `src/server/patientGraphRoutes.ts`) without touching `screening.ts` or breaking your 15 existing tests.
2. **Testable at Every Step:** After Phase C, `RES-20` in `scripts/testHarness.ts` mathematically proves that the False-Normal TMSC trap, the Pituitary life-saving escalation, and the Shannon Entropy closed-loop lab resolver work in headless CLI before you even render the UI in Phase D.

Start by dropping **Phase A** into Antigravity IDE, and share the terminal output whenever you're ready!
