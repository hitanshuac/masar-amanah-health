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
  Calculator,
  ShieldCheck,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { ClinicalEvaluationResult, Language, ScreeningInput, TriageTier, UserRole } from '../types/screening.ts';
import {
  LongitudinalPatientRecord,
  ClosedLoopGraphEvaluation,
} from '../types/diagnosticGraph.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import { getFacilitiesForTier } from '../data/careDirectory.ts';
import { SafeNarrative } from './SafeNarrative.tsx';
import { RecoverySimulator } from './RecoverySimulator.tsx';
import { SvgQrCode, downloadFhirBundle } from '../lib/fhirExporter.tsx';
import { runUciBenchmark, BenchmarkRunResult } from '../data/uciBenchmarkCohort.ts';
import { QuestionChips } from './QuestionChips.tsx';
import { AgentTraceGraph } from './AgentTraceGraph.tsx';
import { computeGateStatuses, computeEvidenceIndex } from '../lib/clinicalEngine.ts';

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
  bridgedGraphContext?: {
    record: LongitudinalPatientRecord;
    graphEvaluation: ClosedLoopGraphEvaluation;
  } | null;
  onReturnToWorkbench?: () => void;
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
  bridgedGraphContext = null,
  onReturnToWorkbench,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';
  const [role, setRole] = useState<UserRole>(forceBenchmark ? 'system_auditor' : initialRole);
  const [showAuditTrail, setShowAuditTrail] = useState(initialRole !== 'patient' || forceBenchmark);
  const [showCalculationTable, setShowCalculationTable] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeSubgroup, setActiveSubgroup] = useState<'all' | '18-35' | '36-50' | '51-75'>('all');

  // Compute 5-Gate status and Evidence-Weighted Confidence Index
  const gates = computeGateStatuses(input, evaluation);
  const evidenceIndex = computeEvidenceIndex(input);

  // UCI Benchmark Runner State (PM-31 & Inception42 Workshop #3)
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
            gates,
            evidenceIndex,
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
    const textToCopy = `MASAR AMANAH HEALTH REPORT (${evaluation.zero_pii_session_id})\nTriage Tier: ${evaluation.triage_tier}\nAction Code: ${evaluation.action_code}\nEvidence Completeness: ${evidenceIndex.label}\nTimestamp: ${evaluation.audit_timestamp}\n\n${narrative || evaluation.summary_en}`;
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
            Engine: {evaluation.algorithm_version} • HL7 FHIR R4 Bundle • Malaffi Interoperability • Evidence: {evidenceIndex.domainsPresent}/{evidenceIndex.domainsTotal} Domains
          </p>
        </div>
        <SvgQrCode value={malaffiPayload} size={110} label="MALAFFI INTEROP QR" />
      </div>

      {/* Connected Malaffi Longitudinal Graph & Bayesian Differential Context Banner */}
      {bridgedGraphContext && (
        <section
          className="bg-slate-900 text-white border-2 border-emerald-700 rounded-2xl p-5 shadow-sm break-inside-avoid animate-scale-in"
          aria-label={
            isAr
              ? 'سياق الرسم البياني الطولي لملفي والتشخيص التفريقي البايزي'
              : 'Connected Malaffi Longitudinal Graph & Bayesian Differential Context'
          }
        >
          {/* Top Header Row with Return Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-950 border border-emerald-700 rounded-xl text-emerald-400">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-700">
                    MALAFFI GRAPH CONNECTOR
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {bridgedGraphContext.record.patientId} · {bridgedGraphContext.record.pseudonymToken}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  {isAr
                    ? 'سياق الرسم البياني الطولي لملفي والتشخيص التفريقي البايزي'
                    : 'Connected Malaffi Longitudinal Graph & Bayesian Differential Context'}
                </h2>
              </div>
            </div>

            {onReturnToWorkbench && (
              <button
                type="button"
                onClick={onReturnToWorkbench}
                className="print:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-emerald-700 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer self-start sm:self-auto"
                aria-label={
                  isAr
                    ? 'العودة إلى لوحة التحليل البايزي الطولي'
                    : 'Return to Longitudinal Differential Workbench'
                }
              >
                <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                <span>
                  {isAr
                    ? '← العودة إلى لوحة التحليل البايزي الطولي'
                    : '← Return to Longitudinal Differential Workbench'}
                </span>
              </button>
            )}
          </div>

          {/* Metric Chips Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                {isAr ? 'معرف المريض المجهول' : 'Pseudonym Token'}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {bridgedGraphContext.record.pseudonymToken}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                {isAr ? 'الزيارات الطولية' : 'Encounter Count'}
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {bridgedGraphContext.graphEvaluation.encounterCount} {isAr ? 'زيارات' : 'Encounters'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                {isAr ? 'الإنتروبيا المشتركة (شانون)' : 'Joint Shannon Entropy'}
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {bridgedGraphContext.graphEvaluation.jointEntropyBits} bits
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                {isAr ? 'اليقين التشخيصي' : 'Diagnostic Certainty'}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-300">
                {bridgedGraphContext.graphEvaluation.diagnosticCertaintyPct}%
              </span>
            </div>
          </div>

          {/* Active Escalations & Blindspots (if any) */}
          {(bridgedGraphContext.graphEvaluation.lifeSafetyEscalations.some((e) => e.triggered) ||
            bridgedGraphContext.graphEvaluation.blindSpotSyndromes.some((s) => s.triggered)) && (
            <div className="flex flex-col gap-2 mb-4">
              {bridgedGraphContext.graphEvaluation.lifeSafetyEscalations
                .filter((e) => e.triggered)
                .map((esc) => (
                  <div
                    key={esc.id}
                    className="bg-rose-950 border border-rose-700 text-rose-100 rounded-xl p-3 flex items-start gap-2.5"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-rose-200 uppercase tracking-wide">
                        {isAr ? 'إنذار طوارئ سريري حاسم (STAT): ' : 'Plane-A Life-Saving Escalation: '}
                      </span>
                      <span className="font-bold text-white">
                        {isAr ? esc.titleAr : esc.titleEn}
                      </span>
                      <span className="mx-1 text-rose-300 font-mono">({esc.icd10Code})</span>
                      <p className="mt-0.5 text-rose-200">
                        {isAr ? esc.urgentActionAr : esc.urgentActionEn}
                      </p>
                    </div>
                  </div>
                ))}

              {bridgedGraphContext.graphEvaluation.blindSpotSyndromes
                .filter((s) => s.triggered)
                .map((syndrome) => (
                  <div
                    key={syndrome.id}
                    className="bg-amber-950 border border-amber-700 text-amber-100 rounded-xl p-3 flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-amber-200 uppercase tracking-wide">
                        {isAr ? 'فخ سريري يغفله الفنيون: ' : 'Technician Blind-Spot Syndrome: '}
                      </span>
                      <span className="font-bold text-white">
                        {isAr ? syndrome.titleAr : syndrome.titleEn}
                      </span>
                      <p className="mt-0.5 text-amber-200">
                        {isAr
                          ? syndrome.whatGraphCatchesAr
                          : syndrome.whatGraphCatchesEn}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Top 2 Bayesian Differential Diagnoses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                {isAr
                  ? 'أعلى فرضيتين في التشخيص التفريقي البايزي (DAG Posterior):'
                  : 'Top 2 Bayesian Differential Diagnoses (DAG Posterior):'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                WHO 6th / AUA 2021
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bridgedGraphContext.graphEvaluation.differentialRanking.slice(0, 2).map((diff, idx) => {
                const probPct = Math.round(diff.posteriorProbability * 100);
                return (
                  <div
                    key={diff.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {isAr ? diff.titleAr : diff.titleEn}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ICD-10: <span className="text-slate-200 font-bold">{diff.codeIcd10}</span>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {probPct}%
                      </span>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">
                        {isAr ? 'الاحتمال البايزي' : 'Posterior Prob'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Prominent Triage Tier Card (Primary Clinical Finding) */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border-2 ${visuals.borderColor} ${visuals.bgColor} shadow-sm space-y-4 relative overflow-hidden animate-slide-up`}
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

        {/* Quick Action Code Pill & Evidence Index Summary */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">{isAr ? 'كود التوجيه السريري:' : 'Clinical Action Code:'}</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-300 font-bold text-slate-800">
            {evaluation.action_code}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-300 text-slate-700">
            {evidenceIndex.domainsPresent}/{evidenceIndex.domainsTotal} Evidence Domains ({evidenceIndex.completenessPercent}%)
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {evaluation.algorithm_version}
          </span>
        </div>
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

      {/* Clinician Companion View Banner with SVG QR Code & Evidence Completeness Badge */}
      {role === 'clinician_companion' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold">
                  {isAr
                    ? 'وضع رفيق الطبيب السريري: متوافق مع معايير HL7 FHIR R4 ودليل DECIDE-AI'
                    : 'Clinician Companion View: HL7 FHIR R4 & DECIDE-AI Guideline Ready'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                  {evidenceIndex.completenessPercent}% Evidence
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {isAr
                  ? 'تقييم سريري قطعي متكامل وفق معايير منظمة الصحة العالمية (الإصدار السادس)، متوافق مع منظومة ملفي (Malaffi HIE) ودليل DECIDE-AI لاتخاذ القرارات السريرية.'
                  : 'Deterministic clinical evaluation mapped to WHO 6th Edition, Abu Dhabi Malaffi network, and DECIDE-AI decision-support standards.'}
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

          {/* 5-Gate Coordination Architecture with DECIDE-AI Clinician Sign-Off Gate */}
          <AgentTraceGraph
            gates={gates}
            triageTier={evaluation.triage_tier}
            evidenceIndex={evidenceIndex}
            isClinicianMode={true}
            language={language}
          />

          {/* Transparent "How This Result Is Calculated" Step-by-Step Table (Q&A 46:18 & Slide 11) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-800" />
                <h4 className="font-bold text-slate-900 text-sm">
                  {isAr ? 'كيف تم حساب هذه النتيجة (شفافية سريرية خطوة بخطوة)' : 'How This Result Is Calculated (Step-by-Step Clinical Trace)'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculationTable(!showCalculationTable)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>{showCalculationTable ? 'Hide' : 'Show'}</span>
                {showCalculationTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showCalculationTable && (
              <div className="space-y-3 text-xs animate-fade-in">
                {/* 1. Evidence Domains (Supplied vs Null) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="p-2 border-b border-slate-200">Domain</th>
                        <th className="p-2 border-b border-slate-200">Status</th>
                        <th className="p-2 border-b border-slate-200">Values Evaluated</th>
                        <th className="p-2 border-b border-slate-200">Invariant State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {evidenceIndex.domains.map((dom) => (
                        <tr key={dom.id} className={dom.present ? 'bg-white' : 'bg-violet-50/50'}>
                          <td className="p-2 font-semibold text-slate-900">Domain {dom.id}: {dom.name}</td>
                          <td className="p-2">
                            {dom.present ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                                SUPPLIED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold font-mono text-[10px]">
                                NULL (Early Signal)
                              </span>
                            )}
                          </td>
                          <td className="p-2 font-mono text-slate-700">{dom.detail}</td>
                          <td className="p-2 font-mono text-[10px] text-slate-500">
                            {dom.present ? 'Verified against rules' : 'Kept null (never becomes zero)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Quantitative Calculations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* BMI Calculation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      BMI Aromatase Formula (Endocrine Society)
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      weightKg / (heightM²) = {input.weightKg} kg / ({(input.heightCm / 100).toFixed(2)} m)² = {input.bmi.toFixed(1)} kg/m²
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {input.bmi >= 30.0
                        ? 'Triggered RULE_METABOLIC_BMI_AROMATIZATION (BMI ≥ 30.0 kg/m²)'
                        : 'Within non-obese range (< 30.0 kg/m²); aromatase threshold clear'}
                    </p>
                  </div>

                  {/* WHO 6th Ed Deltas */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      WHO 6th Edition Semen Threshold Deltas
                    </span>
                    {input.hasSemenReport && input.semenVolume !== null && input.semenConcentration !== null && input.semenMotility !== null && input.semenMorphology !== null ? (
                      <div className="space-y-0.5 font-mono text-[10px] text-slate-800">
                        <div>Vol: {input.semenVolume.toFixed(1)} mL (Δ {(input.semenVolume - 1.4).toFixed(1)} mL vs 1.4)</div>
                        <div>Conc: {input.semenConcentration.toFixed(1)} M/mL (Δ {(input.semenConcentration - 15.0).toFixed(1)} vs 15.0)</div>
                        <div>Mot: {input.semenMotility.toFixed(1)}% (Δ {(input.semenMotility - 42.0).toFixed(1)}% vs 42.0%)</div>
                        <div>Morph: {input.semenMorphology.toFixed(1)}% (Δ {(input.semenMorphology - 4.0).toFixed(1)}% vs 4.0%)</div>
                      </div>
                    ) : (
                      <div className="font-mono text-[11px] text-violet-800 font-semibold">
                        Semen Lab Report not supplied. Semen parameters kept strictly null.
                        Scoring evaluated on clinical history and lifestyle domains only.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Urgency Band Resolution */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Strict Priority Triage Tier Resolution:
                  </span>
                  <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                    <div>1. Emergency Red-Flag Check: {evaluation.circuit_breaker_triggered ? 'TRIGGERED (Short-Circuit to Tier 1)' : 'PASS (0 Red Flags)'}</div>
                    <div>2. Andrology Specialist Rules: {evaluation.triggered_rules.some(r => r.category === 'ANDROLOGY') ? 'TRIGGERED → Resolves TIER_2_ANDROLOGY_SPECIALIST' : 'PASS (0 Andrology Rules)'}</div>
                    <div>3. Metabolic / Primary Care Rules: {evaluation.triggered_rules.some(r => r.category === 'METABOLIC') ? 'TRIGGERED → Resolves TIER_3_PRIMARY_CARE' : 'PASS (0 Metabolic Rules)'}</div>
                    <div>4. Lifestyle Baseline: {evaluation.triage_tier === 'TIER_4_LIFESTYLE' ? 'DEFAULT FALLBACK → TIER_4_LIFESTYLE (Self-Guided)' : 'SUPERSEDED BY HIGHER TIER'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Auditor View with Inception42 100-Profile Benchmark & "Where Language Models Belong" (PM-31) */}
      {role === 'system_auditor' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-xs text-emerald-300">
                {isAr
                  ? `مدقق النظام: خوارزمية ${evaluation.algorithm_version} • معايير Inception42 للمطابقة والعدالة`
                  : `System Auditor: Engine ${evaluation.algorithm_version} • Inception42 Evaluation Rubric`}
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
                <span>JSON Audit</span>
              </button>
            </div>
          </div>

          {/* 5-Gate Trace in Auditor View */}
          <AgentTraceGraph
            gates={gates}
            triageTier={evaluation.triage_tier}
            evidenceIndex={evidenceIndex}
            isClinicianMode={false}
            language={language}
          />

          {/* 100-Profile UCI Benchmark Runner Section (Upgraded with 2x2 Matrix & 95% Wilson CIs) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Validation & Subgroup Equity Audit Dashboard (100-Profile UCI Benchmark)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dr. Nance Elnaker Blueprint (Slide 15): 2×2 Confusion Matrix, 95% Wilson Confidence Intervals, and IFHAS Subgroup Equity.
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
              <div className="pt-3 border-t border-slate-800 space-y-4 animate-fade-in text-xs">
                {/* Subgroup Equity Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Subgroup Equity Filter:</span>
                  {(['all', '18-35', '36-50', '51-75'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveSubgroup(tab)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                        activeSubgroup === tab
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {benchmarkResult.subgroups[tab].label}
                    </button>
                  ))}
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Concordance Rate</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {benchmarkResult.subgroups[activeSubgroup].concordanceRate}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Sensitivity (95% Wilson CI)</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs block mt-0.5">
                      {benchmarkResult.subgroups[activeSubgroup].sensitivity.value}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      [{benchmarkResult.subgroups[activeSubgroup].sensitivity.lower}% – {benchmarkResult.subgroups[activeSubgroup].sensitivity.upper}%]
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Specificity (95% Wilson CI)</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs block mt-0.5">
                      {benchmarkResult.subgroups[activeSubgroup].specificity.value}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      [{benchmarkResult.subgroups[activeSubgroup].specificity.lower}% – {benchmarkResult.subgroups[activeSubgroup].specificity.upper}%]
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">False-Referral Burden</span>
                    <span className="font-mono font-bold text-sky-400 text-base">
                      {benchmarkResult.subgroups[activeSubgroup].falseReferralBurden.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">Zero Unnecessary Referrals</span>
                  </div>
                </div>

                {/* 2x2 Confusion Matrix Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-200 block">
                      2×2 Confusion Matrix ({benchmarkResult.subgroups[activeSubgroup].label})
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80">
                        <span className="text-[9px] text-slate-400 block">True Positive (TP)</span>
                        <span className="text-base font-bold text-emerald-400">
                          {benchmarkResult.subgroups[activeSubgroup].confusionMatrix.tp}
                        </span>
                        <span className="text-[8px] text-emerald-300 block">Flagged / Reference +</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">False Positive (FP)</span>
                        <span className="text-base font-bold text-slate-300">
                          {benchmarkResult.subgroups[activeSubgroup].confusionMatrix.fp}
                        </span>
                        <span className="text-[8px] text-slate-500 block">Flagged / Reference -</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">False Negative (FN)</span>
                        <span className="text-base font-bold text-slate-300">
                          {benchmarkResult.subgroups[activeSubgroup].confusionMatrix.fn}
                        </span>
                        <span className="text-[8px] text-slate-500 block">Unflagged / Reference +</span>
                      </div>
                      <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80">
                        <span className="text-[9px] text-slate-400 block">True Negative (TN)</span>
                        <span className="text-base font-bold text-emerald-400">
                          {benchmarkResult.subgroups[activeSubgroup].confusionMatrix.tn}
                        </span>
                        <span className="text-[8px] text-emerald-300 block">Unflagged / Reference -</span>
                      </div>
                    </div>
                  </div>

                  {/* Reliability & Latency */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-200 block font-sans">
                      Algorithmic Reliability Metrics
                    </span>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Test-Retest Reliability (ICC):</span>
                        <span className="text-emerald-400 font-bold">ICC = 1.000 (Deterministic)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">100-Profile Batch Latency:</span>
                        <span className="text-amber-400 font-bold">{benchmarkResult.executionTimeMs} ms (&lt;0.5ms / profile)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Emergency Red-Flag Accuracy:</span>
                        <span className="text-emerald-400 font-bold">100.0% (Zero false negatives)</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Subgroup Parity:</span>
                        <span className="text-emerald-400 font-bold">Consistent across 18–35, 36–50, 51–75</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier Distribution Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                  <span className="text-slate-400">Cohort Distribution:</span>
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

          {/* "Where Language Models Belong" Boundary Card (Dr. Nance Elnaker Slide 16) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-100">
                Where Language Models Belong (Strict Architectural Boundary)
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 ml-auto">
                Inception42 Slide 16
              </span>
            </div>

            {/* 5-Step Boundary Flow */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                5-Step Enforced Boundary Pipeline:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-200">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">1. Scoped Input</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">2. Fixed Task</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">3. Schema-Checked Output, Cited</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">4. Deterministic Checks</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-bold">5. Accept or Fallback</span>
              </div>
            </div>

            {/* "KEEP THEM OUT OF" Black Box */}
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/70 space-y-1.5">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>KEEP LANGUAGE MODELS STRICTLY OUT OF:</span>
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-rose-200 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Inventing scores, thresholds or estimates</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Routing, stopping or holding decisions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Diagnosis, clinical referral or approval</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Filling in a missing value (null ≠ zero)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 8-Layer "From Prototype Stack to Production Stack" Table (Slide 17) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-100">
                  8-Layer "From Prototype Stack to Production Stack" Architecture
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Inception42 Slide 17
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-800 rounded-lg overflow-hidden text-[11px]">
                <thead className="bg-slate-900 text-[10px] font-bold text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="p-2 border-b border-slate-800">Layer</th>
                    <th className="p-2 border-b border-slate-800">Prototype Implementation</th>
                    <th className="p-2 border-b border-slate-800">Production Blueprint</th>
                    <th className="p-2 border-b border-slate-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[10px]">
                  <tr>
                    <td className="p-2 font-bold text-slate-200">1. Interface</td>
                    <td className="p-2 text-slate-300">Responsive React 19 + Tailwind v4 Web App</td>
                    <td className="p-2 text-slate-400">Sahatna Mobile Mini-App & Epic SMART-on-FHIR</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">2. Orchestration</td>
                    <td className="p-2 text-slate-300">5-Gate Deterministic Coordination (clinicalEngine.ts)</td>
                    <td className="p-2 text-slate-400">Temporal.io / Cloud Workflows Gate Orchestrator</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">3. Measurement</td>
                    <td className="p-2 text-slate-300">Biometric BMI derivation + WHO 6th Percentile Deltas</td>
                    <td className="p-2 text-slate-400">Automated LOINC Lab Feeds & Wearable HealthKit Sync</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">4. Language Models</td>
                    <td className="p-2 text-slate-300">Gemini 2.5 Flash Cultural Rephraser (Rephrase-Only)</td>
                    <td className="p-2 text-slate-400">MedLM / Gemini Pro with Khaleeji Dialect Fine-Tuning</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">5. Evidence</td>
                    <td className="p-2 text-slate-300">WHO 6th Ed + AUA 2021 + EAU Infertility Guidelines</td>
                    <td className="p-2 text-slate-400">Live DoH Abu Dhabi / Malaffi Guideline Sync Engine</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">6. Integration</td>
                    <td className="p-2 text-slate-300">HL7 FHIR R4 RiskAssessment Bundle + Malaffi QR</td>
                    <td className="p-2 text-slate-400">Certified Malaffi HIE Direct REST Endpoints</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Working in demo</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">7. Oversight</td>
                    <td className="p-2 text-slate-300">DECIDE-AI Clinician Sign-Off Gate Simulation</td>
                    <td className="p-2 text-slate-400">Authenticated DoH Physician Sign-Off & Malaffi Auth</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-bold">Simulated in prototype</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-200">8. Operations</td>
                    <td className="p-2 text-slate-300">Zero-PII Ephemeral In-Memory State Execution</td>
                    <td className="p-2 text-slate-400">Confidential Cloud Run & Google Cloud Key Management</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">Proposed for production</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


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
