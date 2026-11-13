/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Multi-Label Bayesian Inference & Shannon Entropy Calculator:
 * - Plane A: 4 Life-Saving Escalations
 * - Plane B: 6 Independent Logistic Posteriors with strict Null ≠ Zero
 * - Joint Binary Shannon Entropy & Diagnostic Certainty %
 */

import {
  LongitudinalPatientRecord,
  DerivedSignalNode,
  BlindSpotSyndromeNode,
  LifeSafetyEscalationNode,
  DifferentialHypothesisNode,
  HypothesisEdgeEvidence,
} from '../../types/diagnosticGraph';
import {
  PLANE_A_ESCALATION_DEFINITIONS,
  PLANE_B_HYPOTHESIS_DEFINITIONS,
  EVIDENCE_EDGE_RULES,
  probabilityToLogOdds,
  logOddsToProbability,
  binaryEntropy,
} from './knowledgeBase';

/**
 * Evaluates Plane A: Life- & Organ-Saving Escalation Nodes.
 */
export function evaluateLifeSafetyEscalations(
  record: LongitudinalPatientRecord,
  signals: DerivedSignalNode[],
  syndromes: BlindSpotSyndromeNode[]
): LifeSafetyEscalationNode[] {
  const latest = record.encounters[record.encounters.length - 1];
  const escalations: LifeSafetyEscalationNode[] = [];

  if (!latest) return escalations;

  const signalMap = new Map<string, DerivedSignalNode>();
  for (const s of signals) {
    signalMap.set(s.id, s);
  }

  const tmscSignal = signalMap.get('SIG_TMSC');
  const tmscVelSignal = signalMap.get('SIG_TMSC_VELOCITY_DECAY');

  const fshVal = latest.endocrinePanel?.fshIuL ?? null;
  const lhVal = latest.endocrinePanel?.lhIuL ?? null;
  const prolactinVal = latest.endocrinePanel?.prolactinNgMl ?? null;
  const testVal = latest.endocrinePanel?.totalTestosteroneNgDl ?? null;
  const concVal = latest.semenLab?.concentrationMMl ?? null;

  // 1. ESC_OCCULT_PITUITARY_NEUROENDOCRINE
  const def1 = PLANE_A_ESCALATION_DEFINITIONS.ESC_OCCULT_PITUITARY_NEUROENDOCRINE;
  const hasLowCount = concVal !== null && concVal < 10.0;
  const hasLowT = testVal !== null && testVal < 260.0;
  const hasBluntedGonadotropins =
    fshVal !== null && lhVal !== null && fshVal <= 2.5 && lhVal <= 2.5;
  const hasHyperprolactinemia = prolactinVal !== null && prolactinVal > 20.0;

  const esc1Triggered = Boolean((hasLowCount && hasLowT && hasBluntedGonadotropins) || hasHyperprolactinemia);
  let esc1Prob = 0.02;
  if (esc1Triggered) {
    if (prolactinVal !== null && prolactinVal > 40.0) {
      esc1Prob = 0.94;
    } else if (hasHyperprolactinemia) {
      esc1Prob = 0.85;
    } else if (testVal !== null && testVal < 200.0) {
      esc1Prob = 0.80;
    } else {
      esc1Prob = 0.72;
    }
  }

  escalations.push({
    id: def1.id,
    titleEn: def1.titleEn,
    titleAr: def1.titleAr,
    triggered: esc1Triggered,
    probability: Number(esc1Prob.toFixed(3)),
    icd10Code: def1.icd10Code,
    snomedCode: def1.snomedCode,
    rationaleEn: def1.rationaleEn,
    rationaleAr: def1.rationaleAr,
    urgentActionEn: def1.urgentActionEn,
    urgentActionAr: def1.urgentActionAr,
    requiredStatLabs: def1.requiredStatLabs,
  });

  // 2. ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR
  const def2 = PLANE_A_ESCALATION_DEFINITIONS.ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR;
  const vitals = latest.vitals;
  const hasMetabolicLoad = vitals.hba1cPct >= 5.8 || vitals.bmi >= 28.0;
  const hasAutonomicOverload = vitals.restingHrBpm >= 82 || vitals.sleepHoursAvg < 5.8;
  const tmscVel = tmscVelSignal?.value as number | null;
  const tmscVal = tmscSignal?.value as number | null;
  const hasGonadalDecline =
    (tmscVel !== null && tmscVel < 0.0) ||
    (testVal !== null && testVal < 300.0) ||
    (tmscVal !== null && tmscVal < 20.0);

  const esc2Triggered = Boolean(hasMetabolicLoad && hasAutonomicOverload && hasGonadalDecline);
  const esc2Prob = esc2Triggered ? 0.84 : 0.04;

  escalations.push({
    id: def2.id,
    titleEn: def2.titleEn,
    titleAr: def2.titleAr,
    triggered: esc2Triggered,
    probability: Number(esc2Prob.toFixed(3)),
    icd10Code: def2.icd10Code,
    snomedCode: def2.snomedCode,
    rationaleEn: def2.rationaleEn,
    rationaleAr: def2.rationaleAr,
    urgentActionEn: def2.urgentActionEn,
    urgentActionAr: def2.urgentActionAr,
    requiredStatLabs: def2.requiredStatLabs,
  });

  // 3. ESC_GERM_CELL_NEOPLASIA_HIGH_RISK
  const def3 = PLANE_A_ESCALATION_DEFINITIONS.ESC_GERM_CELL_NEOPLASIA_HIGH_RISK;
  const flags = latest.clinicalFlags;
  const hasPainlessLump = flags.painlessTesticularMass === true;
  const hasCryptorchidOats =
    flags.cryptorchidismHistory === true && concVal !== null && concVal < 5.0;

  const esc3Triggered = Boolean(hasPainlessLump || hasCryptorchidOats);
  const esc3Prob = hasPainlessLump ? 0.95 : hasCryptorchidOats ? 0.68 : 0.02;

  escalations.push({
    id: def3.id,
    titleEn: def3.titleEn,
    titleAr: def3.titleAr,
    triggered: esc3Triggered,
    probability: Number(esc3Prob.toFixed(3)),
    icd10Code: def3.icd10Code,
    snomedCode: def3.snomedCode,
    rationaleEn: def3.rationaleEn,
    rationaleAr: def3.rationaleAr,
    urgentActionEn: def3.urgentActionEn,
    urgentActionAr: def3.urgentActionAr,
    requiredStatLabs: def3.requiredStatLabs,
  });

  // 4. ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS
  const def4 = PLANE_A_ESCALATION_DEFINITIONS.ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS;
  const hasAcutePain = flags.acuteScrotalPain === true;
  const hasRightVaricocele = flags.rightSidedNonReducibleVaricocele === true;

  const esc4Triggered = Boolean(hasAcutePain || hasRightVaricocele);
  const esc4Prob = hasAcutePain ? 0.98 : hasRightVaricocele ? 0.88 : 0.01;

  escalations.push({
    id: def4.id,
    titleEn: def4.titleEn,
    titleAr: def4.titleAr,
    triggered: esc4Triggered,
    probability: Number(esc4Prob.toFixed(3)),
    icd10Code: def4.icd10Code,
    snomedCode: def4.snomedCode,
    rationaleEn: def4.rationaleEn,
    rationaleAr: def4.rationaleAr,
    urgentActionEn: def4.urgentActionEn,
    urgentActionAr: def4.urgentActionAr,
    requiredStatLabs: def4.requiredStatLabs,
  });

  return escalations;
}

/**
 * Maps derived signal IDs to corresponding discriminating test orders when signal is NULL.
 */
function mapSignalToDiscriminator(signalId: string): string | null {
  if (
    signalId === 'SIG_HIGH_FSH' ||
    signalId === 'SIG_NORMAL_FSH' ||
    signalId === 'SIG_LOW_FSH_CONTRADICTION' ||
    signalId === 'SIG_HIGH_FSH_CONTRADICTION' ||
    signalId === 'SIG_FSH_LH_STATE'
  ) {
    return 'TEST_FSH_LH';
  }
  if (signalId === 'SIG_T_E2_RATIO' || signalId === 'SIG_TOTAL_TESTOSTERONE') {
    return 'TEST_TESTOSTERONE_ESTRADIOL';
  }
  if (signalId === 'SIG_PROLACTIN') {
    return 'TEST_PROLACTIN_PITUITARY';
  }
  if (signalId === 'SIG_LOW_SEMEN_VOLUME') {
    return 'TEST_SEMINAL_FRUCTOSE_OBSTRUCTION';
  }
  if (
    signalId === 'SIG_TMSC' ||
    signalId === 'SIG_TMSC_VELOCITY_DECAY' ||
    signalId === 'SIG_SEVERE_OLIGOZOOSPERMIA' ||
    signalId === 'SIG_MOTILITY_IMPAIRMENT' ||
    signalId === 'SIG_OATS_PATTERN'
  ) {
    return 'TEST_CONFIRMATORY_SEMEN_TMSC';
  }
  return null;
}

/**
 * Evaluates Plane B: 6 Competing Etiological Hypotheses using independent multi-label logistic posteriors.
 * Strictly enforces Null ≠ Zero (unmeasured signals contribute strictly 0 to log-odds).
 */
export function evaluateBayesianDifferential(
  record: LongitudinalPatientRecord,
  signals: DerivedSignalNode[],
  syndromes: BlindSpotSyndromeNode[]
): DifferentialHypothesisNode[] {
  const signalMap = new Map<string, DerivedSignalNode>();
  for (const s of signals) {
    signalMap.set(s.id, s);
  }

  const hypothesisResults: DifferentialHypothesisNode[] = [];

  for (const key of Object.keys(PLANE_B_HYPOTHESIS_DEFINITIONS)) {
    const def = PLANE_B_HYPOTHESIS_DEFINITIONS[key];
    const priorProb = def.priorProbability;
    const priorLogOdds = probabilityToLogOdds(priorProb);

    let currentLogOdds = priorLogOdds;
    const supportingEdges: HypothesisEdgeEvidence[] = [];
    const contradictingEdges: HypothesisEdgeEvidence[] = [];
    const nullDiscriminatorSet = new Set<string>();

    // Add declarative candidate null discriminators from static definition
    for (const d of def.nullDiscriminatorIds) {
      nullDiscriminatorSet.add(d);
    }

    // Process all evidence rules matching this hypothesis
    const matchingRules = EVIDENCE_EDGE_RULES.filter((r) => r.hypothesisId === def.id);

    for (const rule of matchingRules) {
      const signal = signalMap.get(rule.sourceSignalId);

      // Strict Null ≠ Zero Invariant
      if (!signal || signal.status === 'NULL' || signal.value === null) {
        const discTest = mapSignalToDiscriminator(rule.sourceSignalId);
        if (discTest) {
          nullDiscriminatorSet.add(discTest);
        }
        continue; // Contribution is strictly 0 (ln(1.0) = 0)
      }

      const weight = rule.weight ?? 1.0;

      // Check if evidence condition is active (ABNORMAL status or true boolean)
      const isConditionActive = signal.status === 'ABNORMAL' || signal.value === true;

      if (isConditionActive) {
        const lr = rule.lrPlus;
        const lnLr = Math.log(lr);
        const contribution = Number((weight * lnLr).toFixed(4));

        currentLogOdds += contribution;

        if (contribution > 0) {
          supportingEdges.push({
            sourceNodeId: rule.sourceSignalId,
            labelEn: rule.labelEn,
            logLikelihoodContribution: contribution,
          });
        } else if (contribution < 0) {
          contradictingEdges.push({
            sourceNodeId: rule.sourceSignalId,
            labelEn: rule.labelEn,
            logLikelihoodContribution: contribution,
          });
        }
      } else if (signal.status === 'NORMAL' || signal.value === false) {
        // Evidence is measured and explicitly normal/absent
        if (rule.lrMinus && rule.lrMinus !== 1.0) {
          const lr = rule.lrMinus;
          const lnLr = Math.log(lr);
          const contribution = Number((weight * lnLr).toFixed(4));

          currentLogOdds += contribution;

          if (contribution > 0) {
            supportingEdges.push({
              sourceNodeId: rule.sourceSignalId,
              labelEn: rule.labelEn,
              logLikelihoodContribution: contribution,
            });
          } else if (contribution < 0) {
            contradictingEdges.push({
              sourceNodeId: rule.sourceSignalId,
              labelEn: rule.labelEn,
              logLikelihoodContribution: contribution,
            });
          }
        }
      }
    }

    const posteriorProb = logOddsToProbability(currentLogOdds);

    hypothesisResults.push({
      id: def.id,
      codeIcd10: def.codeIcd10,
      codeSnomed: def.codeSnomed,
      category: def.category,
      titleEn: def.titleEn,
      titleAr: def.titleAr,
      priorProbability: priorProb,
      priorLogOdds: Number(priorLogOdds.toFixed(3)),
      posteriorLogOdds: Number(currentLogOdds.toFixed(3)),
      posteriorProbability: Number(posteriorProb.toFixed(3)),
      supportingEdges,
      contradictingEdges,
      nullDiscriminatorIds: Array.from(nullDiscriminatorSet),
    });
  }

  // Sort descending by posterior probability
  hypothesisResults.sort((a, b) => b.posteriorProbability - a.posteriorProbability);

  return hypothesisResults;
}

/**
 * Computes Joint Binary Shannon Entropy across the 6 etiological hypotheses in bits.
 * H_joint = sum(-p * log2(p) - (1 - p) * log2(1 - p))
 */
export function computeJointBinaryEntropy(hypotheses: DifferentialHypothesisNode[]): {
  jointEntropyBits: number;
  maxPossibleEntropyBits: number;
  diagnosticCertaintyPct: number;
} {
  let totalEntropy = 0;

  for (const h of hypotheses) {
    totalEntropy += binaryEntropy(h.posteriorProbability);
  }

  const maxPossible = 6.0; // 6 binary hypotheses with max entropy 1.0 bit each
  const jointEntropyBits = Number(totalEntropy.toFixed(3));

  // Diagnostic Certainty % (100% when entropy is 0, 0% when entropy reaches 6.0)
  const certainty = Math.max(
    0,
    Math.min(100, Math.round((1 - jointEntropyBits / maxPossible) * 100))
  );

  return {
    jointEntropyBits,
    maxPossibleEntropyBits: maxPossible,
    diagnosticCertaintyPct: certainty,
  };
}

