/**
 * App-driven navigation backend for the Vue flavor.
 *
 * `__nsNavigateUsingApp` is the HMR navigation path behind the `/ns/rt`
 * bridge's `$navigateTo`: it builds a fresh Vue app per navigation and mounts
 * the destination component deterministically (rather than relying on the
 * vendor-held rootApp, which can live in a different module realm). It is
 * installed onto `globalThis` by the Vue client strategy's `install()` so the
 * bridge can reach it without importing any Vue module.
 */
import { getCore, getCurrentApp, getRootFrame, setCurrentApp, setRootFrame, ENV_VERBOSE as VERBOSE } from '../../../client/utils.js';
import { getGlobalScope } from '../../../shared/runtime/global-scope.js';
import { resolveVendorModule } from '../../../shared/runtime/vendor-resolve.js';
import { ensurePiniaOnApp, ensureVueGlobals } from './index.js';

export function normalizeComponent(input: any, nameHint?: string): any {
	try {
		if (!input) return null;
		// Unwrap module namespace with default
		if (input && typeof input === 'object' && 'default' in input) {
			const d = (input as any).default;
			if (d) return normalizeComponent(d, nameHint);
		}
		// If already a component-like object with render/setup/template, return as-is
		if (typeof input === 'object' && (input.render || input.setup || input.template || input.__isVue)) {
			return input;
		}
		// If provided a render function, wrap with defineComponent
		if (typeof input === 'function') {
			ensureVueGlobals();
			const comp = getGlobalScope().defineComponent
				? getGlobalScope().defineComponent({
						name: nameHint || input.name || 'AnonymousSFC',
						render: input,
					})
				: { name: nameHint || input.name || 'AnonymousSFC', render: input };
			return comp;
		}
		// If object has a render function property
		if ((input as any)?.render && typeof (input as any).render === 'function') {
			ensureVueGlobals();
			const comp = getGlobalScope().defineComponent
				? getGlobalScope().defineComponent({
						name: nameHint || (input as any).name || 'AnonymousSFC',
						render: (input as any).render,
					})
				: {
						name: nameHint || (input as any).name || 'AnonymousSFC',
						render: (input as any).render,
					};
			return comp;
		}
	} catch {}
	return input;
}

// Deterministic navigation using the current Vue app instance rather than vendor-held rootApp.
function __nsNavigateUsingApp(comp: any, opts: any = {}) {
	const g = getGlobalScope();
	ensureVueGlobals();
	const AppFactory = g.createApp;
	const RootCtor = g.NSVRoot;
	if (typeof AppFactory !== 'function' || typeof RootCtor !== 'function') {
		throw new Error('Vue runtime not initialized');
	}
	try {
		const top = (g.Frame && g.Frame.topmost && g.Frame.topmost()) || null;
		const ctor = top && top.constructor && top.constructor.name;
		if (VERBOSE)
			console.log('[app-nav] begin', {
				hmrRealm: g.__NS_HMR_REALM__ || 'unknown',
				rtRealm: g.__NS_RT_REALM__ || 'unknown',
				topCtor: ctor,
				hasTop: !!top,
			});
	} catch {}
	// Build a fresh Page each time the factory is invoked to avoid reusing a Page instance
	// across fragment recreations (Android) or multiple frame attachments.
	const buildTarget = () => {
		const existingApp = getCurrentApp();
		const baseProvides = (existingApp && existingApp._context && existingApp._context.provides) || {};
		// Forward `opts.props` as Vue's rootProps so `$navigateTo(Comp, { props: { … } })`
		// reaches the destination component. nativescript-vue's stock `$navigateTo`
		// does the same via `createNativeView(target, options?.props, …)` →
		// `renderer.createApp(component, props)`. Dropping props here would surface
		// at the destination as `[Vue warn]: Missing required prop` and any
		// required-prop component would render with `undefined` bindings.
		const app = AppFactory(normalizeComponent(comp, comp && (comp.__name || comp.name)), opts && (opts as any).props);
		ensurePiniaOnApp(app);
		try {
			const rh: any = resolveVendorModule('nativescript-vue/dist/runtimeHelpers');
			const setRootApp = rh && (rh.setRootApp || rh.default?.setRootApp);
			if (typeof setRootApp === 'function') setRootApp(app);
		} catch {}
		try {
			const ctx = app?._context;
			if (ctx) {
				const prov = (ctx.provides ||= {});
				Object.getOwnPropertyNames(baseProvides).forEach((k) => {
					if (!Object.prototype.hasOwnProperty.call(prov, k)) prov[k] = baseProvides[k];
				});
				Object.getOwnPropertySymbols(baseProvides).forEach((s) => {
					if (!Object.prototype.hasOwnProperty.call(prov, s)) prov[s] = (baseProvides as any)[s];
				});
			}
		} catch {}
		const root = new RootCtor();
		const vm = typeof (app as any).runWithContext === 'function' ? (app as any).runWithContext(() => (app as any).mount(root) as any) : ((app as any).mount(root) as any);
		setCurrentApp(app);
		const el = vm?.$el;
		const nativeView = el?.nativeView;
		if (!nativeView) throw new Error('navigation mount did not yield a nativeView');
		const P = getCore('Page');
		const ctorName = String(nativeView?.constructor?.name || '').replace(/^_+/, '');
		if (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName)) {
			return nativeView;
		}
		if (typeof P === 'function') {
			const pg = new (P as any)();
			(pg as any).content = nativeView;
			// Hide default ActionBar for wrapped views to avoid double bars
			try {
				(pg as any).actionBarHidden = true;
			} catch {}
			return pg;
		}
		return nativeView; // fallback
	};
	let frame = opts && (opts as any).frame ? (opts as any).frame : getRootFrame();
	if (!frame) {
		const F = getCore('Frame');
		frame = F && typeof F.topmost === 'function' ? (F.topmost() as any) : null;
	}
	if (!frame) {
		const GApp = getCore('Application') || (g as any).Application;
		const F = getCore('Frame');
		if (typeof GApp?.resetRootView === 'function' && typeof F === 'function') {
			GApp.resetRootView({
				create: () => {
					const fr = new (F as any)();
					const navEntry = {
						create: () => buildTarget(),
						clearHistory: true,
						animated: false,
					} as any;
					try {
						(fr as any).navigate(navEntry);
					} catch {}
					setRootFrame(fr);
					return fr;
				},
			} as any);
			return undefined;
		}
		throw new Error('Application.resetRootView unavailable');
	}
	const navEntry = { create: () => buildTarget(), ...(opts || {}) } as any;
	(frame as any).navigate(navEntry);
	return undefined;
}

/** Expose deterministic app navigation globally so /ns/rt can guarantee single-path navigation. */
export function installVueNavigateUsingApp(): void {
	try {
		globalThis.__nsNavigateUsingApp = __nsNavigateUsingApp;
	} catch {}
}
