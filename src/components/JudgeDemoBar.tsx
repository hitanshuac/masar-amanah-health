/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Activity, ShieldAlert, AlertTriangle, CheckCircle, Flame, Play } from 'lucide-react';
import { ScreeningInput, Language, TriageTier } from '../types/screening.ts';

export interface DemoPreset {
  id: string;
  nameEn: string;
  nameAr: string;
  tier: TriageTier;
  tierBadge: string;
  subtitleEn: string;
  subtitleAr: string;
  input: ScreeningInput;
}

export const JUDGE_DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'tier1_emergency',
    nameEn: 'Tier 1: Emergency',
    nameAr: 'المستوى 1: طوارئ حادة',
    tier: 'TIER_1_EMERGENCY',
    tierBadge: 'EMERGENCY',
    subtitleEn: 'Acute Scrotal Pain (<12h Torsion Protocol)',
    subtitleAr: 'ألم حاد في الصفن (<12 ساعة، التواء الخصية)',
    input: {
      acutePain: true,
      painlessLump: false,
      age: 24,
      heightCm: 178,
      weightKg: 74,
      bmi: 23.4,
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
      semenMorphology: 5.0,
    },
  },
  {
    id: 'tier2_andrology',
    nameEn: 'Tier 2: Andrology',
    nameAr: 'المستوى 2: استشاري ذكورة',
    tier: 'TIER_2_ANDROLOGY_SPECIALIST',
    tierBadge: 'ANDROLOGY',
    subtitleEn: 'Varicocele + Exogenous Steroids + Semen Deficit',
    subtitleAr: 'دوالي الخصية + منشطات بنائية + خلل في النطاف',
    input: {
      acutePain: false,
      painlessLump: false,
      age: 31,
      heightCm: 180,
      weightKg: 85,
      bmi: 26.2,
      steroidsTrt: true,
      undescendedTesticle: false,
      varicocele: true,
      mumpsOrchitis: false,
      sittingHours: 7,
      frequentHeat: true,
      tobaccoShisha: 'light',
      hasSemenReport: true,
      semenVolume: 1.1,
      semenConcentration: 6.5,
      semenMotility: 24.0,
      semenMorphology: 2.0,
    },
  },
  {
    id: 'tier3_metabolic',
    nameEn: 'Tier 3: Primary Care',
    nameAr: 'المستوى 3: رعاية أولية',
    tier: 'TIER_3_PRIMARY_CARE',
    tierBadge: 'METABOLIC',
    subtitleEn: 'Severe Obesity (BMI 34) + Post-pubertal Mumps',
    subtitleAr: 'سمنة مفرطة (كتلة 34) + نكاف بعد البلوغ',
    input: {
      acutePain: false,
      painlessLump: false,
      age: 38,
      heightCm: 172,
      weightKg: 101,
      bmi: 34.1,
      steroidsTrt: false,
      undescendedTesticle: false,
      varicocele: false,
      mumpsOrchitis: true,
      sittingHours: 9,
      frequentHeat: false,
      tobaccoShisha: 'none',
      hasSemenReport: false,
      semenVolume: 2.0,
      semenConcentration: 20.0,
      semenMotility: 45.0,
      semenMorphology: 5.0,
    },
  },
  {
    id: 'tier4_lifestyle',
    nameEn: 'Tier 4: Lifestyle Risk',
    nameAr: 'المستوى 4: نمط حياة مفرط',
    tier: 'TIER_4_LIFESTYLE',
    tierBadge: 'LIFESTYLE',
    subtitleEn: 'Sitting 11h/day + Frequent Saunas + Heavy Shisha',
    subtitleAr: 'جلوس 11 ساعة/يوم + ساونا متكررة + شيشة يومية',
    input: {
      acutePain: false,
      painlessLump: false,
      age: 29,
      heightCm: 175,
      weightKg: 77,
      bmi: 25.1,
      steroidsTrt: false,
      undescendedTesticle: false,
      varicocele: false,
      mumpsOrchitis: false,
      sittingHours: 11,
      frequentHeat: true,
      tobaccoShisha: 'heavy',
      hasSemenReport: false,
      semenVolume: 2.2,
      semenConcentration: 28.0,
      semenMotility: 50.0,
      semenMorphology: 5.0,
    },
  },
  {
    id: 'tier4_optimal',
    nameEn: 'Tier 4: Optimal Baseline',
    nameAr: 'المستوى 4: الحالة المثالية',
    tier: 'TIER_4_LIFESTYLE',
    tierBadge: 'OPTIMAL',
    subtitleEn: 'Normal BMI + Low Sitting + Optimal WHO 6th Semen',
    subtitleAr: 'كتلة جسم مثالية + نشاط حركي + فحص نطاف سليم',
    input: {
      acutePain: false,
      painlessLump: false,
      age: 27,
      heightCm: 178,
      weightKg: 72,
      bmi: 22.7,
      steroidsTrt: false,
      undescendedTesticle: false,
      varicocele: false,
      mumpsOrchitis: false,
      sittingHours: 4,
      frequentHeat: false,
      tobaccoShisha: 'none',
      hasSemenReport: true,
      semenVolume: 3.2,
      semenConcentration: 45.0,
      semenMotility: 65.0,
      semenMorphology: 7.5,
    },
  },
];

interface JudgeDemoBarProps {
  activePresetId: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
  language: Language;
  onTriggerBenchmark: () => void;
  isBenchmarkRunning?: boolean;
}

export const JudgeDemoBar: React.FC<JudgeDemoBarProps> = ({
  activePresetId,
  onSelectPreset,
  language,
  onTriggerBenchmark,
  isBenchmarkRunning = false,
}) => {
  const isAr = language === 'ar';

  return (
    <div
      className="bg-slate-900 border-b border-slate-800 text-white px-3 py-2.5 print:hidden shadow-md"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              {isAr ? 'شريط تقييم الحكام (1-Click Presets)' : 'Judge Demo Presets'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isAr ? 'اختبار المسارات السريرية بنقرة واحدة' : 'Select clinical archetype for instant evaluation'}
            </span>
          </div>
        </div>

        {/* 5 Archetype Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {JUDGE_DEMO_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectPreset(preset)}
                title={isAr ? preset.subtitleAr : preset.subtitleEn}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {preset.tier === 'TIER_1_EMERGENCY' && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                {preset.tier === 'TIER_2_ANDROLOGY_SPECIALIST' && <Activity className="w-3 h-3 text-amber-400" />}
                {preset.tier === 'TIER_3_PRIMARY_CARE' && <AlertTriangle className="w-3 h-3 text-sky-400" />}
                {preset.tier === 'TIER_4_LIFESTYLE' && preset.id === 'tier4_lifestyle' && (
                  <Flame className="w-3 h-3 text-emerald-400" />
                )}
                {preset.tier === 'TIER_4_LIFESTYLE' && preset.id === 'tier4_optimal' && (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                )}
                <span>{isAr ? preset.nameAr : preset.nameEn}</span>
              </button>
            );
          })}

          {/* Benchmark Runner Trigger Button */}
          <button
            type="button"
            onClick={onTriggerBenchmark}
            disabled={isBenchmarkRunning}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-amber-500 shadow-xs disabled:opacity-50"
            title="Run 100-Patient UCI Fertility Benchmark Suite"
          >
            <Play className={`w-3 h-3 ${isBenchmarkRunning ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تشغيل فحص UCI (100 مريض)' : 'Run 100-UCI Benchmark'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
