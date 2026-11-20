/**
 * Masar Amanah Health (مسار أمانة)
 * AI SOP Co-Pilot & Exception Assistant (Right-Column Workspace)
 *
 * Provides:
 * 1. Live Context Header (Active SOP badge, current SOAP step, readiness state)
 * 2. 1-Click Prompt-Injected Prefill Buttons (Zero typing required):
 *    - 🟢 [Prefill Expected SOP Step]
 *    - 🟠 [⚡ Outcome Differs from Prediction]
 *    - 🔵 [❓ Stuck at This Step — Generate Follow-Up Questions]
 * 3. Interactive Follow-Up Question Cards in Chat:
 *    - Brief SOP Action Directive (2 sentences max)
 *    - 3 Targeted Follow-Up Questions with clickable [Yes — Log to Chart] / [No — Rule Out] pills
 *    - Clicking pills appends facts to the SOAP chart & triggers Bayesian recalculation
 * 4. Zero-PII In-Memory Ephemeral Chat State
 */

import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  CornerDownLeft,
  FileText,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  SOPProtocol,
  SoapStepKey,
  FollowUpQuestion,
} from '../data/sopRegistry';

export interface LoggedFact {
  id: string;
  fact: string;
  timestamp: string;
  answer: 'YES' | 'NO';
  stepKey: SoapStepKey;
}

export interface SopCopilotSidebarProps {
  language: 'en' | 'ar';
  patientId: string;
  patientToken: string;
  activeSoapStep: SoapStepKey;
  activeSop: SOPProtocol;
  isStepReadyToAdvance: boolean;
  onApplyExpectedStep?: () => void;
  onTriggerOutcomeDiffers?: () => void;
  onTriggerStuck?: () => void;
  onLogClinicalFact: (fact: string, category: string, answer: 'YES' | 'NO', stepKey: SoapStepKey) => void;
  loggedFacts: LoggedFact[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  directive?: string;
  questions?: FollowUpQuestion[];
  answeredQuestions?: Record<string, 'YES' | 'NO'>;
  sopId?: string;
  stepKey?: SoapStepKey;
}

export function SopCopilotSidebar({
  language,
  patientId,
  patientToken,
  activeSoapStep,
  activeSop,
  isStepReadyToAdvance,
  onApplyExpectedStep,
  onTriggerOutcomeDiffers,
  onTriggerStuck,
  onLogClinicalFact,
  loggedFacts,
}: SopCopilotSidebarProps) {
  const isAr = language === 'ar';
  const stepConfig = activeSop.steps[activeSoapStep];

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExceptionHelperOpen, setIsExceptionHelperOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        text: isAr
          ? `مرحباً بك في المساعد الذكي لمسار أمانة. البروتوكول النشط حالياً: ${activeSop.titleAr} للمريض ${patientToken}. نحن في مرحلة (${activeSoapStep}). انقر فوق أحد أزرار التعبئة التلقائية أدناه للتوجيه الفوري.`
          : `Welcome to the Masar Amanah AI SOP Co-Pilot. Active protocol: ${activeSop.titleEn} for patient ${patientToken}. Currently at Step [${activeSoapStep}]. Use the 1-click prefill buttons below for instant guidance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        directive: isAr ? stepConfig.expectedDirectiveAr : stepConfig.expectedDirectiveEn,
        questions: stepConfig.followUpQuestions,
        answeredQuestions: {},
        sopId: activeSop.id,
        stepKey: activeSoapStep,
      },
    ];
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // When patient or step changes, inject contextual guidance if needed
  useEffect(() => {
    const welcomeText = isAr
      ? `انتقلت إلى الخطوة (${activeSoapStep}) من ${activeSop.id}. التوجيه السريري: ${stepConfig.expectedDirectiveAr}`
      : `Transitioned to Step [${activeSoapStep}] for ${activeSop.id}. Clinical directive: ${stepConfig.expectedDirectiveEn}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-step-${Date.now()}`,
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        directive: isAr ? stepConfig.expectedDirectiveAr : stepConfig.expectedDirectiveEn,
        questions: stepConfig.followUpQuestions,
        answeredQuestions: {},
        sopId: activeSop.id,
        stepKey: activeSoapStep,
      },
    ]);
  }, [patientId, activeSoapStep, activeSop.id]);

  // Handle clicking 1-Click Prefill: Expected Step
  const handlePrefillExpected = () => {
    const userPromptText = stepConfig.prefillExpectedPrompt;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-prefill-${Date.now()}`,
        sender: 'user',
        text: isAr ? `🟢 تأكيد إجراء الخطوة المتوقعة (${activeSoapStep})` : `🟢 Prefill Expected SOP Step [${activeSoapStep}]`,
        timestamp: timeStr,
      },
    ]);

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-resp-${Date.now()}`,
          sender: 'ai',
          text: isAr
            ? `تم التحقق من المعايير المتوقعة للخطوة (${activeSoapStep}). النتيجة المتوقعة: ${stepConfig.predictedOutcomeAr}`
            : `Verified expected criteria for Step [${activeSoapStep}]. Expected outcome: ${stepConfig.predictedOutcomeEn}`,
          directive: isAr ? stepConfig.expectedDirectiveAr : stepConfig.expectedDirectiveEn,
          questions: stepConfig.followUpQuestions,
          answeredQuestions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sopId: activeSop.id,
          stepKey: activeSoapStep,
        },
      ]);

      if (onApplyExpectedStep) {
        onApplyExpectedStep();
      }
    }, 150);
  };

  // Handle clicking 1-Click Prefill: Outcome Differs
  const handlePrefillDeviation = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-dev-${Date.now()}`,
        sender: 'user',
        text: isAr
          ? `🟠 ⚡ النتيجة تختلف عن التوقع السريري (${activeSoapStep})`
          : `🟠 ⚡ Outcome Differs from Prediction [${activeSoapStep}]`,
        timestamp: timeStr,
      },
    ]);

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const directive = isAr
        ? `تنبيه انحراف سريري: النتيجة المسجلة تختلف عن التوقع المعياري لـ ${activeSop.id}. ${stepConfig.unexpectedOutcomeAr} قم بطرح الأسئلة السريرية المستهدفة لتأكيد التحول التشخيصي.`
        : `Clinical Deviation Alert: Recorded outcome differs from standard ${activeSop.id} prediction. ${stepConfig.unexpectedOutcomeEn} Ask targeted follow-up questions to confirm diagnostic shift.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-resp-dev-${Date.now()}`,
          sender: 'ai',
          text: directive,
          directive,
          questions: stepConfig.followUpQuestions,
          answeredQuestions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sopId: activeSop.id,
          stepKey: activeSoapStep,
        },
      ]);

      if (onTriggerOutcomeDiffers) {
        onTriggerOutcomeDiffers();
      }
    }, 150);
  };

  // Handle clicking 1-Click Prefill: Stuck at Step
  const handlePrefillStuck = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-stuck-${Date.now()}`,
        sender: 'user',
        text: isAr
          ? `🔵 ❓ استفسار سريري: تعثر عند الخطوة (${activeSoapStep})`
          : `🔵 ❓ Stuck at This Step [${activeSoapStep}] — What should I ask?`,
        timestamp: timeStr,
      },
    ]);

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const directive = isAr
        ? `لحسم هذه البوابة السريرية، يرجى توجيه الأسئلة الثلاثة التالية للمريض وتسجيل الإجابات لتحديث اليقين البايزي فوراً.`
        : `To unblock this clinical gate, ask the patient these 3 targeted questions and log the responses to update Bayesian certainty.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-resp-stuck-${Date.now()}`,
          sender: 'ai',
          text: directive,
          directive,
          questions: stepConfig.followUpQuestions,
          answeredQuestions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sopId: activeSop.id,
          stepKey: activeSoapStep,
        },
      ]);

      if (onTriggerStuck) {
        onTriggerStuck();
      }
    }, 150);
  };

  // Handle user manual message submission
  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `user-msg-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: timeStr,
      },
    ]);
    setInputMessage('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const directive = isAr
        ? `تم تحليل الاستفسار وفق بروتوكول ${activeSop.titleAr}. الملاحظة: التزم بالمعايير الصارمة لمنظمة الصحة العالمية.`
        : `Query processed against ${activeSop.titleEn}. Directive: maintain strict concordance with WHO 6th Ed and AUA guidelines.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-resp-user-${Date.now()}`,
          sender: 'ai',
          text: directive,
          directive,
          questions: stepConfig.followUpQuestions,
          answeredQuestions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sopId: activeSop.id,
          stepKey: activeSoapStep,
        },
      ]);
    }, 200);
  };

  // Handle clicking question action pills ([Yes — Log to Chart] / [No — Rule Out])
  const handleAnswerQuestion = (
    messageId: string,
    question: FollowUpQuestion,
    answer: 'YES' | 'NO'
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            answeredQuestions: {
              ...(msg.answeredQuestions || {}),
              [question.id]: answer,
            },
          };
        }
        return msg;
      })
    );

    const factToLog = answer === 'YES' ? question.factIfYes : question.factIfNo;
    onLogClinicalFact(factToLog, question.category, answer, activeSoapStep);
  };

  return (
    <aside
      aria-label={isAr ? 'المساعد الذكي للبروتوكولات السريرية' : 'AI SOP Co-Pilot & Exception Assistant'}
      className="w-full flex flex-col bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-xl overflow-hidden sticky top-4 h-[calc(100vh-2.5rem)] text-slate-100"
    >
      {/* =====================================================================
          1. LIVE CONTEXT HEADER
         ===================================================================== */}
      <div className="bg-slate-950 p-3.5 sm:p-4 border-b border-slate-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {isAr ? 'المساعد الذكي للبروتوكول' : 'AI SOP Co-Pilot'}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-semibold">
                  XML SOP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[210px] sm:max-w-[260px]">
                {activeSop.id} • {patientToken}
              </p>
            </div>
          </div>

          {/* Readiness Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${
              isStepReadyToAdvance
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
            }`}
          >
            {isStepReadyToAdvance ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isAr ? 'جاهز للمتابعة' : 'READY TO ADVANCE'}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'بانتظار الإجراء' : 'WAITING FOR INPUT'}</span>
              </>
            )}
          </div>
        </div>

        {/* Protocol & SOAP Step Sub-bar */}
        <div className="flex items-center justify-between gap-2 text-[11px] bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-emerald-400 font-bold">{activeSop.id}:</span>
            <span className="truncate max-w-[170px] sm:max-w-[220px]">
              {isAr ? activeSop.titleAr.split(':')[1] || activeSop.titleAr : activeSop.titleEn.split(':')[1] || activeSop.titleEn}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px] border border-emerald-700/50">
            SOAP: {activeSoapStep}
          </span>
        </div>
      </div>

      {/* =====================================================================
          2. 1-CLICK PROMPT PREFILL & EXCEPTION ACCORDION
         ===================================================================== */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1 text-emerald-400">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{isAr ? 'الإجراء السريري الموصى به' : 'Primary SOP Action'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Guidance</span>
        </div>

        {/* Primary Recommended Action Card */}
        <button
          type="button"
          onClick={handlePrefillExpected}
          className="w-full text-left px-3.5 py-2.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900/90 text-emerald-100 border border-emerald-600/70 font-semibold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">
              {isAr
                ? `🟢 تأكيد إجراء الخطوة (${activeSoapStep}) المتوقع`
                : `🟢 Confirm Expected Step [${activeSoapStep}]`}
            </span>
          </div>
          <ArrowRight className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isAr ? 'rotate-180' : ''}`} />
        </button>

        {/* Accordion Toggle: Something unexpected or stuck? Open AI Exception Helper */}
        <div className="pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsExceptionHelperOpen(!isExceptionHelperOpen)}
            className="w-full py-1 px-1.5 flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>
              {isAr
                ? 'حالة غير متوقعة أو تعثر؟ فتح مساعد الاستثناءات السريرية ▾'
                : 'Something unexpected or stuck? Open AI Exception Helper ▾'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isExceptionHelperOpen ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          {isExceptionHelperOpen && (
            <div className="grid grid-cols-1 gap-1.5 pt-2 animate-fade-in">
              {/* Button 2: Outcome Differs */}
              <button
                type="button"
                onClick={handlePrefillDeviation}
                className="w-full text-left px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border border-amber-700/60 font-semibold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">
                    {isAr
                      ? `🟠 ⚡ النتيجة تختلف عن التوقع السريري`
                      : `🟠 ⚡ Outcome Differs from Prediction`}
                  </span>
                </div>
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>

              {/* Button 3: Stuck at Step -> Generate Follow-Up Questions */}
              <button
                type="button"
                onClick={handlePrefillStuck}
                className="w-full text-left px-3 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 text-sky-200 border border-sky-700/60 font-semibold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span className="truncate">
                    {isAr
                      ? `🔵 ❓ متعثر عند الخطوة — توليد أسئلة للمريض`
                      : `🔵 ❓ Stuck at Step — Generate Follow-Up Qs`}
                  </span>
                </div>
                <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          3. INTERACTIVE CHAT FEED WITH FOLLOW-UP QUESTIONS & ACTION PILLS
         ===================================================================== */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3.5 text-xs font-sans"
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 max-w-[92%] ${
                isAi ? 'self-start' : 'self-end'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                {isAi ? (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">
                      {isAr ? 'المساعد الذكي' : 'SOP Co-Pilot'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-300">
                      {isAr ? 'فني المختبر' : 'Technician'}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-2xl leading-relaxed text-xs ${
                  isAi
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                    : 'bg-emerald-700 text-white shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Brief SOP Action Directive (2 sentences max) */}
                {isAi && msg.directive && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-900 border border-emerald-600/40 text-emerald-300 font-medium flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-white block">
                        {isAr ? 'التوجيه السريري المباشر:' : 'Direct SOP Action Directive:'}
                      </span>
                      <span>{msg.directive}</span>
                    </div>
                  </div>
                )}

                {/* 3 Targeted Follow-Up Questions with Clickable [Yes / No] Pills */}
                {isAi && msg.questions && msg.questions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-400" />
                      <span>
                        {isAr
                          ? '3 أسئلة سريرية مستهدفة للمريض (سجل الإجابة):'
                          : '3 Targeted Clinical Follow-Up Questions (Record Answer):'}
                      </span>
                    </div>

                    {msg.questions.map((q, idx) => {
                      const answered = msg.answeredQuestions?.[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col gap-1.5"
                        >
                          <div className="text-[11px] font-semibold text-slate-200">
                            <span className="text-emerald-400 mr-1 font-bold">
                              Q{idx + 1}.
                            </span>
                            {isAr ? q.questionAr : q.questionEn}
                          </div>
                          <p className="text-[10px] text-slate-400 italic">
                            {isAr ? q.clinicalRationaleAr : q.clinicalRationaleEn}
                          </p>

                          {/* Action Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {/* Yes Button */}
                            <button
                              type="button"
                              onClick={() => handleAnswerQuestion(msg.id, q, 'YES')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                answered === 'YES'
                                  ? 'bg-emerald-600 text-white ring-1 ring-emerald-300'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isAr ? q.actionYesLabelAr : q.actionYesLabelEn}</span>
                            </button>

                            {/* No Button */}
                            <button
                              type="button"
                              onClick={() => handleAnswerQuestion(msg.id, q, 'NO')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                answered === 'NO'
                                  ? 'bg-rose-700 text-white ring-1 ring-rose-300'
                                  : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{isAr ? q.actionNoLabelAr : q.actionNoLabelEn}</span>
                            </button>

                            {answered && (
                              <span className="text-[10px] text-emerald-400 font-bold ml-auto flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {isAr ? 'تم التسجيل في المخطط ✓' : 'Logged to Chart ✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="self-start flex items-center gap-2 p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs">
              {isAr ? 'جاري تحليل البروتوكول السريري...' : 'Analyzing SOP protocol library...'}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================================
          4. LOGGED FINDINGS SUMMARY ACCORDION
         ===================================================================== */}
      {loggedFacts.length > 0 && (
        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 text-[11px] flex flex-col gap-1 max-h-28 overflow-y-auto shrink-0">
          <div className="font-bold text-slate-400 flex items-center justify-between text-[10px] uppercase">
            <span className="flex items-center gap-1 text-emerald-400">
              <FileText className="w-3 h-3" />
              {isAr ? 'حقائق سريرية تم تسجيلها من الأسئلة:' : 'Clinical Facts Logged from Questions:'}
            </span>
            <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-300">
              {loggedFacts.length}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {loggedFacts.slice(-3).map((f) => (
              <div
                key={f.id}
                className="text-[10px] text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800 flex items-start gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span className="truncate">{f.fact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. OPTIONAL MANUAL INPUT FOOTER
         ===================================================================== */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            isAr
              ? 'اكتب استفساراً سريرياً أو استخدم الأزرار أعلاه...'
              : 'Ask a clinical question or use 1-click buttons above...'
          }
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          aria-label={isAr ? 'إرسال' : 'Send'}
          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

