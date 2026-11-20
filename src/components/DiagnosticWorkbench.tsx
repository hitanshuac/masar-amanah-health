/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Longitudinal Differential Workbench (Malaffi EHR & Bayesian Loop)
 * NHS-style Single 1-Click Step-by-Step Guided Loop Workflow:
 * - Persistent Top Guided Loop Controller Bar
 *   - Patient Selector Pills (MALAFFI-PT-001..006)
 *   - 4-Step Visual Loop Progress Stepper
 *   - Open Loops Badge (2 Open Loops -> 1 -> 0 Closed ✓)
 *   - Master Single 1-Click Guided CTA Button (btn-guided-loop-next)
 * - Progressive Disclosure:
 *   - Step 1: Longitudinal Scan & Blind Spots
 *   - Step 2: Causal Root-Tree & Differential
 *   - Step 3: Close Open Loops Station (Card A: NULL Lab, Card B: +90d Follow-Up & calibration drawer)
 *   - Step 4: Converged Care Plan & FHIR Handoff
 * - Show All Regions (Expert View) toggle
 */

import { useState, useEffect } from 'react';
import {
  LongitudinalPatientRecord,
  ClosedLoopGraphEvaluation,
} from '../types/diagnosticGraph';
import { LONGITUDINAL_MALAFFI_COHORT } from '../data/longitudinalCohort';
import {
  evaluatePatientGraph,
  resolveNullBiomarkerInLoop,
  mutatePatientEncounterInLoop,
  computeDeterministicGraphSignature,
  EncounterMutationPatch,
} from '../lib/diagnosticGraph/loopController';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Dna,
  HeartPulse,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
  PlusCircle,
  Sliders,
  GitBranch,
  Play,
  Pause,
  Bot,
  FileText,
  Layers,
  HelpCircle,
  XCircle,
  Building2,
  Lock,
  Unlock,
  AlertOctagon,
} from 'lucide-react';
import {
  SOP_REGISTRY,
  getSopForPatient,
  stepNumberToSoapKey,
  soapKeyToStepNumber,
  SoapStepKey,
  SOPProtocol,
} from '../data/sopRegistry';
import {
  SopCopilotSidebar,
  LoggedFact,
} from './SopCopilotSidebar';
import { NewPatientOnboardingModal } from './NewPatientOnboardingModal';
import { TransferDispatchModal } from './TransferDispatchModal';

interface PatientDescriptor {
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  paradoxEn: string;
  paradoxAr: string;
  sparkline: number[];
  sahatnaSummaryEn: string;
  sahatnaSummaryAr: string;
  painEn: string;
  painAr: string;
  magicEn: string;
  magicAr: string;
}

const PATIENT_DESCRIPTORS: Record<string, PatientDescriptor> = {
  'MALAFFI-PT-001': {
    nameEn: 'Khaled, 32y',
    nameAr: 'خالد، 32 سنة',
    titleEn: 'Subfertile "Normal" Trap',
    titleAr: 'فخ النتيجة السليمة ظاهرياً',
    paradoxEn: 'TMSC 10.32M < 20M threshold',
    paradoxAr: 'العدد الكلي المتحرك 10.32M أقل من العتبة',
    sparkline: [12.4, 11.2, 10.32],
    sahatnaSummaryEn: 'HR 68 bpm · Sleep 7.2h · Sedentary 8.5h',
    sahatnaSummaryAr: 'النبض 68 · النوم 7.2 س · الجلوس 8.5 س',
    painEn: 'Without Masar Amanah: Stamped "Normal" under legacy single-line cutoffs despite composite TMSC 10.32M (<20M threshold) and silent cardiometabolic HbA1c/HR drift; swipes away generic SMS and delays care 2–3 years until irreversible vascular/fertility decline.',
    painAr: 'بدون مسار أمانة: تُصنف نتائجه كـ "طبيعية" ظاهرياً رغم أن العدد الكلي المتحرك 10.32 مليون فقط (أقل من عتبة 20M) مع تدهور قلبي استقلابي صامت؛ يتجاهل الرسائل النصية العامة ويتأخر علاجه 2-3 سنوات.',
    magicEn: 'With Masar Amanah: Dual-plane screening flags subfertility trap + IFHAS MACE precursor in 1 tap, routing Khaled directly to Dr. Mariam with actionable lifestyle & cardiology loop closure today.',
    magicAr: 'مع مسار أمانة: فحص مزدوج يكتشف فخ العقم الخفي ومؤشر الموت القلبي المبكر بنقرة واحدة، موجهاً خالد مباشرة إلى د. مريم لبدء خطة وقائية متكاملة فوراً.',
  },
  'MALAFFI-PT-002': {
    nameEn: 'Omar, 38y',
    nameAr: 'عمر، 38 سنة',
    titleEn: 'TRT Iatrogenic Shutdown',
    titleAr: 'تثبيط الهرمونات الدوائي (TRT)',
    paradoxEn: 'Exogenous T → HPG axis shutdown',
    paradoxAr: 'تستوستيرون خارجي → توقف المحور الهرموني',
    sparkline: [45.0, 18.0, 0.0],
    sahatnaSummaryEn: 'HR 76 bpm · High Muscle Mass · TRT Active',
    sahatnaSummaryAr: 'النبض 76 · كتلة عضلية عالية · منشطات نشطة',
    painEn: 'Without Masar Amanah: Gym-prescribed TRT suppresses HPG axis to azoospermia (TMSC 0.0M) while masking potential prolactinoma; referred to generic clinic with months of delay and permanent testicular atrophy risk.',
    painAr: 'بدون مسار أمانة: استخدام التستوستيرون الرياضي يوقف المحور النخامي مسبباً انعدام النطاف (0.0M) مع إخفاء ورم برولاكتيني محتمل؛ يحال لمراكز عامة مع تأخير أشهر وخطر ضمور دائم.',
    magicEn: 'With Masar Amanah: Flags iatrogenic shutdown vs. pituitary adenoma instantly, giving Dr. Mariam a structured endocrine washout protocol and salvage pathway in 1 tap.',
    magicAr: 'مع مسار أمانة: تشخيص فوري يفرق بين التثبيط الدوائي والورم النخامي، مما يمنح د. مريم بروتوكولاً دقيقاً لغسيل الهرمونات واستعادة الخصوبة بنقرة واحدة.',
  },
  'MALAFFI-PT-003': {
    nameEn: 'Saeed, 41y',
    nameAr: 'سعيد، 41 سنة',
    titleEn: 'Metabolic Hypogonadism',
    titleAr: 'عقم متلازمة التمثيل الغذائي',
    paradoxEn: 'BMI 34.2 + Adipose Aromatase T/E2 < 10',
    paradoxAr: 'كتلة الجسم 34.2 وفرط تحول هرموني',
    sparkline: [28.0, 22.0, 15.4],
    sahatnaSummaryEn: 'HR 82 bpm · HbA1c 6.8% · High Visceral Adiposity',
    sahatnaSummaryAr: 'النبض 82 · السكر التراكمي 6.8% · دهون حشوية',
    painEn: 'Without Masar Amanah: BMI 34.2 with severe aromatization (T/E2 < 10) treated with ineffective empiric supplements while metabolic hypogonadism worsens over 3 years without metabolic-endocrine co-management.',
    painAr: 'بدون مسار أمانة: سمنة مفرطة (BMI 34.2) وفرط تحول هرموني يُعالج بمكملات عشوائية عقيمة، بينما يتفاقم قصور الغدد التناسلية على مدى 3 سنوات دون ربط استقلابي.',
    magicEn: 'With Masar Amanah: Identifies metabolic aromatization phenotype in 1 tap, recommending aromatase inhibitor evaluation and targeted weight-metabolic pathway under Dr. Mariam.',
    magicAr: 'مع مسار أمانة: يحدد النمط الظاهري للتحول الهرموني بنقرة واحدة، موصياً بمثبطات الأروماتاز ومسار استقلابي منظم بإشراف د. مريم.',
  },
  'MALAFFI-PT-004': {
    nameEn: 'Tariq, 29y',
    nameAr: 'طارق، 29 سنة',
    titleEn: 'Varicocele Progressive Decline',
    titleAr: 'دوالي الخصية السريرية المتدهورة',
    paradoxEn: 'Grade 3 + TMSC velocity drop -28%/yr',
    paradoxAr: 'درجة 3 وتراجع سنوي -28% في النطاف',
    sparkline: [38.0, 24.5, 14.2],
    sahatnaSummaryEn: 'HR 71 bpm · High Scrotal Heat Exposure',
    sahatnaSummaryAr: 'النبض 71 · تعرض متكرر للحرارة',
    painEn: 'Without Masar Amanah: Referred with NULL FSH/LH and unverified +90d cycle, wasting 3–6 months bouncing between diagnostic labs without clear etiology while progressive varicocele damages spermatogenesis.',
    painAr: 'بدون مسار أمانة: إحالة سريرية غير مكتملة بفحوصات هرمونية مفقودة (NULL) ودورة متابعة غير موثقة، ليهدر طارق 3-6 أشهر في مراجعات غير مجدية بينما تتلف الدوالي خلايا الخصية.',
    magicEn: 'With Masar Amanah: Active Information-Gain engine pinpoints missing FSH/LH discriminator, collapses Shannon entropy (ΔH = -1.946 bits) to 94.2% diagnostic certainty, and closes the +90d loop with Dr. Mariam in 1 tap.',
    magicAr: 'مع مسار أمانة: محرك كسب المعلومات النشط يحدد فحص FSH/LH الحاسم، مخفضاً إنتروبيا الشك بمقدار 1.946 بت وصولاً إلى يقين 94.2% وإغلاق حلقة الـ 90 يوماً مع د. مريم بنقرة واحدة.',
  },
  'MALAFFI-PT-005': {
    nameEn: 'Zayd, 24y',
    nameAr: 'زيد، 24 سنة',
    titleEn: 'Acute Scrotal Surgical Emergency',
    titleAr: 'طوارئ جراحية: التواء خصية حاد',
    paradoxEn: 'STAT Escalation: Torsion <12h salvage window',
    paradoxAr: 'إنقاذ جراحي عاجل قبل انقضاء 12 ساعة',
    sparkline: [32.0, 12.0],
    sahatnaSummaryEn: 'HR 108 bpm (Tachycardia / Acute Pain response)',
    sahatnaSummaryAr: 'النبض 108 (تسارع نبض واستجابة للألم الحاد)',
    painEn: 'Without Masar Amanah: Acute scrotal pain dismissed as mild epididymitis or scheduled for routine outpatient ultrasound, exceeding the critical <6h testicular torsion salvage window.',
    painAr: 'بدون مسار أمانة: ألم صفني حاد يُشخص خطأ كالتهاب بسيط أو يُجدول لموجات فوق صوتية روتينية، متجاوزاً نافذة الإنقاذ الجراحي الحرجة (أقل من 6 ساعات).',
    magicEn: 'With Masar Amanah: STAT Safety Circuit Breaker triggers immediate Tier 1 surgical escalation within the critical salvage window, alerting Dr. Mariam and on-call urology in real-time.',
    magicAr: 'مع مسار أمانة: قاطع الدائرة فائق الأمان ينشط فوراً تصعيد الطوارئ الجراحية (المستوى 1) ضمن نافذة الإنقاذ، منبهاً د. مريم وجراحة المسالك المناوبة في 0 مللي ثانية.',
  },
  'MALAFFI-PT-006': {
    nameEn: 'Rashid, 34y',
    nameAr: 'راشد، 34 سنة',
    titleEn: 'Optimal Baseline Reference',
    titleAr: 'خط أساس خصوبة طبيعي مثالي',
    paradoxEn: 'All WHO 6th parameters >50th percentile',
    paradoxAr: 'جميع مؤشرات منظمة الصحة فوق المئين 50',
    sparkline: [48.0, 52.0, 56.5],
    sahatnaSummaryEn: 'HR 62 bpm · Sleep 8.0h · High Step Count (10.5k)',
    sahatnaSummaryAr: 'النبض 62 · النوم 8 س · نشاط حركي مرتفع',
    painEn: 'Without Masar Amanah: Pre-analytical variability or anxiety triggers unnecessary costly hormonal panels and unneeded invasive workups.',
    painAr: 'بدون مسار أمانة: قلق الخصوبة واختلافات العينات المختبرية تدفعه لفحوصات هرمونية وتداخلات باهظة الثمن لا داعي لها.',
    magicEn: 'With Masar Amanah: Validates robust baseline normozoospermia (>50th percentile across all parameters), reassuring the couple and avoiding over-medicalization while locking baseline QC under Dr. Mariam.',
    magicAr: 'مع مسار أمانة: يثبت سلامة الخصوبة المعيارية المثالية (فوق المئين 50) بنقرة واحدة، مطمئناً الزوجين وموفراً تكاليف الفحوصات غير الضرورية تحت إشراف د. مريم.',
  },
};

const SYNDROME_HUMAN_TITLES: Record<string, { en: string; ar: string }> = {
  'SYN_FALSE_NORMAL_SUBFERTILITY': {
    en: 'False-Normal Subfertility Trap',
    ar: 'فخ النتيجة الطبيعية الكاذبة',
  },
  'SYN_TRT_IATROGENIC_AZOOSPERMIA': {
    en: 'TRT-Induced Iatrogenic Azoospermia',
    ar: 'انعدام النطاف الدوائي بسبب التستوستيرون',
  },
  'SYN_METABOLIC_SILENT_HYPOGONADISM': {
    en: 'Silent Metabolic Hypogonadism',
    ar: 'قصور الغدد التناسلية الأيضي الصامت',
  },
  'SYN_PROGRESSIVE_VARICOCELE': {
    en: 'Progressive Varicocele Quality Decline',
    ar: 'تدهور جودة النطاف المتسارع بسبب الدوالي',
  },
  'SYN_SURGICAL_EMERGENCY_TORSION': {
    en: 'Acute Testicular Torsion Emergency',
    ar: 'حالة التواء الخصية الجراحية الطارئة',
  },
};

interface DiagnosticWorkbenchProps {
  language: 'en' | 'ar';
  onBridgeToCarePlan?: (
    record: LongitudinalPatientRecord,
    graphEvaluation: ClosedLoopGraphEvaluation
  ) => void;
}

interface ResolutionConvergenceBanner {
  biomarkerKey: string;
  measuredValue: number;
  entropyBefore: number;
  entropyAfter: number;
  deltaBits: number;
  certaintyBefore: number;
  certaintyAfter: number;
}

export function DiagnosticWorkbench({ language, onBridgeToCarePlan }: DiagnosticWorkbenchProps) {
  const isAr = language === 'ar';

  // In-memory patient records state (initialized from LONGITUDINAL_MALAFFI_COHORT)
  const [cohort, setCohort] = useState<LongitudinalPatientRecord[]>(() =>
    JSON.parse(JSON.stringify(LONGITUDINAL_MALAFFI_COHORT))
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>('MALAFFI-PT-001');
  const [activeWorkbenchStep, setActiveWorkbenchStep] = useState<number>(1);
  const [expertView, setExpertView] = useState<boolean>(false);
  const [followupAppendedPatients, setFollowupAppendedPatients] = useState<Record<string, boolean>>({});
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [autoPlayNarrative, setAutoPlayNarrative] = useState<string | null>(null);

  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [activeCustomBiomarker, setActiveCustomBiomarker] = useState<string | null>(null);
  const [expandedHypothesisId, setExpandedHypothesisId] = useState<string | null>(null);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);
  const [convergenceBanner, setConvergenceBanner] = useState<ResolutionConvergenceBanner | null>(null);
  const [loggedFacts, setLoggedFacts] = useState<LoggedFact[]>([]);
  const [isCausalDrawerOpen, setIsCausalDrawerOpen] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  const handlePatientOnboarded = (newRecord: LongitudinalPatientRecord) => {
    setCohort((prev) => [newRecord, ...prev]);
    setSelectedPatientId(newRecord.patientId);
    setActiveWorkbenchStep(1);
    setIsOnboardingOpen(false);
  };

  // Active patient record & live evaluation (zero cached results)
  const activeRecord =
    cohort.find((p) => p.patientId === selectedPatientId) || cohort[0];
  const evaluation: ClosedLoopGraphEvaluation = evaluatePatientGraph(activeRecord);

  const activeSoapStepKey: SoapStepKey = stepNumberToSoapKey(activeWorkbenchStep);
  const activeSop: SOPProtocol = getSopForPatient(activeRecord.patientId);

  // Feature #3: Active Selected Hypothesis & Connected Causal Nodes
  const activeHypothesis =
    evaluation.differentialRanking.find((h) => h.id === selectedHypothesisId) ||
    evaluation.differentialRanking[0];
  const activeHypothesisId = activeHypothesis?.id || '';

  const activeConnectedSignalIds = new Set<string>([
    ...(activeHypothesis?.supportingEdges.map((e) => e.sourceNodeId) || []),
    ...(activeHypothesis?.contradictingEdges.map((e) => e.sourceNodeId) || []),
  ]);

  const activeConnectedTestIds = new Set<string>([
    ...(activeHypothesis?.nullDiscriminatorIds || []),
    ...evaluation.rankedNextTests
      .filter((t) => t.separatesHypotheses.includes(activeHypothesisId))
      .map((t) => t.testId),
  ]);

  const latestEncounter = activeRecord.encounters[activeRecord.encounters.length - 1];
  const allMedsInit = activeRecord.encounters.flatMap((e) => e.medications ?? []);

  // Sandbox UI drawer state & auto-apply toggle
  const [sandboxOpen, setSandboxOpen] = useState<boolean>(false);
  const [autoApplyLive, setAutoApplyLive] = useState<boolean>(true);

  // Clinical Silo 1: Semen Lab Form State
  const [semenPresent, setSemenPresent] = useState<boolean>(() => latestEncounter?.semenLab !== null);
  const [volumeMl, setVolumeMl] = useState<number>(() => latestEncounter?.semenLab?.volumeMl ?? 2.5);
  const [concentrationMMl, setConcentrationMMl] = useState<number>(() => latestEncounter?.semenLab?.concentrationMMl ?? 20);
  const [totalMotilityPct, setTotalMotilityPct] = useState<number>(() => latestEncounter?.semenLab?.totalMotilityPct ?? 45);
  const [normalMorphologyPct, setNormalMorphologyPct] = useState<number>(() => latestEncounter?.semenLab?.normalMorphologyPct ?? 4);

  // Clinical Silo 2: Endocrine Panel Form State
  const [fshIuL, setFshIuL] = useState<number | null>(() => latestEncounter?.endocrinePanel?.fshIuL ?? null);
  const [lhIuL, setLhIuL] = useState<number | null>(() => latestEncounter?.endocrinePanel?.lhIuL ?? null);
  const [totalTestosteroneNgDl, setTotalTestosteroneNgDl] = useState<number | null>(() => latestEncounter?.endocrinePanel?.totalTestosteroneNgDl ?? null);
  const [estradiolPgMl, setEstradiolPgMl] = useState<number | null>(() => latestEncounter?.endocrinePanel?.estradiolPgMl ?? null);
  const [prolactinNgMl, setProlactinNgMl] = useState<number | null>(() => latestEncounter?.endocrinePanel?.prolactinNgMl ?? null);

  // Clinical Silo 3: Cardiometabolic & Sahatna Form State
  const [bmi, setBmi] = useState<number>(() => latestEncounter?.vitals.bmi ?? 24.5);
  const [hba1cPct, setHba1cPct] = useState<number>(() => latestEncounter?.vitals.hba1cPct ?? 5.4);
  const [restingHrBpm, setRestingHrBpm] = useState<number>(() => latestEncounter?.vitals.restingHrBpm ?? 70);
  const [sleepHoursAvg, setSleepHoursAvg] = useState<number>(() => latestEncounter?.vitals.sleepHoursAvg ?? 7.0);

  // Clinical Silo 4: Exposures & History Form State
  const [is5Ari, setIs5Ari] = useState<boolean>(() => allMedsInit.some((m) => m.class === '5ARI'));
  const [isTrt, setIsTrt] = useState<boolean>(() => allMedsInit.some((m) => m.class === 'TRT_ANDROGEN'));
  const [varicoceleGrade, setVaricoceleGrade] = useState<0 | 1 | 2 | 3>(() => latestEncounter?.clinicalFlags.varicoceleGrade ?? 0);
  const [cryptorchidism, setCryptorchidism] = useState<boolean>(() => latestEncounter?.clinicalFlags.cryptorchidismHistory ?? false);
  const [acutePain, setAcutePain] = useState<boolean>(() => latestEncounter?.clinicalFlags.acuteScrotalPain ?? false);

  const syncFormWithPatient = (targetPatient: LongitudinalPatientRecord) => {
    const enc = targetPatient.encounters[targetPatient.encounters.length - 1];
    if (!enc) return;
    const allMeds = targetPatient.encounters.flatMap((e) => e.medications ?? []);
    setSemenPresent(enc.semenLab !== null);
    if (enc.semenLab) {
      setVolumeMl(enc.semenLab.volumeMl);
      setConcentrationMMl(enc.semenLab.concentrationMMl);
      setTotalMotilityPct(enc.semenLab.totalMotilityPct);
      setNormalMorphologyPct(enc.semenLab.normalMorphologyPct);
    }
    if (enc.endocrinePanel) {
      setFshIuL(enc.endocrinePanel.fshIuL);
      setLhIuL(enc.endocrinePanel.lhIuL);
      setTotalTestosteroneNgDl(enc.endocrinePanel.totalTestosteroneNgDl);
      setEstradiolPgMl(enc.endocrinePanel.estradiolPgMl);
      setProlactinNgMl(enc.endocrinePanel.prolactinNgMl);
    } else {
      setFshIuL(null);
      setLhIuL(null);
      setTotalTestosteroneNgDl(null);
      setEstradiolPgMl(null);
      setProlactinNgMl(null);
    }
    setBmi(enc.vitals.bmi);
    setHba1cPct(enc.vitals.hba1cPct);
    setRestingHrBpm(enc.vitals.restingHrBpm);
    setSleepHoursAvg(enc.vitals.sleepHoursAvg);
    setIs5Ari(allMeds.some((m) => m.class === '5ARI'));
    setIsTrt(allMeds.some((m) => m.class === 'TRT_ANDROGEN'));
    setVaricoceleGrade(enc.clinicalFlags.varicoceleGrade);
    setCryptorchidism(enc.clinicalFlags.cryptorchidismHistory);
    setAcutePain(enc.clinicalFlags.acuteScrotalPain);
  };

  // Open Loops Calculation
  const topNullTest = evaluation.rankedNextTests.find((t) => t.isCurrentlyNull);
  const isOpenLoop1 = evaluation.loopStatus !== 'CONVERGED' && Boolean(topNullTest);
  const isFollowupAppended = Boolean(followupAppendedPatients[activeRecord.patientId]);
  const isOpenLoop2 = !isFollowupAppended;
  const openLoopsCount = (isOpenLoop1 ? 1 : 0) + (isOpenLoop2 ? 1 : 0);

  // Handler: Select Patient
  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setConvergenceBanner(null);
    setCustomInputValue('');
    setActiveCustomBiomarker(null);
    const target = cohort.find((p) => p.patientId === id);
    if (target) {
      syncFormWithPatient(target);
    }
  };

  // Handler: Reset Cohort
  const handleResetCohort = async () => {
    const fresh: LongitudinalPatientRecord[] = JSON.parse(
      JSON.stringify(LONGITUDINAL_MALAFFI_COHORT)
    );
    setCohort(fresh);
    setConvergenceBanner(null);
    setCustomInputValue('');
    setActiveCustomBiomarker(null);
    setFollowupAppendedPatients({});
    setActiveWorkbenchStep(1);
    const target = fresh.find((p) => p.patientId === selectedPatientId) || fresh[0];
    if (target) {
      syncFormWithPatient(target);
    }

    try {
      await fetch('/api/patients/reset', { method: 'POST' });
    } catch {
      // Offline fallback: in-memory state already reset
    }
  };

  const triggerMutate = (
    mode: 'UPDATE_LATEST' | 'APPEND_FOLLOWUP_90D',
    overrides?: Partial<EncounterMutationPatch>
  ) => {
    const latestEnc = activeRecord.encounters[activeRecord.encounters.length - 1];
    const patch: EncounterMutationPatch = {
      vitals: {
        bmi: overrides?.vitals?.bmi ?? bmi,
        hba1cPct: overrides?.vitals?.hba1cPct ?? hba1cPct,
        restingHrBpm: overrides?.vitals?.restingHrBpm ?? restingHrBpm,
        sleepHoursAvg: overrides?.vitals?.sleepHoursAvg ?? sleepHoursAvg,
      },
      semenLab:
        overrides?.semenLab !== undefined
          ? overrides.semenLab
          : mode === 'APPEND_FOLLOWUP_90D'
          ? (latestEnc?.semenLab ? { ...latestEnc.semenLab } : null)
          : semenPresent
          ? {
              volumeMl,
              concentrationMMl,
              totalMotilityPct,
              normalMorphologyPct,
            }
          : null,
      endocrinePanel:
        overrides?.endocrinePanel !== undefined
          ? overrides.endocrinePanel
          : mode === 'APPEND_FOLLOWUP_90D'
          ? (latestEnc?.endocrinePanel ? { ...latestEnc.endocrinePanel } : null)
          : (fshIuL !== null ||
             lhIuL !== null ||
             totalTestosteroneNgDl !== null ||
             estradiolPgMl !== null ||
             prolactinNgMl !== null)
          ? {
              fshIuL: fshIuL ?? 4.0,
              lhIuL: lhIuL ?? 3.5,
              totalTestosteroneNgDl: totalTestosteroneNgDl ?? 350,
              estradiolPgMl: estradiolPgMl ?? 25,
              prolactinNgMl: prolactinNgMl ?? 10,
            }
          : null,
      toggle5Ari: overrides?.toggle5Ari ?? is5Ari,
      toggleTrt: overrides?.toggleTrt ?? isTrt,
      varicoceleGrade: overrides?.varicoceleGrade ?? varicoceleGrade,
      cryptorchidismHistory: overrides?.cryptorchidismHistory ?? cryptorchidism,
      acuteScrotalPain: overrides?.acuteScrotalPain ?? acutePain,
    };

    const prevEval = evaluation;
    const result = mutatePatientEncounterInLoop(activeRecord, mode, patch);

    setCohort((prev) =>
      prev.map((p) => (p.patientId === activeRecord.patientId ? result.updatedRecord : p))
    );
    syncFormWithPatient(result.updatedRecord);

    if (mode === 'APPEND_FOLLOWUP_90D') {
      setFollowupAppendedPatients((prev) => ({
        ...prev,
        [activeRecord.patientId]: true,
      }));
    }

    setConvergenceBanner({
      biomarkerKey:
        mode === 'APPEND_FOLLOWUP_90D'
          ? (isAr ? `زيارة متابعة جديدة #${result.updatedRecord.encounters.length} (+90 يوم)` : `+90d Visit #${result.updatedRecord.encounters.length}`)
          : (isAr ? 'تعديل حي للزيارة الحالية (tk)' : 'Live Visit Mutation (tk)'),
      measuredValue: result.updatedRecord.encounters.length,
      entropyBefore: prevEval.jointEntropyBits,
      entropyAfter: result.newEvaluation.jointEntropyBits,
      deltaBits: result.entropyDeltaBits,
      certaintyBefore: prevEval.diagnosticCertaintyPct,
      certaintyAfter: result.newEvaluation.diagnosticCertaintyPct,
    });

    // Background sync to server if online
    fetch(`/api/patients/${activeRecord.patientId}/mutate-encounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, patch }),
    }).catch(() => {});
  };

  const updateEndocrineField = (
    field: 'fshIuL' | 'lhIuL' | 'totalTestosteroneNgDl' | 'estradiolPgMl' | 'prolactinNgMl',
    val: number | null
  ) => {
    let nextFsh = fshIuL;
    let nextLh = lhIuL;
    let nextT = totalTestosteroneNgDl;
    let nextE2 = estradiolPgMl;
    let nextPrl = prolactinNgMl;

    if (field === 'fshIuL') { nextFsh = val; setFshIuL(val); }
    if (field === 'lhIuL') { nextLh = val; setLhIuL(val); }
    if (field === 'totalTestosteroneNgDl') { nextT = val; setTotalTestosteroneNgDl(val); }
    if (field === 'estradiolPgMl') { nextE2 = val; setEstradiolPgMl(val); }
    if (field === 'prolactinNgMl') { nextPrl = val; setProlactinNgMl(val); }

    if (autoApplyLive) {
      const isAllNull =
        nextFsh === null && nextLh === null && nextT === null && nextE2 === null && nextPrl === null;
      triggerMutate('UPDATE_LATEST', {
        endocrinePanel: isAllNull
          ? null
          : {
              fshIuL: nextFsh ?? 4.0,
              lhIuL: nextLh ?? 3.5,
              totalTestosteroneNgDl: nextT ?? 350,
              estradiolPgMl: nextE2 ?? 25,
              prolactinNgMl: nextPrl ?? 10,
            },
      });
    }
  };

  // TMSC & Longitudinal Velocity computation for Proof Bar
  const semenEncounters = activeRecord.encounters.filter((e) => e.semenLab !== null);
  let velocityDisplay = isAr ? 'نقطة وحيدة' : 'N/A (Single Point)';
  if (semenEncounters.length >= 2) {
    const firstEnc = semenEncounters[0];
    const lastEnc = semenEncounters[semenEncounters.length - 1];
    const firstTmsc =
      firstEnc.semenLab!.volumeMl *
      firstEnc.semenLab!.concentrationMMl *
      (firstEnc.semenLab!.totalMotilityPct / 100);
    const lastTmsc =
      lastEnc.semenLab!.volumeMl *
      lastEnc.semenLab!.concentrationMMl *
      (lastEnc.semenLab!.totalMotilityPct / 100);
    const firstTime = new Date(firstEnc.dateIso).getTime();
    const lastTime = new Date(lastEnc.dateIso).getTime();
    const monthsDiff = Math.max(0.5, (lastTime - firstTime) / (1000 * 60 * 60 * 24 * 30.4375));
    if (firstTmsc > 0) {
      const vel = ((lastTmsc - firstTmsc) / firstTmsc * 100) / monthsDiff;
      velocityDisplay = `${vel >= 0 ? '+' : ''}${vel.toFixed(1)} %/mo`;
    } else {
      velocityDisplay = '0.0 %/mo';
    }
  }

  const currentSeLab = latestEncounter?.semenLab;
  const liveTmsc = currentSeLab
    ? Number((currentSeLab.volumeMl * currentSeLab.concentrationMMl * (currentSeLab.totalMotilityPct / 100)).toFixed(2))
    : null;

  const signatures = computeDeterministicGraphSignature(activeRecord, evaluation);

  // Handler: Resolve NULL biomarker in loop
  const handleResolveBiomarker = async (biomarkerKey: string, measuredValue: number) => {
    const prevEval = evaluation;
    const { updatedRecord, newEvaluation, entropyDeltaBits } = resolveNullBiomarkerInLoop(
      activeRecord,
      biomarkerKey,
      measuredValue
    );

    // Update in-memory state
    setCohort((prev) =>
      prev.map((p) => (p.patientId === activeRecord.patientId ? updatedRecord : p))
    );
    syncFormWithPatient(updatedRecord);

    setConvergenceBanner({
      biomarkerKey,
      measuredValue,
      entropyBefore: prevEval.jointEntropyBits,
      entropyAfter: newEvaluation.jointEntropyBits,
      deltaBits: entropyDeltaBits,
      certaintyBefore: prevEval.diagnosticCertaintyPct,
      certaintyAfter: newEvaluation.diagnosticCertaintyPct,
    });

    setCustomInputValue('');
    setActiveCustomBiomarker(null);

    // Background sync to server if online
    try {
      await fetch(`/api/patients/${activeRecord.patientId}/resolve-null`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biomarkerKey, measuredValue }),
      });
    } catch {
      // In-memory update is authoritative
    }
  };

  // Master Single 1-Click Guided CTA Action
  const handleGuidedNext = () => {
    if (activeWorkbenchStep === 1) {
      setActiveWorkbenchStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeWorkbenchStep === 2) {
      setActiveWorkbenchStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeWorkbenchStep === 3) {
      if (isOpenLoop1) {
        // Resolve #1 ranked NULL discriminator lab
        const targetTest = topNullTest || evaluation.rankedNextTests[0];
        if (targetTest) {
          handleResolveBiomarker(
            targetTest.targetBiomarkerKey,
            targetTest.simulatedIfAbnormal.valuePreview
          );
        }
      } else if (isOpenLoop2) {
        // Append +90d follow-up encounter
        triggerMutate('APPEND_FOLLOWUP_90D');
        setFollowupAppendedPatients((prev) => ({
          ...prev,
          [activeRecord.patientId]: true,
        }));
      } else {
        // Both loops closed -> Bridge to Step 4 Results
        if (onBridgeToCarePlan) {
          onBridgeToCarePlan(activeRecord, evaluation);
        }
      }
    } else {
      if (onBridgeToCarePlan) {
        onBridgeToCarePlan(activeRecord, evaluation);
      }
    }
  };

  const handleLogClinicalFact = (
    fact: string,
    _category: string,
    answer: 'YES' | 'NO',
    stepKey: SoapStepKey
  ) => {
    const newFact: LoggedFact = {
      id: `fact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fact,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      answer,
      stepKey,
    };
    setLoggedFacts((prev) => [...prev, newFact]);

    if (fact.includes('sudden onset') || fact.includes('Acute sudden onset')) {
      setAcutePain(answer === 'YES');
      triggerMutate('UPDATE_LATEST', { acuteScrotalPain: answer === 'YES' });
    }
    if (fact.includes('Grade 3 left varicocele')) {
      setVaricoceleGrade(answer === 'YES' ? 3 : 0);
      triggerMutate('UPDATE_LATEST', { varicoceleGrade: answer === 'YES' ? 3 : 0 });
    }
    if (fact.includes('5-ARI')) {
      setIs5Ari(answer === 'YES');
      triggerMutate('UPDATE_LATEST', { toggle5Ari: answer === 'YES' });
    }
    if (fact.includes('exogenous androgens') || fact.includes('anabolic')) {
      setIsTrt(answer === 'YES');
      triggerMutate('UPDATE_LATEST', { toggleTrt: answer === 'YES' });
    }
  };

  const handleCopilotApplyExpected = () => {
    handleGuidedNext();
  };

  const handleCopilotTriggerDeviation = () => {
    if (activeWorkbenchStep === 3 && isOpenLoop1 && topNullTest) {
      const normalVal = topNullTest.simulatedIfNormal.valuePreview;
      handleResolveBiomarker(topNullTest.targetBiomarkerKey, normalVal);
      handleLogClinicalFact(
        `Outcome Differs: Normal ${topNullTest.targetBiomarkerKey} (${normalVal} IU/L) injected -> Differential shifted toward Post-Testicular Ductal Obstruction (N46.02).`,
        'lab',
        'YES',
        'A'
      );
    } else if (activeWorkbenchStep === 3 && isOpenLoop2) {
      handleLogClinicalFact(
        'Outcome Differs: Non-responder at Day +90 -> Karyotype (47,XXY) and Y-microdeletion (AZF) testing indicated for ICSI fast-track.',
        'intake',
        'YES',
        'A'
      );
    } else if (activeWorkbenchStep === 1) {
      handleLogClinicalFact(
        'Outcome Differs: Abstinence period outside 2–7d window (<48h or >7d) -> 14-day recollection hold indicated.',
        'intake',
        'NO',
        'S'
      );
    } else if (activeWorkbenchStep === 2) {
      handleLogClinicalFact(
        'Outcome Differs: Delayed liquefaction >60 min / hyperviscosity noted on semen QC.',
        'lab',
        'NO',
        'O'
      );
    }
  };

  const handleCopilotTriggerStuck = () => {
    handleLogClinicalFact(
      'Technician requested AI assistance for gate clearance. 3 targeted clinical follow-up questions generated.',
      'symptom',
      'YES',
      activeSoapStepKey
    );
  };

  const handleTriggerDeviationLoop1 = (test: typeof topNullTest) => {
    if (!test) return;
    const normalVal = test.simulatedIfNormal.valuePreview;
    handleResolveBiomarker(test.targetBiomarkerKey, normalVal);
    handleLogClinicalFact(
      `Outcome Differs: Normal ${test.targetBiomarkerKey} (${normalVal} IU/L) injected -> Differential shifted toward Post-Testicular Ductal Obstruction (N46.02).`,
      'lab',
      'YES',
      'A'
    );
  };

  const renderMiniSparkline = (points: number[], isSelected: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points) || 1;
    const range = max - min || 1;
    const width = 24;
    const height = 10;
    const pathD = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 2) - 1;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-6 h-2.5 inline-block shrink-0" aria-hidden="true">
        <path
          d={pathD}
          fill="none"
          stroke={isSelected ? '#34d399' : '#94a3b8'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Auto-Play Judge Walkthrough Orchestrator
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setTimeout(() => {
      if (activeWorkbenchStep === 1) {
        setAutoPlayNarrative(
          isAr
            ? '▶ الجولة التوجيهية: الخطوة 1 — استعراض السجل الطولي لملفي (لاحظ الفخ الخفي: العدد الكلي 10.32M < 20M)'
            : '▶ Guided Walkthrough: Step 1 — Ingesting Malaffi Longitudinal Record (Spotting False-Normal TMSC Trap: 10.32M < 20M)'
        );
        setTimeout(() => {
          handleGuidedNext();
        }, 1200);
      } else if (activeWorkbenchStep === 2) {
        setAutoPlayNarrative(
          isAr
            ? '▶ الجولة التوجيهية: الخطوة 2 — شجرة الجذور السببية البايزية (احتمال قبلي P₀ = 45.0% مع حلقتين معلقتين)'
            : '▶ Guided Walkthrough: Step 2 — 4-Layer Causal Root-Tree (Prior P₀ = 45.0%, Joint Entropy = 2.62 bits with 2 Open Loops)'
        );
        setTimeout(() => {
          handleGuidedNext();
        }, 1200);
      } else if (activeWorkbenchStep === 3) {
        if (isOpenLoop1) {
          const targetTest = topNullTest || evaluation.rankedNextTests[0];
          setAutoPlayNarrative(
            isAr
              ? `▶ الجولة التوجيهية: الخطوة 3 (الحلقة 1) — حسم الفحص المخبري المفقود FSH = ${targetTest?.simulatedIfAbnormal.valuePreview || 24.2} IU/L (كسب معلومات ΔH = -1.946 bits)`
              : `▶ Guided Walkthrough: Step 3 (Loop #1) — 1-Click Resolving NULL FSH = ${targetTest?.simulatedIfAbnormal.valuePreview || 24.2} IU/L (Info Gain ΔH = -1.946 bits)`
          );
          handleGuidedNext();
        } else if (isOpenLoop2) {
          setAutoPlayNarrative(
            isAr
              ? '▶ الجولة التوجيهية: الخطوة 3 (الحلقة 2) — توثيق زيارة المتابعة الدورية بعد 90 يوماً (اكتمال دورة تصنيع النطاف)'
              : '▶ Guided Walkthrough: Step 3 (Loop #2) — Logging +90d Spermatogenesis Follow-Up (Periodic Loop Closure)'
          );
          handleGuidedNext();
        } else {
          // Both loops closed!
          setAutoPlayNarrative(
            isAr
              ? '▶ الجولة التوجيهية: اكتمال إغلاق كافة الحلقات بنجاح (الإنتروبيا 0.67 bits). الانتقال لخطة الرعاية المتكاملة!'
              : '▶ Guided Walkthrough: All Loops Closed ✓ (Entropy collapsed to 0.67 bits). Bridging to Converged Care Plan!'
          );
          setTimeout(() => {
            setIsAutoPlay(false);
            if (onBridgeToCarePlan) {
              onBridgeToCarePlan(activeRecord, evaluation);
            }
          }, 1500);
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAutoPlay, activeWorkbenchStep, isOpenLoop1, isOpenLoop2, activeRecord, evaluation, isAr, onBridgeToCarePlan]);

  // Dynamic Label for Master Guided CTA Button
  const getGuidedCtaLabel = () => {
    if (activeWorkbenchStep === 1) {
      return isAr
        ? 'التالي: استكشاف الجذور والتشخيص التفريقي (الخطوة 2) ←'
        : 'Next: Causal Root-Tree & Differential (Step 2) →';
    }
    if (activeWorkbenchStep === 2) {
      return isAr
        ? 'التالي: محطة إغلاق الحلقات المفتوحة (الخطوة 3) ←'
        : 'Next: Close Open Loops Station (Step 3) →';
    }
    if (activeWorkbenchStep === 3) {
      if (isOpenLoop1) {
        return isAr
          ? '⚡ إغلاق الحلقة 1: حسم الفحص المخبري المفقود تلقائياً ←'
          : '⚡ 1-Click Resolve Top Lab (Loop #1) →';
      }
      if (isOpenLoop2) {
        return isAr
          ? '⚡ إغلاق الحلقة 2: تسجيل زيارة المتابعة (+90 يوم) ←'
          : '⚡ 1-Click Log +90d Follow-Up (Loop #2) →';
      }
      return isAr
        ? 'الانتقال إلى خطة الرعاية المتكاملة (الخطوة 4) ←'
        : 'Bridge to Step 4 Converged Care Plan →';
    }
    return isAr
      ? 'الانتقال إلى خطة الرعاية المتكاملة (الخطوة 4) ←'
      : 'Bridge to Step 4 Converged Care Plan →';
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* =====================================================================
          PERSISTENT TOP GUIDED LOOP CONTROLLER BAR
         ===================================================================== */}
      <section className={`bg-slate-900 text-white border-2 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-4 transition-all ${
        openLoopsCount === 0 ? 'border-emerald-500 animate-pulse-glow' : 'border-emerald-600'
      }`}>
        {/* Row 1: Header, Auto-Play Judge Walkthrough, Expert View Toggle & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700 rounded-xl text-emerald-400">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-700">
                  NHS-STYLE 1-CLICK GUIDED LOOP
                </span>
                <span className="text-xs font-mono text-slate-400">
                  v2.0-BAYESIAN-DAG
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isAr ? 'لوحة القيادة السريرية: حلقة التشخيص التفاعلية' : 'Malaffi Clinical Loop Controller'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Auto-Play Judge Walkthrough Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isAutoPlay;
                setIsAutoPlay(nextState);
                if (nextState) {
                  setAutoPlayNarrative(
                    isAr
                      ? '▶ بدء جولة المحاكاة الإرشادية للحكام (خطوة بخطوة تلقائياً)...'
                      : '▶ Starting Hands-Free Guided Story for Judges (Pacing Auto-Walkthrough)...'
                  );
                } else {
                  setAutoPlayNarrative(null);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isAutoPlay
                  ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse-glow shadow-md shadow-emerald-500/30'
                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border-emerald-700'
              }`}
              title="Hands-free auto-play walkthrough for judges"
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>
                {isAutoPlay
                  ? (isAr ? 'إيقاف مؤقت' : 'Pause Guided Story')
                  : (isAr ? '▶ جولة الحكام التلقائية' : '▶ Auto-Play Guided Story')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setExpertView(!expertView)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                expertView
                  ? 'bg-indigo-900 text-indigo-200 border-indigo-700'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isAr ? 'عرض كافة الأقسام معاً' : 'Show all regions simultaneously'}
            >
              {expertView
                ? (isAr ? '✓ وضع الخبير (عرض الكل)' : '✓ Expert View (All Regions)')
                : (isAr ? 'عرض كافة الأقسام (وضع الخبير)' : 'Show All Regions (Expert View)')}
            </button>

            <button
              type="button"
              data-testid="btn-onboard-new-patient"
              onClick={() => setIsOnboardingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              title={isAr ? 'إدخال وتسجيل مريض جديد وفحصه' : 'Onboard brand-new walk-in patient chart'}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAr ? '➕ إدخال مريض جديد' : '➕ Onboard New Patient'}</span>
            </button>

            <button
              type="button"
              data-testid="btn-transfer-dispatch"
              onClick={() => setIsTransferOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                evaluation.lifeSafetyEscalations.some((e) => e.triggered) || activeRecord.patientId === 'MALAFFI-PT-005'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : openLoopsCount === 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40'
              }`}
              title={isAr ? 'إحالة ونقل المريض إلى مستشفيات أبوظبي' : 'Outbound Hospital Transfer & Referral Dispatch'}
            >
              {evaluation.lifeSafetyEscalations.some((e) => e.triggered) || activeRecord.patientId === 'MALAFFI-PT-005' ? (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-white" />
                  <span>{isAr ? '🚨 إحالة طوارئ فورية' : '🚨 STAT ER Transfer'}</span>
                </>
              ) : openLoopsCount === 0 ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-white" />
                  <span>{isAr ? '🚑 إحالة المريض للمستشفى' : '🚑 Dispatch Hospital Transfer'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isAr
                      ? `🔒 الإحالة معلقة (${openLoopsCount} حلقة مفتوحة)`
                      : `🔒 Transfer Held (${openLoopsCount} Loops Open)`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetCohort}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title={isAr ? 'إعادة ضبط كافة السجلات' : 'Reset all 6 patient charts to baseline'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة تعيين' : 'Reset Cohort'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Patient Selector Pills (Enriched with Humanized Descriptors & SVG Sparklines) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 shrink-0">
            {isAr ? '📥 قائمة ملفي الواردة:' : '📥 Incoming Malaffi Queue:'}
          </span>
          {cohort.map((patient) => {
            const isSelected = patient.patientId === selectedPatientId;
            const evalPreview = evaluatePatientGraph(patient);
            const hasStat = evalPreview.lifeSafetyEscalations.some((e) => e.triggered);
            const hasBlind = evalPreview.blindSpotSyndromes.some((s) => s.triggered);
            const desc = PATIENT_DESCRIPTORS[patient.patientId];
            const patientSop = getSopForPatient(patient.patientId);

            return (
              <button
                key={patient.patientId}
                type="button"
                data-testid={`patient-pill-${patient.patientId}`}
                data-select-id={`select-patient-${patient.patientId}`}
                onClick={() => handleSelectPatient(patient.patientId)}
                className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-start gap-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isSelected
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500 font-bold shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className="font-bold text-white text-xs">
                    {desc ? (isAr ? desc.nameAr : desc.nameEn) : ''}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    · {patient.patientId}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">
                    {patientSop.id}
                  </span>
                  {patient.patientId === 'MALAFFI-PT-004' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[9px] shadow-xs">
                      ★ {isAr ? 'ابدأ هنا' : 'Start Here'}
                    </span>
                  )}
                  {desc && renderMiniSparkline(desc.sparkline, isSelected)}
                  {hasStat && (
                    <span className="px-1 py-0.2 rounded bg-rose-600 text-white font-bold text-[9px]">
                      STAT
                    </span>
                  )}
                  {!hasStat && hasBlind && (
                    <span className="px-1 py-0.2 rounded bg-amber-600 text-white font-bold text-[9px]">
                      Trap
                    </span>
                  )}
                </div>
                {desc && (
                  <span className={`text-[10px] truncate max-w-[140px] font-normal ${isSelected ? 'text-emerald-300 font-semibold' : 'text-slate-400'}`}>
                    {isAr ? desc.titleAr : desc.titleEn}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Patient & Active SOP Protocol Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-700/60">
              {activeSop.id}
            </span>
            <span className="font-semibold text-white">
              {isAr ? activeSop.titleAr : activeSop.titleEn}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              {PATIENT_DESCRIPTORS[activeRecord.patientId]
                ? `${isAr ? PATIENT_DESCRIPTORS[activeRecord.patientId].nameAr : PATIENT_DESCRIPTORS[activeRecord.patientId].nameEn} · ${isAr ? PATIENT_DESCRIPTORS[activeRecord.patientId].titleAr : PATIENT_DESCRIPTORS[activeRecord.patientId].titleEn}`
                : activeRecord.patientId}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-sans font-semibold">
              {isAr ? 'إشراف: د. مريم (الطبيبة المعالجة)' : 'Attending: Dr. Mariam (Attending Physician)'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400">{isAr ? 'المرحلة الحالية:' : 'Encounter Phase:'}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-600/60 text-emerald-300 font-bold">
              {activeSop.encounterPhase}
            </span>
          </div>
        </div>

        {/* Row 3: 4-Step Stepper (SOAP Framework) + Open Loops Badge + Master Guided 1-Click CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {/* 4-Step Visual Loop Stepper (Mapped to S-O-A-P) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { num: 1, key: 'S', labelEn: '1. S: Subjective Intake', labelAr: '1. س: التقييم الذاتي' },
              { num: 2, key: 'O', labelEn: '2. O: Objective QC & Labs', labelAr: '2. ع: التقييم الموضوعي' },
              { num: 3, key: 'A', labelEn: '3. A: Assessment & Differential', labelAr: '3. ت: التقييم التفريقي' },
              { num: 4, key: 'P', labelEn: '4. P: Plan & +90d Follow-Up', labelAr: '4. خ: خطة الرعاية' },
            ].map((step) => {
              const isActive = activeWorkbenchStep === step.num;
              const isPassed = activeWorkbenchStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num === 4) {
                      if (onBridgeToCarePlan) onBridgeToCarePlan(activeRecord, evaluation);
                    } else {
                      setActiveWorkbenchStep(step.num);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                      : isPassed
                      ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-emerald-900'
                        : isPassed
                        ? 'bg-emerald-900 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? '✓' : step.key}
                  </span>
                  <span>{isAr ? step.labelAr : step.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Open Loops Badge & Master Single 1-Click CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Open Loops Badge */}
            <div
              data-testid="open-loops-badge"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs transition-all ${
                openLoopsCount === 0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-celebrate shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}
            >
              {openLoopsCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {openLoopsCount === 2 && (isAr ? '2 حلقات مفتوحة (مطلوب إجراء)' : '2 Open Loops (Action Required)')}
                {openLoopsCount === 1 && (isAr ? '1 حلقة مفتوحة (مطلوب إجراء)' : '1 Open Loop (Action Required)')}
                {openLoopsCount === 0 && (isAr ? '0 حلقات مفتوحة (كافة الحلقات مغلقة ✓)' : '0 Open Loops (All Loops Closed ✓)')}
              </span>
            </div>

            {/* Master Single 1-Click Guided CTA Button */}
            <button
              type="button"
              data-testid="btn-guided-loop-next"
              onClick={handleGuidedNext}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>{getGuidedCtaLabel()}</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2-COLUMN SPLIT WORKSPACE:
          LEFT: 62% The Clean 4-Step S → O → A → P Clinical Encounter Sheet
          RIGHT: 38% AI SOP Co-Pilot & Exception Assistant (Sticky)
         ===================================================================== */}
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN (62% Width): SOAP CLINICAL ENCOUNTER SHEET */}
        <div className="w-full lg:w-[62%] flex flex-col gap-6">

          {/* =====================================================================
              THE MOMENT THAT MATTERS: TODAY'S PAIN VS. 1-TAP MAGIC
              Based on Stephen Gear (Microsoft Innovation Hub) & Hack2Skill Rubric
             ===================================================================== */}
          <div
            data-testid="moment-that-matters-banner"
            className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {isAr ? 'اللحظة الحاسمة • ألم الواقع الحالي مقابل حل مسار أمانة بنقرة واحدة' : 'The Moment That Matters • Today’s Pain vs. 1-Tap Magic'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="text-white font-bold">
                  {PATIENT_DESCRIPTORS[activeRecord.patientId]
                    ? (isAr ? PATIENT_DESCRIPTORS[activeRecord.patientId].nameAr : PATIENT_DESCRIPTORS[activeRecord.patientId].nameEn)
                    : activeRecord.patientId}
                </span>
                <span>•</span>
                <span className="text-emerald-300 font-sans font-semibold">
                  {isAr ? 'إشراف: د. مريم' : 'Dr. Mariam in Charge'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              {/* 🔴 The Pain */}
              <div className="rounded-xl bg-rose-950/40 border border-rose-800/40 p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px] uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{isAr ? 'بدون مسار أمانة (الألم / الواقع اليوم)' : 'Without Masar Amanah (The Pain)'}</span>
                </div>
                <p className="text-rose-100/90 text-[11.5px] leading-relaxed">
                  {PATIENT_DESCRIPTORS[activeRecord.patientId]?.painEn
                    ? (isAr ? PATIENT_DESCRIPTORS[activeRecord.patientId].painAr : PATIENT_DESCRIPTORS[activeRecord.patientId].painEn)
                    : ''}
                </p>
              </div>

              {/* 🟢 The Magic */}
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/50 p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isAr ? 'مع مسار أمانة (الحل بنقرة واحدة)' : 'With Masar Amanah (The 1-Tap Magic)'}</span>
                </div>
                <p className="text-emerald-100/90 text-[11.5px] leading-relaxed">
                  {PATIENT_DESCRIPTORS[activeRecord.patientId]?.magicEn
                    ? (isAr ? PATIENT_DESCRIPTORS[activeRecord.patientId].magicAr : PATIENT_DESCRIPTORS[activeRecord.patientId].magicEn)
                    : ''}
                </p>
              </div>
            </div>
          </div>

      {/* =====================================================================
          STEP 1: Longitudinal Scan & Blind Spots
         ===================================================================== */}
      {(activeWorkbenchStep === 1 || expertView) && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* 👉 DO THIS NEXT: Step 1 Spotlight Banner */}
          <div className="bg-emerald-950/90 border-2 border-emerald-500/70 rounded-2xl p-4 shadow-md text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-400 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                1
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span>👉 {isAr ? 'الإجراء التالي المطلوب:' : 'DO THIS NEXT:'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-900 border border-emerald-600 font-mono text-emerald-200">
                    S: Subjective Malaffi Intake
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {isAr
                    ? 'راجع السجل الطولي وفحص السلامة الحاد (0 علامات خطر)، ثم انقر على الزر للمعاينة المخبرية.'
                    : 'Review longitudinal Malaffi intake and acute safety screen (0 red flags), then click below to inspect Objective Labs.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGuidedNext}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>{isAr ? 'فحص المختبر (الخطوة 2) ←' : 'Inspect Objective Labs (Step 2) →'}</span>
            </button>
          </div>

          {/* Patient Overview Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                    STEP 1: LONGITUDINAL SCAN
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {activeRecord.pseudonymToken}
                  </span>
                  {PATIENT_DESCRIPTORS[activeRecord.patientId] && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {isAr
                        ? PATIENT_DESCRIPTORS[activeRecord.patientId].paradoxAr
                        : PATIENT_DESCRIPTORS[activeRecord.patientId].paradoxEn}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {isAr ? activeRecord.primaryComplaintAr : activeRecord.primaryComplaintEn}
                </p>
                {/* Sahatna Wearable Live Stream Bar */}
                {PATIENT_DESCRIPTORS[activeRecord.patientId] && (
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600 font-mono">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-800">
                      {isAr ? 'صحتي (Sahatna Wearable):' : 'Sahatna Wearable Feed:'}
                    </span>
                    <span>
                      {isAr
                        ? PATIENT_DESCRIPTORS[activeRecord.patientId].sahatnaSummaryAr
                        : PATIENT_DESCRIPTORS[activeRecord.patientId].sahatnaSummaryEn}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-lg">
                  {isAr ? 'الفئة العمرية:' : 'IFHAS Bracket:'} {activeRecord.ifhasBracket}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-lg">
                  {activeRecord.encounters.length} {isAr ? 'زيارات مسجلة' : 'Sequential Encounters'}
                </span>
                {onBridgeToCarePlan && (
                  <button
                    type="button"
                    data-testid="btn-bridge-care-plan"
                    onClick={() => onBridgeToCarePlan(activeRecord, evaluation)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <span>
                      {isAr
                        ? 'ربط المريض بمحاكي 90 يوماً وخطة رعاية أبوظبي ←'
                        : 'Bridge Patient to 90-Day Simulator & Care Plan →'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Sequential Encounters Timeline */}
            <h3 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              {isAr ? 'المسار الزمني للزيارات والفحوصات المخبرية' : 'Sequential Longitudinal Encounter Trajectory'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeRecord.encounters.map((enc, idx) => {
                const isLatest = idx === activeRecord.encounters.length - 1;
                const semen = enc.semenLab;
                const endo = enc.endocrinePanel;
                const tmsc =
                  semen !== null
                    ? Number((semen.volumeMl * semen.concentrationMMl * (semen.totalMotilityPct / 100)).toFixed(2))
                    : null;

                return (
                  <div
                    key={enc.encounterId}
                    className={`rounded-xl border p-4 flex flex-col justify-between ${
                      isLatest
                        ? 'border-emerald-600 bg-white shadow-sm'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">
                          {isLatest
                            ? (isAr ? 'الزيارة الأخيرة (الآن)' : 'Latest Encounter (Current)')
                            : `${isAr ? 'الزيارة' : 'Encounter'} #${idx + 1}`}
                        </span>
                        <span className="text-[11px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          {new Date(enc.dateIso).toLocaleDateString(isAr ? 'ar-AE' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium mb-3">
                        {enc.clinicalSetting.replace('_', ' ')}
                      </div>

                      {/* Vitals Summary */}
                      <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-100 rounded-lg p-2 mb-3">
                        <div>
                          <div className="text-[10px] text-slate-700">BMI</div>
                          <div className="text-xs font-bold text-slate-900">{enc.vitals.bmi}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-700">HbA1c</div>
                          <div className="text-xs font-bold text-slate-900">{enc.vitals.hba1cPct}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-700">Rest HR</div>
                          <div className="text-xs font-bold text-slate-900">{enc.vitals.restingHrBpm}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-700">Sleep</div>
                          <div className="text-xs font-bold text-slate-900">{enc.vitals.sleepHoursAvg}h</div>
                        </div>
                      </div>

                      {/* Semen Labs */}
                      <div className="mb-2">
                        <div className="text-[11px] font-bold text-slate-700 mb-1">
                          {isAr ? 'فحص السائل المنوي (WHO 6th):' : 'Semen Analysis (WHO 6th):'}
                        </div>
                        {semen ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] bg-slate-100 p-2 rounded-lg">
                            <div>Vol: <span className="font-bold">{semen.volumeMl} mL</span></div>
                            <div>Conc: <span className="font-bold">{semen.concentrationMMl} M/mL</span></div>
                            <div>Mot: <span className="font-bold">{semen.totalMotilityPct}%</span></div>
                            <div>TMSC: <span className="font-bold text-emerald-800">{tmsc} M</span></div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-700 italic bg-slate-100 p-2 rounded-lg">
                            {isAr ? 'لم يُطلب تحليل منوي في هذه الزيارة' : 'No semen lab ordered in this encounter'}
                          </div>
                        )}
                      </div>

                      {/* Endocrine Panel */}
                      <div className="mb-2">
                        <div className="text-[11px] font-bold text-slate-700 mb-1">
                          {isAr ? 'لوحة الغدد الصماء والهرمونات:' : 'Endocrine & Hormone Panel:'}
                        </div>
                        {endo ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[11px] bg-slate-100 p-2 rounded-lg">
                            <div>
                              FSH:{' '}
                              <span className="font-bold">
                                {endo.fshIuL !== null ? `${endo.fshIuL} IU/L` : <span className="text-amber-800">NULL</span>}
                              </span>
                            </div>
                            <div>
                              LH:{' '}
                              <span className="font-bold">
                                {endo.lhIuL !== null ? `${endo.lhIuL} IU/L` : <span className="text-amber-800">NULL</span>}
                              </span>
                            </div>
                            <div>
                              Total T:{' '}
                              <span className="font-bold">
                                {endo.totalTestosteroneNgDl !== null ? `${endo.totalTestosteroneNgDl} ng/dL` : <span className="text-amber-800">NULL</span>}
                              </span>
                            </div>
                            <div>
                              E2:{' '}
                              <span className="font-bold">
                                {endo.estradiolPgMl !== null ? `${endo.estradiolPgMl} pg/mL` : <span className="text-amber-800">NULL</span>}
                              </span>
                            </div>
                            <div>
                              Prolactin:{' '}
                              <span className="font-bold">
                                {endo.prolactinNgMl !== null ? `${endo.prolactinNgMl} ng/mL` : <span className="text-amber-800 font-mono">NULL</span>}
                              </span>
                            </div>
                            {endo.totalTestosteroneNgDl && endo.estradiolPgMl && (
                              <div>
                                T/E2:{' '}
                                <span className="font-bold text-emerald-800">
                                  {(endo.totalTestosteroneNgDl / endo.estradiolPgMl).toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {isAr ? 'الفحوصات الهرمونية غير متوفرة (NULL)' : 'Endocrine biomarkers unmeasured (NULL state)'}
                          </div>
                        )}
                      </div>

                      {/* Active Medications */}
                      {enc.medications.length > 0 && (
                        <div className="mt-2 text-xs">
                          <div className="text-[11px] font-bold text-slate-700 mb-0.5">
                            {isAr ? 'الأدوية الموصوفة:' : 'Prescribed Medications:'}
                          </div>
                          {enc.medications.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="bg-rose-50 border border-rose-200 text-rose-900 rounded p-1.5 text-[11px] flex items-center justify-between"
                            >
                              <span className="font-semibold">{m.name}</span>
                              <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded">
                                {m.class} (Started: {m.startDateIso.split('T')[0]})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Triggered Life-Saving Escalations & Blind-Spot Syndromes */}
          {(evaluation.lifeSafetyEscalations.some((e) => e.triggered) ||
            evaluation.blindSpotSyndromes.some((s) => s.triggered)) && (
            <section className="flex flex-col gap-4">
              {/* Triggered Life-Saving Escalations (Solid Rose Surface) */}
              {evaluation.lifeSafetyEscalations
                .filter((e) => e.triggered)
                .map((esc) => (
                  <div
                    key={esc.id}
                    className="bg-rose-950 text-white border-2 border-rose-600 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-rose-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider bg-rose-800 text-rose-200 px-2 py-0.5 rounded font-bold">
                            PLANE A · STAT LIFE-SAVING ALERT
                          </span>
                          <h3 className="text-lg font-bold text-white mt-0.5">
                            {isAr ? esc.titleAr : esc.titleEn}
                          </h3>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-xs font-mono text-rose-200 bg-rose-900 px-2.5 py-1 rounded">
                          ICD-10: {esc.icd10Code} | SNOMED: {esc.snomedCode}
                        </span>
                        <div className="text-xs text-rose-300 font-bold mt-1">
                          {isAr ? 'الاحتمالية المحسوبة:' : 'Calculated Probability:'} {(esc.probability * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-rose-100 leading-relaxed mb-4">
                      {isAr ? esc.rationaleAr : esc.rationaleEn}
                    </div>

                    <div className="bg-rose-900 border border-rose-700 rounded-lg p-3 text-xs">
                      <div className="font-bold text-rose-200 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-300" />
                        {isAr ? 'الإجراء السريري العاجل المطلوب:' : 'STAT Required Clinical Action:'}
                      </div>
                      <p className="text-white mb-2 font-medium">
                        {isAr ? esc.urgentActionAr : esc.urgentActionEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {esc.requiredStatLabs.map((lab, lIdx) => (
                          <span
                            key={lIdx}
                            className="px-2 py-0.5 bg-rose-800 text-rose-100 font-mono text-[10px] rounded border border-rose-600 font-semibold"
                          >
                            {lab}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Triggered Blind-Spot Syndromes (Solid Amber Surface) */}
              {evaluation.blindSpotSyndromes
                .filter((s) => s.triggered)
                .map((syn) => {
                  const isLinkedToActiveDDx = syn.parentSignalIds.some((sigId) =>
                    activeConnectedSignalIds.has(sigId)
                  );

                  return (
                    <div
                      key={syn.id}
                      className={`bg-amber-950 text-white rounded-xl p-5 shadow-sm transition-all ${
                        isLinkedToActiveDDx
                          ? 'border-2 border-emerald-500 ring-2 ring-emerald-500'
                          : 'border-2 border-amber-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-amber-800 pb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-800 text-amber-200 px-2 py-0.5 rounded font-bold">
                                TECHNICIAN BLIND SPOT · {syn.severity}
                              </span>
                              {isLinkedToActiveDDx && (
                                <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-900 text-emerald-200 border border-emerald-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <GitBranch className="w-3 h-3 text-emerald-400" />
                                  {isAr ? 'مرتبط بالفرضية المحددة' : 'LINKED TO SELECTED DDX'}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-white mt-0.5">
                              {isAr ? syn.titleAr : syn.titleEn}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-amber-900 border border-amber-800 rounded-lg p-3">
                          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide mb-1">
                            {isAr ? 'ما يراه فني المختبر بالتقييم المنفرد:' : 'What Standard Single-Point Check Sees:'}
                          </div>
                          <p className="text-amber-100 leading-relaxed">
                            {isAr ? syn.whatTechSeesAr : syn.whatTechSeesEn}
                          </p>
                        </div>

                        <div className="bg-emerald-950 border border-emerald-700 rounded-lg p-3">
                          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isAr ? 'ما يكتشفه المخطط البياني التراكمي:' : 'What Cross-Silo Longitudinal Graph Catches:'}
                          </div>
                          <p className="text-emerald-100 leading-relaxed">
                            {isAr ? syn.whatGraphCatchesAr : syn.whatGraphCatchesEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </section>
          )}

          {/* Recorded Findings for Step S */}
          {loggedFacts.filter((f) => f.stepKey === 'S').length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? 'الملاحظات السريرية الموثقة في مرحلة الاستقبال (S)' : 'Recorded Intake Findings & Logged Facts (Step S)'}</span>
              </div>
              <div className="space-y-1.5">
                {loggedFacts
                  .filter((f) => f.stepKey === 'S')
                  .map((fact) => (
                    <div key={fact.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-800">{fact.fact}</span>
                      <span className="text-[10px] font-mono text-slate-500 ms-2 shrink-0">{fact.timestamp}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SOP Gate Check Action Bar for S: SUBJECTIVE */}
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {isAr ? 'بوابة التحقق السريري: التقييم الذاتي وتدقيق مرحلة ما قبل التحليل' : 'SOP Gate Check: S · Subjective Intake & Pre-Analytical QC'}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {isAr
                  ? 'تحقق من فترة الامتناع (2–7 أيام)، استبعاد علامات الطوارئ، وتدقيق الأدوية المأخوذة'
                  : 'Verify 2–7d abstinence window, 0ms scrotal mass/torsion screen, and 74-day medication history.'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleLogClinicalFact(
                    'Intake verified: 2–7 day abstinence confirmed, red flags triaged, 74-day medication history audited.',
                    'intake',
                    'YES',
                    'S'
                  );
                  setActiveWorkbenchStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{isAr ? '✓ اعتماد التقييم وفترة الامتناع (الانتقال للتقييم الموضوعي) ←' : '✓ Verify Intake & Pre-Analytical QC (2–7d Abstinence) →'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopilotTriggerDeviation}
                className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-400"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>{isAr ? '⚡ نتيجة مفاجئة / استشارة المساعد' : '⚡ Outcome Differs / Stuck -> Ask AI Co-Pilot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: Causal Root-Tree & Differential
         ===================================================================== */}
      {(activeWorkbenchStep === 2 || expertView) && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* 👉 DO THIS NEXT: Step 2 Spotlight Banner */}
          <div className="bg-sky-950/90 border-2 border-sky-500/70 rounded-2xl p-4 shadow-md text-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-800/80 border border-sky-400 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                2
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <span>👉 {isAr ? 'الإجراء التالي المطلوب:' : 'DO THIS NEXT:'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-900 border border-sky-600 font-mono text-sky-200">
                    O: Objective Labs & Differential
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {isAr
                    ? 'تحقق من معايير منظمة الصحة العالمية (احذر فخ TMSC < 20M) ولاحظ الفحوصات الهرمونية الفارغة (NULL)، ثم انتقل للتقييم.'
                    : 'Verify WHO 6th semen parameters (watch for False-Normal TMSC < 20M trap) and note missing NULL endocrine labs, then proceed to Assessment.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGuidedNext}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>{isAr ? 'الانتقال للتقييم البايزي (الخطوة 3) ←' : 'Proceed to Assessment (Step 3) →'}</span>
            </button>
          </div>

          {/* Clean Side-by-Side Table: WHO 6th Semen Parameters & Endocrine Labs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  STAGE 2 · O: OBJECTIVE LABS & QC
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-800" />
                  {isAr ? 'فحص السائل المنوي (WHO 6th) ولوحة الغدد الصماء' : 'WHO 6th Ed Semen Analysis & Endocrine Discriminators'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isAr
                    ? 'تدقيق معايير منظمة الصحة العالمية والتركيز على مفارقة الفحص السليم الخادعة والمؤشرات الهرمونية المفقودة'
                    : 'Objective laboratory verification: WHO 6th 4-parameter thresholds, composite TMSC, and missing endocrine discriminators.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  {activeRecord.patientId} · {activeRecord.age}y
                </span>
              </div>
            </div>

            {/* False-Normal Paradox Alert Banner if applicable (e.g. PT-001 with TMSC 10.32M) */}
            {currentSeLab &&
              currentSeLab.volumeMl >= 1.4 &&
              currentSeLab.concentrationMMl >= 16 &&
              currentSeLab.totalMotilityPct >= 42 &&
              currentSeLab.normalMorphologyPct >= 4 &&
              liveTmsc !== null &&
              liveTmsc < 20 && (
                <div className="mb-4 bg-amber-950 text-white border-2 border-amber-500 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                        {isAr ? 'تنبيه: مفارقة الفحص السليم الخادعة (SYN_FALSE_NORMAL_SUBFERTILITY)' : 'CLINICAL ALERT: FALSE-NORMAL WHO LINE TRAP (SYN_FALSE_NORMAL_SUBFERTILITY)'}
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {isAr
                          ? `كافة مؤشرات فحص السائل المنوي الأربعة تجتاز الحدود الدنيا الفردية، لكن العدد الإجمالي للنطاف المتحركة (TMSC = ${liveTmsc}M < 20M) يقع في نطاق القصور الإنجابي الخفي.`
                          : `All 4 individual WHO 6th lines pass lower reference limits, but composite Total Motile Sperm Count (TMSC = ${liveTmsc}M < 20M) indicates hidden subfertility.`}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Side-by-Side Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Table 1: WHO 6th Semen Analysis */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>{isAr ? 'مؤشرات فحص السائل المنوي (WHO 6th)' : 'WHO 6th Edition Semen Analysis'}</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {liveTmsc !== null ? `TMSC: ${liveTmsc} M` : 'No Semen Lab'}
                  </span>
                </div>
                <div className="p-3 text-xs">
                  {currentSeLab ? (
                    <table className="w-full text-start">
                      <thead>
                        <tr className="text-[10px] font-mono text-slate-500 border-b border-slate-200">
                          <th className="text-start pb-1.5">{isAr ? 'المؤشر' : 'Biomarker'}</th>
                          <th className="text-end pb-1.5">{isAr ? 'النتيجة' : 'Value'}</th>
                          <th className="text-end pb-1.5">{isAr ? 'المرجع الطبي' : 'WHO 6th Ref'}</th>
                          <th className="text-end pb-1.5">{isAr ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-mono">
                        <tr>
                          <td className="py-1.5 text-slate-700 font-medium">Volume</td>
                          <td className="py-1.5 text-end font-bold text-slate-900">{currentSeLab.volumeMl} mL</td>
                          <td className="py-1.5 text-end text-slate-500">≥ 1.4 mL</td>
                          <td className="py-1.5 text-end">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentSeLab.volumeMl >= 1.4 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {currentSeLab.volumeMl >= 1.4 ? 'PASS' : 'LOW'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-700 font-medium">Concentration</td>
                          <td className="py-1.5 text-end font-bold text-slate-900">{currentSeLab.concentrationMMl} M/mL</td>
                          <td className="py-1.5 text-end text-slate-500">≥ 16 M/mL</td>
                          <td className="py-1.5 text-end">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentSeLab.concentrationMMl >= 16 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {currentSeLab.concentrationMMl >= 16 ? 'PASS' : 'LOW'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-700 font-medium">Total Motility</td>
                          <td className="py-1.5 text-end font-bold text-slate-900">{currentSeLab.totalMotilityPct}%</td>
                          <td className="py-1.5 text-end text-slate-500">≥ 42%</td>
                          <td className="py-1.5 text-end">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentSeLab.totalMotilityPct >= 42 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {currentSeLab.totalMotilityPct >= 42 ? 'PASS' : 'LOW'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-700 font-medium">Normal Morphology</td>
                          <td className="py-1.5 text-end font-bold text-slate-900">{currentSeLab.normalMorphologyPct}%</td>
                          <td className="py-1.5 text-end text-slate-500">≥ 4.0%</td>
                          <td className="py-1.5 text-end">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentSeLab.normalMorphologyPct >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {currentSeLab.normalMorphologyPct >= 4 ? 'PASS' : 'LOW'}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-100/80 font-bold">
                          <td className="py-1.5 text-slate-900">{isAr ? 'العدد الفعال (TMSC)' : 'Composite TMSC'}</td>
                          <td className="py-1.5 text-end text-emerald-800">{liveTmsc} M</td>
                          <td className="py-1.5 text-end text-slate-600">≥ 20 M</td>
                          <td className="py-1.5 text-end">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${liveTmsc !== null && liveTmsc >= 20 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                              {liveTmsc !== null && liveTmsc >= 20 ? 'OPTIMAL' : 'SUBFERTILE'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-slate-500 italic text-center">
                      {isAr ? 'لم يتم تسجيل تحليل منوي في الزيارة الحالية' : 'No semen lab recorded in current encounter'}
                    </div>
                  )}
                </div>
              </div>

              {/* Table 2: Endocrine Discriminators */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>{isAr ? 'لوحة الغدد الصماء والهرمونات' : 'Endocrine Discriminator Panel'}</span>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    {latestEncounter?.endocrinePanel ? 'Measured' : 'Awaiting Labs'}
                  </span>
                </div>
                <div className="p-3 text-xs">
                  <table className="w-full text-start">
                    <thead>
                      <tr className="text-[10px] font-mono text-slate-500 border-b border-slate-200">
                        <th className="text-start pb-1.5">{isAr ? 'الهرمون' : 'Hormone'}</th>
                        <th className="text-end pb-1.5">{isAr ? 'النتيجة' : 'Value'}</th>
                        <th className="text-end pb-1.5">{isAr ? 'المجال المرجعي' : 'Reference'}</th>
                        <th className="text-end pb-1.5">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-mono">
                      {/* Serum FSH */}
                      <tr>
                        <td className="py-1.5 text-slate-700 font-medium">Serum FSH</td>
                        <td className="py-1.5 text-end font-bold">
                          {fshIuL !== null ? `${fshIuL} IU/L` : <span className="text-amber-800 bg-amber-100 px-1 rounded">NULL</span>}
                        </td>
                        <td className="py-1.5 text-end text-slate-500">1.5–12.4 IU/L</td>
                        <td className="py-1.5 text-end">
                          {fshIuL !== null ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fshIuL > 12.4 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {fshIuL > 12.4 ? 'HIGH' : 'NORMAL'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              MISSING
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Serum LH */}
                      <tr>
                        <td className="py-1.5 text-slate-700 font-medium">Serum LH</td>
                        <td className="py-1.5 text-end font-bold">
                          {lhIuL !== null ? `${lhIuL} IU/L` : <span className="text-amber-800 bg-amber-100 px-1 rounded">NULL</span>}
                        </td>
                        <td className="py-1.5 text-end text-slate-500">1.7–8.6 IU/L</td>
                        <td className="py-1.5 text-end">
                          {lhIuL !== null ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lhIuL > 8.6 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {lhIuL > 8.6 ? 'HIGH' : 'NORMAL'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              MISSING
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Total Testosterone */}
                      <tr>
                        <td className="py-1.5 text-slate-700 font-medium">Total Testosterone</td>
                        <td className="py-1.5 text-end font-bold">
                          {totalTestosteroneNgDl !== null ? `${totalTestosteroneNgDl} ng/dL` : <span className="text-amber-800 bg-amber-100 px-1 rounded">NULL</span>}
                        </td>
                        <td className="py-1.5 text-end text-slate-500">300–1000 ng/dL</td>
                        <td className="py-1.5 text-end">
                          {totalTestosteroneNgDl !== null ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${totalTestosteroneNgDl < 300 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {totalTestosteroneNgDl < 300 ? 'LOW' : 'NORMAL'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              MISSING
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Serum Prolactin */}
                      <tr>
                        <td className="py-1.5 text-slate-700 font-medium">Serum Prolactin</td>
                        <td className="py-1.5 text-end font-bold">
                          {prolactinNgMl !== null ? `${prolactinNgMl} ng/mL` : <span className="text-amber-800 bg-amber-100 px-1 rounded">NULL</span>}
                        </td>
                        <td className="py-1.5 text-end text-slate-500">4.0–15.2 ng/mL</td>
                        <td className="py-1.5 text-end">
                          {prolactinNgMl !== null ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${prolactinNgMl > 15.2 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {prolactinNgMl > 15.2 ? 'HIGH' : 'NORMAL'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              MISSING
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Serum Estradiol */}
                      <tr>
                        <td className="py-1.5 text-slate-700 font-medium">Serum Estradiol (E2)</td>
                        <td className="py-1.5 text-end font-bold">
                          {estradiolPgMl !== null ? `${estradiolPgMl} pg/mL` : <span className="text-amber-800 bg-amber-100 px-1 rounded">NULL</span>}
                        </td>
                        <td className="py-1.5 text-end text-slate-500">10–40 pg/mL</td>
                        <td className="py-1.5 text-end">
                          {estradiolPgMl !== null ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              NORMAL
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              MISSING
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Deep Bayesian Causal Graph & 6-Branch Differential Drawer */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setIsCausalDrawerOpen(!isCausalDrawerOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Dna className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">
                  {isAr
                    ? '🔬 استعراض شجرة الجذور السببية البايزية (مخطط SVG رباعي الطبقات و 6 فروع تفريقية)'
                    : '🔬 View Deep Bayesian Causal Graph (4-Layer SVG Tree & 6-Branch Differential)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                  Entropy: {evaluation.jointEntropyBits} bits · Certainty: {evaluation.diagnosticCertaintyPct}%
                </span>
                {isCausalDrawerOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {isCausalDrawerOpen && (
              <div className="p-5 border-t border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                      STEP 2: CAUSAL ROOT-TREE & DIFFERENTIAL
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
                      <Dna className="w-5 h-5 text-emerald-800" />
                      {isAr ? 'شجرة التشخيص التفريقي البايزي متعدد التصنيفات (المستوى ب)' : 'Plane B Multi-Label Bayesian Differential'}
                    </h2>
                    <p className="text-xs text-slate-700 mt-1">
                      {isAr
                        ? 'حساب احتمالات لوجستية مستقلة لكل فرضية سريرية دون تطبيع سوفت ماكس (قانون 1: الاستقلالية التشخيصية)'
                        : 'Independent multi-label logistic posteriors without Softmax dilution (Law 1: Null ≠ Zero invariant)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-mono">
                      <span className="text-slate-600">{isAr ? 'الإنتروبيا:' : 'Joint Entropy:'}</span>{' '}
                      <span className="font-bold text-slate-900">{evaluation.jointEntropyBits} bits</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-mono">
                      <span className="text-emerald-700">{isAr ? 'اليقين:' : 'Certainty:'}</span>{' '}
                      <span className="font-bold text-emerald-900">{evaluation.diagnosticCertaintyPct}%</span>
                    </div>
                  </div>
                </div>

                {/* 6 Bayesian Posterior Bars */}
                <div className="space-y-3.5">
                  {evaluation.differentialRanking.map((hyp, hIdx) => {
                    const isExpanded = expandedHypothesisId === hyp.id;
                    const isSelected = hyp.id === activeHypothesisId;
                    const pct = Math.round(hyp.posteriorProbability * 100);

                    const barBg =
                      pct >= 80
                        ? 'bg-emerald-600'
                    : pct >= 38
                    ? 'bg-amber-500'
                    : 'bg-slate-400';

                return (
                  <div
                    key={hyp.id}
                    data-testid={`causal-ddx-${hyp.id}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedHypothesisId(hyp.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedHypothesisId(hyp.id);
                      }
                    }}
                    className={`rounded-xl p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-emerald-600 ring-2 ring-emerald-500 bg-white shadow-md'
                        : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          #{hIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {isAr ? hyp.titleAr : hyp.titleEn}
                            </h3>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                <GitBranch className="w-3 h-3 text-emerald-700" />
                                {isAr ? 'جاري تتبع الجذور السببية' : 'Tracing Causal Roots'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              ICD-10: {hyp.codeIcd10}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              SNOMED: {hyp.codeSnomed}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                              {hyp.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="text-xl font-black font-mono text-slate-900">
                          {pct}%
                        </div>
                        <div className="text-[10px] text-slate-700 font-mono">
                          Log-Odds: {hyp.posteriorLogOdds} (Prior: {hyp.priorLogOdds})
                        </div>
                      </div>
                    </div>

                    {/* Posterior Probability Progress Bar with Ghost Prior Marker */}
                    <div className="w-full bg-slate-100 rounded-full h-3.5 mb-2 overflow-hidden relative border border-slate-200">
                      {/* Ghost Prior Marker */}
                      <div
                        className="absolute top-0 bottom-0 bg-slate-300 opacity-50 border-r-2 border-slate-600 z-0"
                        style={{ width: `${Math.max(3, Math.round(hyp.priorProbability * 100))}%` }}
                        title={`Prior Probability: ${Math.round(hyp.priorProbability * 100)}%`}
                        aria-hidden="true"
                      />
                      {/* Posterior Animated Fill Bar */}
                      <div
                        className={`h-3.5 rounded-full transition-all duration-500 relative z-10 animate-bar-fill ${barBg}`}
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>

                    {/* Prior vs Posterior Delta Legend */}
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-2 px-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-xs bg-slate-400 inline-block" />
                        {isAr ? 'القبلي' : 'Prior'}: {Math.round(hyp.priorProbability * 100)}%
                      </span>
                      <span className="font-bold text-slate-700">
                        Δ: {pct - Math.round(hyp.priorProbability * 100) >= 0 ? '+' : ''}{pct - Math.round(hyp.priorProbability * 100)}% shift
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <span className={`w-2 h-2 rounded-xs ${barBg} inline-block`} />
                        {isAr ? 'البعدي' : 'Posterior'}: {pct}%
                      </span>
                    </div>

                    {/* Evidence Details Collapsible Toggle */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-800 font-semibold">
                          +{hyp.supportingEdges.length} {isAr ? 'أدلة مؤيدة' : 'supporting'}
                        </span>
                        <span className="text-rose-800 font-semibold">
                          -{hyp.contradictingEdges.length} {isAr ? 'أدلة نافية' : 'contradicting'}
                        </span>
                        {hyp.nullDiscriminatorIds.length > 0 && (
                          <span className="text-amber-800 font-semibold">
                            {hyp.nullDiscriminatorIds.length} {isAr ? 'مؤشرات معلقة' : 'NULL discriminators'}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedHypothesisId(isExpanded ? null : hyp.id);
                        }}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium focus:outline-none cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            {isAr ? 'إخفاء شجرة الأدلة' : 'Hide Mathematical Trace'}
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            {isAr ? 'عرض شجرة الأدلة والأوزان' : 'View Evidence Trace (+ln LR)'}
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded Mathematical Trace */}
                    {isExpanded && (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                        {hyp.supportingEdges.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-emerald-800 mb-1">
                              {isAr ? 'الأدلة المؤيدة المنشطة (+ln LR):' : 'Active Supporting Evidence (+ln LR):'}
                            </div>
                            <ul className="space-y-1">
                              {hyp.supportingEdges.map((e, eIdx) => (
                                <li
                                  key={eIdx}
                                  className="bg-white border border-emerald-200 rounded px-2 py-1 flex items-center justify-between text-[11px]"
                                >
                                  <span className="text-slate-800">{e.labelEn}</span>
                                  <span className="font-mono font-bold text-emerald-800 shrink-0 ms-2">
                                    +{e.logLikelihoodContribution}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {hyp.contradictingEdges.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-rose-800 mb-1">
                              {isAr ? 'الأدلة النافية المنشطة (-ln LR):' : 'Active Contradicting Evidence (-ln LR):'}
                            </div>
                            <ul className="space-y-1">
                              {hyp.contradictingEdges.map((e, eIdx) => (
                                <li
                                  key={eIdx}
                                  className="bg-white border border-rose-200 rounded px-2 py-1 flex items-center justify-between text-[11px]"
                                >
                                  <span className="text-slate-800">{e.labelEn}</span>
                                  <span className="font-mono font-bold text-rose-800 shrink-0 ms-2">
                                    {e.logLikelihoodContribution}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {hyp.nullDiscriminatorIds.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-amber-800 mb-1">
                              {isAr ? 'فحوصات مطلوبة لحسم عدم اليقين (NULL):' : 'Awaiting Discrimination (NULL Biomarkers):'}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {hyp.nullDiscriminatorIds.map((discId) => (
                                <span
                                  key={discId}
                                  className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] px-2 py-0.5 rounded font-semibold"
                                >
                                  {discId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feature #3: 4-Layer Causal Root-Tree Inspector Panel */}
            {activeHypothesis && (
              <div
                data-testid="causal-root-tree-inspector"
                className="bg-slate-900 text-white border-2 border-emerald-600 rounded-2xl p-5 shadow-lg mt-6"
              >
                {/* Inspector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        {isAr ? 'مستكشف الجذور السببية رباعي الطبقات' : '4-Layer Causal Root-Tree Inspector'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {isAr ? activeHypothesis.titleAr : activeHypothesis.titleEn}
                      <span className="ms-2 text-xs font-mono text-slate-400 font-normal">
                        (ICD-10: {activeHypothesis.codeIcd10} · SNOMED: {activeHypothesis.codeSnomed})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {isAr
                        ? 'تتبع المسار السببي: إشارات المدخلات ← المتلازمات غير المرئية ← أوزان احتمالات بايز (+ln LR) ← الفحوصات الفاصلة المفقودة (NULL)'
                        : 'Dynamic causal path: Signal Roots → Blind-Spot Syndromes → Log-Odds Edges → NULL Discriminator Leaves'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 shrink-0">
                    <div className="text-end">
                      <div className="text-xs text-slate-400 uppercase font-semibold">
                        {isAr ? 'احتمالية الفرضية' : 'Posterior Probability'}
                      </div>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {Math.round(activeHypothesis.posteriorProbability * 100)}%
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="text-xs font-mono text-slate-300">
                      <div>
                        Log-Odds: <span className="font-bold text-white">{activeHypothesis.posteriorLogOdds.toFixed(2)}</span>
                      </div>
                      <div>
                        Prior P₀: <span className="text-slate-400">{Math.round(activeHypothesis.priorProbability * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Animated SVG Causal Flow Bar */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-4 hidden md:flex items-center justify-between text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-400">Layer 1: Upstream Signals</span>
                  </div>
                  <svg viewBox="0 0 40 12" className="w-8 h-3 text-emerald-400">
                    <path d="M 0 6 L 30 6 M 24 2 L 30 6 L 24 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-bold text-amber-400">Layer 2: Blind-Spot Syndromes</span>
                  </div>
                  <svg viewBox="0 0 40 12" className="w-8 h-3 text-amber-400">
                    <path d="M 0 6 L 30 6 M 24 2 L 30 6 L 24 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="font-bold text-sky-400">Layer 3: Bayesian Log-Odds</span>
                  </div>
                  <svg viewBox="0 0 40 12" className="w-8 h-3 text-sky-400">
                    <path d="M 0 6 L 30 6 M 24 2 L 30 6 L 24 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="font-bold text-indigo-400">Layer 4: NULL Leaves</span>
                  </div>
                </div>

                {/* 4 Connected Layer Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Column 1: Layer 1 - Upstream Signal Roots */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        {isAr ? 'الطبقة 1: جذور الإشارات الحيوية' : 'Layer 1: Upstream Signal Roots'}
                      </h4>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1">
                      {(() => {
                        const connectedSignals = evaluation.signals.filter((s) =>
                          activeConnectedSignalIds.has(s.id)
                        );
                        if (connectedSignals.length === 0) {
                          return (
                            <div className="text-xs text-slate-400 italic bg-slate-900 p-3 rounded border border-slate-800">
                              {isAr
                                ? 'لا توجد إشارات حيوية نشطة ترتبط بهذه الفرضية'
                                : 'No upstream biomarker signals directly linked'}
                            </div>
                          );
                        }
                        return connectedSignals.map((sig) => (
                          <div
                            key={sig.id}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="font-semibold text-slate-200">
                                {isAr ? sig.labelAr : sig.labelEn}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                  sig.status === 'ABNORMAL'
                                    ? 'bg-rose-900 text-rose-200 border border-rose-700'
                                    : sig.status === 'BORDERLINE'
                                    ? 'bg-amber-900 text-amber-200 border border-amber-700'
                                    : sig.status === 'NORMAL'
                                    ? 'bg-emerald-950 text-emerald-200 border border-emerald-700'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {sig.status}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-emerald-400">
                              {isAr ? 'القيمة:' : 'Value:'}{' '}
                              <span className="font-bold text-white">
                                {sig.value !== null ? `${sig.value} ${sig.unit}` : 'NULL'}
                              </span>
                            </div>
                            {sig.loincCode && (
                              <div className="text-[10px] font-mono text-slate-500">
                                LOINC: {sig.loincCode} · Ref: {sig.referenceRange}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Column 2: Layer 2 - Cross-Silo Blind-Spot Syndromes */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        {isAr ? 'الطبقة 2: متلازمات النقطة العمياء' : 'Layer 2: Blind-Spot Syndromes'}
                      </h4>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1">
                      {(() => {
                        const connectedSyndromes = evaluation.blindSpotSyndromes.filter(
                          (bs) =>
                            bs.parentSignalIds.some((sigId) =>
                              activeConnectedSignalIds.has(sigId)
                            ) || bs.triggered
                        );
                        if (connectedSyndromes.length === 0) {
                          return (
                            <div className="text-xs text-slate-400 italic bg-slate-900 p-3 rounded border border-slate-800">
                              {isAr
                                ? 'لا توجد متلازمات نقطة عمياء مرتبطة حالياً'
                                : 'No blind-spot syndromes linked to active signals'}
                            </div>
                          );
                        }
                        return connectedSyndromes.map((syn) => (
                          <div
                            key={syn.id}
                            className={`rounded-lg p-2.5 text-xs space-y-1.5 border ${
                              syn.triggered
                                ? 'bg-amber-950 border-amber-700 text-amber-100'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-white">
                                {isAr ? syn.titleAr : syn.titleEn}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                  syn.triggered
                                    ? 'bg-amber-800 text-amber-100 border border-amber-600'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {syn.triggered
                                  ? (isAr ? 'نشط' : 'TRIGGERED')
                                  : (isAr ? 'خامل' : 'INACTIVE')}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                              <div className="text-amber-400 font-semibold">
                                {isAr ? 'ما يفوته الفحص التقليدي:' : 'What Standard Check Misses:'}
                              </div>
                              <div>{isAr ? syn.whatTechSeesAr : syn.whatTechSeesEn}</div>
                            </div>
                            <div className="text-[10px] text-emerald-300 bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                              <div className="text-emerald-400 font-semibold">
                                {isAr ? 'ما يكشفه المخطط البايزي:' : 'What Causal Graph Catches:'}
                              </div>
                              <div>{isAr ? syn.whatGraphCatchesAr : syn.whatGraphCatchesEn}</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Column 3: Layer 3 - Bayesian Log-Odds Propagation */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                      <Dna className="w-4 h-4 text-sky-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                        {isAr ? 'الطبقة 3: انتشار احتمالات بايز' : 'Layer 3: Log-Odds Propagation'}
                      </h4>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1 text-xs">
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                        <div className="flex justify-between items-center text-slate-300 mb-1">
                          <span>{isAr ? 'الاحتمال القبلي (Prior P₀):' : 'Baseline Prior (P₀):'}</span>
                          <span className="font-mono font-bold text-white">
                            {Math.round(activeHypothesis.priorProbability * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                          <span>Prior Log-Odds:</span>
                          <span className="font-bold text-sky-300">
                            {activeHypothesis.priorLogOdds.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center justify-between">
                          <span>{isAr ? 'أدلة مؤيدة نشطة (+ln LR):' : 'Active Supporting (+ln LR):'}</span>
                          <span className="font-mono font-normal text-slate-400">
                            ({activeHypothesis.supportingEdges.length})
                          </span>
                        </div>
                        {activeHypothesis.supportingEdges.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic bg-slate-900 p-2 rounded border border-slate-800">
                            {isAr ? 'لا توجد أدلة مؤيدة مسجلة' : 'No supporting edges active'}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {activeHypothesis.supportingEdges.map((e, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-900 border border-emerald-900 rounded p-2 text-[11px] flex justify-between items-center"
                              >
                                <span className="text-slate-300 truncate mr-2" title={e.labelEn}>
                                  {e.labelEn}
                                </span>
                                <span className="font-mono font-bold text-emerald-400 shrink-0">
                                  +{e.logLikelihoodContribution}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-rose-400 mb-1 flex items-center justify-between">
                          <span>{isAr ? 'أدلة نافية نشطة (-ln LR):' : 'Active Contradicting (-ln LR):'}</span>
                          <span className="font-mono font-normal text-slate-400">
                            ({activeHypothesis.contradictingEdges.length})
                          </span>
                        </div>
                        {activeHypothesis.contradictingEdges.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic bg-slate-900 p-2 rounded border border-slate-800">
                            {isAr ? 'لا توجد أدلة نافية مسجلة' : 'No contradicting edges active'}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {activeHypothesis.contradictingEdges.map((e, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-900 border border-rose-900 rounded p-2 text-[11px] flex justify-between items-center"
                              >
                                <span className="text-slate-300 truncate mr-2" title={e.labelEn}>
                                  {e.labelEn}
                                </span>
                                <span className="font-mono font-bold text-rose-400 shrink-0">
                                  {e.logLikelihoodContribution}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Layer 4 - Discriminator Leaves & Competing Branches */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        {isAr ? 'الطبقة 4: الفحوصات الفاصلة (NULL)' : 'Layer 4: Discriminator Leaves'}
                      </h4>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1">
                      {(() => {
                        const connectedTests = evaluation.rankedNextTests.filter(
                          (t) =>
                            t.separatesHypotheses.includes(activeHypothesisId) ||
                            activeConnectedTestIds.has(t.testId)
                        );
                        if (connectedTests.length === 0) {
                          return (
                            <div className="text-xs text-slate-400 italic bg-slate-900 p-3 rounded border border-slate-800">
                              {isAr
                                ? 'تم حسم جميع الفحوصات الفاصلة لهذه الفرضية'
                                : 'All discriminators for this hypothesis are resolved'}
                            </div>
                          );
                        }
                        return connectedTests.map((test) => (
                          <div
                            key={test.testId}
                            className={`rounded-lg p-2.5 text-xs space-y-1.5 border ${
                              test.isCurrentlyNull
                                ? 'bg-slate-900 border-indigo-700'
                                : 'bg-slate-900 border-slate-800 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-white">
                                {isAr ? test.nameAr : test.nameEn}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                  test.isCurrentlyNull
                                    ? 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {test.isCurrentlyNull ? 'NULL (Missing)' : 'RESOLVED'}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              LOINC: {test.loincCode} · Key: {test.targetBiomarkerKey}
                            </div>
                            {test.isCurrentlyNull && (
                              <>
                                <div className="text-[11px] font-mono text-indigo-300">
                                  Expected IG:{' '}
                                  <span className="font-bold text-white">
                                    +{test.expectedInformationGainBits} bits
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleResolveBiomarker(
                                      test.targetBiomarkerKey,
                                      test.simulatedIfAbnormal.valuePreview
                                    )
                                  }
                                  className="w-full mt-1.5 px-2.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                                  aria-label={`Resolve NULL Lab ${test.nameEn}`}
                                >
                                  {isAr
                                    ? `حسم الفحص (+${test.expectedInformationGainBits} بت)`
                                    : `Resolve NULL Lab (+${test.expectedInformationGainBits} bits)`}
                                </button>
                              </>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
          </div>

          {/* Recorded Findings for Step O */}
          {loggedFacts.filter((f) => f.stepKey === 'O').length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? 'الملاحظات السريرية الموثقة في مرحلة الفحوصات (O)' : 'Recorded Objective Findings & Logged Facts (Step O)'}</span>
              </div>
              <div className="space-y-1.5">
                {loggedFacts
                  .filter((f) => f.stepKey === 'O')
                  .map((fact) => (
                    <div key={fact.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-800">{fact.fact}</span>
                      <span className="text-[10px] font-mono text-slate-500 ms-2 shrink-0">{fact.timestamp}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SOP Gate Check Action Bar for O: OBJECTIVE */}
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {isAr ? 'بوابة التحقق السريري: التقييم الموضوعي والفحوصات المخبرية' : 'SOP Gate Check: O · Objective QC & Labs'}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {isAr
                  ? 'تأكيد نتائج منظمة الصحة العالمية وتحديد حالة الفحوصات الهرمونية المفقودة قبل التقييم'
                  : 'Confirm WHO 6th semen parameters, flag False-Normal paradox, and identify NULL missing endocrine labs.'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleLogClinicalFact(
                    `Objective verification complete: Semen TMSC = ${liveTmsc ?? 'N/A'} M, endocrine panel status audited.`,
                    'lab',
                    'YES',
                    'O'
                  );
                  setActiveWorkbenchStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{isAr ? '✓ تأكيد المعايير وحالة الفحوصات (الانتقال للتقييم التفريقي) ←' : '✓ Confirm WHO Parameters & Missing Lab Status (Advance to Assessment) →'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopilotTriggerDeviation}
                className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-400"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>{isAr ? '⚡ نتيجة مفاجئة / استشارة المساعد' : '⚡ Outcome Differs / Stuck -> Ask AI Co-Pilot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: Close Open Loops Station (NULL Labs & +90d Follow-Up)
         ===================================================================== */}
      {(activeWorkbenchStep === 3 || expertView) && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* 👉 DO THIS NEXT: Step 3 Spotlight Banner */}
          <div className="bg-amber-950/90 border-2 border-amber-500/70 rounded-2xl p-4 shadow-md text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-800/80 border border-amber-400 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                3
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>👉 {isAr ? 'الإجراء التالي المطلوب:' : 'DO THIS NEXT:'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-900 border border-amber-600 font-mono text-amber-200">
                    A: Close Open Loops & Unlock Transfer
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {openLoopsCount > 0
                    ? (isAr
                        ? `أغلق الحلقة التشخيصية ${isOpenLoop1 ? '#1 (حسم فحص الهرمونات المفقود)' : '#2 (دورة متابعة الـ 90 يوماً)'} بنقرة واحدة لفتح خيار إحالة المستشفى فوراً.`
                        : `Close Open Loop ${isOpenLoop1 ? '#1 (resolve missing NULL endocrine lab)' : '#2 (+90d spermatogenesis cycle)'} in 1 tap to unlock Hospital Transfer!`)
                    : (isAr
                        ? 'تم إغلاق كافة الحلقات التشخيصية بنجاح! انتقل للخطوة 4 أو انقر فوق [🚑 إحالة المريض للمستشفى].'
                        : 'All diagnostic loops resolved! Proceed to Step 4 or click [🚑 Dispatch Hospital Transfer].')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGuidedNext}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>{getGuidedCtaLabel()}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTransferOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-600/60 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'الإحالة' : 'Referral'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-5">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  STEP 3: CLOSE OPEN LOOPS STATION
                </span>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <Sparkles className="w-5 h-5 text-indigo-700" />
                  {isAr
                    ? 'محطة إغلاق الحلقات المفتوحة (الفحوصات ومتابعة +90 يوم)'
                    : 'Open Loop Closure Checklist & Active Convergence'}
                </h2>
                <p className="text-xs text-slate-700 mt-1">
                  {isAr
                    ? 'إغلاق كافة الفجوات التشخيصية قبل الاعتماد: حسم الفحوصات المفقودة وتأكيد مسار المتابعة الطولية'
                    : 'Resolve unresolved NULL discriminator tests & verify periodic +90d follow-up trajectory before care plan handoff.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-slate-600">{isAr ? 'الإنتروبيا الحالية:' : 'Entropy:'}</span>{' '}
                  <span className="font-bold text-slate-900">{evaluation.jointEntropyBits} bits</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-emerald-700">{isAr ? 'اليقين:' : 'Certainty:'}</span>{' '}
                  <span className="font-bold text-emerald-900">{evaluation.diagnosticCertaintyPct}%</span>
                </div>
              </div>
            </div>

            {/* 2-Card Open Loop Closure Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Card A — Open Loop #1: Resolve Top Missing (NULL) Discriminator Lab */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                        #1
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {isAr ? 'الحلقة 1: الفحص المخبري الفاصل المفقود (NULL)' : 'Open Loop #1: Top Missing (NULL) Lab'}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        !isOpenLoop1
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {!isOpenLoop1
                        ? (isAr ? 'مغلقة ✓ (محسوم)' : 'LOCKED / CLOSED ✓')
                        : (isAr ? 'مفتوحة (مطلوب حسم)' : 'OPEN · ACTION REQUIRED')}
                    </span>
                  </div>

                  {/* Test Details or Convergence Status */}
                  {topNullTest ? (
                    <div className="space-y-3">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            {isAr ? topNullTest.nameAr : topNullTest.nameEn}
                          </span>
                          <span className="px-2 py-0.5 font-mono text-xs font-bold bg-indigo-700 text-white rounded shadow-xs">
                            +{topNullTest.expectedInformationGainBits} bits IG
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 mt-1">
                          LOINC: {topNullTest.loincCode} · Biomarker: {topNullTest.targetBiomarkerKey}
                        </div>

                        {/* Information Gain Visual Bar with Shimmer */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-indigo-900 font-semibold">
                            <span>{isAr ? 'كسب معلومات شانون المتوقع:' : 'Shannon Information Gain Capacity:'}</span>
                            <span>{Math.round((topNullTest.expectedInformationGainBits / 2.62) * 100)}% of joint entropy</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full info-gain-bar"
                              style={{ width: `${Math.min(100, Math.round(topNullTest.expectedInformationGainBits * 45))}%` }}
                              title={`Expected Information Gain: +${topNullTest.expectedInformationGainBits} bits`}
                            />
                          </div>
                        </div>

                        {/* Visual Shadow-Simulation Preview comparing Abnormal vs Normal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-indigo-200/70 text-[11px]">
                          <div className="bg-white p-2 rounded-md border border-rose-200">
                            <span className="font-bold text-rose-800 block">
                              {isAr ? 'إذا جاءت النتيجة شاذة:' : 'If Simulated Abnormal:'}
                            </span>
                            <span className="font-mono text-xs font-bold text-rose-900">
                              {topNullTest.targetBiomarkerKey} = {topNullTest.simulatedIfAbnormal.valuePreview}
                            </span>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {isAr
                                ? 'يؤكد قصور الخصية الأولي ويرفع احتمالية الدوالي/التثبيط إلى >90%'
                                : 'Pins primary gonadal deficit; shifts posterior log-odds toward >90%'}
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-md border border-emerald-200">
                            <span className="font-bold text-emerald-800 block">
                              {isAr ? 'إذا جاءت النتيجة طبيعية:' : 'If Simulated Normal:'}
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-900">
                              {topNullTest.targetBiomarkerKey} = {topNullTest.simulatedIfNormal.valuePreview}
                            </span>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {isAr
                                ? 'ينفي قصور المحور الهرموني ويوجه الحالة نحو استشاري الذكورة للمتابعة'
                                : 'Excludes primary failure; shifts case to andrology follow-up branch'}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 mt-2.5">
                          {isAr
                            ? `يفصل بين الفرضيات: ${topNullTest.separatesHypotheses.join(', ')}`
                            : `Discriminates: ${topNullTest.separatesHypotheses.map(h => h.replace('DDX_', '')).join(', ')}`}
                        </p>
                      </div>

                      {/* 1-Click Path A vs Path B Resolvers */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {/* Path A: Predicted Outcome */}
                        <button
                          type="button"
                          data-testid={`btn-simulate-abnormal-${topNullTest.testId}`}
                          onClick={() =>
                            handleResolveBiomarker(
                              topNullTest.targetBiomarkerKey,
                              topNullTest.simulatedIfAbnormal.valuePreview
                            )
                          }
                          className="flex-1 px-4 py-3 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ring-1 ring-emerald-500"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span>
                            {isAr
                              ? `✓ المسار أ (المتوقع): حقن فحص ${topNullTest.targetBiomarkerKey} مرتفع (${topNullTest.simulatedIfAbnormal.valuePreview} IU/L) -> تأكيد القصور الخصوي 94.2%`
                              : `✓ Inject Predicted Lab (High FSH = ${topNullTest.simulatedIfAbnormal.valuePreview} IU/L -> Confirms Primary Testicular Failure 94.2%)`}
                          </span>
                        </button>

                        {/* Path B: Unexpected Outcome AI Prompt Injection */}
                        <button
                          type="button"
                          data-testid={`btn-simulate-normal-${topNullTest.testId}`}
                          onClick={() => handleTriggerDeviationLoop1(topNullTest)}
                          className="flex-1 px-4 py-3 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ring-1 ring-amber-400"
                        >
                          <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                          <span>
                            {isAr
                              ? `⚡ المسار ب (المفاجئ): ماذا لو كان ${topNullTest.targetBiomarkerKey} طبيعياً (${topNullTest.simulatedIfNormal.valuePreview} IU/L)؟ -> تحول للمساعد الذكي`
                              : `⚡ Outcome Differs: What if FSH is NORMAL (${topNullTest.simulatedIfNormal.valuePreview} IU/L)? -> Pivot via AI Co-Pilot`}
                          </span>
                        </button>
                      </div>

                      {/* Custom numeric input */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-600 font-semibold">{isAr ? 'أو إدخال يدوي:' : 'Or custom:'}</span>
                        <input
                          type="number"
                          step="any"
                          placeholder={isAr ? 'قيمة مخصصة' : 'Custom val'}
                          value={activeCustomBiomarker === topNullTest.targetBiomarkerKey ? customInputValue : ''}
                          onChange={(e) => {
                            setActiveCustomBiomarker(topNullTest.targetBiomarkerKey);
                            setCustomInputValue(e.target.value);
                          }}
                          className="w-24 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(customInputValue);
                            if (!isNaN(val)) {
                              handleResolveBiomarker(topNullTest.targetBiomarkerKey, val);
                            }
                          }}
                          disabled={
                            activeCustomBiomarker !== topNullTest.targetBiomarkerKey ||
                            !customInputValue ||
                            isNaN(parseFloat(customInputValue))
                          }
                          className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                        >
                          {isAr ? 'حقن' : 'Inject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-950 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{isAr ? 'تم حسم كافة الفحوصات الفاصلة بنجاح' : 'All Discriminator Labs Resolved'}</span>
                      </div>
                      <p className="text-slate-600">
                        {isAr
                          ? 'المخطط البياني وصل إلى نقطة التقارب (Convergence) ولم يتبق أي غموض شانون متعلق بالقيم المفقودة.'
                          : 'The Bayesian DAG has converged with no remaining high-entropy NULL lab leaves.'}
                      </p>
                    </div>
                  )}

                  {/* Convergence Banner when resolved */}
                  {convergenceBanner && (
                    <div className="bg-emerald-950 text-white border-2 border-emerald-500 rounded-xl p-3 mt-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                            {isAr ? 'حدث تقارب بايزي' : 'Convergence Achieved'}
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {convergenceBanner.biomarkerKey} = {convergenceBanner.measuredValue}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="font-mono text-xs font-bold text-emerald-300">
                            ΔH = {convergenceBanner.deltaBits} bits
                          </span>
                          <span className="block text-[10px] text-emerald-200">
                            {convergenceBanner.certaintyBefore}% → {convergenceBanner.certaintyAfter}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card B — Open Loop #2: Scheduled +90-Day Spermatogenic Cycle Follow-Up */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Time Horizon Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2 bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-200">
                    <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-700" />
                      🗓️ +90 DAYS LATER
                    </span>
                    <span className="text-[10px] text-indigo-800 font-mono font-semibold">
                      {isAr ? 'دورة تكوين النطاف (74-90 يوماً)' : 'Spermatogenic Cycle (74–90d)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        #2
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {isAr ? 'الحلقة 2: التحقق من مسار المتابعة (+90 يوم)' : 'Open Loop #2: +90d Periodic Follow-Up'}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isFollowupAppended
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isFollowupAppended
                        ? (isAr ? 'مغلقة ✓ (+90 يوم موثق)' : 'CLOSED ✓ (+90d Verified)')
                        : (isAr ? 'مفتوحة (مطلوب توثيق الزيارة)' : 'OPEN · +90D PENDING')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between mb-1.5 font-mono">
                        <span className="text-slate-600">{isAr ? 'إجمالي الزيارات المسجلة:' : 'Total Encounters:'}</span>
                        <span data-testid="counter-total-encounters" className="font-bold text-slate-900">
                          {activeRecord.encounters.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1.5 font-mono">
                        <span className="text-slate-600">{isAr ? 'العدد الفعال (TMSC):' : 'Live TMSC:'}</span>
                        <span className="font-bold text-slate-900">{liveTmsc !== null ? `${liveTmsc} M` : 'NULL'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1.5 font-mono">
                        <span className="text-slate-600">{isAr ? 'سرعة التغير الطولي (Velocity):' : 'Longitudinal Velocity:'}</span>
                        <span className="font-bold text-slate-900">{velocityDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200 text-[11px]">
                        <span className="text-slate-500">{isAr ? 'رمز المدخلات (FNV-1a):' : 'Input Hash:'}</span>
                        <span data-testid="input-vector-hash" className="text-emerald-700 font-bold">
                          #{signatures.inputHash}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-500">{isAr ? 'بصمة الاحتمالات:' : 'Posterior Hash:'}</span>
                        <span data-testid="posterior-hash" className="text-indigo-700 font-bold">
                          #{signatures.outputHash}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Path A vs Path B for Loop #2 */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {/* Path A: Predicted Outcome */}
                      <button
                        type="button"
                        data-testid="btn-append-followup"
                        onClick={() => {
                          triggerMutate('APPEND_FOLLOWUP_90D');
                          setFollowupAppendedPatients((prev) => ({
                            ...prev,
                            [activeRecord.patientId]: true,
                          }));
                          handleLogClinicalFact(
                            'Verified +90-day spermatogenic follow-up encounter logged into longitudinal chart.',
                            'intake',
                            'YES',
                            'A'
                          );
                        }}
                        className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          isFollowupAppended
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span>
                          {isFollowupAppended
                            ? (isAr ? '+ تسجيل زيارة متابعة إضافية (+90 يوم)' : '+ Append Additional +90d Follow-Up')
                            : (isAr ? '✓ المسار أ (المتوقع): تأكيد زيارة المتابعة (+90 يوم)' : '✓ Verify +90d Return Visit')}
                        </span>
                      </button>

                      {/* Path B: Unexpected Outcome AI Prompt Injection */}
                      <button
                        type="button"
                        onClick={() => {
                          handleCopilotTriggerDeviation();
                        }}
                        className="flex-1 py-2.5 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ring-1 ring-amber-400"
                      >
                        <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                        <span>
                          {isAr
                            ? '⚡ المسار ب (المفاجئ): عدم استجابة بعد 90 يوماً -> استشارة المساعد'
                            : '⚡ Outcome Differs: +90d Non-Responder -> Ask AI Co-Pilot'}
                        </span>
                      </button>
                    </div>

                    {onBridgeToCarePlan && (
                      <button
                        type="button"
                        data-testid="btn-bridge-care-plan"
                        onClick={() => onBridgeToCarePlan(activeRecord, evaluation)}
                        className="w-full py-2 px-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          {isAr
                            ? 'ربط المريض بمحاكي 90 يوماً وخطة رعاية أبوظبي ←'
                            : 'Bridge Patient to 90-Day Simulator & Care Plan →'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible drawer for sliders (maintains 16 range sliders & 19 switches in DOM for a11y) */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    data-testid="btn-toggle-sandbox"
                    onClick={() => setSandboxOpen(!sandboxOpen)}
                    className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                    aria-label={sandboxOpen ? (isAr ? 'إخفاء المعايرة الفردية' : 'Collapse Individual Biomarker Sliders') : (isAr ? 'فتح المعايرة الفردية' : 'Expand Individual Biomarker Sliders')}
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-slate-700" />
                      <span>{isAr ? 'معايرة المؤشرات الحيوية الفردية (اختياري)' : 'Optional: Customize Individual Biomarker Sliders'}</span>
                    </span>
                    {sandboxOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  <div className={sandboxOpen ? 'mt-3 block' : 'hidden'} aria-hidden={!sandboxOpen}>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      {/* 4 Clinical Silos Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* SILO 1: Semen Analysis */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                              <div className="flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-emerald-800" />
                                <h4 className="text-[11px] font-bold text-slate-900 uppercase">
                                  {isAr ? 'مسار السائل المنوي' : 'Semen Analysis Silo'}
                                </h4>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={semenPresent}
                                aria-label="Toggle Semen Lab Present vs NULL"
                                onClick={() => {
                                  const next = !semenPresent;
                                  setSemenPresent(next);
                                  if (autoApplyLive) {
                                    triggerMutate('UPDATE_LATEST', {
                                      semenLab: next
                                        ? { volumeMl, concentrationMMl, totalMotilityPct, normalMorphologyPct }
                                        : null,
                                    });
                                  }
                                }}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                  semenPresent
                                    ? 'bg-emerald-800 text-white border-emerald-900'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {semenPresent ? (isAr ? '✓ متوفر' : '✓ Present') : (isAr ? '⚠ NULL' : '⚠ NULL')}
                              </button>
                            </div>

                            <div className={`space-y-2.5 ${!semenPresent ? 'opacity-40 pointer-events-none' : ''}`}>
                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Volume:</span>
                                  <span className="font-mono font-bold text-slate-900">{volumeMl} mL</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="6.0"
                                  step="0.1"
                                  value={volumeMl}
                                  disabled={!semenPresent}
                                  aria-label="Semen Volume (mL)"
                                  aria-valuemin={0.5}
                                  aria-valuemax={6.0}
                                  aria-valuenow={volumeMl}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setVolumeMl(val);
                                    if (autoApplyLive && semenPresent) {
                                      triggerMutate('UPDATE_LATEST', {
                                        semenLab: { volumeMl: val, concentrationMMl, totalMotilityPct, normalMorphologyPct },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Concentration:</span>
                                  <span className="font-mono font-bold text-slate-900">{concentrationMMl} M/mL</span>
                                </div>
                                <input
                                  type="range"
                                  data-testid="slider-sandbox-concentration"
                                  min="1"
                                  max="120"
                                  step="1"
                                  value={concentrationMMl}
                                  disabled={!semenPresent}
                                  aria-label="Semen Concentration (M/mL)"
                                  aria-valuemin={1}
                                  aria-valuemax={120}
                                  aria-valuenow={concentrationMMl}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setConcentrationMMl(val);
                                    if (autoApplyLive && semenPresent) {
                                      triggerMutate('UPDATE_LATEST', {
                                        semenLab: { volumeMl, concentrationMMl: val, totalMotilityPct, normalMorphologyPct },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Total Motility:</span>
                                  <span className="font-mono font-bold text-slate-900">{totalMotilityPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="85"
                                  step="1"
                                  value={totalMotilityPct}
                                  disabled={!semenPresent}
                                  aria-label="Total Motility Percentage"
                                  aria-valuemin={5}
                                  aria-valuemax={85}
                                  aria-valuenow={totalMotilityPct}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setTotalMotilityPct(val);
                                    if (autoApplyLive && semenPresent) {
                                      triggerMutate('UPDATE_LATEST', {
                                        semenLab: { volumeMl, concentrationMMl, totalMotilityPct: val, normalMorphologyPct },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Normal Morphology:</span>
                                  <span className="font-mono font-bold text-slate-900">{normalMorphologyPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="15"
                                  step="0.5"
                                  value={normalMorphologyPct}
                                  disabled={!semenPresent}
                                  aria-label="Normal Morphology Percentage"
                                  aria-valuemin={1}
                                  aria-valuemax={15}
                                  aria-valuenow={normalMorphologyPct}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setNormalMorphologyPct(val);
                                    if (autoApplyLive && semenPresent) {
                                      triggerMutate('UPDATE_LATEST', {
                                        semenLab: { volumeMl, concentrationMMl, totalMotilityPct, normalMorphologyPct: val },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SILO 2: Endocrine Panel */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                              <div className="flex items-center gap-1">
                                <Dna className="w-3.5 h-3.5 text-indigo-700" />
                                <h4 className="text-[11px] font-bold text-slate-900 uppercase">
                                  {isAr ? 'مسار الهرمونات' : 'Endocrine Silo'}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                AUA
                              </span>
                            </div>

                            <div className="space-y-2">
                              {/* FSH */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-slate-700 w-24">FSH (IU/L):</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    placeholder="NULL"
                                    value={fshIuL !== null ? fshIuL : ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                      updateEndocrineField('fshIuL', val);
                                    }}
                                    className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateEndocrineField('fshIuL', null)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                                      fshIuL === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    NULL
                                  </button>
                                </div>
                              </div>

                              {/* LH */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-slate-700 w-24">LH (IU/L):</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    placeholder="NULL"
                                    value={lhIuL !== null ? lhIuL : ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                      updateEndocrineField('lhIuL', val);
                                    }}
                                    className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateEndocrineField('lhIuL', null)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                                      lhIuL === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    NULL
                                  </button>
                                </div>
                              </div>

                              {/* Total Testosterone */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-slate-700 w-24">Total T (ng/dL):</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="number"
                                    step="10"
                                    placeholder="NULL"
                                    value={totalTestosteroneNgDl !== null ? totalTestosteroneNgDl : ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                      updateEndocrineField('totalTestosteroneNgDl', val);
                                    }}
                                    className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateEndocrineField('totalTestosteroneNgDl', null)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                                      totalTestosteroneNgDl === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    NULL
                                  </button>
                                </div>
                              </div>

                              {/* Estradiol */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-slate-700 w-24">E2 (pg/mL):</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="number"
                                    step="1"
                                    placeholder="NULL"
                                    value={estradiolPgMl !== null ? estradiolPgMl : ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                      updateEndocrineField('estradiolPgMl', val);
                                    }}
                                    className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateEndocrineField('estradiolPgMl', null)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                                      estradiolPgMl === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    NULL
                                  </button>
                                </div>
                              </div>

                              {/* Prolactin */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-slate-700 w-24">Prolactin:</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="number"
                                    step="1"
                                    placeholder="NULL"
                                    value={prolactinNgMl !== null ? prolactinNgMl : ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                      updateEndocrineField('prolactinNgMl', val);
                                    }}
                                    className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold border border-slate-300 rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateEndocrineField('prolactinNgMl', null)}
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                                      prolactinNgMl === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    NULL
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SILO 3: Cardiometabolic & Sahatna */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                              <div className="flex items-center gap-1">
                                <HeartPulse className="w-3.5 h-3.5 text-rose-700" />
                                <h4 className="text-[11px] font-bold text-slate-900 uppercase">
                                  {isAr ? 'المسار القلبي الأيضي' : 'Cardiometabolic Silo'}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                IFHAS
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">BMI:</span>
                                  <span className="font-mono font-bold text-slate-900">{bmi}</span>
                                </div>
                                <input
                                  type="range"
                                  data-testid="slider-sandbox-bmi"
                                  min="18"
                                  max="42"
                                  step="0.1"
                                  value={bmi}
                                  aria-label="Body Mass Index (kg/m2)"
                                  aria-valuemin={18}
                                  aria-valuemax={42}
                                  aria-valuenow={bmi}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setBmi(val);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', {
                                        vitals: { bmi: val, hba1cPct, restingHrBpm, sleepHoursAvg },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">HbA1c:</span>
                                  <span className="font-mono font-bold text-slate-900">{hba1cPct}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="4.5"
                                  max="9.5"
                                  step="0.1"
                                  value={hba1cPct}
                                  aria-label="Glycated Hemoglobin HbA1c Percentage"
                                  aria-valuemin={4.5}
                                  aria-valuemax={9.5}
                                  aria-valuenow={hba1cPct}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setHba1cPct(val);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', {
                                        vitals: { bmi, hba1cPct: val, restingHrBpm, sleepHoursAvg },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Resting HR:</span>
                                  <span className="font-mono font-bold text-slate-900">{restingHrBpm} bpm</span>
                                </div>
                                <input
                                  type="range"
                                  min="50"
                                  max="110"
                                  step="1"
                                  value={restingHrBpm}
                                  aria-label="Resting Heart Rate (bpm)"
                                  aria-valuemin={50}
                                  aria-valuemax={110}
                                  aria-valuenow={restingHrBpm}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setRestingHrBpm(val);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', {
                                        vitals: { bmi, hba1cPct, restingHrBpm: val, sleepHoursAvg },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="font-semibold text-slate-700">Sleep:</span>
                                  <span className="font-mono font-bold text-slate-900">{sleepHoursAvg} hrs</span>
                                </div>
                                <input
                                  type="range"
                                  min="3.5"
                                  max="9.0"
                                  step="0.5"
                                  value={sleepHoursAvg}
                                  aria-label="Average Sleep Hours"
                                  aria-valuemin={3.5}
                                  aria-valuemax={9.0}
                                  aria-valuenow={sleepHoursAvg}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setSleepHoursAvg(val);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', {
                                        vitals: { bmi, hba1cPct, restingHrBpm, sleepHoursAvg: val },
                                      });
                                    }
                                  }}
                                  className="w-full accent-emerald-800"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SILO 4: Exposures & History */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <h4 className="text-[11px] font-bold text-slate-900 uppercase">
                                  {isAr ? 'الأدوية والمخاطر' : 'Exposures & History Silo'}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                Risk Flags
                              </span>
                            </div>

                            <div className="space-y-2">
                              {/* 5-ARI */}
                              <div className="flex items-center justify-between gap-1 p-1.5 rounded bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-800">5-ARI Finasteride:</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={is5Ari}
                                  aria-label="Toggle 5-ARI Finasteride exposure"
                                  onClick={() => {
                                    const next = !is5Ari;
                                    setIs5Ari(next);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', { toggle5Ari: next });
                                    }
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    is5Ari ? 'bg-rose-800 text-white border-rose-900' : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {is5Ari ? 'Active' : 'Off'}
                                </button>
                              </div>

                              {/* TRT */}
                              <div className="flex items-center justify-between gap-1 p-1.5 rounded bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-800">Exogenous TRT:</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isTrt}
                                  aria-label="Toggle Exogenous TRT and Androgen exposure"
                                  onClick={() => {
                                    const next = !isTrt;
                                    setIsTrt(next);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', { toggleTrt: next });
                                    }
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    isTrt ? 'bg-rose-800 text-white border-rose-900' : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {isTrt ? 'Active' : 'Off'}
                                </button>
                              </div>

                              {/* Cryptorchidism */}
                              <div className="flex items-center justify-between gap-1 p-1.5 rounded bg-slate-50 border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-800">Cryptorchidism:</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={cryptorchidism}
                                  aria-label="Toggle Cryptorchidism history"
                                  onClick={() => {
                                    const next = !cryptorchidism;
                                    setCryptorchidism(next);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', { cryptorchidismHistory: next });
                                    }
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    cryptorchidism ? 'bg-amber-700 text-white border-amber-800' : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {cryptorchidism ? 'Yes' : 'No'}
                                </button>
                              </div>

                              {/* Acute Pain */}
                              <div className="flex items-center justify-between gap-1 p-1.5 rounded bg-rose-50 border border-rose-200">
                                <span className="text-[11px] font-bold text-rose-950">Acute Pain STAT:</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={acutePain}
                                  aria-label="Toggle Acute Scrotal Pain life-safety flag"
                                  onClick={() => {
                                    const next = !acutePain;
                                    setAcutePain(next);
                                    if (autoApplyLive) {
                                      triggerMutate('UPDATE_LATEST', { acuteScrotalPain: next });
                                    }
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    acutePain ? 'bg-rose-700 text-white border-rose-800' : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {acutePain ? 'STAT' : 'None'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manual Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={autoApplyLive}
                          aria-label="Toggle live auto update of current encounter"
                          onClick={() => setAutoApplyLive(!autoApplyLive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            autoApplyLive ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Auto-Apply: {autoApplyLive ? 'ON' : 'OFF'}
                        </button>

                        <button
                          type="button"
                          data-testid="btn-live-edit-encounter"
                          onClick={() => triggerMutate('UPDATE_LATEST')}
                          className="px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          ⚡ {isAr ? 'تطبيق التعديلات الحية' : 'Live Commit (tk)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recorded Findings for Step A */}
          {loggedFacts.filter((f) => f.stepKey === 'A').length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? 'الملاحظات السريرية الموثقة في مرحلة التقييم (A)' : 'Recorded Assessment Findings & Logged Facts (Step A)'}</span>
              </div>
              <div className="space-y-1.5">
                {loggedFacts
                  .filter((f) => f.stepKey === 'A')
                  .map((fact) => (
                    <div key={fact.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-800">{fact.fact}</span>
                      <span className="text-[10px] font-mono text-slate-500 ms-2 shrink-0">{fact.timestamp}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SOP Gate Check Action Bar for A: ASSESSMENT */}
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {isAr ? 'بوابة التحقق السريري: التقييم التفريقي وحسم الحلقات المفتوحة' : 'SOP Gate Check: A · Assessment & Differential'}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {isAr
                  ? 'إغلاق الفجوات المخبرية المفقودة وتأكيد زيارة المتابعة الدورية لاعتماد خطة الرعاية'
                  : 'Close NULL discriminator loops and confirm periodic follow-up to lock Bayesian posterior.'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleGuidedNext();
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  {openLoopsCount === 0
                    ? (isAr ? 'الانتقال إلى خطة الرعاية المتكاملة (الخطوة 4) ←' : 'Advance to Converged Care Plan (Step 4) →')
                    : isOpenLoop1
                    ? (isAr ? '⚡ إغلاق الحلقة 1: حسم الفحص المخبري المفقود ←' : '⚡ 1-Click Resolve Top Lab (Loop #1) →')
                    : (isAr ? '⚡ إغلاق الحلقة 2: تسجيل زيارة المتابعة (+90 يوم) ←' : '⚡ 1-Click Log +90d Follow-Up (Loop #2) →')}
                </span>
              </button>
              <button
                type="button"
                onClick={handleCopilotTriggerDeviation}
                className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-400"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>{isAr ? '⚡ نتيجة مفاجئة / استشارة المساعد' : '⚡ Outcome Differs / Stuck -> Ask AI Co-Pilot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 4: Converged Care Plan & FHIR Handoff Summary
         ===================================================================== */}
      {(activeWorkbenchStep === 4 || expertView) && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* 👉 DO THIS NEXT: Step 4 Spotlight Banner */}
          <div className="bg-purple-950/90 border-2 border-purple-500/70 rounded-2xl p-4 shadow-md text-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-800/80 border border-purple-400 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                4
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>👉 {isAr ? 'الإجراء التالي المطلوب:' : 'DO THIS NEXT:'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-900 border border-purple-600 font-mono text-purple-200">
                    P: Care Plan & Outbound Dispatch
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {isAr
                    ? 'د. مريم تقود القرار السريري: اعتمد خطة الرعاية المتقاربة، ثم انقر على [🚑 إحالة المريض للمستشفى] لختم إيصال ملفي الإلكتروني.'
                    : 'Dr. Mariam Stays in Charge: Review converged care plan, then click [🚑 Dispatch Hospital Transfer] to stamp the electronic referral receipt.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? '🚑 إحالة المريض للمستشفى' : '🚑 Dispatch Hospital Transfer'}</span>
            </button>
          </div>

          <div className="bg-slate-900 text-white border-2 border-emerald-600 rounded-2xl p-6 shadow-md flex flex-col items-center text-center gap-4 animate-fade-in">
            <span className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                {isAr ? 'الخطوة 4: خطة الرعاية المتكاملة • د. مريم تبقى المسؤولة عن كل قرار سريري' : 'Step 4: Converged Care Plan • Dr. Mariam Stays in Charge of Every Clinical Decision'}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isAr ? 'د. مريم تبقى المسؤولة عن كل قرار سريري (حوكمة خماسية البوابات وفق معيار DECIDE-AI)' : 'Dr. Mariam Stays in Charge of Every Clinical Decision (5-Gate DECIDE-AI Governance)'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1 leading-relaxed">
                {isAr
                  ? 'تم حسم الفحوصات وتوثيق المسار الزمني الطولي بنجاح. الطبيبة المعالجة د. مريم تعتمد خطة الرعاية ومحاكي 90 يوماً ورمز الاستجابة السريعة لشبكة ملفي بنقرة واحدة.'
                  : 'All diagnostic discriminator tests resolved and longitudinal trajectory verified. Dr. Mariam stays in complete clinical charge across 5-Gate DECIDE-AI governance, approving the 90-Day Spermatogenesis Simulator and Malaffi FHIR R4 QR code.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs my-1">
              <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Final Entropy:</span>{' '}
                <span className="text-cyan-300 font-bold">{evaluation.jointEntropyBits} bits</span>
              </div>
              <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Diagnostic Certainty:</span>{' '}
                <span className="text-emerald-400 font-bold">{evaluation.diagnosticCertaintyPct}%</span>
              </div>
              <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Open Loops:</span>{' '}
                <span className="text-emerald-400 font-bold">0 (ALL CLOSED ✓)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {onBridgeToCarePlan && (
                <button
                  type="button"
                  data-testid="btn-bridge-care-plan"
                  onClick={() => onBridgeToCarePlan(activeRecord, evaluation)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                >
                  <span>
                    {isAr
                      ? 'عرض خطة الرعاية ومحاكي 90 يوماً ورمز الاستجابة السريعة ←'
                      : 'Open Full Abu Dhabi Care Plan & 90-Day Simulator →'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsTransferOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              >
                <Building2 className="w-4 h-4" />
                <span>
                  {isAr
                    ? '🚑 إحالة ونقل سريري للمستشفيات المعتمدة (SSMC / CCAD) ←'
                    : '🚑 Outbound Hospital Transfer & Referral Dispatch →'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
        </div>

        {/* RIGHT COLUMN (38% Width, Sticky): AI SOP CO-PILOT & EXCEPTION ASSISTANT */}
        <div className="w-full lg:w-[38%] sticky top-4">
          <SopCopilotSidebar
            language={language}
            patientId={activeRecord.patientId}
            patientToken={activeRecord.pseudonymToken}
            activeSoapStep={activeSoapStepKey}
            activeSop={activeSop}
            isStepReadyToAdvance={openLoopsCount === 0 || activeWorkbenchStep < 3}
            onApplyExpectedStep={handleCopilotApplyExpected}
            onTriggerOutcomeDiffers={handleCopilotTriggerDeviation}
            onTriggerStuck={handleCopilotTriggerStuck}
            onLogClinicalFact={handleLogClinicalFact}
            loggedFacts={loggedFacts}
          />
        </div>
      </div>

      {/* Floating Clinical Narrator Toast for Guided Walkthrough */}
      {autoPlayNarrative && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white border-2 border-emerald-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast-in max-w-xl w-[92vw] sm:w-full mx-4">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-xs font-semibold text-emerald-100 flex-1 leading-snug">{autoPlayNarrative}</span>
          <button
            type="button"
            onClick={() => {
              setIsAutoPlay(false);
              setAutoPlayNarrative(null);
            }}
            className="text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded cursor-pointer shrink-0 border border-slate-700"
          >
            {isAr ? 'إيقاف' : 'Pause'}
          </button>
        </div>
      )}

      {/* Onboard New Patient Modal */}
      <NewPatientOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPatientOnboarded={handlePatientOnboarded}
        language={language}
      />

      {/* Outbound Hospital Transfer & Referral Dispatch Modal */}
      <TransferDispatchModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        record={activeRecord}
        evaluation={evaluation}
        language={language}
        onJumpToStep={(step) => {
          setActiveWorkbenchStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
