---
name: bundle-budget-scan
description: Inspects the Vite production build output, enforces strict gzip bundle size budgets, and detects accidental large library imports.
---

# Bundle Performance Budget Skill

Use this skill before release to verify lightweight delivery and fast First Contentful Paint (FCP).

## Budget Limits
- **Max Client JS (gzip):** `< 150 kB`
- **Max Client CSS (gzip):** `< 20 kB`
- **Max HTML:** `< 5 kB`

## Execution Workflow
1. Run `npm run build`.
2. Inspect the generated `dist/assets/` directory:
   - Check gzip size of the primary `.js` chunk.
   - Inspect for accidentally bundled heavy dependencies (e.g., importing entire `lodash` instead of standalone helpers).
3. Record the metrics in `docs/specs/QA_REPORT.md` under the Build Gate.
