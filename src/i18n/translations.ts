/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const TRANSLATIONS = {
  en: {
    // Header & Brand
    appName: 'Masar Amanah Health',
    appArabicName: 'مسار أمانة',
    tagline: 'Privacy-First Deterministic Male Reproductive Health Screening',
    trackBadge: 'GITEX 2026 • Future Health Challenge • Male Reproductive Health Track',
    privacyBadge: 'Private In-Memory Session • Zero Data Retention • No Registration Required',
    whyZeroPii: 'Why Zero-PII?',
    restartSession: 'Purge & Restart',
    confidential: '100% Confidential & Anonymous',

    // Wizard Steps
    step1: '1. Safety Gate',
    step2: '2. Clinical History',
    step3: '3. Lifestyle & Semen Panel',
    step4: '4. Triage & Care Plan',

    // Welcome Screen
    welcomeTitle: 'Dignified, Anonymous Male Reproductive Health Screening',
    welcomeSubtitle:
      'In the UAE and GCC, male factor accounts for ~50% of conception challenges, yet seeking clinical guidance is often delayed by 2–3 years due to stigma or friction. Masar Amanah empowers you with private, evidence-based clarity.',
    privacyPromiseTitle: 'Our Sacred Trust (الأمانة): Zero-PII Guarantee',
    privacyPromiseDesc:
      'No names, emails, phone numbers, or IP addresses are ever collected or stored. Your session runs strictly in your device memory and vanishes when closed.',
    startScreening: 'Begin Anonymous Screening',
    howItWorksTitle: 'How the 5-Stage Pipeline Protects You',
    stepP1: 'Zero-PII In-Memory Input (No Free Text, No Injection)',
    stepP2: 'Instant Safety Circuit Breaker (Zero Latency Alert for Acute Red Flags)',
    stepP3: 'Deterministic Clinical Engine (WHO 6th Ed & AUA Guidelines)',
    stepP4: 'Gemini 2.5 Flash Cultural Rephraser (Empathetic, Dignified Framing)',
    stepP5: 'Explainable Routing across the Abu Dhabi Healthcare Network',

    // Step 1: Safety Gate
    step1Title: 'Safety Gate & Essential Metrics',
    step1Subtitle:
      'Before evaluating subacute or reproductive factors, we must ensure there are no acute medical flags requiring immediate emergency intervention.',
    acutePainLabel: 'Sudden, severe scrotal pain (onset within the last 12–24 hours)',
    acutePainDesc: 'Crucial: Sudden acute scrotal pain may indicate testicular torsion, which requires Doppler ultrasound within a 6-hour salvage window.',
    painlessLumpLabel: 'Painless, firm lump or nodule felt inside the testicle',
    painlessLumpDesc: 'A firm, discrete painless mass requires priority in-person urological imaging to rule out neoplasms.',
    safetyWarning: 'Safety Alert: Checking either box triggers an immediate clinical safety alert without algorithmic delay.',
    ageLabel: 'Age (Years)',
    heightLabel: 'Height (cm)',
    weightLabel: 'Weight (kg)',
    bmiLabel: 'Calculated Body Mass Index (BMI)',
    bmiUnderweight: 'Underweight (< 18.5)',
    bmiNormal: 'Optimal Range (18.5 - 24.9)',
    bmiOverweight: 'Elevated (25.0 - 29.9)',
    bmiObese: 'High Risk (≥ 30.0 - Adipose Aromatization)',

    // Step 2: Clinical History
    step2Title: 'Clinical & Andrological History',
    step2Subtitle:
      'Specific physiological milestones and medical treatments directly impact the hypothalamic-pituitary-gonadal (HPG) axis.',
    steroidsLabel: 'Exogenous Anabolic Steroids or Testosterone (TRT / Gym Boosters)',
    steroidsDesc: 'Includes injectable testosterone, SARMs, or unverified gym supplements. Shuts down pituitary LH/FSH signals.',
    undescendedLabel: 'History of Undescended Testicle (Cryptorchidism)',
    undescendedDesc: 'Testicle that did not descend into the scrotum before birth, even if repaired during childhood via orchidopexy.',
    varicoceleLabel: 'Diagnosed Clinical Varicocele (Enlarged Veins in Scrotum)',
    varicoceleDesc: 'Bag-of-worms feeling or diagnosed vein dilation causing continuous scrotal hyperthermia and oxidative stress.',
    mumpsLabel: 'Mumps Orchitis Contracted After Puberty',
    mumpsDesc: 'Severe viral infection after puberty that caused swelling or tenderness in one or both testicles.',

    // Step 3: Lifestyle & WHO Semen Panel
    step3Title: 'Lifestyle & WHO Semen Analysis Panel',
    step3Subtitle:
      'Testicular thermoregulation, daily micro-habits, and (optional) laboratory semen analysis parameters.',
    sittingLabel: 'Daily Prolonged Sitting Hours (Desk work, driving, gaming)',
    sittingDesc: 'Sitting ≥ 8 hours continuously elevates scrotal temperature by up to 2.2°C, suppressing heat-sensitive spermatogenic enzymes.',
    heatLabel: 'Frequent Scrotal Heat Exposure (>2x / week)',
    heatDesc: 'Regular use of hot tubs, jacuzzis, saunas, hot baths, or placing hot laptops directly on the lap.',
    tobaccoLabel: 'Tobacco, Shisha, or Medwakh Consumption',
    tobaccoDesc: 'Combustion toxins and nicotine generate reactive oxygen species (ROS) in seminal fluid, increasing sperm DNA fragmentation.',
    tobaccoNone: 'None (Non-Smoker)',
    tobaccoLight: 'Light / Occasional (1-2x / week)',
    tobaccoHeavy: 'Regular / Daily (Cigarettes, Shisha, or Medwakh)',
    
    // Semen Panel
    semenToggleLabel: 'I have a recent Semen Analysis laboratory report',
    semenToggleDesc: 'Evaluating against the WHO Laboratory Manual 6th Edition (2021) 5th percentile lower reference limits.',
    semenVolumeLabel: 'Ejaculate Volume (mL)',
    semenVolumeRef: 'WHO 6th Ed Ref: ≥ 1.4 mL',
    semenConcentrationLabel: 'Sperm Concentration (Million / mL)',
    semenConcentrationRef: 'WHO 6th Ed Ref: ≥ 15.0 × 10⁶ / mL',
    semenMotilityLabel: 'Total Motility (PR + NP %)',
    semenMotilityRef: 'WHO 6th Ed Ref: ≥ 42.0%',
    semenMorphologyLabel: 'Normal Morphology (Strict Tygerberg %)',
    semenMorphologyRef: 'WHO 6th Ed Ref: ≥ 4.0%',

    // Navigation Buttons
    nextStep: 'Continue to Next Step',
    backStep: 'Previous Step',
    runScreening: 'Evaluate & Generate Clinical Triage',
    evaluating: 'Running Clinical Engine & Cultural Companion...',

    // Step 4: Results
    resultsTitle: 'Screening Evaluation & Care Pathway',
    resultsSubtitle: 'Structured triage outcome based on WHO 6th Edition limits and UAE clinical care pathways.',
    geminiCompanionBadge: 'Gemini 2.5 Flash • Cultural Healthcare Companion',
    deterministicAuditTitle: 'Deterministic Clinical Audit Trail',
    auditBadge: 'Zero-Hallucination Verified Rules Engine',
    guidelineSource: 'Guideline Source',
    measuredValue: 'Reported Value',
    thresholdLimit: 'Clinical Threshold',
    rationale: 'Pathophysiological Rationale',
    careDirectoryTitle: 'Recommended Abu Dhabi Healthcare Facilities',
    careDirectorySubtitle: 'Accredited facilities within the Department of Health (DoH) network matching your triage level:',
    emergencyBannerTitle: 'IMMEDIATE CLINICAL ACTION REQUIRED',
    emergencyCallSSMC: 'Call 999 or SSMC Emergency Hotline',
    printSummary: 'Export Doctor Discussion Sheet (No PII)',
    copiedToast: 'Report copied to clipboard',
    copyReport: 'Copy Patient Summary',
    downloadDoctorSheet: 'Print Doctor Sheet',
    exportJson: 'Export Audit JSON',
    roleLabel: 'View Perspective',
    rolePatient: 'Patient Mode',
    roleClinician: 'Clinician Companion',
    roleAuditor: 'System Auditor',

    // Tiers
    tier1Title: 'Tier 1: Emergency & Urgent Surgical Fast-Track',
    tier1Badge: 'URGENT MEDICAL ALERT',
    tier2Title: 'Tier 2: Specialized Andrology & Reproductive Clinic Pathway',
    tier2Badge: 'ANDROLOGY SPECIALIST REFERRAL',
    tier3Title: 'Tier 3: Primary Healthcare & Metabolic Optimization',
    tier3Badge: 'PRIMARY CARE / METABOLIC WORKUP',
    tier4Title: 'Tier 4: Self-Directed Proactive Lifestyle Optimization',
    tier4Badge: 'PROACTIVE WELLNESS PATHWAY',

    // Question Chips (PM-35 & UX-25)
    questionChipsTitle: 'Pre-Vetted Clinical Question Chips',
    questionChipsSubtitle: 'Zero Free-Text • Zero PII',
    questionChipsEvidenceSource: 'Evidence Source',
    questionChipsClose: 'Close Answer',
    questionChipsAriaLabel: 'Pre-vetted clinical questions list',
    questionChips: {
      hpg_recovery_timeline: {
        question: 'What is the HPG recovery timeline after TRT or anabolic steroids?',
        answer:
          'Exogenous androgens halt pituitary LH/FSH secretion, collapsing intratesticular testosterone needed for spermatogenesis. Spontaneous axis recovery takes 3 to 12 months after cessation under andrology care, often accelerated using selective estrogen receptor modulators (clomiphene) or hCG protocols to restore endogenous spermatogenesis.',
        citation: 'Endocrine Society Clinical Practice Guidelines & AUA/ASRM Male Infertility Guidelines',
      },
      varicocele_microsurgery: {
        question: 'How does subinguinal varicocele microsurgery improve fertility in Abu Dhabi?',
        answer:
          'Subinguinal microscopic varicocelectomy with Doppler guidance is the gold standard performed at specialized centers in Abu Dhabi (e.g., CCAD, SSMC). Ligation of refluxing pampiniform veins eliminates venous stasis and scrotal hyperthermia, yielding a 60–70% improvement in semen parameters and significantly reduced sperm DNA fragmentation within 3 to 6 months.',
        citation: 'AUA/ASRM Guidelines on Varicocele & EAU Infertility Guidelines',
      },
      daman_thiqa_coverage: {
        question: 'Are male reproductive workups and semen analyses covered by Daman and Thiqa?',
        answer:
          'Under Abu Dhabi Department of Health (DoH) regulations, Thiqa covers comprehensive diagnostic andrology consultations, semen analysis, endocrine profiling, and corrective microsurgery for UAE Nationals. Daman Enhanced and corporate plans generally cover diagnostic workups and urological evaluations with standard pre-authorization at network hospitals like SSMC, CCAD, and NMC Royal.',
        citation: 'Abu Dhabi Department of Health (DoH) Healthcare Coverage Framework & Thiqa/Daman Network Policies',
      },
      scrotal_thermoregulation: {
        question: 'How does scrotal thermoregulation protect spermatogenesis, and how long does recovery take?',
        answer:
          'Human testes require an intrascrotal temperature 2.0°C to 2.5°C below core body temperature (~34.0°C). Prolonged seated posture (>8h) or sauna exposure elevates intrascrotal heat, halting spermatocyte meiotic enzymes and elevating reactive oxygen species (ROS). Because human spermatogenesis takes ~74 days, full physiological turnover requires 72 to 90 days of sustained heat avoidance.',
        citation: 'WHO Laboratory Manual 6th Edition (2021) & European Association of Urology (EAU) Guidelines',
      },
      sperm_morphology_criteria: {
        question: 'How do sperm morphology and motility thresholds affect conception potential?',
        answer:
          'Under WHO 6th Edition guidelines (strict Tygerberg criteria), normal morphology reference is ≥4.0% and progressive motility is ≥30% (total motility ≥42%). Structural defects impair oocyte penetration, but isolated teratozoospermia or asthenozoospermia often responds remarkably to 90 days of antioxidant therapy (CoQ10, zinc, selenium) and scrotal heat mitigation.',
        citation: 'WHO Laboratory Manual 6th Edition (2021) Section 2.5 & Cochrane Review on Antioxidants',
      },
      emergency_scrotal_torsion: {
        question: 'Why is testicular torsion an immediate 6-hour surgical emergency?',
        answer:
          'Testicular torsion twists the spermatic cord, immediately obstructing venous return and arterial blood inflow. Complete ischemia causes irreversible testicular necrosis within 6 to 12 hours. Urgent Doppler ultrasound and emergent surgical detorsion/orchidopexy at the nearest Abu Dhabi emergency department (e.g., SSMC or CCAD) provide a >90% organ salvage rate if performed within 6 hours.',
        citation: 'AUA Acute Scrotum Clinical Practice Guidelines & DoH Emergency Care Protocols',
      },
      testicular_mass_pathway: {
        question: 'What steps are involved in the priority testicular mass diagnostic pathway?',
        answer:
          'A painless firm testicular nodule requires urgent non-invasive scrotal ultrasonography within 72 hours, paired with serum tumor marker evaluation (Alpha-fetoprotein, Beta-hCG, and Lactate Dehydrogenase). Over 95% of early-detected testicular neoplasms are fully curable with organ-preserving or radical inguinal approaches under DoH multidisciplinary oncology guidelines.',
        citation: 'EAU / AUA Testicular Cancer Guidelines (2022) & DoH Fast-Track Oncology',
      },
      metabolic_aromatization: {
        question: 'How does elevated BMI impact male reproductive hormones?',
        answer:
          'Excess visceral adipose tissue houses high concentrations of the aromatase enzyme, which converts circulating testosterone into estradiol. This creates secondary hypogonadism and blunts pituitary LH/FSH secretion. A 5–10% reduction in adipose mass through progressive resistance training and metabolic optimization restores endocrine balance.',
        citation: 'Endocrine Society Clinical Practice Guidelines on Hypogonadism',
      },
      tobacco_dna_fragmentation: {
        question: 'How does tobacco and shisha smoking affect sperm DNA integrity?',
        answer:
          'Inhaled combustion byproducts, nicotine, and heavy metals (cadmium, lead) penetrate the blood-testis barrier, generating seminal reactive oxygen species (ROS). This elevates sperm DNA fragmentation (DFI). Complete smoking cessation produces a marked drop in DFI within one spermatogenic cycle (90 days).',
        citation: 'WHO Guidelines on Tobacco and Reproductive Health (2020) & ASRM Practice Committee Report',
      },
      andrology_consult_protocol: {
        question: 'What happens during a specialized clinical andrology examination?',
        answer:
          'An andrologist conducts a dignified, confidential physical exam: assessing testicular volume with a Prader orchidometer, examining the epididymis and vasa deferentia, and evaluating for clinical varicocele via Valsalva maneuver in the upright position. Baseline morning endocrine labs (Total T, LH, FSH, Prolactin) are ordered to map pituitary vs. testicular function.',
        citation: 'AUA/ASRM Best Practice Policy on Male Infertility Evaluation',
      },
    },

    // Privacy Modal
    privacyModalTitle: 'Why Zero-PII Matters for Male Health in the UAE',
    privacyModalBody1:
      'In traditional digital health apps, asking for an email, phone number, or Emirates ID introduces severe hesitation. Men often fear social exposure, employment concerns, or cultural stigmatization.',
    privacyModalBody2:
      'Masar Amanah operates with absolute technical trust (Amanah): all evaluations execute in-memory on your device and via stateless server routing. No cookies, no databases, no logs, and no tracking scripts exist.',
    privacyClose: 'Understood & Protected',
  },
  ar: {
    // Header & Brand
    appName: 'مسار أمانة',
    appArabicName: 'Masar Amanah Health',
    tagline: 'منظومة الفرز السريري الرقمي لصحة الرجل والخصوبة • خصوصية مطلقة وخوارزميات دقيقة',
    trackBadge: 'جيتكس 2026 • تحدي صحة المستقبل • مسار صحة الإنجاب والخصوبة الذكورية',
    privacyBadge: 'جلسة مؤقتة في الذاكرة • لا يتم تخزين أي بيانات • لا يلزم التسجيل أو الهوية',
    whyZeroPii: 'لماذا خصوصية بلا بيانات؟',
    restartSession: 'مسح الجلسة والبدء من جديد',
    confidential: 'سرية وأمانة تامة 100%',

    // Wizard Steps
    step1: '1. بوابة السلامة الأولية',
    step2: '2. التاريخ السريري والتناسلي',
    step3: '3. نمط الحياة وفحص النطاف',
    step4: '4. التصنيف السريري وخريطة الرعاية',

    // Welcome Screen
    welcomeTitle: 'مسار وقائي كريم ومحمي لصحة الرجل الإنجابية في أبوظبي',
    welcomeSubtitle:
      'في دولة الإمارات ومنطقة الخليج، تسهم العوامل الذكورية في نحو 50% من تحديات الإنجاب، ومع ذلك يتأخر التقييم الطبي المتخصص بمعدل سنتين إلى ثلاث سنوات بسبب الحرج الاجتماعي. يوفر مسار أمانة وضوحاً سريرياً مبكراً وبأعلى درجات الخصوصية والوقار.',
    privacyPromiseTitle: 'عهد الأمانة: حماية الخصوصية دون جمع أي بيانات شخصية (Zero-PII)',
    privacyPromiseDesc:
      'لا نطلب اسمك أو بريدك الإلكتروني أو رقم هاتفك أو هويتك الإماراتية إطلاقاً. تجرى كل الفحوصات داخل ذاكرة جهازك المؤقتة وتتلاشى فور إغلاق الصفحة.',
    startScreening: 'بدء الفرز الوقائي الآمن',
    howItWorksTitle: 'كيف تحميك المنظومة ذات الـ 5 مراحل؟',
    stepP1: 'مدخلات رقمية محددة دون كتابة نصوص حرة لحمايتك من أي اختراق',
    stepP2: 'قاطع الدائرة الآمن الفوري لأي علامات طارئة دون انتظار أو تكلفة استهلاك',
    stepP3: 'محرك سريري معتمد 100% وفق منظمة الصحة العالمية (الإصدار السادس 2021) والجمعية الأمريكية AUA',
    stepP4: 'مساعد سياقي بلغة عربية فصحى وقورة ومراعية للقيم المجتمعية عبر Gemini 2.5 Flash',
    stepP5: 'توجيه سريري مفسَّر بالكامل نحو شبكة مستشفيات ومراكز أبوظبي الصحية',

    // Step 1: Safety Gate
    step1Title: 'بوابة السلامة والمؤشرات الحيوية',
    step1Subtitle:
      'قبل تقييم العوامل الخصوبية طويلة المدى، نقوم بفحص العلامات الحادة المستعجلة التي تتطلب رعاية جراحية فورية.',
    acutePainLabel: 'ألم حاد ومفاجئ في كيس الصفن أو الخصية (بدأ خلال آخر 12 إلى 24 ساعة)',
    acutePainDesc: 'علامة بالغة الأهمية: الألم الحاد والمفاجئ قد يشير إلى التواء الخصية الذي يتطلب فحص دوبلر وتدخلاً جراحياً خلال نافذة الإنقاذ (أقل من 6 ساعات).',
    painlessLumpLabel: 'كتلة أو عقدة صلبة غير مؤلمة ملموسة داخل نسيج الخصية',
    painlessLumpDesc: 'أي كتلة صلبة منعزلة وغير مؤلمة تتطلب تصويراً طبياً عاجلاً بالموجات فوق الصوتية لاستبعاد الأورام النسيجية.',
    safetyWarning: 'تنبيه أمان: اختيار أي من هاتين العلامتين يُفعّل فوراً بروتوكول السلامة الطارئ دون أي تأخير خوارزمي.',
    ageLabel: 'العمر (بالسنوات)',
    heightLabel: 'الطول (سم)',
    weightLabel: 'الوزن (كغ)',
    bmiLabel: 'مؤشر كتلة الجسم المحسوب (BMI)',
    bmiUnderweight: 'نقص في الوزن (أقل من 18.5)',
    bmiNormal: 'المستوى المثالي (18.5 - 24.9)',
    bmiOverweight: 'وزن زائد (25.0 - 29.9)',
    bmiObese: 'سمنة وأرومة شحمية (≥ 30.0 تؤثر على الهرمونات)',

    // Step 2: Clinical History
    step2Title: 'التاريخ الطبي والسريري',
    step2Subtitle:
      'عوامل سريرية تؤثر مباشرة على المحور الهرموني (الغدة النخامية - الخصية) ونوعية الخلايا المولدة للنطاف.',
    steroidsLabel: 'تناول المنشطات البنائية أو هرمون التستوستيرون (TRT / مكملات تضخيم العضلات)',
    steroidsDesc: 'يشمل حقن التستوستيرون أو هرمونات كمال الأجسام التي تعطل إشارات الغدة النخامية (LH/FSH) وتوقف إنتاج النطاف.',
    undescendedLabel: 'تاريخ الخصية الهاجرة أو المعلقة في الصغر (Cryptorchidism)',
    undescendedDesc: 'خصية لم تستقر في كيس الصفن عند الولادة، حتى وإن تم تصحيحها وتثبيتها جراحياً في الطفولة.',
    varicoceleLabel: 'تشخيص مسبق بدوالي الخصية (تمدد وتضخم الأوردة في الصفن)',
    varicoceleDesc: 'توسع الأوردة المنوية المسبب لاحتباس حراري دائم وإجهاد تأكسدي يضر بحيوية الحيوانات المنوية.',
    mumpsLabel: 'الإصابة بالنكاف المصحوب بالتهاب الخصية بعد مرحلة البلوغ',
    mumpsDesc: 'إصابة فيروسية حادة بعد البلوغ تسببت في تورم وألم شديد في الخصية قد يخلف ضموراً نسيجياً.',

    // Step 3: Lifestyle & WHO Semen Panel
    step3Title: 'نمط الحياة وتحليل السائل المنوي (اختياري)',
    step3Subtitle:
      'التنظيم الحراري للصفن، العادات اليومية، ومعايير فحص السائل المنوي لمنظمة الصحة العالمية (الإصدار السادس).',
    sittingLabel: 'ساعات الجلوس اليومية المتواصلة (العمل المكتبي، القيادة، الألعاب)',
    sittingDesc: 'الجلوس لأكثر من 8 ساعات يرفع حرارة الصفن بنحو درجتين مئويتين، مما يضعف الإنزيمات الحساسة للحرارة المسؤولة عن تصنيع النطاف.',
    heatLabel: 'التعرض المتكرر للمصادر الحرارية المباشرة (أكثر من مرتين أسبوعياً)',
    heatDesc: 'الاستخدام المنتظم لجاكوزي المياه الحارة، حمامات البخار والساونا، أو وضع الكمبيوتر المحمول الساخن مباشرة على الحضن.',
    tobaccoLabel: 'استهلاك التبغ، الشيشة، أو المدواخ',
    tobaccoDesc: 'نواتج الاحتراق والنيكوتين ترفع مستويات الجذور الحرة الضارة بالبلازما المنوية وتزيد من تكسر الـ DNA.',
    tobaccoNone: 'لا أدخن إطلاقاً (غير مدخن)',
    tobaccoLight: 'تدخين متقطع / خفيف (1-2 مرة أسبوعياً)',
    tobaccoHeavy: 'تدخين منتظم / يومي (سجائر، شيشة، أو مدواخ)',

    // Semen Panel
    semenToggleLabel: 'لدي تقرير حديث لفحص السائل المنوي مخبرياً',
    semenToggleDesc: 'تقييم دقيق بناءً على الحدود المئوية الخامسة لدليل منظمة الصحة العالمية الإصدار السادس (2021).',
    semenVolumeLabel: 'حجم السائل المنوي (مليلتر)',
    semenVolumeRef: 'حد منظمة الصحة العالمية: ≥ 1.4 مل',
    semenConcentrationLabel: 'تركيز الحيوانات المنوية (مليون / مل)',
    semenConcentrationRef: 'حد منظمة الصحة العالمية: ≥ 15.0 مليون / مل',
    semenMotilityLabel: 'الحركة الكلية (التقدمية وغير التقدمية %)',
    semenMotilityRef: 'حد منظمة الصحة العالمية: ≥ 42.0%',
    semenMorphologyLabel: 'نسبة الأشكال الطبيعية (معيار تايجربيرغ الصارم %)',
    semenMorphologyRef: 'حد منظمة الصحة العالمية: ≥ 4.0%',

    // Navigation Buttons
    nextStep: 'الانتقال للخطوة التالية',
    backStep: 'الخطوة السابقة',
    runScreening: 'تقييم المؤشرات واستخراج المسار السريري',
    evaluating: 'جاري تشغيل المحرك السريري والصياغة الوقورة...',

    // Step 4: Results
    resultsTitle: 'نتيجة الفرز السريري وخارطة الرعاية',
    resultsSubtitle: 'تصنيف دقيق ومبني على الأدلة بالتعاون مع المنظومة الصحية في إمارة أبوظبي.',
    geminiCompanionBadge: 'Gemini 2.5 Flash • المرافق السريري المتفهم والمراعي للقيم المجتمعية',
    deterministicAuditTitle: 'سجل التدقيق السريري الخوارزمي الموثق',
    auditBadge: 'محرك قواعد قطعي خالي من التخمين أو التوليد غير المنضبط',
    guidelineSource: 'الدليل المرجعي الطبي',
    measuredValue: 'القيمة المسجلة',
    thresholdLimit: 'الحد السريري المعياري',
    rationale: 'التعليل الفسيولوجي الطبي',
    careDirectoryTitle: 'المنشآت الطبية الموصى بها في أبوظبي',
    careDirectorySubtitle: 'مرافق ومستشفيات معتمدة من دائرة الصحة - أبوظبي تتوافق مع مستوى حالتك:',
    emergencyBannerTitle: 'إجراء طبي فوري ومستعجل مطلوب',
    emergencyCallSSMC: 'اتصل بالطوارئ 999 أو مستشفى مدينة الشيخ شخبوط الطبية',
    printSummary: 'طباعة ورقة المناقشة الطبية (بدون أي بيانات شخصية)',
    copiedToast: 'تم نسخ الملخص السريري بنجاح',
    copyReport: 'نسخ ملخص الحالة',
    downloadDoctorSheet: 'طباعة ورقة الطبيب',
    exportJson: 'تصدير ملف التدقيق JSON',
    roleLabel: 'منظور العرض',
    rolePatient: 'وضع المريض',
    roleClinician: 'رفيق الطبيب السريري',
    roleAuditor: 'مدقق النظام السريري',

    // Tiers
    tier1Title: 'المستوى 1: مسار الطوارئ والتدخل الجراحي العاجل',
    tier1Badge: 'تنبيه سريري طارئ فوري',
    tier2Title: 'المستوى 2: مسار استشاري طب الذكورة والإخصاب التخصصي',
    tier2Badge: 'تحويل لعيادة طب الذكورة التخصصية',
    tier3Title: 'المستوى 3: مسار الرعاية الأولية والتحسين الأيضي',
    tier3Badge: 'فحص أيضي ورعاية أولية',
    tier4Title: 'المستوى 4: مسار التوجيه الذاتي وتعزيز نمط الحياة الوقائي',
    tier4Badge: 'مسار وقائي واستباقي',

    // Question Chips (PM-35 & UX-25)
    questionChipsTitle: 'أسئلة سريرية متابعة محددة مسبقاً',
    questionChipsSubtitle: 'دون إدخال نصي • صفر بيانات شخصية',
    questionChipsEvidenceSource: 'المرجع الطبي المعتمد',
    questionChipsClose: 'إغلاق الإجابة',
    questionChipsAriaLabel: 'قائمة الأسئلة السريرية المحددة مسبقاً',
    questionChips: {
      hpg_recovery_timeline: {
        question: 'ما هو الجدول الزمني لتعافي المحور النخامي الخصيوي بعد المنشطات أو التستوستيرون؟',
        answer:
          'تؤدي الهرمونات الخارجية إلى تثبيط إفراز هرمونات الغدة النخامية (LH/FSH)، مما يوقف تصنيع النطاف الداخلي. يستغرق التعافي التلقائي للمحور بين 3 إلى 12 شهراً بعد التوقف التام، وغالباً ما يتم تسريعه تحت إشراف استشاري الذكورة باستخدام معدلات مستقبلات الإستروجين (كلوميفين) أو hCG لإعادة تنشيط الخصية.',
        citation: 'إرشادات الجمعية الأمريكية لطب الغدد الصماء وإرشادات AUA/ASRM لخصوبة الرجال',
      },
      varicocele_microsurgery: {
        question: 'كيف تسهم الجراحة المجهرية لدوالي الخصية في أبوظبي في تحسين الخصوبة؟',
        answer:
          'تعتبر الجراحة المجهرية لدوالي الخصية عبر شق أسفل الإرب بالاستعانة بالدوبلر المعيار الذهبي المعتمد في المراكز المتقدمة بأبوظبي (مثل كليفلاند كلينك ومدينة الشيخ شخبوط). يؤدي ربط الأوردة المحتقنة إلى إنهاء الارتداد الوريدي والاحتباس الحراري، محققاً تحسناً بنسبة 60-70% في مؤشرات السائل المنوي وانخفاضاً حاداً في تكسر الحمض النووي للنطاف خلال 3 إلى 6 أشهر.',
        citation: 'إرشادات AUA/ASRM لدوالي الخصية وإرشادات الجمعية الأوروبية لجراحة المسالك البولية',
      },
      daman_thiqa_coverage: {
        question: 'هل تغطي برامج ضمان وثقة في أبوظبي فحوصات صحة الرجل وتحليل السائل المنوي؟',
        answer:
          'وفقاً للوائح دائرة الصحة - أبوظبي، تغطي وثيقة "ثقة" لمواطني الدولة الاستشارات التشخيصية لطب الذكورة وفحص السائل المنوي والتحاليل الهرمونية والجراحات التصحيحية المجهرية. كما تغطي برامج "ضمان" المعززة ووثائق التأمين المؤسسية الفحوصات التشخيصية واستشارات المسالك البولية وفق آليات الموافقة المسبقة لدى المرافق المعتمدة مثل شخبوط وكليفلاند وإن إم سي.',
        citation: 'الإطار التنظيمي للتغطية التأمينية لدائرة الصحة - أبوظبي وسياسات شبكة ثقة وضمان',
      },
      scrotal_thermoregulation: {
        question: 'كيف يحمي التنظيم الحراري للصفن تصنيع الحيوانات المنوية، وما هي مدة التعافي؟',
        answer:
          'تتطلب الخصيتان حرارة أقل من حرارة الجسم بنحو 2 إلى 2.5 درجة مئوية (~34 مئوية). يؤدي الجلوس المطول (>8 ساعات) أو الساونا إلى احتباس حراري يثبط الإنزيمات الحساسة للحرارة المسؤولة عن انقسام الخلايا المنوية. ونظراً لأن دورة إنتاج الحيوانات المنوية تستغرق قرابة 74 يوماً، فإن استعادة الحيوية الطبيعية تستلزم 72 إلى 90 يوماً من تجنب الحرارة.',
        citation: 'دليل منظمة الصحة العالمية الإصدار السادس (2021) وإرشادات EAU للصحة الإنجابية',
      },
      sperm_morphology_criteria: {
        question: 'كيف تؤثر معايير حركة وشكل الحيوانات المنوية على احتمالية الإخصاب؟',
        answer:
          'وفق معايير الإصدار السادس لمنظمة الصحة العالمية الصارمة (تايجربيرغ)، فإن نسبة الأشكال السليمة ≥4% والحركة التقدمية ≥30% (الحركة الكلية ≥42%) تمثل الحد المئوي الخامس الأدنى. تدني الحركة أو زيادة التشوهات غالباً ما يستجيب بعد 90 يوماً من المكملات المضادة للأكسدة (CoQ10، الزنك، السيلينيوم) وتجنب مصادر الحرارة المباشرة.',
        citation: 'دليل منظمة الصحة العالمية الإصدار السادس (2021) ومراجعة كوكرين لمضادات الأكسدة',
      },
      emergency_scrotal_torsion: {
        question: 'لماذا يعد التواء الخصية حالة جراحية طارئة تتطلب التدخل خلال 6 ساعات؟',
        answer:
          'يؤدي التواء الحبل المنوي إلى انقطاع فوري في التروية الشريانية والوريدية للخصية. يؤدي نقص التروية الكامل إلى نخر دائم وغير قابل للإصلاح خلال 6 إلى 12 ساعة. التوجه الفوري لأقسام الطوارئ في أبوظبي (مثل شخبوط أو كليفلاند) لعمل فحص الدوبلر والتدخل الجراحي خلال نافذة الساعات الست يضمن نسبة إنقاذ تفوق 90%.',
        citation: 'إرشادات AUA للصفن الحاد وبروتوكولات الطوارئ لدائرة الصحة - أبوظبي',
      },
      testicular_mass_pathway: {
        question: 'ما هي خطوات المسار التشخيصي السريع لكتلة أو ورم الخصية في أبوظبي؟',
        answer:
          'أي كتلة صلبة غير مؤلمة تستدعي تصويراً فورياً بالموجات فوق الصوتية خلال 72 ساعة، مع قياس دلالات الأورام في الدم (AFP وBeta-hCG وLDH). أكثر من 95% من أورام الخصية المكتشفة مبكراً قابلة للشفاء التام بتدخلات جراحية دقيقة تحت إشراف فرق الأورام والمسالك البولية في شبكة دائرة الصحة بأبوظبي.',
        citation: 'إرشادات EAU / AUA لأورام الخصية (2022) ومسار الأورام السريع في دائرة الصحة',
      },
      metabolic_aromatization: {
        question: 'كيف يؤثر ارتفاع مؤشر كتلة الجسم على التوازن الهرموني الذكوري؟',
        answer:
          'تحتوي الأنسجة الدهنية الزائدة على تركيزات عالية من إنزيم الأروماتاز الذي يحول التستوستيرون إلى إستراديول (إستروجين أنثوي)، مما يثبط إشارات الغدة النخامية (LH/FSH). خفض الوزن بنسبة 5-10% عبر تمارين المقاومة وضبط الأيض يسهم مباشرة في استعادة التوازن الهرموني الطبيعي.',
        citation: 'إرشادات الجمعية الأمريكية لطب الغدد الصماء لقصور الغدد التناسلية',
      },
      tobacco_dna_fragmentation: {
        question: 'كيف يؤثر تدخين التبغ والشيشة والمدواخ على سلامة المادة الوراثية للنطاف؟',
        answer:
          'تخترق سموم الاحتراق والنيكوتين والمعادن الثقيلة الحاجز الدموي الخصيوي، رافعة نسبة الجذور الحرة المسببة لتكسر المادة الوراثية (Sperm DNA Fragmentation Index). التوقف التام عن التدخين بجميع أنواعه يقلل التكسر الوراثي بشكل ملحوظ خلال دورة تصنيع كاملة (90 يوماً).',
        citation: 'إرشادات منظمة الصحة العالمية بشأن التبغ وصحة الإنجاب (2020)',
      },
      andrology_consult_protocol: {
        question: 'ماذا يتضمن الفحص السريري الدقيق لدى استشاري الذكورة؟',
        answer:
          'يقوم استشاري الذكورة بفحص سريري يتميز بالخصوصية والوقار: قياس حجم الخصيتين باستخدام مقياس برادر، والتأكد من سلامة الحبل المنوي، وفحص دوالي الخصية أثناء الوقوف ومناورة فالسالفا، مع طلب تحاليل هرمونية صباحية لتحديد كفاءة المحور النخامي الخصيوي.',
        citation: 'دليل الممارسات المثلى لتقييم عقم الرجال الصادر عن AUA/ASRM',
      },
    },

    // Privacy Modal
    privacyModalTitle: 'لماذا تعد الخصوصية المطلقة (Zero-PII) جوهر مسار أمانة؟',
    privacyModalBody1:
      'في التطبيقات الصحية التقليدية، طلب رقم الهاتف أو البريد الإلكتروني أو الهوية يثير قلقاً مشروعاً ويدفع الكثيرين لتجنب الفحص أو تأجيله لسنوات خشية الحرج المجتمعي أو الوظيفي.',
    privacyModalBody2:
      'يعتمد مسار أمانة مفهوماً ثورياً: خوارزميات تعمل بالكامل داخل ذاكرة المتصفح اللحظية وخوادم عديمة الحالة (Stateless). لا يتم حفظ أي ملفات تعريف ارتباط (Cookies)، ولا قواعد بيانات، ولا سجلات تتبع إطلاقاً.',
    privacyClose: 'فهمت وأشعر بالطمأنينة',
  },
};
