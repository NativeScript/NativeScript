---
name: refactor
description: Restructure existing code without changing behavior (scope → baseline tests → small verified steps → PR). Use anytime you need to clean up, reorganize, or simplify code in this workspace.
argument-hint: [scope-or-description]
---

# Refactor Workflow

Conventions this workflow depends on (read the ones your change touches before writing code):

- [CorePlatformModules.md](./references/CorePlatformModules.md) — required before touching `packages/core` (platform-split files, handwritten `.d.ts`).
- [CodeComments.md](./references/CodeComments.md) — comment rules for all TypeScript edits.
- [WritingUnitTests.md](./references/WritingUnitTests.md) — test expectations and environment constraints.
- [CONTRIBUTING.md](./references/CONTRIBUTING.md) — commit message format.

## Phase 1: Scope

- Define what is being restructured and, explicitly, what "unchanged behavior" means for it: same public API, same observable behavior on both platforms.
- Public API changes are NOT refactors — if the `.d.ts` surface must change, stop and confirm the scope with the user first.

## Phase 2: Baseline

- Run the affected package's tests BEFORE touching anything (`npx nx run core:test`); they must be green.
- Where the code being restructured has no spec coverage, add specs first to lock in current behavior — they are the safety net for every step that follows.

## Phase 3: Restructure in small steps

- Work in small, independently green steps; run the focused tests between steps.
- Keep `.ios.ts` / `.android.ts` in parity at every step — moving shared logic into `-common.ts` is a common refactor here, and both platform files must be updated together.
- Delete dead and commented-out code you uncover; do not carry it along.

## Phase 4: Finish

- Full package target green (`npx nx run core:test`), then format: `npx nx format:write`.
- Commit with the conventional format, e.g. `refactor(core): <subject>`.
- Open the PR with `gh`, following [the PR template](../../../.github/PULL_REQUEST_TEMPLATE.md); state that behavior is unchanged and how that was verified.
