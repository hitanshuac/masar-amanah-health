/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScreeningInput, ClinicalEvaluationResult, TriggeredRule, TriageTier, GateStatus, EvidenceCompletenessIndex, EvidenceDomain, ClinicalEvaluationEnhanced } from '../types/screening.ts';

export const ENGINE_VERSION = 'v1.4-AUA2021-WHO6-UAE';

/**
 * Deterministic Rules Engine
 * Evaluates inputs strictly according to WHO 6th Edition (2021) and AUA/ASRM Clinical Guidelines.
 * Generates verified JSON with zero hallucinations and zero probabilistic drift.
 */
export function evaluateScreening(input: ScreeningInput): ClinicalEvaluationResult {
  const triggered_rules: TriggeredRule[] = [];
  const timestamp = new Date().toISOString();
  // Generate random anonymous in-memory token (Zero-PII)
  const zero_pii_session_id = `AMANAH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // ==========================================
  // STAGE 2: SAFETY CIRCUIT BREAKER (Tier 1)
  // ==========================================
  if (input.acutePain) {
    triggered_rules.push({
      rule_id: 'RULE_EMERGENCY_ACUTE_SCROTAL_PAIN',
      category: 'EMERGENCY',
      severity: 'critical',
      title_en: 'Acute Severe Scrotal Pain (<12–24h Window)',
      title_ar: 'ألم حاد ومفاجئ في كيس الصفن (نافذة الإنقاذ الحرجة)',
      rationale_en: 'High clinical suspicion of testicular torsion. Immediate Doppler ultrasound and emergent urological surgical evaluation are mandated within the 6-hour salvage window to prevent ischemic necrosis.',
      rationale_ar: 'اشتباه سريري عاجل في التواء الخصية. يلزم إجراء فحص عاجل بالموجات فوق الصوتية الدوبلرية وتدخل جراحي فوري ضمن نافذة الإنقاذ (أقل من 6 ساعات) لمنع النخر الإقفاري.',
      guideline_source: 'AUA Acute Scrotum Clinical Practice Guidelines & DoH Emergency Protocol',
      measured_value: 'Present (<24h onset)',
      threshold_reference: 'Zero tolerance (Surgical Emergency)',
    });
  }

  if (input.painlessLump) {
    triggered_rules.push({
      rule_id: 'RULE_EMERGENCY_TESTICULAR_MASS',
      category: 'EMERGENCY',
      severity: 'critical',
      title_en: 'Painless Firm Testicular Mass / Nodule',
      title_ar: 'كتلة صلبة غير مؤلمة في الخصية',
      rationale_en: 'High clinical suspicion of testicular neoplasm. Mandates urgent outpatient urological ultrasound and tumor marker panel (AFP, beta-hCG, LDH) on a priority 2-week fast-track pathway.',
      rationale_ar: 'اشتباه سريري في وجود ورم نسيجي صلب. يتطلب تقييماً عاجلاً بالموجات فوق الصوتية وتحاليل دلالات الأورام (AFP, hCG, LDH) عبر مسار المسالك البولية ذي الأولوية.',
      guideline_source: 'EAU / AUA Testicular Cancer Guidelines (2022)',
      measured_value: 'Palpable firm mass',
      threshold_reference: 'Zero tolerance (Urgent Urology Fast-Track)',
    });
  }

  // If safety circuit breaker fired, return immediately without further delays
  if (triggered_rules.some((r) => r.category === 'EMERGENCY')) {
    const isTorsion = input.acutePain;
    const emergencyResult: ClinicalEvaluationResult = {
      triage_tier: 'TIER_1_EMERGENCY',
      action_code: isTorsion ? 'URGENT_ED_TORSION_PROTOCOL' : 'URGENT_UROLOGY_MASS_EVAL',
      circuit_breaker_triggered: true,
      circuit_breaker_type: isTorsion ? 'TORSION' : 'MASS',
      triggered_rules,
      summary_en: isTorsion
        ? 'EMERGENCY: Immediate emergency medical evaluation required for acute testicular symptoms.'
        : 'URGENT: Expedited outpatient urological evaluation required for palpable testicular nodule.',
      summary_ar: isTorsion
        ? 'حالة طارئة: يلزم التوجه الفوري إلى قسم الطوارئ لإجراء فحص دوبلر للخصية دون تأخير.'
        : 'أولوية سريرية: يلزم حجز موعد عاجل في عيادة جراحة المسالك البولية لتقييم الكتلة الملموسة.',
      audit_timestamp: timestamp,
      algorithm_version: ENGINE_VERSION,
      zero_pii_session_id,
    };
    emergencyResult.gates = computeGateStatuses(input, emergencyResult);
    emergencyResult.evidenceIndex = computeEvidenceIndex(input);
    return emergencyResult;
  }

  // ==========================================
  // STAGE 3: TIER 2 - ANDROLOGY & INFERTILITY
  // ==========================================
  if (input.steroidsTrt) {
    triggered_rules.push({
      rule_id: 'RULE_EXOGENOUS_ANDROGEN_HPG_SUPPRESSION',
      category: 'ANDROLOGY',
      severity: 'high',
      title_en: 'Exogenous Anabolic Steroids / TRT Use',
      title_ar: 'استخدام الهرمونات البنائية أو التستوستيرون الخارجي',
      rationale_en: 'Exogenous androgens trigger strong negative feedback on the hypothalamic-pituitary-gonadal (HPG) axis, shutting down intratesticular testosterone and endogenous FSH/LH, leading to secondary azoospermia or severe oligozoospermia.',
      rationale_ar: 'يؤدي التستوستيرون الخارجي أو المنشطات البنائية إلى تثبيط محوري حاد للغدة النخامية (FSH/LH)، مما يوقف تصنيع النطاف الداخلي ويتسبب في انعدام أو تدني حاد في الحيوانات المنوية.',
      guideline_source: 'Endocrine Society & ASRM Practice Committee Opinions',
      measured_value: 'Active / Recent Use',
      threshold_reference: 'Must be discontinued under Andrology supervision',
    });
  }

  if (input.undescendedTesticle) {
    triggered_rules.push({
      rule_id: 'RULE_CRYPTORCHIDISM_HISTORICAL_RISK',
      category: 'ANDROLOGY',
      severity: 'high',
      title_en: 'History of Cryptorchidism (Undescended Testicle)',
      title_ar: 'تاريخ الخصية الهاجرة (غير النازلة)',
      rationale_en: 'History of undescended testicle (even post-orchidopexy) is associated with reduced germ cell density, persistent Leydig/Sertoli cell dysfunction, and heightened relative risk for subfertility.',
      rationale_ar: 'يرتبط تاريخ الخصية المعلقة حتى بعد تثبيتها جراحياً بانخفاض كثافة الخلايا المنوية واضطراب وظائف خلايا سيرتولي، مما يرفع احتمالية تدني الخصوبة.',
      guideline_source: 'AUA/ASRM Male Infertility Best Practice Guidelines',
      measured_value: 'Positive History',
      threshold_reference: 'Requires baseline andrology semen & endocrine profiling',
    });
  }

  if (input.varicocele) {
    triggered_rules.push({
      rule_id: 'RULE_VARICOCELE_HYPERTHERMIA_ROS',
      category: 'ANDROLOGY',
      severity: 'high',
      title_en: 'Diagnosed Clinical Varicocele (Pampiniform Dilatation)',
      title_ar: 'دوالي الخصية السريرية (احتقان الضفيرة المحلاقية)',
      rationale_en: 'Clinical varicocele causes retrograde venous reflux, continuous scrotal hyperthermia, testicular hypoxia, and progressive accumulation of seminal reactive oxygen species (ROS), elevating sperm DNA fragmentation.',
      rationale_ar: 'تتسبب دوالي الخصية في ارتداد وريدي واحتباس حراري دائم ونقص أكسجة نسيجية، مما يرفع الإجهاد التأكسدي وتكسر الحمض النووي للنطاف (DNA Fragmentation).',
      guideline_source: 'AUA/ASRM Guideline on Varicocele and Infertility',
      measured_value: 'Clinically Diagnosed',
      threshold_reference: 'Specialist grading & Doppler hemodynamic assessment recommended',
    });
  }

  // WHO 6th Edition (2021) Semen Analysis Threshold Failures (5th Lower Percentile Limits)
  if (input.hasSemenReport) {
    // 1. Volume: < 1.4 mL (Hypospermia)
    if (input.semenVolume !== null && input.semenVolume < 1.4) {
      triggered_rules.push({
        rule_id: 'RULE_WHO6_HYPOSPERMIA',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Low Ejaculate Volume (< 1.4 mL, Hypospermia)',
        title_ar: 'انخفاض حجم السائل المنوي (أقل من 1.4 مل)',
        rationale_en: 'Ejaculate volume below the 5th percentile (1.4 mL) raises suspicion of incomplete collection, seminal vesicle hypoplasia, ejaculatory duct obstruction (EDO), or retrograde ejaculation.',
        rationale_ar: 'حجم السائل المنوي أقل من الحد الأدنى لمنظمة الصحة العالمية (1.4 مل)، مما يستدعي استبعاد انسداد القنوات الدافقة، أو القذف المرتجع، أو نقص إفراز الحويصلات المنوية.',
        guideline_source: 'WHO Laboratory Manual for the Examination of Human Semen (6th Edition, 2021)',
        measured_value: `${input.semenVolume.toFixed(1)} mL`,
        threshold_reference: '≥ 1.4 mL (5th percentile lower limit)',
      });
    }

    // 2. Sperm Concentration: < 15.0 M/mL (Oligozoospermia)
    if (input.semenConcentration !== null && input.semenConcentration < 15.0) {
      triggered_rules.push({
        rule_id: 'RULE_WHO6_OLIGOZOOSPERMIA',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Low Sperm Concentration (< 15.0 × 10⁶/mL, Oligozoospermia)',
        title_ar: 'انخفاض تركيز الحيوانات المنوية (أقل من 15 مليون/مل)',
        rationale_en: 'Sperm concentration falls below WHO 6th Ed 5th percentile threshold (15.0 million/mL). Requires repeat confirmatory analysis and formal andrological endocrine evaluation (FSH, LH, Total Testosterone).',
        rationale_ar: 'تركيز الحيوانات المنوية دون الحد المعياري الدولي (15 مليون/مل). يلزم إعادة التحليل للتأكيد وإجراء فحص هرموني شامل لتقييم كفاءة التكوين النطافي.',
        guideline_source: 'WHO Laboratory Manual for the Examination of Human Semen (6th Edition, 2021)',
        measured_value: `${input.semenConcentration.toFixed(1)} M/mL`,
        threshold_reference: '≥ 15.0 × 10⁶ / mL (5th percentile lower limit)',
      });
    }

    // 3. Total Motility (PR + NP): < 42.0% (Asthenozoospermia)
    if (input.semenMotility !== null && input.semenMotility < 42.0) {
      triggered_rules.push({
        rule_id: 'RULE_WHO6_MOTILITY_BELOW_42',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Suboptimal Total Sperm Motility (< 42.0%, Asthenozoospermia)',
        title_ar: 'ضعف الحركة الكلية للحيوانات المنوية (أقل من 42%)',
        rationale_en: 'Combined progressive (PR) and non-progressive (NP) motility below 42.0% indicates impaired kinetic potential, frequently driven by oxidative stress, varicocele, or mitochondrial membrane dysfunction.',
        rationale_ar: 'نسبة الحركة الكلية تقل عن معيار منظمة الصحة العالمية (42%)، وغالباً ما ترتبط بالإجهاد التأكسدي داخل البلازما المنوية أو اعتلال في طاقة الميتوكوندريا الحركية.',
        guideline_source: 'WHO Laboratory Manual for the Examination of Human Semen (6th Edition, 2021)',
        measured_value: `${input.semenMotility.toFixed(1)}%`,
        threshold_reference: '≥ 42.0% (Total PR + NP 5th percentile lower limit)',
      });
    }

    // 4. Normal Morphology: < 4.0% (Teratozoospermia)
    if (input.semenMorphology !== null && input.semenMorphology < 4.0) {
      triggered_rules.push({
        rule_id: 'RULE_WHO6_TERATOZOOSPERMIA',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Strict Morphology Deficit (< 4.0% Normal Forms, Teratozoospermia)',
        title_ar: 'تدني نسبة الأشكال الطبيعية (أقل من 4% وفق معايير تايجربيرغ)',
        rationale_en: 'Strict Tygerberg normal morphology under 4.0% suggests spermiogenesis structural defects, often aggravated by scrotal hyperthermia, metabolic derangement, or toxins.',
        rationale_ar: 'نسبة الأشكال السليمة أقل من 4% وفق معايير منظمة الصحة العالمية الصارمة، مما يشير إلى تشوهات بنيوية أثناء تصنيع النطاف قد تستجيب للتحسين الأيضي ومضادات الأكسدة.',
        guideline_source: 'WHO Laboratory Manual for the Examination of Human Semen (6th Edition, 2021)',
        measured_value: `${input.semenMorphology.toFixed(1)}%`,
        threshold_reference: '≥ 4.0% strict Tygerberg criteria',
      });
    }
  }

  // ==========================================
  // STAGE 3: TIER 3 - PRIMARY CARE & METABOLIC
  // ==========================================
  if (input.bmi >= 30.0) {
    triggered_rules.push({
      rule_id: 'RULE_METABOLIC_BMI_AROMATIZATION',
      category: 'METABOLIC',
      severity: 'moderate',
      title_en: 'Elevated Adiposity (BMI ≥ 30.0 kg/m² - Adipose Aromatization)',
      title_ar: 'ارتفاع مؤشر كتلة الجسم (السمنة والأرومة الشحمية)',
      rationale_en: 'Excess visceral adipose tissue increases cytochrome P450 aromatase activity, converting circulating testosterone into estradiol. This creates secondary hypogonadism and alters gonadotropin pulsatility.',
      rationale_ar: 'تزيد الأنسجة الشحمية الزائدة من نشاط إنزيم الأروماتاز، محولة التستوستيرون إلى إستراديول، مما يؤدي إلى هبوط نسبي في الأندروجينات وضعف في إشارات الغدة النخامية المحفزة للخصيتين.',
      guideline_source: 'Endocrine Society Clinical Practice Guidelines on Hypogonadism',
      measured_value: `BMI ${input.bmi.toFixed(1)} kg/m²`,
      threshold_reference: '< 25.0 kg/m² optimal (< 30.0 non-obese)',
    });
  }

  if (input.mumpsOrchitis) {
    triggered_rules.push({
      rule_id: 'RULE_POST_PUBERTAL_ORCHITIS',
      category: 'METABOLIC',
      severity: 'moderate',
      title_en: 'Post-Pubertal Mumps Orchitis History',
      title_ar: 'إصابة سابقة بالتهاب الخصية النكافي بعد البلوغ',
      rationale_en: 'Mumps orchitis occurring after puberty carries up to 30% risk of unilateral or bilateral testicular atrophy, tunica albuginea compression necrosis, and reduced parenchymal volume.',
      rationale_ar: 'التهاب الخصية المصاحب للنكاف بعد البلوغ قد يسبب ضموراً جزئياً أو كلياً في الأنسجة المولدة للنطاف بسبب زيادة الضغط داخل الغلالة البيضاء.',
      guideline_source: 'European Association of Urology (EAU) Infertility Guidelines',
      measured_value: 'Reported Post-Pubertal Infection',
      threshold_reference: 'Physical examination & ultrasound measurement recommended',
    });
  }

  // ==========================================
  // STAGE 3: TIER 4 - LIFESTYLE MODULATION
  // ==========================================
  if (input.sittingHours >= 8) {
    triggered_rules.push({
      rule_id: 'RULE_LIFESTYLE_SEDENTARY_HYPERTHERMIA',
      category: 'LIFESTYLE',
      severity: 'low',
      title_en: 'Prolonged Seated Posture (≥ 8 hrs/day Scrotal Hyperthermia)',
      title_ar: 'الجلوس المطول (أكثر من 8 ساعات يومياً والاحتباس الحراري)',
      rationale_en: 'Continuous seated posture elevates intrascrotal temperature by 1.5°C to 2.2°C, surpassing the physiological 34°C testicular threshold and impairing temperature-sensitive spermatogenic enzymes.',
      rationale_ar: 'الجلوس لفترات متواصلة يرفع حرارة الصفن بما يصل إلى 2 درجة مئوية، متجاوزاً الحرارة الفسيولوجية المثلى (34 مئوية)، مما يؤثر سلباً على الإنزيمات الحساسة للحرارة.',
      guideline_source: 'Human Reproduction & Environmental Andrology Studies',
      measured_value: `${input.sittingHours} hours/day`,
      threshold_reference: '< 6 hours/day without standing breaks',
    });
  }

  if (input.frequentHeat) {
    triggered_rules.push({
      rule_id: 'RULE_THERMAL_EXPOSURE_SCROTAL',
      category: 'LIFESTYLE',
      severity: 'low',
      title_en: 'Frequent Direct Thermal Exposure (>2x/wk Saunas/Baths)',
      title_ar: 'التعرض المتكرر للمصادر الحرارية المباشرة (الساونا والمياه الساخنة)',
      rationale_en: 'Frequent immersion in hot tubs, wet/dry saunas, or direct heat sources induces temporary heat shock protein responses and transient declines in sperm count and motility.',
      rationale_ar: 'التعرض المتكرر لحمامات البخار أو الجاكوزي الحار يسبب صدمة حرارية مؤقتة تؤدي إلى هبوط عابر في أعداد وحركة الحيوانات المنوية يستمر لأسابيع.',
      guideline_source: 'International Journal of Andrology Thermal Guidelines',
      measured_value: 'Active frequent exposure (>2x weekly)',
      threshold_reference: 'Avoidance of direct scrotal heating',
    });
  }

  if (input.tobaccoShisha !== 'none') {
    triggered_rules.push({
      rule_id: 'RULE_OXIDATIVE_STRESS_TOBACCO_SHISHA',
      category: 'LIFESTYLE',
      severity: 'low',
      title_en: `Tobacco / Shisha / Medwakh Consumption (${input.tobaccoShisha.toUpperCase()})`,
      title_ar: `استهلاك التبغ أو الشيشة أو المدواخ (${input.tobaccoShisha === 'heavy' ? 'كثيف' : 'متوسط'})`,
      rationale_en: 'Combustion toxins, heavy metals (cadmium, lead), and nicotine elevate seminal reactive oxygen species (ROS), causing leukocyte infiltration and sperm chromatin condensation defects.',
      rationale_ar: 'تحتوي نواتج احتراق التبغ والشيشة والمدواخ على معادن ثقيلة ونيكوتين ترفع الجذور الحرة في السائل المنوي وتزيد من تكسر الكروماتين الوراثي.',
      guideline_source: 'WHO Guidelines on Tobacco and Reproductive Health (2020)',
      measured_value: input.tobaccoShisha,
      threshold_reference: 'Complete cessation recommended for reproductive optimization',
    });
  }

  // ==========================================
  // RESOLVE FINAL TRIAGE TIER (STRICT PRIORITY)
  // ==========================================
  const hasAndrologyRule = triggered_rules.some((r) => r.category === 'ANDROLOGY');
  const hasMetabolicRule = triggered_rules.some((r) => r.category === 'METABOLIC');

  let finalTier: TriageTier = 'TIER_4_LIFESTYLE';
  let actionCode: ClinicalEvaluationResult['action_code'] = 'SELF_GUIDED_OPTIMIZATION';
  let summaryEn = '';
  let summaryAr = '';

  if (hasAndrologyRule) {
    finalTier = 'TIER_2_ANDROLOGY_SPECIALIST';
    actionCode = 'REFERRAL_MALE_FERTILITY_SPECIALIST';
    summaryEn = 'Identified clinical or semen parameters indicating specialized male fertility & andrology assessment.';
    summaryAr = 'تم رصد مؤشرات سريرية أو معايير في السائل المنوي تستدعي استشارة استشاري طب الذكورة وصحة الإنجاب.';
  } else if (hasMetabolicRule) {
    finalTier = 'TIER_3_PRIMARY_CARE';
    actionCode = 'REFERRAL_PCP_WORKUP';
    summaryEn = 'Identified metabolic or constitutional factors that benefit from primary care and endocrine optimization.';
    summaryAr = 'تم رصد عوامل أيضية أو بدنية تستفيد بشكل كبير من الرعاية الأولية وتنظيم التوازن الهرموني.';
  } else {
    finalTier = 'TIER_4_LIFESTYLE';
    actionCode = 'SELF_GUIDED_OPTIMIZATION';
    summaryEn = 'Screening indicators are in favorable baseline ranges. Focus is on self-guided lifestyle preservation.';
    summaryAr = 'المؤشرات ضمن النطاقات المستقرة. يوصى بالحفاظ على العادات الصحية وتجنب الاحتباس الحراري والإجهاد التأكسدي.';
  }

  const finalResult: ClinicalEvaluationResult = {
    triage_tier: finalTier,
    action_code: actionCode,
    circuit_breaker_triggered: false,
    triggered_rules,
    summary_en: summaryEn,
    summary_ar: summaryAr,
    audit_timestamp: timestamp,
    algorithm_version: ENGINE_VERSION,
    zero_pii_session_id,
  };
  finalResult.gates = computeGateStatuses(input, finalResult);
  finalResult.evidenceIndex = computeEvidenceIndex(input);
  return finalResult;
}

/**
 * 5-Gate Coordination Architecture
 * Maps the Inception42 "5 Gates Decide the Path" pattern (Slide 11 & Q&A 56:50)
 * Gates: Consent → Acute Safety → Evidence Null Check → Deterministic Scoring → Clinician Review
 */
export function computeGateStatuses(
  input: ScreeningInput,
  result: ClinicalEvaluationResult
): GateStatus[] {
  const gates: GateStatus[] = [];

  // Gate 1: Zero-PII Session Consent
  gates.push({
    gate: 1,
    name: 'Zero-PII Session Consent',
    condition: 'Ephemeral session initialized with no PII collection',
    decision: 'PASS',
    detail: `Session ${result.zero_pii_session_id} — Zero cookies, zero databases, zero identifiers`,
  });

  // Gate 2: Acute Safety Triage (Circuit Breaker)
  if (result.circuit_breaker_triggered) {
    gates.push({
      gate: 2,
      name: 'Acute Safety Triage',
      condition: 'Acute Pain or Solid Mass detected',
      decision: 'STOP',
      detail: `Circuit breaker fired: ${result.circuit_breaker_type === 'TORSION' ? 'Testicular Torsion Protocol' : 'Urgent Mass Evaluation'} — Bypass all downstream gates → Immediate ER`,
    });
    // When Gate 2 fires STOP, remaining gates are not evaluated
    return gates;
  }
  gates.push({
    gate: 2,
    name: 'Acute Safety Triage',
    condition: 'No acute pain or solid mass detected',
    decision: 'PASS',
    detail: 'No emergency red flags — Proceeding to evidence evaluation',
  });

  // Gate 3: Evidence & Null Check (Null ≠ Zero Invariant)
  const hasMissingSemen = !input.hasSemenReport;
  gates.push({
    gate: 3,
    name: 'Evidence & Null Check',
    condition: hasMissingSemen
      ? 'WHO 6th Semen Panel not supplied — Semen parameters remain null (never zero)'
      : 'All 4 evidence domains supplied',
    decision: hasMissingSemen ? 'FLAG_NULL' : 'PASS',
    detail: hasMissingSemen
      ? 'Semen Lab domain is null → Early Risk Signal active. Scoring continues with available history/biometrics only. Null values never become zero.'
      : 'Full evidence coverage — All 4 domains present for comprehensive scoring',
  });

  // Gate 4: Deterministic Scoring (WHO 6th + AUA/EAU Rules)
  gates.push({
    gate: 4,
    name: 'Deterministic Scoring',
    condition: `${result.triggered_rules.length} rules evaluated against WHO 6th Ed + AUA/EAU thresholds`,
    decision: 'PASS',
    detail: `Triage tier ${result.triage_tier} computed deterministically — ${result.triggered_rules.length} rule(s) triggered → Action: ${result.action_code}`,
  });

  // Gate 5: Clinician Review & Sign-Off (DECIDE-AI)
  const isAutonomousCoaching = result.triage_tier === 'TIER_4_LIFESTYLE';
  gates.push({
    gate: 5,
    name: 'Clinician Review & Sign-Off',
    condition: isAutonomousCoaching
      ? 'No clinical flags — Cleared for autonomous lifestyle coaching'
      : `${result.triage_tier} referral draft requires clinician sign-off (DECIDE-AI)`,
    decision: isAutonomousCoaching ? 'PASS' : 'WAIT',
    detail: isAutonomousCoaching
      ? 'Gate 5: AUTONOMOUS_COACHING — No specialist referral required. Self-guided optimization pathway active.'
      : `Gate 5: AWAITING_APPROVAL — ${result.triage_tier === 'TIER_2_ANDROLOGY_SPECIALIST' ? 'Andrology specialist' : 'Primary care physician'} review recommended before finalizing referral plan (DECIDE-AI / WHO AI Ethics)`,
  });

  return gates;
}

/**
 * Evidence-Weighted Confidence Index
 * "Underneath every gate: an unavailable value stays null. A missing value never becomes zero."
 * — Dr. Nance Elnaker, Inception42 Workshop #3, Slide 11 (Q&A 46:18)
 *
 * 4 Evidence Domains:
 *   1. Red-Flag Safety (acutePain, painlessLump)
 *   2. AUA Clinical History (steroidsTrt, undescendedTesticle, varicocele, mumpsOrchitis)
 *   3. Metabolic/OSHAD Lifestyle (BMI, sittingHours, frequentHeat, tobaccoShisha)
 *   4. WHO 6th Semen Panel (semenVolume, semenConcentration, semenMotility, semenMorphology)
 */
export function computeEvidenceIndex(input: ScreeningInput): EvidenceCompletenessIndex {
  const domains: EvidenceDomain[] = [
    {
      id: 1,
      name: 'Red-Flag Safety',
      present: true, // Always evaluated (boolean inputs always present)
      detail: 'Acute pain & painless mass screening — Always assessed',
    },
    {
      id: 2,
      name: 'AUA Clinical History',
      present: true, // Always evaluated (boolean inputs)
      detail: 'Steroids/TRT, cryptorchidism, varicocele, mumps orchitis — Always assessed',
    },
    {
      id: 3,
      name: 'Metabolic & OSHAD Lifestyle',
      present: true, // BMI, sitting, heat, tobacco always provided
      detail: `BMI ${input.bmi.toFixed(1)} kg/m² | Sitting ${input.sittingHours}h/day | Heat ${input.frequentHeat ? 'Yes' : 'No'} | Tobacco ${input.tobaccoShisha}`,
    },
    {
      id: 4,
      name: 'WHO 6th Semen Panel',
      present: Boolean(input.hasSemenReport && input.semenVolume !== null && input.semenConcentration !== null && input.semenMotility !== null && input.semenMorphology !== null),
      detail: input.hasSemenReport && input.semenVolume !== null && input.semenConcentration !== null && input.semenMotility !== null && input.semenMorphology !== null
        ? `Vol ${input.semenVolume.toFixed(1)} mL | Conc ${input.semenConcentration.toFixed(1)} M/mL | Mot ${input.semenMotility.toFixed(1)}% | Morph ${input.semenMorphology.toFixed(1)}%`
        : 'Semen lab report not supplied — Domain is null (not zero)',
    },
  ];

  const domainsPresent = domains.filter((d) => d.present).length;
  const domainsTotal = domains.length;
  const completenessPercent = Math.round((domainsPresent / domainsTotal) * 100);
  const isEarlyRiskSignal = domainsPresent < domainsTotal;

  const label = isEarlyRiskSignal
    ? `${domainsPresent}/${domainsTotal} Evidence Domains (${completenessPercent}% Completeness — Early Risk Signal Active; Lab Domain Null)`
    : `${domainsPresent}/${domainsTotal} Evidence Domains (${completenessPercent}% Completeness — Full Clinical & Lab Signal)`;

  return {
    domainsPresent,
    domainsTotal,
    completenessPercent,
    domains,
    label,
    isEarlyRiskSignal,
  };
}

/**
 * Enhanced evaluation combining base clinical engine with Inception42 enhancements.
 * Does NOT modify the core deterministic triage — only decorates with gate statuses and evidence index.
 */
export function evaluateScreeningEnhanced(input: ScreeningInput): ClinicalEvaluationEnhanced {
  const baseResult = evaluateScreening(input);
  return {
    ...baseResult,
    gates: computeGateStatuses(input, baseResult),
    evidenceIndex: computeEvidenceIndex(input),
  };
}
