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
	/**
	 * Optional `@nativescript/core` `Frame` class. Pass it when the app uses a
	 * topmost-frame router (e.g. solid-navigation's `StackRouter` with
	 * `useTopMostFrame`): those routers re-run their initial navigation against
	 * `Frame.topmost()` when the fresh tree mounts. During a remount that would
	 * target a STALE frame from the old tree (often a nested tab frame) and push
	 * a backstack entry per edit. With `Frame` provided, the remount render
	 * redirects such navigations to the ROOT frame (`document.documentElement`)
	 * with `clearHistory: true`, so each HMR apply swaps the whole tree in place
	 * and disposes the old pages instead of stacking on top of them.
	 */
	Frame?: any;
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
 *   import { Application, Frame } from '@nativescript/core';
 *   import { render } from '@nativescript-community/solid-js';
 *   import { document } from 'dominative';
 *   import { startSolidApp } from '@nativescript/vite/solid-bootstrap';
 *   import { App } from './app';
 *
 *   // `Frame` is optional — pass it when using a topmost-frame router
 *   // (solid-navigation) so HMR remounts replace the root page in place.
 *   startSolidApp({ Application, render, document, Frame, root: App, rootModule: '/src/native/app' });
 */
export function startSolidApp(options: StartSolidAppOptions): void {
	const { Application, render, document, root, rootModule, Frame } = options;

	let dispose: (() => void) | undefined;
	const mount = (Component: any) => {
		const isRemount = !!dispose;
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
		// Solid flushes onMount effects synchronously inside render(), so a
		// topmost-frame router's initial navigation happens within this window.
		const closeNavWindow = isRemount ? openRemountNavRedirect(Frame, document) : undefined;
		try {
			dispose = render(Component, document.body);
		} finally {
			closeNavWindow?.();
		}
	};

	Application.run({ create: () => (mount(root), document) });

	installHmrRemount(rootModule, mount);
}

/**
 * While the fresh tree renders during an HMR remount, rewrite page navigations
 * (`frame.navigate({ create })`) to target the ROOT frame with
 * `clearHistory: true`. Topmost-frame routers (solid-navigation) resolve
 * `Frame.topmost()` at navigation time — mid-remount that is a stale frame from
 * the OLD tree (e.g. a tab's nested frame), so without the redirect each HMR
 * apply would nest the new app inside the old one and grow the backstack.
 * Clearing history on the root frame also disposes the old page hierarchy,
 * which runs the per-page Solid disposers registered by the router.
 * Returns a close function that restores the original `navigate`.
 */
function openRemountNavRedirect(Frame: any, document: any): (() => void) | undefined {
	const proto = Frame?.prototype;
	const rootFrame = document?.documentElement;
	if (!proto || typeof proto.navigate !== 'function' || !rootFrame) return undefined;
	const original = proto.navigate;
	let closed = false;
	proto.navigate = function (entry: any) {
		// Only redirect navigations that target a STALE frame — one that already
		// shows a page from the old tree (the router's `Frame.topmost()` pick, or
		// the root frame itself). Frames created by the fresh render (e.g. tab
		// item frames receiving their first page via dominative's insert) have no
		// `currentPage` yet and must navigate themselves, untouched.
		if (entry && typeof entry === 'object' && typeof entry.create === 'function' && this.currentPage) {
			console.log('[ns-solid-hmr] remount: redirecting navigation to root frame (clearHistory)');
			return original.call(rootFrame, { ...entry, clearHistory: true, animated: false });
		}
		// eslint-disable-next-line prefer-rest-params -- forwards all args verbatim to the original
		return original.apply(this, arguments as any);
	};
	return () => {
		if (closed) return;
		closed = true;
		proto.navigate = original;
	};
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
			// Evict the app entry + changed files + every module on the reverse-import
			// chain between them (`ev.ancestors`). Module identity is the URL, so if an
			// intermediate importer (e.g. `home.tsx` importing a changed
			// `listen-now.tsx`) stayed cached, re-importing the root would splice the
			// STALE subtree back into the fresh tree and the edit would never render.
			// TanStack Router route files are excluded from the shell path by the
			// subscriber below, so its live router chain is untouched for route-only
			// edits. Inline `__NS_DEV__` read — this module is served to the device
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
				// re-render for shell / shared-component / app-entry edits. The
				// shell/route decision is made from changed + boundaries ONLY;
				// ancestors always reach up to the app entry, so including them here
				// would misclassify every route edit as a shell edit.
				if (!ids.some(isShell)) return;
				// Evict the full importer chain (changed → … → entry) so the root
				// re-import below rebuilds the whole tree from fresh modules instead
				// of splicing cached stale intermediates back in.
				const ancestors = ev && Array.isArray(ev.ancestors) ? ev.ancestors.filter(isSource) : [];
				schedule([...ids, ...ancestors]);
			});
			subscribed = true;
			return;
		}
		// The HMR client loads asynchronously; retry until its global API is present.
		if (attempt < 100) setTimeout(() => trySubscribe(attempt + 1), 150);
	};
	trySubscribe(0);
}
