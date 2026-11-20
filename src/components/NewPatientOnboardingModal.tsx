/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NewPatientOnboardingModal.tsx
 * ============================================================================
 * Masar Amanah Health (مسار أمانة)
 * First-Class 3-Step Walk-In Patient Onboarding Modal (Zero-PII RAM Ephemeral)
 *
 * Steps:
 *   Step 1: Registration, Demographics & Acute Safety Screen (SOP-01 / SOP-02)
 *   Step 2: Pre-Analytical QC & Baseline Semen/Endocrine Labs (TMSC live calculation)
 *   Step 3: Clinical Summary, SOP Matching & Live Admission into Active Cohort
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Microscope,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LongitudinalPatientRecord } from '../types/diagnosticGraph';

interface NewPatientOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientOnboarded: (record: LongitudinalPatientRecord) => void;
  language: 'en' | 'ar';
}

export const NewPatientOnboardingModal: React.FC<NewPatientOnboardingModalProps> = ({
  isOpen,
  onClose,
  onPatientOnboarded,
  language,
}) => {
  const isAr = language === 'ar';

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Demographics & Acute Safety
  const [firstName, setFirstName] = useState<string>('Faisal');
  const [age, setAge] = useState<number>(32);
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [acuteScrotalPain, setAcuteScrotalPain] = useState<boolean>(false);
  const [painlessTesticularMass, setPainlessTesticularMass] = useState<boolean>(false);

  // Step 2: Pre-Analytical QC & Labs
  const [abstinenceDays, setAbstinenceDays] = useState<number>(4);
  const [volumeMl, setVolumeMl] = useState<number>(2.4);
  const [concentrationMMl, setConcentrationMMl] = useState<number>(16.0);
  const [totalMotilityPct, setTotalMotilityPct] = useState<number>(43);
  const [normalMorphologyPct, setNormalMorphologyPct] = useState<number>(4.5);
  const [fshIuL, setFshIuL] = useState<string>(''); // Default empty -> NULL discriminator!
  const [bmi, setBmi] = useState<number>(27.8);
  const [hba1cPct, setHba1cPct] = useState<number>(5.7);

  if (!isOpen) return null;

  // Live Calculations
  const isEmergency = acuteScrotalPain || painlessTesticularMass;
  const compositeTmsc = Number((volumeMl * concentrationMMl * (totalMotilityPct / 100)).toFixed(2));
  const isWhoPassedIndividually =
    volumeMl >= 1.4 &&
    concentrationMMl >= 15.0 &&
    totalMotilityPct >= 42.0 &&
    normalMorphologyPct >= 4.0;
  const isFalseNormalTrap = !isEmergency && isWhoPassedIndividually && compositeTmsc < 20.0;
  const isAbstinenceCompliant = abstinenceDays >= 2 && abstinenceDays <= 7;

  // 1-Click Realistic Helper
  const handleFillRealisticCase = () => {
    setFirstName('Faisal');
    setAge(32);
    setConsentGiven(true);
    setAcuteScrotalPain(false);
    setPainlessTesticularMass(false);
    setAbstinenceDays(4);
    setVolumeMl(2.4);
    setConcentrationMMl(16.0);
    setTotalMotilityPct(43);
    setNormalMorphologyPct(4.5);
    setFshIuL(''); // Explicitly NULL
    setBmi(27.8);
    setHba1cPct(5.7);
    setStep(2);
  };

  const handleCompleteAdmission = () => {
    const timestampSuffix = Math.floor(100 + Math.random() * 900);
    const patientId = `MALAFFI-PT-NEW-0${timestampSuffix % 10}`;
    const pseudonymToken = `MLF-TKN-NEW-${timestampSuffix}`;

    const newRecord: LongitudinalPatientRecord = {
      patientId,
      pseudonymToken,
      age: Number(age) || 32,
      ifhasBracket: age <= 35 ? '18-35' : age <= 50 ? '36-50' : '51-75',
      primaryComplaintEn: isEmergency
        ? `Acute scrotal presentation (${acuteScrotalPain ? 'Severe Scrotal Pain <24h' : 'Firm Testicular Mass'}) — STAT Surgical Circuit Breaker`
        : isFalseNormalTrap
        ? `Walk-in preconception fertility check — False-Normal Trap (TMSC ${compositeTmsc}M < 20M)`
        : `Walk-in male reproductive vitality consultation`,
      primaryComplaintAr: isEmergency
        ? `حالة صفنية حادة (${acuteScrotalPain ? 'ألم حاد مفاجئ <24س' : 'كتلة صلبة غير مؤلمة'}) — قاطع الدائرة الجراحي الفوري`
        : isFalseNormalTrap
        ? `فحص خصوبة أولي للمراجع — فخ النتيجة الطبيعية الكاذبة (العدد الكلي ${compositeTmsc} مليون < 20M)`
        : `استشارة صحة الإنجاب والنشاط الحيوي للرجال`,
      encounters: [
        {
          encounterId: `ENC-WALKIN-${timestampSuffix}-01`,
          dateIso: new Date().toISOString().split('T')[0],
          clinicalSetting: isEmergency ? 'EMERGENCY_DEPT' : 'PRIMARY_CARE',
          vitals: {
            bmi: Number(bmi) || 27.5,
            weightKg: 82,
            restingHrBpm: isEmergency ? 104 : 72,
            sleepHoursAvg: 7.0,
            hba1cPct: Number(hba1cPct) || 5.7,
          },
          semenLab: isEmergency
            ? null
            : {
                volumeMl: Number(volumeMl) || 2.4,
                concentrationMMl: Number(concentrationMMl) || 16.0,
                totalMotilityPct: Number(totalMotilityPct) || 43,
                normalMorphologyPct: Number(normalMorphologyPct) || 4.5,
              },
          endocrinePanel:
            fshIuL.trim() !== ''
              ? {
                  fshIuL: Number(fshIuL),
                  lhIuL: 4.2,
                  totalTestosteroneNgDl: 360,
                  estradiolPgMl: 25,
                  prolactinNgMl: 10,
                }
              : null,
          medications: [],
          clinicalFlags: {
            acuteScrotalPain,
            painlessTesticularMass,
            varicoceleGrade: 0,
            cryptorchidismHistory: false,
            mumpsOrchitisHistory: false,
            sittingHoursPerDay: 7,
            frequentThermalExposure: false,
            tobaccoUsage: 'none',
          },
        },
      ],
    };

    onPatientOnboarded(newRecord);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/85"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تسجيل مريض جديد (عيادة الاستقبال)' : 'Onboard New Walk-In Patient'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold">
                  Zero-PII RAM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'تسجيل مريض سريري لحظي وتقييمه مباشرة عبر شبكة بايزيين المعرفية'
                  : 'Register a walk-in patient live into volatile memory & evaluate via Bayesian DAG'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillRealisticCase}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? '⚡ ملء حالة واقعية' : '⚡ Fill Realistic Case'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: isAr ? '1. التسجيل والسلامة' : '1. Registration & Safety' },
              { num: 2, label: isAr ? '2. الفحوصات والـ QC' : '2. QC & Baseline Labs' },
              { num: 3, label: isAr ? '3. الاعتماد والتقييم' : '3. Live Admission' },
            ].map((s) => (
              <span
                key={s.num}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 ${
                  step === s.num
                    ? 'bg-emerald-500 text-emerald-950 font-bold'
                    : step > s.num
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'text-slate-500'
                }`}
              >
                <span>{s.label}</span>
              </span>
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isAr ? `الخطوة ${step} من 3` : `Step ${step} of 3`}
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* =================================================================
              STEP 1: Registration, Demographics & Acute Red Flags
             ================================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="input-first-name" className="block text-slate-300 font-semibold mb-1">
                    {isAr ? 'الاسم الأول (ترميز هوية مجهل)' : 'Pseudonymized First Name'}
                  </label>
                  <input
                    id="input-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Faisal"
                  />
                </div>

                <div>
                  <label htmlFor="input-patient-age" className="block text-slate-300 font-semibold mb-1">
                    {isAr ? 'العمر (18–75 سنة)' : 'Patient Age (18–75 years)'}
                  </label>
                  <input
                    id="input-patient-age"
                    type="number"
                    min={18}
                    max={75}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* PDPL Zero-PII Consent Switch */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      {isAr ? 'موافقة المريض على الفحص المجهل (UAE PDPL)' : 'UAE PDPL Zero-PII Patient Consent'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isAr
                        ? 'معالجة مشفرة في الذاكرة اللحظية فقط دون تخزين دائم'
                        : '100% ephemeral RAM execution with zero persistent storage'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={consentGiven}
                  onClick={() => setConsentGiven(!consentGiven)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    consentGiven ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      consentGiven ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Acute Red-Flag Switches */}
              <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>
                    {isAr
                      ? 'شاشة فحص الطوارئ الحادة (SOP-02: نافذة الإنقاذ <6 ساعات)'
                      : 'Acute Red-Flag Safety Screen (SOP-02: <6h Surgical Salvage Window)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Switch 1: Pain */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white block">
                        {isAr ? 'ألم صفني حاد (<24 ساعة)' : 'Acute Scrotal Pain (<24h)'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isAr ? 'اشتباه التواء خصية حاد' : 'Suspected spermatic cord torsion'}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={acuteScrotalPain}
                      onClick={() => setAcuteScrotalPain(!acuteScrotalPain)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                        acuteScrotalPain ? 'bg-rose-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          acuteScrotalPain ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Switch 2: Mass */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white block">
                        {isAr ? 'كتلة صفنية صلبة غير مؤلمة' : 'Firm Painless Testicular Mass'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isAr ? 'اشتباه ورم خصية خبيث' : 'Suspected germ cell neoplasm'}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={painlessTesticularMass}
                      onClick={() => setPainlessTesticularMass(!painlessTesticularMass)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                        painlessTesticularMass ? 'bg-rose-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          painlessTesticularMass ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isEmergency && (
                  <div className="p-3 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-between gap-2 animate-bounce">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                      <span>
                        {isAr
                          ? '🚨 تفعيل قاطع الدائرة الجراحي الفوري (SOP-02) — تجاوز الفحوصات الروتينية!'
                          : '🚨 STAT SURGICAL CIRCUIT BREAKER ACTIVE (SOP-02) — Routine Labs Bypassed!'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-3 py-1 bg-white text-rose-900 rounded-lg text-xs font-black shadow-xs cursor-pointer"
                    >
                      {isAr ? 'الانتقال للتحويل العاجل ←' : 'Proceed to STAT Transfer →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              STEP 2: Pre-Analytical QC & Baseline Labs
             ================================================================= */}
          {step === 2 && !isEmergency && (
            <div className="space-y-4 animate-fade-in">
              {/* Abstinence QC */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-abstinence-days" className="font-semibold text-white">
                    {isAr ? 'فترة الامتناع الجنسي (أيام)' : 'Ejaculatory Abstinence (Days)'}
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                      isAbstinenceCompliant
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    {isAbstinenceCompliant
                      ? (isAr ? 'معتمد: 2-7 أيام (WHO 6th)' : 'PASS: 2–7d (WHO 6th Compliant)')
                      : (isAr ? 'تحذير: إعادة العينة مطلوبة' : 'WARNING: <2d / >7d Recollect Required')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="input-abstinence-days"
                    type="range"
                    min={1}
                    max={14}
                    value={abstinenceDays}
                    onChange={(e) => setAbstinenceDays(Number(e.target.value))}
                    aria-label="Ejaculatory Abstinence Days"
                    aria-valuemin={1}
                    aria-valuemax={14}
                    aria-valuenow={abstinenceDays}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="w-10 text-center font-mono font-bold text-emerald-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    {abstinenceDays}d
                  </span>
                </div>
              </div>

              {/* Semen Analysis Parameters */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Microscope className="w-4 h-4" />
                    <span>{isAr ? 'معايير فحص السائل المنوي (WHO 6th Edition)' : 'Semen Analysis (WHO 6th Manual)'}</span>
                  </div>
                  {/* Live Composite TMSC calculation */}
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">Composite TMSC:</span>
                    <span
                      className={`font-black px-2 py-0.5 rounded ${
                        compositeTmsc >= 20
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      {compositeTmsc} M
                    </span>
                  </div>
                </div>

                {isFalseNormalTrap && (
                  <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isAr
                        ? `⚠️ فخ النتيجة الطبيعية الكاذبة! كافة المعايير الفردية تجاوزت العتبة لكن العدد الكلي المتحرك (${compositeTmsc}M) أقل من عتبة الخصوبة 20M!`
                        : `⚠️ False-Normal Trap! Every individual parameter passes WHO cutoffs, yet composite TMSC (${compositeTmsc}M) is below fertile 20M threshold!`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label htmlFor="input-volume-ml" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'الحجم (mL)' : 'Volume (mL)'}
                    </label>
                    <input
                      id="input-volume-ml"
                      type="number"
                      step={0.1}
                      value={volumeMl}
                      onChange={(e) => setVolumeMl(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-conc-mml" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'التركيز (M/mL)' : 'Conc (M/mL)'}
                    </label>
                    <input
                      id="input-conc-mml"
                      type="number"
                      step={0.5}
                      value={concentrationMMl}
                      onChange={(e) => setConcentrationMMl(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-motility-pct" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'الحركة (%)' : 'Motility (%)'}
                    </label>
                    <input
                      id="input-motility-pct"
                      type="number"
                      step={1}
                      value={totalMotilityPct}
                      onChange={(e) => setTotalMotilityPct(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-morphology-pct" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'الأشكال الطبيعية (%)' : 'Morphology (%)'}
                    </label>
                    <input
                      id="input-morphology-pct"
                      type="number"
                      step={0.5}
                      value={normalMorphologyPct}
                      onChange={(e) => setNormalMorphologyPct(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Endocrine & Metabolic (NULL FSH Demonstration) */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {isAr ? 'الفحوصات الهرمونية والتمثيل الغذائي' : 'Endocrine & Metabolic Parameters'}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {fshIuL.trim() === '' ? 'FSH is NULL (Loop #1 Active)' : `FSH = ${fshIuL} IU/L`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-fsh-iul" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'مستوى هرمون FSH (IU/L)' : 'Serum FSH (IU/L)'}
                    </label>
                    <input
                      id="input-fsh-iul"
                      type="text"
                      value={fshIuL}
                      onChange={(e) => setFshIuL(e.target.value)}
                      placeholder="Leave blank (NULL)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono font-bold placeholder:text-slate-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {isAr
                        ? 'اتركه فارغاً (NULL) لاختبار تعليق الإحالة والحلقة المفتوحة'
                        : 'Leave blank (NULL) to test Open Loop #1 pre-referral hold'}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="input-patient-bmi" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'كتلة الجسم (BMI)' : 'Body Mass Index (BMI)'}
                    </label>
                    <input
                      id="input-patient-bmi"
                      type="number"
                      step={0.1}
                      value={bmi}
                      onChange={(e) => setBmi(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-patient-hba1c" className="block text-slate-400 text-[11px] mb-1">
                      {isAr ? 'السكر التراكمي (HbA1c %)' : 'Fasting HbA1c (%)'}
                    </label>
                    <input
                      id="input-patient-hba1c"
                      type="number"
                      step={0.1}
                      value={hba1cPct}
                      onChange={(e) => setHba1cPct(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              STEP 3: Admission Summary & SOP Matching Preview
             ================================================================= */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">
                      {isAr ? 'ملخص القبول السريري للمراجع الجديد' : 'Pre-Admission Clinical Summary'}
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700 font-bold">
                    {isEmergency ? 'SOP-02: Acute Emergency' : isFalseNormalTrap ? 'SOP-03: Subfertility Trap' : 'SOP-01: Baseline QC'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Patient:</span>
                    <span className="text-white font-bold">{firstName}, {age}y</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Composite TMSC:</span>
                    <span className="text-emerald-300 font-bold">{isEmergency ? 'Bypassed' : `${compositeTmsc} M`}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Endocrine Loop:</span>
                    <span className={fshIuL ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {fshIuL ? 'Closed (FSH Measured)' : 'Open (NULL FSH)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Attending:</span>
                    <span className="text-emerald-400 font-bold">Dr. Mariam</span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-300 leading-relaxed pt-1">
                  {isEmergency
                    ? (isAr
                        ? 'تنبيه: تم رصد علامات جراحية طارئة. سيتم توجيه المراجع مباشرة لقاطع الدائرة الجراحي الفوري (المستوى 1).'
                        : 'Alert: Acute scrotal red-flags detected. Patient will be admitted directly under STAT Emergency Protocol (Tier 1).')
                    : (isAr
                        ? `سيتم إدراج المراجع (${firstName}) في قائمة ملفي النشطة، وتقييم مساره بايزينياً، وتحديد حلقات المتابعة المطلوبة.`
                        : `Patient (${firstName}, ${age}y) will be admitted live into the active Malaffi cohort, evaluated via the Bayesian DAG, and assigned to Dr. Mariam at Step 1 (S: Subjective).`)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                <span>{isAr ? 'السابق' : 'Previous'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (isEmergency) setStep(3);
                  else setStep((prev) => (prev + 1) as 1 | 2 | 3);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>{isAr ? 'التالي ←' : 'Next Step →'}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteAdmission}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>{isAr ? 'اعتماد الدخول وبدء التقييم السريري ✓' : 'Admit Patient & Launch Diagnostic Loop ✓'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
