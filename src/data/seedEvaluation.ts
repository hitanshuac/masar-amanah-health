/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClinicalEvaluationResult } from '../types/screening.ts';

/**
 * ENG-6: Representative seed evaluation suite covering all 4 triage tiers
 * Enables zero-network offline demos, automated regression tests, and fallback validation.
 */
export const SEED_EVALUATIONS: Record<string, ClinicalEvaluationResult> = {
  // 1. TIER 1 - Acute Testicular Pain (Torsion Protocol)
  tier1_torsion: {
    triage_tier: 'TIER_1_EMERGENCY',
    action_code: 'URGENT_ED_TORSION_PROTOCOL',
    circuit_breaker_triggered: true,
    circuit_breaker_type: 'TORSION',
    triggered_rules: [
      {
        rule_id: 'EMERGENCY_ACUTE_SCROTAL_PAIN',
        category: 'EMERGENCY',
        severity: 'critical',
        title_en: 'Critical: Acute Scrotal Pain (<12-24h onset)',
        title_ar: 'حرج: ألم صفني حاد مفاجئ (خلال آخر 12-24 ساعة)',
        rationale_en: 'Sudden severe testicular pain mandates immediate emergency surgical Doppler evaluation to rule out testicular torsion within the 6-hour ischemia window.',
        rationale_ar: 'الألم الصفني الحاد المفاجئ يستدعي تقييماً جراحياً وفحصاً بالموجات فوق الصوتية (الدوبلر) فوراً في الطوارئ لاستبعاد التواء الخصية.',
        guideline_source: 'AUA Scrotal Pain Algorithm / EAU Paediatric & Adult Urology Guidelines',
        measured_value: 'Reported: Sudden Severe Pain',
        threshold_reference: 'Zero-tolerance acute safety rule',
      },
    ],
    summary_en: 'Critical Alert: Acute scrotal symptoms reported. Emergency department evaluation is required immediately.',
    summary_ar: 'تنبيه سريري طارئ: ألم حاد ومفاجئ يتطلب التوجه الفوري إلى قسم الطوارئ بالمستشفى دون أي تأخير.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T1-TORSION-001',
  },

  // 2. TIER 1 - Testicular Mass (Urgent Urology Fast-Track)
  tier1_mass: {
    triage_tier: 'TIER_1_EMERGENCY',
    action_code: 'URGENT_UROLOGY_MASS_EVAL',
    circuit_breaker_triggered: true,
    circuit_breaker_type: 'MASS',
    triggered_rules: [
      {
        rule_id: 'EMERGENCY_PAINLESS_TESTICULAR_MASS',
        category: 'EMERGENCY',
        severity: 'critical',
        title_en: 'Critical: Painless Testicular Mass / Nodule',
        title_ar: 'حرج: كتلة صلبة غير مؤلمة داخل الخصية',
        rationale_en: 'A firm, discrete painless intratesticular nodule carries high clinical suspicion for testicular neoplasm requiring fast-track scrotal ultrasound.',
        rationale_ar: 'وجود كتلة غير مؤلمة داخل الخصية يستدعي فحصاً مستعجلاً بالموجات الصوتية للصفن واستشارة استشاري جراحة المسالك لاستبعاد الأورام.',
        guideline_source: 'AUA Early Detection of Testicular Cancer / EAU Testicular Cancer Guidelines',
        measured_value: 'Reported: Firm Painless Nodule',
        threshold_reference: 'Priority urology referral within 48-72h',
      },
    ],
    summary_en: 'Urgent Alert: Painless firm testicular mass reported. Priority urological ultrasound referral required.',
    summary_ar: 'تنبيه سريري عاجل: كتلة صلبة غير مؤلمة تتطلب استشارة عاجلة لدى استشاري جراحة المسالك البولية وفحص السونار.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T1-MASS-002',
  },

  // 3. TIER 2 - Multiple Semen Deficits (Oligoasthenoteratozoospermia - WHO 6th Ed)
  tier2_oats: {
    triage_tier: 'TIER_2_ANDROLOGY_SPECIALIST',
    action_code: 'REFERRAL_MALE_FERTILITY_SPECIALIST',
    circuit_breaker_triggered: false,
    triggered_rules: [
      {
        rule_id: 'WHO6_OLIGOZOOSPERMIA',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Low Sperm Concentration (<15.0 M/mL)',
        title_ar: 'انخفاض تركيز الحيوانات المنوية (< 15.0 مليون/مل)',
        rationale_en: 'Concentration of 8.2 M/mL falls below WHO 6th Edition 5th percentile lower reference limit (15.0 M/mL).',
        rationale_ar: 'التركيز المسجل (8.2 مليون/مل) يقع دون الحد الأدنى لمنظمة الصحة العالمية (15.0 مليون/مل).',
        guideline_source: 'WHO Laboratory Manual 6th Edition (2021), Table 2.1',
        measured_value: '8.2 M/mL',
        threshold_reference: '≥ 15.0 M/mL',
      },
      {
        rule_id: 'WHO6_ASTHENOZOOSPERMIA',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Reduced Total Motility (<42%)',
        title_ar: 'انخفاض الحركة الكلية للنطاف (< 42%)',
        rationale_en: 'Motility of 28% falls below WHO 6th Edition standard lower limit (42%).',
        rationale_ar: 'الحركة الكلية المسجلة (28%) تقل عن الحد الأدنى الموصى به من منظمة الصحة العالمية (42%).',
        guideline_source: 'WHO Laboratory Manual 6th Edition (2021)',
        measured_value: '28%',
        threshold_reference: '≥ 42.0%',
      },
    ],
    summary_en: 'Andrology Consultation Indicated: WHO 6th Edition semen analysis parameters fall below standard reference percentiles.',
    summary_ar: 'يوصى باستشارة تخصصية في طب الذكورة والإخصاب: قياسات فحص النطاف تقع دون المعدلات المعيارية المعتمدة.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T2-OATS-003',
  },

  // 4. TIER 2 - Exogenous Anabolic Steroids / HPG Axis Suppression
  tier2_steroids: {
    triage_tier: 'TIER_2_ANDROLOGY_SPECIALIST',
    action_code: 'REFERRAL_MALE_FERTILITY_SPECIALIST',
    circuit_breaker_triggered: false,
    triggered_rules: [
      {
        rule_id: 'HIST_ANABOLIC_STEROIDS_TRT',
        category: 'ANDROLOGY',
        severity: 'high',
        title_en: 'Exogenous Anabolic-Androgenic Steroids / TRT',
        title_ar: 'استخدام الستيرويدات البنائية أو هرمون التستوستيرون الخارجي',
        rationale_en: 'Exogenous testosterone drives negative feedback on hypothalamic GnRH and pituitary LH/FSH secretion, causing severe azoospermia or severe oligozoospermia.',
        rationale_ar: 'الهرمونات البنائية الخارجية توقف إفراز الغدة النخامية لهرموني LH و FSH، مما يؤدي إلى توقف إنتاج الحيوانات المنوية في الخصية.',
        guideline_source: 'Endocrine Society Clinical Practice Guidelines / AUA Male Infertility',
        measured_value: 'Exogenous Androgen Exposure Active',
        threshold_reference: 'Contraindicated for fertility preservation without HCG/SERM bridging',
      },
    ],
    summary_en: 'Specialized Andrology Consultation Required: Anabolic exposure induces reversible or long-standing gonadotropin axis shutdown.',
    summary_ar: 'استشارة متخصصة في طب الذكورة مطلوبة: الاستخدام الخارجي للهرمونات يستوجب بروتوكول إعادة تنشيط المحور الهرموني النخامي.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T2-TRT-004',
  },

  // 5. TIER 3 - Metabolic Derangement & Clinical Varicocele
  tier3_metabolic: {
    triage_tier: 'TIER_3_PRIMARY_CARE',
    action_code: 'REFERRAL_PCP_WORKUP',
    circuit_breaker_triggered: false,
    triggered_rules: [
      {
        rule_id: 'METABOLIC_HIGH_BMI',
        category: 'METABOLIC',
        severity: 'moderate',
        title_en: 'Elevated BMI (≥30.0 kg/m² - Adipose Aromatase Conversion)',
        title_ar: 'ارتفاع مؤشر كتلة الجسم (≥ 30.0 كجم/م²)',
        rationale_en: 'Visceral obesity elevates peripheral aromatization of androgens into estrogens, lowering intratesticular testosterone bioavailability.',
        rationale_ar: 'زيادة الوزن ترفع نشاط إنزيم الأروماتاز الشحمي وتحول التستوستيرون إلى إستروجين، مما يؤثر على جودة النطاف.',
        guideline_source: 'AUA/ASRM Male Infertility Workup / EAU Guidelines',
        measured_value: '31.4 kg/m²',
        threshold_reference: '< 25.0 kg/m²',
      },
      {
        rule_id: 'LIFE_PROLONGED_SITTING',
        category: 'LIFESTYLE',
        severity: 'low',
        title_en: 'Prolonged Seated Posture (≥8 hrs/day)',
        title_ar: 'الجلوس المتواصل المطول (≥ 8 ساعات يومياً)',
        rationale_en: 'Scrotal intrascrotal temperature rises by 1.8–2.2°C during unbroken sitting, impairing heat-sensitive enzymes.',
        rationale_ar: 'الجلوس لأكثر من 8 ساعات يومياً يرفع حرارة كيس الصفن ويعيق عمل الإنزيمات الحساسة للحرارة.',
        guideline_source: 'International Journal of Andrology / Occupational Health',
        measured_value: '9 hrs/day',
        threshold_reference: '< 8 hrs/day',
      },
    ],
    summary_en: 'Primary Care & Metabolic Workup Recommended: Metabolic optimization and lifestyle posture moderation will enhance fertility biomarkers.',
    summary_ar: 'يوصى بمراجعة الرعاية الصحية الأولية: الفحوصات الأيضية وتعديل نمط الجلوس يدعمان التوازن الهرموني.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T3-METABOLIC-005',
  },

  // 6. TIER 4 - Normal / Lifestyle Preservation
  tier4_optimal: {
    triage_tier: 'TIER_4_LIFESTYLE',
    action_code: 'SELF_GUIDED_OPTIMIZATION',
    circuit_breaker_triggered: false,
    triggered_rules: [],
    summary_en: 'Optimal Baseline: No red flags or abnormal semen thresholds identified. Focus on proactive thermoregulation and antioxidant wellness.',
    summary_ar: 'مؤشرات أولية مطمئنة: لم يتم رصد أي علامات خطر أو هبوط في معايير الفحص. التركيز على العادات الصحية المعززة لخصوبة مستدامة.',
    audit_timestamp: '2026-10-29T00:00:00.000Z',
    algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
    zero_pii_session_id: 'SEED-T4-OPTIMAL-006',
  },
};
