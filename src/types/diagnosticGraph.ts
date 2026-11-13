/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Closed-Loop Longitudinal Retrieval & Multi-Label Bayesian Differential Diagnosis Graph.
 * ZERO-PII ARCHITECTURE (ADR-1 v2): Identifiers are purely synthetic Malaffi tokens.
 * Compliant with WHO 6th Manual (2021), AUA/ASRM 2021, EAU 2024, and ADPHC IFHAS Screening Guidelines.
 */

export type ClinicalSetting =
  | 'ANDROLOGY_OUTPATIENT'
  | 'IFHAS_SCREENING'
  | 'PRIMARY_CARE'
  | 'DERMATOLOGY'
  | 'ENDOCRINOLOGY'
  | 'TELEMEDICINE'
  | 'EMERGENCY_DEPT';

export type MedicationClass = '5ARI' | 'TRT_ANDROGEN' | 'SSRI' | 'OTHER';

export interface LongitudinalMedication {
  name: string;
  class: MedicationClass;
  startDateIso: string;
}

export interface LongitudinalVitals {
  bmi: number;
  weightKg: number;
  restingHrBpm: number;
  sleepHoursAvg: number;
  hba1cPct: number;
}

export interface LongitudinalSemenLab {
  volumeMl: number;
  concentrationMMl: number;
  totalMotilityPct: number;
  normalMorphologyPct: number;
}

export interface LongitudinalEndocrinePanel {
  fshIuL: number;
  lhIuL: number;
  totalTestosteroneNgDl: number;
  estradiolPgMl: number;
  prolactinNgMl: number;
}

export interface LongitudinalClinicalFlags {
  acuteScrotalPain: boolean;
  painlessTesticularMass: boolean;
  varicoceleGrade: 0 | 1 | 2 | 3;
  rightSidedNonReducibleVaricocele?: boolean;
  cryptorchidismHistory: boolean;
  mumpsOrchitisHistory: boolean;
  sittingHoursPerDay: number;
  frequentThermalExposure: boolean;
  tobaccoUsage: 'none' | 'light' | 'heavy';
}

export interface LongitudinalEncounter {
  encounterId: string;
  dateIso: string;
  clinicalSetting: ClinicalSetting | string;
  vitals: LongitudinalVitals;
  semenLab: LongitudinalSemenLab | null;
  endocrinePanel: LongitudinalEndocrinePanel | null;
  medications: LongitudinalMedication[];
  clinicalFlags: LongitudinalClinicalFlags;
}

export interface LongitudinalPatientRecord {
  patientId: string;
  pseudonymToken: string;
  age: number;
  ifhasBracket: '18-35' | '36-50' | '51-75';
  primaryComplaintEn: string;
  primaryComplaintAr: string;
  encounters: LongitudinalEncounter[];
}

export type SignalDomain =
  | 'SPERMATOGENIC'
  | 'ENDOCRINE'
  | 'CARDIOMETABOLIC'
  | 'EXPOSURE'
  | 'TEMPORAL';

export type SignalStatus = 'NORMAL' | 'ABNORMAL' | 'BORDERLINE' | 'NULL';

export interface DerivedSignalNode {
  id: string;
  domain: SignalDomain;
  labelEn: string;
  labelAr: string;
  value: number | string | boolean | null;
  unit: string;
  status: SignalStatus;
  referenceRange: string;
  loincCode?: string;
}

export interface BlindSpotSyndromeNode {
  id: string;
  titleEn: string;
  titleAr: string;
  triggered: boolean;
  severity: 'LIFE_SAVING' | 'HIGH' | 'MODERATE';
  parentSignalIds: string[];
  whatTechSeesEn: string;
  whatTechSeesAr: string;
  whatGraphCatchesEn: string;
  whatGraphCatchesAr: string;
}

export interface LifeSafetyEscalationNode {
  id: string;
  titleEn: string;
  titleAr: string;
  triggered: boolean;
  probability: number;
  icd10Code: string;
  snomedCode: string;
  rationaleEn: string;
  rationaleAr: string;
  urgentActionEn: string;
  urgentActionAr: string;
  requiredStatLabs: string[];
}

export interface HypothesisEdgeEvidence {
  sourceNodeId: string;
  labelEn: string;
  logLikelihoodContribution: number;
}

export type DifferentialCategory =
  | 'PRE_TESTICULAR'
  | 'TESTICULAR'
  | 'POST_TESTICULAR'
  | 'IATROGENIC'
  | 'METABOLIC';

export interface DifferentialHypothesisNode {
  id: string;
  codeIcd10: string;
  codeSnomed: string;
  category: DifferentialCategory;
  titleEn: string;
  titleAr: string;
  priorProbability: number;
  priorLogOdds: number;
  posteriorLogOdds: number;
  posteriorProbability: number;
  supportingEdges: HypothesisEdgeEvidence[];
  contradictingEdges: HypothesisEdgeEvidence[];
  nullDiscriminatorIds: string[];
}

export type TargetBiomarkerKey =
  | 'fshIuL'
  | 'lhIuL'
  | 'totalTestosteroneNgDl'
  | 'estradiolPgMl'
  | 'prolactinNgMl'
  | 'semenPanel'
  | 'scrotalDoppler';

export interface DiscriminatingTestOrder {
  testId: string;
  loincCode: string;
  nameEn: string;
  nameAr: string;
  targetBiomarkerKey: TargetBiomarkerKey;
  isCurrentlyNull: boolean;
  expectedInformationGainBits: number;
  separatesHypotheses: string[];
  simulatedIfAbnormal: {
    valuePreview: number;
    labelEn: string;
    projectedEntropyBits: number;
    topHypothesisShiftEn: string;
  };
  simulatedIfNormal: {
    valuePreview: number;
    labelEn: string;
    projectedEntropyBits: number;
  };
}

export type GraphLoopStatus =
  | 'CONVERGED'
  | 'AWAITING_DISCRIMINATOR_LOOP'
  | 'LIFE_SAFETY_ESCALATION';

export interface ClosedLoopGraphEvaluation {
  patientId: string;
  encounterCount: number;
  evaluatedAtIso: string;
  algorithmVersion: string;
  signals: DerivedSignalNode[];
  blindSpotSyndromes: BlindSpotSyndromeNode[];
  lifeSafetyEscalations: LifeSafetyEscalationNode[];
  differentialRanking: DifferentialHypothesisNode[];
  jointEntropyBits: number;
  maxPossibleEntropyBits: number;
  diagnosticCertaintyPct: number;
  loopStatus: GraphLoopStatus;
  rankedNextTests: DiscriminatingTestOrder[];
}

