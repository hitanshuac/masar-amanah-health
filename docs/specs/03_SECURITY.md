# Security & Access Document (03_SECURITY.md)

> **Platform:** Masar Amanah Health (مسار أمانة)  
> **Governance Standard:** Zero-PII Deterministic Male Reproductive Health Architecture  
> **Deployment Target:** Google Cloud Run (Port 3000 App / Port 8080 Reverse Proxy)  
> **Security Baseline:** OWASP Top 10 · Semgrep SAST · WCAG 2.1 AA · Zero Data Retention  

---

## 1. Authentication Strategy

### Zero-Auth, Stateless Architecture (ADR-1)
Male reproductive health in the GCC/UAE region carries cultural sensitivities where perceived privacy risks, potential insurance/employer disclosures, and social stigma frequently cause a 2–3 year clinical delay in seeking care.

Masar Amanah Health eliminates the entire authentication attack surface by operating on a **Zero-Auth, Zero-PII** model:
- **No User Accounts:** No usernames, passwords, OAuth tokens, email registrations, or phone numbers are ever solicited or accepted.
- **100% In-Memory Ephemeral React State:** All user answers, slider values, and lab inputs reside solely in volatile client memory (`useState`).
- **Instant Volatile Teardown:** Refreshing the browser, closing the tab, or clicking "Reset Session" immediately wipes all session state from memory.
- **Zero Persistent Client Storage:** AST-verified prohibition of `localStorage`, `sessionStorage`, `indexedDB`, and `document.cookie`.

---

## 2. Role-Based Access Control (RBAC) & Trust Boundaries

The system defines three distinct, strictly enforced operational roles:

| Role | Environment | Permissions & Data Access | Threat Boundary |
|---|---|---|---|
| **Patient / Citizen** | Client (Browser) | - Answer anonymous screening questions.<br>- Upload optional lab reports for in-memory analysis.<br>- Adjust 90-day lifestyle simulator.<br>- Export anonymous PDF or HL7 FHIR R4 JSON locally. | Cannot alter clinical engine algorithms; cannot view API keys; cannot persist records to server. |
| **Clinician Companion** | Server (`/api/contextualize`) | - Rephrase verified evaluation JSON into structured Arabic/English narrative.<br>- Execute Gemini 2.5 Flash with strict cultural system prompt.<br>- Fallback to deterministic template in <10ms if unauthenticated or rate-limited. | Strictly bounded by deterministic clinical engine; **NEVER** allowed to upgrade, downgrade, or alter clinical triage tiers or triggered rules. |
| **System Auditor** | Headless CLI / CI (`scripts/`) | - Run 14-scenario automated clinical test harness (`npm run test:clinical`).<br>- Run 6-scan compliance & SAST test suite (`npm run test:compliance`).<br>- Verify AST invariants and bundle budgets. | Read-only execution mode; zero modification of production data; zero external network egress. |

---

## 3. Secret Management & Setup Hygiene

### Credential Isolation
1. **Zero Hardcoded Secrets:** No API keys, credentials, tokens, or private secrets are permitted in the codebase.
2. **Server-Side Environment Variables:** API credentials (e.g., `GEMINI_API_KEY`, `APP_PORT`) are read strictly on the server via `process.env` and `dotenv`.
3. **No Client-Side Leaks:** Vite configuration strictly excludes `VITE_` prefixes on secret variables. The client application communicates with Gemini exclusively through the backend reverse proxy (`/api/contextualize`, `/api/parse-semen-lab`), never contacting Google Gemini directly from the client.
4. **Git Repository Hygiene:**
   - `.env`, `.env.local`, and `*.log` are strictly ignored via `.gitignore`.
   - `.env.example` provides non-sensitive variable names with dummy placeholders (`MY_GEMINI_API_KEY`).
5. **Autonomous GitHub Secret Injection (`setup-secrets` protocol):**
   - CI/CD credentials are provisioned via the GitHub CLI:
     ```bash
     gh secret set GEMINI_API_KEY -b"<PROVIDED_VALUE>"
     ```
   - Agent workflows never output or log secret values in conversation logs or artifacts.

---

## 4. Data Privacy, Multimodal In-Memory Stripping & Network Boundary PII Guards

### Ephemeral Multimodal In-Memory Stripping (`/api/parse-semen-lab`)
When a user uploads a semen analysis lab report image or PDF:
1. **Pure RAM Ingestion:** Uploaded base64 strings are processed entirely in memory as transient buffers. **Zero bytes are written to the filesystem, temporary folders, or disk caches.**
2. **Deterministic Numeric Extraction:** Gemini 2.5 Flash Vision is constrained to extract ONLY four numeric WHO 6th Edition values:
   - Semen Volume (`volumeMl`)
   - Sperm Concentration (`concentrationMMl`)
   - Total Motility (`totalMotilityPct`)
   - Normal Morphology (`normalMorphologyPct`)
3. **Metadata & PII Scrubbing:** All patient names, national IDs, doctor notes, lab numbers, and clinic addresses present in the image are actively ignored and excluded from the JSON response schema.
4. **Immediate Garbage Collection:** Upon API response completion, the in-memory buffer reference is released for garbage collection.

### Network Boundary PII Guards (`/api/contextualize`)
1. **Strict Payload Contract:** Requests must conform to `verifiedEvaluationJson`. Any unrecognized fields or unexpected identifiers trigger an immediate `ValidationError` (HTTP 400).
2. **Network Boundary PII Redaction:** Inbound payloads are scanned using comprehensive regex patterns:
   - Email addresses: `[\w.-]+@[\w.-]+\.\w{2,}`
   - Phone numbers: `(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}`
   - Emirates IDs / National IDs: `784-\d{4}-\d{7}-\d{1}`
   - Names / Personal IDs: `(name|id|patient|dob|mrn)\s*[:=]\s*['"]?[^'"\n]+`
   Any detected PII is actively redacted (`[REDACTED]`) before the prompt is transmitted to external LLM infrastructure.
3. **Prompt Injection Delimiters:** Payloads sent to the LLM are enclosed in explicit XML tags:
   ```xml
   <clinical_evaluation>
   { ... deterministic engine output ... }
   </clinical_evaluation>
   ```
   This prevents malicious user inputs or adversarial report texts from hijacking model system instructions.

### Agent Scratch Path & OPSEC Sanitization
- Local development scratchpads, debug logs, and build artifacts are restricted to `.git`-ignored paths (`dist/`, `build/`).
- Prior to submission or commit, file paths are sanitized to prevent exposing local usernames, operating system directory structures, or developer environments.

---

## 5. Network Security, Security Headers & SAST

### Rate Limiting (ENG-5)
- Server implements an in-memory sliding window rate limiter: **Maximum 15 requests per minute per IP address**.
- Exceeding the rate limit returns HTTP 429 with a standardized `Retry-After` header.

### Comprehensive HTTP Security Headers (ENG-8)
Every response emitted by `server.ts` includes defense-in-depth security headers:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### XSS Prevention & AST Enforcement
- **Prohibition of `dangerouslySetInnerHTML`:** AST scanners fail the build if `dangerouslySetInnerHTML` is used in any component.
- **Safe Narrative Markdown Engine (`SafeNarrative.tsx`):** All markdown content is parsed into native React DOM elements (`<h4>`, `<ul>`, `<li>`, `<p>`, `<strong>`), completely preventing stored and reflected XSS attacks.

### Automated SAST & Vulnerability Gates
The project enforces automated continuous compliance through `npm run test`:
1. `npm audit`: Guarantees 0 high, moderate, or low dependency vulnerabilities.
2. `npm run test:compliance`: Runs AST scans verifying Zero-PII storage, zero circular dependencies, WCAG 2.1 AA accessibility, bundle budgets, schema synchronization, and SAST rulesets.
3. `npm run lint`: Verifies strict TypeScript type safety with zero `any` slips in API boundaries.
