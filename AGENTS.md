# AGENTS.md - NativeScript

This is the source code for NativeScript — `@nativescript/core` and related packages. This guide outlines standard practices for AI agents working in this repository.

## Environment

- Use `npm` for package management. First-time setup: `npm run setup` (cleans and installs).
- This is an [Nx](https://nx.dev) workspace. Run targets with `npx nx run <project>:<target>`, e.g. `npx nx run core:test`.
- `npm start` opens an interactive menu of every workspace command (type to filter, ENTER to run). Each entry maps to an Nx command you can also run directly.

## Repository Layout

- `packages/core` — `@nativescript/core`, the framework itself (UI, styling, application lifecycle, native bridging).
- `packages/webpack5` — `@nativescript/webpack` build tooling.
- `packages/vite` — `@nativescript/vite` build tooling.
- `packages/types-ios`, `packages/types-android`, `packages/types-minimal`, `packages/types` — native platform TypeScript declarations.
- `packages/ui-mobile-base` — native (Java/Objective-C) UI base components.
- `packages/winter-tc` — WinterTC (web-interoperable runtime) compliance.
- `apps/toolbox` — preferred playground for local development and debugging core. Simple; use this most often.
- `apps/automated` — automated e2e test suite that runs on a device/simulator.
- `apps/ui` — more sophisticated test app for UI scenarios.

## Key Documentation

- [Development Workflow](tools/notes/DevelopmentWorkflow.md): definitive guide for setup, running tests, and test apps.
- [Coding Conventions](tools/notes/CodingConvention.md): style guide (tabs width 2, single quotes, semicolons, same-line braces).
- [Contributing / Commit Guidelines](tools/notes/CONTRIBUTING.md): commit message format used to generate changelogs.
- [Writing Unit Tests](tools/notes/WritingUnitTests.md): expectations for test coverage with changes.

## Agent Skills

Repository skills live in `.agent/skills/<skill-name>/SKILL.md` — each is a focused instruction set for one kind of task, with YAML frontmatter (`name`, `description`). Before starting a task a skill's description covers, read that SKILL.md and follow it. (`.claude/skills` is a symlink to `.agent/skills` so Claude Code discovers them automatically.)

- [ts-minimal-comments](.agent/skills/ts-minimal-comments/SKILL.md) — comment rules for all TypeScript edits.
- [core-platform-modules](.agent/skills/core-platform-modules/SKILL.md) — required reading before touching `packages/core` modules.
- [unit-testing](.agent/skills/unit-testing/SKILL.md) — running and writing Vitest specs.

To add a skill: create `.agent/skills/<kebab-case-name>/SKILL.md` with `name` and `description` frontmatter (the description states *when* to use it — that is what triggers loading), keep the body short and rule-shaped, and list it here.

## Platform-Specific Code

`packages/core` uses filename suffixes to split implementations per platform; the bundler picks the right file at build time:

- `foo.ios.ts` / `foo.android.ts` — platform implementations of the same module.
- `foo-common.ts` — shared logic both platform files extend.
- Handwritten `foo.d.ts` alongside them declares the merged public API. **When changing a public API, update the neighboring `.d.ts` file to match** — declarations are hand-maintained, not generated.

A change to one platform file usually needs a mirrored change in the other. Never import a `.ios.ts` file from an `.android.ts` file or from shared code.

## Testing

- Unit tests (Vitest) are colocated `*.spec.ts` files. Run with `npx nx run core:test`.
  - Watch mode: `npx nx run core:test --watch`
  - Single suite by describe name: `npx nx run core:test -t 'XmlParser'`
- Unit tests run in Node with NativeScript platform globals mocked in `packages/core/vitest.setup.ts` — they cannot exercise real native APIs. Behavior that touches iOS/Android at runtime is covered by the e2e suite: `npx nx run apps-automated:ios` or `npx nx run apps-automated:android` (requires a configured NativeScript environment with simulators/emulators).
- Prefer adding a unit test for logic changes; add or extend an `apps/automated` test for native runtime behavior.

## Formatting & Commits

- Prettier formats the workspace: `npx nx format:write` (also auto-runs on the pre-commit hook).
- Commit messages and PR titles follow the conventional format `type(scope): message` (e.g. `fix(core): ...`, `feat(ios): ...`) per the [commit guidelines](tools/notes/CONTRIBUTING.md#commit-messages).

## Pull Requests

- Use the `gh` CLI (GitHub CLI) for creating and managing pull requests.
- Follow the [PR template](.github/PULL_REQUEST_TEMPLATE.md): reference the related issue, ensure existing tests pass, and include tests for the change.
