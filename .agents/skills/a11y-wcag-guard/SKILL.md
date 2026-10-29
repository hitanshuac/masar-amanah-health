---
name: a11y-wcag-guard
description: Audits the compiled web application for WCAG 2.1 AA compliance, missing ARIA tags, contrast failures, and keyboard navigability using axe-core.
---

# Accessibility (WCAG 2.1 AA) Guard Skill

Use this skill when asked to "audit accessibility", "check WCAG compliance", or "prepare UI for clinical review".

## Execution Workflow
1. Ensure the app is built (`npm run build`).
2. Run axe-core / pa11y headless check against the built HTML/components:
   ```bash
   npx --yes @axe-core/cli dist/index.html --tags wcag2a,wcag2aa
   ```
3. Verify specific healthcare UI criteria:
   - All sliders on Step 1 and Step 3 have explicit aria-label, aria-valuemin, aria-valuemax, and aria-valuenow.
   - Toggle buttons have role="switch" and aria-checked.
   - Color contrast ratio between text and solid surfaces is >= 4.5:1.
   - Interactive focus states have visible focus-visible:ring-2.
4. Output a summary report: Total Violations: 0 | Critical: 0 | Serious: 0.
