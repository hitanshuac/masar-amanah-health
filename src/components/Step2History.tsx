/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pill, Shield, Activity, Bug, Info } from 'lucide-react';
import { ScreeningInput, Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface Step2HistoryProps {
  input: ScreeningInput;
  onChange: (updated: Partial<ScreeningInput>) => void;
  language: Language;
}

export const Step2History: React.FC<Step2HistoryProps> = ({ input, onChange, language }) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t.step2Title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {t.step2Subtitle}
        </p>
      </div>

      {/* Structured Clinical Toggles */}
      <div className="space-y-4">
        {/* Anabolic Steroids / TRT */}
        <label
          className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            input.steroidsTrt
              ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.steroidsTrt}
            checked={input.steroidsTrt}
            onChange={(e) => onChange({ steroidsTrt: e.target.checked })}
            aria-label={t.steroidsLabel}
            className="w-5 h-5 mt-1 rounded-md text-amber-600 border-slate-300 focus:ring-amber-500 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.steroidsLabel}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                HPG Axis
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.steroidsDesc}
            </p>
          </div>
        </label>

        {/* Cryptorchidism (Undescended Testicle) */}
        <label
          className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            input.undescendedTesticle
              ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.undescendedTesticle}
            checked={input.undescendedTesticle}
            onChange={(e) => onChange({ undescendedTesticle: e.target.checked })}
            aria-label={t.undescendedLabel}
            className="w-5 h-5 mt-1 rounded-md text-amber-600 border-slate-300 focus:ring-amber-500 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t.undescendedLabel}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                AUA/ASRM
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.undescendedDesc}
            </p>
          </div>
        </label>

        {/* Clinical Varicocele */}
        <label
          className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            input.varicocele
              ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.varicocele}
            checked={input.varicocele}
            onChange={(e) => onChange({ varicocele: e.target.checked })}
            aria-label={t.varicoceleLabel}
            className="w-5 h-5 mt-1 rounded-md text-amber-600 border-slate-300 focus:ring-amber-500 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.varicoceleLabel}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                Scrotal ROS
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.varicoceleDesc}
            </p>
          </div>
        </label>

        {/* Post-Pubertal Mumps Orchitis */}
        <label
          className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            input.mumpsOrchitis
              ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
          }`}
        >
          <input
            type="checkbox"
            role="switch"
            aria-checked={input.mumpsOrchitis}
            checked={input.mumpsOrchitis}
            onChange={(e) => onChange({ mumpsOrchitis: e.target.checked })}
            aria-label={t.mumpsLabel}
            className="w-5 h-5 mt-1 rounded-md text-amber-600 border-slate-300 focus:ring-amber-500 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
          />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Bug className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t.mumpsLabel}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                EAU Guideline
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.mumpsDesc}
            </p>
          </div>
        </label>
      </div>

      {/* Cultural Respect Note */}
      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {isAr
            ? 'تنبيه كرامة وأمانة: التاريخ الطبي الذكوري أمر فسيولوجي بحت ولا يمس الرجولة إطلاقاً. رصد هذه العوامل مبكراً يتيح تصحيحها وحماية وظائف الخصوبة دون تدابير معقدة.'
            : 'Clinical Stewardship Note: Andrological factors are physiological and standard medical markers. Identifying them early prevents long-term reproductive delays.'}
        </span>
      </div>
    </div>
  );
};
