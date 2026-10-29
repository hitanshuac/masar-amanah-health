/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

const VALID_TIERS = [
  'TIER_1_EMERGENCY',
  'TIER_2_ANDROLOGY_SPECIALIST',
  'TIER_3_PRIMARY_CARE',
  'TIER_4_LIFESTYLE',
];

const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, // Phone
  /\b784-?\d{4}-?\d{7}-?\d{1}\b/g, // UAE Emirates ID
  /\b(sk|pk|api|key|token)[-_][a-zA-Z0-9]{16,}\b/gi, // API Keys
];

export function sanitizeAndRedactPii(text: string): string {
  let sanitized = text;
  for (const pattern of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

export async function handleContextualize(body: any): Promise<{ narrative: string; model: string }> {
  // ENG-4: Strict input validation layer
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request body: expected JSON object');
  }

  const { verifiedEvaluationJson, language = 'en' } = body;

  if (!verifiedEvaluationJson || typeof verifiedEvaluationJson !== 'object') {
    throw new ValidationError('Missing or invalid verifiedEvaluationJson in payload');
  }

  if (!VALID_TIERS.includes(verifiedEvaluationJson.triage_tier)) {
    throw new ValidationError(`Invalid triage_tier: received '${verifiedEvaluationJson.triage_tier}'`);
  }

  if (!Array.isArray(verifiedEvaluationJson.triggered_rules)) {
    throw new ValidationError('triggered_rules must be an array');
  }

  const validLang = language === 'ar' ? 'ar' : 'en';

  // Safety check: Red flags (Tier 1) should not rely on generative LLM
  if (verifiedEvaluationJson.triage_tier === 'TIER_1_EMERGENCY') {
    const emergencyFallback = validLang === 'ar'
      ? `### 1. نظرة عامة (Overview)
تنبيه سريري فوري ذو أولوية قصوى: تشير المؤشرات المسجلة إلى وجود علامة سريرية تتطلب تقييماً طبياً عاجلاً وفورياً.

### 2. الملاحظات السريرية (Clinical Observations)
- تم تفعيل بروتوكول السلامة الطارئ لوجود أعراض حادة تتطلب استبعاد الحالات الجراحية المستعجلة (مثل التواء الخصية أو الكتل النسيجية الحادة).
- التقييم الدوبلري والفحص المباشر خلال الساعات الأولى يعد أمراً حاسماً للحفاظ على السلامة الوظيفية والنسيجية.

### 3. مسار الرعاية الموصى به (Recommended Care Pathway)
- التوجه فوراً وبشكل مباشر إلى أقرب قسم طوارئ متخصص (مثل مدينة الشيخ شخبوط الطبية أو كليفلاند كلينك أبوظبي).
- نقاط للنقاش مع الطبيب: وقت بداية الألم بدقة، أي إشعاع للألم، وطلب فحص بالموجات فوق الصوتية الدوبلرية عاجلاً.

### 4. إرشادات وقائية يومية (Discreet Daily Wellness Steps)
- التوقف عن أي نشاط بدني شاق فوراً وتجنب تناول الطعام أو المسكنات القوية قبل التقييم الطبي تحسباً للحاجة إلى تدخل عاجل.

### 5. إخلاء مسؤولية طبي (Medical Disclaimer)
هذا التقييم أداة فرز وقائية أولية ولا يغني عن الفحص الطبي المباشر في أقسام الطوارئ المعتمدة في دولة الإمارات العربية المتحدة.`
      : `### 1. Overview
CRITICAL CLINICAL ALERT: The indicators registered require immediate, urgent in-person medical evaluation without delay.

### 2. Clinical Observations
- Emergency safety protocol activated due to acute scrotal symptoms that necessitate ruling out surgical emergencies (such as testicular torsion or acute tissue masses).
- Urgent Doppler ultrasonography within early salvage windows is critical to preserve tissue viability.

### 3. Recommended Care Pathway & Doctor Discussion Points
- Present immediately to an Emergency Department (such as Sheikh Shakhbout Medical City SSMC or Cleveland Clinic Abu Dhabi).
- Discussion points: Precise onset time, pain severity progression, request immediate testicular Doppler ultrasound.

### 4. Discreet Daily Wellness Steps
- Rest immediately, avoid vigorous activity, and do not take heavy oral analgesics or food prior to surgical evaluation.

### 5. Medical Disclaimer
This assessment is an educational screening triage engine and does NOT constitute a formal medical diagnosis or replace immediate emergency care.`;

    return { narrative: emergencyFallback, model: 'safety_circuit_breaker_direct' };
  }

  // System Prompt matching HANDOVER.md specification
  const systemInstruction = `You are Masar Amanah Health's Clinical Communication Companion, an empathetic, dignified, and culturally grounded healthcare communicator for men in the GCC and UAE.

STRICT OPERATING CONSTRAINTS:
1. NEVER alter, upgrade, or downgrade the provided 'triage_tier'.
2. DO NOT invent diagnoses, lab figures, or medications not present in the payload.
3. Frame reproductive health through cultural dignity (Amanah), proactive wellness, and positive empowerment.
4. Output must be in ${validLang === 'ar' ? 'Modern Standard Arabic (العربية الفصحى)' : 'clear, compassionate English'}.
5. Do NOT prescribe pharmaceutical dosages. Reiterate that this is an educational screening assessment, not a formal medical diagnosis.
6. You MUST structure the response into exactly these 5 sections using '### 1.', '### 2.', '### 3.', '### 4.', '### 5.':
   1. Overview
   2. Clinical Observations
   3. Recommended Care Pathway & Doctor Discussion Points
   4. Discreet Daily Wellness Steps
   5. Medical Disclaimer`;

  const serializedEvaluation = sanitizeAndRedactPii(JSON.stringify(verifiedEvaluationJson, null, 2));

  const userPrompt = `Translate and contextualize the following verified clinical evaluation into a structured, compassionate patient report:

<clinical_evaluation>
${serializedEvaluation}
</clinical_evaluation>

REQUIRED STRUCTURE:
### 1. Overview (نظرة عامة)
### 2. Clinical Observations (الملاحظات السريرية)
### 3. Recommended Care Pathway & Doctor Discussion Points (مسار الرعاية الموصى به)
### 4. Discreet Daily Wellness Steps (إرشادات وقائية يومية)
### 5. Medical Disclaimer (إخلاء مسؤولية طبي)`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      let text = response.text;
      if (text) {
        text = sanitizeAndRedactPii(text);
      }
      // ENG-3: Verify 5-section response conformance
      if (
        text &&
        text.trim().length >= 100 &&
        text.includes('1.') &&
        text.includes('2.') &&
        text.includes('3.') &&
        text.includes('4.') &&
        text.includes('5.')
      ) {
        return { narrative: text, model: 'gemini-2.5-flash' };
      }
    } catch (err) {
      console.warn('Gemini 2.5 Flash invocation notice, using deterministic cultural fallback:', (err as any)?.message || 'Unknown error');
    }
  }

  // High-fidelity deterministic fallback
  const fallback = generateCulturalFallback(verifiedEvaluationJson, validLang);
  return { narrative: fallback, model: 'deterministic_cultural_engine' };
}

function generateCulturalFallback(payload: any, language: string): string {
  const isAr = language === 'ar';
  const tier = payload.triage_tier;

  if (isAr) {
    let tierText = '';
    let pathwayText = '';

    if (tier === 'TIER_2_ANDROLOGY_SPECIALIST') {
      tierText = 'المستوى 2: مسار استشاري تخصصي في طب الذكورة وصحة الإنجاب';
      pathwayText = 'نوصي بزيارة عيادات طب الذكورة التخصصية في أبوظبي (مثل معهد التخصصات الجراحية وطب الذكورة في كليفلاند كلينك أبوظبي أو مركز هيلث بلاس للإخصاب). ناقش مع الطبيب التحاليل المنوية المفصلة والفحص بالموجات الصوتية.';
    } else if (tier === 'TIER_3_PRIMARY_CARE') {
      tierText = 'المستوى 3: مسار الرعاية الصحية الأولية والتحسين الأيضي';
      pathwayText = 'نوصي بمراجعة مراكز الخدمات العلاجية الخارجية التابعة لـ (صحة - AHS) لإجراء فحوصات الأيض، ومستويات فيتامين د، وملف الهرمونات ومؤشر كتلة الجسم.';
    } else {
      tierText = 'المستوى 4: مسار التوجيه الذاتي وتعزيز نمط الحياة الوقائي';
      pathwayText = 'وضعك العام مستقر وإيجابي. يركز هذا المسار على تعزيز الصحة الإنجابية الاستباقية من خلال عادات يومية معززة للخصوبة.';
    }

    const ruleDescriptions = (payload.triggered_rules || [])
      .map((r: any) => `- **${r.title_ar || r.rule_id}:** ${r.rationale_ar || ''}`)
      .join('\n');

    return `### 1. نظرة عامة (Overview)
مرحباً بك في مسار أمانة. انطلاقاً من مبدأ صون الأمانة الصحية والخصوصية المطلقة، أظهر الفحص السريري الأولي المعياري: **${tierText}**. صحتك الإنجابية جزء أساسي من حيويتك البدنية ورعايتها خطوة حكيمة وواعية.

### 2. الملاحظات السريرية (Clinical Observations)
بناءً على المعايير العالمية (منظمة الصحة العالمية WHO الإصدار السادس والجمعية الأمريكية لجراحة المسالك البولية AUA):
${ruleDescriptions || '- لم يتم تسجيل عوامل خطر هيكلية أو تحويلية متقدمة في بياناتك الحالية.'}

### 3. مسار الرعاية الموصى به ونقاط النقاش مع الطبيب (Recommended Care Pathway)
- **المسار المقترح:** ${pathwayText}
- **نقاط موصى بها للنقاش:**
  1. استعراض نتائج قياسات السائل المنوي ومقارنتها بالحدود المئوية لمنظمة الصحة العالمية.
  2. مناقشة تأثير العوامل الأيضية ومؤشر الكتلة على التوازن الهرموني (التستوستيرون والإستراديول).
  3. استكشاف الفحوصات الإضافية كالفحص بالموجات الصوتية للصفن (Scrotal Doppler) إن لزم.

### 4. إرشادات وقائية يومية (Discreet Daily Wellness Steps)
- **التبريد وتجنب الاحتباس الحراري:** تجنب الجلوس المتواصل لأكثر من ساعتين متصلتين، واستخدام مقاعد جيدة التهوية، وتجنب أحواض المياه الحارة والساونا.
- **مضادات الأكسدة والتغذية:** التركيز على الأغذية الغنية بالزنك والسيلينيوم وفيتامينات C و E للحد من الإجهاد التأكسدي.
- **الابتعاد عن التبغ والمدواخ والشيشة:** تحسين حيوية المادة الوراثية للحيوانات المنوية وتقليل تكسر الـ DNA المنوي.

### 5. إخلاء مسؤولية طبي (Medical Disclaimer)
هذا التقرير مُعد لأغراض الإرشاد والفرز الوقائي المبكر وفق خوارزميات طبية معيارية، ولا يعتبر تشخيصاً طبياً نهائياً أو بديلاً عن الاستشارة السريرية المباشرة مع طبيب مرخص في دائرة الصحة - أبوظبي.`;
  } else {
    let tierTitle = '';
    let pathway = '';
    if (tier === 'TIER_2_ANDROLOGY_SPECIALIST') {
      tierTitle = 'Tier 2: Specialized Andrology & Reproductive Specialist Pathway';
      pathway = 'A specialized consultation with a Male Reproductive Health / Andrology Specialist is advised (e.g., Cleveland Clinic Abu Dhabi Andrology Institute or HealthPlus Fertility Center Abu Dhabi).';
    } else if (tier === 'TIER_3_PRIMARY_CARE') {
      tierTitle = 'Tier 3: Primary Healthcare & Metabolic Optimization Pathway';
      pathway = 'A consultation at SEHA Ambulatory Healthcare Services (AHS) or your primary health physician is recommended for metabolic, endocrine, and lifestyle review.';
    } else {
      tierTitle = 'Tier 4: Self-Directed Proactive Lifestyle Optimization';
      pathway = 'Your screening indicators are favorable. The focus is on preserving sperm health through proactive thermoregulation, antioxidant nutrition, and micro-habits.';
    }

    const ruleDescriptions = (payload.triggered_rules || [])
      .map((r: any) => `- **${r.title_en || r.rule_id}:** ${r.rationale_en || ''}`)
      .join('\n');

    return `### 1. Overview
Welcome to Masar Amanah. In the spirit of health stewardship (Amanah) and complete privacy, your deterministic clinical screening indicates: **${tierTitle}**. Proactive male reproductive health is a core pillar of long-term vitality.

### 2. Clinical Observations
Evaluated against the WHO Laboratory Manual 6th Edition (2021) and AUA/ASRM clinical guidelines:
${ruleDescriptions || '- No severe structural or semen threshold impairments were detected in your input.'}

### 3. Recommended Care Pathway & Doctor Discussion Points
- **Suggested Pathway:** ${pathway}
- **Discussion Points for Your Clinician:**
  1. Review verified WHO 6th edition parameters (volume, concentration, motility, morphology).
  2. Discuss metabolic interactions, testosterone-to-estradiol balance, and scrotal temperature control.
  3. Determine if scrotal Doppler ultrasound or baseline endocrine labs (Total/Free Testosterone, LH, FSH) are indicated.

### 4. Discreet Daily Wellness Steps
- **Scrotal Thermoregulation:** Avoid continuous seated posture (>2 hours without standing), avoid placing laptops directly on the lap, and limit saunas or hot baths.
- **Antioxidant Support:** Incorporate foods rich in Zinc, Selenium, CoQ10, and Vitamins C & E to counteract seminal reactive oxygen species (ROS).
- **Tobacco / Shisha Reduction:** Protect sperm DNA integrity by eliminating tobacco, medwakh, and shisha exposure.

### 5. Medical Disclaimer
This screening report is generated for educational triage and proactive risk stratification. It does NOT constitute a medical diagnosis or treatment plan. Always consult a licensed healthcare professional within the Department of Health (DoH) Abu Dhabi network.`;
  }
}
