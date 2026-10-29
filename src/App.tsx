/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { JudgeDemoBar, DemoPreset } from './components/JudgeDemoBar.tsx';
import { StepIndicator } from './components/StepIndicator.tsx';
import { WelcomeView } from './components/WelcomeView.tsx';
import { Step1Safety } from './components/Step1Safety.tsx';
import { Step2History } from './components/Step2History.tsx';
import { Step3Lifestyle } from './components/Step3Lifestyle.tsx';
import { Step4Results } from './components/Step4Results.tsx';
import { SafetyCircuitBreakerModal } from './components/SafetyCircuitBreakerModal.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { ScreeningInput, ClinicalEvaluationResult, Language } from './types/screening.ts';
import { evaluateScreening } from './lib/clinicalEngine.ts';
import { TRANSLATIONS } from './i18n/translations.ts';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const INITIAL_INPUT: ScreeningInput = {
  acutePain: false,
  painlessLump: false,
  age: 32,
  heightCm: 175,
  weightKg: 78,
  bmi: 25.5,
  steroidsTrt: false,
  undescendedTesticle: false,
  varicocele: false,
  mumpsOrchitis: false,
  sittingHours: 6,
  frequentHeat: false,
  tobaccoShisha: 'none',
  hasSemenReport: false,
  semenVolume: 2.2,
  semenConcentration: 25.0,
  semenMotility: 50.0,
  semenMorphology: 5.5,
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Welcome, 1..4 = Wizard steps
  const [input, setInput] = useState<ScreeningInput>(INITIAL_INPUT);
  const [evaluation, setEvaluation] = useState<ClinicalEvaluationResult | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isLoadingNarrative, setIsLoadingNarrative] = useState<boolean>(false);
  const [narrativeModel, setNarrativeModel] = useState<string>('gemini-2.5-flash');

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [forceBenchmark, setForceBenchmark] = useState<boolean>(false);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isCircuitBreakerModalOpen, setIsCircuitBreakerModalOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  // Keep HTML document dir and lang synchronized
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    if (isAr) {
      document.body.style.fontFamily = "'Cairo', 'Plus Jakarta Sans', sans-serif";
    } else {
      document.body.style.fontFamily = "'Plus Jakarta Sans', 'Cairo', sans-serif";
    }
  }, [language, isAr]);

  const handleInputChange = (updated: Partial<ScreeningInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...updated };
      // Check if user just checked a red flag in Step 1
      if (currentStep === 1 && (updated.acutePain === true || updated.painlessLump === true)) {
        setIsCircuitBreakerModalOpen(true);
      }
      return next;
    });
  };

  const handleResetSession = () => {
    setActivePresetId(null);
    setForceBenchmark(false);
    setInput({ ...INITIAL_INPUT });
    setEvaluation(null);
    setNarrative(null);
    setIsLoadingNarrative(false);
    setCurrentStep(0);
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setInput(preset.input);
    setForceBenchmark(false);

    if (preset.tier === 'TIER_1_EMERGENCY') {
      const evalResult = evaluateScreening(preset.input);
      setEvaluation(evalResult);
      setCurrentStep(4);
      setIsLoadingNarrative(false);
      setNarrative(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      executeClinicalTriage(preset.input);
    }
  };

  const handleTriggerBenchmark = () => {
    setActivePresetId(null);
    setForceBenchmark(true);
    if (!evaluation) {
      const evalResult = evaluateScreening(input);
      setEvaluation(evalResult);
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    // If on Step 1 and red flags are active, trigger the circuit breaker directly
    if (currentStep === 1 && (input.acutePain || input.painlessLump)) {
      triggerSafetyHalt();
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      // Execute Deterministic Clinical Rules Engine (Stage 3)
      executeClinicalTriage();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const triggerSafetyHalt = () => {
    setIsCircuitBreakerModalOpen(false);
    const evalResult = evaluateScreening(input);
    setEvaluation(evalResult);
    setCurrentStep(4);
    // Red flags immediately display deterministic emergency guidance with 0ms LLM latency
    setIsLoadingNarrative(false);
    setNarrative(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeClinicalTriage = async (customInput?: ScreeningInput) => {
    const targetInput = customInput || input;
    const evalResult = evaluateScreening(targetInput);
    setEvaluation(evalResult);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Stage 4: Stateless Agent Harness (Gemini 2.5 Flash Cultural Rephraser)
    setIsLoadingNarrative(true);
    setNarrative(null);

    try {
      const res = await fetch('/api/contextualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedEvaluationJson: evalResult,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setNarrative(data.narrative || null);
      setNarrativeModel(data.model || 'gemini-2.5-flash');
    } catch (err) {
      console.warn('Contextualization request error, fallback will be used:', err);
      // Even if network fails, the evaluation object itself contains complete fallback summaries
      setNarrative(
        isAr
          ? `### 1. نظرة عامة (Overview)
${evalResult.summary_ar}

### 2. الملاحظات السريرية (Clinical Observations)
- تم تقييم المؤشرات وفق الحدود المئوية لمنظمة الصحة العالمية WHO (الإصدار السادس 2021).
- القواعد السريرية المسجلة: ${evalResult.triggered_rules.map((r) => r.title_ar).join('، ') || 'لا توجد عوامل خطورة عالية'}.

### 3. مسار الرعاية الموصى به (Recommended Care Pathway)
- متابعة الحالة مع المنشأة الموصى بها في إمارة أبوظبي وفق كود التوجيه: ${evalResult.action_code}.

### 4. إرشادات وقائية يومية (Discreet Daily Wellness Steps)
- الحفاظ على التبريد الموضعي للصفن وتجنب الجلوس المطول لأكثر من ساعتين متواصلتين.
- الامتناع عن التبغ والشيشة وممارسة الرياضة المعتدلة بانتظام.

### 5. إخلاء مسؤولية طبي (Medical Disclaimer)
هذا التقرير فرز سريري استرشادي ولا يغني عن الاستشارة الطبية المباشرة.`
          : `### 1. Overview
${evalResult.summary_en}

### 2. Clinical Observations
- Evaluated against WHO 6th Edition (2021) lower reference limits and AUA guidelines.
- Triggered clinical markers: ${evalResult.triggered_rules.map((r) => r.title_en).join(', ') || 'No critical impairments detected'}.

### 3. Recommended Care Pathway
- Consult with the designated Abu Dhabi clinical facility according to action code: ${evalResult.action_code}.

### 4. Discreet Daily Wellness Steps
- Prioritize scrotal thermoregulation (break up prolonged seated bouts).
- Avoid heat exposure (saunas/hot baths) and support antioxidant intake.

### 5. Medical Disclaimer
This screening report is educational and does not constitute a formal diagnosis.`
      );
    } finally {
      setIsLoadingNarrative(false);
    }
  };

  const hasRedFlags = input.acutePain || input.painlessLump;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageToggle={(lang) => setLanguage(lang)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onResetSession={handleResetSession}
        showReset={currentStep > 0}
      />

      {/* R1/R2 Solid-Surface Judge Demo Bar (PM-31 & UX-21) */}
      <JudgeDemoBar
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        language={language}
        onTriggerBenchmark={handleTriggerBenchmark}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Step Progress Indicator (Visible in steps 1 to 4) */}
        {currentStep > 0 && (
          <div className="mb-6">
            <StepIndicator
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step <= currentStep) setCurrentStep(step);
              }}
              language={language}
              hasRedFlags={hasRedFlags}
            />
          </div>
        )}

        {/* Step Views */}
        <div className="flex-1">
          {currentStep === 0 && (
            <WelcomeView
              onStart={() => setCurrentStep(1)}
              language={language}
              onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            />
          )}

          {currentStep === 1 && (
            <Step1Safety
              input={input}
              onChange={handleInputChange}
              language={language}
            />
          )}

          {currentStep === 2 && (
            <Step2History
              input={input}
              onChange={handleInputChange}
              language={language}
            />
          )}

          {currentStep === 3 && (
            <Step3Lifestyle
              input={input}
              onChange={handleInputChange}
              language={language}
            />
          )}

          {currentStep === 4 && evaluation && (
            <Step4Results
              evaluation={evaluation}
              input={input}
              narrative={narrative}
              isLoadingNarrative={isLoadingNarrative}
              narrativeModel={narrativeModel}
              language={language}
              onReset={handleResetSession}
              forceBenchmark={forceBenchmark}
            />
          )}
        </div>

        {/* Wizard Navigation Footer (Steps 1 to 3) */}
        {currentStep >= 1 && currentStep <= 3 && (
          <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              <span>{t.backStep}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                currentStep === 1 && hasRedFlags
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 ring-2 ring-rose-300'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-800/20'
              }`}
            >
              <span>{currentStep === 3 ? t.runScreening : t.nextStep}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </main>

      {/* Safety Circuit Breaker Modal for Acute Pain / Testicular Mass */}
      <SafetyCircuitBreakerModal
        isOpen={isCircuitBreakerModalOpen}
        input={input}
        language={language}
        onDismiss={() => setIsCircuitBreakerModalOpen(false)}
        onConfirmProceedEmergency={triggerSafetyHalt}
      />

      {/* Zero-PII Privacy Architecture Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-auto print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">
              {isAr ? 'مسار أمانة لصحة الرجل' : 'Masar Amanah Health'}
            </span>
            <span>•</span>
            <span>{isAr ? 'مبادرة صحة المستقبل - جيتكس 2026' : 'GITEX 2026 Future Health Initiative'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isAr
              ? 'أداة فرز وقائية استرشادية معتمدة على معايير منظمة الصحة العالمية والجمعية الأمريكية لجراحة المسالك البولية'
              : 'Deterministic screening engine based on WHO 6th Edition (2021) & AUA Guidelines.'}
          </div>
        </div>
      </footer>
    </div>
  );
}
