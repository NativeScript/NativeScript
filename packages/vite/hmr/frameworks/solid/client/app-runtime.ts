/**
 * Bootstrap for NativeScript Solid apps.
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
	/** App-relative specifier of the module that exports the root component (e.g. `/src/native/app`). */
	rootModule: string;
	/**
	 * Optional `@nativescript/core` `Frame` class. Pass it when the app uses a
	 * topmost-frame router (e.g. solid-navigation's `StackRouter` with
	 * `useTopMostFrame`): those routers re-run their initial navigation against
	 * `Frame.topmost()` when the fresh tree mounts. During a remount that would
	 * target a STALE frame from the old tree (often a nested tab frame) and push
	 * a backstack entry per edit. With `Frame` provided, the remount render
	 * redirects such navigations to the ROOT frame (`document.documentElement`)
	 * with `clearHistory: true`, so each remount swaps the whole tree in place
	 * and disposes the old pages instead of stacking on top of them.
	 */
	Frame?: any;
}

/**
 * Boot a NativeScript Solid app. Call once from the app entry, e.g.:
 *
 *   import './utils/dom';
 *   import { Application, Frame } from '@nativescript/core';
 *   import { render } from '@nativescript-community/solid-js';
 *   import { document } from 'dominative';
 *   import { startSolidApp } from '@nativescript/vite/solid-bootstrap';
 *   import { App } from './app';
 *
 *   // `Frame` is optional — pass it when using a topmost-frame router
 *   // (solid-navigation) so remounts replace the root page in place.
 *   startSolidApp({ Application, render, document, Frame, root: App, rootModule: '/src/native/app' });
 */
export function startSolidApp(options: StartSolidAppOptions): void {
	const { Application, render, document, root, Frame } = options;

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
