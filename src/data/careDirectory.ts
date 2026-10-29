/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CareFacility, TriageTier } from '../types/screening.ts';

export const ABU_DHABI_HEALTH_DIRECTORY: Record<string, CareFacility[]> = {
  EMERGENCY: [
    {
      name_en: 'Sheikh Shakhbout Medical City (SSMC)',
      name_ar: 'مدينة الشيخ شخبوط الطبية (SSMC)',
      area_en: 'Al Mafraq, Abu Dhabi',
      area_ar: 'المفرق، أبوظبي',
      service_en: '24/7 Tertiary Emergency, Immediate Scrotal Doppler Ultrasound & Acute Surgical Team',
      service_ar: 'طوارئ متقدمة 24/7، فحص دوبلر فوري للصفن، وفريق جراحة مسالك بولية مناوب',
      phone: '999 (Emergency) / +971 2 314 4444',
      badge_en: '24/7 Tertiary Trauma & Emergency',
      badge_ar: 'طوارئ وإصابات متقدمة على مدار الساعة',
      emergency: true,
      locationUrl: 'https://maps.google.com/?q=Sheikh+Shakhbout+Medical+City+Abu+Dhabi',
    },
    {
      name_en: 'Cleveland Clinic Abu Dhabi (CCAD)',
      name_ar: 'كليفلاند كلينك أبوظبي',
      area_en: 'Al Maryah Island, Abu Dhabi',
      area_ar: 'جزيرة المارية، أبوظبي',
      service_en: 'Emergency Medicine Institute & On-Call Urological Acute Intervention',
      service_ar: 'معهد طب الطوارئ والتدخل الجراحي العاجل للمسالك البولية',
      phone: '999 (Emergency) / +971 2 659 0200',
      badge_en: 'Level 1 Accredited Emergency Service',
      badge_ar: 'خدمات طوارئ معتمدة عالية المستوى',
      emergency: true,
      locationUrl: 'https://maps.google.com/?q=Cleveland+Clinic+Abu+Dhabi',
    },
  ],
  ANDROLOGY: [
    {
      name_en: 'Cleveland Clinic Abu Dhabi - Andrology & Infertility Institute',
      name_ar: 'كليفلاند كلينك أبوظبي - معهد طب الذكورة وصحة الخصوبة',
      area_en: 'Al Maryah Island, Abu Dhabi',
      area_ar: 'جزيرة المارية، أبوظبي',
      service_en: 'Microsurgical Varicocelectomy, Sperm DNA Fragmentation, Advanced Male Reproductive Endocrinology',
      service_ar: 'جراحة دوالي الخصية المجهرية، فحص تكسر الحمض النووي للنطاف، وعلاج اضطرابات الهرمونات الذكورية',
      phone: '800 8 CCAD (800 8 2223) / +971 2 659 0200',
      badge_en: 'Subspecialized Andrology Institute',
      badge_ar: 'معهد تخصصي معتمد في طب الذكورة',
      emergency: false,
      locationUrl: 'https://maps.google.com/?q=Cleveland+Clinic+Abu+Dhabi',
    },
    {
      name_en: 'HealthPlus Fertility Center Abu Dhabi',
      name_ar: 'مركز هيلث بلاس للإخصاب أبوظبي',
      area_en: 'Al Bateen, Abu Dhabi',
      area_ar: 'البطين، أبوظبي',
      service_en: 'Dedicated Male Fertility Diagnostics, Advanced CASA Semen Analysis & Reproductive Medicine',
      service_ar: 'تشخيص دقيق لخصوبة الرجال، تحليل محوسب للسائل المنوي (CASA)، وتقنيات الإنجاب المساعدة',
      phone: '+971 2 643 3494 / 800 HPLUS (800 47587)',
      badge_en: 'Dedicated Reproductive Center',
      badge_ar: 'مركز رائد في تقنيات الإخصاب',
      emergency: false,
      locationUrl: 'https://maps.google.com/?q=HealthPlus+Fertility+Abu+Dhabi',
    },
  ],
  PRIMARY_CARE: [
    {
      name_en: 'SEHA Ambulatory Healthcare Services (AHS)',
      name_ar: 'الخدمات العلاجية الخارجية - شركة صحة (AHS)',
      area_en: 'Comprehensive Healthcare Centers across Abu Dhabi, Al Ain & Al Dhafra',
      area_ar: 'مراكز صحية شاملة في كافة مناطق أبوظبي والعين والظفرة',
      service_en: 'Routine Metabolic Workup, Fasting Glucose/HbA1c, Baseline Testosterone, Vitamin D & Lifestyle Counseling',
      service_ar: 'فحوصات الأيض الشاملة، مستوى السكر التراكمي، فحص التستوستيرون الأولي وفيتامين د، وإرشاد نمط الحياة',
      phone: '800 50 (SEHA Customer Contact Center)',
      badge_en: 'DoH Certified Primary Healthcare',
      badge_ar: 'شبكة مراكز الرعاية الأولية المعتمدة',
      emergency: false,
      locationUrl: 'https://maps.google.com/?q=SEHA+Ambulatory+Healthcare+Services+Abu+Dhabi',
    },
  ],
  LIFESTYLE: [
    {
      name_en: 'Masar Amanah Preventive Wellness Guide (Digital Care Loop)',
      name_ar: 'دليل مسار أمانة للوقاية الذاتية (مسار الرعاية الرقمي المستمر)',
      area_en: 'Abu Dhabi Digital Health Innovation Hub',
      area_ar: 'منصة الصحة الوقائية الرقمية - أبوظبي',
      service_en: 'Evidence-based testicular thermoregulation protocols, antioxidant dietary plans, ergonomic sitting breaks',
      service_ar: 'بروتوكولات التبريد الموضعي المعتمدة، خطط التغذية المضادة للأكسدة، ونظام الفواصل الحركية للجلوس',
      phone: 'In-App Evidence Hub (Zero Login)',
      badge_en: 'Community Self-Care',
      badge_ar: 'رعاية صحية وقائية ذاتية',
      emergency: false,
    },
  ],
};

export function getFacilitiesForTier(tier: TriageTier): CareFacility[] {
  switch (tier) {
    case 'TIER_1_EMERGENCY':
      return ABU_DHABI_HEALTH_DIRECTORY.EMERGENCY;
    case 'TIER_2_ANDROLOGY_SPECIALIST':
      return ABU_DHABI_HEALTH_DIRECTORY.ANDROLOGY;
    case 'TIER_3_PRIMARY_CARE':
      return ABU_DHABI_HEALTH_DIRECTORY.PRIMARY_CARE;
    case 'TIER_4_LIFESTYLE':
      return ABU_DHABI_HEALTH_DIRECTORY.LIFESTYLE;
    default:
      return ABU_DHABI_HEALTH_DIRECTORY.LIFESTYLE;
  }
}
