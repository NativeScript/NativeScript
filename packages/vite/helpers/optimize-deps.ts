/**
 * Canonical list of packages that must NEVER be pre-bundled by Vite's
 * dependency scanner.
 *
 * The most load-bearing entries are `module` / `node:module`: they are aliased
 * to local polyfills/shims (see `helpers/css-tree.ts` and the `node:module`
 * alias in `configuration/base.ts`). Vite's depscanner has no awareness of those
 * aliases and, if allowed to pre-bundle them, the HMR `/ns/m/` pipeline can't map
 * the pre-bundle URL back to a real package — dropping the
 * `import { createRequire } from 'module'` line and crashing on device with
 * `ReferenceError: createRequire is not defined` inside `css-tree`.
 *
 * Centralized here so base/angular configs share one source of truth instead of
 * hand-maintaining divergent copies. See
 * docs/plans/011-dedupe-optimizedeps-exclude.md.
 */
export const NS_OPTIMIZE_DEPS_EXCLUDE = ['@nativescript/core', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript', 'module', 'node:module'] as const;
