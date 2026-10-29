/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, Clock, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Language, ScreeningInput } from '../types/screening.ts';
import { ABU_DHABI_HEALTH_DIRECTORY } from '../data/careDirectory.ts';

interface SafetyCircuitBreakerModalProps {
  isOpen: boolean;
  input: ScreeningInput;
  language: Language;
  onDismiss: () => void;
  onConfirmProceedEmergency: () => void;
}

export const SafetyCircuitBreakerModal: React.FC<SafetyCircuitBreakerModalProps> = ({
  isOpen,
  input,
  language,
  onDismiss,
  onConfirmProceedEmergency,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';
  const isTorsion = input.acutePain;

  const emergencyHospitals = ABU_DHABI_HEALTH_DIRECTORY.EMERGENCY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-500 relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Pulsing Emergency Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 animate-pulse" />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center shrink-0 shadow-inner">
              <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {isAr ? 'قاطع الدائرة الآمن الفوري • زمن استجابة 0 ثانية' : 'Safety Circuit Breaker • 0ms Latency Halt'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-rose-950 mt-1">
                {isTorsion
                  ? isAr
                    ? 'تنبيه طارئ: اشتباه سريري في التواء الخصية الحاد'
                    : 'CRITICAL ALERT: Suspected Acute Testicular Torsion'
                  : isAr
                    ? 'أولوية سريرية: اشتباه في كتلة نسيجية تتطلب تصويراً عاجلاً'
                    : 'URGENT ALERT: Palpable Testicular Mass Requires Fast-Track Imaging'}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Rationale Box */}
        <div className="bg-rose-50/80 rounded-2xl p-5 border border-rose-200 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isTorsion
                ? isAr
                  ? 'نافذة الإنقاذ الحرجة: أقل من 6 ساعات من بداية الألم'
                  : 'Time-Critical Salvage Window: < 6 Hours from Pain Onset'
                : isAr
                  ? 'مسار الفحص السريع: أولوية أسبوعين للمسالك البولية'
                  : 'Priority 2-Week Fast-Track Pathway for Scrotal Ultrasound'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-rose-950/90 leading-relaxed">
            {isTorsion
              ? isAr
                ? 'الألم الحاد المفاجئ في كيس الصفن يعتبر حالة طارئة جراحية حتى يثبت العكس. التواء الحبل المنوي يقطع التروية الدموية، والتأخر في التدخل قد يؤدي إلى فقدان دائم لوظيفة الخصية. يرجى التوجه فوراً لأقرب قسم طوارئ لإجراء فحص دوبلر ملون.'
                : 'Acute severe testicular pain is a medical surgical emergency until ruled out. Testicular torsion restricts arterial blood flow, and clinical salvage rates decline dramatically after 6 hours. Do not wait for routine clinic appointments. Seek emergency evaluation immediately.'
              : isAr
                ? 'وجود كتلة صلبة غير مؤلمة يستدعي إجراء فحص بالموجات فوق الصوتية وتحاليل دلالات الأورام في غضون أيام قليلة، لتأكيد سلامة النسيج أو البدء في العلاج المبكر بنسب شفاء تفوق 98% بإذن الله.'
                : 'A painless, firm intratesticular mass requires urgent diagnostic ultrasonography and serum tumor markers. Early detection of testicular lesions yields exceptional cure rates (>98%) when evaluated without delay.'}
          </p>
        </div>

        {/* Immediate Abu Dhabi Emergency Facilities */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            {isAr
              ? 'مراكز الطوارئ المعتمدة في أبوظبي (تتوفر خدمات الدوبلر والجراحة 24/7):'
              : 'Accredited 24/7 Emergency Facilities in Abu Dhabi (On-Call Doppler & Urology):'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyHospitals.map((hospital, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-rose-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isAr ? hospital.name_ar : hospital.name_en}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold shrink-0">
                    {isAr ? hospital.badge_ar : hospital.badge_en}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{isAr ? hospital.area_ar : hospital.area_en}</span>
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <a
                    href="tel:999"
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-rose-600" />
                    <span>999 / {hospital.phone.split('/')[1] || hospital.phone}</span>
                  </a>
                  {hospital.locationUrl && (
                    <a
                      href={hospital.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-600 hover:text-emerald-700 underline flex items-center gap-0.5"
                    >
                      <span>{isAr ? 'الاتجاهات' : 'Directions'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <a
            href="tel:999"
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{isAr ? 'اتصال فوري بالطوارئ (999)' : 'Call UAE Emergency (999)'}</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onConfirmProceedEmergency}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{isAr ? 'عرض تقرير التوجيه السريري للطوارئ' : 'View Emergency Clinical Report'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
