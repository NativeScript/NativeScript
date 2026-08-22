import { getProjectAppPath, getProjectAppVirtualPath } from './utils.js';
import { getClientStrategyDevicePath } from '../hmr/framework-flavors.js';

const APP_ROOT_DIR = getProjectAppPath();
const APP_ROOT_VIRTUAL = getProjectAppVirtualPath();

/**
 * Opt-out flag for the HMR-applying progress overlay.
 *
 * Default: enabled. Set `NS_VITE_PROGRESS_OVERLAY=0` (or `false`) in
 * the environment to suppress the overlay if a developer finds it
 * distracting. We accept the same falsy spellings webpack-era tooling
 * used (`0`, `false`, `off`, `no`) and treat anything else as
 * enabled-by-default; this avoids surprising users who pass quoted
 * truthy strings ("1", "true").
 */
export function isHmrProgressOverlayEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const raw = (env.NS_VITE_PROGRESS_OVERLAY ?? '').toString().trim().toLowerCase();
	if (!raw) return true;
	return !['0', 'false', 'off', 'no'].includes(raw);
}

/**
 * Canonical runtime define VALUES, shared by every emitter:
 *   1. Vite `define` substitution — `getGlobalDefines` below
 *   2. the bundle entry's `virtual:ns-defines-seed` module — main-entry.ts
 *   3. the dev server's per-module shim prelude + guarded platform seed —
 *      processCodeForDevice
 *
 * All three MUST agree. They used to be maintained by hand in three places,
 * and drift produced the HMR boot bug class where the bundle seed said
 * `__APPLE__ = true` while a served module's shim fell back to `false` and
 * ran Android code paths on iOS. Add new defines HERE, then thread them
 * through the builders below.
 */
export interface RuntimeDefineValues {
	__DEV__: boolean;
	__ANDROID__: boolean;
	__IOS__: boolean;
	__VISIONOS__: boolean;
	__APPLE__: boolean;
	__COMMONJS__: boolean;
	__NS_WEBPACK__: boolean;
	__NS_ENV_VERBOSE__: boolean;
	__UI_USE_XML_PARSER__: boolean;
	__UI_USE_EXTERNAL_RENDERER__: boolean;
	__CSS_PARSER__: string;
	__TEST__: boolean;
}

export function getRuntimeDefineValues(opts: { platform?: string; isDevMode: boolean; verbose: boolean }): RuntimeDefineValues {
	const platform = opts.platform || '';
	return {
		__DEV__: !!opts.isDevMode,
		__ANDROID__: platform === 'android',
		__IOS__: platform === 'ios',
		__VISIONOS__: platform === 'visionos',
		__APPLE__: platform === 'ios' || platform === 'visionos',
		__COMMONJS__: false,
		__NS_WEBPACK__: false,
		__NS_ENV_VERBOSE__: !!opts.verbose,
		__UI_USE_XML_PARSER__: true,
		__UI_USE_EXTERNAL_RENDERER__: false,
		__CSS_PARSER__: 'css-tree',
		__TEST__: false,
	};
}

/**
 * The COMPLETE set of globals the bundle entry's defines-seed module must
 * plant. Superset of {@link getRuntimeDefineValues}: also carries every
 * `__NS_*__` value that raw-served runtime files consume. Vite's `define`
 * substitution never reaches those files (the HMR client and framework
 * clients are served raw from node_modules/dist), so any define they read
 * MUST also exist on globalThis or its build-time fallback silently wins —
 * which is how `NS_VITE_PROGRESS_OVERLAY=0`
 * historically never reached the device, and how '/src'-defaulted app roots
 * broke 'app/'-rooted projects. Rule: add a define consumed by client code →
 * add it HERE, and read it with a `globalThis` fallback at the consumer.
 */
export function getRuntimeSeedValues(opts: { platform?: string; isDevMode: boolean; verbose: boolean; flavor: string; isCI?: boolean }): Record<string, unknown> {
	const values = getRuntimeDefineValues(opts);
	return {
		...values,
		// Legacy runtime globals (`global.isIOS` / `global.isAndroid`): the
		// bundle build text-substitutes these member expressions via `define`
		// (see getGlobalDefines), but raw-served HMR modules never get that
		// substitution — app code branching on `global.isIOS` falls into its
		// Android path on iOS. Seed the real globals so member-access reads
		// behave identically under HMR. globalThis-only on purpose: these MUST
		// NOT become per-module `const` shims (buildDefineShimStatements), or
		// they'd collide with `import { isIOS } from '@nativescript/core'`.
		isAndroid: values.__ANDROID__,
		isIOS: values.__APPLE__,
		// Runtime flavor for the raw-served HMR client's TARGET_FLAVOR resolution.
		__NS_TARGET_FLAVOR__: opts.flavor,
		// Device path of a registered (non built-in) flavor's client strategy;
		// '' for built-ins, which the client resolves from its own package.
		__NS_CLIENT_STRATEGY_URL__: getClientStrategyDevicePath(opts.flavor),
		// App-root virtual path — every served-id → moduleName mapping (frame
		// navigation targets, modal re-present matching) depends on this.
		__NS_APP_ROOT_DIR__: APP_ROOT_DIR,
		__NS_APP_ROOT_VIRTUAL__: APP_ROOT_VIRTUAL,
		// HMR-applying overlay opt-out (NS_VITE_PROGRESS_OVERLAY=0).
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: isHmrProgressOverlayEnabled(),
		__CI__: !!opts.isCI,
	};
}

/**
 * Unconditional `globalThis.<key> = <value>;` statements — the bundle entry's
 * defines-seed module body (evaluates as a leaf before any sibling import).
 * Accepts the full seed map; `Infinity` is serialized explicitly because
 * `JSON.stringify(Infinity)` is the string "null".
 */
export function buildGlobalSeedStatements(values: Record<string, unknown>): string[] {
	return Object.entries(values).map(([key, value]) => `globalThis.${key} = ${typeof value === 'number' && !Number.isFinite(value) ? 'Infinity' : JSON.stringify(value)};`);
}

/** @deprecated kept for callers of the platform-only subset; prefer buildGlobalSeedStatements(getRuntimeSeedValues(...)) */
export function buildDefineSeedStatements(values: RuntimeDefineValues): string[] {
	return buildGlobalSeedStatements(values as unknown as Record<string, unknown>);
}

/**
 * Guarded seed for the dev server's per-module prelude. Under HMR the bundle's
 * externalized core URL imports evaluate BEFORE the bundle body (ESM: imports
 * run before the importer), so the unconditional seed above has NOT run when
 * the HTTP core graph instantiates. Whichever served module evaluates first
 * runs this and seeds globalThis with the correct platform; later modules and
 * the bundle seed see it already set and no-op.
 */
export function buildGuardedDefineSeedStatement(values: RuntimeDefineValues): string {
	// `isIOS`/`isAndroid` mirror the bundle build's `global.isIOS` /
	// `global.isAndroid` defines (getGlobalDefines) — raw-served modules get no
	// text substitution, so the real globals must exist for member-access reads.
	// Guarded separately from `__IOS__` because a bundle seed may already have
	// planted one set but not the other.
	return `if (globalThis.__IOS__ === undefined && globalThis.__ANDROID__ === undefined) { globalThis.__ANDROID__ = ${values.__ANDROID__}; globalThis.__IOS__ = ${values.__IOS__}; globalThis.__VISIONOS__ = ${values.__VISIONOS__}; globalThis.__APPLE__ = ${values.__APPLE__}; }\nif (globalThis.isIOS === undefined && globalThis.isAndroid === undefined) { globalThis.isAndroid = ${values.__ANDROID__}; globalThis.isIOS = ${values.__APPLE__}; }\nif (globalThis.__DEV__ === undefined) { globalThis.__DEV__ = ${values.__DEV__}; }`;
}

/**
 * `const <key> = globalThis.<key> !== undefined ? globalThis.<key> : <canonical>;`
 * shim statements injected at the top of every HTTP-served module. The
 * fallbacks are the canonical values themselves, so a module snapshots correct
 * platform flags even if it evaluates before ANY seed has run.
 */
export function buildDefineShimStatements(values: RuntimeDefineValues): string[] {
	return Object.entries(values).map(([key, value]) => `const ${key} = globalThis.${key} !== undefined ? globalThis.${key} : ${JSON.stringify(value)};`);
}

// ── User-configured `__FOO__` defines ─────────────────────────────────────────
// An app may add its own `__FOO__`-style entries to Vite `config.define`
// (e.g. `__NS_NATIVE_OVERRIDES__`). In a production bundle Vite text-substitutes
// them, but NS's HMR pipeline serves raw modules where that substitution never
// runs — and the AST normalizer then mis-reads the free `__FOO__` identifier as
// an `/ns/rt` helper and binds it from the runtime bridge (which doesn't export
// it) → `undefined` under HMR while the bundle had the real value. Emitting a
// per-module const shim (exactly like the builtin defines above) gives the
// identifier a binding the normalizer leaves alone AND the correct value, so HMR
// matches the bundle. Captured from the resolved config in `configResolved`.
const USER_DEFINE_IDENTIFIER_RE = /^__[A-Za-z0-9_]+__$/;
const USER_PROCESS_ENV_DEFINE_RE = /^process\.env\.([A-Za-z_$][\w$]*)$/;
let userDefineEntries: Array<[string, string]> = [];
let userProcessEnvDefineEntries: Record<string, string> = {};

/**
 * Record the app's `__FOO__`-style `define` entries from the resolved Vite
 * config. `global.isIOS` / `import.meta.*` keys are ignored — only bare
 * `__FOO__` identifiers can appear free in app code and get mis-bound. Vite
 * `define` VALUES are JS-expression strings (e.g. `"true"`), so they pass
 * through verbatim; a non-string value is JSON-encoded defensively.
 *
 * `process.env.<KEY>` entries are captured SEPARATELY: production bundles get
 * them via Vite's textual substitution, but raw-served HMR modules read the
 * injected `globalThis.process.env` shim — without these entries every
 * dotenv-sourced value (webpack's dotenv-webpack behavior mirrored by app
 * configs via `define`) is silently `undefined` only under HMR (observed:
 * `SHARED_KEYCHAIN_GROUP` missing broke FCUUID shared-keychain device ids).
 * Define values are JS expressions — for the env shim we want the runtime
 * VALUE, so JSON-parse the common `JSON.stringify(...)`-encoded case and fall
 * back to the raw text for anything exotic.
 */
export function setUserDefineEntries(define: Record<string, unknown> | undefined): void {
	const entries: Array<[string, string]> = [];
	const envEntries: Record<string, string> = {};
	if (define) {
		for (const [key, value] of Object.entries(define)) {
			const envMatch = USER_PROCESS_ENV_DEFINE_RE.exec(key);
			if (envMatch) {
				const expr = typeof value === 'string' ? value : JSON.stringify(value);
				// A missing dotenv key is commonly defined as the literal
				// `undefined` expression (correct for text substitution). The
				// env-shim equivalent is ABSENCE — stringifying it would make
				// `process.env.X` the string "undefined" on device (observed as
				// a login field prefilled with the text "undefined").
				if (expr === undefined || expr === 'undefined' || expr === 'null') {
					continue;
				}
				let resolved: string = expr;
				try {
					const parsed = JSON.parse(expr);
					resolved = typeof parsed === 'string' ? parsed : String(parsed);
				} catch {
					// Not JSON (a raw code expression) — keep the text verbatim.
				}
				envEntries[envMatch[1]] = resolved;
				continue;
			}
			if (!USER_DEFINE_IDENTIFIER_RE.test(key)) continue;
			entries.push([key, typeof value === 'string' ? value : JSON.stringify(value)]);
		}
	}
	userDefineEntries = entries;
	userProcessEnvDefineEntries = envEntries;
}

/** The captured `process.env.<KEY>` define values (see setUserDefineEntries). */
export function getUserProcessEnvDefineEntries(): Record<string, string> {
	return userProcessEnvDefineEntries;
}

/**
 * Per-module const shims for the captured user defines. `excludeKeys` are the
 * builtin defines already shimmed by {@link buildDefineShimStatements} — skipped
 * here so we never emit a duplicate `const` (a syntax error).
 */
export function buildUserDefineShimStatements(excludeKeys: Iterable<string> = []): string[] {
	const exclude = new Set(excludeKeys);
	return userDefineEntries.filter(([key]) => !exclude.has(key)).map(([key, expr]) => `const ${key} = globalThis.${key} !== undefined ? globalThis.${key} : (${expr});`);
}

export function getGlobalDefines(opts: { platform: string; targetMode: string; verbose: boolean; flavor: string; isCI?: boolean }) {
	const values = getRuntimeDefineValues({ platform: opts.platform, isDevMode: opts.targetMode === 'development', verbose: opts.verbose });
	return {
		// Define platform flags for runtime checks
		__ANDROID__: JSON.stringify(values.__ANDROID__),
		__IOS__: JSON.stringify(values.__IOS__),
		__VISIONOS__: JSON.stringify(values.__VISIONOS__),
		__APPLE__: JSON.stringify(values.__APPLE__),
		'global.isAndroid': JSON.stringify(values.__ANDROID__),
		'global.isIOS': JSON.stringify(values.__APPLE__),
		__DEV__: JSON.stringify(values.__DEV__),
		__COMMONJS__: values.__COMMONJS__,
		__NS_WEBPACK__: values.__NS_WEBPACK__,
		// webpack exposes `__non_webpack_require__` (its APIPlugin) as the native,
		// non-bundler require. Some NativeScript plugins (e.g. @nativescript/firebase-core's
		// Android config reader) reference it unguarded. Map it to the runtime's
		// global require so those plugins work under Vite/Rolldown too. Raw
		// expression (NOT JSON.stringified) so it substitutes as code, not a string.
		__non_webpack_require__: 'globalThis.require',
		__NS_ENV_VERBOSE__: JSON.stringify(values.__NS_ENV_VERBOSE__),
		__NS_TARGET_FLAVOR__: JSON.stringify(opts.flavor),
		__NS_CLIENT_STRATEGY_URL__: JSON.stringify(getClientStrategyDevicePath(opts.flavor)),
		// whether to show the HMR in-progress overlay.
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: JSON.stringify(isHmrProgressOverlayEnabled()),
		__CSS_PARSER__: JSON.stringify(values.__CSS_PARSER__),
		__UI_USE_XML_PARSER__: values.__UI_USE_XML_PARSER__,
		__UI_USE_EXTERNAL_RENDERER__: values.__UI_USE_EXTERNAL_RENDERER__,
		// various ecosystems use this global (react for example)
		__TEST__: values.__TEST__,
		// determine if running in CI environment
		__CI__: JSON.stringify(!!opts.isCI),
		__NS_APP_ROOT_DIR__: JSON.stringify(APP_ROOT_DIR),
		__NS_APP_ROOT_VIRTUAL__: JSON.stringify(APP_ROOT_VIRTUAL),
		// Critical for various integrations (e.g. Vue only includes hmr runtime on this condition)
		'process.env.NODE_ENV': JSON.stringify(opts.targetMode === 'development' ? 'development' : 'production'),
	};
}
