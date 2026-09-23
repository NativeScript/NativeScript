---
name: fix
description: Debug and fix a bug end-to-end (GitHub issue or free-text report → trace → root cause → fix → test → PR). Use anytime you need to fix broken, throwing, or misbehaving code in this workspace.
argument-hint: [issue-number-or-description]
---

# Bug Fix Workflow

Conventions this workflow depends on (read the ones your change touches before writing code):

- [CorePlatformModules.md](./references/CorePlatformModules.md) — required before touching `packages/core` (platform-split files, handwritten `.d.ts`).
- [CodeComments.md](./references/CodeComments.md) — comment rules for all TypeScript edits.
- [WritingUnitTests.md](./references/WritingUnitTests.md) — test expectations and environment constraints.
- [CONTRIBUTING.md](./references/CONTRIBUTING.md) — commit message format.

## Phase 1: Get the bug

- If given a GitHub issue number, fetch it: `gh issue view <number> --json title,body,labels,comments`. Otherwise collect the report from the user.
- Extract the reproduction steps, environment (platform, versions), and any stack trace or error message — these point at the files to read first.

## Phase 2: Trace the code path

- Follow the failure from entry point to the error site. For `packages/core`, read BOTH platform files — a bug on one platform often means the implementations diverged.
- Keep claims honest: distinguish what you proved by reading code (quote `file:line`) from what you suspect. Do not present a hunch as the root cause.

## Phase 3: Root cause

- Confirm the mechanism before fixing. When the logic is unit-testable, write a failing spec that reproduces the bug — it becomes the proof and the regression guard.
- Grep for the same pattern elsewhere in the package; a bug rarely lives in only one place. List every instance found.

## Phase 4: Fix

- Apply the smallest change that fixes the root cause, not the symptom. Fix all instances found in the spread check.
- Keep `.ios.ts` / `.android.ts` in parity; if the fix changes a public API, update the neighboring `.d.ts` in the same change.

## Phase 5: Verify

- The failing spec from Phase 3 must go green, and the full package target (`npx nx run core:test`) must pass.
- Behavior only observable on a real device/simulator belongs in `apps/automated`; note it for the PR's manual test scenarios.

## Phase 6: Finish

- Format: `npx nx format:write`.
- Commit with the conventional format, e.g. `fix(core): <subject>`.
- Open the PR with `gh`, following [the PR template](../../../.github/PULL_REQUEST_TEMPLATE.md): reference the issue and include the regression test.
