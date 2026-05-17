import type { ViteDevServer } from 'vite';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import babelCore from '@babel/core';

import { getPackageJson, getProjectFilePath } from '../../helpers/project.js';
import { enumeratePackageExports } from '../helpers/package-exports.js';

const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

export interface RegisterRuntimeCompatHandlersOptions {
	verbose: boolean;
	requireGuardSnippet: string;
	appRootDir: string;
	defaultMainEntry: string;
	defaultMainEntryVirtual: string;
	getGraphVersion(): number;
	getServerOrigin(server: ViteDevServer): string;
}

function setJavascriptResponseHeaders(res: any): void {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

function setNoStoreHeaders(res: any): void {
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
}

// Identifiers the bridge must ALWAYS provide, even when static export
// discovery yields nothing (e.g. when `nativescript-vue` can't be resolved
// during tests, or when a future bundler tree-shakes an entry). This list
// matches the historical hand-curated set so the fallback never serves a
// smaller surface than what apps relied on previously. Discovery is allowed
// to extend this set with anything else `nativescript-vue` (+ its
// `@vue/runtime-core` re-export chain) declares; hence the union below.
const NSV_BASELINE_EXPORTS: ReadonlyArray<string> = Object.freeze([
	'defineComponent',
	'resolveComponent',
	'createVNode',
	'createTextVNode',
	'createCommentVNode',
	'Fragment',
	'Teleport',
	'Transition',
	'TransitionGroup',
	'KeepAlive',
	'Suspense',
	'withCtx',
	'openBlock',
	'createBlock',
	'createElementVNode',
	'createElementBlock',
	'renderSlot',
	'mergeProps',
	'toHandlers',
	'renderList',
	'normalizeProps',
	'guardReactiveProps',
	'normalizeClass',
	'normalizeStyle',
	'toDisplayString',
	'withDirectives',
	'resolveDirective',
	'withModifiers',
	'withKeys',
	'resolveDynamicComponent',
	'isVNode',
	'cloneVNode',
	'isRef',
	'ref',
	'shallowRef',
	'unref',
	'computed',
	'reactive',
	'readonly',
	'isReactive',
	'isReadonly',
	'toRaw',
	'markRaw',
	'shallowReactive',
	'shallowReadonly',
	'watch',
	'watchEffect',
	'watchPostEffect',
	'watchSyncEffect',
	'onBeforeMount',
	'onMounted',
	'onBeforeUpdate',
	'onUpdated',
	'onBeforeUnmount',
	'onUnmounted',
	'onActivated',
	'onDeactivated',
	'onErrorCaptured',
	'onRenderTracked',
	'onRenderTriggered',
	'nextTick',
	'h',
	'provide',
	'inject',
	'vShow',
	'createApp',
	'registerElement',
	'createNativeView',
	'$closeModal',
	'getCurrentInstance',
	'render',
	'ELEMENT_REF',
]);

// Exports the bridge handles specially — HMR-routed navigation helpers and
// the Vite client polyfill — must never be emitted as plain passthroughs,
// or the auto-discovered passthrough would shadow the HMR shim and break
// navigation. They're emitted from `buildShimExports` instead.
const NSV_SHIM_OVERRIDES: ReadonlySet<string> = new Set(['$navigateTo', '$navigateBack', '$showModal', 'vite__injectQuery']);

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export interface NsRtBridgeOptions {
	/** Version segment from `/ns/rt/<ver>`. Retained for the URL dispatcher; the bridge body intentionally ignores it. */
	rtVer: string;
	/** Prologue installed verbatim before the bridge body (typically the require URL guard). */
	requireGuardSnippet: string;
	/**
	 * Discovered ESM export names of the underlying vendor package
	 * (`nativescript-vue`, including its `@vue/runtime-core` re-export
	 * chain). Each name becomes `export const <name> = (__ensure().<name>);`
	 * — a single canonical specifier (`/ns/rt`) forwards *every* symbol the
	 * vendor publishes, eliminating the hand-curated re-export drift that
	 * caused `createNativeView is not a function` and similar regressions.
	 *
	 * If omitted or empty, the bridge falls back to `NSV_BASELINE_EXPORTS`
	 * so callers that haven't migrated to discovery still get a working
	 * (if smaller) surface.
	 */
	vendorExports?: Iterable<string>;
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
 * Vite client polyfill (`vite__injectQuery`) are emitted as opt-in overrides
 * that replace the passthrough — those exports route through the HMR
 * navigator instead of the vendor's native version, so the bridge must
 * provide the override, not the discovered original.
 */
export function buildNsRtBridgeModule(options: NsRtBridgeOptions): string;
// Legacy positional signature: retained so call sites that haven't migrated
// to the options form keep compiling. Internally normalised to the options
// shape with an empty `vendorExports` (which triggers the baseline fallback).
export function buildNsRtBridgeModule(rtVer: string, requireGuardSnippet: string): string;
export function buildNsRtBridgeModule(arg1: NsRtBridgeOptions | string, arg2?: string): string {
	const options: NsRtBridgeOptions = typeof arg1 === 'string' ? { rtVer: arg1, requireGuardSnippet: arg2 ?? '' } : arg1;
	const requireGuardSnippet = options.requireGuardSnippet || '';

	// Union of discovered exports and the baseline, with HMR-shimmed names
	// removed (they're emitted as opt-in overrides below). Sort for stable
	// output — useful for diffing the served bridge across requests.
	const passthrough = new Set<string>(NSV_BASELINE_EXPORTS);
	if (options.vendorExports) {
		for (const name of options.vendorExports) {
			if (typeof name === 'string' && IDENT_RE.test(name)) passthrough.add(name);
		}
	}
	for (const shim of NSV_SHIM_OVERRIDES) passthrough.delete(shim);
	// Don't shadow our own bridge-internal identifiers, even if the package
	// happens to publish a colliding name.
	const RESERVED = new Set(['__realm', '__cached_rt', '__cached_vm', '__ensure', '__get', 'default']);
	for (const r of RESERVED) passthrough.delete(r);
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

	return requireGuardSnippet + code;
}

/**
 * Resolve the set of names the bridge should re-export for `nativescript-vue`
 * given a project root. Returns the union of static discovery (via
 * `enumeratePackageExports`) and the curated baseline. The baseline is the
 * floor: if discovery fails (package missing, parse error, etc.) the bridge
 * still serves at least the historical surface.
 *
 * Caching lives inside `enumeratePackageExports`, so repeated calls in a dev
 * session are effectively free.
 */
export function discoverNsvBridgeExports(projectRoot: string): Set<string> {
	const out = new Set<string>(NSV_BASELINE_EXPORTS);
	try {
		const shape = enumeratePackageExports('nativescript-vue', projectRoot);
		for (const n of shape.names) {
			if (typeof n === 'string' && IDENT_RE.test(n)) out.add(n);
		}
	} catch {
		// Swallow — caller still gets the baseline.
	}
	return out;
}

// Exported for tests so they can assert the floor matches the historical
// surface without parsing nativescript-vue.
export const __nsvBaselineExports: ReadonlyArray<string> = NSV_BASELINE_EXPORTS;

async function loadEntryRuntimeContent(verbose: boolean): Promise<string> {
	let content = '';
	try {
		const requireFromHere = createRequire(import.meta.url);
		const entryRtPath = requireFromHere.resolve('@nativescript/vite/hmr/entry-runtime.js');
		content = readFileSync(entryRtPath, 'utf-8');
	} catch (error) {
		try {
			const tsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'entry-runtime.ts');
			if (existsSync(tsPath)) {
				const tsSource = readFileSync(tsPath, 'utf-8');
				const result = babelCore.transformSync(tsSource, {
					filename: tsPath,
					plugins: [[pluginTransformTypescript, { isTSX: false, allowDeclareFields: true }]],
					sourceType: 'module',
				});
				if (result?.code) {
					content = result.code;
				}
			}
		} catch (transformError) {
			if (verbose) console.warn('[hmr-http] entry-runtime.ts transform failed', transformError);
		}
		if (!content) {
			content = 'export default async function start(){ console.error("[/ns/entry-rt] not found"); }\n';
		}
	}
	return content;
}

function resolveMainEntry(appRootDir: string, defaultMainEntry: string, defaultMainEntryVirtual: string): string {
	let mainEntry = '/';
	try {
		const pkg = getPackageJson();
		const main = pkg?.main || defaultMainEntry;
		const abs = getProjectFilePath(main).replace(/\\/g, '/');
		const marker = `/${appRootDir}/`;
		const index = abs.indexOf(marker);
		mainEntry = index >= 0 ? abs.substring(index) : defaultMainEntryVirtual;
	} catch {}
	return mainEntry;
}

export function buildNsEntryWrapper(params: { origin: string; mainEntry: string; ver: string; verbose: boolean; requireGuardSnippet: string }): string {
	const { origin, mainEntry, ver, verbose, requireGuardSnippet } = params;
	let code =
		requireGuardSnippet +
		`// [ns-entry][v${ver}] wrapper (script-safe) bytes will follow\n` +
		`(async function(){\n` +
		`  let origin = ${JSON.stringify(origin)}; const main = ${JSON.stringify(mainEntry)}; const __ns_graph_ver = ${JSON.stringify(ver)};\n` +
		`  try { const __b = (globalThis && globalThis.__NS_ENTRY_BASE__) ? String(globalThis.__NS_ENTRY_BASE__) : ''; if (__b) { try { const __o = new URL(__b).origin; if (__o) origin = __o; } catch {} } } catch {}\n` +
		`  const __VERBOSE__ = (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) || (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.verbose) || (globalThis && globalThis.__NS_ENV_VERBOSE__) || ${JSON.stringify(!!verbose)};\n` +
		`  if (__VERBOSE__) console.info('[ns-entry][wrapper] start', { origin, main, ver: __ns_graph_ver });\n` +
		`  async function __ns_import_entry_rt(u){\n` +
		`    try { const r = await fetch(u); const t = await r.text(); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt fetched bytes', (t&&t.length)||0);\n` +
		`      let s = t.replace(/export\\s+default\\s+async\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=async function $1')\n` +
		`               .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=function $1');\n` +
		`      if (String(s).indexOf('__NS_START_ENTRY__') === -1) { s = 'globalThis.__NS_START_ENTRY__=' + s.replace(/export\\s+default\\s*/,''); }\n` +
		`      try { (0,eval)(s); } catch (ee) { console.error('[ns-entry][wrapper] eval entry-rt failed', ee && (ee.message||ee)); throw ee; }\n` +
		`      const fn = globalThis.__NS_START_ENTRY__; if (!fn) { throw new Error('entry-rt missing __NS_START_ENTRY__'); }\n` +
		`      return { default: fn };\n` +
		`    } catch(e) { console.error('[ns-entry][wrapper] entry-rt fetch/eval failed', e && (e.message||e)); throw e; }\n` +
		`  }\n` +
		`  const __entryRtUrl = '/ns/entry-rt?v=' + String(__ns_graph_ver);\n` +
		`  let __mod; try { __mod = await __ns_import_entry_rt(__entryRtUrl); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt ready'); } catch (e) { console.error('[ns-entry][wrapper] failed to prepare entry-rt', e && (e.message||e)); throw e; }\n` +
		`  const startEntry = (__mod && (__mod.default || __mod));\n` +
		`  try { await startEntry({ origin, main, ver: __ns_graph_ver, verbose: !!__VERBOSE__ }); if (__VERBOSE__) console.info('[ns-entry][wrapper] startEntry() resolved'); } catch (e) { console.error('[ns-entry][wrapper] startEntry() failed', e && (e.message||e)); throw e; }\n` +
		`})();\n`;
	code += `\n//# sourceURL=${origin}/ns/entry`;
	return code;
}

export function registerRuntimeCompatHandlers(server: ViteDevServer, options: RegisterRuntimeCompatHandlersOptions): void {
	const { verbose, requireGuardSnippet, appRootDir, defaultMainEntry, defaultMainEntryVirtual, getGraphVersion, getServerOrigin } = options;

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/rt' || /^\/ns\/rt\/[\d]+$/.test(urlObj.pathname))) return next();
			setJavascriptResponseHeaders(res);
			const rtVerSeg = urlObj.pathname.replace(/^\/ns\/rt\/?/, '');
			const rtVer = /^[0-9]+$/.test(rtVerSeg) ? rtVerSeg : String(getGraphVersion() || 0);
			res.statusCode = 200;
			res.end(buildNsRtBridgeModule(rtVer, requireGuardSnippet));
		} catch {
			res.statusCode = 500;
			res.end('export {}\n');
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (urlObj.pathname !== '/ns/entry-rt') return next();
			try {
				if (verbose) {
					const remoteAddress = (req.socket as any)?.remoteAddress;
					const remotePort = (req.socket as any)?.remotePort;
					console.log('[hmr-http] GET /ns/entry-rt from', remoteAddress + (remotePort ? ':' + remotePort : ''));
				}
			} catch {}
			setJavascriptResponseHeaders(res);
			const content = await loadEntryRuntimeContent(verbose);
			if (verbose) console.log('[hmr-http] /ns/entry-rt serving', content.length, 'bytes');
			res.statusCode = 200;
			res.end(content);
		} catch (error) {
			console.warn('[hmr-http] /ns/entry-rt error', error);
			next();
		}
	});

	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (!(urlObj.pathname === '/ns/entry' || /^\/ns\/entry\/[\d]+$/.test(urlObj.pathname))) return next();
			try {
				if (verbose) {
					const remoteAddress = (req.socket as any)?.remoteAddress;
					const remotePort = (req.socket as any)?.remotePort;
					console.log('[hmr-http] GET /ns/entry from', remoteAddress + (remotePort ? ':' + remotePort : ''));
				}
			} catch {}
			const verSeg = urlObj.pathname.replace(/^\/ns\/entry\/?/, '');
			setNoStoreHeaders(res);
			const ver = /^[0-9]+$/.test(verSeg) ? verSeg : String(getGraphVersion() || 0);
			const origin = getServerOrigin(server) || `${urlObj.protocol}//${urlObj.host}`;
			const mainEntry = resolveMainEntry(appRootDir, defaultMainEntry, defaultMainEntryVirtual);
			res.statusCode = 200;
			res.end(
				buildNsEntryWrapper({
					origin,
					mainEntry,
					ver,
					verbose,
					requireGuardSnippet,
				}),
			);
		} catch {
			next();
		}
	});
}
