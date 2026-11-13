/**
 * Masar Amanah Health (مسار أمانة)
 * Algorithm Version: v2.0-BAYESIAN-DAG-WHO6-AUA-UAE
 *
 * 6 Multi-Visit Synthetic Malaffi Longitudinal Patient Records.
 * Demonstrates technician blind spots, life-saving escalations, and active loop convergence.
 * ZERO-PII ARCHITECTURE (ADR-1 v2): Fully pseudonymized synthetic clinical data.
 */

import { LongitudinalPatientRecord } from '../types/diagnosticGraph';

export const LONGITUDINAL_MALAFFI_COHORT: LongitudinalPatientRecord[] = [
  // ==========================================================================
  // Patient 1: The False-Normal Lab Trap & Longitudinal Decay
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-001',
    pseudonymToken: 'MLF-TKN-7821-001',
    age: 34,
    ifhasBracket: '18-35',
    primaryComplaintEn:
      'Routine fertility check following 14 months of unassisted conception delay; previously told semen test is "normal".',
    primaryComplaintAr:
      'فحص روتيني للخصوبة بعد تأخر الحمل لمدة 14 شهراً، مع إبلاغ المريض سابقاً بأن الفحص "طبيعي".',
    encounters: [
      {
        encounterId: 'ENC-001-V1',
        dateIso: '2026-05-10T09:00:00Z',
        clinicalSetting: 'PRIMARY_CARE',
        vitals: {
          bmi: 24.2,
          weightKg: 73,
          restingHrBpm: 68,
          sleepHoursAvg: 7.2,
          hba1cPct: 5.2,
        },
        semenLab: {
          volumeMl: 2.6,
          concentrationMMl: 28.0,
          totalMotilityPct: 52,
          normalMorphologyPct: 6,
        },
        endocrinePanel: {
          fshIuL: 3.8,
          lhIuL: 4.1,
          totalTestosteroneNgDl: 520,
          estradiolPgMl: 24,
          prolactinNgMl: 9.8,
        },
        medications: [
          {
            name: 'Finasteride 1mg oral daily',
            class: '5ARI',
            startDateIso: '2026-05-20T00:00:00Z',
          },
        ],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
      {
        encounterId: 'ENC-001-V2',
        dateIso: '2026-11-05T10:30:00Z',
        clinicalSetting: 'ANDROLOGY_OUTPATIENT',
        vitals: {
          bmi: 24.6,
          weightKg: 74,
          restingHrBpm: 72,
          sleepHoursAvg: 6.8,
          hba1cPct: 5.3,
        },
        // All 4 WHO 6th lines pass single cutoffs, but TMSC = 10.32M (<20M) and velocity = -12.5%/mo
        semenLab: {
          volumeMl: 1.5,
          concentrationMMl: 16.0,
          totalMotilityPct: 43,
          normalMorphologyPct: 4,
        },
        endocrinePanel: {
          fshIuL: 3.5,
          lhIuL: 3.8,
          totalTestosteroneNgDl: 460,
          estradiolPgMl: 26,
          prolactinNgMl: 11.2,
        },
        medications: [
          {
            name: 'Finasteride 1mg oral daily',
            class: '5ARI',
            startDateIso: '2026-05-20T00:00:00Z',
          },
        ],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 6,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
    ],
  },

  // ==========================================================================
  // Patient 2: Life-Saving Catch — Occult Pituitary Neuroendocrine Suppression
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-002',
    pseudonymToken: 'MLF-TKN-9140-002',
    age: 29,
    ifhasBracket: '18-35',
    primaryComplaintEn:
      'Fatigue, decreased libido, and subfertility with oligozoospermia on semen analysis.',
    primaryComplaintAr:
      'إجهاد عام، انخفاض في الرغبة الجنسية، وتأخر الإنجاب مع قلة النطاف في التحليل.',
    encounters: [
      {
        encounterId: 'ENC-002-V1',
        dateIso: '2026-03-15T09:00:00Z',
        clinicalSetting: 'PRIMARY_CARE',
        vitals: {
          bmi: 23.8,
          weightKg: 71,
          restingHrBpm: 66,
          sleepHoursAvg: 7.0,
          hba1cPct: 5.1,
        },
        semenLab: {
          volumeMl: 2.2,
          concentrationMMl: 11.5,
          totalMotilityPct: 40,
          normalMorphologyPct: 4,
        },
        endocrinePanel: null,
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
      {
        encounterId: 'ENC-002-V2',
        dateIso: '2026-11-02T11:00:00Z',
        clinicalSetting: 'ANDROLOGY_OUTPATIENT',
        vitals: {
          bmi: 24.1,
          weightKg: 72,
          restingHrBpm: 70,
          sleepHoursAvg: 6.5,
          hba1cPct: 5.2,
        },
        semenLab: {
          volumeMl: 2.0,
          concentrationMMl: 6.2,
          totalMotilityPct: 35,
          normalMorphologyPct: 3,
        },
        // Low count (6.2) + low T (185) + blunted FSH/LH (1.1/1.2) + Prolactin NULL -> ESC_OCCULT_PITUITARY
        endocrinePanel: {
          fshIuL: 1.1,
          lhIuL: 1.2,
          totalTestosteroneNgDl: 185,
          estradiolPgMl: 18,
          prolactinNgMl: null as any,
        },
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
    ],
  },

  // ==========================================================================
  // Patient 3: Life-Saving Catch — Silent Cardiometabolic MACE Precursor (ADPHC Priority)
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-003',
    pseudonymToken: 'MLF-TKN-4320-003',
    age: 44,
    ifhasBracket: '36-50',
    primaryComplaintEn:
      'Referred from IFHAS health checkup: gradual weight gain, daytime somnolence, and secondary subfertility.',
    primaryComplaintAr:
      'محول من برنامج إفحص: زيادة تدريجية بالوزن، خمول نهاري، وتأخر إنجاب ثانوي.',
    encounters: [
      {
        encounterId: 'ENC-003-V1',
        dateIso: '2025-10-14T08:30:00Z',
        clinicalSetting: 'IFHAS_SCREENING',
        vitals: {
          bmi: 27.2,
          weightKg: 84,
          restingHrBpm: 76,
          sleepHoursAvg: 6.6,
          hba1cPct: 5.5,
        },
        semenLab: {
          volumeMl: 2.8,
          concentrationMMl: 24.0,
          totalMotilityPct: 48,
          normalMorphologyPct: 5,
        },
        endocrinePanel: {
          fshIuL: 3.4,
          lhIuL: 3.8,
          totalTestosteroneNgDl: 380,
          estradiolPgMl: 28,
          prolactinNgMl: 12.0,
        },
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 7,
          frequentThermalExposure: false,
          tobaccoUsage: 'light',
        },
      },
      {
        encounterId: 'ENC-003-V2',
        dateIso: '2026-11-01T09:15:00Z',
        clinicalSetting: 'ANDROLOGY_OUTPATIENT',
        vitals: {
          bmi: 29.1,
          weightKg: 90,
          restingHrBpm: 89,
          sleepHoursAvg: 5.1,
          hba1cPct: 6.3,
        },
        semenLab: {
          volumeMl: 2.4,
          concentrationMMl: 14.0,
          totalMotilityPct: 40,
          normalMorphologyPct: 3,
        },
        // T/E2 Ratio = 260 / 36 = 7.22 (<10) + BMI 29.1 + HbA1c 6.3% + RHR 89 bpm + Sleep 5.1h
        endocrinePanel: {
          fshIuL: 2.8,
          lhIuL: 3.1,
          totalTestosteroneNgDl: 260,
          estradiolPgMl: 36,
          prolactinNgMl: 13.5,
        },
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 9,
          frequentThermalExposure: false,
          tobaccoUsage: 'light',
        },
      },
    ],
  },

  // ==========================================================================
  // Patient 4: Unresolved Competing Differential — Pre-Testicular vs Primary Sertoli vs Obstructive
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-004',
    pseudonymToken: 'MLF-TKN-6599-004',
    age: 31,
    ifhasBracket: '18-35',
    primaryComplaintEn:
      'First-time andrology evaluation for severe oligospermia and low ejaculate volume; endocrine labs pending.',
    primaryComplaintAr:
      'تقييم ذكورة أولي لقلة النطاف الشديدة وانخفاض حجم القذف مع عدم توفر فحوصات الهرمونات.',
    encounters: [
      {
        encounterId: 'ENC-004-V1',
        dateIso: '2026-05-10T10:00:00Z',
        clinicalSetting: 'PRIMARY_CARE',
        vitals: {
          bmi: 23.2,
          weightKg: 69,
          restingHrBpm: 66,
          sleepHoursAvg: 7.2,
          hba1cPct: 4.9,
        },
        semenLab: null,
        endocrinePanel: null,
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
      {
        encounterId: 'ENC-004-V2',
        dateIso: '2026-11-04T10:00:00Z',
        clinicalSetting: 'ANDROLOGY_OUTPATIENT',
        vitals: {
          bmi: 23.5,
          weightKg: 70,
          restingHrBpm: 68,
          sleepHoursAvg: 7.0,
          hba1cPct: 5.0,
        },
        // Volume 1.2mL (<1.4), Conc 7.5M (<10) -> SYN_LOW_VOLUME_OBSTRUCTIVE_MASK
        semenLab: {
          volumeMl: 1.2,
          concentrationMMl: 7.5,
          totalMotilityPct: 34,
          normalMorphologyPct: 3,
        },
        endocrinePanel: null, // High uncertainty, FSH & LH ranks #1 discriminator
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 0,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
    ],
  },

  // ==========================================================================
  // Patient 5: Life-Saving Catch — Cryptorchidism + Severe OATS Germ Cell Malignancy Risk
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-005',
    pseudonymToken: 'MLF-TKN-2891-005',
    age: 26,
    ifhasBracket: '18-35',
    primaryComplaintEn:
      'Pre-marital fertility evaluation: history of right undescended testicle corrected at age 8; palpable scrotal fullness.',
    primaryComplaintAr:
      'فحص ما قبل الزواج: تاريخ خصية مهاجرة أُجريت لها جراحة بعمر 8 سنوات، مع ثقل صفني ملموس.',
    encounters: [
      {
        encounterId: 'ENC-005-V1',
        dateIso: '2026-06-08T11:00:00Z',
        clinicalSetting: 'PRIMARY_CARE',
        vitals: {
          bmi: 23.8,
          weightKg: 71,
          restingHrBpm: 72,
          sleepHoursAvg: 7.0,
          hba1cPct: 5.0,
        },
        semenLab: null,
        endocrinePanel: null,
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 1,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: true,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 6,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
      {
        encounterId: 'ENC-005-V2',
        dateIso: '2026-11-06T14:00:00Z',
        clinicalSetting: 'ANDROLOGY_OUTPATIENT',
        vitals: {
          bmi: 24.0,
          weightKg: 72,
          restingHrBpm: 70,
          sleepHoursAvg: 7.0,
          hba1cPct: 5.1,
        },
        // Cryptorchidism + Conc 2.4M (<5M) -> triggers ESC_GERM_CELL_NEOPLASIA_HIGH_RISK
        semenLab: {
          volumeMl: 2.2,
          concentrationMMl: 2.4,
          totalMotilityPct: 28,
          normalMorphologyPct: 2,
        },
        endocrinePanel: {
          fshIuL: 14.8,
          lhIuL: 7.2,
          totalTestosteroneNgDl: 310,
          estradiolPgMl: 22,
          prolactinNgMl: 10.5,
        },
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 2,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: true,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 6,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
    ],
  },

  // ==========================================================================
  // Patient 6: Life-Saving Catch — Acute Surgical / Retroperitoneal Escalation
  // ==========================================================================
  {
    patientId: 'MALAFFI-PT-006',
    pseudonymToken: 'MLF-TKN-1092-006',
    age: 36,
    ifhasBracket: '36-50',
    primaryComplaintEn:
      'Sudden onset acute right-sided scrotal pain (< 12 hours) and newly visible non-reducible right pampiniform venous mass.',
    primaryComplaintAr:
      'ألم صفني حاد ومفاجئ في الجانب الأيمن (< 12 ساعة) مع كتلة وريدية صفنية يمنى غير قابلة للارتجاع.',
    encounters: [
      {
        encounterId: 'ENC-006-V1',
        dateIso: '2026-10-18T10:30:00Z',
        clinicalSetting: 'PRIMARY_CARE',
        vitals: {
          bmi: 25.4,
          weightKg: 78,
          restingHrBpm: 78,
          sleepHoursAvg: 6.8,
          hba1cPct: 5.3,
        },
        semenLab: null,
        endocrinePanel: null,
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: false,
          painlessTesticularMass: false,
          varicoceleGrade: 1,
          rightSidedNonReducibleVaricocele: false,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
      {
        encounterId: 'ENC-006-V2',
        dateIso: '2026-11-08T03:30:00Z',
        clinicalSetting: 'EMERGENCY_DEPT',
        vitals: {
          bmi: 25.5,
          weightKg: 78,
          restingHrBpm: 96,
          sleepHoursAvg: 4.5,
          hba1cPct: 5.4,
        },
        semenLab: null,
        endocrinePanel: null,
        medications: [],
        clinicalFlags: {
          acuteScrotalPain: true,
          painlessTesticularMass: false,
          varicoceleGrade: 3,
          rightSidedNonReducibleVaricocele: true,
          cryptorchidismHistory: false,
          mumpsOrchitisHistory: false,
          sittingHoursPerDay: 5,
          frequentThermalExposure: false,
          tobaccoUsage: 'none',
        },
      },
    ],
  },
];

