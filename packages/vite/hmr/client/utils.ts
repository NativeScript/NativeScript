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
		if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
			console.warn('[hmr-client][origin] invariant failed for', wsUrl, '→', origin);
		}
		return origin;
	} catch {
		return 'http://localhost:5173';
	}
}

export async function requestModuleFromServer(spec: string): Promise<string> {
	const isSfcArtifact = (s: string) => /(?:^|\/)sfc-[a-f0-9]{8}\.mjs$/i.test(s) || /\/_ns_hmr\/src\/sfc\//.test(s) || /__NSDOC__\/_ns_hmr\/src\/sfc\//.test(s);
	// Ignore Vite/virtual helper or empty specs
	if (/^\/?\0/.test(spec) || /plugin-vue:export-helper/.test(spec)) {
		if (__NS_ENV_VERBOSE__) console.log('[hmr-fetch] skipping virtual helper', spec);
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
	// Cache hit: return immediately
	if (moduleFetchCache.has(spec)) {
		if (__NS_ENV_VERBOSE__) console.log('[hmr-fetch] cache hit', spec);
		return Promise.resolve(moduleFetchCache.get(spec)!);
	}
	// Construct HTTP ESM URL for this spec and cache it
	const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl);
	if (!origin) return Promise.reject(new Error('no-http-origin'));
	const url = origin + '/ns/m' + (spec.startsWith('/') ? spec : '/' + spec);
	if (__NS_ENV_VERBOSE__) console.log('[hmr-fetch] resolved', spec, '→', url);
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
		if (__NS_ENV_VERBOSE__) {
			try {
				console.log('[hmr-client][dyn-import]', 'spec=', spec, 'final=', finalSpec);
			} catch {}
		}
		// Use native dynamic import
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - dynamic import expression
		return await import(finalSpec);
	} catch (e) {
		if (__NS_ENV_VERBOSE__) {
			console.warn('[hmr-client][dyn-import][error]', spec, e);
		}
		// Best-effort diagnostics: fetch sanitized and raw sources and print a snippet around the failing frame
		try {
			await dumpDynImportDiagnostics(spec, e as any);
		} catch {}
		throw e;
	}
}

// Extract a (url, line, column) triple from a V8 stack string
function parseStackFrame(err: any): {
	url?: string;
	line?: number;
	column?: number;
} {
	try {
		const stack: string = (err && (err.stack || err.message)) || '';
		// Match patterns like: at <anonymous> (http://host/path.js:123:45) OR http://host/path.js:123:45
		const re = /(https?:[^\s)]+):(\d+):(\d+)/;
		const m = stack.match(re);
		if (m) {
			return {
				url: m[1],
				line: Number(m[2] || '0'),
				column: Number(m[3] || '0'),
			};
		}
	} catch {}
	return {};
}

async function dumpDynImportDiagnostics(spec: string, err: any) {
	try {
		const origin = httpOriginForVite || deriveHttpOrigin(hmrWsUrl) || '';
		const target = spec || '';
		const { url: uFromStack, line, column } = parseStackFrame(err);
		const url = uFromStack || target;
		if (!/^https?:\/\//.test(url)) return;
		const addParam = (u: string, k: string, v = '1') => u + (u.includes('?') ? '&' : '?') + `${k}=${v}`;
		const urlsToTry = [url];
		if (/(\/ns\/(asm|sfc))/.test(url)) urlsToTry.push(addParam(url, 'raw'));
		const results: Array<{ which: string; text?: string; hash?: string }> = [];
		for (const u of urlsToTry) {
			try {
				const res = await fetch(u as any, { method: 'GET' as any });
				const text = await res.text();
				const hash = res.headers?.get?.('X-NS-Source-Hash') || undefined;
				results.push({ which: u === url ? 'sanitized' : 'raw', text, hash });
			} catch {}
		}
		const locInfo = line && line > 0 ? ` at ${url}:${line}:${column || 0}` : '';
		try {
			console.warn('[hmr-client][dyn-import][diagnostics]', `error${locInfo}`);
		} catch {}
		for (const r of results) {
			if (!r.text) continue;
			const lines = r.text.split('\n');
			let ctx = '';
			if (line && line > 0) {
				const start = Math.max(1, line - 3),
					end = Math.min(lines.length, line + 3);
				for (let i = start; i <= end; i++) {
					const mark = i === line ? '>' : ' ';
					const ln = String(i).padStart(4, ' ');
					ctx += `${mark}${ln}: ${lines[i - 1]}\n`;
				}
			} else {
				ctx = lines.slice(0, 20).join('\n');
			}
			try {
				console.warn(`[hmr-client][dyn-import][${r.which}]`, r.hash ? `(hash ${r.hash})` : '', '\n' + ctx);
			} catch {}
		}
	} catch {}
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
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-normalize] mapping anomalous "@" to stub module');
		try {
			hmrMetrics.invalidAtSpec = (hmrMetrics.invalidAtSpec || 0) + 1;
		} catch {}
		return '/__invalid_at__.mjs';
	}
	return spec;
}

export function attachDiagnosticsToFrame(frame: any) {
	if (!__NS_ENV_VERBOSE__ || !frame) return;
	try {
		if ((frame as any).__ns_diag_attached__) return;
		(frame as any).__ns_diag_attached__ = true;
		const safeOn = (v: any, evt: string, cb: Function) => {
			try {
				v?.on?.(evt as any, cb as any);
			} catch {}
		};
		const logEvt = (name: string) => (args: any) => {
			try {
				const page = (args && (args.object?.currentPage || args.object?._currentEntry?.resolvedPage)) || args?.object || null;
				const pageCtor = String(page?.constructor?.name || '').replace(/^_+/, '');
				const tag = (page as any)?.__ns_hmr_tag || (page as any)?.__ns_diag_tag;
				console.log('[diag][frame]', name, {
					frameCtor: frame?.constructor?.name,
					pageCtor,
					tag,
					backstackDepth: (frame as any)?._backStack?.length || 0,
				});
			} catch {}
		};
		safeOn(frame, 'navigatingTo', logEvt('navigatingTo'));
		safeOn(frame, 'navigatedTo', logEvt('navigatedTo'));
		safeOn(frame, 'navigatingFrom', logEvt('navigatingFrom'));
		safeOn(frame, 'navigatedFrom', logEvt('navigatedFrom'));
		safeOn(frame, 'loaded', () => {
			try {
				console.log('[diag][frame] loaded', { ctor: frame?.constructor?.name });
			} catch {}
		});
		safeOn(frame, 'unloaded', () => {
			try {
				console.log('[diag][frame] unloaded', {
					ctor: frame?.constructor?.name,
				});
			} catch {}
		});
	} catch {}
}

export function logUiSnapshot(reason: string) {
	try {
		const g: any = globalThis as any;
		const F = getCore('Frame') || g.Frame;
		const App = getCore('Application') || g.Application;
		const top = F?.topmost?.();
		const rootView = App?.getRootView ? App.getRootView() : undefined;
		const page = top?.currentPage || top?._currentEntry?.resolvedPage || null;
		const info = {
			reason,
			placeholderActive: !!(g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__ || g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__),
			activityReady: !!(App?.android && (App.android.foregroundActivity || App.android.startActivity)),
			topFrame: top
				? {
						ctor: top.constructor?.name,
						backstack: (top as any)?._backStack?.length || 0,
					}
				: null,
			rootView: rootView ? { ctor: rootView.constructor?.name } : null,
			currentPage: page
				? {
						ctor: page.constructor?.name,
						tag: (page as any)?.__ns_hmr_tag || (page as any)?.__ns_diag_tag,
						title: (page as any)?.title,
					}
				: null,
		};
		console.log('[diag][ui]', info);
	} catch {}
}
