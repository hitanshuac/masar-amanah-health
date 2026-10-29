/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ar';

export type UserRole = 'patient' | 'clinician_companion' | 'system_auditor';

export type TriageTier =
  | 'TIER_1_EMERGENCY'
  | 'TIER_2_ANDROLOGY_SPECIALIST'
  | 'TIER_3_PRIMARY_CARE'
  | 'TIER_4_LIFESTYLE';

export type TobaccoUsage = 'none' | 'light' | 'heavy';

export interface ScreeningInput {
  // Step 1: Safety Gate & Basic Metrics
  acutePain: boolean;          // Sudden, severe scrotal pain (<12-24h)
  painlessLump: boolean;       // Painless firm testicular mass
  age: number;                 // 18 - 65
  heightCm: number;            // 140 - 210
  weightKg: number;            // 45 - 180
  bmi: number;                 // Calculated or direct (16 - 45)

  // Step 2: Clinical History (AUA / ASRM markers)
  steroidsTrt: boolean;        // Exogenous anabolic steroids or TRT
  undescendedTesticle: boolean;// Cryptorchidism / orchidopexy history
  varicocele: boolean;         // Diagnosed clinical varicocele
  mumpsOrchitis: boolean;      // Mumps infection after puberty

  // Step 3: Lifestyle & Environment
  sittingHours: number;        // Prolonged sitting (2 - 16 hrs/day)
  frequentHeat: boolean;       // Saunas, hot tubs, steam baths >2x/week
  tobaccoShisha: TobaccoUsage; // None, light, heavy (cigarettes, shisha, medwakh)

  // Step 3 (Optional): WHO 6th Edition Semen Analysis
  hasSemenReport: boolean;
  semenVolume: number;         // mL (WHO 6th Ed: >= 1.4 mL)
  semenConcentration: number;  // x10^6 / mL (WHO 6th Ed: >= 15.0 M/mL)
  semenMotility: number;       // % Total Motility PR + NP (WHO 6th Ed: >= 42.0%)
  semenMorphology: number;     // % Normal forms strict criteria (WHO 6th Ed: >= 4.0%)
}

export interface TriggeredRule {
  rule_id: string;
  category: 'EMERGENCY' | 'ANDROLOGY' | 'METABOLIC' | 'LIFESTYLE';
  severity: 'critical' | 'high' | 'moderate' | 'low';
  title_en: string;
  title_ar: string;
  rationale_en: string;
  rationale_ar: string;
  guideline_source: string;
  measured_value?: string | number;
  threshold_reference?: string;
}

export interface ClinicalEvaluationResult {
  triage_tier: TriageTier;
  action_code:
    | 'URGENT_ED_TORSION_PROTOCOL'
    | 'URGENT_UROLOGY_MASS_EVAL'
    | 'REFERRAL_MALE_FERTILITY_SPECIALIST'
    | 'REFERRAL_PCP_WORKUP'
    | 'SELF_GUIDED_OPTIMIZATION';
  circuit_breaker_triggered: boolean;
  circuit_breaker_type?: 'TORSION' | 'MASS';
  triggered_rules: TriggeredRule[];
  summary_en: string;
  summary_ar: string;
  audit_timestamp: string;
  algorithm_version: string;
  zero_pii_session_id: string;
}

export interface CareFacility {
  name_en: string;
  name_ar: string;
  area_en: string;
  area_ar: string;
  service_en: string;
  service_ar: string;
  phone: string;
  badge_en: string;
  badge_ar: string;
  emergency: boolean;
  locationUrl?: string;
}
