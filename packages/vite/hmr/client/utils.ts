/**
 * No circulars - don't import from other hmr/client/* modules here.
 */
declare const __NS_ENV_VERBOSE__: boolean | undefined;

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
	// 1) Prefer vendor registry to guarantee single realm
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.get === 'function') {
			const mod = reg.get('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application' && (ns?.Application || ns)) return ns.Application || ns;
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
			const mod = req('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application' && (ns?.Application || ns)) return ns.Application || ns;
			if (ns && ns[name]) return ns[name];
		}
	} catch {}
	// 4) Last resort: nativeRequire if available
	try {
		const nativeReq = g && g.__nativeRequire;
		if (typeof nativeReq === 'function') {
			try {
				const mod = nativeReq('@nativescript/core', '/');
				const ns = (mod && (mod.default || mod)) || mod;
				if (name === 'Application' && (ns?.Application || ns)) return ns.Application || ns;
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
	// IMPORTANT: cache-bust via PATH (not query) because the iOS HTTP ESM cache key
	// canonicalization strips query params.
	const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
	if (!origin) return Promise.reject(new Error('no-http-origin'));
	const basePath = '/ns/m' + (spec.startsWith('/') ? spec : '/' + spec);
	const baseUrl = origin + basePath;
	let url = baseUrl;
	try {
		// Use version+hash to avoid ESM cache returning the old module.
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
