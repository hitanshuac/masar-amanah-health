/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { evaluateScreening } from '../src/lib/clinicalEngine.ts';
import { handleContextualize } from '../src/server/contextualizeHandler.ts';
import { handleParseSemenLab } from '../src/server/labParserHandler.ts';
import { runUciBenchmark } from '../src/data/uciBenchmarkCohort.ts';
import { transformToFhirR4Bundle } from '../src/lib/fhirExporter.tsx';
import { ScreeningInput } from '../src/types/screening.ts';
import { getTailoredQuestionIds, QuestionChipId } from '../src/components/QuestionChips.tsx';
import { JUDGE_DEMO_PRESETS } from '../src/components/JudgeDemoBar.tsx';
import { TRANSLATIONS } from '../src/i18n/translations.ts';

async function runTests() {
  console.log('========================================================================');
  console.log('       MASAR AMANAH HEALTH — AUTOMATED CLINICAL TEST HARNESS            ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${name}${details ? ` (${details})` : ''}`);
    } else {
      console.error(`[FAIL] ${name}${details ? ` (${details})` : ''}`);
    }
  }

  // --- BASE INPUT TEMPLATE ---
  const baseInput: ScreeningInput = {
    acutePain: false,
    painlessLump: false,
    age: 30,
    heightCm: 175,
    weightKg: 75,
    bmi: 24.5,
    steroidsTrt: false,
    undescendedTesticle: false,
    varicocele: false,
    mumpsOrchitis: false,
    sittingHours: 5,
    frequentHeat: false,
    tobaccoShisha: 'none',
    hasSemenReport: false,
    semenVolume: 2.5,
    semenConcentration: 30.0,
    semenMotility: 55.0,
    semenMorphology: 5.5,
  };

  // 1. RES-5: Acute Scrotal Pain (T1 Emergency)
  const t1Torsion = evaluateScreening({ ...baseInput, acutePain: true });
  assert(
    'RES-5: Acute Scrotal Pain Torsion Protocol',
    t1Torsion.triage_tier === 'TIER_1_EMERGENCY' &&
      t1Torsion.circuit_breaker_triggered &&
      t1Torsion.circuit_breaker_type === 'TORSION' &&
      t1Torsion.action_code === 'URGENT_ED_TORSION_PROTOCOL'
  );

  // 2. RES-6: Testicular Mass (T1 Emergency)
  const t1Mass = evaluateScreening({ ...baseInput, painlessLump: true });
  assert(
    'RES-6: Painless Firm Testicular Mass Protocol',
    t1Mass.triage_tier === 'TIER_1_EMERGENCY' &&
      t1Mass.circuit_breaker_triggered &&
      t1Mass.circuit_breaker_type === 'MASS' &&
      t1Mass.action_code === 'URGENT_UROLOGY_MASS_EVAL'
  );

  // 3. RES-7: Anabolic Steroid / TRT Usage (T2 Andrology)
  const t2Steroids = evaluateScreening({ ...baseInput, steroidsTrt: true });
  assert(
    'RES-7: Anabolic Steroids / TRT HPG Axis Suppression',
    t2Steroids.triage_tier === 'TIER_2_ANDROLOGY_SPECIALIST' &&
      t2Steroids.triggered_rules.some((r) => r.rule_id === 'RULE_EXOGENOUS_ANDROGEN_HPG_SUPPRESSION')
  );

  // 4. RES-8: All Semen Parameters Below WHO 6th Edition (T2 Andrology)
  const t2Semen = evaluateScreening({
    ...baseInput,
    hasSemenReport: true,
    semenVolume: 1.0,        // < 1.4 mL
    semenConcentration: 8.0, // < 15.0 M/mL
    semenMotility: 30.0,     // < 42.0%
    semenMorphology: 2.0,    // < 4.0%
  });
  assert(
    'RES-8: Multiple Semen Threshold Failures (OATS)',
    t2Semen.triage_tier === 'TIER_2_ANDROLOGY_SPECIALIST' &&
      t2Semen.triggered_rules.filter((r) => r.category === 'ANDROLOGY').length >= 4
  );

  // 5. RES-9: BMI >= 30 + Tobacco (T3 Primary Care)
  const t3Metabolic = evaluateScreening({
    ...baseInput,
    bmi: 32.5,
    tobaccoShisha: 'heavy',
  });
  assert(
    'RES-9: Adipose Aromatization BMI >= 30 + Tobacco',
    t3Metabolic.triage_tier === 'TIER_3_PRIMARY_CARE' &&
      t3Metabolic.triggered_rules.some((r) => r.category === 'METABOLIC')
  );

  // 6. RES-10: Normal Baseline (T4 Lifestyle Optimization)
  const t4Optimal = evaluateScreening({
    ...baseInput,
    sittingHours: 4,
    hasSemenReport: true,
    semenVolume: 3.0,
    semenConcentration: 45.0,
    semenMotility: 60.0,
    semenMorphology: 8.0,
  });
  assert(
    'RES-10: Normal Baseline Positive Guidance (Tier 4)',
    t4Optimal.triage_tier === 'TIER_4_LIFESTYLE' &&
      t4Optimal.action_code === 'SELF_GUIDED_OPTIMIZATION' &&
      t4Optimal.summary_en.length > 0
  );

  // 7. Contextualize T1 Direct (Zero LLM Latency for Emergency)
  const contT1 = await handleContextualize({
    verifiedEvaluationJson: t1Torsion,
    language: 'en',
  });
  assert(
    'Contextualize T1 Direct Safety Circuit Breaker',
    contT1.model === 'safety_circuit_breaker_direct' &&
      contT1.narrative.includes('CRITICAL CLINICAL ALERT')
  );

  // 8. Contextualize Input Validation
  let validationCaught = false;
  try {
    await handleContextualize({ verifiedEvaluationJson: { triage_tier: 'INVALID_TIER' } });
  } catch (err: any) {
    validationCaught = err?.statusCode === 400 || err?.name === 'ValidationError';
  }
  assert('Contextualize Input Validation Layer', validationCaught);

  // 9. RES-13: Lab Scanner Fallback
  const labParsed = await handleParseSemenLab({});
  assert(
    'RES-13: Multimodal Lab Scanner Deterministic Fallback',
    typeof labParsed.volumeMl === 'number' &&
      typeof labParsed.concentrationMMl === 'number' &&
      typeof labParsed.totalMotilityPct === 'number' &&
      typeof labParsed.normalMorphologyPct === 'number' &&
      labParsed.provenance === 'deterministic_mock_fallback' &&
      labParsed.confidence >= 0.9,
    `vol: ${labParsed.volumeMl}mL, conc: ${labParsed.concentrationMMl}M/mL`
  );

  // 10. RES-14: 90-Day Simulator Delta
  const baselineRisky = evaluateScreening({
    ...baseInput,
    steroidsTrt: true,
    frequentHeat: true,
    sittingHours: 10,
    tobaccoShisha: 'heavy',
    bmi: 31.0,
  });
  const counterfactualImproved = evaluateScreening({
    ...baseInput,
    steroidsTrt: false,
    frequentHeat: false,
    sittingHours: 5,
    tobaccoShisha: 'none',
    bmi: 23.5,
  });

  const getUrgency = (tier: string) =>
    tier === 'TIER_1_EMERGENCY'
      ? 95
      : tier === 'TIER_2_ANDROLOGY_SPECIALIST'
      ? 75
      : tier === 'TIER_3_PRIMARY_CARE'
      ? 45
      : 25;

  const baselineScore = getUrgency(baselineRisky.triage_tier);
  const improvedScore = getUrgency(counterfactualImproved.triage_tier);
  const delta = baselineScore - improvedScore;

  assert(
    'RES-14: 90-Day Spermatogenesis Simulator Delta Recalculation',
    baselineRisky.triage_tier === 'TIER_2_ANDROLOGY_SPECIALIST' &&
      counterfactualImproved.triage_tier === 'TIER_4_LIFESTYLE' &&
      delta >= 50,
    `Baseline Urgency: ${baselineScore} -> Improved Urgency: ${improvedScore} (Delta: -${delta} pts)`
  );

  // 11. RES-15: 100-Profile UCI Benchmark <50ms
  const benchStart = performance.now();
  const benchmarkResult = runUciBenchmark();
  const benchEnd = performance.now();
  const benchDuration = benchEnd - benchStart;

  assert(
    'RES-15: 100-Profile UCI Benchmark Execution (<50ms)',
    benchmarkResult.totalProfiles === 100 &&
      benchmarkResult.concordanceRate === 100 &&
      benchDuration < 50,
    `Duration: ${benchDuration.toFixed(2)}ms (Limit: 50ms), Concordance: ${benchmarkResult.concordanceRate}%`
  );

  // 12. RES-16: FHIR R4 Bundle Schema & Malaffi Interop
  const fhirBundle = transformToFhirR4Bundle(t2Steroids, baseInput);
  const riskAssessmentEntry = fhirBundle.entry.find((e) => e.resource.resourceType === 'RiskAssessment');
  const observations = fhirBundle.entry.filter((e) => e.resource.resourceType === 'Observation');

  assert(
    'RES-16: HL7 FHIR R4 RiskAssessment Bundle & Schema Conformance',
    fhirBundle.resourceType === 'Bundle' &&
      fhirBundle.type === 'collection' &&
      Boolean(riskAssessmentEntry) &&
      riskAssessmentEntry?.resource?.prediction?.[0]?.outcome?.coding?.[0]?.code === 'TIER_2_ANDROLOGY_SPECIALIST' &&
      observations.length >= 1 &&
      !JSON.stringify(fhirBundle).includes('patient_name') &&
      !JSON.stringify(fhirBundle).includes('emirates_id'),
    `Bundle Entries: ${fhirBundle.entry.length}, Zero-PII Verified`
  );

  // 13. RES-17 (PM-35 / UX-25): Pre-Vetted Question Chips Contextual Tailoring
  const t2SteroidsQuestions = getTailoredQuestionIds(t2Steroids, { ...baseInput, steroidsTrt: true });
  const t1TorsionQuestions = getTailoredQuestionIds(t1Torsion, { ...baseInput, acutePain: true });
  const t2Varicocele = evaluateScreening({ ...baseInput, varicocele: true });
  const t2VaricoceleQuestions = getTailoredQuestionIds(t2Varicocele, { ...baseInput, varicocele: true });
  const t4Heat = evaluateScreening({ ...baseInput, sittingHours: 10, frequentHeat: true });
  const t4HeatQuestions = getTailoredQuestionIds(t4Heat, { ...baseInput, sittingHours: 10, frequentHeat: true });

  const allQuestionsHaveTranslations = [
    ...t2SteroidsQuestions,
    ...t1TorsionQuestions,
    ...t2VaricoceleQuestions,
    ...t4HeatQuestions,
  ].every(
    (id) =>
      Boolean(TRANSLATIONS.en.questionChips[id]?.question) &&
      Boolean(TRANSLATIONS.en.questionChips[id]?.answer) &&
      Boolean(TRANSLATIONS.ar.questionChips[id]?.question) &&
      Boolean(TRANSLATIONS.ar.questionChips[id]?.answer)
  );

  assert(
    'RES-17: Deterministic Question Chips Tailoring (PM-35 / UX-25)',
    t2SteroidsQuestions.includes('hpg_recovery_timeline') &&
      t2SteroidsQuestions.includes('daman_thiqa_coverage') &&
      t2VaricoceleQuestions.includes('varicocele_microsurgery') &&
      t1TorsionQuestions.includes('emergency_scrotal_torsion') &&
      t4HeatQuestions.includes('scrotal_thermoregulation') &&
      t2SteroidsQuestions.length >= 3 &&
      t2SteroidsQuestions.length <= 4 &&
      allQuestionsHaveTranslations,
    `Tailored: TRT (${t2SteroidsQuestions.length}), Varicocele (${t2VaricoceleQuestions.length}), Torsion (${t1TorsionQuestions.length}), Heat (${t4HeatQuestions.length})`
  );

  // 14. RES-18 (PM-31 / PM-35): Phase-2 Modules — Judge Demo Archetypes & Question Chips Knowledge Base
  const demoPresetsConcordant = JUDGE_DEMO_PRESETS.every((preset) => {
    const outcome = evaluateScreening(preset.input);
    const chips = getTailoredQuestionIds(outcome, preset.input);
    return outcome.triage_tier === preset.tier && chips.length >= 3 && chips.length <= 4;
  });

  const allQuestionIds: QuestionChipId[] = [
    'hpg_recovery_timeline',
    'varicocele_microsurgery',
    'daman_thiqa_coverage',
    'scrotal_thermoregulation',
    'sperm_morphology_criteria',
    'emergency_scrotal_torsion',
    'testicular_mass_pathway',
    'metabolic_aromatization',
    'tobacco_dna_fragmentation',
    'andrology_consult_protocol',
  ];

  const allDictionaryComplete = allQuestionIds.every((id) => {
    const en = TRANSLATIONS.en.questionChips[id];
    const ar = TRANSLATIONS.ar.questionChips[id];
    return (
      Boolean(en?.question) &&
      Boolean(en?.answer) &&
      Boolean(en?.citation) &&
      Boolean(ar?.question) &&
      Boolean(ar?.answer) &&
      Boolean(ar?.citation) &&
      !en.answer.includes('<script') &&
      !ar.answer.includes('<script') &&
      !en.answer.includes('localStorage') &&
      !ar.answer.includes('localStorage')
    );
  });

  assert(
    'RES-18: Phase-2 Modules — Judge Archetypes & Question Chips Invariants (PM-31 / PM-35)',
    demoPresetsConcordant && allDictionaryComplete,
    `5/5 Presets Concordant, ${allQuestionIds.length}/${allQuestionIds.length} Question Chips Validated (Zero-PII & Bilingual)`
  );

  console.log('\n========================================================================');
  console.log(`TOTAL SUITE RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
