/* eslint-disable no-var -- ambient global declarations must use `var`: only `var`
   in `declare global` registers the property on `typeof globalThis` (see header). */
/**
 * Ambient typings for the `__NS_*` / `__ns*` globals the HMR runtime stashes on
 * `globalThis`. One `declare global` here replaces the scattered
 * `(globalThis as any).__NS_X` casts across the device client + entry runtime:
 * consumers read/write `globalThis.__NS_X` directly and get a real type, and the
 * per-file `declare const __NS_X__` duplicates collapse to this single source of
 * truth.
 *
 * Conventions:
 *   - Every key is `var … | undefined` — `var` (not `const`/`let`) is what adds the
 *     property to `typeof globalThis`, so both bare references (Vite `define`
 *     substitutions like `__NS_ENV_VERBOSE__`) and `globalThis.__NS_X` access
 *     type-check; `| undefined` reflects that these are populated lazily at runtime.
 *   - Primitive flags/counters/urls get precise types. Keys holding framework
 *     instances, native objects, ASTs, module registries, or arbitrary diagnostic
 *     payloads are intentionally `any` — typing them precisely would couple this
 *     shared file to device internals and risk breaking write sites elsewhere in
 *     the package.
 *   - The runtime dev-host API (`__NS_DEV__`) is deliberately NOT declared
 *     here; it is owned by `hmr/shared/runtime/browser-runtime-contract.ts`.
 *
 * This module emits no runtime code (ambient declaration only) and is picked up
 * project-wide via the package tsconfig include (all .ts files).
 */

declare global {
	// ── Build-time `define` constants (referenced bare; some also mirrored on globalThis) ──
	var __NS_APP_ROOT_VIRTUAL__: string | undefined;
	var __NS_ENV_VERBOSE__: boolean | undefined;
	var __NS_TARGET_FLAVOR__: string | undefined;
	var __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;
	var __NS_HMR_KICKSTART_MAX_URLS__: number | undefined;

	// ── Boot / lifecycle flags ──
	var __NS_HMR_BOOT_COMPLETE__: boolean | undefined;
	var __NS_HMR_HTTP_APP_CSS_APPLIED__: boolean | undefined;
	var __NS_IMPORT_MAP_CONFIGURED__: boolean | undefined;
	var __NS_ENTRY_OK__: boolean | undefined;
	var __NS_DEV_RESET_IN_PROGRESS__: boolean | undefined;
	var __NS_ANGULAR_HMR_CLIENT_INSTALLED__: boolean | undefined;
	var __NS_ANGULAR_HMR_REGISTER_ONLY__: boolean | undefined;
	var __NS_HMR_CLIENT_ACTIVE__: boolean | undefined;
	var __NS_HMR_CLIENT_SOCKET_READY__: boolean | undefined;
	var __NS_HMR_INITIAL_MOUNT_IN_PROGRESS__: boolean | undefined;
	var __NS_HMR_RESCUE_SCHEDULED__: boolean | undefined;
	var __NS_HMR_BACK_WRAPPED__: boolean | undefined;
	var __NS_HMR_DISABLE_ASM__: boolean | undefined;
	var __NS_HMR_ASM_DIAG__: boolean | undefined;

	// ── Boot-import progress (entry-runtime + boot-progress) ──
	var __NS_HMR_BOOT_MAIN_URL__: string | undefined;
	var __NS_HMR_BOOT_MAIN_ATTEMPT__: number | undefined;
	var __NS_HMR_BOOT_MAIN_ATTEMPTS__: number | undefined;
	var __NS_HMR_BOOT_MODULE_COUNT__: number | undefined;
	var __NS_HMR_BOOT_LAST_MODULE__: string | undefined;
	var __NS_HMR_BOOT_LAST_PROGRESS__: number | undefined;
	var __NS_HMR_BOOT_LAST_PROGRESS_AT__: number | undefined;
	var __NS_HMR_BOOT_IMPORT_STARTED_AT__: number | undefined;

	// ── Origins / realms / counters / hosts ──
	var __NS_HTTP_ORIGIN__: string | undefined;
	var __NS_ENTRY_LAST_TARGET__: string | undefined;
	var __NS_HMR_HOST: string | undefined;
	var __NS_HMR_REALM__: string | undefined;
	var __NS_RT_REALM__: string | undefined;
	var __NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__: string | undefined;
	var __NS_HMR_GRAPH_VERSION__: number | undefined;
	var __NS_HMR_IMPORT_NONCE__: number | undefined;

	// ── CSS (entry-runtime ↔ css-handler) ──
	var __NS_HMR_APPLY_CSS__: ((cssText: string, refreshRoot?: boolean) => void) | undefined;
	var __NS_HMR_APP_CSS__: string | undefined;
	var __NS_HMR_APP_CSS_AST__: any;
	// Device CSS bridge: CSS-bearing modules register under a per-source tag via the following:
	// - (installed at client boot), or queue in
	var __NS_REGISTER_CSS__: ((tag: string, cssText: string) => void) | undefined;
	// - (keyed by tag) until it's installed, then drained.
	var __NS_PENDING_CSS__: Record<string, string> | null | undefined;

	// ── Function hooks (typed where the signature is stable; `any` otherwise) ──
	var __NS_HMR_IMPORT__: ((url: string) => Promise<unknown>) | undefined;
	var __NS_HMR_ON_UPDATE__: ((payload: { type: 'full-graph' | 'delta'; version: number; changedIds: string[]; raw: any }) => void) | undefined;
	var __NS_HMR_ON_NAVIGATE_BACK: (() => void) | undefined;
	var __NS_DEV_RESTORE_PLACEHOLDER__: ((reason?: string) => void) | undefined;
	var __nsAttemptBackRemount: (() => unknown) | undefined;
	var __nsHmrRequestModule: ((spec: string) => Promise<string>) | undefined;
	var __nsGetModuleExports: ((id: string) => any) | undefined;
	var __ns_solid_hmr_subscribe: ((fn: (ev: { kind: 'solid'; changedFiles: string[]; boundaries: string[]; ancestors?: string[] }) => void) => () => void) | undefined;

	// ── Native / framework / registry objects (intentionally `any`) ──
	var __NS_HMR_DEV_OVERLAY__: any;
	var __NS_ENTRY_TRACE__: any;
	var __NS_ENTRY_ERROR__: any;
	var __NS_DEV_ORIGINAL_APP_RUN__: any;
	var __NS_DEV_PLACEHOLDER_APPLICATION__: any;
	var __NS_DEV_PLACEHOLDER_ROOT_VIEW__: any;
	var __NS_DEV_PLACEHOLDER_ROOT_EARLY__: any;
	var __NS_HMR_PINIA__: any;
	var __NS_PINIA_SYMBOL__: symbol | undefined;
	var __NS_VUE_APP__: any;
	var __NS_HMR_CREATE_APP__: any;
	var __NS_HMR_INSTALL_PLUGINS__: any;
	var __NS_HMR_ORIG_ROOT_COMPONENT__: any;
	var __NS_HMR_VUE_SFC_REGISTRY__: any;
	var __NS_HMR_WORKERS__: any;
	var __NS_UPDATE_ANGULAR_APP_OPTIONS__: any;
	var __nsNavigateUsingApp: any;
	var __nsRequire: any;
	var __nsVendorRequire: any;
	var __nsVendorRegistry: any;
	var __ns_router: any;
	var __ns_solid_hmr_listener_set: any;
}

export {};
