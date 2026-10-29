# Design Specification — Masar Amanah Health (مسار أمانة)

> Reference: https://ai.studio/apps/8e61219d-bfd3-42ec-b3fe-e24c5c8bfccc
> Brand: Masar Amanah Health · Emerald/Slate palette · Cairo + Plus Jakarta Sans typography
> Input: docs/specs/PRODUCT_SPEC.md (PM-1 through PM-35)

---

## Design Tokens

All design values are defined in [`src/index.css`](../../src/index.css) and Tailwind v4 config. No hex/px literals outside these sources.

| Token Category | Values |
|---|---|
| **Brand Colors** | `emerald-800` (primary), `emerald-950` (dark), `emerald-400` (accent), `slate-900` (text), `slate-50` (canvas) |
| **Severity Colors** | `rose-600` (Tier 1), `amber-600` (Tier 2), `sky-600` (Tier 3), `emerald-700` (Tier 4) |
| **Typography** | Cairo (Arabic primary), Plus Jakarta Sans (Latin primary), JetBrains Mono (code/IDs) |
| **Radii** | `rounded-3xl` (cards), `rounded-2xl` (inner cards), `rounded-xl` (buttons), `rounded-lg` (pills) |
| **Spacing** | Tailwind v4 spacing scale (`p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`) |
| **Elevation** | `shadow-xs` (cards), `shadow-md` (buttons), `shadow-xl` (hero), `shadow-lg` (CTAs) |

## Layout Regions

```
┌───────────────────────────────────────────────────────────────────┐
│ R0: Zero-PII Assurance Banner (emerald-900, sticky top)          │
├───────────────────────────────────────────────────────────────────┤
│ R1: App Bar — Logo + Brand + Abu Dhabi badge | Actions + Lang    │
├───────────────────────────────────────────────────────────────────┤
│ R2: Step Indicator / Judge Demo Bar (System Auditor mode)        │
├───────────────────────────────────────────────────────────────────┤
│ R3: Content Area (max-w-4xl centered)                            │
│   ├── Welcome View (Step 0)                                      │
│   ├── Step 1: Safety Gate                                        │
│   ├── Step 2: Clinical History                                   │
│   ├── Step 3: Lifestyle + Semen Panel (Vision Dropzone)          │
│   └── Step 4: Results (Tier Card + Recovery Simulator +          │
│              Narrative + Question Chips + Facilities +           │
│              Audit Trail + Print Section with SVG QR)            │
├───────────────────────────────────────────────────────────────────┤
│ R4: Wizard Navigation Footer (Back / Next, Steps 1–3 only)      │
├───────────────────────────────────────────────────────────────────┤
│ R5: App Footer (Brand + GITEX badge + WHO/AUA citation)          │
└───────────────────────────────────────────────────────────────────┘
```

## Component List & State Requirements

| Component | States Required |
|---|---|
| **Hero Card** (WelcomeView) | default, hover-on-CTA, focus-visible-on-CTA |
| **Pipeline Stage Cards** | default, hover (border highlight) |
| **Toggle Switches** (red flags, history) | off, on, focus-visible, disabled |
| **Slider Inputs** (age, BMI, semen) | default, dragging, focus-visible, disabled |
| **Step Indicator** | active, completed, upcoming, focus-visible |
| **Navigation Buttons** | default, hover, active/pressed, focus-visible, disabled |
| **Circuit Breaker Modal** | closed, open (with tier-specific content) |
| **Privacy Modal** | closed, open |
| **Triage Tier Card** | 4 variants (Tier 1–4), each with severity colors |
| **Narrative Section** | loading (skeleton/spinner), loaded, error-fallback |
| **Facility Card** | default, hover, emergency-variant |
| **Audit Trail Accordion** | collapsed, expanded |
| **Copy Button** | default, copied (success feedback) |
| **Print Button** | default, hover |
| **Language Switcher** | EN-active, AR-active |
| **Judge Demo Bar** (R1/R2) | default, active-preset, benchmark-running, benchmark-completed |
| **Spermatogenesis Timeline Card** | default, counterfactual-toggled, delta-updating, motion-reduced |
| **Lab Scanner Dropzone** | default, drag-over, extracting-skeleton, extracted-badge, error |
| **SVG QR Interoperability Block** | default, print-rendered, high-contrast |
| **Question Chip Pills** | default, hover, active/selected, skeleton-loading, disabled |

## UX Requirements (traced by QA)

- UX-1: Solid surfaces only. No `backdrop-filter`, no `rgba()`/alpha backgrounds, no blurred `box-shadow`. Elevation = solid shadow tokens.
- UX-2: Cards = solid background on `slate-50` canvas, 1px border, radius `rounded-2xl` or `rounded-3xl`.
- UX-3: Header items never wrap: `white-space: nowrap`; brand and actions `flex-shrink: 0`.
- UX-4: Step indicator lives ONLY in R2. No step navigation in R1.
- UX-5: No duplicate filter/navigation bars.
- UX-6: Active step = `emerald-800` fill + white text.
- UX-7: Layout = single column, max-w-4xl centered. No 12-col grid needed for this wizard flow.
- UX-8: Spacing only from Tailwind scale; colors only from the token palette. No magic numbers.
- UX-9: Every icon-only control has `aria-label`; focus ring = `ring-2 ring-emerald-600 ring-offset-2`; text contrast ≥ 4.5:1.
- UX-10: Narrative provenance badge shows model source (`gemini-2.5-flash` or `deterministic_cultural_engine`).
- UX-11: All animations respect `prefers-reduced-motion: reduce` via Tailwind `motion-safe:` variants.
- UX-12: WelcomeView hero decorative elements use solid gradient backgrounds instead of `blur()` or `rgba()` alpha.
- UX-13: Privacy trust banner within hero uses solid `bg-emerald-800` instead of `bg-white/10 backdrop-blur-xs`.
- UX-14: Step transitions show skeleton placeholders during content swap.
- UX-15: Narrative rendering uses safe text parsing — no `dangerouslySetInnerHTML` for user/LLM-generated content.
- UX-16: `animate-fade-in`, `animate-pulse`, and spinner are wrapped in `motion-safe:` Tailwind variants.
- UX-17: All interactive elements have visible `focus-visible` ring.
- UX-18: Print stylesheet with proper page breaks, monospace for IDs, hidden interactive elements.
- UX-19: Step indicator has `role="tablist"` / `role="tab"` with `aria-selected`.
- UX-20: Semen panel range inputs have `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-label`.
- UX-21: Solid-surface Judge Demo Bar in R1/R2 with active preset pill indicator (`bg-emerald-600 text-white`, solid surfaces only, zero rgba/backdrop-blur) and benchmark runner trigger button.
- UX-22: 90-Day Spermatogenesis Timeline Card on Step 4 with animated urgency score delta gauge (using `motion-safe:transition-all motion-safe:duration-500` and respecting `prefers-reduced-motion`) and modifiable risk factor toggle controls.
- UX-23: Dropzone/Upload button on Step 3 for Semen Lab Vision Extraction with solid emerald "Extracted to Sliders — Verify Values" verification badge (zero rgba/backdrop-blur).
- UX-24: Pure SVG QR Code block in the @media print Doctor Discussion Sheet and Clinician Companion view with high print contrast, scalable vector rendering, and `break-inside: avoid`.
- UX-25: Solid-surface question chip pills below `SafeNarrative.tsx` with 44px touch targets for mobile accessibility (WCAG 2.1 Target Size), bilingual AR/EN support, active/selected states (`bg-emerald-800 text-white`), skeleton loading states (`motion-safe:animate-pulse bg-slate-200`), and zero rgba/backdrop-blur.

## Responsive Breakpoints

| Width | Behavior |
|---|---|
| ≤ 640px (mobile) | Single column, stacked cards, full-width buttons, compact header |
| 641–1024px (tablet) | Single column with wider padding, side-by-side facility cards |
| ≥ 1025px (desktop) | max-w-4xl centered, comfortable spacing, horizontal pipeline cards |

## RTL (Arabic) Support

- `dir="rtl"` on root and content containers
- Arrow icons rotate 180° in RTL mode
- Cairo font primary, Plus Jakarta Sans fallback
- Border-start/end for directional borders (e.g., `border-s-4` on narrative headings)

## Deviations from UX Reference Designer Base

| Item | Deviation | Reason |
|---|---|---|
| Layout grid | Single column wizard instead of 8/4 feed grid | Health screening is a sequential wizard, not a feed |
| Tab bar (R2) | Step indicator instead of topic tabs | Wizard progression, not content categories |
| Components | Clinical-specific: toggle switches, range sliders, tier cards, circuit breaker modal | Domain-specific medical UI |
| Color system | Emerald-dominant instead of Material blue | Brand identity for Masar Amanah (green = health + Islamic cultural resonance) |

---

## Acceptance

- [x] Reference recorded (ai.studio deployment URL)
- [x] Token table links to src/index.css
- [x] Region map covers all 6 regions (R0–R5)
- [x] All components listed with state requirements (including Phase-2 Hackathon components)
- [x] Every rule above appears as UX-n in the spec (UX-1 through UX-25)
- [x] Responsive breakpoints defined for 375, 768, 1440px equivalents
- [x] Zero rgba() or backdrop-blur violations across all components (strict solid-surface design system)

## Handoff
→ `fullstack-architect`: Component list, state requirements, UX-15 (safe rendering), UX-20 (ARIA), UX-21 (demo presets), UX-22 (recovery math UI), UX-23 (dropzone), UX-24 (SVG QR), UX-25 (question chips).
→ `qa-production-guard`: All UX-n lines (UX-1 through UX-25) + screenshot comparisons at 375px and 1440px + zero rgba/backdrop-blur audit.
