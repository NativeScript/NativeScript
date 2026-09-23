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
- [Code Comments](tools/notes/CodeComments.md): comment rules for all TypeScript edits (minimal, JSDoc on public API only).
- [Core Platform Modules](tools/notes/CorePlatformModules.md): required reading before touching `packages/core` modules (`.ios.ts`/`.android.ts` split, handwritten `.d.ts`).
- [Contributing / Commit Guidelines](tools/notes/CONTRIBUTING.md): commit message format used to generate changelogs.
- [Writing Unit Tests](tools/notes/WritingUnitTests.md): expectations for test coverage with changes.

## Agent Skills

Repository skills live in `.agent/skills/<skill-name>/SKILL.md` — each is a workflow for one kind of task (feat, fix, refactor, ...), with YAML frontmatter (`name`, `description`). Before starting a task a skill's description covers, read that SKILL.md and follow it. (`.claude/skills` is a symlink to `.agent/skills` so Claude Code discovers them automatically.)

- [feat](.agent/skills/feat/SKILL.md) — build a feature end-to-end (issue → plan → implement → test → PR).
- [fix](.agent/skills/fix/SKILL.md) — debug and fix a bug end-to-end (trace → root cause → fix → test → PR).
- [refactor](.agent/skills/refactor/SKILL.md) — restructure code without changing behavior.
- [unit-testing](.agent/skills/unit-testing/SKILL.md) — running and writing Vitest specs.

Conventions and how-to knowledge live as docs in `tools/notes/` (see [Key Documentation](#key-documentation)) — the single source of truth. A skill references the docs it depends on through relative symlinks in its `references/` folder, created with:

```bash
cd .agent/skills/<skill>/references/
ln -s ../../../../tools/notes/<Doc>.md <Doc>.md
```

To add a skill: create `.agent/skills/<kebab-case-name>/SKILL.md` with `name` and `description` frontmatter (the description states *when* to use it — that is what triggers loading), keep the body a short workflow that links docs via `./references/`, and list it here. When moving or renaming a doc, check for skill symlinks pointing at it: `grep -rl '<Doc>' .agent/skills/*/references/`.

## Platform-Specific Code

`packages/core` uses filename suffixes (`foo.ios.ts` / `foo.android.ts`, shared `foo-common.ts`, handwritten `foo.d.ts`) to split implementations per platform; the bundler picks the right file at build time. Read [Core Platform Modules](tools/notes/CorePlatformModules.md) before touching any module there — the short version: keep both platform files in parity, and update the neighboring `.d.ts` whenever a public API changes.

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
