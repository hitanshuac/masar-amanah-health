/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Declarative Priors, ICD-10-CM / SNOMED-CT codes, Likelihood Ratio (LR+/LR-) Edge Definitions,
 * and Discriminating Test Templates for the 4-Layer Diagnostic Graph.
 */

import {
  DifferentialCategory,
  TargetBiomarkerKey,
} from '../../types/diagnosticGraph';

// ============================================================================
// Mathematical Probability & Log-Odds Helpers
// ============================================================================

export function probabilityToLogOdds(p: number): number {
  const clamped = Math.max(0.0001, Math.min(0.9999, p));
  return Math.log(clamped / (1 - clamped));
}

export function logOddsToProbability(lo: number): number {
  return 1 / (1 + Math.exp(-lo));
}

export function binaryEntropy(p: number): number {
  if (p <= 0.0001 || p >= 0.9999) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

// ============================================================================
// Plane B: 6 Competing Etiological Subfertility Branches
// ============================================================================

export interface HypothesisStaticDefinition {
  id: string;
  codeIcd10: string;
  codeSnomed: string;
  category: DifferentialCategory;
  titleEn: string;
  titleAr: string;
  priorProbability: number;
  nullDiscriminatorIds: string[];
}

export const PLANE_B_HYPOTHESIS_DEFINITIONS: Record<string, HypothesisStaticDefinition> = {
  DDX_PRE_TESTICULAR_HPG_SUPPRESSION: {
    id: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    codeIcd10: 'E29.1',
    codeSnomed: '237722003',
    category: 'PRE_TESTICULAR',
    titleEn: 'Pre-Testicular HPG Axis Suppression (Secondary Hypogonadism)',
    titleAr: 'تثبيط المحور النخامي التناسلي قبل الخصوي (قصور الغدد التناسلية الثانوي)',
    priorProbability: 0.15,
    nullDiscriminatorIds: ['TEST_FSH_LH', 'TEST_TESTOSTERONE_ESTRADIOL', 'TEST_PROLACTIN_PITUITARY'],
  },
  DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY: {
    id: 'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
    codeIcd10: 'E66.9',
    codeSnomed: '414916001',
    category: 'METABOLIC',
    titleEn: 'Metabolic Aromatase Hyper-Conversion Endocrinopathy',
    titleAr: 'اعتلال الغدد الصماء الأيضي بفرط تحويل الأروماتاز وتراجع نسبة التستوستيرون',
    priorProbability: 0.20,
    nullDiscriminatorIds: ['TEST_TESTOSTERONE_ESTRADIOL', 'TEST_FSH_LH'],
  },
  DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE: {
    id: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    codeIcd10: 'N46.01',
    codeSnomed: '237726000',
    category: 'TESTICULAR',
    titleEn: 'Primary Testicular Intrinsic Sertoli-Leydig Spermatogenic Failure',
    titleAr: 'فشل الخلايا الخصوية الأولي الداخلي (متلازمة سيرتولي ليديج)',
    priorProbability: 0.12,
    nullDiscriminatorIds: ['TEST_FSH_LH', 'TEST_CONFIRMATORY_SEMEN_TMSC'],
  },
  DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME: {
    id: 'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
    codeIcd10: 'I86.1',
    codeSnomed: '44669002',
    category: 'TESTICULAR',
    titleEn: 'Varicocele Pampiniform Reflux & Scrotal Hyperthermia Syndrome',
    titleAr: 'متلازمة دوالي الخصية مع الارتجاع الوريدي والإجهاد الحراري التأكسدي',
    priorProbability: 0.24,
    nullDiscriminatorIds: ['TEST_CONFIRMATORY_SEMEN_TMSC'],
  },
  DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION: {
    id: 'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
    codeIcd10: 'N46.02',
    codeSnomed: '405624009',
    category: 'POST_TESTICULAR',
    titleEn: 'Post-Testicular Excretory Ductal Obstruction / Hypoplasia',
    titleAr: 'الانسداد القنوي الإخراجي بعد الخصوي / نقص التنسج الحويصلي المنوي',
    priorProbability: 0.08,
    nullDiscriminatorIds: ['TEST_SEMINAL_FRUCTOSE_OBSTRUCTION', 'TEST_FSH_LH'],
  },
  DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY: {
    id: 'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    codeIcd10: 'T38.5X5A',
    codeSnomed: '297184000',
    category: 'IATROGENIC',
    titleEn: 'Delayed Pharmacological Spermatotoxicity (74-Day Lag Axis)',
    titleAr: 'التسمم النطافي الدوائي المتأخر (محور التأخر الزمني 74 يوماً لمثبطات 5-ARI)',
    priorProbability: 0.10,
    nullDiscriminatorIds: ['TEST_CONFIRMATORY_SEMEN_TMSC', 'TEST_TESTOSTERONE_ESTRADIOL'],
  },
};

// ============================================================================
// Likelihood Ratio (LR+/LR-) Edge Matrix Definitions
// ============================================================================

export interface EvidenceEdgeRule {
  hypothesisId: string;
  sourceSignalId: string;
  labelEn: string;
  labelAr: string;
  lrPlus: number;  // Positive likelihood ratio if signal condition is active (> 1.0 supports)
  lrMinus: number; // Negative likelihood ratio if signal condition is absent (< 1.0 contradicts)
  weight?: number; // Scaling factor w_ij, defaults to 1.0
}

export const EVIDENCE_EDGE_RULES: EvidenceEdgeRule[] = [
  // --------------------------------------------------------------------------
  // DDX_PRE_TESTICULAR_HPG_SUPPRESSION
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_FSH_LH_STATE',
    labelEn: 'Hypogonadotropic suppression: Inappropriately low or low-normal FSH & LH',
    labelAr: 'تثبيط المحور النخامي: انخفاض غير ملائم لهرموني FSH و LH',
    lrPlus: 12.0,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_TOTAL_TESTOSTERONE',
    labelEn: 'Subnormal Morning Total Testosterone (< 260 ng/dL)',
    labelAr: 'انخفاض هرمون التستوستيرون الكلي الصباحي (< 260 نانوغرام/ديسيلتر)',
    lrPlus: 3.8,
    lrMinus: 0.45,
  },
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_BMI',
    labelEn: 'Visceral metabolic load: BMI >= 28.0 kg/m²',
    labelAr: 'الحمل الأيضي الحشوي: مؤشر كتلة الجسم >= 28.0 كغ/م²',
    lrPlus: 2.1,
    lrMinus: 0.85,
  },
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_SLEEP_DEPRIVATION',
    labelEn: 'Sahatna sleep deficiency (< 5.8h avg) impairing diurnal LH pulsatility',
    labelAr: 'نقص ساعات النوم عبر صحتنا (< 5.8 ساعة) يخل بنبضات هرمون LH',
    lrPlus: 1.8,
    lrMinus: 0.90,
  },
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_OLIGOZOOSPERMIA_SUSPICION',
    labelEn: 'Documented Oligozoospermia / Low TMSC (< 20M) awaiting endocrine discrimination',
    labelAr: 'توثيق قلة النطاف أو انخفاض إجمالي النطاف المتحركة بانتظار التمييز الهرموني',
    lrPlus: 5.5,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    sourceSignalId: 'SIG_HIGH_FSH',
    labelEn: 'Contradiction: Elevated FSH (> 7.6 IU/L) refutes secondary hypogonadism',
    labelAr: 'تناقض: ارتفاع هرمون FSH ينفي قصور النخامية الثانوي',
    lrPlus: 0.04,
    lrMinus: 1.0,
  },

  // --------------------------------------------------------------------------
  // DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
    sourceSignalId: 'SIG_T_E2_RATIO',
    labelEn: 'Pathological Aromatase Hyper-Conversion: T/E2 Ratio < 10.0',
    labelAr: 'فرط تحويل الأروماتاز المرضي: نسبة التستوستيرون للإستراديول < 10.0',
    lrPlus: 11.5,
    lrMinus: 0.25,
  },
  {
    hypothesisId: 'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
    sourceSignalId: 'SIG_HBA1C_DRIFT',
    labelEn: 'IFHAS Metabolic Syndrome: Prediabetes or HbA1c drift >= 5.7%',
    labelAr: 'متلازمة إفحص الأيضية: ما قبل السكري أو ارتفاع السكر التراكمي >= 5.7%',
    lrPlus: 3.2,
    lrMinus: 0.65,
  },
  {
    hypothesisId: 'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
    sourceSignalId: 'SIG_BMI',
    labelEn: 'Adipose aromatase burden: Overweight / Obesity (BMI >= 27.5)',
    labelAr: 'عبء النسيج الشحمي للأروماتاز: زيادة الوزن أو السمنة (BMI >= 27.5)',
    lrPlus: 3.0,
    lrMinus: 0.55,
  },
  {
    hypothesisId: 'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
    sourceSignalId: 'SIG_MOTILITY_IMPAIRMENT',
    labelEn: 'Asthenozoospermia from peripheral oxidative stress (Motility < 42%)',
    labelAr: 'ضعف حركة النطاف الناتج عن الإجهاد التأكسدي المحيطي (< 42%)',
    lrPlus: 2.3,
    lrMinus: 0.70,
  },

  // --------------------------------------------------------------------------
  // DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    sourceSignalId: 'SIG_HIGH_FSH',
    labelEn: 'Hypergonadotropic marker: Elevated FSH (> 7.6 IU/L) due to Sertoli arrest',
    labelAr: 'مؤشر فرط موجهات الغدد التناسلية: ارتفاع FSH (> 7.6) لتوقف خلايا سيرتولي',
    lrPlus: 20.0,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    sourceSignalId: 'SIG_SEVERE_OLIGOZOOSPERMIA',
    labelEn: 'Severe spermatogenic collapse: Concentration < 5.0 M/mL',
    labelAr: 'انهيار حاد في إنتاج النطاف: التركيز < 5.0 مليون/مل',
    lrPlus: 4.6,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    sourceSignalId: 'SIG_CRYPTORCHIDISM',
    labelEn: 'Anatomical intrinsic damage: History of Cryptorchidism or Mumps Orchitis',
    labelAr: 'ضرر تشريحي داخلي: تاريخ الخصية الهاجرة أو التهاب النكاف الخصوي',
    lrPlus: 6.5,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    sourceSignalId: 'SIG_OLIGOZOOSPERMIA_SUSPICION',
    labelEn: 'Documented Oligozoospermia / Low TMSC (< 20M) awaiting endocrine discrimination',
    labelAr: 'توثيق قلة النطاف أو انخفاض إجمالي النطاف المتحركة بانتظار التمييز الهرموني',
    lrPlus: 6.0,
    lrMinus: 1.0,
  },
  {
    hypothesisId: 'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    sourceSignalId: 'SIG_LOW_FSH_CONTRADICTION',
    labelEn: 'Contradiction: Low or suppressed FSH (< 2.0 IU/L) refutes primary failure',
    labelAr: 'تناقض: انخفاض FSH ينفي فشل الخلايا الخصوية الأولي',
    lrPlus: 0.05,
    lrMinus: 1.0,
  },

  // --------------------------------------------------------------------------
  // DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
    sourceSignalId: 'SIG_VARICOCELE_CLINICAL',
    labelEn: 'Clinical Varicocele: Palpable Grade 2 or 3 Pampiniform Reflux',
    labelAr: 'دوالي الخصية السريرية: ارتجاع وريدي ملموس من الدرجة الثانية أو الثالثة',
    lrPlus: 9.8,
    lrMinus: 0.35,
  },
  {
    hypothesisId: 'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
    sourceSignalId: 'SIG_TMSC_VELOCITY_DECAY',
    labelEn: 'Occult progressive decay: TMSC velocity <= -8.0% per month',
    labelAr: 'تراجع تدريجي خفي: انحدار سرعة النطاف المتحركة <= -8.0% شهرياً',
    lrPlus: 4.0,
    lrMinus: 0.65,
  },
  {
    hypothesisId: 'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
    sourceSignalId: 'SIG_THERMAL_SEDENTARY',
    labelEn: 'Scrotal hyperthermia exposure: Frequent heat / prolonged sitting > 8h',
    labelAr: 'فرط الحرارة الصفنية: التعرض للحرارة أو الجلوس المطول > 8 ساعات',
    lrPlus: 2.2,
    lrMinus: 0.80,
  },
  {
    hypothesisId: 'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
    sourceSignalId: 'SIG_OATS_PATTERN',
    labelEn: 'Oligo-astheno-teratozoospermia (OATS) stress triad on semen profile',
    labelAr: 'ثالوث اعتلال النطاف المشترك (العدد، الحركة، والتشوهات) OATS',
    lrPlus: 3.1,
    lrMinus: 0.70,
  },

  // --------------------------------------------------------------------------
  // DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
    sourceSignalId: 'SIG_LOW_SEMEN_VOLUME',
    labelEn: 'Ejaculatory volume deficit: Volume < 1.4 mL (WHO 6th limit)',
    labelAr: 'نقص حجم السائل المنوي: أقل من 1.4 مل (حد منظمة الصحة العالمية السادس)',
    lrPlus: 10.5,
    lrMinus: 0.28,
  },
  {
    hypothesisId: 'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
    sourceSignalId: 'SIG_NORMAL_FSH',
    labelEn: 'Preserved intrinsic spermatogenesis: Serum FSH normal (1.5 - 7.6 IU/L)',
    labelAr: 'سلامة إنتاج النطاف الداخلي: هرمون FSH طبيعي (1.5 - 7.6 وحدة/لتر)',
    lrPlus: 2.8,
    lrMinus: 0.50,
  },
  {
    hypothesisId: 'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
    sourceSignalId: 'SIG_HIGH_FSH_CONTRADICTION',
    labelEn: 'Contradiction: Markedly elevated FSH refutes isolated ductal obstruction',
    labelAr: 'تناقض: ارتفاع هرمون FSH الحاد ينفي الانسداد القنوي المنعزل',
    lrPlus: 0.05,
    lrMinus: 1.0,
  },

  // --------------------------------------------------------------------------
  // DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY
  // --------------------------------------------------------------------------
  {
    hypothesisId: 'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    sourceSignalId: 'SIG_DELAYED_5ARI_ACTIVE',
    labelEn: 'Active 5-ARI (Finasteride/Dutasteride) initiated >= 74 days prior',
    labelAr: 'استخدام نشط لمثبطات 5-ARI (فيناستيرايد) بدأ منذ 74 يوماً على الأقل',
    lrPlus: 15.0,
    lrMinus: 0.25,
  },
  {
    hypothesisId: 'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    sourceSignalId: 'SIG_DELAYED_TRT_ACTIVE',
    labelEn: 'Active exogenous TRT or Anabolic Androgen exposure initiated >= 74 days',
    labelAr: 'تعرض للتستوستيرون الخارجي أو الستيرويدات بدأ منذ 74 يوماً على الأقل',
    lrPlus: 18.0,
    lrMinus: 0.20,
  },
  {
    hypothesisId: 'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    sourceSignalId: 'SIG_POST_MED_TMSC_DROP',
    labelEn: 'Temporal decline: Severe TMSC or volume drop following drug inception',
    labelAr: 'تراجع زمني: هبوط حاد في عدد النطاف أو الحجم عقب بدء الدواء',
    lrPlus: 5.4,
    lrMinus: 0.55,
  },
  {
    hypothesisId: 'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    sourceSignalId: 'SIG_SSRI_ACTIVE',
    labelEn: 'Active SSRI psychotropic medication causing delayed ejaculatory motility drop',
    labelAr: 'استخدام أدوية الاكتئاب SSRI يسبب تراجع الحركة وتأخر القذف',
    lrPlus: 2.8,
    lrMinus: 0.85,
  },
];

// ============================================================================
// Plane A: 4 Life- & Organ-Saving Escalation Definitions
// ============================================================================

export interface EscalationStaticDefinition {
  id: string;
  titleEn: string;
  titleAr: string;
  icd10Code: string;
  snomedCode: string;
  rationaleEn: string;
  rationaleAr: string;
  urgentActionEn: string;
  urgentActionAr: string;
  requiredStatLabs: string[];
}

export const PLANE_A_ESCALATION_DEFINITIONS: Record<string, EscalationStaticDefinition> = {
  ESC_OCCULT_PITUITARY_NEUROENDOCRINE: {
    id: 'ESC_OCCULT_PITUITARY_NEUROENDOCRINE',
    titleEn: 'Occult Pituitary Neuroendocrine Macroadenoma / Prolactinoma Screen',
    titleAr: 'فحص ورم الغدة النخامية العصبي الصماوي الخفي / الورم البرولاكتيني',
    icd10Code: 'D35.2',
    snomedCode: '254956000',
    rationaleEn:
      'Severe oligozoospermia with low total testosterone (< 260 ng/dL) and inappropriately low or normal gonadotropins (FSH/LH <= 2.5 IU/L) signals pituitary-hypothalamic unresponsiveness. Undiagnosed prolactinomas or macroadenomas risk irreversible optic chiasm compression, bitemporal hemianopsia, and panhypopituitarism if treated simply as routine subfertility.',
    rationaleAr:
      'قلة النطاف الشديدة مع انخفاض هرمون التستوستيرون (< 260 نانوغرام/ديسيلتر) وتثبيط غير ملائم لهرموني FSH و LH يشير إلى قصور تناسلي مركزي غير معوض. إهمال هذا المؤشر يعرض المريض لخطر انضغاط العصب البصري وفقدان الرؤية نتيجة أورام النخامية غير المشخصة.',
    urgentActionEn:
      'STAT Serum Prolactin (LOINC 2842-3) and High-Resolution Contrast-Enhanced Sellar MRI with dedicated Pituitary Protocol. Expedite urgent Neuro-Endocrinology and Neuro-Ophthalmology consultation.',
    urgentActionAr:
      'طلب فحص عاجل لهرمون البرولاكتين (LOINC 2842-3) وتصوير الرنين المغناطيسي المقطعي للسرج التركي مع بروتوكول النخامية، واستشارة عاجلة لطب الغدد الصماء وأعصاب العين.',
    requiredStatLabs: [
      'LOINC 2842-3 (Serum Prolactin)',
      'Sellar MRI with Pituitary Protocol',
      'Automated Visual Field Perimetry',
    ],
  },
  ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR: {
    id: 'ESC_SILENT_CARDIOMETABOLIC_MACE_PRECURSOR',
    titleEn: 'Silent Cardiometabolic Precursor & 5-Year MACE Alert (ADPHC Priority)',
    titleAr: 'منبه الخطر القلبي الوعائي والأيضي الصامت (أولوية مركز أبوظبي للصحة العامة)',
    icd10Code: 'I25.10',
    snomedCode: '394841004',
    rationaleEn:
      'In men aged 25–55, male reproductive vascular failure and testosterone decay are the earliest clinical harbingers of systemic endothelial dysfunction, preceding Major Adverse Cardiac Events (MACE) by 3 to 5 years. Concurrent visceral adiposity (BMI >= 28), prediabetes (HbA1c >= 5.8%), elevated resting heart rate (>= 82 bpm), and severe sleep deficit represent an occult cardiovascular emergency.',
    rationaleAr:
      'يعد الاعتلال الوعائي التناسلي وتراجع التستوستيرون عند الرجال المؤشر المبكر الأول لخلل البطانة الوعائية، حيث يسبق الجلطات القلبية والسكتات بـ 3-5 سنوات. تزامن ارتفاع السكر التراكمي ومعدل النبض وقلة النوم يمثل إنذاراً قلبياً مبكراً يستوجب تدخلاً استباقياً عاجلاً.',
    urgentActionEn:
      'Immediate referral to ADPHC IFHAS Cardiovascular Prevention Pathway: Comprehensive ApoB / Advanced Lipid Panel, high-sensitivity Troponin, coronary CT calcium scoring, and intensive cardiometabolic lifestyle intervention.',
    urgentActionAr:
      'إحالة فورية لمسار الوقاية القلبية في برنامج إفحص (ADPHC IFHAS): فحص صميم البروتين الشحمي ApoB، التروبونين فائق الحساسية، تصوير تكلس الشرايين التاجية، والتدخل الأيضي المكثف.',
    requiredStatLabs: [
      'LOINC 1884-6 (Apolipoprotein B)',
      'LOINC 4548-4 (HbA1c Glycated Hemoglobin)',
      'LOINC 10839-9 (High-Sensitivity Troponin I)',
      'Fasting Insulin & HOMA-IR Index',
    ],
  },
  ESC_GERM_CELL_NEOPLASIA_HIGH_RISK: {
    id: 'ESC_GERM_CELL_NEOPLASIA_HIGH_RISK',
    titleEn: 'High-Risk Testicular Germ Cell Neoplasia (TGCT / GCNIS) Screen',
    titleAr: 'فحص أورام الخلايا الجرثومية الخصوية عالية الخطورة (TGCT / GCNIS)',
    icd10Code: 'C62.9',
    snomedCode: '373335003',
    rationaleEn:
      'Childhood cryptorchidism combined with severe oligozoospermia (< 5.0 M/mL) or intrinsic testicular volume atrophy confers up to a 20-fold elevated relative risk for Testicular Germ Cell Neoplasia in Situ (GCNIS). Any painless firm testicular lump is presumed malignant until proven otherwise.',
    rationaleAr:
      'يقترن تاريخ الخصية الهاجرة مع قلة النطاف الحادة (< 5.0 مليون/مل) بارتفاع خطر أورام الخصية الجرثومية الخبيثة بنسبة تصل إلى 20 ضعفاً. كما يُعتبر أي ورم صفني صلب وغير مؤلم ورماً خبيثاً حتى يثبت العكس.',
    urgentActionEn:
      'Urgent High-Resolution Scrotal Color Doppler Ultrasound within 48 hours + STAT Serum Tumor Markers (AFP, beta-hCG, LDH). Urgent referral to Urologic Oncology.',
    urgentActionAr:
      'تصوير عاجل بالموجات فوق الصوتية والدوبلر لكيس الصفن خلال 48 ساعة مع طلب دلالات الأورام في الدم (AFP, beta-hCG, LDH) وإحالة فورية لجراحة أورام المسالك.',
    requiredStatLabs: [
      'LOINC 53957-7 (Alpha-Fetoprotein AFP)',
      'LOINC 2119-6 (Beta-Human Chorionic Gonadotropin)',
      'LOINC 2532-0 (Lactate Dehydrogenase LDH)',
      'High-Resolution Scrotal Duplex Ultrasound',
    ],
  },
  ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS: {
    id: 'ESC_ACUTE_TORSION_OR_RETROPERITONEAL_MASS',
    titleEn: 'Acute Scrotal Emergency: Spermatic Torsion / Retroperitoneal Obstruction',
    titleAr: 'طارئ صفني حاد: التواء الحبل المنوي / انسداد وريدي خلف الصفاق',
    icd10Code: 'N44.0',
    snomedCode: '79815004',
    rationaleEn:
      'Acute scrotal pain of sudden onset is an organ-threatening emergency carrying a strict 6-hour surgical salvage window for spermatic cord detorsion. An isolated or non-reducible right-sided varicocele is an anatomic red flag requiring urgent exclusion of a retroperitoneal tumor (e.g. Renal Cell Carcinoma) compressing the inferior vena cava.',
    rationaleAr:
      'يمثل الألم الصفني الحاد والمفاجئ طارئاً جراحياً حرجاً بنافذة إنقاذ لا تتعدى 6 ساعات لتفادي موت الخصية بالالتواء. وتعد دوالي الخصية اليمنى المنعزلة أو غير المرتجعة مؤشراً تشريحياً خطيراً يستدعي نفي وجود كتلة خلف الصفاق تضغط على الوريد الأجوف السفلي.',
    urgentActionEn:
      'IMMEDIATE STAT Emergency Department Transfer: Bedside Scrotal Color Doppler within 60 minutes for surgical salvage; Contrast-Enhanced Abdominal/Retroperitoneal CT if right-sided non-reducible varicocele.',
    urgentActionAr:
      'تحويل فوري وفائق السرعة لقسم طوارئ المستشفى لإجراء فحص الدوبلر خلال 60 دقيقة للإنقاذ الجراحي، مع تصوير مقطعي بالصبغة للبطن وخلف الصفاق في حال دوالي الخصية اليمنى.',
    requiredStatLabs: [
      'STAT Emergency Scrotal Color Doppler Ultrasound',
      'Abdominopelvic Contrast CT (if right-sided non-reducible varicocele)',
    ],
  },
};

// ============================================================================
// 5 Candidate Discriminating Test Orders (Active Loop Information Gain)
// ============================================================================

export interface DiscriminatingTestTemplate {
  testId: string;
  loincCode: string;
  nameEn: string;
  nameAr: string;
  targetBiomarkerKey: TargetBiomarkerKey;
  separatesHypotheses: string[];
  defaultSimulatedIfAbnormal: {
    valuePreview: number;
    labelEn: string;
    topHypothesisShiftEn: string;
  };
  defaultSimulatedIfNormal: {
    valuePreview: number;
    labelEn: string;
  };
}

export const DISCRIMINATING_TEST_TEMPLATES: Record<string, DiscriminatingTestTemplate> = {
  TEST_FSH_LH: {
    testId: 'TEST_FSH_LH',
    loincCode: '15067-2 / 10501-5',
    nameEn: 'Serum FSH & LH Gonadotropin Profile',
    nameAr: 'فحص هرمونات النخامية المنبهة للغدد التناسلية (FSH و LH)',
    targetBiomarkerKey: 'fshIuL',
    separatesHypotheses: [
      'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
      'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
      'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
    ],
    defaultSimulatedIfAbnormal: {
      valuePreview: 16.5,
      labelEn: 'High FSH (16.5 IU/L, Intrinsic Sertoli Failure)',
      topHypothesisShiftEn: 'Confirms Primary Testicular Intrinsic Failure (> 85% posterior)',
    },
    defaultSimulatedIfNormal: {
      valuePreview: 4.5,
      labelEn: 'Normal FSH (4.5 IU/L, Intact Spermatogenic Potential)',
    },
  },
  TEST_TESTOSTERONE_ESTRADIOL: {
    testId: 'TEST_TESTOSTERONE_ESTRADIOL',
    loincCode: '2986-8 / 2243-4',
    nameEn: 'Morning Total Testosterone & Estradiol (E2) Ratio Panel',
    nameAr: 'لوحة التستوستيرون الكلي الصباحي ونسبة الإستراديول (T/E2)',
    targetBiomarkerKey: 'estradiolPgMl',
    separatesHypotheses: [
      'DDX_METABOLIC_AROMATASE_ENDOCRINOPATHY',
      'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    ],
    defaultSimulatedIfAbnormal: {
      valuePreview: 48.0,
      labelEn: 'Elevated E2 (48 pg/mL, T/E2 Ratio = 5.8)',
      topHypothesisShiftEn: 'Confirms Metabolic Aromatase Hyper-Conversion Syndrome',
    },
    defaultSimulatedIfNormal: {
      valuePreview: 22.0,
      labelEn: 'Physiologic E2 (22 pg/mL, T/E2 Ratio = 14.2)',
    },
  },
  TEST_PROLACTIN_PITUITARY: {
    testId: 'TEST_PROLACTIN_PITUITARY',
    loincCode: '2842-3',
    nameEn: 'Serum Prolactin (Pituitary Sellar Mass Screen)',
    nameAr: 'فحص هرمون البرولاكتين المصلي (كشف أورام السرج النخامي)',
    targetBiomarkerKey: 'prolactinNgMl',
    separatesHypotheses: [
      'ESC_OCCULT_PITUITARY_NEUROENDOCRINE',
      'DDX_PRE_TESTICULAR_HPG_SUPPRESSION',
    ],
    defaultSimulatedIfAbnormal: {
      valuePreview: 68.0,
      labelEn: 'Hyperprolactinemia (68 ng/mL, Macro-Adenoma Threshold)',
      topHypothesisShiftEn: 'Escalates Occult Pituitary Adenoma to STAT Life-Saving Priority',
    },
    defaultSimulatedIfNormal: {
      valuePreview: 9.5,
      labelEn: 'Normal Prolactin (9.5 ng/mL)',
    },
  },
  TEST_SEMINAL_FRUCTOSE_OBSTRUCTION: {
    testId: 'TEST_SEMINAL_FRUCTOSE_OBSTRUCTION',
    loincCode: '2280-6',
    nameEn: 'Seminal Fructose & pH Ductal Patency Panel',
    nameAr: 'فحص الفركتوز وحموضة السائل المنوي للكشف عن الانسداد القنوي',
    targetBiomarkerKey: 'semenPanel',
    separatesHypotheses: [
      'DDX_POST_TESTICULAR_DUCTAL_OBSTRUCTION',
      'DDX_PRIMARY_TESTICULAR_SERTOLI_FAILURE',
    ],
    defaultSimulatedIfAbnormal: {
      valuePreview: 0.0,
      labelEn: 'Absent Seminal Fructose with Acidic pH (< 7.0)',
      topHypothesisShiftEn: 'Confirms Complete Post-Testicular Ejaculatory Duct Obstruction',
    },
    defaultSimulatedIfNormal: {
      valuePreview: 18.0,
      labelEn: 'Positive Seminal Fructose (Alkaline pH >= 7.2)',
    },
  },
  TEST_CONFIRMATORY_SEMEN_TMSC: {
    testId: 'TEST_CONFIRMATORY_SEMEN_TMSC',
    loincCode: '97059-0',
    nameEn: 'Confirmatory WHO 6th Semen Analysis with TMSC Velocity Verification',
    nameAr: 'فحص السائل المنوي التأكيدي وفق معايير منظمة الصحة العالمية والسرعة النطافية',
    targetBiomarkerKey: 'semenPanel',
    separatesHypotheses: [
      'DDX_VARICOCELE_THERMAL_OXIDATIVE_SYNDROME',
      'DDX_IATROGENIC_PHARMACOLOGICAL_TOXICITY',
    ],
    defaultSimulatedIfAbnormal: {
      valuePreview: 8.5,
      labelEn: 'Persistently Low TMSC (8.5M, Active Longitudinal Velocity Loss)',
      topHypothesisShiftEn: 'Confirms Progressive Pathological Gonadal Degradation',
    },
    defaultSimulatedIfNormal: {
      valuePreview: 28.0,
      labelEn: 'Rebounding TMSC (28.0 Million, Physiological Transient Fluctuation)',
    },
  },
};

// ============================================================================
// 5 Technician Blind-Spot Syndrome Definitions
// ============================================================================

export interface BlindSpotSyndromeTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  severity: 'LIFE_SAVING' | 'HIGH' | 'MODERATE';
  parentSignalIds: string[];
  whatTechSeesEn: string;
  whatTechSeesAr: string;
  whatGraphCatchesEn: string;
  whatGraphCatchesAr: string;
}

export const BLIND_SPOT_SYNDROME_TEMPLATES: Record<string, BlindSpotSyndromeTemplate> = {
  SYN_FALSE_NORMAL_SUBFERTILITY: {
    id: 'SYN_FALSE_NORMAL_SUBFERTILITY',
    titleEn: 'The "False-Normal" Lab Trap: Compound Marginal Subfertility',
    titleAr: 'فخ النتائج الطبيعية الظاهرية: العقم الحدي المركب',
    severity: 'HIGH',
    parentSignalIds: ['SIG_VOLUME', 'SIG_CONCENTRATION', 'SIG_MOTILITY', 'SIG_TMSC'],
    whatTechSeesEn:
      'All 4 WHO 6th Edition single-column parameters pass reference thresholds (Volume >= 1.4 mL, Conc >= 15 M/mL, Motility >= 42%, Morphology >= 4%). The electronic health record displays green "NORMAL" badges across every test line.',
    whatTechSeesAr:
      'جميع معايير منظمة الصحة العالمية الأربعة المفردة تجاوزت الحدود المرجعية الدنيا وتظهر في سجل المختبر كقيم "طبيعية" باللون الأخضر.',
    whatGraphCatchesEn:
      'Multi-parameter compound calculation reveals Total Motile Sperm Count (TMSC) is severely subfertile (< 20.0 Million, e.g. 1.5 mL * 16 M/mL * 43% = 10.3M). Clinically, this patient experiences a < 5% unassisted natural pregnancy rate despite "Normal" lab printouts.',
    whatGraphCatchesAr:
      'الحساب التراكمي للعدد الإجمالي للنطاف المتحركة (TMSC) يكشف عن عقم حاد (< 20 مليون)، مما يجعل فرصة الحمل الطبيعي أقل من 5% رغم ظهور الفحوصات الفردية كطبيعية.',
  },
  SYN_OCCULT_LONGITUDINAL_DECAY: {
    id: 'SYN_OCCULT_LONGITUDINAL_DECAY',
    titleEn: 'Occult Longitudinal Decay: Progressive Gonadal Degradation Velocity',
    titleAr: 'التراجع الطولي الخفي: سرعة التدهور الخصوي المتسارع عبر الزيارات',
    severity: 'HIGH',
    parentSignalIds: ['SIG_TMSC_VELOCITY', 'SIG_CONCENTRATION', 'SIG_TMSC'],
    whatTechSeesEn:
      'Current sperm concentration is 16.0 M/mL, which satisfies the laboratory normal range (>= 15 M/mL). Because each encounter is evaluated as an isolated snapshot, the test is marked stable.',
    whatTechSeesAr:
      'تركيز النطاف الحالي 16.0 مليون/مل يقع ضمن المعدل الطبيعي. ولأن كل زيارة تُقرأ كلقطة منفصلة، يعتبر الفحص مستقراً.',
    whatGraphCatchesEn:
      'Cross-visit longitudinal velocity is -11.2% per month (TMSC plummeted from 34.0M to 10.3M over 6 months). The patient is on a rapid trajectory toward severe oligozoospermia that single-point evaluation completely overlooks.',
    whatGraphCatchesAr:
      'السرعة الطولية عبر الزيارات تبلغ -11.2% شهرياً (انخفض العدد المتحرك من 34 مليون إلى 10.3 مليون خلال 6 أشهر)، مما يعكس تدهوراً خصوياً متسارعاً يغفله التقييم المنفرد.',
  },
  SYN_SUBCLINICAL_AROMATASE_SLEEP_AXIS: {
    id: 'SYN_SUBCLINICAL_AROMATASE_SLEEP_AXIS',
    titleEn: 'Subclinical Aromatase-Sleep Axis: Visceral Adipose Endocrinopathy',
    titleAr: 'محور الأروماتاز والنوم تحت السريري: اعتلال النسيج الشحمي الحشوي',
    severity: 'MODERATE',
    parentSignalIds: ['SIG_T_E2_RATIO', 'SIG_BMI', 'SIG_SLEEP_DEPRIVATION', 'SIG_HBA1C'],
    whatTechSeesEn:
      'Technician notes mild overweight (BMI 27.8) and borderline sperm motility (43%); symptoms are dismissed as non-specific work stress or routine fatigue.',
    whatTechSeesAr:
      'يلاحظ الفني زيادة طفيفة في الوزن (BMI 27.8) وحركة نطاف حدية (43%)، وتُعزى الأعراض لإجهاد العمل الروتيني.',
    whatGraphCatchesEn:
      'Cross-silo physiological coupling: Visceral adipose aromatase over-activation converts Testosterone to Estradiol (T/E2 ratio < 10.0), compounded by Sahatna-tracked sleep deficit (< 5.8h) that blunts LH pulses and triggers sperm membrane oxidative damage.',
    whatGraphCatchesAr:
      'تفاعل فيزيولوجي عابر للأنظمة: يؤدي فرط إنزيم الأروماتاز في النسيج الشحمي إلى تحويل التستوستيرون إلى إستراديول (T/E2 < 10)، بالتزامن مع قلة النوم في صحتنا (< 5.8 ساعة) التي تثبط هرمونات النخامية.',
  },
  SYN_DELAYED_IATROGENIC_SPERMATOTOXICITY: {
    id: 'SYN_DELAYED_IATROGENIC_SPERMATOTOXICITY',
    titleEn: 'Delayed Iatrogenic Spermatotoxicity: 74-Day Spermatogenic Lag',
    titleAr: 'التسمم النطافي الدوائي المتأخر: فجوة الـ 74 يوماً للدورة المنوية',
    severity: 'HIGH',
    parentSignalIds: ['SIG_DELAYED_5ARI_ACTIVE', 'SIG_POST_MED_TMSC_DROP', 'SIG_VOLUME'],
    whatTechSeesEn:
      'Patient takes oral finasteride or topical 5-ARI prescribed in Dermatology 6 months ago for androgenetic alopecia; medication is ignored during fertility evaluation.',
    whatTechSeesAr:
      'المريض يتناول فيناستيرايد موصوفاً في الجلدية منذ 6 أشهر لتساقط الشعر؛ ولا يتم ربط هذا الدواء بتقييم الخصوبة.',
    whatGraphCatchesEn:
      'The 74-day human spermatogenic maturation cycle has fully elapsed since drug initiation. Dihydrotestosterone (DHT) suppression in the epididymis and prostate has induced seminal volume reduction and profound TMSC depression.',
    whatGraphCatchesAr:
      'اكتملت دورة نضج النطاف (74 يوماً) منذ بدء الدواء. تثبيط هرمون DHT في البربخ والبروستاتا تسبب في انخفاض حجم السائل المنوي وهبوط حاد في حركة النطاف.',
  },
  SYN_LOW_VOLUME_OBSTRUCTIVE_MASK: {
    id: 'SYN_LOW_VOLUME_OBSTRUCTIVE_MASK',
    titleEn: 'Low-Volume Obstructive Mask: Post-Testicular Outflow Defect',
    titleAr: 'قناع الحجم المنخفض الانسدادي: عيب مجرى القذف بعد الخصوي',
    severity: 'HIGH',
    parentSignalIds: ['SIG_LOW_SEMEN_VOLUME', 'SIG_CONCENTRATION', 'SIG_NORMAL_FSH'],
    whatTechSeesEn:
      'Low ejaculation volume (1.2 mL) is dismissed as sample collection loss, incomplete ejaculation, or patient stress in the collection booth.',
    whatTechSeesAr:
      'يُعزى انخفاض حجم القذف (1.2 مل) لعدم اكتمال العينة أو القلق أثناء جمعها في المختبر.',
    whatGraphCatchesEn:
      'Low volume (< 1.4 mL) paired with low concentration and normal FSH indicates anatomical ductal blockage or seminal vesicle aplasia—preserving testicular spermatogenesis and warranting transrectal ultrasound rather than endocrine therapy.',
    whatGraphCatchesAr:
      'انخفاض الحجم (< 1.4 مل) مع قلة النطاف وسلامة هرمون FSH يشير إلى انسداد قنوي تشريحي أو غياب الحويصلات المنوية مع سلامة إنتاج الخصية الداخلي، مما يتطلب موجات فوق صوتية وليس علاجاً هرمونياً.',
  },
};

