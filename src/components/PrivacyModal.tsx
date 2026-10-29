/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, X, CheckCircle2 } from 'lucide-react';
import { Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-800" />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t.privacyModalTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr ? 'الأمانة الرقمية وحماية الكرامة الشخصية' : 'Digital Trust & Absolute Anonymity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>{t.privacyModalBody1}</p>
          <p>{t.privacyModalBody2}</p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {isAr ? 'ضماناتنا المعمارية الصارمة:' : 'Core Architectural Guarantees:'}
            </h4>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'عدم وجود حقول نصوص حرة (No Free-Text Fields) لمنع أي تسريب أو حقن غير مقصود.'
                    : 'Zero Free-Text Inputs: Only structured sliders and toggles to prevent accidental disclosure or prompt injection.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'جلسة مؤقتة في ذاكرة RAM للمتصفح فقط، ولا يتم تخزين أي شيء في قواعد بيانات أو ملفات كوكيز.'
                    : 'Strictly In-Memory (RAM): State resides solely in active browser memory and is discarded on refresh.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'معالجة سريرية قطعية لا تعتمد على التخمين في تحديد درجة الخطورة أو معايير منظمة الصحة العالمية.'
                    : 'Deterministic Rule Rigor: All WHO 6th edition calculations run in verified client logic, not probabilistic LLM guesswork.'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            {t.privacyClose}
          </button>
        </div>
      </div>
    </div>
  );
};
