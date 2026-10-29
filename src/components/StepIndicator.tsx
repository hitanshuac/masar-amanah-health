/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, ShieldAlert, FileText, Activity, Compass } from 'lucide-react';
import { Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  language: Language;
  hasRedFlags: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  language,
  hasRedFlags,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';
  const steps = [
    { id: 1, label: t.step1, icon: ShieldAlert },
    { id: 2, label: t.step2, icon: FileText },
    { id: 3, label: t.step3, icon: Activity },
    { id: 4, label: t.step4, icon: Compass },
  ];

  return (
    <nav className="w-full py-4" aria-label={isAr ? 'خطوات التقييم' : 'Screening steps'}>
      <div
        className="flex items-center justify-between relative"
        role="tablist"
        aria-label={isAr ? 'شريط مراحل التقييم' : 'Screening progress tabs'}
      >
        {/* Background track line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                role="tab"
                id={`step-tab-${step.id}`}
                aria-selected={isCurrent}
                aria-label={`${step.label} (${isCurrent ? (isAr ? 'المرحلة الحالية' : 'current step') : isCompleted ? (isAr ? 'مكتملة' : 'completed') : (isAr ? 'قادمة' : 'upcoming')})`}
                disabled={!isCompleted && !isCurrent}
                onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all text-xs font-bold border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                  isCurrent
                    ? hasRedFlags && step.id === 1
                      ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20 ring-4 ring-rose-100'
                      : 'bg-emerald-800 border-emerald-800 text-white shadow-md shadow-emerald-800/20 ring-4 ring-emerald-100'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 hover:border-emerald-700 cursor-pointer'
                    : 'bg-white border-slate-200 text-slate-400 cursor-default'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <StepIcon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              <span
                className={`mt-2 text-[11px] sm:text-xs font-medium tracking-tight text-center max-w-[80px] sm:max-w-none ${
                  isCurrent
                    ? 'text-slate-900 font-semibold'
                    : isCompleted
                    ? 'text-emerald-900'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

