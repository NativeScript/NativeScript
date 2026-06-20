/**
 * Bootstrap + HMR remount for NativeScript Solid apps.
 *
 * Solid runs with `hot: false` (solid-refresh is off — it rewrites `export
 * function` into a non-hoisted const and breaks TanStack file-route modules), so
 * there is no fine-grained component HMR. Instead, on every Solid HMR cycle this
 * helper re-renders the app's Solid tree against the latest code, driven by the NS
 * HMR client's `__ns_solid_hmr_subscribe` completion event.
 *
 * Two things make an edit show up while keeping the user where they are:
 *   1. The live TanStack router instance is REUSED (never rebuilt), so the user's
 *      current route is preserved — no bounce back to the initial route.
 *   2. For an edited route file we re-import it fresh and patch the matching
 *      route's `options.component` on that live router, then re-render. For
 *      everything else (shared components, the app shell) a fresh re-import of the
 *      app entry picks up the new code.
 *
 * Renderer bindings (`Application`, `render`, `document`) are passed in rather than
 * imported here so the helper uses the app's exact solid-js / dominative instances.
 * Importing our own copies could resolve to a different module realm and break
 * Solid reactivity (NativeScript can load a package's deps in a separate realm).
 */
export interface StartSolidAppOptions {
	/** `@nativescript/core` `Application`. */
	Application: { run(entry: { create: () => any }): void };
	/** `@nativescript-community/solid-js` `render` — mounts a component, returns a disposer. */
	render: (component: any, target: any) => () => void;
	/** dominative `document` — returned as the root view; `document.body` is the mount target. */
	document: any;
	/** Initial root component (used for the first mount). */
	root: any;
	/**
	 * App-relative specifier of the module that exports the root component, as
	 * `App` or default (e.g. `/src/native/app`). Re-imported fresh on each cycle.
	 */
	rootModule: string;
}

const SCRIPT_EXT = /\.(?:tsx|jsx|ts|js|mjs|mts|cjs|cts)$/i;
const ROUTE_FILE_RE = /\/routes\/.+\.(?:tsx|jsx)$/i;
const ROOT_ROUTE_RE = /\/routes\/__root\.(?:tsx|jsx|ts|js)$/i;
const isSource = (id: string) => SCRIPT_EXT.test(id) && !/\.d\.ts$/i.test(id);

/** Resolve the dev-server HTTP origin used to fetch app modules over the wire. */
function resolveOrigin(): string {
	try {
		const m = String(import.meta.url).match(/^https?:\/\/[^/]+/);
		if (m) return m[0];
	} catch {}
	const g = globalThis as any;
	if (typeof g.__NS_HTTP_ORIGIN__ === 'string' && /^https?:\/\//.test(g.__NS_HTTP_ORIGIN__)) {
		return g.__NS_HTTP_ORIGIN__;
	}
	if (typeof g.__NS_HMR_WS_URL__ === 'string') {
		const m = g.__NS_HMR_WS_URL__.match(/^wss?:\/\/([^/]+)/);
		if (m) return 'http://' + m[1];
	}
	return '';
}

/** Canonical `/ns/m/<path>` eviction URLs (with + without script extension). */
function evictionUrls(origin: string, specs: string[]): string[] {
	const urls = new Set<string>();
	for (const raw of specs) {
		if (!raw) continue;
		let spec = raw.split('?')[0];
		if (!spec.startsWith('/')) spec = '/' + spec;
		const canonical = spec.replace(SCRIPT_EXT, '');
		urls.add(origin + '/ns/m' + canonical);
		if (spec !== canonical) urls.add(origin + '/ns/m' + spec);
		for (const ext of ['.tsx', '.ts', '.jsx', '.js']) urls.add(origin + '/ns/m' + canonical + ext);
	}
	return Array.from(urls);
}

/** Translate a route file id to its TanStack `fullPath` (e.g. `/src/routes/posts.$id.tsx` → `/posts/$id`). */
function routeFileToFullPath(id: string): string | null {
	const m = id.match(/\/src\/routes\/(.+)\.(?:tsx|jsx|ts|js)$/i);
	if (!m) return null;
	let p = m[1].replace(/\./g, '/');
	if (p === 'index') return '/';
	if (p.endsWith('/index')) p = p.slice(0, -6);
	p = p.replace(/(^|\/)-([\w])/g, '$1$2');
	return '/' + p;
}

function findRouteByFullPath(router: any, fullPath: string): any | null {
	const byId = router?.routesById;
	if (!byId) return null;
	for (const rid of Object.keys(byId)) {
		if (byId[rid]?.fullPath === fullPath) return byId[rid];
	}
	return null;
}

/**
 * For each edited route file, re-import it fresh and patch the matching route's
 * `options.component` (and `loader`) on the live router, so the subsequent
 * re-render shows the new code without rebuilding the router (which would reset
 * the current route). The changed files were just evicted by the caller, so these
 * imports resolve to fresh code. No-ops when the app isn't using
 * @nativescript/tanstack-router (`globalThis.__ns_router`).
 */
async function patchChangedRoutes(origin: string, changed: string[], nonce: string): Promise<void> {
	const router = (globalThis as any).__ns_router;
	if (!router || !router.routesById) return;
	for (const id of changed) {
		if (!ROUTE_FILE_RE.test(id) || ROOT_ROUTE_RE.test(id)) continue;
		const fullPath = routeFileToFullPath(id);
		if (!fullPath) continue;
		try {
			const mod: any = await import(/* @vite-ignore */ origin + '/ns/m' + id.replace(/\.(?:tsx|jsx)$/i, '') + '?t=' + nonce);
			const fresh = mod && mod.Route && mod.Route.options;
			if (!fresh) continue;
			const route = findRouteByFullPath(router, fullPath);
			if (route && route.options) {
				if (fresh.component) route.options.component = fresh.component;
				if (fresh.loader) route.options.loader = fresh.loader;
			}
		} catch (err) {
			console.log('[ns-solid-hmr] route patch failed for', id, (err as any)?.message ?? err);
		}
	}
}

/**
 * Boot a NativeScript Solid app and wire up HMR remounting. Call once from the
 * app entry, e.g.:
 *
 *   import './utils/dom';
 *   import { Application } from '@nativescript/core';
 *   import { render } from '@nativescript-community/solid-js';
 *   import { document } from 'dominative';
 *   import { startSolidApp } from '@nativescript/vite/solid-bootstrap';
 *   import { App } from './app';
 *
 *   startSolidApp({ Application, render, document, root: App, rootModule: '/src/native/app' });
 */
export function startSolidApp(options: StartSolidAppOptions): void {
	const { Application, render, document, root, rootModule } = options;

	let dispose: (() => void) | undefined;
	const mount = (Component: any) => {
		if (dispose) {
			try {
				dispose();
			} catch (err) {
				console.log('[ns-solid-hmr] dispose error', err);
			}
			dispose = undefined;
			// Rapid remounts can leave a detached native view parented to body; drop
			// any residue so each remount starts clean (else ghost/overlapping views).
			try {
				const body = document.body;
				while (body && body.firstChild) body.removeChild(body.firstChild);
			} catch (err) {
				console.log('[ns-solid-hmr] body clear error', err);
			}
		}
		dispose = render(Component, document.body);
	};

	Application.run({ create: () => (mount(root), document) });

	installHmrRemount(rootModule, mount);
}

function installHmrRemount(rootModule: string, mount: (c: any) => void): void {
	const origin = resolveOrigin();
	let nonce = 0;

	let busy = false;
	let rerun = false;
	const remount = async (changed: string[]): Promise<void> => {
		if (!origin) {
			console.log('[ns-solid-hmr] no HTTP origin resolved; cannot re-import');
			return;
		}
		if (busy) {
			// A remount is in flight; run one more pass after it settles so the very
			// latest edit is never dropped.
			rerun = true;
			return;
		}
		busy = true;
		try {
			// Evict the app entry + changed files so their re-imports below resolve to
			// fresh code. We deliberately do NOT evict the router / route-tree modules:
			// keeping them cached preserves the live router (and the user's current
			// route) across the re-mount.
			const invalidate = (globalThis as any).__nsInvalidateModules;
			if (typeof invalidate === 'function') {
				try {
					invalidate(evictionUrls(origin, [rootModule, ...changed]));
				} catch (err) {
					console.log('[ns-solid-hmr] invalidate threw', err);
				}
			}
			const t = `${Date.now()}_${++nonce}`;

			// Patch edited route components onto the live router (fresh import) before
			// re-rendering, so route edits show up on the current page without a router
			// rebuild. No-op for apps that don't use @nativescript/tanstack-router.
			await patchChangedRoutes(origin, changed, t);

			// Re-import the app entry (fresh shell + shared components) and re-render.
			// Plain canonical URL first (fresh after eviction, avoids the "module
			// invalidated during dev reload" race); entry-tagged URL is the fallback
			// for runtimes where eviction is a no-op.
			const candidates = [origin + '/ns/m' + rootModule + '?t=' + t, origin + '/ns/m/__ns_hmr__/entry-' + t + rootModule + '?t=' + t];
			for (const url of candidates) {
				try {
					const mod: any = await import(/* @vite-ignore */ url);
					const Next = mod && (mod.App || mod.default);
					if (typeof Next === 'function') {
						mount(Next);
						return;
					}
				} catch (err) {
					console.log('[ns-solid-hmr] re-import failed', url, (err as any)?.message ?? err);
				}
			}
			console.log('[ns-solid-hmr] all re-import candidates failed');
		} finally {
			busy = false;
			if (rerun) {
				rerun = false;
				void remount([]);
			}
		}
	};

	// Coalesce bursts (a single save can fan out several notifications) into one remount.
	let timer: ReturnType<typeof setTimeout> | undefined;
	let pending = new Set<string>();
	const schedule = (ids: string[]) => {
		for (const id of ids) pending.add(id);
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = undefined;
			const batch = Array.from(pending);
			pending = new Set();
			void remount(batch);
		}, 30);
	};

	const g = globalThis as any;
	let subscribed = false;
	const trySubscribe = (attempt: number) => {
		if (subscribed) return;
		if (typeof g.__ns_solid_hmr_subscribe === 'function') {
			g.__ns_solid_hmr_subscribe((ev: any) => {
				const changed = ev && Array.isArray(ev.changedFiles) ? ev.changedFiles : [];
				const boundaries = ev && Array.isArray(ev.boundaries) ? ev.boundaries : [];
				schedule([...changed, ...boundaries].filter(isSource));
			});
			subscribed = true;
			return;
		}
		// The HMR client loads asynchronously; retry until its global API is present.
		if (attempt < 100) setTimeout(() => trySubscribe(attempt + 1), 150);
	};
	trySubscribe(0);
}
