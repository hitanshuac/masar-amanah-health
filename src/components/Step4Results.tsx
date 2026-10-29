/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Building2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Download,
  User,
  Stethoscope,
  Terminal,
  Play,
  Activity,
} from 'lucide-react';
import { ClinicalEvaluationResult, Language, ScreeningInput, TriageTier, UserRole } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import { getFacilitiesForTier } from '../data/careDirectory.ts';
import { SafeNarrative } from './SafeNarrative.tsx';
import { RecoverySimulator } from './RecoverySimulator.tsx';
import { SvgQrCode, downloadFhirBundle } from '../lib/fhirExporter.tsx';
import { runUciBenchmark, BenchmarkRunResult } from '../data/uciBenchmarkCohort.ts';
import { QuestionChips } from './QuestionChips.tsx';

interface Step4ResultsProps {
  evaluation: ClinicalEvaluationResult;
  input: ScreeningInput;
  narrative: string | null;
  isLoadingNarrative: boolean;
  narrativeModel?: string;
  language: Language;
  onReset: () => void;
  initialRole?: UserRole;
  forceBenchmark?: boolean;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({
  evaluation,
  input,
  narrative,
  isLoadingNarrative,
  language,
  onReset,
  initialRole = 'patient',
  forceBenchmark = false,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';
  const [role, setRole] = useState<UserRole>(forceBenchmark ? 'system_auditor' : initialRole);
  const [showAuditTrail, setShowAuditTrail] = useState(initialRole !== 'patient' || forceBenchmark);
  const [copied, setCopied] = useState(false);

  // UCI Benchmark Runner State (PM-31)
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkRunResult | null>(() => {
    return forceBenchmark ? runUciBenchmark() : null;
  });
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setTimeout(() => {
      const result = runUciBenchmark();
      setBenchmarkResult(result);
      setIsRunningBenchmark(false);
    }, 200);
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            session_id: evaluation.zero_pii_session_id,
            timestamp: evaluation.audit_timestamp,
            algorithm_version: evaluation.algorithm_version,
            triage_tier: evaluation.triage_tier,
            action_code: evaluation.action_code,
            circuit_breaker_triggered: evaluation.circuit_breaker_triggered,
            triggered_rules: evaluation.triggered_rules,
            narrative: narrative || evaluation.summary_en,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `masar-amanah-audit-${evaluation.zero_pii_session_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const facilities = getFacilitiesForTier(evaluation.triage_tier);

  const getTierVisuals = (tier: TriageTier) => {
    switch (tier) {
      case 'TIER_1_EMERGENCY':
        return {
          title: t.tier1Title,
          badge: t.tier1Badge,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-400',
          textColor: 'text-rose-950',
          iconColor: 'text-rose-700',
          badgeBg: 'bg-rose-600 text-white',
          Icon: AlertOctagon,
        };
      case 'TIER_2_ANDROLOGY_SPECIALIST':
        return {
          title: t.tier2Title,
          badge: t.tier2Badge,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-950',
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-600 text-white',
          Icon: ShieldAlert,
        };
      case 'TIER_3_PRIMARY_CARE':
        return {
          title: t.tier3Title,
          badge: t.tier3Badge,
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-300',
          textColor: 'text-sky-950',
          iconColor: 'text-sky-600',
          badgeBg: 'bg-sky-600 text-white',
          Icon: AlertTriangle,
        };
      case 'TIER_4_LIFESTYLE':
      default:
        return {
          title: t.tier4Title,
          badge: t.tier4Badge,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-950',
          iconColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-700 text-white',
          Icon: CheckCircle2,
        };
    }
  };

  const visuals = getTierVisuals(evaluation.triage_tier);
  const TierIcon = visuals.Icon;

  const handleCopy = () => {
    const textToCopy = `MASAR AMANAH HEALTH REPORT (${evaluation.zero_pii_session_id})\nTriage Tier: ${evaluation.triage_tier}\nAction Code: ${evaluation.action_code}\nTimestamp: ${evaluation.audit_timestamp}\n\n${narrative || evaluation.summary_en}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const malaffiPayload = `https://malaffi.ae/interop/amanah?sid=${evaluation.zero_pii_session_id}&tier=${evaluation.triage_tier}&code=${evaluation.action_code}`;

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Printable Header with Pure SVG QR Code (UX-24 & PM-34) */}
      <div className="hidden print:flex items-center justify-between mb-6 border-b border-slate-300 pb-4 break-inside-avoid">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Masar Amanah Health (مسار أمانة)</h1>
          <p className="text-xs text-slate-600">
            Anonymous Clinical Triage Report • Zero-PII Session: {evaluation.zero_pii_session_id} • Date: {new Date().toLocaleDateString()}
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Engine: {evaluation.algorithm_version} • HL7 FHIR R4 Bundle • Malaffi Interoperability
          </p>
        </div>
        <SvgQrCode value={malaffiPayload} size={110} label="MALAFFI INTEROP QR" />
      </div>

      {/* Role / Perspective Switcher (PM-11..15) */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t.roleLabel}:</span>
        </span>
        <div className="inline-flex rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setRole('patient');
              setShowAuditTrail(false);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              role === 'patient'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.rolePatient}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('clinician_companion');
              setShowAuditTrail(true);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              role === 'clinician_companion'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t.roleClinician}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('system_auditor');
              setShowAuditTrail(true);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              role === 'system_auditor'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.roleAuditor}</span>
          </button>
        </div>
      </div>

      {/* Clinician Companion View Banner with SVG QR Code */}
      {role === 'clinician_companion' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold">
                {isAr
                  ? 'وضع رفيق الطبيب السريري: متوافق مع معايير HL7 FHIR R4 ومنظومة ملفي (Malaffi HIE)'
                  : 'Clinician Companion View: HL7 FHIR R4 RiskAssessment & Malaffi Ready'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isAr
                ? 'وثيقة مشفرة ومصنفة حسب معايير منظمة الصحة العالمية والجمعية الأمريكية لجراحة المسالك البولية، جاهزة للتحميل الفوري كحزمة FHIR.'
                : 'Standardized clinical evaluation ready for immediate electronic intake into Abu Dhabi Malaffi network.'}
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadFhirBundle(evaluation, input)}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-emerald-900 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export HL7 FHIR R4 Bundle</span>
              </button>
            </div>
          </div>
          <div className="shrink-0 bg-white p-2 rounded-xl border border-emerald-200">
            <SvgQrCode value={malaffiPayload} size={95} label="MALAFFI INTEROP" />
          </div>
        </div>
      )}

      {/* System Auditor View with 100-Profile UCI Fertility Benchmark Runner (PM-31) */}
      {role === 'system_auditor' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-xs text-emerald-300">
                {isAr
                  ? `مدقق النظام: خوارزمية ${evaluation.algorithm_version} • فحص الأمان القطعي: مؤكد`
                  : `System Auditor: Engine ${evaluation.algorithm_version} • Zero-PII Verified`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadFhirBundle(evaluation, input)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>FHIR R4</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* 100-Profile UCI Benchmark Runner Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>100-Profile UCI Fertility Benchmark Runner</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Validates clinical triage determinism, latency, and rule concordance against 100 synthetic profiles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningBenchmark ? 'animate-spin' : ''}`} />
                <span>{benchmarkResult ? 'Re-Run 100 Profiles' : 'Run 100-Profile Benchmark'}</span>
              </button>
            </div>

            {benchmarkResult && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Concordance</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">{benchmarkResult.concordanceRate}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Batch Latency</span>
                    <span className="font-mono font-bold text-amber-400 text-base">{benchmarkResult.executionTimeMs} ms</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Profiles</span>
                    <span className="font-mono font-bold text-white text-base">{benchmarkResult.totalProfiles}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Passed Rules Gate</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {benchmarkResult.concordantCount}/{benchmarkResult.totalProfiles}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                  <span className="text-slate-400">Distribution:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    Tier 1: {benchmarkResult.tierDistribution.TIER_1_EMERGENCY}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Tier 2: {benchmarkResult.tierDistribution.TIER_2_ANDROLOGY_SPECIALIST}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Tier 3: {benchmarkResult.tierDistribution.TIER_3_PRIMARY_CARE}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Tier 4: {benchmarkResult.tierDistribution.TIER_4_LIFESTYLE}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prominent Triage Tier Card */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border-2 ${visuals.borderColor} ${visuals.bgColor} shadow-sm space-y-4 relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0">
              <TierIcon className={`w-7 h-7 ${visuals.iconColor}`} />
            </div>
            <div>
              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${visuals.badgeBg}`}>
                {visuals.badge}
              </span>
              <h2 className={`text-xl sm:text-2xl font-black mt-1.5 ${visuals.textColor}`}>
                {visuals.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-2xs">
              ID: {evaluation.zero_pii_session_id}
            </span>
          </div>
        </div>

        <p className={`text-sm sm:text-base font-medium leading-relaxed ${visuals.textColor}`}>
          {isAr ? evaluation.summary_ar : evaluation.summary_en}
        </p>

        {/* Quick Action Code Pill */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">{isAr ? 'كود التوجيه السريري:' : 'Clinical Action Code:'}</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-300 font-bold text-slate-800">
            {evaluation.action_code}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {evaluation.algorithm_version}
          </span>
        </div>
      </div>

      {/* PM-32 & UX-22: Interactive 90-Day Spermatogenesis Recovery Simulator */}
      <RecoverySimulator
        baselineInput={input}
        baselineEvaluation={evaluation}
        language={language}
      />

      {/* Cultural Narrative Section (Gemini 2.5 Flash) */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t.geminiCompanionBadge}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'صياغة وقورة متوافقة مع الخصوصية الثقافية والأمانة الصحية'
                  : 'Empathetic, culturally grounded andrology guidance for the GCC'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => downloadFhirBundle(evaluation, input)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download HL7 FHIR R4 RiskAssessment Bundle"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>FHIR</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Full Audit Trail JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{t.exportJson}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedToast : t.copyReport}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.downloadDoctorSheet}</span>
            </button>
          </div>
        </div>

        {/* Narrative Text / Structured Loading Skeleton */}
        {isLoadingNarrative ? (
          <div className="py-6 space-y-5 animate-pulse" aria-busy="true" aria-label="Loading clinical narrative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-44 bg-slate-200 rounded-md" />
                <div className="h-3 w-64 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-1/3 bg-slate-200 rounded-md" />
              <div className="h-3 w-full bg-slate-100 rounded-md" />
              <div className="h-3 w-5/6 bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-1/4 bg-slate-200 rounded-md" />
              <div className="h-3 w-11/12 bg-slate-100 rounded-md" />
              <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
            </div>
          </div>
        ) : (
          <div>
            {narrative && <SafeNarrative content={narrative} isAr={isAr} />}
          </div>
        )}

        {/* PM-35 & UX-25: Constrained Follow-Up Question Chips */}
        <QuestionChips
          evaluation={evaluation}
          input={input}
          language={language}
        />
      </div>

      {/* Recommended Abu Dhabi Healthcare Facilities */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800" />
            <span>{t.careDirectoryTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.careDirectorySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {facilities.map((facility, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                facility.emergency
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isAr ? facility.name_ar : facility.name_en}
                  </h4>
                  <span className="text-xs text-slate-500 block">
                    {isAr ? facility.area_ar : facility.area_en}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    facility.emergency
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {isAr ? facility.badge_ar : facility.badge_en}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr ? facility.service_ar : facility.service_en}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${facility.phone}`}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{facility.phone}</span>
                </a>

                {facility.locationUrl && (
                  <a
                    href={facility.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-emerald-800 flex items-center gap-1 underline"
                  >
                    <span>{isAr ? 'الخريطة' : 'Map'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Deterministic Clinical Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.deterministicAuditTitle}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {evaluation.triggered_rules.length} {isAr ? 'قواعد مفعّلة' : 'Rules Triggered'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.auditBadge}
              </p>
            </div>
          </div>
          {showAuditTrail ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showAuditTrail && (
          <div className="p-4 sm:p-6 border-t border-slate-100 space-y-4 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 font-mono pb-2 border-b border-slate-200">
              <span>Timestamp: {evaluation.audit_timestamp}</span>
              <span>Engine: {evaluation.algorithm_version}</span>
              <span>Audit Hash: {evaluation.zero_pii_session_id}</span>
            </div>

            {evaluation.triggered_rules.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                {isAr ? 'لم يتم رصد أي اختلالات سريرية أو هبوط في معايير فحص النطاف.' : 'No clinical risk flags or WHO 6th edition threshold failures detected.'}
              </p>
            ) : (
              <div className="space-y-3">
                {evaluation.triggered_rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 shadow-2xs text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {isAr ? rule.title_ar : rule.title_en}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {rule.rule_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium uppercase">{t.measuredValue}:</span>
                        <span className="font-mono font-bold text-slate-800">{rule.measured_value || 'Present'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-medium uppercase">{t.thresholdLimit}:</span>
                        <span className="font-mono text-slate-700">{rule.threshold_reference || 'AUA/WHO standard'}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong className="text-slate-800">{t.rationale}: </strong>
                      {isAr ? rule.rationale_ar : rule.rationale_en}
                    </p>

                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      Source: {rule.guideline_source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discreet Print / Doctor Discussion Checklist */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'ورقة مناقشة الطبيب المعتمدة (قابلة للتصدير)' : 'Physician Discussion Sheet (Export Ready)'}</span>
            </h3>
            <p className="text-xs text-slate-300">
              {isAr
                ? 'وثيقة سريرية خالية من الهوية والاسم يمكنك إظهارها لطبيبك لتسريع التشخيص وتفادي تكرار التحاليل.'
                : 'A confidential, zero-PII summary designed to show your clinician, eliminating clinical friction.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadFhirBundle(evaluation, input)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>FHIR R4</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printSummary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restart / Memory Wipe Button */}
      <div className="pt-4 flex justify-center print:hidden">
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-2 transition-colors py-2 px-4 rounded-xl border border-transparent hover:border-rose-200 hover:bg-rose-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.restartSession} (Wipe Memory)</span>
        </button>
      </div>
    </div>
  );
};
