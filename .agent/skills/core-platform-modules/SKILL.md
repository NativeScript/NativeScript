---
name: core-platform-modules
description: Conventions for the platform-split module structure in packages/core (.ios.ts/.android.ts files, -common.ts bases, handwritten .d.ts declarations). Use when adding or modifying any module in packages/core.
---

# Core Platform Modules

Modules in `packages/core` split per platform by filename suffix. The bundler resolves the suffix at build time, so `foo.ios.ts` and `foo.android.ts` are two implementations of the same module.

## File Anatomy

- `foo.ios.ts` / `foo.android.ts` — platform implementations. Both must export the same public API.
- `foo-common.ts` — shared logic; platform files import and extend it.
- `foo.d.ts` — handwritten declaration of the merged public API. NOT generated.

## Rules

- A change to one platform file usually requires a mirrored change in the other. Never update one side and leave the other diverged.
- When changing a public API, update the neighboring `.d.ts` file in the same change.
- Public API JSDoc belongs in the `.d.ts` file — it is what ships to consumers and feeds the API reference docs.
- NEVER import a `.ios.ts` or `.android.ts` file from `-common.ts` or other shared code. Shared code stays platform-agnostic; platform selection happens through the bundler.
- visionOS uses the iOS implementations; there is no `.visionos.ts` suffix.
- For runtime platform checks inside shared code, use the compile-time globals `__ANDROID__`, `__IOS__`, `__APPLE__`, `__VISIONOS__` (declared in `packages/core/global-types.d.ts`). Guarded branches are stripped from the other platform's build, so keep platform API access inside these guards.
- Native types (`android.*`, `UIKit`, `NS*`) may only be referenced in the matching platform file, never in shared code outside a platform guard.
