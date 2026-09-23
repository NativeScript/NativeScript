---
name: unit-testing
description: How to run and write unit tests in this workspace (Vitest, colocated .spec.ts files, mocked native globals). Use when writing, changing, or running tests.
---

# Unit Testing

Tests are `*.spec.ts` files colocated with the source they cover, written with Vitest and run per package through Nx. See [WritingUnitTests.md](./references/WritingUnitTests.md) for the full guide.

## Running

```bash
npx nx run core:test              # all core tests
npx nx run core:test -t 'Name'    # isolate by describe/it name
npx nx run core:test --watch      # watch mode
```

Use `-t` to run only the tests related to your change first; run the full package target before finishing.

## Writing

- Use the standard Vitest API (`describe`, `it`, `expect`, `beforeEach`, `vi`). Globals are enabled, so imports from `vitest` are optional — match the style of neighboring specs.
- Place the spec next to the module: `packages/core/xml/index.spec.ts` covers `packages/core/xml/index.ts`.
- Every behavior change in shared (non-platform-specific) logic should add or extend a spec.

## Environment Constraints

- Tests run in Node, not on a device. `packages/core/vitest.setup.ts` stubs the platform globals (`__IOS__`, `__ANDROID__`, minimal `NSObject`-style mocks) so modules can load — real iOS/Android APIs do NOT exist here.
- If a test needs more native surface, extend the mocks in `vitest.setup.ts`; do not stub natives inline per spec.
- Behavior that depends on the real native runtime cannot be unit tested — it belongs in the `apps/automated` e2e suite, which requires a simulator/emulator. Do not attempt to run it unless explicitly asked.
- Keep tests deterministic: no network calls, no timing-sensitive assertions without fake timers (`vi.useFakeTimers()`).
