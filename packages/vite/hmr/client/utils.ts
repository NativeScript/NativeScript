/**
 * No circulars - don't import from other hmr/client/* modules here.
 */
declare const __NS_ENV_VERBOSE__: boolean | undefined;

// alpha.59 — Build-time verbose flag, read defensively so unit tests
// (where the `define` substitution doesn't run) don't blow up.
const ENV_VERBOSE: boolean = (() => {
	try {
		return typeof __NS_ENV_VERBOSE__ === 'boolean' ? __NS_ENV_VERBOSE__ : false;
	} catch {
		return false;
	}
})();

/**
 * Defensively read a module's default export with progressive backoff.
 * If a TDZ error happens, retry several microtasks and finally one macrotask tick.
 */
export async function safeReadDefault(mod: any): Promise<any | null> {
	const isTdz = (err: any) => /before initialization|TDZ/i.test(String(err?.message || err || ''));
	// Attempt immediate read
	try {
		return mod?.default ?? mod ?? null;
	} catch (e) {
		if (!isTdz(e)) throw e;
	}
	// A few microtask retries
	for (let i = 0; i < 4; i++) {
		await Promise.resolve();
		try {
			return mod?.default ?? mod ?? null;
		} catch (e) {
			if (!isTdz(e)) throw e;
		}
	}
	// One macrotask tick (allow dependent modules to finish evaluating)
	await new Promise<void>((r) => setTimeout(r, 0));
	try {
		return mod?.default ?? mod ?? null;
	} catch (e) {
		if (!isTdz(e)) throw e;
	}
	// Final microtask after macrotask
	await Promise.resolve();
	try {
		return mod?.default ?? mod ?? null;
	} catch (e) {
		throw e;
	}
}

// Resolve NativeScript core classes/Application from the vendor realm or globalThis.
export function getCore(name: 'Application' | 'Frame' | 'Page' | 'Label'): any {
	const g = globalThis;
	const pickApplicationApi = (candidate: any): any => {
		if (!candidate) return undefined;
		const candidates = [candidate, candidate.Application, candidate.app, candidate.application];
		for (const entry of candidates) {
			if (entry && (typeof entry.run === 'function' || typeof entry.on === 'function' || typeof entry.resetRootView === 'function')) {
				return entry;
			}
		}
		return undefined;
	};
	if (name === 'Application') {
		try {
			const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
			if (reg && typeof reg.get === 'function') {
				const mod = reg.get('@nativescript/core/application');
				const appModule = (mod && (mod.default || mod)) || mod;
				const picked = pickApplicationApi(appModule);
				if (picked) return picked;
			}
		} catch {}
	}
	// 1) Prefer vendor registry to guarantee single realm
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.get === 'function') {
			const mod = reg.get('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application') {
				const picked = pickApplicationApi(ns);
				if (picked) return picked;
			}
			if (ns && ns[name]) return ns[name];
		}
	} catch {}
	// 2) Fallback to global installed
	try {
		if (g && g[name]) return g[name];
	} catch {}
	// 3) Device require (still resolves to vendor realm when available)
	try {
		const req = g && (g.__nsVendorRequire || g.__nsRequire || g.require);
		if (typeof req === 'function') {
			if (name === 'Application') {
				const appMod = req('@nativescript/core/application');
				const appModule = (appMod && (appMod.default || appMod)) || appMod;
				const pickedFromAppModule = pickApplicationApi(appModule);
				if (pickedFromAppModule) return pickedFromAppModule;
			}
			const mod = req('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application') {
				const picked = pickApplicationApi(ns);
				if (picked) return picked;
			}
			if (ns && ns[name]) return ns[name];
		}
	} catch {}
	// 4) Last resort: nativeRequire if available
	try {
		const nativeReq = g && g.__nativeRequire;
		if (typeof nativeReq === 'function') {
			try {
				if (name === 'Application') {
					const appMod = nativeReq('@nativescript/core/application', '/');
					const appModule = (appMod && (appMod.default || appMod)) || appMod;
					const pickedFromAppModule = pickApplicationApi(appModule);
					if (pickedFromAppModule) return pickedFromAppModule;
				}
				const mod = nativeReq('@nativescript/core', '/');
				const ns = (mod && (mod.default || mod)) || mod;
				if (name === 'Application') {
					const picked = pickApplicationApi(ns);
					if (picked) return picked;
				}
				if (ns && ns[name]) return ns[name];
			} catch {}
		}
	} catch {}
	return undefined;
}

// last mounted app instance
let CURRENT_APP: any | null = null;
export function setCurrentApp(app: any | null) {
	CURRENT_APP = app;
}
export function getCurrentApp(): any | null {
	return CURRENT_APP;
}

// last known root Frame
let ROOT_FRAME: any | null = null;
export function setRootFrame(frame: any | null) {
	ROOT_FRAME = frame;
}
export function getRootFrame(): any | null {
	return ROOT_FRAME;
}
/**
 * No on-device file materialization: dev runtime operates via HTTP-only URL-based ESM.
 * On-demand module fetch (browser-like dynamic import bridging)
 */
let httpOriginForVite: string | undefined;
export function setHttpOriginForVite(origin: string | undefined) {
	httpOriginForVite = origin;
}
export function getHttpOriginForVite(): string | undefined {
	return httpOriginForVite;
}
let hmrWsUrl: string | undefined = undefined;
export function setHMRWsUrl(wsUrl: string | undefined) {
	hmrWsUrl = wsUrl;
}
export function getHMRWsUrl(): string | undefined {
	return hmrWsUrl;
}
interface HmrGraphModule {
	id: string;
	deps: string[];
	hash: string;
}
let graphVersion = 0;
export function getGraphVersion(): number {
	return graphVersion;
}
export function setGraphVersion(version: number) {
	graphVersion = version;
	try {
		(globalThis as any).__NS_HMR_GRAPH_VERSION__ = version;
	} catch {}
}
export const graph = new Map<string, HmrGraphModule>();
// local metrics snapshot
export const hmrMetrics: Record<string, any> = {};
interface PendingFetch {
	resolve: (v: any) => void;
	reject: (e: any) => void;
	spec: string;
	started: number;
}
export const pendingModuleFetches = new Map<number, PendingFetch>();
export const moduleFetchCache = new Map<string, string>(); // spec -> resolved HTTP URL

export function deriveHttpOrigin(wsUrl: string | undefined) {
	try {
		// Prefer explicit HTTP origin provided by entry-runtime when available
		try {
			const g: any = globalThis as any;
			if (g && typeof g.__NS_HTTP_ORIGIN__ === 'string' && /^https?:\/\//.test(g.__NS_HTTP_ORIGIN__)) {
				return String(g.__NS_HTTP_ORIGIN__);
			}
		} catch {}
		const url = new URL(wsUrl || 'ws://localhost:5173/ns-hmr');
		const http = url.protocol === 'wss:' ? 'https:' : 'http:';
		const origin = `${http}//${url.host}`;
		return origin;
	} catch {
		return 'http://localhost:5173';
	}
}

// alpha.59 — Detect runtime support for `__nsInvalidateModules`.
//
// alpha.59 ships a global JS function `__nsInvalidateModules(urls)` that
// removes the canonical key for each URL from V8's module registry
// (`g_moduleRegistry`). Combined with the HMR URL canonicalizer in
// HMRSupport.mm — which strips `__ns_hmr__/<tag>/` and
// `__ns_boot__/b1/` prefixes before keying — explicit eviction lets
// the client keep import URLs STABLE across saves while still busting
// V8's cache for exactly the modules that need to re-evaluate.
//
// Without explicit eviction, an alpha.59 runtime would silently drop
// the legacy `/ns/m/__ns_hmr__/v<N>/...` cache-buster (because the
// canonicalizer collapses it back to the stable key) and any HMR
// re-import would resolve to the cached old module. So when the
// runtime exposes `__nsInvalidateModules`, the client emits stable
// URLs and the caller is responsible for invalidating before
// re-importing. When the runtime does NOT expose it (alpha.58 and
// earlier), the client falls back to legacy URL versioning so cache
// busting works even on older devices.
export function hasExplicitEviction(): boolean {
	try {
		return typeof (globalThis as any).__nsInvalidateModules === 'function';
	} catch {
		return false;
	}
}

// One-time mode banner so the user can correlate an HMR slowdown with
// the active eviction strategy without grepping logs.
let _hmrModeBannerEmitted = false;
export function emitHmrModeBannerOnce(force = false): void {
	if (_hmrModeBannerEmitted && !force) return;
	_hmrModeBannerEmitted = true;
	try {
		const supported = hasExplicitEviction();
		const mode = supported ? 'explicit-eviction (stable URLs)' : 'legacy-url-versioning (no __nsInvalidateModules)';
		console.info(`[hmr-client] alpha.59 module reload mode: ${mode}`);
	} catch {}
}

// Reset the banner — used by tests so mode flips during a single
// process are observable.
export function _resetHmrModeBannerForTests(): void {
	_hmrModeBannerEmitted = false;
}

// alpha.59 — Explicit module eviction.
//
// Hands a list of canonical module URLs (or `/ns/m/...` paths) to the
// runtime so V8's module registry drops them. Returns true iff the
// runtime accepted the eviction. Falls through silently (returning
// `false`) on older runtimes so the caller can switch to the legacy
// URL-versioning path. Empty inputs are no-ops.
export function invalidateModulesByUrls(urls: readonly string[]): boolean {
	emitHmrModeBannerOnce();
	if (!urls || !urls.length) return false;
	const g: any = globalThis as any;
	const fn = g.__nsInvalidateModules;
	if (typeof fn !== 'function') return false;
	try {
		fn.call(null, urls);
		return true;
	} catch (error) {
		try {
			if (ENV_VERBOSE) console.warn('[hmr-client] __nsInvalidateModules threw', (error as any)?.message || error);
		} catch {}
		return false;
	}
}

// Build canonical eviction URLs for a list of specs. Each spec must be
// a project-relative path (e.g. `/src/foo.ts`) or a normalizable
// import id; node_modules and virtual specs are filtered out because
// the runtime canonicalizer routes them through different cache keys
// and evicting them would invalidate vendor modules unrelated to the
// HMR change. Output URLs are deduplicated and prefixed with the
// active dev-server origin.
export function buildEvictionUrls(specs: readonly string[]): string[] {
	const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
	if (!origin) return [];
	const out: string[] = [];
	const seen = new Set<string>();
	for (const raw of specs) {
		if (!raw || typeof raw !== 'string') continue;
		// Skip virtual / Vite-internal specs — they don't have a stable
		// HTTP cache identity and evicting them would be a no-op.
		if (/^\0|^\/?\0/.test(raw)) continue;
		if (/plugin-vue:export-helper/.test(raw)) continue;
		// Skip vendor-realm imports; the bundled vendor module is owned
		// by the runtime, not the dev server, so /ns/m eviction would
		// not match its cache key.
		if (/(^|\/)node_modules\//.test(raw)) continue;
		const spec = normalizeSpec(raw);
		if (!spec) continue;
		const path = spec.startsWith('/') ? spec : '/' + spec;
		const url = origin + '/ns/m' + path;
		if (seen.has(url)) continue;
		seen.add(url);
		out.push(url);
	}
	return out;
}

export async function requestModuleFromServer(spec: string): Promise<string> {
	const isSfcArtifact = (s: string) => /(?:^|\/)sfc-[a-f0-9]{8}\.mjs$/i.test(s) || /\/_ns_hmr\/src\/sfc\//.test(s) || /__NSDOC__\/_ns_hmr\/src\/sfc\//.test(s);
	// Ignore Vite/virtual helper or empty specs
	if (/^\/?\0/.test(spec) || /plugin-vue:export-helper/.test(spec)) {
		return Promise.reject(new Error('virtual-helper-skip'));
	}
	// Short-circuit device artifact paths (SFC compiled files) – never ask the server for these
	try {
		if (isSfcArtifact(spec)) {
			return Promise.reject(new Error('artifact-path-disallowed'));
		}
	} catch {}
	// Special-case JSON package metadata requests at project root ONLY: some modules reference '/package.json' during dev.
	// Intentionally narrow match to '/package.json' to avoid intercepting relative imports that should be inlined.
	if (/^\/?package\.json(?:\/index)?$/.test(spec)) {
		// Let the server send the JSON-wrapped ESM code; we will write it as-is.
		// We still go through the normal request flow below, but short-circuit index heuristics.
	}
	// Construct HTTP ESM URL for this spec.
	const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
	if (!origin) return Promise.reject(new Error('no-http-origin'));
	const basePath = '/ns/m' + (spec.startsWith('/') ? spec : '/' + spec);
	const baseUrl = origin + basePath;
	let url = baseUrl;

	// alpha.59 — Stable URL when explicit eviction is supported.
	//
	// On alpha.59+ runtimes the canonicalizer collapses any
	// `__ns_hmr__/<tag>/` segment back to the stable key, so embedding
	// a tag does nothing useful — V8 still resolves to the cached
	// module. We rely on the caller (queue processor, framework
	// client) to call `invalidateModulesByUrls` before re-importing,
	// and emit the canonical URL so successive saves never drift
	// across cache identities.
	//
	// On alpha.58 (and earlier) runtimes there is no canonicalizer and
	// no `__nsInvalidateModules`, so we MUST embed a tag in the path
	// (the iOS HTTP loader strips query params before keying its
	// cache, so the bust must live in the path). Otherwise the second
	// save returns a cache hit with the old module.
	if (!hasExplicitEviction()) {
		try {
			const v = typeof graphVersion === 'number' ? graphVersion : 0;
			const h = graph.get(spec)?.hash || '';
			const g: any = globalThis as any;
			const n = typeof g?.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0;
			// Only add params when we have at least one signal.
			if (v || h || n) {
				// Prefer nonce when present to guarantee changes apply even if server version/hash are stable.
				const tag = n ? `${n}-${v}${h ? `-${h}` : ''}` : h ? `${v}-${h}` : String(v);
				// /ns/m/__ns_hmr__/<tag>/<original-spec>
				url = origin + '/ns/m/__ns_hmr__/' + encodeURIComponent(tag) + basePath.slice('/ns/m'.length);
			}
		} catch {}
	}

	emitHmrModeBannerOnce();

	const prev = moduleFetchCache.get(spec);
	if (prev === url) {
		return Promise.resolve(url);
	}
	moduleFetchCache.set(spec, url);
	return Promise.resolve(url);
}

// Centralized safe dynamic import wrapper to guard anomalous specifiers
export async function safeDynImport(spec: string): Promise<any> {
	try {
		const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
		let finalSpec = spec;
		if (!finalSpec || finalSpec === '@') {
			finalSpec = (origin ? origin : '') + '/ns/m/__invalid_at__.mjs';
		}
		// Use native dynamic import
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - dynamic import expression
		return await import(finalSpec);
	} catch (e) {
		throw e;
	}
}

// Normalize import specifiers for HTTP-only ESM runtime
export function normalizeSpec(raw: string): string {
	if (typeof raw !== 'string') return raw as any;
	let spec = raw.trim();
	try {
		// Expand HTTP origin placeholder emitted by server rewrites
		if (spec.startsWith('/__NS_HTTP_ORIGIN__')) {
			const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
			if (origin) return origin + spec.slice('__NS_HTTP_ORIGIN__'.length);
		}
		// If server emitted path-style endpoints inside modules, prefix with origin here
		if (spec.startsWith('/ns/m') || spec.startsWith('/ns/sfc')) {
			const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
			if (origin) return origin + spec;
		}
	} catch {}
	// Strip query/hash (cache busters like ?t=, ?v= etc.)
	const before = spec;
	spec = spec.replace(/[?#].*$/, '');
	if (spec !== before) {
		try {
			hmrMetrics.specQueryStripped = (hmrMetrics.specQueryStripped || 0) + 1;
		} catch {}
	}
	if (spec.startsWith('@/')) {
		// Generic alias '@/' -> project root relative; avoid assuming '/src/' structure
		spec = '/' + spec.slice(2);
	}
	if (spec === '@') {
		// Map anomalous '@' sentinel to a safe stub module path.
		try {
			hmrMetrics.invalidAtSpec = (hmrMetrics.invalidAtSpec || 0) + 1;
		} catch {}
		return '/__invalid_at__.mjs';
	}
	return spec;
}
