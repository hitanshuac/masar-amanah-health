/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, BookOpen, X } from 'lucide-react';
import { ClinicalEvaluationResult, Language, ScreeningInput } from '../types/screening.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';

export type QuestionChipId =
  | 'hpg_recovery_timeline'
  | 'varicocele_microsurgery'
  | 'daman_thiqa_coverage'
  | 'scrotal_thermoregulation'
  | 'sperm_morphology_criteria'
  | 'emergency_scrotal_torsion'
  | 'testicular_mass_pathway'
  | 'metabolic_aromatization'
  | 'tobacco_dna_fragmentation'
  | 'andrology_consult_protocol';

export interface QuestionChipItem {
  id: QuestionChipId;
  question: string;
  answer: string;
  citation: string;
}

export interface QuestionChipsProps {
  evaluation: ClinicalEvaluationResult;
  input?: ScreeningInput;
  language: Language;
  onQuestionSelect?: (id: QuestionChipId | null) => void;
}

/**
 * Deterministically resolves 3-4 pre-vetted follow-up questions
 * tailored to active TriageTier and triggered clinical rules (PM-35 & UX-25).
 */
export function getTailoredQuestionIds(
  evaluation: ClinicalEvaluationResult,
  input?: ScreeningInput
): QuestionChipId[] {
  const triggeredRuleIds = new Set(evaluation.triggered_rules.map((r) => r.rule_id));
  const tier = evaluation.triage_tier;

  // Tier 1: Emergency & Urgent Fast-Track
  if (tier === 'TIER_1_EMERGENCY') {
    const isTorsion =
      evaluation.circuit_breaker_type === 'TORSION' ||
      triggeredRuleIds.has('RULE_EMERGENCY_ACUTE_SCROTAL_PAIN') ||
      Boolean(input?.acutePain);

    if (isTorsion) {
      return [
        'emergency_scrotal_torsion',
        'daman_thiqa_coverage',
        'andrology_consult_protocol',
        'scrotal_thermoregulation',
      ];
    } else {
      return [
        'testicular_mass_pathway',
        'daman_thiqa_coverage',
        'andrology_consult_protocol',
        'sperm_morphology_criteria',
      ];
    }
  }

  // Tier 2: Andrology Specialist Referral
  if (tier === 'TIER_2_ANDROLOGY_SPECIALIST') {
    const questions: QuestionChipId[] = [];

    if (triggeredRuleIds.has('RULE_EXOGENOUS_ANDROGEN_HPG_SUPPRESSION') || input?.steroidsTrt) {
      questions.push('hpg_recovery_timeline');
    }
    if (triggeredRuleIds.has('RULE_VARICOCELE_HYPERTHERMIA_ROS') || input?.varicocele) {
      questions.push('varicocele_microsurgery');
    }
    const hasSemenIssues =
      Array.from(triggeredRuleIds).some((id) => id.startsWith('RULE_WHO6_')) ||
      Boolean(input?.hasSemenReport);
    if (hasSemenIssues && !questions.includes('sperm_morphology_criteria')) {
      questions.push('sperm_morphology_criteria');
    }
    if (
      triggeredRuleIds.has('RULE_LIFESTYLE_SEDENTARY_HYPERTHERMIA') ||
      triggeredRuleIds.has('RULE_THERMAL_EXPOSURE_SCROTAL') ||
      (input?.sittingHours && input.sittingHours >= 8) ||
      input?.frequentHeat
    ) {
      questions.push('scrotal_thermoregulation');
    }
    if (
      triggeredRuleIds.has('RULE_OXIDATIVE_STRESS_TOBACCO_SHISHA') ||
      (input?.tobaccoShisha && input.tobaccoShisha !== 'none')
    ) {
      questions.push('tobacco_dna_fragmentation');
    }

    if (!questions.includes('daman_thiqa_coverage')) {
      questions.push('daman_thiqa_coverage');
    }
    if (!questions.includes('andrology_consult_protocol')) {
      questions.push('andrology_consult_protocol');
    }

    const fallbacks: QuestionChipId[] = [
      'hpg_recovery_timeline',
      'varicocele_microsurgery',
      'scrotal_thermoregulation',
      'sperm_morphology_criteria',
    ];
    for (const fb of fallbacks) {
      if (questions.length >= 4) break;
      if (!questions.includes(fb)) {
        questions.push(fb);
      }
    }

    return questions.slice(0, 4);
  }

  // Tier 3: Primary Care & Metabolic Workup
  if (tier === 'TIER_3_PRIMARY_CARE') {
    const questions: QuestionChipId[] = [];

    if (triggeredRuleIds.has('RULE_METABOLIC_BMI_AROMATIZATION') || (input?.bmi && input.bmi >= 30)) {
      questions.push('metabolic_aromatization');
    }
    if (
      triggeredRuleIds.has('RULE_OXIDATIVE_STRESS_TOBACCO_SHISHA') ||
      (input?.tobaccoShisha && input.tobaccoShisha !== 'none')
    ) {
      questions.push('tobacco_dna_fragmentation');
    }
    if (
      triggeredRuleIds.has('RULE_LIFESTYLE_SEDENTARY_HYPERTHERMIA') ||
      triggeredRuleIds.has('RULE_THERMAL_EXPOSURE_SCROTAL') ||
      (input?.sittingHours && input.sittingHours >= 8) ||
      input?.frequentHeat
    ) {
      questions.push('scrotal_thermoregulation');
    }

    questions.push('daman_thiqa_coverage');
    questions.push('andrology_consult_protocol');

    if (!questions.includes('scrotal_thermoregulation')) {
      questions.push('scrotal_thermoregulation');
    }

    return questions.slice(0, 4);
  }

  // Tier 4: Self-Directed Proactive Lifestyle
  const tier4Questions: QuestionChipId[] = [
    'scrotal_thermoregulation',
    'daman_thiqa_coverage',
  ];

  if (
    triggeredRuleIds.has('RULE_OXIDATIVE_STRESS_TOBACCO_SHISHA') ||
    (input?.tobaccoShisha && input.tobaccoShisha !== 'none')
  ) {
    tier4Questions.push('tobacco_dna_fragmentation');
  } else {
    tier4Questions.push('sperm_morphology_criteria');
  }

  tier4Questions.push('andrology_consult_protocol');
  return tier4Questions.slice(0, 4);
}

export const QuestionChips: React.FC<QuestionChipsProps> = ({
  evaluation,
  input,
  language,
  onQuestionSelect,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedId, setSelectedId] = useState<QuestionChipId | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tailoredIds = getTailoredQuestionIds(evaluation, input);

  const handleSelect = (id: QuestionChipId) => {
    if (selectedId === id) {
      setSelectedId(null);
      onQuestionSelect?.(null);
      return;
    }

    setIsLoading(true);
    setSelectedId(id);
    onQuestionSelect?.(id);

    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const selectedData = selectedId ? t.questionChips[selectedId] : null;

  return (
    <div
      className="pt-5 border-t border-slate-100 space-y-3 print:hidden"
      role="region"
      aria-label={t.questionChipsAriaLabel}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{t.questionChipsTitle}</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-400">
          {t.questionChipsSubtitle}
        </span>
      </div>

      {/* Pill buttons list (WCAG 2.1 44px touch targets, zero free-text) */}
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.questionChipsTitle}>
        {tailoredIds.map((id) => {
          const item = t.questionChips[id];
          if (!item) return null;
          const isSelected = selectedId === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              aria-pressed={isSelected}
              aria-expanded={isSelected}
              aria-controls={`chip-answer-${id}`}
              className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-medium transition-colors cursor-pointer border flex items-center justify-center text-start focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus:outline-hidden ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 border-slate-300'
              }`}
            >
              <span>{item.question}</span>
            </button>
          );
        })}
      </div>

      {/* Structured Skeleton or Selected Answer Card */}
      {isLoading ? (
        <div
          className="p-4 rounded-xl bg-slate-100 motion-safe:animate-pulse space-y-2 border border-slate-200"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-3.5 w-1/3 bg-slate-300 rounded" />
          <div className="h-3 w-5/6 bg-slate-200 rounded" />
          <div className="h-3 w-4/6 bg-slate-200 rounded" />
        </div>
      ) : selectedId && selectedData ? (
        <div
          id={`chip-answer-${selectedId}`}
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5 text-xs animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-emerald-950 text-sm leading-snug">
              {selectedData.question}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                onQuestionSelect?.(null);
              }}
              aria-label={t.questionChipsClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-slate-800 leading-relaxed text-xs">
            {selectedData.answer}
          </p>

          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-900">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span className="font-semibold">{t.questionChipsEvidenceSource}:</span>
            <span className="text-emerald-800">{selectedData.citation}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
