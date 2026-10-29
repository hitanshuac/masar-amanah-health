# Masar Amanah Health (مسار أمانة)

> **GITEX 2026 · Future Health Challenge · Male Reproductive Health Track**  
> *Privacy-First Deterministic Screening with Culturally Dignified AI Narrative & Abu Dhabi Care Routing*

---

## 1. Overview & Cultural Dignity (Amanah)
Male reproductive health in the UAE and GCC region faces an estimated 2–3 year diagnostic delay driven by social stigma, privacy apprehension, and fears regarding employer or insurance disclosures.

**Masar Amanah Health** bridges this critical clinical gap by providing:
- **100% Deterministic Clinical Triage**: Single source of truth based on WHO 6th Edition Semen Manual (2021) and AUA/ASRM guidelines (`src/lib/clinicalEngine.ts`).
- **Zero-PII Architecture**: Zero accounts, zero cookies, zero localStorage/sessionStorage, and zero databases. All user inputs are strictly ephemeral in volatile React state.
- **Culturally Dignified Companion (Gemini 2.5 Flash)**: Empathetic rephrasing framed around health stewardship (*Amanah*), proactive wellness, and positive empowerment in Modern Standard Arabic (العربية الفصحى) and English.
- **Abu Dhabi / UAE Localized Care Pathways**: Instant routing to Department of Health (DoH) Abu Dhabi specialized centers (Cleveland Clinic Abu Dhabi Andrology Institute, HealthPlus Fertility, SEHA Ambulatory Healthcare Services).

---

## 2. Security & Compliance Architecture

### SAST & OWASP Top 10 Compliance (`.agents/skills/sast-compliance/SKILL.md`)
- **Semgrep & OWASP Criteria**: Automated AST scans enforce zero XSS injection (`SafeNarrative.tsx` replaces `dangerouslySetInnerHTML`), zero hardcoded credentials, and strict input validation.
- **Comprehensive HTTP Security Headers**: Configured in `server.ts` (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy`).
- **Prompt Injection Defense**: Payloads sent to `@google/genai` are wrapped in structural `<clinical_evaluation>...</clinical_evaluation>` XML delimiters.
- **Network Boundary PII Scrubbing**: Ephemeral multimodal lab scanner (`/api/parse-semen-lab`) extracts strictly numeric WHO parameters in memory, scrubbing all metadata. `/api/contextualize` actively redacts phone numbers, emails, and Emirates IDs at the network boundary.
- **Zero Vulnerabilities**: Enforced via continuous `npm audit` (0 vulnerabilities).

### Master Sync Orchestration (`.agents/skills/master-sync/SKILL.md`)
Following the Oct 19, 2026 Antigravity IDE workflow modernization, multi-phase governance is executed via the `master-sync` skill across 8 sequential phases:
1. **Phase 1: Pre-Flight & AST/Dead-Code Sanitization** (Imports, cycle checks, dead code elimination).
2. **Phase 2: Defensive Contracts & Schema Integrity** (`contract.schema.json` & `response.schema.json` sync).
3. **Phase 3: SAST, Secret Scanning & Dependency Audit** (`npm audit`, AST scans, zero storage leaks).
4. **Phase 4: Clinical Test & Resilience Verification** (14/14 automated clinical test harness passes).
5. **Phase 5: Build Gate & Bundle Budget Scan** (JS < 150 kB gzip, CSS < 20 kB gzip).
6. **Phase 6: Documentation & Spec Synchronization** (`PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, `03_SECURITY.md`, `DECISIONS.md`, `QA_REPORT.md`).
7. **Phase 7: Conversational Error Harvesting & Rule Hardening**.
8. **Phase 8: Checkpoint & Deployment Readiness**.

---

## 3. Quickstart & Local Execution

**Prerequisites:** Node.js 20+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional for local dev; deterministic engine runs without key)
cp .env.example .env
# Add GEMINI_API_KEY="your-api-key" to .env

# 3. Start development server (Port 3000)
npm run dev

# 4. Run automated test suites
npm run test:clinical      # 14/14 automated clinical test harness
npm run test:compliance    # 6/6 automated Hack2Skill compliance & SAST scans
npm run test               # Run all test suites

# 5. Typecheck & production build
npm run lint               # tsc --noEmit
npm run build              # Production Vite bundle (<122 kB gzip)
npm start                  # Production Express server on port 3000
```

---

## 4. Specification & Handover Index

| Document | Purpose | Standard |
|---|---|---|
| [PRODUCT_SPEC.md](docs/specs/PRODUCT_SPEC.md) | Clinical triage taxonomy, roles, journey, and requirement IDs (`PM-n`) | AUA/ASRM, WHO 6th |
| [DESIGN_SPEC.md](docs/specs/DESIGN_SPEC.md) | Design tokens, RTL layout, typography, and UX criteria (`UX-n`) | WCAG 2.1 AA |
| [03_SECURITY.md](docs/specs/03_SECURITY.md) | Zero-Auth, RBAC, Secret Hygiene, Network Boundary PII Guards | OWASP Top 10, Semgrep |
| [DECISIONS.md](docs/specs/DECISIONS.md) | Architectural Decision Records (ADR-1 through ADR-6) | Architecture |
| [QA_REPORT.md](docs/specs/QA_REPORT.md) | Resilience matrix (18 scenarios), build gate, compliance scan results, GO verdict | Release Gate |
| [HANDOVER_agy.md](HANDOVER_agy.md) | Antigravity IDE 4-persona delivery pipeline & skill integration | Antigravity IDE |
