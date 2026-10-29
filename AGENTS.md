# Project Inputs
- PRODUCT_GOAL: Privacy-first deterministic male reproductive health screening with culturally dignified AI narrative and Abu Dhabi care routing
- TARGET_USERS: Men aged 18–55 in UAE/GCC seeking anonymous fertility & reproductive health guidance
- CADENCE: On-demand (single session, zero data retention)
- ROLES: patient, clinician_companion, system_auditor
- CATEGORIES (BEATS): Emergency (Tier 1), Andrology (Tier 2), Primary Care (Tier 3), Lifestyle (Tier 4)
- CANDIDATE_SOURCES: WHO 6th Edition Semen Manual (2021), AUA/ASRM Clinical Practice Guidelines, EAU Infertility Guidelines, Endocrine Society Clinical Practice Guidelines
- REFERENCE (UI): https://ai.studio/apps/8e61219d-bfd3-42ec-b3fe-e24c5c8bfccc
- BRAND: Masar Amanah Health (مسار أمانة)
- RUNTIME: Vite 8 + React 19 + Express (local dev), Cloud Run (production)
- LLM_PROVIDER: Google Gemini (@google/genai ^2.4.0, gemini-2.5-flash)
- AUTH_PROVIDER: None (Zero-PII architecture, no authentication by design)
- DEPLOY_TARGET: Google Cloud Run (port 3000 app, port 8080 Nginx reverse proxy)

# Conventions
- Specs live in docs/specs/. Requirement IDs: PM-n, UX-n, ENG-n (one per line, testable).
- Pipeline order: pm-product-strategist -> ux-reference-designer -> fullstack-architect -> qa-production-guard.
- Never start a stage before the previous stage's Acceptance checklist passes.
- Styling uses Tailwind CSS v4 with @tailwindcss/vite plugin. Custom tokens in src/index.css.
- Implement in TypeScript + React 19 + Vite 8 (existing stack).
- Clinical rules engine (src/lib/clinicalEngine.ts) is the single source of truth for triage decisions. The LLM layer (Stage 4) may ONLY rephrase — never alter triage tier, action code, or triggered rules.
- Zero-PII: No names, emails, phone numbers, IP addresses, or device fingerprints are ever collected or persisted.
