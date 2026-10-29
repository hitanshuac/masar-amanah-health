# Architectural Decision Records (ADR) — Masar Amanah Health (مسار أمانة)

> GITEX 2026 · Future Health Challenge · Male Reproductive Health Track
> Platform: Masar Amanah Health · Algorithm: v1.4-AUA2021-WHO6-UAE

---

## ADR-1: Zero-PII Architecture (No Authentication, No Database)

- **Status:** Accepted
- **Context:** Male reproductive health in the UAE/GCC suffers from a 2–3 year delay in seeking clinical care due to perceived social stigma, concerns regarding employment or insurance disclosures, and privacy apprehension.
- **Decision:** Do NOT collect, transmit, or persist ANY personally identifiable information (PII). No names, phone numbers, email addresses, Emirates IDs, IP addresses, or device fingerprints. All user inputs live solely within browser React state and vanish on tab close or session reset.
- **Consequences:** 
  - Complete technical trust and zero data breach surface.
  - No user accounts or authentication provider needed.
  - Reports can be exported locally via formatted PDF/print or anonymous JSON audit files.

---

## ADR-2: Deterministic Clinical Rules Engine as Single Source of Truth

- **Status:** Accepted
- **Context:** Generative LLMs are prone to hallucination, sycophancy, or non-deterministic triage drift, which is unacceptable in clinical triage.
- **Decision:** All triage levels (`TIER_1_EMERGENCY`, `TIER_2_ANDROLOGY_SPECIALIST`, `TIER_3_PRIMARY_CARE`, `TIER_4_LIFESTYLE`), action codes, and guideline citations are computed by a deterministic pure TypeScript engine (`src/lib/clinicalEngine.ts`) based on WHO 6th Edition (2021) and AUA/ASRM clinical guidelines.
- **Consequences:**
  - 100% reproducible and verifiable clinical evaluations.
  - Zero-latency safety circuit breaker fires instantly for acute scrotal pain or testicular mass without waiting for LLM execution.
  - LLMs (Stage 4) are strictly restricted to cultural framing and narrative rephrasing; they can NEVER alter triage level or action code.

---

## ADR-3: Google Gemini 2.5 Flash as Cultural Rephraser

- **Status:** Accepted
- **Context:** Clinical output must bridge medical jargon and regional culture (Amanah, dignity, proactive family wellness) in both Modern Standard Arabic (الفصحى) and English.
- **Decision:** Use Google Gemini 2.5 Flash (`@google/genai` ^2.4.0) with temperature 0.2 and structured prompt constraints.
- **Consequences:**
  - Sub-second latency (~400–700ms) compared to heavier models.
  - Exceptional Modern Standard Arabic prose with respectful, empowering framing.
  - If the API key is absent, network drops, or rate limits occur, the system seamlessly falls back to a deterministic cultural template engine with zero UI disruption.

---

## ADR-4: Express + Vite Dual-Mode Architecture

- **Status:** Accepted
- **Context:** The application needs rapid local development with HMR while serving a production-ready container on Google Cloud Run.
- **Decision:** Use Express (`server.ts`) as the root server. In development, Express mounts Vite middlewares. In production, Express serves compiled static assets (`dist/`) while hosting `/api/contextualize` and `/api/health`.
- **Consequences:**
  - `GEMINI_API_KEY` remains strictly confidential on the server side, never exposed in client bundles.
  - Security headers (CSP, nosniff, DENY frame options) and IP rate limiting (15 req/min) are enforced centrally.
  - Runs in a single lightweight container on Cloud Run with low cold-start latency.

---

## ADR-5: Tailwind CSS v4 with `@tailwindcss/vite`

- **Status:** Accepted
- **Context:** Need modern, maintainable styling with RTL support for Arabic, dark mode readiness, and solid surfaces.
- **Decision:** Use Tailwind CSS v4 with native Vite integration, eliminating legacy PostCSS/autoprefixer configurations and providing instant CSS compilation.
- **Consequences:**
  - Clean `@import "tailwindcss";` entry point.
  - Native support for CSS custom properties and `@media (prefers-reduced-motion)`.
  - Full RTL layout compatibility with logical CSS properties (`ps-`, `pe-`, `border-s-`).

---

## ADR-6: SAST Compliance and Master-Sync 8-Phase Skill Migration

- **Status:** Accepted
- **Context:** Following the deprecation of Antigravity workflows on Oct 19, 2026, multi-phase orchestration and static application security testing (SAST) must be implemented as native Antigravity Skills. The application also requires automated SAST verification, OWASP Top 10 compliance, and secret hygiene.
- **Decision:**
  1. Migrate the 8-phase orchestration protocol (`master-sync`) into `.agents/skills/master-sync/SKILL.md` covering pre-flight AST checks, defensive contracts, SAST/dependency audit, clinical test suites, bundle budgets, documentation sync, error harvesting, and deployment readiness.
  2. Implement `.agents/skills/sast-compliance/SKILL.md` enforcing Semgrep/OWASP criteria: zero `dangerouslySetInnerHTML` (mandating `SafeNarrative.tsx`), zero hardcoded credentials, strict HTTP security headers (CSP, nosniff, DENY), and prompt injection XML delimiters.
  3. Formulate `docs/specs/03_SECURITY.md` establishing Zero-Auth, RBAC boundaries, in-memory multimodal lab stripping, and network boundary PII redaction.
  4. Expand `scripts/complianceScans.ts` to execute automated SAST & security scans as Scan 6 in `npm run test:compliance`.
- **Consequences:**
  - 100% compliance across 6 automated security & accessibility scans.
  - Full compatibility with the modern Antigravity skill architecture.
  - Zero PII attack surface and mathematically verifiable code safety.

