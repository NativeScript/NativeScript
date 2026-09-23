---
name: feat
description: Build a feature or enhancement end-to-end (GitHub issue or free-text description → plan → implement → test → PR). Use anytime you need to add functionality to a package in this workspace.
argument-hint: [issue-number-or-description]
---

# Feature Workflow

Conventions this workflow depends on (read the ones your change touches before writing code):

- [CorePlatformModules.md](./references/CorePlatformModules.md) — required before touching `packages/core` (platform-split files, handwritten `.d.ts`).
- [CodeComments.md](./references/CodeComments.md) — comment rules for all TypeScript edits.
- [WritingUnitTests.md](./references/WritingUnitTests.md) — test expectations and environment constraints.
- [CONTRIBUTING.md](./references/CONTRIBUTING.md) — commit message format.

## Phase 1: Understand

- If given a GitHub issue number, fetch it: `gh issue view <number> --json title,body,labels,comments`. Otherwise treat the input as a free-text description; if empty, ask for one.
- Summarize the user-facing goal, acceptance criteria, and edge cases before touching code.

## Phase 2: Ground in the codebase

- Find an existing module or feature similar to what you are building and use it as the pattern to follow — reference it by path in your plan.
- Map the touch surface: which package, which modules, and for `packages/core` whether the change lands in `-common.ts`, both platform files, or all three — plus the neighboring `.d.ts`.

## Phase 3: Plan

Present a short plan before implementing: files to create/edit with a one-liner each, the test strategy, and any public API changes (these require `.d.ts` updates). Prefer the simplest solution that reuses existing patterns.

## Phase 4: Implement

- Follow the referenced conventions. Keep `.ios.ts` / `.android.ts` in parity; never leave one side diverged.
- Public API changes update the neighboring `.d.ts` in the same change, with JSDoc in the `.d.ts`.

## Phase 5: Test

- Add or extend colocated `*.spec.ts` specs for shared-logic changes.
- Run the focused tests first (`npx nx run core:test -t 'Name'`), then the full package target (`npx nx run core:test`) — it must be green.
- Behavior that needs the real native runtime is covered in `apps/automated`, not unit tests; note it for the PR's manual test scenarios instead.

## Phase 6: Finish

- Format: `npx nx format:write`.
- Commit with the conventional format, e.g. `feat(core): <subject>`.
- Open the PR with `gh`, following [the PR template](../../../.github/PULL_REQUEST_TEMPLATE.md): reference the issue and include tests for the change.
