/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Globe, RefreshCw, Lock, Award, HeartPulse } from 'lucide-react';
import { Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface HeaderProps {
  language: Language;
  onLanguageToggle: (lang: Language) => void;
  onOpenPrivacyModal: () => void;
  onResetSession: () => void;
  showReset: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageToggle,
  onOpenPrivacyModal,
  onResetSession,
  showReset,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Zero-PII Assurance Badge */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{t.privacyBadge}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-white underline decoration-emerald-400 underline-offset-2 flex items-center gap-1 transition-colors text-[11px]"
            >
              <Lock className="w-3 h-3 text-emerald-300" />
              <span>{t.whyZeroPii}</span>
            </button>
            <span className="text-emerald-400 opacity-60">|</span>
            <span className="text-[11px] text-emerald-200 flex items-center gap-1 font-mono">
              <Award className="w-3 h-3 text-emerald-300" />
              <span>GITEX 2026</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand & Track */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 border border-emerald-700/30">
            <HeartPulse className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isAr ? t.appName : t.appName}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-normal">
                  {isAr ? 'أبوظبي' : 'Abu Dhabi'}
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showReset && (
            <button
              onClick={onResetSession}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 flex items-center gap-1.5 transition-all"
              title={t.restartSession}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.restartSession}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => onLanguageToggle('en')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>English</span>
            </button>
            <button
              onClick={() => onLanguageToggle('ar')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'ar'
                  ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>العربية</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
