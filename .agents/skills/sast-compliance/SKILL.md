---
name: sast-compliance
description: Strict engineering rules, Semgrep/OWASP Top 10 standards, dependency vulnerability audit, zero-PII leak guarantees, and secret hygiene for Static Application Security Testing (SAST).
---

# SAST Compliance & Application Security Skill

Use this skill when auditing or hardening the application against Static Application Security Testing (SAST) rules, Semgrep criteria, OWASP Top 10 guidelines, and zero-PII leak mandates.

## 1. Scope & Standards
This skill enforces zero-defect security posture across:
1. **OWASP Top 10 Guidelines**:
   - A01: Broken Access Control (stateless, zero-auth, non-bypassable clinical single source of truth).
   - A02: Cryptographic Failures & Secret Leakage (zero hardcoded API keys, environment variable hygiene).
   - A03: Injection & XSS (forbids `dangerouslySetInnerHTML`, enforces `SafeNarrative.tsx`, XML prompt delimiters).
   - A04: Insecure Design (strict tier 0–4 governance, deterministic clinical engine override).
   - A05: Security Misconfiguration (hardened HTTP headers: CSP, nosniff, DENY, Referrer-Policy).
   - A06: Vulnerable and Outdated Components (mandatory `npm audit` zero-vulnerability gate).
   - A07: Identification and Authentication Failures (Zero-PII architecture; no session fixation or cookie vulnerabilities).
   - A08: Software and Data Integrity Failures (JSON Schema contract synchronization).
   - A09: Security Logging and Monitoring Failures (ephemeral error handling, zero PII logged to consoles or disks).
   - A10: Server-Side Request Forgery (SSRF) (strictly restricted outgoing calls to Google Gemini API only).

## 2. Core Prohibitions (AST Scan Rules)
The AST and static pattern scanners MUST assert:
- **Zero Raw HTML Injection**: `dangerouslySetInnerHTML` is STRICTLY FORBIDDEN in all `.tsx` and `.ts` files. All rich text and markdown narratives must be rendered via `<SafeNarrative />`.
- **Zero Dynamic Code Execution**: `eval()`, `new Function()`, and arbitrary setTimeout string evaluation are strictly prohibited.
- **Zero Client-Side Persistent Storage**: `localStorage`, `sessionStorage`, `indexedDB`, and `document.cookie` are prohibited in `src/`.
- **Zero Hardcoded Secrets**: Regex scans for patterns like `AIza[0-9A-Za-z-_]{35}`, `sk-[0-9A-Za-z]{20,}`, or hardcoded bearer tokens.
- **Zero Direct Script Sourcing**: External scripts cannot be dynamically inserted into the DOM.

## 3. Network Boundary & LLM Guardrails
- **Prompt Injection Defense**:
  - All clinical evaluation payloads sent to `@google/genai` must be enclosed in structural XML delimiters: `<clinical_evaluation>...</clinical_evaluation>`.
  - System instructions must be isolated using the Gemini API `systemInstruction` field rather than string-concatenated user prompts.
- **Network Boundary PII Scrubbing**:
  - Request payloads must pass through an in-memory regex scrubber to redact accidental email addresses, phone numbers, Emirates IDs, or patient names before sending to external LLM endpoints.
- **Ephemeral Multimodal In-Memory Processing**:
  - Lab document / image uploads (`/api/parse-semen-lab`) must be held exclusively in RAM (`Buffer` / Base64 string) and NEVER written to the local filesystem or disk caches.
  - The extraction schema must restrict model responses strictly to numeric values (`volumeMl`, `concentrationMMl`, `totalMotilityPct`, `normalMorphologyPct`). Any extraneous text or identifiers must be rejected.

## 4. HTTP Security Headers
The server (`server.ts`) MUST enforce:
- `Content-Security-Policy`: Restricts default sources to `'self'`, fonts to Google Fonts, and connections exclusively to `'self'` and `https://generativelanguage.googleapis.com`.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing attacks.
- `X-Frame-Options: DENY`: Prevents clickjacking and framing attacks.
- `X-XSS-Protection: 1; mode=block`: Legacy browser XSS filter.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`: Blocks unwanted hardware access.

## 5. Verification Commands
Execute the automated security and SAST audit:
```bash
# 1. Dependency vulnerability scan (must return 0 vulnerabilities)
npm audit

# 2. Automated compliance scan suite (includes AST Zero-PII, SAST, ARIA, and Contracts)
npm run test:compliance

# 3. TypeScript strict typecheck
npm run lint
```
