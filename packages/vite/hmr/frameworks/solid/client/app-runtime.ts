/**
 * Bootstrap + HMR remount for NativeScript Solid apps.
 *
 * Solid runs with `hot: false` (solid-refresh is off — it rewrites `export
 * function` into a non-hoisted const and breaks TanStack file-route modules), so
 * there is no fine-grained component HMR.
 *
 * Division of labour on each Solid HMR cycle (`__ns_solid_hmr_subscribe`):
 *   • ROUTE files — handled by @nativescript/tanstack-router's per-page remount
 *     (`subscribeSolidHmrRemount` → `page.__ns_remount`), which swaps the route
 *     component in place WITHOUT re-navigating, so the user stays on their route.
 *     This helper does nothing for route-only edits.
 *   • Everything else (app shell / shared components / app entry) — this helper
 *     re-imports the app entry and re-renders the whole Solid tree. The router is
 *     REUSED (its chain is never evicted), so the current route is preserved.
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
const isSource = (id: string) => SCRIPT_EXT.test(id) && !/\.d\.ts$/i.test(id);
// A "shell" change is any source file that is NOT a route file — route files are
// hot-swapped per-page by the router, shell files need an app re-render.
const isShell = (id: string) => isSource(id) && !ROUTE_FILE_RE.test(id);

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
			// Evict the app entry + changed files so their re-imports resolve to fresh
			// code. We deliberately do NOT evict the router / route-tree chain: keeping
			// it cached preserves the live router (and the user's current route).
			// Inline `__NS_DEV__` read — this module is served to the device
			// standalone, so it stays import-free.
			const g: any = globalThis;
			const invalidate = g.__NS_DEV__?.invalidateModules;
			if (typeof invalidate === 'function') {
				try {
					invalidate(evictionUrls(origin, [rootModule, ...changed]));
				} catch (err) {
					console.log('[ns-solid-hmr] invalidate threw', err);
				}
			}
			// Canonical URL only. The eviction above armed the runtime's
			// bust-next-fetch nonce, so this import re-fetches the freshly
			// transformed module — a path tag would mint a second module
			// identity instead (module identity IS the URL).
			const candidates = [origin + '/ns/m' + rootModule];
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
				const ids = [...changed, ...boundaries].filter(isSource);
				// Route-only edits are hot-swapped in place by the router's per-page
				// remount — don't re-render the whole app (which would fight it). Only
				// re-render for shell / shared-component / app-entry edits.
				if (!ids.some(isShell)) return;
				schedule(ids);
			});
			subscribed = true;
			return;
		}
		// The HMR client loads asynchronously; retry until its global API is present.
		if (attempt < 100) setTimeout(() => trySubscribe(attempt + 1), 150);
	};
	trySubscribe(0);
}
