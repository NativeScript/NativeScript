import { enumeratePackageExports } from '../helpers/package-exports.js';

// Exports the bridge replaces with HMR-routed implementations — discovery
// must not emit a plain passthrough for these names or the override would be
// shadowed and navigation would silently fall back to the vendor's native
// version (which doesn't know about the HMR app navigator).
const NSV_SHIM_OVERRIDES: ReadonlySet<string> = new Set(['$navigateTo', '$navigateBack', '$showModal', 'vite__injectQuery']);

// Bridge-internal identifiers that would clash with the emitted preamble if
// the vendor package happens to publish a colliding name.
const RESERVED_BRIDGE_LOCALS: ReadonlySet<string> = new Set(['__realm', '__cached_rt', '__cached_vm', '__ensure', '__get', 'default']);

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export interface NsRtBridgeOptions {
	/** Version segment from `/ns/rt/<ver>`. Retained for the URL dispatcher; the bridge body intentionally ignores it. */
	rtVer: string;
	/** Prologue installed verbatim before the bridge body (typically the require URL guard). */
	requireGuardSnippet: string;
	/**
	 * The discovered ESM export names of the underlying vendor package
	 * (`nativescript-vue`, including its `@vue/runtime-core` re-export
	 * chain). Each name becomes `export const <name> = (__ensure().<name>);` —
	 * a single canonical specifier (`/ns/rt`) forwards *every* symbol the
	 * vendor publishes.
	 *
	 * Required: discovery is the only source of truth. There is no hand-curated
	 * fallback — if discovery cannot see the package, the bridge serves no
	 * passthroughs and the call site is expected to surface that as a config
	 * error rather than silently degrade.
	 */
	vendorExports: Iterable<string>;
}

/**
 * Build the `/ns/rt` runtime bridge module text.
 *
 * Single-realm policy: every named export the vendor package publishes
 * appears as `export const X = (__ensure().X);` — a constant binding, not a
 * function wrapper. Constant bindings preserve identity for Vue's Symbol
 * markers (`Fragment`, `Teleport`, …) AND work transparently for functions
 * (`ref`, `createApp`, …) since the user code calls the underlying value
 * directly. Calling `__ensure()` at module evaluation time is safe because
 * the vendor bundle is registered earlier in the boot graph (vendor.mjs →
 * `__nsVendorRegistry`), and the bridge resolves the same `nativescript-vue`
 * record everyone else uses.
 *
 * HMR-specific shims (`$navigateTo`, `$navigateBack`, `$showModal`) and the
 * Vite client polyfill (`vite__injectQuery`) are emitted as overrides that
 * replace the would-be passthrough — those exports route through the HMR
 * navigator instead of the vendor's native version, so the bridge must
 * provide the override, not the discovered original.
 */
export function buildNsRtBridgeModule(options: NsRtBridgeOptions): string {
	// Sort for stable output — useful for diffing the served bridge across requests.
	const passthrough = new Set<string>();
	for (const name of options.vendorExports) {
		if (typeof name === 'string' && IDENT_RE.test(name) && !NSV_SHIM_OVERRIDES.has(name) && !RESERVED_BRIDGE_LOCALS.has(name)) {
			passthrough.add(name);
		}
	}
	const passthroughNames = Array.from(passthrough).sort();

	const passthroughExports = passthroughNames.map((n) => `export const ${n} = (__ensure().${n});`).join('\n');
	const defaultListing = passthroughNames.concat(['$navigateTo', '$navigateBack', '$showModal', 'vite__injectQuery']).join(', ');

	const code =
		`// [ns-rt][v2.4] NativeScript-Vue runtime bridge (module-scoped cache, no globals)\n` +
		`// Single-realm policy: every export is a constant binding off the vendor module's\n` +
		`// canonical instance, so app code, plugins, and the vendor bundle itself share one\n` +
		`// module record. The set of exports below is derived from the package's static ESM\n` +
		`// shape (see hmr/helpers/package-exports.ts), not a hand-curated list, so any symbol\n` +
		`// the vendor publishes flows through automatically.\n` +
		`const __origin = ((typeof globalThis !== 'undefined' && globalThis && globalThis.__NS_HTTP_ORIGIN__) || (new URL(import.meta.url)).origin);\n` +
		// Use the canonical, unversioned `/ns/core` URL so this dynamic import
		// shares an iOS HTTP-ESM module record (and therefore a single class-
		// identity realm) with vendor `require('@nativescript/core')` lookups
		// resolved via the runtime import map, plus every app-side import that
		// goes through the core bridge. The `rtVer` is intentionally unused.
		`let __ns_core_bridge = null; try { import(__origin + "/ns/core").then(m => { __ns_core_bridge = m; }).catch(() => {}); } catch {}\n` +
		`const g = globalThis;\n` +
		`const reg = (g.__nsVendorRegistry ||= new Map());\n` +
		`const req = reg && reg.get ? (g.__nsVendorRequire || g.__nsRequire || g.require) : (g.__nsRequire || g.require);\n` +
		`let __cached_rt = null;\n` +
		`let __cached_vm = null;\n` +
		`const __RT_REALM_TAG = (globalThis.__NS_RT_REALM__ ||= Math.random().toString(36).slice(2));\n` +
		`try { if (!(globalThis.__NS_RT_ONCE__ && globalThis.__NS_RT_ONCE__.eval)) { (globalThis.__NS_RT_ONCE__ ||= {}).eval = true; if (globalThis.__NS_ENV_VERBOSE__) console.log('[ns-rt] evaluated', { rtRealm: __RT_REALM_TAG }); } } catch {}\n` +
		`function __ensure(){\n` +
		`  if (__cached_rt) return __cached_rt;\n` +
		`  let vm = null;\n` +
		`  try { vm = reg && reg.has && reg.has('nativescript-vue') ? reg.get('nativescript-vue') : (typeof req==='function' ? req('nativescript-vue') : null); } catch {}\n` +
		`  if (!vm) { try { vm = reg && reg.has && reg.has('vue') ? reg.get('vue') : (typeof req==='function' ? req('vue') : null); } catch {} }\n` +
		`  const rt = (vm && (vm.default ?? vm)) || {};\n` +
		`  __cached_vm = vm;\n` +
		`  __cached_rt = rt;\n` +
		`  return rt;\n` +
		`}\n` +
		// Soft-globals for @nativescript/core when missing (dev-only safety).
		// This stays even with the auto-derived passthrough because Frame /
		// Page / Application aren't `nativescript-vue` exports — they're
		// hoisted onto `globalThis` so the navigation shims (and any legacy
		// `global.Frame.topmost()`-style call site inside the vendor bundle)
		// see the same identities served by `/ns/core`.
		`try {\n` +
		`  const dev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;\n` +
		`  if (dev) {\n` +
		`    const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {};\n` +
		`    if (ns) {\n` +
		`      if (!g.Frame && ns.Frame) g.Frame = ns.Frame;\n` +
		`      if (!g.Page && ns.Page) g.Page = ns.Page;\n` +
		`      if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application);\n` +
		`    }\n` +
		`  }\n` +
		`} catch {}\n` +
		`export const __realm = __RT_REALM_TAG;\n` +
		// Auto-emitted passthrough exports. Discovery-driven, sorted, dedupe'd.
		passthroughExports +
		`\n` +
		// HMR-routed navigation helpers (replace the would-be passthroughs).
		// These run through `globalThis.__nsNavigateUsingApp` etc. instead of
		// the vendor's native navigation, so HMR can re-route navigation
		// targets after module updates.
		`export const $navigateTo = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); try { if (!(g && g.Frame)) { const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {}; if (ns) { if (!g.Frame && ns.Frame) g.Frame = ns.Frame; if (!g.Page && ns.Page) g.Page = ns.Page; if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application); } } } catch {} try { const hmrRealm = (g && g.__NS_HMR_REALM__) || 'unknown'; const hasTop = !!(g && g.Frame && g.Frame.topmost && g.Frame.topmost()); const top = hasTop ? g.Frame.topmost() : null; const ctor = top && top.constructor && top.constructor.name; } catch {} if (g && typeof g.__nsNavigateUsingApp === 'function') { try { return g.__nsNavigateUsingApp(...a); } catch (e) { console.error('[ns-rt] $navigateTo app navigator error', e); throw e; } } console.error('[ns-rt] $navigateTo unavailable: app navigator missing'); throw new Error('$navigateTo unavailable: app navigator missing'); } ;\n` +
		`export const $navigateBack = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$navigateBack || (vm.default && vm.default.$navigateBack))) || (rt && (rt.$navigateBack || (rt.runtimeHelpers && rt.runtimeHelpers.navigateBack))); let res; try { const via = (impl && (impl === (vm && vm.$navigateBack) || impl === (vm && vm.default && vm.default.$navigateBack))) ? 'vm' : (impl ? 'rt' : 'none'); } catch {} try { if (typeof impl === 'function') res = impl(...a); } catch {} try { const top = (g && g.Frame && g.Frame.topmost && g.Frame.topmost()); if (!res && top && top.canGoBack && top.canGoBack()) { res = top.goBack(); } } catch {} try { const hook = g && (g.__NS_HMR_ON_NAVIGATE_BACK || g.__NS_HMR_ON_BACK || g.__nsAttemptBackRemount); if (typeof hook === 'function') hook(); } catch {} return res; }\n` +
		`export const $showModal = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$showModal || (vm.default && vm.default.$showModal))) || (rt && (rt.$showModal || (rt.runtimeHelpers && rt.runtimeHelpers.showModal))); try { if (typeof impl === 'function') return impl(...a); } catch (e) { } return undefined; }\n` +
		// Vite client polyfill — see the comment in websocket.ts for full rationale.
		`export const vite__injectQuery = (url, queryToInject) => {\n` +
		`  if (typeof url !== 'string') return url;\n` +
		`  if (url[0] !== '.' && url[0] !== '/') return url;\n` +
		`  const pathname = url.replace(/[?#].*$/, '');\n` +
		`  let search = '', hash = '';\n` +
		`  try { const u = new URL(url, 'http://vite.dev'); search = u.search || ''; hash = u.hash || ''; } catch {}\n` +
		`  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');\n` +
		`};\n` +
		`export default { ${defaultListing} };\n`;

	return options.requireGuardSnippet + code;
}

/**
 * Resolve the set of names the bridge should re-export for `nativescript-vue`
 * given a project root. Static discovery via `enumeratePackageExports` is the
 * only source — there is no curated fallback. If `nativescript-vue` is not
 * resolvable from `projectRoot`, the returned set is empty and the bridge
 * built from it will not emit passthroughs; the caller should treat that as
 * the misconfiguration it is rather than mask it with a stale baseline.
 *
 * Caching lives inside `enumeratePackageExports`, so repeated calls in a dev
 * session are effectively free.
 */
export function discoverNsvBridgeExports(projectRoot: string): Set<string> {
	const out = new Set<string>();
	const shape = enumeratePackageExports('nativescript-vue', projectRoot);
	for (const n of shape.names) {
		if (typeof n === 'string' && IDENT_RE.test(n)) out.add(n);
	}
	return out;
}
