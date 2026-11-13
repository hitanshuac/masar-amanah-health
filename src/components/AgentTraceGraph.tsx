/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AgentTraceGraph — 5-Gate Deterministic Clinical Coordination Architecture
 * Based on Dr. Nance Elnaker's Inception42 Blueprint (Workshop #3, Slide 11 & Q&A 46:18, 49:47, 56:50)
 *
 * 5 Gates:
 *   Gate 1: Permission / Zero-PII Consent Gate (PASS / STOP)
 *   Gate 2: Sudden / Acute Red-Flag Safety Gate (PASS / STOP — Bypass downstream -> Urgent ER)
 *   Gate 3: Evidence Availability & Null Invariant Gate (PASS / FLAG_NULL — Unavailable stays null, never zero)
 *   Gate 4: Deterministic Multi-Guideline Scoring Gate (PASS — WHO 6th + AUA/ASRM + EAU rules)
 *   Gate 5: DECIDE-AI Clinician Approval & Autonomous Gate (WAIT / APPROVED / AUTONOMOUS_COACHING)
 */

import React, { useState } from 'react';
import {
  Shield,
  AlertOctagon,
  SearchCheck,
  Calculator,
  UserCheck,
  CheckCircle2,
  XOctagon,
  Clock,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  Info,
} from 'lucide-react';
import {
  GateStatus,
  GateDecision,
  TriageTier,
  EvidenceCompletenessIndex,
} from '../types/screening.ts';

interface AgentTraceGraphProps {
  gates: GateStatus[];
  triageTier: TriageTier;
  evidenceIndex: EvidenceCompletenessIndex;
  isClinicianMode?: boolean;
  language?: 'en' | 'ar';
}

function getDecisionTheme(decision: GateDecision) {
  switch (decision) {
    case 'PASS':
      return {
        badgeBg: 'bg-emerald-600 text-white',
        cardBg: 'bg-emerald-50/70 border-emerald-300',
        text: 'text-emerald-950',
        subtext: 'text-emerald-800',
        iconBg: 'bg-emerald-100 text-emerald-800',
        Icon: CheckCircle2,
        label: 'PASS',
      };
    case 'STOP':
      return {
        badgeBg: 'bg-rose-600 text-white',
        cardBg: 'bg-rose-50/80 border-rose-300',
        text: 'text-rose-950',
        subtext: 'text-rose-800',
        iconBg: 'bg-rose-100 text-rose-800',
        Icon: XOctagon,
        label: 'STOP',
      };
    case 'HOLD':
      return {
        badgeBg: 'bg-amber-600 text-white',
        cardBg: 'bg-amber-50/70 border-amber-300',
        text: 'text-amber-950',
        subtext: 'text-amber-800',
        iconBg: 'bg-amber-100 text-amber-800',
        Icon: AlertTriangle,
        label: 'HOLD',
      };
    case 'FLAG_NULL':
      return {
        badgeBg: 'bg-violet-600 text-white',
        cardBg: 'bg-violet-50/70 border-violet-300',
        text: 'text-violet-950',
        subtext: 'text-violet-800',
        iconBg: 'bg-violet-100 text-violet-800',
        Icon: Info,
        label: 'FLAG_NULL',
      };
    case 'WAIT':
      return {
        badgeBg: 'bg-sky-600 text-white',
        cardBg: 'bg-sky-50/70 border-sky-300',
        text: 'text-sky-950',
        subtext: 'text-sky-800',
        iconBg: 'bg-sky-100 text-sky-800',
        Icon: Clock,
        label: 'WAIT',
      };
  }
}

export const AgentTraceGraph: React.FC<AgentTraceGraphProps> = ({
  gates,
  triageTier,
  evidenceIndex,
  isClinicianMode = false,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const [signOffDecision, setSignOffDecision] = useState<'pending' | 'approved' | 'held'>('pending');

  const gateIcons = [Shield, AlertOctagon, SearchCheck, Calculator, UserCheck];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header with Inception42 Attribution & Honest Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>{isAr ? 'هندسة التنسيق القطعي خماسية البوابات' : '5-Gate Deterministic Coordination Architecture'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr
                  ? 'نموذج Inception42 (د. نانسي الناكر): خمس بوابات تحكم مسار القرار مع حفظ القيم المفقودة كـ null'
                  : 'Inception42 Blueprint (Dr. Nance Elnaker): 5 explicit gates + "Null Never Becomes Zero" invariant'}
              </p>
            </div>
          </div>
        </div>

        {/* Provenance Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
            Working in demo
          </span>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold border border-violet-300">
            Simulated in prototype
          </span>
        </div>
      </div>

      {/* Evidence Completeness & Confidence Index Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 font-mono font-black text-xs text-slate-800 shadow-2xs">
            {evidenceIndex.completenessPercent}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Evidence Completeness & Confidence Index
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  evidenceIndex.isEarlyRiskSignal
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {evidenceIndex.domainsPresent}/{evidenceIndex.domainsTotal} Domains Supplied
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {evidenceIndex.label}
            </p>
          </div>
        </div>

        {/* Invariant pill */}
        <div className="text-[10px] text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 max-w-xs">
          <span className="font-bold text-violet-900 block">Invariant (Slide 11):</span>
          "An unavailable value stays null; a missing value never becomes zero."
        </div>
      </div>

      {/* 5-Gate Step Flow Visualization */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {gates.map((gate, idx) => {
            const theme = getDecisionTheme(gate.decision);
            const GateIcon = gateIcons[idx] || Shield;
            const DecisionIcon = theme.Icon;

            return (
              <div
                key={gate.gate}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${theme.cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Gate {gate.gate}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${theme.badgeBg}`}
                    >
                      <DecisionIcon className="w-2.5 h-2.5" />
                      {theme.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                      <GateIcon className="w-3 h-3" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {gate.name}
                    </h4>
                  </div>

                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">
                    {gate.condition}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200/60 text-[9px] font-mono text-slate-700">
                  {gate.detail.length > 55 ? `${gate.detail.substring(0, 55)}…` : gate.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinician Review & Sign-Off Gate (Gate 5) — DECIDE-AI Simulation */}
      {isClinicianMode && triageTier !== 'TIER_4_LIFESTYLE' && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-800" />
              <h4 className="text-xs font-bold text-slate-900">
                Gate 5 Simulation: Clinician Review & Sign-Off (DECIDE-AI & WHO AI Ethics)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-sky-800 font-bold bg-white px-2 py-0.5 rounded border border-sky-300">
              Stage 10: Clinician Review Gate
            </span>
          </div>

          <p className="text-[11px] text-slate-700 leading-relaxed">
            Per <strong>DECIDE-AI</strong> guidelines (Nature Medicine / EQUATOR Network) and <strong>WHO AI Governance</strong>,
            autonomous AI cannot finalize clinical specialist referrals or invasive lab orders without explicit human clinician sign-off.
            Review the deterministic rule trace below and select an action:
          </p>

          {signOffDecision === 'pending' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSignOffDecision('approved')}
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Approve Referral & Lab Order</span>
              </button>
              <button
                type="button"
                onClick={() => setSignOffDecision('held')}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Hold for Lab Verification</span>
              </button>
            </div>
          )}

          {signOffDecision === 'approved' && (
            <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">Referral Plan Signed & Approved</span>
                  <span className="text-[11px] text-emerald-800">
                    Clinician sign-off authenticated. Malaffi HIE referral order dispatched to Abu Dhabi network.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignOffDecision('pending')}
                className="text-[10px] font-bold text-emerald-900 underline hover:text-emerald-700 cursor-pointer shrink-0"
              >
                Change Decision
              </button>
            </div>
          )}

          {signOffDecision === 'held' && (
            <div className="p-3 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-900 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 block">Referral Held for Repeat Semen Panel</span>
                  <span className="text-[11px] text-amber-800">
                    Held per WHO 6th Ed protocol: Confirmatory semen analysis (≥7 days abstinent interval) required.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignOffDecision('pending')}
                className="text-[10px] font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer shrink-0"
              >
                Change Decision
              </button>
            </div>
          )}
        </div>
      )}

      {/* Autonomous Coaching Cleared Callout for Tier 4 */}
      {triageTier === 'TIER_4_LIFESTYLE' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold block">Gate 5: Cleared for Autonomous Lifestyle Coaching</span>
            <span className="text-[11px] text-emerald-700">
              Deterministic gates 1–4 passed with 0 red flags or threshold failures. DECIDE-AI threshold clears this profile for self-guided health optimization.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

