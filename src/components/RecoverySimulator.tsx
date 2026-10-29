/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Armchair,
  Cigarette,
  Scale,
  Pill,
} from 'lucide-react';
import { ScreeningInput, ClinicalEvaluationResult, Language, TriageTier } from '../types/screening.ts';
import { evaluateScreening } from '../lib/clinicalEngine.ts';

interface RecoverySimulatorProps {
  baselineInput: ScreeningInput;
  baselineEvaluation: ClinicalEvaluationResult;
  language: Language;
}

function calculateUrgencyScore(evaluation: ClinicalEvaluationResult): number {
  switch (evaluation.triage_tier) {
    case 'TIER_1_EMERGENCY':
      return 95;
    case 'TIER_2_ANDROLOGY_SPECIALIST':
      return 75;
    case 'TIER_3_PRIMARY_CARE':
      return 45;
    case 'TIER_4_LIFESTYLE':
      return evaluation.triggered_rules.length > 0 ? 25 : 10;
    default:
      return 20;
  }
}

function getTierName(tier: TriageTier, isAr: boolean): string {
  switch (tier) {
    case 'TIER_1_EMERGENCY':
      return isAr ? 'طوارئ جراحية (المستوى 1)' : 'Emergency (Tier 1)';
    case 'TIER_2_ANDROLOGY_SPECIALIST':
      return isAr ? 'استشاري ذكورة (المستوى 2)' : 'Andrology Specialist (Tier 2)';
    case 'TIER_3_PRIMARY_CARE':
      return isAr ? 'رعاية أولية (المستوى 3)' : 'Primary Care (Tier 3)';
    case 'TIER_4_LIFESTYLE':
      return isAr ? 'نمط حياة مثالي (المستوى 4)' : 'Lifestyle Optimization (Tier 4)';
  }
}

export const RecoverySimulator: React.FC<RecoverySimulatorProps> = ({
  baselineInput,
  baselineEvaluation,
  language,
}) => {
  const isAr = language === 'ar';

  // Counterfactual modifiable risk toggles
  const [stopSteroids, setStopSteroids] = useState<boolean>(baselineInput.steroidsTrt);
  const [stopSmoking, setStopSmoking] = useState<boolean>(baselineInput.tobaccoShisha !== 'none');
  const [avoidHeat, setAvoidHeat] = useState<boolean>(baselineInput.frequentHeat);
  const [reduceSitting, setReduceSitting] = useState<boolean>(baselineInput.sittingHours >= 8);
  const [normalizeBmi, setNormalizeBmi] = useState<boolean>(baselineInput.bmi >= 25);

  // Active milestone tab: 30, 60, or 90 days
  const [selectedMilestone, setSelectedMilestone] = useState<30 | 60 | 90>(90);

  // Compute counterfactual screening input
  const counterfactualInput = useMemo<ScreeningInput>(() => {
    const targetBmi = normalizeBmi ? 23.5 : baselineInput.bmi;
    const targetWeight =
      normalizeBmi && baselineInput.bmi > 25
        ? Math.round(23.5 * Math.pow(baselineInput.heightCm / 100, 2))
        : baselineInput.weightKg;

    // Projected semen recovery after 90 days
    const mult = (stopSteroids ? 2.5 : 1.0) * (stopSmoking ? 1.25 : 1.0) * (avoidHeat ? 1.2 : 1.0);
    const projVol = Math.min(4.5, Number((baselineInput.semenVolume * (avoidHeat ? 1.15 : 1.0)).toFixed(1)));
    const projConc = Math.min(80.0, Number((baselineInput.semenConcentration * mult).toFixed(1)));
    const projMot = Math.min(75.0, Number((baselineInput.semenMotility + (stopSmoking ? 15 : 5) + (avoidHeat ? 10 : 0)).toFixed(0)));
    const projMorph = Math.min(10.0, Number((baselineInput.semenMorphology + (stopSmoking ? 2.0 : 0.5) + (stopSteroids ? 2.5 : 0)).toFixed(1)));

    return {
      ...baselineInput,
      steroidsTrt: stopSteroids ? false : baselineInput.steroidsTrt,
      tobaccoShisha: stopSmoking ? 'none' : baselineInput.tobaccoShisha,
      frequentHeat: avoidHeat ? false : baselineInput.frequentHeat,
      sittingHours: reduceSitting ? Math.min(baselineInput.sittingHours, 5) : baselineInput.sittingHours,
      bmi: targetBmi,
      weightKg: targetWeight,
      semenVolume: baselineInput.hasSemenReport ? projVol : baselineInput.semenVolume,
      semenConcentration: baselineInput.hasSemenReport ? projConc : baselineInput.semenConcentration,
      semenMotility: baselineInput.hasSemenReport ? projMot : baselineInput.semenMotility,
      semenMorphology: baselineInput.hasSemenReport ? projMorph : baselineInput.semenMorphology,
    };
  }, [
    baselineInput,
    stopSteroids,
    stopSmoking,
    avoidHeat,
    reduceSitting,
    normalizeBmi,
  ]);

  // Recalculate deterministic evaluation
  const simulatedEvaluation = useMemo(() => {
    return evaluateScreening(counterfactualInput);
  }, [counterfactualInput]);

  const baselineUrgency = calculateUrgencyScore(baselineEvaluation);
  const simulatedUrgency = calculateUrgencyScore(simulatedEvaluation);
  const urgencyDelta = baselineUrgency - simulatedUrgency;

  // Milestone explanations
  const milestones = {
    30: {
      titleEn: 'Day 30: Cellular & Endocrine Initiation',
      titleAr: 'اليوم 30: بدء التعافي الخلوي والهرموني',
      descEn:
        'Hypothalamic-Pituitary-Gonadal (HPG) axis uncouples from negative androgen/heat feedback. Testicular oxidative stress drops by ~35%. Early spermatogonia resume mitosis.',
      descAr:
        'يبدأ المحور الهرموني (النخامية-الخصية) بالتحرر من التثبيط. ينخفض الإجهاد التأكسدي داخل النسيج الخصيوي بنسبة ~35% وتستأنف أمهات المني انقسامها الخلوي.',
      metricEn: '+10–15% Sperm Motility Velocity',
      metricAr: '+10–15% تحسن في حركية النطاف',
    },
    60: {
      titleEn: 'Day 60: Spermatid Elongation Phase',
      titleAr: 'اليوم 60: مرحلة استطالة النطاف والتركيب الهيكلي',
      descEn:
        'Spermatids undergo chromatin condensation and flagellar assembly. Protamine replacement stabilizes sperm DNA integrity, drastically reducing DNA Fragmentation Index (DFI).',
      descAr:
        'تكتمل مرحلة تشكيل السوط وتكثيف المادة الوراثية للنطاف. ينخفض مؤشر تكسر الحمض النووي (DFI) بشكل كبير مع تحسن بنيوي في أشكال الحيوانات المنوية.',
      metricEn: '+25–40% Sperm Concentration',
      metricAr: '+25–40% زيادة في تركيز الحيوانات المنوية',
    },
    90: {
      titleEn: 'Day 90: Complete Spermatogenesis Cycle (Full Turnover)',
      titleAr: 'اليوم 90: اكتمال دورة تصنيع النطاف الكاملة',
      descEn:
        'A full biological human spermatogenesis cycle (74±4 days) plus epididymal transit (12–14 days) is complete. The freshly ejaculated cohort reflects the unsuppressed testicular environment.',
      descAr:
        'تكتمل دورة تصنيع النطاف البشرية البيولوجية الكاملة (74±4 أيام) بالإضافة إلى مرحلة نضج البربخ. النطاف الجديدة تعكس بيئة خالية تماماً من العوامل المثبطة.',
      metricEn: 'WHO 6th Ed Parameter Normalization',
      metricAr: 'وصول مؤشرات النطاف للحدود المرجعية لمنظمة الصحة',
    },
  };

  const currentMilestone = milestones[selectedMilestone];

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {isAr
                  ? 'محاكي التعافي لـ 90 يوماً (دورة تصنيع النطاف)'
                  : 'Interactive 90-Day Spermatogenesis Recovery Simulator'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                WHO 6th Ed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'استكشف التغيير السريري الفوري وتراجع درجة الخطورة عند إيقاف العوامل القابلة للتعديل'
                : 'Toggle modifiable risk factors to simulate real-time clinical tier progression over one spermatogenic cycle.'}
            </p>
          </div>
        </div>

        {/* Delta Urgency Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-2 rounded-xl border border-slate-200">
          <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-start">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {isAr ? 'انخفاض مؤشر الإلحاح السريري' : 'Urgency Delta'}
            </div>
            <div className="text-xs font-mono font-bold text-slate-900">
              {urgencyDelta > 0 ? `-${urgencyDelta} Points (Improved)` : 'Baseline / No Change'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Gauge Container (UX-22: Solid surface, motion-safe animated gauge) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              {isAr ? 'التصنيف المبدئي الحالي' : 'Baseline Evaluation'}
            </span>
            <span className="font-bold text-slate-200 text-sm">
              {getTierName(baselineEvaluation.triage_tier, isAr)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className={`w-4 h-4 text-emerald-400 shrink-0 ${isAr ? 'rotate-180' : ''}`} />
            <div>
              <span className="text-emerald-400 block text-[11px] uppercase tracking-wider font-semibold">
                {isAr ? 'النتيجة المتوقعة بعد 90 يوماً' : 'Projected 90-Day Outcome'}
              </span>
              <span className="font-bold text-emerald-300 text-sm">
                {getTierName(simulatedEvaluation.triage_tier, isAr)}
              </span>
            </div>
          </div>
        </div>

        {/* Animated Urgency Score Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{isAr ? 'مؤشر الخطورة الإكلينيكية' : 'Clinical Urgency Score'}</span>
            <span>
              {simulatedUrgency} / 100 (Was {baselineUrgency})
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-emerald-500 rounded-full motion-safe:transition-all motion-safe:duration-500"
              style={{ width: `${Math.max(5, simulatedUrgency)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modifiable Risk Factor Counterfactual Toggles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>{isAr ? 'تبديل عوامل الخطر القابلة للتعديل (Counterfactual Toggles)' : 'Modifiable Risk Factors'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Steroids / TRT Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={stopSteroids}
            onClick={() => setStopSteroids(!stopSteroids)}
            className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              stopSteroids
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pill className={`w-4 h-4 mt-0.5 shrink-0 ${stopSteroids ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold block">
                {isAr ? 'إيقاف المنشطات / التستوستيرون' : 'Cease Steroids / TRT'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {isAr ? 'استعادة نشاط الغدة النخامية' : 'Restores HPG Axis FSH/LH'}
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                stopSteroids ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {stopSteroids && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Smoking / Shisha Cessation */}
          <button
            type="button"
            role="switch"
            aria-checked={stopSmoking}
            onClick={() => setStopSmoking(!stopSmoking)}
            className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              stopSmoking
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cigarette className={`w-4 h-4 mt-0.5 shrink-0 ${stopSmoking ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold block">
                {isAr ? 'الإقلاع عن التدخين والشيشة' : 'Smoking / Shisha Cessation'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {isAr ? 'خفض الإجهاد التأكسدي للحمض النووي' : 'Reduces ROS & DNA Fragmentation'}
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                stopSmoking ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {stopSmoking && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Heat Mitigation */}
          <button
            type="button"
            role="switch"
            aria-checked={avoidHeat}
            onClick={() => setAvoidHeat(!avoidHeat)}
            className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              avoidHeat
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className={`w-4 h-4 mt-0.5 shrink-0 ${avoidHeat ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold block">
                {isAr ? 'تجنب حمامات البخار والساونا' : 'Mitigate Scrotal Heat'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {isAr ? 'تبريد بيئة تصنيع النطاف بـ 2-3 درجات' : 'Keeps scrotum 2–3°C below core'}
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                avoidHeat ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {avoidHeat && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Reduce Sitting Hours */}
          <button
            type="button"
            role="switch"
            aria-checked={reduceSitting}
            onClick={() => setReduceSitting(!reduceSitting)}
            className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              reduceSitting
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Armchair className={`w-4 h-4 mt-0.5 shrink-0 ${reduceSitting ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold block">
                {isAr ? 'تقليل الجلوس (<6 ساعات/يوم)' : 'Reduce Sitting (<6h/day)'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {isAr ? 'منع الاحتقان الوريدي الصفني' : 'Prevents scrotal venous stasis'}
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                reduceSitting ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {reduceSitting && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Normalize BMI */}
          <button
            type="button"
            role="switch"
            aria-checked={normalizeBmi}
            onClick={() => setNormalizeBmi(!normalizeBmi)}
            className={`p-3 rounded-xl border text-start flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              normalizeBmi
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className={`w-4 h-4 mt-0.5 shrink-0 ${normalizeBmi ? 'text-emerald-700' : 'text-slate-400'}`} />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold block">
                {isAr ? 'تحسين مؤشر كتلة الجسم (BMI <25)' : 'Normalize BMI (<25)'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {isAr ? 'تقليل تحول التستوستيرون لإستروجين' : 'Inhibits adipose aromatase'}
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                normalizeBmi ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {normalizeBmi && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>
      </div>

      {/* 30 / 60 / 90-Day Biological Milestones */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'محطات التطور البيولوجي في الخصية' : 'Spermatogenesis Timeline Milestones'}</span>
          </h4>

          {/* Day Tab Switcher */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-medium">
            {([30, 60, 90] as const).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedMilestone(day)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedMilestone === day
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {day} {isAr ? 'يوماً' : 'Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Detail Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {isAr ? currentMilestone.titleAr : currentMilestone.titleEn}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
              {isAr ? currentMilestone.metricAr : currentMilestone.metricEn}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isAr ? currentMilestone.descAr : currentMilestone.descEn}
          </p>
        </div>
      </div>
    </div>
  );
};
