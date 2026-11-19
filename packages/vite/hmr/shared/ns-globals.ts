/* eslint-disable no-var -- ambient global declarations must use `var`: only `var`
   in `declare global` registers the property on `typeof globalThis` (see header). */
/**
 * Ambient typings for the `__NS_*` / `__ns*` globals the HMR runtime stashes
 * on `globalThis`. State shared between `bundle.mjs` and served modules
 * lives on the dev globals object instead (`hmr/shared/runtime/dev-globals.ts`),
 * and state used within one of those worlds is module state.
 *
 * Conventions:
 *   - Every key is `var … | undefined` — `var` (not `const`/`let`) is what adds the
 *     property to `typeof globalThis`, so `globalThis.__NS_X` access
 *     type-checks; `| undefined` reflects that these are populated lazily at runtime.
 *   - Hooks get precise types. Keys holding framework instances, native
 *     objects, module registries, or arbitrary diagnostic payloads are
 *     intentionally `any` — typing them precisely would couple this
 *     shared file to device internals and risk breaking write sites elsewhere in
 *     the package.
 *   - The runtime dev-host API is NOT a global at all — it is the
 *     `ns:module` builtin module, read through
 *     `hmr/shared/runtime/browser-runtime-contract.ts`.
 *
 * This module emits no runtime code (ambient declaration only) and is picked up
 * project-wide via the package tsconfig include (all .ts files).
 */

declare global {
	// ── Function hooks (typed where the signature is stable; `any` otherwise) ──
	var __NS_HMR_IMPORT__: ((url: string) => Promise<unknown>) | undefined;

	// ── Native / framework / registry objects (intentionally `any`) ──
	var __NS_DEV_PLACEHOLDER_ROOT_VIEW__: any;
	var __NS_DEV_PLACEHOLDER_ROOT_EARLY__: any;
	var __NS_HMR_WORKERS__: any;
	var __nsRequire: any;
	var __nsVendorRequire: any;
	var __nsVendorRegistry: any;
}

export {};
