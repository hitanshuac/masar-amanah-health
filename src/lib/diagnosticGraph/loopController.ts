/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Active Loop Controller:
 * - Runs the 5-Stage Diagnostic Pipeline
 * - Active Learning Information Gain Ranking: Shadow-simulates candidate NULL tests
 * - Closed-Loop Mutation: Resolves NULL biomarkers and measures real entropy convergence (ΔH bits)
 */

import {
  LongitudinalPatientRecord,
  LongitudinalEncounter,
  ClosedLoopGraphEvaluation,
  DiscriminatingTestOrder,
  GraphLoopStatus,
  TargetBiomarkerKey,
} from '../../types/diagnosticGraph';
import { extractTemporalSignalsAndSyndromes } from './temporalExtractor';
import {
  evaluateLifeSafetyEscalations,
  evaluateBayesianDifferential,
  computeJointBinaryEntropy,
} from './bayesianInference';
import { DISCRIMINATING_TEST_TEMPLATES } from './knowledgeBase';

/**
 * Deep clones a LongitudinalPatientRecord to ensure zero mutation of input state.
 */
function clonePatientRecord(record: LongitudinalPatientRecord): LongitudinalPatientRecord {
  return JSON.parse(JSON.stringify(record));
}

/**
 * Shadow-simulates a candidate test outcome and returns the projected joint entropy in bits.
 */
function shadowSimulateTestOutcome(
  baseRecord: LongitudinalPatientRecord,
  testId: string,
  outcome: 'ABNORMAL' | 'NORMAL'
): number {
  const cloned = clonePatientRecord(baseRecord);
  const latest = cloned.encounters[cloned.encounters.length - 1];
  if (!latest) return 6.0;

  if (testId === 'TEST_FSH_LH') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: outcome === 'ABNORMAL' ? 16.5 : 4.5,
        lhIuL: outcome === 'ABNORMAL' ? 8.5 : 4.0,
        totalTestosteroneNgDl: 320,
        estradiolPgMl: 25,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.fshIuL = outcome === 'ABNORMAL' ? 16.5 : 4.5;
      latest.endocrinePanel.lhIuL = outcome === 'ABNORMAL' ? 8.5 : 4.0;
    }
  } else if (testId === 'TEST_TESTOSTERONE_ESTRADIOL') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: 3.5,
        totalTestosteroneNgDl: outcome === 'ABNORMAL' ? 240 : 450,
        estradiolPgMl: outcome === 'ABNORMAL' ? 48.0 : 22.0,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.totalTestosteroneNgDl = outcome === 'ABNORMAL' ? 240 : 450;
      latest.endocrinePanel.estradiolPgMl = outcome === 'ABNORMAL' ? 48.0 : 22.0;
    }
  } else if (testId === 'TEST_PROLACTIN_PITUITARY') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: 3.5,
        totalTestosteroneNgDl: 320,
        estradiolPgMl: 25,
        prolactinNgMl: outcome === 'ABNORMAL' ? 68.0 : 9.5,
      };
    } else {
      latest.endocrinePanel.prolactinNgMl = outcome === 'ABNORMAL' ? 68.0 : 9.5;
    }
  } else if (testId === 'TEST_SEMINAL_FRUCTOSE_OBSTRUCTION') {
    if (!latest.semenLab) {
      latest.semenLab = {
        volumeMl: outcome === 'ABNORMAL' ? 0.8 : 2.5,
        concentrationMMl: outcome === 'ABNORMAL' ? 0.0 : 28.0,
        totalMotilityPct: outcome === 'ABNORMAL' ? 0 : 52,
        normalMorphologyPct: outcome === 'ABNORMAL' ? 0 : 5,
      };
    } else {
      latest.semenLab.volumeMl = outcome === 'ABNORMAL' ? 0.8 : 2.5;
    }
  } else if (testId === 'TEST_CONFIRMATORY_SEMEN_TMSC') {
    if (!latest.semenLab) {
      latest.semenLab = {
        volumeMl: outcome === 'ABNORMAL' ? 1.2 : 2.8,
        concentrationMMl: outcome === 'ABNORMAL' ? 8.0 : 32.0,
        totalMotilityPct: outcome === 'ABNORMAL' ? 30 : 55,
        normalMorphologyPct: outcome === 'ABNORMAL' ? 2 : 5,
      };
    } else {
      latest.semenLab.concentrationMMl = outcome === 'ABNORMAL' ? 8.0 : 32.0;
      latest.semenLab.totalMotilityPct = outcome === 'ABNORMAL' ? 30 : 55;
    }
  }

  const { signals: simSignals, blindSpotSyndromes: simSyndromes } =
    extractTemporalSignalsAndSyndromes(cloned);
  const simHypotheses = evaluateBayesianDifferential(cloned, simSignals, simSyndromes);
  const { jointEntropyBits } = computeJointBinaryEntropy(simHypotheses);
  return jointEntropyBits;
}

/**
 * Checks whether a candidate test order is currently NULL in the patient's latest encounter.
 */
function isTestCurrentlyNull(latest: LongitudinalPatientRecord['encounters'][0], targetKey: TargetBiomarkerKey): boolean {
  if (!latest) return true;

  if (targetKey === 'fshIuL') {
    return latest.endocrinePanel === null || latest.endocrinePanel.fshIuL === null || latest.endocrinePanel.fshIuL === undefined;
  }
  if (targetKey === 'lhIuL') {
    return latest.endocrinePanel === null || latest.endocrinePanel.lhIuL === null || latest.endocrinePanel.lhIuL === undefined;
  }
  if (targetKey === 'totalTestosteroneNgDl') {
    return latest.endocrinePanel === null || latest.endocrinePanel.totalTestosteroneNgDl === null;
  }
  if (targetKey === 'estradiolPgMl') {
    return latest.endocrinePanel === null || latest.endocrinePanel.estradiolPgMl === null;
  }
  if (targetKey === 'prolactinNgMl') {
    return latest.endocrinePanel === null || latest.endocrinePanel.prolactinNgMl === null;
  }
  if (targetKey === 'semenPanel') {
    return latest.semenLab === null;
  }
  if (targetKey === 'scrotalDoppler') {
    return false;
  }
  return false;
}

/**
 * Evaluates the full patient knowledge graph and computes Shannon Information Gain for all candidate NULL tests.
 */
export function evaluatePatientGraph(record: LongitudinalPatientRecord): ClosedLoopGraphEvaluation {
  const latest = record.encounters[record.encounters.length - 1];

  // Stage 2: Temporal Signals and Blind-Spot Syndromes
  const { signals, blindSpotSyndromes } = extractTemporalSignalsAndSyndromes(record);

  // Stage 3 & 4: Plane A Life Safety Escalations & Plane B Bayesian Differential Posteriors
  const lifeSafetyEscalations = evaluateLifeSafetyEscalations(record, signals, blindSpotSyndromes);
  const differentialRanking = evaluateBayesianDifferential(record, signals, blindSpotSyndromes);

  // Stage 5: Joint Shannon Entropy
  const { jointEntropyBits, maxPossibleEntropyBits, diagnosticCertaintyPct } =
    computeJointBinaryEntropy(differentialRanking);

  // Determine Closed-Loop Status
  let loopStatus: GraphLoopStatus = 'AWAITING_DISCRIMINATOR_LOOP';
  if (lifeSafetyEscalations.some((e) => e.triggered)) {
    loopStatus = 'LIFE_SAFETY_ESCALATION';
  } else if (diagnosticCertaintyPct >= 80) {
    loopStatus = 'CONVERGED';
  }

  // Active Learning Loop: Simulate Information Gain for all Candidate Tests
  const rankedNextTests: DiscriminatingTestOrder[] = [];

  for (const key of Object.keys(DISCRIMINATING_TEST_TEMPLATES)) {
    const tmpl = DISCRIMINATING_TEST_TEMPLATES[key];
    const isNull = latest ? isTestCurrentlyNull(latest, tmpl.targetBiomarkerKey) : true;

    if (isNull) {
      const projEntropyAbnormal = shadowSimulateTestOutcome(record, tmpl.testId, 'ABNORMAL');
      const projEntropyNormal = shadowSimulateTestOutcome(record, tmpl.testId, 'NORMAL');

      // Expected entropy reduction: IG(D; X_u | E_t) = H_current - E[H_projected]
      const expectedConditionalEntropy = 0.5 * projEntropyAbnormal + 0.5 * projEntropyNormal;
      const rawGain = jointEntropyBits - expectedConditionalEntropy;
      const expectedInformationGainBits = Number(Math.max(0.05, rawGain).toFixed(3));

      rankedNextTests.push({
        testId: tmpl.testId,
        loincCode: tmpl.loincCode,
        nameEn: tmpl.nameEn,
        nameAr: tmpl.nameAr,
        targetBiomarkerKey: tmpl.targetBiomarkerKey,
        isCurrentlyNull: true,
        expectedInformationGainBits,
        separatesHypotheses: tmpl.separatesHypotheses,
        simulatedIfAbnormal: {
          valuePreview: tmpl.defaultSimulatedIfAbnormal.valuePreview,
          labelEn: tmpl.defaultSimulatedIfAbnormal.labelEn,
          projectedEntropyBits: Number(projEntropyAbnormal.toFixed(3)),
          topHypothesisShiftEn: tmpl.defaultSimulatedIfAbnormal.topHypothesisShiftEn,
        },
        simulatedIfNormal: {
          valuePreview: tmpl.defaultSimulatedIfNormal.valuePreview,
          labelEn: tmpl.defaultSimulatedIfNormal.labelEn,
          projectedEntropyBits: Number(projEntropyNormal.toFixed(3)),
        },
      });
    } else {
      rankedNextTests.push({
        testId: tmpl.testId,
        loincCode: tmpl.loincCode,
        nameEn: tmpl.nameEn,
        nameAr: tmpl.nameAr,
        targetBiomarkerKey: tmpl.targetBiomarkerKey,
        isCurrentlyNull: false,
        expectedInformationGainBits: 0.0,
        separatesHypotheses: tmpl.separatesHypotheses,
        simulatedIfAbnormal: {
          valuePreview: tmpl.defaultSimulatedIfAbnormal.valuePreview,
          labelEn: tmpl.defaultSimulatedIfAbnormal.labelEn,
          projectedEntropyBits: jointEntropyBits,
          topHypothesisShiftEn: tmpl.defaultSimulatedIfAbnormal.topHypothesisShiftEn,
        },
        simulatedIfNormal: {
          valuePreview: tmpl.defaultSimulatedIfNormal.valuePreview,
          labelEn: tmpl.defaultSimulatedIfNormal.labelEn,
          projectedEntropyBits: jointEntropyBits,
        },
      });
    }
  }

  // Sort tests by expectedInformationGainBits descending
  rankedNextTests.sort((a, b) => b.expectedInformationGainBits - a.expectedInformationGainBits);

  if (loopStatus !== 'LIFE_SAFETY_ESCALATION' && rankedNextTests.every((t) => !t.isCurrentlyNull)) {
    loopStatus = 'CONVERGED';
  }

  return {
    patientId: record.patientId,
    encounterCount: record.encounters.length,
    evaluatedAtIso: new Date().toISOString(),
    algorithmVersion: 'v2.0-BAYESIAN-DAG-WHO6-AUA-UAE',
    signals,
    blindSpotSyndromes,
    lifeSafetyEscalations,
    differentialRanking,
    jointEntropyBits,
    maxPossibleEntropyBits,
    diagnosticCertaintyPct,
    loopStatus,
    rankedNextTests,
  };
}

/**
 * Resolves a NULL biomarker test in-loop:
 * Injects the measured value into the latest encounter and measures live entropy convergence.
 */
export function resolveNullBiomarkerInLoop(
  record: LongitudinalPatientRecord,
  biomarkerKey: string,
  measuredValue: number
): {
  updatedRecord: LongitudinalPatientRecord;
  previousEvaluation: ClosedLoopGraphEvaluation;
  newEvaluation: ClosedLoopGraphEvaluation;
  entropyDeltaBits: number;
} {
  const previousEvaluation = evaluatePatientGraph(record);
  const updatedRecord = clonePatientRecord(record);

  const latest = updatedRecord.encounters[updatedRecord.encounters.length - 1];
  if (!latest) {
    throw new Error('Cannot resolve biomarker on patient record with zero encounters');
  }

  if (biomarkerKey === 'fshIuL') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: measuredValue,
        lhIuL: 3.5,
        totalTestosteroneNgDl: 350,
        estradiolPgMl: 25,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.fshIuL = measuredValue;
    }
  } else if (biomarkerKey === 'lhIuL') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: measuredValue,
        totalTestosteroneNgDl: 350,
        estradiolPgMl: 25,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.lhIuL = measuredValue;
    }
  } else if (biomarkerKey === 'totalTestosteroneNgDl') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: 3.5,
        totalTestosteroneNgDl: measuredValue,
        estradiolPgMl: 25,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.totalTestosteroneNgDl = measuredValue;
    }
  } else if (biomarkerKey === 'estradiolPgMl') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: 3.5,
        totalTestosteroneNgDl: 350,
        estradiolPgMl: measuredValue,
        prolactinNgMl: 10,
      };
    } else {
      latest.endocrinePanel.estradiolPgMl = measuredValue;
    }
  } else if (biomarkerKey === 'prolactinNgMl') {
    if (!latest.endocrinePanel) {
      latest.endocrinePanel = {
        fshIuL: 4.0,
        lhIuL: 3.5,
        totalTestosteroneNgDl: 350,
        estradiolPgMl: 25,
        prolactinNgMl: measuredValue,
      };
    } else {
      latest.endocrinePanel.prolactinNgMl = measuredValue;
    }
  } else if (biomarkerKey === 'concentrationMMl' || biomarkerKey === 'semenPanel') {
    if (!latest.semenLab) {
      latest.semenLab = {
        volumeMl: 2.0,
        concentrationMMl: measuredValue,
        totalMotilityPct: 45,
        normalMorphologyPct: 4,
      };
    } else {
      latest.semenLab.concentrationMMl = measuredValue;
    }
  } else if (biomarkerKey === 'volumeMl') {
    if (!latest.semenLab) {
      latest.semenLab = {
        volumeMl: measuredValue,
        concentrationMMl: 20.0,
        totalMotilityPct: 45,
        normalMorphologyPct: 4,
      };
    } else {
      latest.semenLab.volumeMl = measuredValue;
    }
  }

  const newEvaluation = evaluatePatientGraph(updatedRecord);
  const entropyDeltaBits = Number(
    (newEvaluation.jointEntropyBits - previousEvaluation.jointEntropyBits).toFixed(3)
  );

  return {
    updatedRecord,
    previousEvaluation,
    newEvaluation,
    entropyDeltaBits,
  };
}

/**
 * 32-bit FNV-1a non-cryptographic deterministic hash helper.
 * Returns an 8-character zero-padded lowercase hexadecimal string.
 */
function fnv1a32Hex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Computes deterministic 32-bit FNV-1a hex signatures for:
 * 1. Serialized encounter biomarkers across all sequential encounters (inputHash)
 * 2. The 6 posterior probabilities + joint entropy (outputHash)
 *
 * Proves on screen that identical patient inputs always yield identical mathematical outputs
 * with zero caching or hidden state.
 */
export function computeDeterministicGraphSignature(
  record: LongitudinalPatientRecord,
  evaluation: ClosedLoopGraphEvaluation
): { inputHash: string; outputHash: string } {
  // Deterministic serialization of all encounters and biomarkers
  const serializedEncounters = record.encounters.map((enc) => ({
    id: enc.encounterId,
    date: enc.dateIso,
    setting: enc.clinicalSetting,
    vitals: {
      bmi: enc.vitals.bmi,
      weightKg: enc.vitals.weightKg,
      restingHrBpm: enc.vitals.restingHrBpm,
      sleepHoursAvg: enc.vitals.sleepHoursAvg,
      hba1cPct: enc.vitals.hba1cPct,
    },
    semen: enc.semenLab
      ? {
          v: enc.semenLab.volumeMl,
          c: enc.semenLab.concentrationMMl,
          m: enc.semenLab.totalMotilityPct,
          morph: enc.semenLab.normalMorphologyPct,
        }
      : null,
    endocrine: enc.endocrinePanel
      ? {
          fsh: enc.endocrinePanel.fshIuL,
          lh: enc.endocrinePanel.lhIuL,
          t: enc.endocrinePanel.totalTestosteroneNgDl,
          e2: enc.endocrinePanel.estradiolPgMl,
          prl: enc.endocrinePanel.prolactinNgMl,
        }
      : null,
    meds: (enc.medications || [])
      .map((m) => ({ n: m.name, c: m.class, s: m.startDateIso }))
      .sort((a, b) => a.n.localeCompare(b.n)),
    flags: {
      pain: enc.clinicalFlags.acuteScrotalPain,
      mass: enc.clinicalFlags.painlessTesticularMass,
      varicocele: enc.clinicalFlags.varicoceleGrade,
      rightVaricocele: enc.clinicalFlags.rightSidedNonReducibleVaricocele ?? false,
      crypt: enc.clinicalFlags.cryptorchidismHistory,
      mumps: enc.clinicalFlags.mumpsOrchitisHistory,
      sit: enc.clinicalFlags.sittingHoursPerDay,
      heat: enc.clinicalFlags.frequentThermalExposure,
      tobacco: enc.clinicalFlags.tobaccoUsage,
    },
  }));

  const inputPayload = JSON.stringify({
    patientId: record.patientId,
    encountersCount: record.encounters.length,
    encounters: serializedEncounters,
  });

  // Deterministic serialization of the 6 Bayesian posterior probabilities and joint entropy
  const posteriors = [...evaluation.differentialRanking]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((h) => ({
      id: h.id,
      p: Number(h.posteriorProbability.toFixed(5)),
      odds: Number(h.posteriorLogOdds.toFixed(4)),
    }));

  const outputPayload = JSON.stringify({
    entropy: Number(evaluation.jointEntropyBits.toFixed(4)),
    posteriors,
  });

  return {
    inputHash: fnv1a32Hex(inputPayload),
    outputHash: fnv1a32Hex(outputPayload),
  };
}

export interface EncounterMutationPatch {
  vitals?: Partial<LongitudinalEncounter['vitals']>;
  semenLab?: LongitudinalEncounter['semenLab'];
  endocrinePanel?: LongitudinalEncounter['endocrinePanel'];
  toggle5Ari?: boolean;
  toggleTrt?: boolean;
  varicoceleGrade?: 0 | 1 | 2 | 3;
  cryptorchidismHistory?: boolean;
  acuteScrotalPain?: boolean;
}

/**
 * Mutates a patient record in the closed diagnostic loop:
 * - In 'UPDATE_LATEST' mode: merges the biomarker patch into the latest encounter (t_k).
 * - In 'APPEND_FOLLOWUP_90D' mode: clones the latest encounter into a new follow-up encounter (t_{k+1})
 *   dated +90 days later, merges the patch, and appends it to the trajectory.
 * Re-evaluates the full Bayesian DAG with zero caching and returns the mathematical entropy shift and signatures.
 */
export function mutatePatientEncounterInLoop(
  record: LongitudinalPatientRecord,
  mode: 'UPDATE_LATEST' | 'APPEND_FOLLOWUP_90D',
  patch: EncounterMutationPatch
): {
  updatedRecord: LongitudinalPatientRecord;
  previousEvaluation: ClosedLoopGraphEvaluation;
  newEvaluation: ClosedLoopGraphEvaluation;
  entropyDeltaBits: number;
  signatures: { inputHash: string; outputHash: string };
} {
  const previousEvaluation = evaluatePatientGraph(record);
  const updatedRecord = clonePatientRecord(record);

  if (updatedRecord.encounters.length === 0) {
    throw new Error('Cannot mutate patient record with zero encounters');
  }

  let targetEncounter: LongitudinalEncounter;

  if (mode === 'UPDATE_LATEST') {
    targetEncounter = updatedRecord.encounters[updatedRecord.encounters.length - 1];
  } else {
    // APPEND_FOLLOWUP_90D: clone latest encounter and advance date by exactly 90 days
    const latest = updatedRecord.encounters[updatedRecord.encounters.length - 1];
    const latestDate = new Date(latest.dateIso);
    const followUpDate = new Date(latestDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    const followUp: LongitudinalEncounter = JSON.parse(JSON.stringify(latest));
    followUp.encounterId = `ENC-${record.patientId}-${updatedRecord.encounters.length + 1}`;
    followUp.dateIso = followUpDate.toISOString();
    followUp.clinicalSetting = 'ANDROLOGY_OUTPATIENT';

    updatedRecord.encounters.push(followUp);
    targetEncounter = followUp;
  }

  // Apply vitals patch
  if (patch.vitals) {
    targetEncounter.vitals = {
      ...targetEncounter.vitals,
      ...patch.vitals,
    };
  }

  // Apply semen lab patch
  if (patch.semenLab !== undefined) {
    targetEncounter.semenLab = patch.semenLab ? { ...patch.semenLab } : null;
  }

  // Apply endocrine panel patch
  if (patch.endocrinePanel !== undefined) {
    targetEncounter.endocrinePanel = patch.endocrinePanel ? { ...patch.endocrinePanel } : null;
  }

  // Apply clinical flag patches
  if (patch.varicoceleGrade !== undefined) {
    targetEncounter.clinicalFlags.varicoceleGrade = patch.varicoceleGrade;
  }

  if (patch.cryptorchidismHistory !== undefined) {
    targetEncounter.clinicalFlags.cryptorchidismHistory = patch.cryptorchidismHistory;
  }

  if (patch.acuteScrotalPain !== undefined) {
    targetEncounter.clinicalFlags.acuteScrotalPain = patch.acuteScrotalPain;
  }

  // 5-ARI Finasteride medication toggle
  if (patch.toggle5Ari !== undefined) {
    if (patch.toggle5Ari) {
      const targetTime = new Date(targetEncounter.dateIso).getTime();
      const startTime = new Date(targetTime - 90 * 24 * 60 * 60 * 1000).toISOString();
      const existing = targetEncounter.medications.find((m) => m.class === '5ARI');
      if (existing) {
        existing.startDateIso = startTime;
      } else {
        targetEncounter.medications.push({
          name: 'Finasteride 1mg/day',
          class: '5ARI',
          startDateIso: startTime,
        });
      }
    } else {
      // Remove 5ARI from all encounters to clear delayed exposure
      for (const enc of updatedRecord.encounters) {
        enc.medications = enc.medications.filter((m) => m.class !== '5ARI');
      }
    }
  }

  // TRT Androgen medication toggle
  if (patch.toggleTrt !== undefined) {
    if (patch.toggleTrt) {
      const targetTime = new Date(targetEncounter.dateIso).getTime();
      const startTime = new Date(targetTime - 90 * 24 * 60 * 60 * 1000).toISOString();
      const existing = targetEncounter.medications.find((m) => m.class === 'TRT_ANDROGEN');
      if (existing) {
        existing.startDateIso = startTime;
      } else {
        targetEncounter.medications.push({
          name: 'Exogenous TRT Enanthate 200mg/wk',
          class: 'TRT_ANDROGEN',
          startDateIso: startTime,
        });
      }
    } else {
      // Remove TRT from all encounters to clear delayed exposure
      for (const enc of updatedRecord.encounters) {
        enc.medications = enc.medications.filter((m) => m.class !== 'TRT_ANDROGEN');
      }
    }
  }

  const newEvaluation = evaluatePatientGraph(updatedRecord);
  const entropyDeltaBits = Number(
    (newEvaluation.jointEntropyBits - previousEvaluation.jointEntropyBits).toFixed(3)
  );
  const signatures = computeDeterministicGraphSignature(updatedRecord, newEvaluation);

  return {
    updatedRecord,
    previousEvaluation,
    newEvaluation,
    entropyDeltaBits,
    signatures,
  };
}

export { mapLongitudinalPatientToScreeningInput } from './patientMapper';


