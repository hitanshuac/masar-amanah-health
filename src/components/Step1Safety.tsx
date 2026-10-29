/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, User, Scale, Info } from 'lucide-react';
import { ScreeningInput, Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface Step1SafetyProps {
  input: ScreeningInput;
  onChange: (updated: Partial<ScreeningInput>) => void;
  language: Language;
}

export const Step1Safety: React.FC<Step1SafetyProps> = ({ input, onChange, language }) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const handleHeightWeightChange = (height: number, weight: number) => {
    const heightM = height / 100;
    const computedBmi = Number((weight / (heightM * heightM)).toFixed(1));
    onChange({
      heightCm: height,
      weightKg: weight,
      bmi: computedBmi,
    });
  };

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: t.bmiUnderweight, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (bmi < 25.0) return { label: t.bmiNormal, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmi < 30.0) return { label: t.bmiOverweight, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: t.bmiObese, color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
  };

  const bmiStatus = getBmiStatus(input.bmi);

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Step Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t.step1Title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {t.step1Subtitle}
        </p>
      </div>

      {/* Red Flags Interceptor Section */}
      <div className="bg-rose-50/70 rounded-2xl p-4 sm:p-5 border-2 border-rose-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{isAr ? 'علامات السلامة الحرجة (بروتوكول التدخل السريع):' : 'Critical Safety Flags (Zero-Delay Interceptor):'}</span>
        </div>

        {/* Acute Pain Toggle */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
            input.acutePain
              ? 'bg-rose-100/80 border-rose-400 text-rose-950 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-rose-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.acutePain}
            checked={input.acutePain}
            onChange={(e) => onChange({ acutePain: e.target.checked })}
            aria-label={t.acutePainLabel}
            className="w-5 h-5 mt-0.5 rounded-md text-rose-600 border-slate-300 focus:ring-rose-500 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1">
            <span className="font-bold text-sm block text-rose-950">
              {t.acutePainLabel}
            </span>
            <span className="text-xs text-rose-900/80 leading-relaxed block">
              {t.acutePainDesc}
            </span>
          </div>
        </label>

        {/* Painless Firm Lump Toggle */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
            input.painlessLump
              ? 'bg-rose-100/80 border-rose-400 text-rose-950 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-rose-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.painlessLump}
            checked={input.painlessLump}
            onChange={(e) => onChange({ painlessLump: e.target.checked })}
            aria-label={t.painlessLumpLabel}
            className="w-5 h-5 mt-0.5 rounded-md text-rose-600 border-slate-300 focus:ring-rose-500 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1">
            <span className="font-bold text-sm block text-rose-950">
              {t.painlessLumpLabel}
            </span>
            <span className="text-xs text-rose-900/80 leading-relaxed block">
              {t.painlessLumpDesc}
            </span>
          </div>
        </label>

        {(input.acutePain || input.painlessLump) && (
          <div className="text-xs text-rose-800 bg-rose-200/60 p-2.5 rounded-lg font-medium flex items-center gap-1.5 animate-pulse">
            <Info className="w-4 h-4 shrink-0" />
            <span>{t.safetyWarning}</span>
          </div>
        )}
      </div>

      {/* Age & Biometrics Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          <span>{isAr ? 'المقاييس البدنية الحيوية' : 'Constitutional & Biometric Markers'}</span>
        </h3>

        {/* Age Slider */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{t.ageLabel}</span>
            <span className="font-mono font-bold text-base px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
              {input.age} {isAr ? 'سنة' : 'yrs'}
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={65}
            step={1}
            value={input.age}
            onChange={(e) => onChange({ age: Number(e.target.value) })}
            aria-label={t.ageLabel}
            aria-valuemin={18}
            aria-valuemax={65}
            aria-valuenow={input.age}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>18</span>
            <span>35</span>
            <span>50</span>
            <span>65</span>
          </div>
        </div>

        {/* Height and Weight Sliders to dynamically calculate BMI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{t.heightLabel}</span>
              <span className="font-mono font-bold text-emerald-900">
                {input.heightCm} cm
              </span>
            </div>
            <input
              type="range"
              min={145}
              max={205}
              step={1}
              value={input.heightCm}
              onChange={(e) => handleHeightWeightChange(Number(e.target.value), input.weightKg)}
              aria-label={t.heightLabel}
              aria-valuemin={145}
              aria-valuemax={205}
              aria-valuenow={input.heightCm}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{t.weightLabel}</span>
              <span className="font-mono font-bold text-emerald-900">
                {input.weightKg} kg
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={160}
              step={1}
              value={input.weightKg}
              onChange={(e) => handleHeightWeightChange(input.heightCm, Number(e.target.value))}
              aria-label={t.weightLabel}
              aria-valuemin={45}
              aria-valuemax={160}
              aria-valuenow={input.weightKg}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Calculated BMI Badge & Explainer */}
        <div className="pt-2">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">{t.bmiLabel}</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {input.bmi.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>
          </div>

          {input.bmi >= 30.0 && (
            <p className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 mt-2.5 leading-relaxed">
              {isAr
                ? 'ملاحظة سريرية: مؤشر الكتلة ≥ 30 يرفع نشاط إنزيم الأروماتاز في الأنسجة الشحمية، مما قد يحول التستوستيرون إلى إستراديول ويؤثر على كفاءة تكوين النطاف.'
                : 'Clinical Note: BMI ≥ 30.0 increases visceral adipose aromatase activity, driving peripheral conversion of testosterone to estradiol and altering gonadotropin pulsatility.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
