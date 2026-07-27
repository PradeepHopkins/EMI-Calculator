# AI Self-Healing Locators for Playwright

This document describes a safe, production-minded approach to self-healing flaky or broken locators using AI.

## Goal

When a selector fails, automatically propose a better locator, validate it rigorously, and only then apply it.

## 1) Detection Strategy

Trigger healing only on known locator-failure signals:

- Timeout waiting for locator to be visible/clickable.
- Strict mode violations with zero or multiple matches.
- Detached element / stale DOM references.
- Repeated retry failures for the same step.

Capture rich context for diagnosis:

- Failed selector and action type (click, fill, expect-visible).
- URL, test name, step text, browser/device.
- Accessibility snapshot and compact DOM snippet around likely target region.
- Nearby labels, button text, placeholder text, role hints.
- Screenshot and optional trace segment.

Practical rule:

- Attempt normal Playwright retry first.
- Start AI healing only after first deterministic failure to avoid unnecessary model calls.

## 2) AI Prompt Approach

Use a constrained prompt that asks for ranked candidates and confidence, not free-form code edits.

Recommended input to the model:

- Intent: what the test step is trying to do.
- Old selector and failure message.
- Relevant DOM/a11y context (trimmed to avoid token noise).
- Allowed selector strategy order:
  1. getByRole with accessible name
  2. getByLabel / getByPlaceholder
  3. getByTestId
  4. CSS as last resort

Expected model output schema:

```json
{
  "candidates": [
    {
      "selector": "page.getByRole('button', { name: 'Calculate' })",
      "strategy": "role-name",
      "confidence": 0.92,
      "rationale": "Matches accessible button name visible in snapshot"
    }
  ],
  "notes": "Prefer role selectors over brittle CSS"
}
```

Prompt guardrails:

- Require max 3 candidates.
- Require confidence score per candidate.
- Disallow XPath unless no semantic option exists.
- Reject selectors with positional fragility like :nth-child unless explicitly justified.

## 3) Validation Before Applying Any Fix

Never auto-commit AI suggestions without runtime checks.

Validation pipeline:

1. Syntax gate
- Ensure candidate parses and compiles.
- Ensure it references supported Playwright selector APIs.

2. Uniqueness gate
- Candidate should resolve to exactly 1 element in current page state.

3. Actionability gate
- Element must be visible and enabled for interaction.
- For fill steps, target should be editable input/textarea.

4. Intent gate
- Verify semantic consistency:
  - role/name/label aligns with step intent.
  - optional text similarity between expected label and actual accessible name.

5. Stability gate
- Re-run candidate check across multiple retries or navigation refresh.
- Optional: verify in at least one additional browser project if available.

6. Regression gate
- Execute a focused subset of related tests before writing file changes.

Apply policy:

- Auto-apply only if confidence >= 0.85 and all gates pass.
- Otherwise create a suggestion artifact for human review.

## 4) Safe Apply Workflow

Recommended workflow:

1. Detect failure.
2. Generate candidates via AI.
3. Validate candidates in memory (no file edits).
4. Pick best passing candidate.
5. Run targeted regression.
6. Apply patch to source file.
7. Re-run full impacted suite.
8. Log old selector, new selector, confidence, and evidence.

Rollback rules:

- If post-apply regression fails, revert the locator patch and mark candidate as rejected.

## 5) Working POC (Bonus)

The snippet below shows a minimal healing wrapper you can integrate around flaky steps.

```ts
import { expect, Locator, Page } from '@playwright/test';

type Candidate = {
  selectorFactory: (page: Page) => Locator;
  confidence: number;
  strategy: string;
};

async function validateCandidate(page: Page, candidate: Candidate): Promise<boolean> {
  const locator = candidate.selectorFactory(page);
  const count = await locator.count();
  if (count !== 1) return false;

  await expect(locator.first()).toBeVisible({ timeout: 2000 });
  return await locator.first().isEnabled();
}

export async function healAndClick(
  page: Page,
  primary: () => Locator,
  aiCandidates: Candidate[],
): Promise<{ healed: boolean; strategy?: string }> {
  try {
    await primary().click({ timeout: 2000 });
    return { healed: false };
  } catch {
    for (const candidate of aiCandidates) {
      if (candidate.confidence < 0.85) continue;
      const ok = await validateCandidate(page, candidate);
      if (!ok) continue;

      await candidate.selectorFactory(page).click();
      return { healed: true, strategy: candidate.strategy };
    }

    throw new Error('Self-healing failed: no valid locator candidate passed validation.');
  }
}
```

Example candidate set for a broken Calculate button selector:

```ts
const candidates = [
  {
    selectorFactory: (page: Page) => page.getByRole('button', { name: 'Calculate' }),
    confidence: 0.92,
    strategy: 'role-name',
  },
  {
    selectorFactory: (page: Page) => page.getByText('Calculate', { exact: true }),
    confidence: 0.78,
    strategy: 'text',
  },
];
```

## 6) Where to Plug This In (This Repo)

Good integration points:

- Shared page-object action helpers in pages classes.
- Step-level wrappers in step-definitions for click/fill/assert operations.
- A utility module under utils for validation and candidate ranking.

Suggested first rollout:

- Start with read-only suggestion mode in CI.
- Collect metrics for one week.
- Enable guarded auto-apply only for high-confidence, low-risk actions.

## 7) Metrics to Track

Track these to prove value and control risk:

- Healing attempt rate.
- Successful heal rate.
- False-heal rate (healed but semantically wrong).
- Mean additional test latency.
- Number of prevented flaky failures.

A healthy system reduces flaky failures without increasing silent regressions.
