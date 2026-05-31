import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import * as path from 'path';
import * as PAT from '../../../server/constants.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';

// Solid server strategy for NativeScript HMR.
// For Solid we don't have .vue-style SFCs today; this strategy mainly
// ensures Solid runtime imports can be rewritten to vendor when needed
// and allows future per-file processing hooks.

const SOLID_FILE_PATTERN = /\.(tsx?|jsx?)$/i;
const SOLID_APP_PREFIX = `${getProjectAppVirtualPath()}/`;

export const solidServerStrategy: FrameworkServerStrategy = {
	flavor: 'solid',
	matchesFile(id: string) {
		// Treat app TS/TSX/JS/JSX under the configured app root as Solid candidates.
		return SOLID_FILE_PATTERN.test(id) && id.startsWith(SOLID_APP_PREFIX);
	},
	// preClean/rewriteFrameworkImports/postClean/ensureVersionedImports default to
	// identity: Solid HMR runs through Vite's solid-refresh plugin + the generic
	// vendor bridge, and has no dedicated HTTP endpoints to version.
	//
	// Solid HMR: patch @solid-refresh's $$refreshESM to do inline patching
	// during module re-evaluation instead of deferring to hot.accept() callback.
	// In NativeScript's HTTP ESM environment, accept callbacks are registered
	// but not invoked by the HMR client. By adding a direct patchRegistry()
	// call when hot.data already has a stored registry, component updates
	// apply immediately when the module re-evaluates.
	transformNodeModule(code: string, moduleId: string, verbose = false): string {
		if (!moduleId.includes('@solid-refresh')) {
			return code;
		}
		const PATCH_SENTINEL = '/* __ns_solid_refresh_patched__ */';
		const alreadyPatched = code.includes(PATCH_SENTINEL);
		if (verbose) {
			console.log('[hmr-ws][solid] @solid-refresh patch check:', { spec: moduleId, alreadyPatched, codeLen: code.length });
		}
		if (alreadyPatched) {
			return code;
		}
		let patchedCode = code;

		// Patch 1: Bypass shouldWarnAndDecline() — the vendor-bundled solid-js
		// may not have the 'development' condition active, making DEV empty/undefined.
		// In NativeScript HMR mode we are always in dev, so force it to return false.
		const declineCheck = 'function shouldWarnAndDecline() {';
		if (patchedCode.includes(declineCheck)) {
			patchedCode = patchedCode.replace(declineCheck, `${PATCH_SENTINEL}\nfunction shouldWarnAndDecline() { return false; /* NS HMR: always allow refresh */ }\nfunction __original_shouldWarnAndDecline() {`);
			if (verbose) {
				console.log('[hmr-ws][solid] bypassed shouldWarnAndDecline() for NativeScript HMR');
			}
		}

		// Patch 2: Force createMemo path in createProxy.
		// Without the 'development' condition, $DEVCOMP is not set on components,
		// so createProxy falls through to `return s(props)` — a direct call with
		// no reactive subscription. When patchComponent fires update() (the signal
		// setter), nobody is listening. By forcing the createMemo path, HMRComp
		// subscribes to the signal and re-renders when the component changes.
		const proxyCondition = 'if (!s || $DEVCOMP in s) {';
		if (patchedCode.includes(proxyCondition)) {
			patchedCode = patchedCode.replace(proxyCondition, 'if (true) { /* NS HMR: always use createMemo for reactive HMR updates */');
			if (verbose) {
				console.log('[hmr-ws][solid] forced createMemo path in createProxy for NativeScript HMR');
			}
		}

		// Patch 2b (NS HMR escape hatch): expose `source` on the proxy
		// itself via a non-enumerable, well-known symbol-ish key. This lets
		// our HMR remount path bypass solid-refresh's proxy chain and call
		// the freshly-patched underlying Home function directly. solid-refresh's
		// proxy wraps everything in nested createMemo's, which under
		// universal-renderer + nested-context (TanStack RouterContextProvider)
		// causes accumulating zombie memos that all subscribe to M_initial.source
		// — the visible symptom is "every other save applies".
		//
		// With this hatch we can do `proxy.__$$ns_resolve()` to obtain the
		// current underlying component (e.g. M_initial.proxy after first save,
		// or the actual Home function on the deepest hop) and then call
		// untrack(() => extract until we reach the actual function), then mount
		// against THAT function — no HMRComp memo proxy chain at the page level.
		// NS HMR escape hatch: stash `source` on the HMRComp function
		// itself AND short-circuit the Proxy's `get` handler so that
		// `proxy.__$ns_resolveSource` returns our exposed function.
		// Without the get-handler short-circuit, accessing the property
		// on the Proxy goes through `return source()[property]` — which
		// asks the *current source value* (which may itself be another
		// solid-refresh proxy or the underlying user function) for the
		// property. The user function doesn't have `__$ns_resolveSource`,
		// and a chained proxy would re-enter its own get handler. Either
		// way we end up with `undefined` at the page-level remount and
		// can't unwrap.
		//
		// NOTE: `$$` in String.prototype.replace replacement is treated
		// as a literal `$`. We use a single `$` to avoid that footgun.
		// Match only the unique opening fragment to avoid getting tripped up
		// by whitespace differences after the AST normalizer ran.
		const newProxyMarker = `if (property === 'location' || property === 'name') {`;
		if (patchedCode.includes(newProxyMarker)) {
			// 1. Inject `__$ns_resolveSource` as a property on the HMRComp
			//    function itself (so its closure captures `source`).
			//    CRITICAL: assign at module-eval time (right after HMRComp
			//    is defined / before `return new Proxy(...)`), NOT inside
			//    the HMRComp body — the body only runs when the proxy is
			//    called, so before first call the property is undefined
			//    and the page-level remount unwrap finds nothing.
			const setupMarker = `setComponentProperty(HMRComp, 'name', refreshName);`;
			patchedCode = patchedCode.replace(setupMarker, `HMRComp.__$ns_resolveSource = function() { return source(); }; ${setupMarker}`);
			// 2. Make the Proxy `get` handler short-circuit our property
			//    so callers can do `proxy.__$ns_resolveSource()` without
			//    going through `source()[property]` (which would unwrap one
			//    hop early or reach the user function which doesn't have it).
			patchedCode = patchedCode.replace(newProxyMarker, `if (property === '__$ns_resolveSource') { return HMRComp.__$ns_resolveSource; } ${newProxyMarker}`);
			if (verbose) {
				console.log('[hmr-ws][solid] exposed __$ns_resolveSource on createProxy for NS HMR escape hatch');
			}
		}

		// Patch 3: Inline patchRegistry call so updates apply immediately
		// on module re-evaluation (accept callbacks are not invoked by the HMR client).
		//
		// The injected diagnostic logs are gated on
		// `globalThis.__NS_ENV_VERBOSE__` so they're silent in
		// normal use but resurface immediately when the user
		// re-runs with verbose logging enabled. The flag is
		// seeded by `mainEntryPlugin` from the same `verbose`
		// option that drives this server-side log gating.
		// Without these the visible HMR signal is just "did it
		// apply" — with them, devs can answer "did `hot.data`
		// persist", "did `patchRegistry` actually swap the
		// proxy's signal source", and "did the registry
		// component count change" without reaching for an
		// inspector.
		const marker = 'hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;';
		if (patchedCode.includes(marker)) {
			const patchCode = [
				`var __nsRefreshVerbose = (typeof globalThis !== 'undefined') && !!globalThis.__NS_ENV_VERBOSE__;`,
				`if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] hot.data has SOLID_REFRESH=', !!(hot.data && hot.data[SOLID_REFRESH]), 'registry components=', registry.components ? registry.components.size : 0);`,
				`if (hot.data[SOLID_REFRESH]) {`,
				`  var __nsOldComponents = hot.data[SOLID_REFRESH].components ? hot.data[SOLID_REFRESH].components.size : 0;`,
				`  var __nsShouldInvalidate = patchRegistry(hot.data[SOLID_REFRESH], registry);`,
				`  if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] patched: oldComponents=', __nsOldComponents, 'newComponents=', registry.components ? registry.components.size : 0, 'shouldInvalidate=', __nsShouldInvalidate);`,
				`} else {`,
				`  if (__nsRefreshVerbose) console.log('[ns-hmr][solid-refresh][$$refreshESM] first load — no prior registry to patch');`,
				`}`,
			].join('\n    ');
			patchedCode = patchedCode.replace(marker, `${patchCode}\n    ${marker}`);
			if (verbose) {
				console.log('[hmr-ws][solid] added inline patchRegistry (with diagnostics) for NativeScript HMR');
			}
		}

		return patchedCode;
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		// For now we rely on the generic pipeline; no per-file Solid SFC registry.
		const { filePath, server, verbose } = ctx;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			if (verbose) {
				console.log(`[solid-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[solid-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(_ctx: FrameworkRegistryContext) {
		// No Solid registry messaging yet; HTTP-only boot imports app modules directly.
		return;
	},
};
