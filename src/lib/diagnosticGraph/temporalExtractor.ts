/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * Temporal Feature Extractor: Computes longitudinal velocities, multi-silo composite signals,
 * and detects the 5 Technician Blind-Spot Syndromes across sequential Malaffi encounters.
 */

import {
  LongitudinalPatientRecord,
  LongitudinalEncounter,
  DerivedSignalNode,
  BlindSpotSyndromeNode,
} from '../../types/diagnosticGraph';
import { BLIND_SPOT_SYNDROME_TEMPLATES } from './knowledgeBase';

/**
 * Extracts derived signal nodes and evaluates the 5 technician blind-spot syndromes.
 */
export function extractTemporalSignalsAndSyndromes(record: LongitudinalPatientRecord): {
  signals: DerivedSignalNode[];
  blindSpotSyndromes: BlindSpotSyndromeNode[];
} {
  const encounters = record.encounters ?? [];
  const latest: LongitudinalEncounter | undefined = encounters[encounters.length - 1];

  if (!latest) {
    return { signals: [], blindSpotSyndromes: [] };
  }

  // 1. Spermatogenic Calculations
  const semen = latest.semenLab;
  const tmsc_million =
    semen !== null
      ? Number((semen.volumeMl * semen.concentrationMMl * (semen.totalMotilityPct / 100)).toFixed(2))
      : null;

  // Longitudinal TMSC Velocity (% change per month between first & latest semen encounters)
  let tmsc_velocity_pct_mo: number | null = null;
  const semenEncounters = encounters.filter((e) => e.semenLab !== null);

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
    const daysDiff = Math.max(1, (lastTime - firstTime) / (1000 * 60 * 60 * 24));
    const monthsDiff = Math.max(0.5, daysDiff / 30.4375);

    if (firstTmsc > 0) {
      const totalPctChange = ((lastTmsc - firstTmsc) / firstTmsc) * 100;
      tmsc_velocity_pct_mo = Number((totalPctChange / monthsDiff).toFixed(2));
    } else {
      tmsc_velocity_pct_mo = 0.0;
    }
  }

  // 2. Endocrine Calculations
  const endo = latest.endocrinePanel;
  const fshVal = endo ? endo.fshIuL : null;
  const lhVal = endo ? endo.lhIuL : null;
  const testVal = endo ? endo.totalTestosteroneNgDl : null;
  const e2Val = endo ? endo.estradiolPgMl : null;
  const prolactinVal = endo ? endo.prolactinNgMl : null;

  const t_e2_ratio =
    testVal !== null && e2Val !== null && e2Val > 0
      ? Number((testVal / e2Val).toFixed(2))
      : null;

  // 3. 74-Day Spermatogenic Medication Lag Evaluation
  const latestTime = new Date(latest.dateIso).getTime();
  let delayed5ariActive = false;
  let delayedTrtActive = false;
  let ssriActive = false;

  const allMeds = encounters.flatMap((e) => e.medications ?? []);
  for (const med of allMeds) {
    const medStartTime = new Date(med.startDateIso).getTime();
    const daysSinceStart = Math.floor((latestTime - medStartTime) / (1000 * 60 * 60 * 24));

    if (med.class === '5ARI' && daysSinceStart >= 74) {
      delayed5ariActive = true;
    }
    if (med.class === 'TRT_ANDROGEN' && daysSinceStart >= 74) {
      delayedTrtActive = true;
    }
    if (med.class === 'SSRI') {
      ssriActive = true;
    }
  }

  const delayedMedExposure = delayed5ariActive || delayedTrtActive;

  // 4. Construct Comprehensive DerivedSignalNode List
  const signals: DerivedSignalNode[] = [];

  // TMSC Signal
  signals.push({
    id: 'SIG_TMSC',
    domain: 'SPERMATOGENIC',
    labelEn: 'Total Motile Sperm Count (TMSC)',
    labelAr: 'إجمالي عدد النطاف المتحركة في القذفة',
    value: tmsc_million,
    unit: 'Million',
    status:
      tmsc_million === null
        ? 'NULL'
        : tmsc_million < 20.0
        ? 'ABNORMAL'
        : tmsc_million < 40.0
        ? 'BORDERLINE'
        : 'NORMAL',
    referenceRange: '>= 20.0 Million (WHO / AUA Guideline Cutoff)',
    loincCode: '97059-0',
  });

  // TMSC Velocity Signal
  signals.push({
    id: 'SIG_TMSC_VELOCITY_DECAY',
    domain: 'TEMPORAL',
    labelEn: 'Longitudinal TMSC Velocity',
    labelAr: 'السرعة الزمنية لتغير النطاف المتحركة شهرياً',
    value: tmsc_velocity_pct_mo,
    unit: '%/month',
    status:
      tmsc_velocity_pct_mo === null
        ? 'NULL'
        : tmsc_velocity_pct_mo <= -8.0
        ? 'ABNORMAL'
        : tmsc_velocity_pct_mo < 0.0
        ? 'BORDERLINE'
        : 'NORMAL',
    referenceRange: '>= -5.0 %/month (Physiological Stability)',
  });

  // T/E2 Ratio Signal
  signals.push({
    id: 'SIG_T_E2_RATIO',
    domain: 'ENDOCRINE',
    labelEn: 'Total Testosterone to Estradiol Ratio (T/E2)',
    labelAr: 'نسبة التستوستيرون الكلي إلى الإستراديول',
    value: t_e2_ratio,
    unit: 'Ratio',
    status:
      t_e2_ratio === null
        ? 'NULL'
        : t_e2_ratio < 10.0
        ? 'ABNORMAL'
        : t_e2_ratio < 14.0
        ? 'BORDERLINE'
        : 'NORMAL',
    referenceRange: '>= 10.0 (Optimal: 12.0 - 20.0)',
    loincCode: '2986-8/2243-4',
  });

  // FSH / LH State Signal
  const fshLhState =
    fshVal === null && lhVal === null
      ? null
      : (fshVal !== null && fshVal < 1.8) || (fshVal !== null && lhVal !== null && fshVal < 2.0 && lhVal < 2.0)
      ? 'HYPOGONADOTROPIC_SUPPRESSION'
      : (fshVal !== null && fshVal > 7.6)
      ? 'HYPERGONADOTROPIC_FAILURE'
      : 'EUGONADOTROPIC';

  signals.push({
    id: 'SIG_FSH_LH_STATE',
    domain: 'ENDOCRINE',
    labelEn: 'Gonadotropin Axis State (FSH & LH)',
    labelAr: 'حالة المحور النخامي (FSH و LH)',
    value: fshLhState,
    unit: 'State',
    status:
      fshLhState === null
        ? 'NULL'
        : fshLhState === 'HYPOGONADOTROPIC_SUPPRESSION' || fshLhState === 'HYPERGONADOTROPIC_FAILURE'
        ? 'ABNORMAL'
        : 'NORMAL',
    referenceRange: 'FSH: 1.5 - 7.6 IU/L | LH: 1.5 - 9.0 IU/L',
    loincCode: '15067-2 / 10501-5',
  });

  // Primary Hormones
  signals.push({
    id: 'SIG_TOTAL_TESTOSTERONE',
    domain: 'ENDOCRINE',
    labelEn: 'Morning Serum Total Testosterone',
    labelAr: 'هرمون التستوستيرون الكلي الصباحي',
    value: testVal,
    unit: 'ng/dL',
    status:
      testVal === null ? 'NULL' : testVal < 264 ? 'ABNORMAL' : testVal < 350 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: '264 - 916 ng/dL (AUA 2021 Reference)',
    loincCode: '2986-8',
  });

  signals.push({
    id: 'SIG_HIGH_FSH',
    domain: 'ENDOCRINE',
    labelEn: 'Serum Follicle Stimulating Hormone (FSH)',
    labelAr: 'هرمون تحفيز الجريبات النخامي (FSH)',
    value: fshVal,
    unit: 'IU/L',
    status: fshVal === null ? 'NULL' : fshVal > 7.6 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: '1.5 - 7.6 IU/L',
    loincCode: '15067-2',
  });

  signals.push({
    id: 'SIG_NORMAL_FSH',
    domain: 'ENDOCRINE',
    labelEn: 'Preserved Intrinsic FSH Level',
    labelAr: 'سلامة هرمون FSH الداخلي',
    value: fshVal,
    unit: 'IU/L',
    status: fshVal === null ? 'NULL' : fshVal >= 1.5 && fshVal <= 7.6 ? 'NORMAL' : 'ABNORMAL',
    referenceRange: '1.5 - 7.6 IU/L',
  });

  signals.push({
    id: 'SIG_LOW_FSH_CONTRADICTION',
    domain: 'ENDOCRINE',
    labelEn: 'Suppressed FSH (< 2.0 IU/L)',
    labelAr: 'تثبيط هرمون FSH (< 2.0)',
    value: fshVal !== null ? fshVal < 2.0 : null,
    unit: 'boolean',
    status: fshVal === null ? 'NULL' : fshVal < 2.0 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_HIGH_FSH_CONTRADICTION',
    domain: 'ENDOCRINE',
    labelEn: 'Markedly High FSH (> 10.0 IU/L)',
    labelAr: 'ارتفاع هرمون FSH الحاد (> 10.0)',
    value: fshVal !== null ? fshVal > 10.0 : null,
    unit: 'boolean',
    status: fshVal === null ? 'NULL' : fshVal > 10.0 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_PROLACTIN',
    domain: 'ENDOCRINE',
    labelEn: 'Serum Prolactin (Pituitary Sellar Marker)',
    labelAr: 'هرمون البرولاكتين المصلي',
    value: prolactinVal,
    unit: 'ng/mL',
    status: prolactinVal === null ? 'NULL' : prolactinVal > 20.0 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: '4.0 - 20.0 ng/mL',
    loincCode: '2842-3',
  });

  // Semen Primary Signals
  signals.push({
    id: 'SIG_LOW_SEMEN_VOLUME',
    domain: 'SPERMATOGENIC',
    labelEn: 'Ejaculate Semen Volume',
    labelAr: 'حجم السائل المنوي',
    value: semen ? semen.volumeMl : null,
    unit: 'mL',
    status: semen === null ? 'NULL' : semen.volumeMl < 1.4 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: '>= 1.4 mL (WHO 6th Edition)',
    loincCode: '10582-5',
  });

  signals.push({
    id: 'SIG_SEVERE_OLIGOZOOSPERMIA',
    domain: 'SPERMATOGENIC',
    labelEn: 'Severe Oligozoospermia (< 5.0 M/mL)',
    labelAr: 'قلة النطاف الشديدة (< 5.0 مليون/مل)',
    value: semen ? semen.concentrationMMl : null,
    unit: 'M/mL',
    status: semen === null ? 'NULL' : semen.concentrationMMl < 5.0 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: '>= 15.0 M/mL',
    loincCode: '97058-2',
  });

  const hasSubfertilitySuspicion =
    semen !== null &&
    (semen.concentrationMMl < 15.0 || (tmsc_million !== null && tmsc_million < 20.0));

  signals.push({
    id: 'SIG_OLIGOZOOSPERMIA_SUSPICION',
    domain: 'SPERMATOGENIC',
    labelEn: 'Semen Analysis Subfertility / Oligospermia Suspicion',
    labelAr: 'اشتباه نقص الخصوبة أو قلة النطاف في التحليل',
    value: hasSubfertilitySuspicion,
    unit: 'boolean',
    status: semen === null ? 'NULL' : hasSubfertilitySuspicion ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_MOTILITY_IMPAIRMENT',
    domain: 'SPERMATOGENIC',
    labelEn: 'Total Sperm Motility',
    labelAr: 'إجمالي حركة النطاف',
    value: semen ? semen.totalMotilityPct : null,
    unit: '%',
    status: semen === null ? 'NULL' : semen.totalMotilityPct < 42.0 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: '>= 42 % (WHO 6th Edition)',
    loincCode: '13940-2',
  });

  signals.push({
    id: 'SIG_OATS_PATTERN',
    domain: 'SPERMATOGENIC',
    labelEn: 'Oligo-Astheno-Teratozoospermia (OATS) Triad',
    labelAr: 'ثالوث اعتلال النطاف الثلاثي OATS',
    value:
      semen !== null
        ? semen.concentrationMMl < 15.0 &&
          semen.totalMotilityPct < 42.0 &&
          semen.normalMorphologyPct < 4.0
        : null,
    unit: 'boolean',
    status:
      semen === null
        ? 'NULL'
        : semen.concentrationMMl < 15.0 &&
          semen.totalMotilityPct < 42.0 &&
          semen.normalMorphologyPct < 4.0
        ? 'ABNORMAL'
        : 'NORMAL',
    referenceRange: 'False',
  });

  // Cardiometabolic & Wearable Signals
  const vitals = latest.vitals;
  signals.push({
    id: 'SIG_BMI',
    domain: 'CARDIOMETABOLIC',
    labelEn: 'Body Mass Index (BMI)',
    labelAr: 'مؤشر كتلة الجسم',
    value: vitals.bmi,
    unit: 'kg/m²',
    status: vitals.bmi >= 30.0 ? 'ABNORMAL' : vitals.bmi >= 25.0 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: '18.5 - 24.9 kg/m²',
    loincCode: '39156-5',
  });

  signals.push({
    id: 'SIG_HBA1C_DRIFT',
    domain: 'CARDIOMETABOLIC',
    labelEn: 'IFHAS Glycated Hemoglobin (HbA1c)',
    labelAr: 'السكر التراكمي في برنامج إفحص',
    value: vitals.hba1cPct,
    unit: '%',
    status: vitals.hba1cPct >= 6.5 ? 'ABNORMAL' : vitals.hba1cPct >= 5.7 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: '< 5.7 %',
    loincCode: '4548-4',
  });

  signals.push({
    id: 'SIG_SLEEP_DEPRIVATION',
    domain: 'CARDIOMETABOLIC',
    labelEn: 'Sahatna Tracked Sleep Duration',
    labelAr: 'ساعات النوم المسجلة عبر صحتنا',
    value: vitals.sleepHoursAvg,
    unit: 'hours/night',
    status: vitals.sleepHoursAvg < 5.8 ? 'ABNORMAL' : vitals.sleepHoursAvg < 7.0 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: '>= 7.0 hours/night',
  });

  signals.push({
    id: 'SIG_RESTING_HR',
    domain: 'CARDIOMETABOLIC',
    labelEn: 'Sahatna Resting Heart Rate',
    labelAr: 'معدل نبضات القلب وقت الراحة',
    value: vitals.restingHrBpm,
    unit: 'bpm',
    status: vitals.restingHrBpm >= 84 ? 'ABNORMAL' : vitals.restingHrBpm >= 75 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: '60 - 75 bpm',
    loincCode: '8867-4',
  });

  // Clinical & Anatomical Flags
  const flags = latest.clinicalFlags;
  signals.push({
    id: 'SIG_VARICOCELE_CLINICAL',
    domain: 'EXPOSURE',
    labelEn: 'Palpable Clinical Varicocele',
    labelAr: 'دوالي الخصية الملموسة سريرياً',
    value: flags.varicoceleGrade,
    unit: 'Grade 0-3',
    status: flags.varicoceleGrade >= 2 ? 'ABNORMAL' : flags.varicoceleGrade === 1 ? 'BORDERLINE' : 'NORMAL',
    referenceRange: 'Grade 0',
  });

  signals.push({
    id: 'SIG_THERMAL_SEDENTARY',
    domain: 'EXPOSURE',
    labelEn: 'Thermal / Prolonged Sitting Exposure',
    labelAr: 'التعرض الحراري أو الجلوس المطول',
    value: flags.frequentThermalExposure || flags.sittingHoursPerDay >= 8,
    unit: 'boolean',
    status: flags.frequentThermalExposure || flags.sittingHoursPerDay >= 8 ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_CRYPTORCHIDISM',
    domain: 'EXPOSURE',
    labelEn: 'History of Cryptorchidism / Orchitis',
    labelAr: 'تاريخ الخصية الهاجرة أو التهاب الخصية',
    value: flags.cryptorchidismHistory || flags.mumpsOrchitisHistory,
    unit: 'boolean',
    status: flags.cryptorchidismHistory || flags.mumpsOrchitisHistory ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  // Medication Exposure Signals
  signals.push({
    id: 'SIG_DELAYED_5ARI_ACTIVE',
    domain: 'EXPOSURE',
    labelEn: 'Delayed 5-ARI (Finasteride) Exposure (>= 74 days)',
    labelAr: 'استخدام مثبطات 5-ARI الفعالة لأكثر من 74 يوماً',
    value: delayed5ariActive,
    unit: 'boolean',
    status: delayed5ariActive ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_DELAYED_TRT_ACTIVE',
    domain: 'EXPOSURE',
    labelEn: 'Delayed Exogenous TRT Exposure (>= 74 days)',
    labelAr: 'استخدام التستوستيرون الخارجي لأكثر من 74 يوماً',
    value: delayedTrtActive,
    unit: 'boolean',
    status: delayedTrtActive ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_POST_MED_TMSC_DROP',
    domain: 'TEMPORAL',
    labelEn: 'TMSC / Volume Drop Post-Drug Inception',
    labelAr: 'هبوط النطاف المتحركة عقب بدء الدواء',
    value:
      delayedMedExposure &&
      ((tmsc_million !== null && tmsc_million < 20.0) ||
        (tmsc_velocity_pct_mo !== null && tmsc_velocity_pct_mo < -5.0)),
    unit: 'boolean',
    status:
      delayedMedExposure &&
      ((tmsc_million !== null && tmsc_million < 20.0) ||
        (tmsc_velocity_pct_mo !== null && tmsc_velocity_pct_mo < -5.0))
        ? 'ABNORMAL'
        : 'NORMAL',
    referenceRange: 'False',
  });

  signals.push({
    id: 'SIG_SSRI_ACTIVE',
    domain: 'EXPOSURE',
    labelEn: 'Active SSRI Antidepressant Medication',
    labelAr: 'استخدام مضادات الاكتئاب SSRI',
    value: ssriActive,
    unit: 'boolean',
    status: ssriActive ? 'ABNORMAL' : 'NORMAL',
    referenceRange: 'False',
  });

  // 5. Evaluate the 5 Technician Blind-Spot Syndromes
  const blindSpotSyndromes: BlindSpotSyndromeNode[] = [];

  // Syndrome 1: SYN_FALSE_NORMAL_SUBFERTILITY
  const all4WhoPass =
    semen !== null &&
    semen.volumeMl >= 1.4 &&
    semen.concentrationMMl >= 15.0 &&
    semen.totalMotilityPct >= 42.0 &&
    semen.normalMorphologyPct >= 4.0;
  const syn1Triggered = Boolean(all4WhoPass && tmsc_million !== null && tmsc_million < 20.0);
  const t1 = BLIND_SPOT_SYNDROME_TEMPLATES.SYN_FALSE_NORMAL_SUBFERTILITY;
  blindSpotSyndromes.push({
    id: t1.id,
    titleEn: t1.titleEn,
    titleAr: t1.titleAr,
    triggered: syn1Triggered,
    severity: t1.severity,
    parentSignalIds: t1.parentSignalIds,
    whatTechSeesEn: t1.whatTechSeesEn,
    whatTechSeesAr: t1.whatTechSeesAr,
    whatGraphCatchesEn: t1.whatGraphCatchesEn,
    whatGraphCatchesAr: t1.whatGraphCatchesAr,
  });

  // Syndrome 2: SYN_OCCULT_LONGITUDINAL_DECAY
  const syn2Triggered = Boolean(
    semen !== null &&
      semen.concentrationMMl >= 15.0 &&
      tmsc_velocity_pct_mo !== null &&
      tmsc_velocity_pct_mo <= -8.0
  );
  const t2 = BLIND_SPOT_SYNDROME_TEMPLATES.SYN_OCCULT_LONGITUDINAL_DECAY;
  blindSpotSyndromes.push({
    id: t2.id,
    titleEn: t2.titleEn,
    titleAr: t2.titleAr,
    triggered: syn2Triggered,
    severity: t2.severity,
    parentSignalIds: t2.parentSignalIds,
    whatTechSeesEn: t2.whatTechSeesEn,
    whatTechSeesAr: t2.whatTechSeesAr,
    whatGraphCatchesEn: t2.whatGraphCatchesEn,
    whatGraphCatchesAr: t2.whatGraphCatchesAr,
  });

  // Syndrome 3: SYN_SUBCLINICAL_AROMATASE_SLEEP_AXIS
  const syn3Triggered = Boolean(
    vitals.bmi >= 26.5 &&
      (vitals.sleepHoursAvg < 6.0 || vitals.hba1cPct >= 5.7) &&
      ((t_e2_ratio !== null && t_e2_ratio < 10.0) ||
        (semen !== null && semen.totalMotilityPct < 45.0))
  );
  const t3 = BLIND_SPOT_SYNDROME_TEMPLATES.SYN_SUBCLINICAL_AROMATASE_SLEEP_AXIS;
  blindSpotSyndromes.push({
    id: t3.id,
    titleEn: t3.titleEn,
    titleAr: t3.titleAr,
    triggered: syn3Triggered,
    severity: t3.severity,
    parentSignalIds: t3.parentSignalIds,
    whatTechSeesEn: t3.whatTechSeesEn,
    whatTechSeesAr: t3.whatTechSeesAr,
    whatGraphCatchesEn: t3.whatGraphCatchesEn,
    whatGraphCatchesAr: t3.whatGraphCatchesAr,
  });

  // Syndrome 4: SYN_DELAYED_IATROGENIC_SPERMATOTOXICITY
  const syn4Triggered = Boolean(
    delayedMedExposure &&
      ((tmsc_million !== null && tmsc_million < 25.0) ||
        (semen !== null && semen.volumeMl < 1.6) ||
        (tmsc_velocity_pct_mo !== null && tmsc_velocity_pct_mo < -5.0))
  );
  const t4 = BLIND_SPOT_SYNDROME_TEMPLATES.SYN_DELAYED_IATROGENIC_SPERMATOTOXICITY;
  blindSpotSyndromes.push({
    id: t4.id,
    titleEn: t4.titleEn,
    titleAr: t4.titleAr,
    triggered: syn4Triggered,
    severity: t4.severity,
    parentSignalIds: t4.parentSignalIds,
    whatTechSeesEn: t4.whatTechSeesEn,
    whatTechSeesAr: t4.whatTechSeesAr,
    whatGraphCatchesEn: t4.whatGraphCatchesEn,
    whatGraphCatchesAr: t4.whatGraphCatchesAr,
  });

  // Syndrome 5: SYN_LOW_VOLUME_OBSTRUCTIVE_MASK
  const syn5Triggered = Boolean(
    semen !== null &&
      semen.volumeMl < 1.4 &&
      semen.concentrationMMl < 10.0 &&
      (fshVal === null || fshVal <= 7.6)
  );
  const t5 = BLIND_SPOT_SYNDROME_TEMPLATES.SYN_LOW_VOLUME_OBSTRUCTIVE_MASK;
  blindSpotSyndromes.push({
    id: t5.id,
    titleEn: t5.titleEn,
    titleAr: t5.titleAr,
    triggered: syn5Triggered,
    severity: t5.severity,
    parentSignalIds: t5.parentSignalIds,
    whatTechSeesEn: t5.whatTechSeesEn,
    whatTechSeesAr: t5.whatTechSeesAr,
    whatGraphCatchesEn: t5.whatGraphCatchesEn,
    whatGraphCatchesAr: t5.whatGraphCatchesAr,
  });

  return { signals, blindSpotSyndromes };
}

