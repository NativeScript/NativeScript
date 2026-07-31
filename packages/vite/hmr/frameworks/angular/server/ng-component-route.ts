import type { FrameworkModuleRequestContext } from '../../../server/framework-strategy.js';

// Minimal valid ESM body for "no component update available": the iOS HTTP
// ESM loader (`LoadHttpModuleForUrl`) rejects empty bodies even on HTTP 200,
// so an actual empty response would crash the component's `_HmrLoad` import.
const NG_COMPONENT_NO_UPDATE_STUB = '// [ns:m] no Angular component update for this request — substituted with valid empty module to satisfy iOS HTTP loader (rejects empty bodies)\nexport {};\n';

/**
 * Intercept AnalogJS Angular component live-reload requests on the `/ns/m`
 * route. Returns `true` when the request was an `/@ng/component` metadata
 * fetch (answered with the no-update stub, or delegated downstream to
 * Analog's middleware with an empty-body guard); `false` for every other
 * request so the shared `/ns/m` pipeline proceeds.
 *
 * Angular 21's `ɵɵgetReplaceMetadataURL` (in @angular/core
 * _debug_node-chunk.mjs) builds the metadata-replacement URL as
 * `new URL('./@ng/component?c=<id>&t=<ts>', import.meta.url).href`.
 * Because `import.meta.url` for a NS-served module is
 * `http://host:port/ns/m/<project-relative>/component.ts`, the resolved
 * metadata URL ends up *nested* under the component's directory:
 * `/ns/m/<dir>/@ng/component?c=...&t=...`.
 *
 * AnalogJS's `liveReloadPlugin` registers a middleware that matches
 * `/@ng/component` anywhere in `req.url` and returns either an empty module
 * body (no HMR update available) or the metadata-replacement code (after a
 * save invalidates the file). Without this delegation the NS `/ns/m/`
 * middleware would treat the path as a file lookup, fail to resolve
 * `@ng/component` against disk, and respond with 404 — which surfaces as
 * `HTTP fetch/compile failed` at the component's own `_HmrLoad(Date.now())`
 * call on initial boot and blocks Angular component bootstrapping.
 *
 * Calling `next()` here lets AnalogJS's middleware (or any other middleware
 * later in the chain) handle the request. Analog's middleware reads only the
 * `?c=` query string and is pathname-agnostic, so we don't need to rewrite
 * `req.url` for it to work.
 *
 * HOWEVER: AnalogJS responds with an EMPTY body (`res.end('')`) for
 * non-invalidated component IDs (initial boot, before any file save). The
 * iOS HTTP ESM loader's `LoadHttpModuleForUrl` (ModuleInternalCallbacks.mm)
 * treats an empty body as a fetch failure (`body.empty() → reject`), even
 * when the HTTP status is 200 OK. That bubbles up as
 * `HTTP fetch/compile failed` at the device's `__ns_import(...)` inside each
 * component's `_HmrLoad(Date.now())` and crashes Angular's component
 * bootstrap. To make Analog's empty "no-update" response acceptable to the
 * iOS loader, we wrap `res.write` / `res.end` and substitute a minimal valid
 * ESM module body (`export {}`) when downstream writes nothing. Non-empty
 * bodies (real HMR update payloads after a save) pass through unchanged.
 */
export function interceptNgComponentRequest(ctx: FrameworkModuleRequestContext): boolean {
	const { urlObj, res, next, isLiveComponentUpdateFetch } = ctx;
	if (!urlObj.pathname.includes('/@ng/component')) return false;
	// Boot-fetch gate: every compiled component runs
	// `<Class>_HmrLoad(Date.now())` on evaluation, so every cold boot hits
	// this route for every component. Analog serves a REAL
	// metadata-replacement payload whenever the component's module was
	// invalidated at any point in the dev server's lifetime (Vite's
	// `lastInvalidationTimestamp` never resets), and a boot-time
	// `ɵɵreplaceMetadata` on the root component tears down the
	// PageRouterOutlet frame — the "relaunch after an HMR edit → white
	// screen" failure. Only fetches echoing a forwarded
	// `angular:component-update` broadcast's exact `(id, t)` pair may reach
	// Analog; a fresh boot already evaluates the latest transformed source
	// and never needs a replacement payload.
	if (isLiveComponentUpdateFetch) {
		const componentId = urlObj.searchParams.get('c') || '';
		const timestampRaw = urlObj.searchParams.get('t');
		// `Number(null)` is 0 — require an actual `t` param.
		const timestamp = timestampRaw ? Number(timestampRaw) : NaN;
		if (!componentId || !Number.isFinite(timestamp) || !isLiveComponentUpdateFetch(componentId, timestamp)) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/javascript');
			res.setHeader('Cache-Control', 'no-cache');
			res.end(NG_COMPONENT_NO_UPDATE_STUB);
			return true;
		}
	}
	const chunks: string[] = [];
	const origEnd = res.end.bind(res);
	let ended = false;
	const captureChunk = (chunk: unknown): void => {
		if (chunk == null) return;
		if (typeof chunk === 'string') {
			chunks.push(chunk);
		} else if (Buffer.isBuffer(chunk)) {
			chunks.push(chunk.toString('utf8'));
		} else {
			chunks.push(String(chunk));
		}
	};
	(res as any).write = function (chunk?: unknown, ..._args: unknown[]): boolean {
		captureChunk(chunk);
		return true;
	};
	(res as any).end = function (chunk?: unknown, ..._args: unknown[]): unknown {
		if (ended) return true;
		ended = true;
		captureChunk(chunk);
		let body = chunks.join('');
		if (body.length === 0) {
			body = NG_COMPONENT_NO_UPDATE_STUB;
		}
		try {
			res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
		} catch {}
		return (origEnd as (data: string) => unknown)(body);
	};
	next();
	return true;
}
