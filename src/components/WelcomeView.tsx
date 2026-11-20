/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  HeartHandshake,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Stethoscope,
  Microscope,
  Compass,
} from 'lucide-react';
import { Language } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

interface WelcomeViewProps {
  onStart: () => void;
  language: Language;
  onOpenPrivacyModal: () => void;
  onOnboardWalkIn?: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStart,
  language,
  onOpenPrivacyModal,
  onOnboardWalkIn,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  return (
    <div className="space-y-8 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Subtle geometric pattern / glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-full opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-gradient-to-tr from-teal-900 to-emerald-950 rounded-full opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>GITEX 2026 • Future Health Challenge</span>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
              {isAr ? 'مسار صحة الإنجاب للرجال' : 'Male Reproductive Health Track'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t.welcomeTitle}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.welcomeSubtitle}
          </p>

          {/* Privacy Trust Banner inside Hero */}
          <div className="bg-emerald-800 rounded-2xl p-4 sm:p-5 border border-emerald-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <Lock className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{t.privacyPromiseTitle}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {t.privacyPromiseDesc}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenPrivacyModal}
              className="text-xs text-emerald-300 hover:text-white underline decoration-emerald-400 underline-offset-4 shrink-0 transition-colors cursor-pointer"
            >
              {t.whyZeroPii}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5 text-emerald-950" />
              <span>{t.startScreening}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>

            {onOnboardWalkIn && (
              <button
                type="button"
                onClick={onOnboardWalkIn}
                className="w-full sm:w-auto px-6 py-4 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/50 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>➕ {isAr ? 'إدخال مريض جديد (عيادة)' : 'Onboard Walk-In Patient'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stephen Gear (Microsoft Innovation Hub) "The Moment That Matters" & Named Personas Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              {isAr ? 'اللحظة الحاسمة • إطار الابتكار السريري (Microsoft BXT)' : 'The Moment That Matters • Microsoft Innovation Hub BXT Lens'}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {isAr ? 'إشراف: د. مريم (الطبيبة المعالجة)' : 'Attending: Dr. Mariam (Attending Physician)'}
          </span>
        </div>

        <blockquote className="text-sm sm:text-base font-medium text-slate-200 italic leading-relaxed border-s-4 border-emerald-500 ps-4 py-1">
          {isAr
            ? '"عندما يتلقى الرجل نتائج فحوصاته أو تذكيراً دورياً، يحتاج لدافع شخصي ومسار بنقرة واحدة لإغلاق حلقته التشخيصية، لكن عتبات المختبرات المضللة، وفحوصات الهرمونات المفقودة، والرسائل النصية العامة تقف عائقاً أمامه."'
            : '"When a man\'s screening lab or reminder arrives, he needs a personal reason and a 1-tap path to complete his diagnostic loop, but false-normal reference cutoffs, missing NULL endocrine labs, and generic SMS outreach get in the way."'}
        </blockquote>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>{isAr ? 'خالد (32 سنة) • كشف الفخ المخبري وتدهور القلب الصامت' : 'Khaled, 32y • Catching the False-Normal Trap'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isAr
                ? 'فحوصات خالد صنفت كـ "طبيعية" ظاهرياً رغم أن العدد الكلي المتحرك 10.32 مليون فقط؛ مسار أمانة يكتشف هذا الفخ وخطر القلب المبكر في نقرة واحدة.'
                : 'Khaled was stamped "Normal" despite 10.32M TMSC subfertility; Masar Amanah intercepts his cardiometabolic trajectory and connects him to Dr. Mariam.'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <span>{isAr ? 'طارق (29 سنة) • حسم الفحوصات المفقودة وإغلاق الحلقات' : 'Tariq, 29y • 1-Tap Active Info-Gain Loop Closure'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isAr
                ? 'فحوصات الهرمونات المفقودة (FSH/LH) عطلت علاجه لأشهر؛ محرك كسب المعلومات يحسم التشخيص بيقين 94.2% ويغلق الحلقات مع د. مريم.'
                : 'Missing NULL FSH/LH stalled Tariq for months; Active Shannon Information Gain collapses diagnostic ambiguity to 94.2% certainty in 1 tap.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Stage Pipeline Architectural Explanation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {t.howItWorksTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'فصل كامل بين القرارات السريرية القطعية والصياغة اللغوية الذكية'
                : 'Deterministic Clinical Engine decoupled from Cultural Generative Narrative'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
          {[
            {
              num: '1',
              title: isAr ? 'خصوصية تامة' : 'Private UI',
              desc: t.stepP1,
              icon: Lock,
            },
            {
              num: '2',
              title: isAr ? 'قاطع الدائرة' : 'Circuit Breaker',
              desc: t.stepP2,
              icon: ShieldCheck,
            },
            {
              num: '3',
              title: isAr ? 'محرك قطعي' : 'Rules Engine',
              desc: t.stepP3,
              icon: Microscope,
            },
            {
              num: '4',
              title: isAr ? 'مرافق سياقي' : 'Gemini 2.5 Flash',
              desc: t.stepP4,
              icon: Sparkles,
            },
            {
              num: '5',
              title: isAr ? 'توجيه محلي' : 'Care Routing',
              desc: t.stepP5,
              icon: Compass,
            },
          ].map((stage, idx) => {
            const StageIcon = stage.icon;
            return (
              <div
                key={idx}
                className={`bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-2.5 hover:border-emerald-300 transition-colors animate-slide-up stagger-${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center justify-center font-mono">
                    {stage.num}
                  </span>
                  <StageIcon className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
