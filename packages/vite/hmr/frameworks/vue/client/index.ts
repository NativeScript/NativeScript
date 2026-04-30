import { deriveHttpOrigin, getCore, getCurrentApp, getGraphVersion, getHMRWsUrl, getHttpOriginForVite, normalizeSpec, safeDynImport, safeReadDefault, setCurrentApp } from '../../../client/utils.js';

// satisfied by define replacement
declare const __NS_ENV_VERBOSE__: boolean | undefined;
declare const __NS_APP_ROOT_VIRTUAL__: string | undefined;

const APP_VIRTUAL_WITH_SLASH = (() => {
	const root = typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__ ? __NS_APP_ROOT_VIRTUAL__ : '/src';
	return root.replace(/\/+$/, '') + '/';
})();

// Optional runtime knob: allow disabling assembler path in favor of variant-only flow
const DISABLE_ASM: boolean = !!(globalThis as any).__NS_HMR_DISABLE_ASM__;

// Module-scoped state to avoid leaking into globalThis
let nsVueInitDone = false; // nativescript-vue init guard
let nsStartDone = false; // start() guard
// Track SFC changes by graph version to prioritize SFC root reset before non-Vue evaluation
let sfcChangedVersion: number | null = null;
export const sfcChangedIds = new Set<string>();
// Map of original SFC source absolute/relative path -> compiled sfc-*.mjs filename written to Documents
export const sfcArtifactMap = new Map<string, string>();

// Install dev shims for nativescript-vue navigation to observe and (optionally) rescue
export function installNsVueDevShims() {
	try {
		const g: any = globalThis as any;
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		const req: any = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
		const getMod = (id: string) => {
			try {
				if (reg && reg.has(id)) return reg.get(id);
			} catch {}
			try {
				if (typeof req === 'function') return req(id);
			} catch {}
			return null;
		};
		const nv = getMod('nativescript-vue');
		const rh = getMod('nativescript-vue/dist/runtimeHelpers');
		const wrap = (orig: any, label: string) => {
			if (typeof orig !== 'function') return orig;
			if ((orig as any).__ns_wrapped__) return orig; // idempotent
			const wrapped = function __ns_nav_wrap(component: any, params?: any) {
				try {
					if (__NS_ENV_VERBOSE__) {
						console.log('[diag][nv][navigateTo]', {
							from: label,
							hasComp: !!component,
							paramKeys: Object.keys(params || {}),
						});
					}
					return orig.apply(this, arguments as any);
				} catch (e) {
					try {
						console.warn('[diag][nv][navigateTo][error]', (e && (e as any).message) || e);
					} catch {}
					try {
						// Rescue path: attempt navigation via authoritative app Frame
						return ((globalThis as any).__nsNavigateUsingApp as any)?.(component, params);
					} catch {}
					throw e;
				}
			} as any;
			try {
				(wrapped as any).__ns_wrapped__ = true;
			} catch {}
			return wrapped;
		};
		if (nv) {
			try {
				if (nv.navigateTo) nv.navigateTo = wrap(nv.navigateTo, 'nv');
				if (nv.$navigateTo) nv.$navigateTo = wrap(nv.$navigateTo, '$nv');
			} catch {}
		}
		if (rh) {
			try {
				if (rh.navigateTo) rh.navigateTo = wrap(rh.navigateTo, 'rh');
			} catch {}
		}
	} catch {}
}

// initial root component for back fallback
let ORIG_ROOT_COMPONENT: any | null = null;

// Ensure Vue runtime global functions exist before evaluating SFC artifacts that rely on globalThis.* indirections.
export function ensureVueGlobals() {
	try {
		const g: any = globalThis;
		const vueAlready = g.defineComponent && g.resolveComponent && g.createVNode;
		const req: any = (globalThis as any).__nsVendorRegistry?.get ? (globalThis as any).__nsVendorRequire || (globalThis as any).__nsRequire || (globalThis as any).require : (globalThis as any).__nsRequire || (globalThis as any).require;
		const registry: Map<string, any> | undefined = (globalThis as any).__nsVendorRegistry;
		let nvMod: any = null;
		let vueMod: any = null;
		// Prefer nativescript-vue first so createApp has .start and NSVRoot is available
		if (registry && registry.has('nativescript-vue')) {
			nvMod = registry.get('nativescript-vue');
		}
		if (registry && registry.has('vue')) {
			vueMod = registry.get('vue');
		}
		if (!nvMod && typeof req === 'function') {
			try {
				nvMod = req('nativescript-vue');
			} catch {}
		}
		if (!vueMod && typeof req === 'function') {
			try {
				vueMod = req('vue');
			} catch {}
			if (!vueMod) {
				try {
					vueMod = req('@vue/runtime-core');
				} catch {}
			}
		}
		const baseMod = nvMod || vueMod;
		let chosenMod: any = baseMod;
		if (!chosenMod) {
			// Last-ditch attempts on known ids
			try {
				chosenMod = req && typeof req === 'function' ? req('nativescript-vue') : null;
			} catch {}
			if (!chosenMod) {
				try {
					chosenMod = req && typeof req === 'function' ? req('vue') : null;
				} catch {}
			}
			if (!chosenMod) return;
		}
		if (!vueMod) {
			// Last-ditch attempts on known ids
			try {
				vueMod = req && typeof req === 'function' ? req('vue') : null;
			} catch {}
			if (!vueMod) {
				try {
					vueMod = req && typeof req === 'function' ? req('nativescript-vue') : null;
				} catch {}
			}
			if (!vueMod) return;
		}
		// Polyfill essential runtime helpers often imported from 'vue' by compiled SFC render code
		try {
			const polyNormalizeClass = (val: any): string => {
				if (!val) return '';
				if (typeof val === 'string') return val;
				if (Array.isArray(val)) return val.map(polyNormalizeClass).filter(Boolean).join(' ');
				if (typeof val === 'object')
					return Object.keys(val)
						.filter((k) => !!val[k])
						.join(' ');
				return '';
			};
			const polyNormalizeStyle = (val: any): any => {
				if (!val) return null;
				if (Array.isArray(val)) return val.reduce((acc, v) => Object.assign(acc, polyNormalizeStyle(v) || {}), {} as any);
				if (typeof val === 'string') {
					const out: any = {};
					val.split(';').forEach((pair) => {
						const idx = pair.indexOf(':');
						if (idx > -1) {
							const k = pair.slice(0, idx).trim();
							const v = pair.slice(idx + 1).trim();
							if (k) out[k] = v;
						}
					});
					return out;
				}
				if (typeof val === 'object') return { ...val };
				return null;
			};
			const polyToDisplayString = (val: any): string => {
				try {
					if (val == null) return '';
					if (typeof val === 'object') return JSON.stringify(val);
					return String(val);
				} catch {
					return String(val);
				}
			};
			const vmAny: any = vueMod as any;
			if (vmAny && typeof vmAny === 'object') {
				if (!('normalizeClass' in vmAny)) vmAny.normalizeClass = polyNormalizeClass;
				if (!('normalizeStyle' in vmAny)) vmAny.normalizeStyle = polyNormalizeStyle;
				if (!('toDisplayString' in vmAny)) vmAny.toDisplayString = polyToDisplayString;
			}
			// Do not assign polyfills onto globalThis; compiled helpers are wired via alias() below
		} catch {}
		const runtime: any = (chosenMod && (chosenMod.default ?? chosenMod)) || chosenMod;
		const {
			defineComponent,
			resolveComponent,
			createVNode,
			createTextVNode,
			createCommentVNode,
			// We deliberately pull createApp here but assign it globally below to avoid mixing module instances
			createApp: _createApp,
			Fragment,
			withCtx,
			openBlock,
			createBlock,
			createElementVNode,
			createElementBlock,
			renderSlot,
			mergeProps,
			toHandlers,
			renderList,
			normalizeProps,
			guardReactiveProps,
			withDirectives,
			resolveDirective,
			withModifiers,
			withKeys,
			isRef,
			ref,
			shallowRef,
			unref,
			computed,
			onMounted,
			onBeforeUnmount,
			onUnmounted,
			watch,
			nextTick,
			vShow,
		} = (runtime || {}) as any;
		// Assign only if not already set to avoid clobbering potentially patched versions.
		if (!vueAlready) {
			g.defineComponent ||= defineComponent;
			g.resolveComponent ||= resolveComponent;
			g.createVNode ||= createVNode;
			g.createTextVNode ||= createTextVNode;
			g.createCommentVNode ||= createCommentVNode;
			g.Fragment ||= Fragment;
			// Critical: ensure createApp and runtime-bound classes/functions reference the same module instance
			try {
				g.createApp ||= _createApp || (runtime as any)?.createApp || (nvMod as any)?.createApp || (vueMod as any)?.createApp;
			} catch {}
			try {
				g.NSVRoot ||= (runtime as any)?.NSVRoot || (nvMod as any)?.NSVRoot || (vueMod as any)?.NSVRoot;
			} catch {}
			try {
				g.registerElement ||= (runtime as any)?.registerElement || (nvMod as any)?.registerElement || (vueMod as any)?.registerElement;
			} catch {}
			try {
				g.start ||= (runtime as any)?.start || (nvMod as any)?.start || (vueMod as any)?.start;
			} catch {}
			g.withCtx ||= withCtx;
			g.openBlock ||= openBlock;
			g.createBlock ||= createBlock;
			g.createElementVNode ||= createElementVNode || createVNode;
			g.createElementBlock ||= createElementBlock || createBlock;
			g.renderSlot ||= renderSlot;
			g.mergeProps ||= mergeProps;
			g.toHandlers ||= toHandlers;
			g.renderList ||= renderList;
			g.normalizeProps ||= normalizeProps;
			g.guardReactiveProps ||= guardReactiveProps;
			g.withDirectives ||= withDirectives;
			g.resolveDirective ||= resolveDirective;
			g.withModifiers ||= withModifiers;
			g.withKeys ||= withKeys;
			g.isRef ||= isRef;
			g.ref ||= ref;
			g.shallowRef ||= shallowRef;
			g.unref ||= unref;
			g.computed ||= computed;
			g.onMounted ||= onMounted;
			g.onBeforeUnmount ||= onBeforeUnmount;
			g.onUnmounted ||= onUnmounted;
			g.watch ||= watch;
			g.nextTick ||= nextTick;
			// Built-in directives
			g.vShow ||= vShow;
			// Create underscore aliases to satisfy compiled helper identifiers (e.g. _renderSlot)
			try {
				const alias = (from: string, to?: string) => {
					try {
						const val = (g as any)[from];
						const key = to || '_' + from;
						if (val && !(key in (g as any))) (g as any)[key] = val;
					} catch {}
				};
				alias('renderSlot');
				alias('normalizeClass');
				alias('normalizeStyle');
				alias('toDisplayString');
				alias('openBlock');
				alias('createElementBlock');
				alias('createElementVNode');
				alias('createVNode');
				alias('createBlock');
				alias('normalizeProps');
				alias('guardReactiveProps');
				alias('mergeProps');
				alias('toHandlers');
				alias('withCtx');
				alias('withDirectives');
				alias('resolveComponent');
				alias('resolveDirective');
				alias('withModifiers');
				alias('withKeys');
				alias('isRef');
				alias('unref');
				alias('vShow');
				alias('Fragment', '_Fragment');
			} catch {}
		}
		// Navigation helpers: no longer patched onto globalThis; use __nsNavigateUsingApp via imports or app instance
		// If Vue was already present originally we still ensure nav helpers; that's why we delayed early return.
	} catch {}
}

// Ensure Pinia is installed on the given Vue app during HMR remounts.
// We keep a singleton Pinia instance on globalThis to preserve store state across resets when possible.
export function ensurePiniaOnApp(app: any) {
	try {
		if (!app || typeof app.use !== 'function') return;
		const g: any = globalThis as any;
		// If this app already has a Pinia provide, skip
		try {
			const prov = app?._context?.provides;
			if (prov) {
				const hasString = Object.prototype.hasOwnProperty.call(prov, 'pinia');
				const knownSym = g.__NS_PINIA_SYMBOL__;
				const hasKnownSym = knownSym ? Object.prototype.hasOwnProperty.call(prov, knownSym) : false;
				const hasSym = hasKnownSym || Object.getOwnPropertySymbols(prov).some((s) => /pinia/i.test((s as any).description || ''));
				if (hasString || hasSym) return;
			}
		} catch {}
		// If a global Pinia instance is already present, just use it and avoid importing new copies
		if (g.__NS_HMR_PINIA__) {
			try {
				app.use(g.__NS_HMR_PINIA__);
			} catch {}
			// Attempt to set active pinia if API is available
			try {
				const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
				const req: any = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
				let piniaMod: any = null;
				if (registry && registry.has('pinia')) piniaMod = registry.get('pinia');
				if (!piniaMod && typeof req === 'function') {
					try {
						piniaMod = req('pinia');
					} catch {}
				}
				const resolved = (piniaMod && (piniaMod.default ?? piniaMod)) || null;
				const setActivePinia = resolved?.setActivePinia;
				if (typeof setActivePinia === 'function') setActivePinia(g.__NS_HMR_PINIA__);
			} catch {}
			return;
		}
		// Prefer vendor registry/require to load 'pinia'
		const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
		const req: any = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
		let piniaMod: any = null;
		if (registry && registry.has('pinia')) {
			piniaMod = registry.get('pinia');
		}
		if (!piniaMod && typeof req === 'function') {
			try {
				piniaMod = req('pinia');
			} catch {}
		}
		if (!piniaMod) return;
		const resolved = (piniaMod && (piniaMod.default ?? piniaMod)) || null;
		const createPinia = resolved?.createPinia;
		const setActivePinia = resolved?.setActivePinia;
		if (typeof createPinia !== 'function') return;
		// Reuse across HMR cycles
		const pinia = (g.__NS_HMR_PINIA__ ||= createPinia());
		try {
			app.use(pinia);
		} catch {}
		try {
			if (typeof setActivePinia === 'function') setActivePinia(pinia);
		} catch {}
	} catch {}
}

// Prefer nativescript-vue's own bootstrap to set up element registry and built-ins
export function ensureNsVueBootstrap() {
	try {
		const g: any = globalThis;
		if (nsVueInitDone) return;
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		const req: any = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
		if (typeof req !== 'function') return;
		// Try full init, which should register core elements and built-in components
		try {
			const nv = req('nativescript-vue/dist/nativescript');
			const init = (nv && (nv.init || nv.default?.init)) || undefined;
			if (typeof init === 'function') {
				init();
				nsVueInitDone = true;
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] nativescript-vue init() executed');
				return;
			}
		} catch {}
		// Fallback: register core elements only
		try {
			const elems = req('nativescript-vue/dist/nativescript/elements');
			const fn = (elems && (elems.registerCoreElements || elems.default?.registerCoreElements)) || undefined;
			if (typeof fn === 'function') {
				fn();
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] registerCoreElements executed');
			}
		} catch {}
	} catch {}
}

// Install built-in components from nativescript-vue onto the given app (idempotent)
function installBuiltInComponentsOnApp(app: any) {
	try {
		if (!app || typeof app.component !== 'function') return;
		const g: any = globalThis as any;
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		const req: any = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
		if (typeof req !== 'function') return;
		const comps = (() => {
			try {
				return req('nativescript-vue/dist/components');
			} catch {
				return null;
			}
		})();
		const built = comps && (comps.BUILT_IN_COMPONENTS || comps.default?.BUILT_IN_COMPONENTS);
		if (!built || typeof built !== 'object') return;
		const ctx = (app as any)._context;
		const registered = new Set<string>(Object.keys((ctx && ctx.components) || {}));
		for (const [name, def] of Object.entries(built)) {
			try {
				if (!registered.has(name)) {
					app.component(name, def as any);
					registered.add(name);
				}
			} catch {}
		}
		if (__NS_ENV_VERBOSE__) {
			console.log('[hmr-client] installed built-in components:', Array.from(registered).join(','));
		}
	} catch {}
}

// Ensure the Pinia instance is also active in the HTTP ESM module world and that we provide
// the exact piniaSymbol exported by that module, so getActivePinia() and inject() both succeed
// regardless of which module copy a component imports.
async function syncPiniaAcrossEsm(app: any) {
	try {
		const g: any = globalThis as any;
		const piniaInst = g.__NS_HMR_PINIA__ || app?._context?.provides?.pinia;
		if (!piniaInst) return;
		// Resolve Pinia from ESM world and set active
		let esmUrl: string | null = null;
		try {
			esmUrl = await requestModuleFromServer('pinia');
		} catch {}
		if (esmUrl) {
			try {
				const mod: any = await safeDynImport(esmUrl);
				const resolved = (mod && (mod.default ?? mod)) || mod;
				const setActivePinia = resolved?.setActivePinia || mod?.setActivePinia;
				const piniaSymbol = resolved?.piniaSymbol || mod?.piniaSymbol;
				if (typeof setActivePinia === 'function') {
					try {
						setActivePinia(piniaInst);
					} catch {}
				}
				if (piniaSymbol && app?._context?.provides && !app._context.provides[piniaSymbol]) {
					try {
						app._context.provides[piniaSymbol] = piniaInst;
					} catch {}
					try {
						g.__NS_PINIA_SYMBOL__ = piniaSymbol;
					} catch {}
				}
			} catch (e) {
				if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] syncPiniaAcrossEsm failed import', e);
			}
		}
	} catch {}
}

function bridgePiniaProvides(app: any, existingApp?: any) {
	try {
		const g: any = globalThis as any;
		if (!app || !(app as any)._context) return;
		const newProv = (app as any)._context.provides || ((app as any)._context.provides = {});
		// Determine pinia instance to bind
		let piniaInst: any = g.__NS_HMR_PINIA__;
		if (!piniaInst) piniaInst = newProv['pinia'];
		if (!piniaInst && existingApp) piniaInst = (existingApp as any)?._context?.provides?.['pinia'];
		if (!piniaInst && existingApp) {
			const syms = Object.getOwnPropertySymbols((existingApp as any)?._context?.provides || {});
			for (const s of syms) {
				if (/pinia/i.test((s as any).description || '')) {
					piniaInst = (existingApp as any)._context.provides[s];
					break;
				}
			}
		}
		if (!piniaInst) return;

		// Collect candidate symbols to bind
		const candidates: symbol[] = [];
		try {
			const known = g.__NS_PINIA_SYMBOL__;
			if (known && typeof known === 'symbol') candidates.push(known);
		} catch {}
		try {
			const vendorReg: Map<string, any> | undefined = g.__nsVendorRegistry;
			const req: any = vendorReg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
			let vmod: any = null;
			if (vendorReg && vendorReg.has('pinia')) vmod = vendorReg.get('pinia');
			else if (typeof req === 'function') {
				try {
					vmod = req('pinia');
				} catch {}
			}
			const resolved = (vmod && (vmod.default ?? vmod)) || vmod;
			const vendorSym = resolved?.piniaSymbol || vmod?.piniaSymbol;
			if (vendorSym && typeof vendorSym === 'symbol') candidates.push(vendorSym);
			// Also set active pinia on vendor module if possible
			const setActivePinia = resolved?.setActivePinia || vmod?.setActivePinia;
			if (typeof setActivePinia === 'function') {
				try {
					setActivePinia(piniaInst);
				} catch {}
			}
		} catch {}
		try {
			const oldProv = (existingApp as any)?._context?.provides || {};
			const oldSyms = Object.getOwnPropertySymbols(oldProv || {});
			for (const s of oldSyms) {
				if (/pinia/i.test((s as any).description || '')) candidates.push(s);
			}
		} catch {}

		// De-duplicate symbols
		const uniq: symbol[] = [];
		for (const s of candidates) {
			if (typeof s === 'symbol' && !uniq.includes(s)) uniq.push(s);
		}
		// Bind all symbols to the same instance
		for (const s of uniq) {
			try {
				newProv[s] = piniaInst;
			} catch {}
		}
		// Also ensure string key for any code that looks up string provides
		try {
			if (!newProv['pinia']) newProv['pinia'] = piniaInst;
		} catch {}
		try {
			g.__NS_PINIA_SYMBOL__ ||= uniq[0] || undefined;
		} catch {}

		if (__NS_ENV_VERBOSE__) {
			try {
				const syms = Object.getOwnPropertySymbols(newProv).map((s: any) => (s as any).description || String(s));
				console.log('[hmr-client] bridged pinia provides', {
					stringKey: !!newProv['pinia'],
					symbols: syms,
				});
			} catch {}
		}
	} catch {}
}

export function handleVueSfcRegistry(msg: any) {
	try {
		const entries = msg.entries || [];
		// Mapping-only: record presence for quick readiness checks (no disk writes in HTTP mode)
		for (const e of entries) {
			addSfcMapping(e.path, e.fileName);
		}
		if (__NS_ENV_VERBOSE__) console.log('[hmr][sfc-registry] entries=', entries.length, 'map size', sfcArtifactMap.size);
	} catch (e) {
		console.warn('[hmr-client][sfc-registry] install failed', e);
	}
}

export async function handleVueSfcRegistryUpdate(msg: any, graphVersion: number) {
	try {
		if (typeof msg.path === 'string' && /\.vue$/i.test(msg.path)) {
			// Gate updates: only remount if this path is actually marked as changed in the current delta
			try {
				const base = String(msg.path).split('?')[0];
				const inChanged = sfcChangedIds.has(base) || sfcChangedIds.has(msg.path);
				const versionsMatch = sfcChangedVersion != null && sfcChangedVersion === graphVersion;
				if (!inChanged || !versionsMatch) {
					// Be resilient to out-of-order delivery: treat the registry update itself
					// as authoritative signal that this SFC changed for the announced version.
					// This unblocks remounts when the delta was dropped or applied earlier than we recorded.
					try {
						const effectiveVersion = typeof msg.version === 'number' ? msg.version : graphVersion;
						sfcChangedVersion = effectiveVersion;
						sfcChangedIds.add(base);
						if (__NS_ENV_VERBOSE__) console.log('[hmr][sfc-registry-update] accepting as change (out-of-order)', { path: msg.path, graphVersion, sfcChangedVersion });
					} catch {}
				}
			} catch {}
			try {
				ensureVueGlobals();
				const changedPath = String(msg.path);
				// Prefer remounting the SFC that actually changed so you immediately see it
				// (e.g., editing Details.vue should remount Details.vue even if Home.vue is currently displayed).
				// This keeps existing behavior intact when the changed file is already the root.
				const targetPath = changedPath;
				const comp = await loadSfcComponent(targetPath, 'sfc_update');
				return comp;
			} catch (e) {
				console.warn('[hmr-client] update path failed for', msg.path, e);
			}
		}
		return;
	} catch (e) {
		console.warn('[hmr-client][sfc-registry] update failed', e);
	}
}

export function recordVuePayloadChanges(changed: any[], graphVersion: number) {
	// Record .vue changes seen in this delta
	let sawVue = false;
	for (const m of changed) {
		if (m && typeof m.id === 'string' && /\.vue$/i.test(m.id)) {
			sfcChangedIds.add(m.id);
			sawVue = true;
		}
	}
	if (sawVue) sfcChangedVersion = graphVersion;
}

async function waitForSfcMapping(id: string, timeoutMs = 350): Promise<boolean> {
	if (!/\.vue$/i.test(id)) return true;
	const base = id.split('?')[0];
	const srcIdx = base.indexOf(APP_VIRTUAL_WITH_SLASH);
	const rel = srcIdx !== -1 ? base.slice(srcIdx) : base;
	if (sfcArtifactMap.has(rel) || sfcArtifactMap.has(base)) return true;
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		await new Promise((r) => setTimeout(r, 30));
		if (sfcArtifactMap.has(rel) || sfcArtifactMap.has(base)) return true;
	}
	return false;
}

// Map a graph id (possibly a .vue source path) to actual import spec
export function addSfcMapping(originalPath: string, fileName: string) {
	try {
		if (!originalPath || !fileName) return;
		const base = originalPath.split('?')[0];
		const norm = normalizeSpec(base);
		// Also derive a relative variant if under app root to handle lookups that slice to that portion
		let rel = norm;
		const srcIdx = norm.indexOf(APP_VIRTUAL_WITH_SLASH);
		if (srcIdx !== -1) rel = norm.slice(srcIdx);
		sfcArtifactMap.set(norm, fileName);
		if (rel !== norm) sfcArtifactMap.set(rel, fileName);
	} catch {}
}

// Build explicit SFC variant URL (script/template). Always preserves the variant query.
function resolveSfcVariantSpec(id: string, type: 'script' | 'template', cacheBustTag?: string): string {
	const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
	const base = id.split('?')[0];
	if (!origin) return base + `?vue&type=${type}`;
	const safePath = base.startsWith('/') ? base : '/' + base;
	const ver = typeof getGraphVersion() === 'number' && getGraphVersion() > 0 ? String(getGraphVersion()) : '0';
	let url = origin + `/ns/sfc/${ver}` + safePath + `?vue&type=${type}`;
	return url;
}

// Resolve deterministic SFC assembler ESM module
function resolveSfcAssemblerSpec(id: string, cacheBustTag?: string): string {
	const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
	const base = id.split('?')[0];
	if (!origin) return base; // fallback: device will likely fail; origin should be available in dev
	const safePath = base.startsWith('/') ? base : '/' + base;
	const ver = typeof getGraphVersion() === 'number' && getGraphVersion() > 0 ? String(getGraphVersion()) : '0';
	let url = origin + `/ns/asm/${ver}` + `?path=${encodeURIComponent(safePath)}`;
	try {
		if ((globalThis as any).__NS_HMR_ASM_DIAG__) {
			url += '&diag=1';
		}
	} catch {}
	return url;
}

// Resolve metadata endpoint for an SFC
function resolveSfcMetaSpec(id: string, cacheBustTag?: string): string {
	const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
	const base = id.split('?')[0];
	if (!origin) return base;
	const safePath = base.startsWith('/') ? base : '/' + base;
	const ver = typeof getGraphVersion() === 'number' && getGraphVersion() > 0 ? String(getGraphVersion()) : '0';
	let url = origin + `/ns/sfc-meta/${ver}` + `?path=${encodeURIComponent(safePath)}`;
	return url;
}

type SfcMeta = {
	path: string;
	hasScript: boolean;
	hasTemplate: boolean;
	hasStyle: boolean;
	scriptExports: string[];
	scriptHasDefault: boolean;
	templateHasRender: boolean;
	hmrId: string;
};

async function fetchSfcMeta(id: string, tag: string): Promise<SfcMeta | null> {
	try {
		const url = resolveSfcMetaSpec(id, tag + '_meta');
		const res = await fetch(url, { method: 'GET' as any });
		if (!res.ok) return null;
		const json = await res.json();
		return json as SfcMeta;
	} catch {
		return null;
	}
}

// Safely load a component for a .vue SFC. Prefer deterministic assembler first to avoid
// any variant-compile or TDZ flakiness; only fall back to variant assembly if needed.
export async function loadSfcComponent(targetVuePath: string, tag: string): Promise<any | null> {
	// Minimal mode removed: always go through deterministic assembler + device reset
	// Ensure Vue globals exist BEFORE evaluating variant modules; their top-level aliasing reads globalThis.* once.
	ensureVueGlobals();
	// Consult metadata to choose optimal path
	let meta: SfcMeta | null = null;
	try {
		meta = await fetchSfcMeta(targetVuePath, tag);
	} catch {}
	if (__NS_ENV_VERBOSE__ && meta) {
		try {
			console.log('[hmr][vue-reset][meta]', targetVuePath, meta);
		} catch {}
	}
	// Prefer deterministic assembler first so AST normalization (including nav helpers) always applies.
	try {
		if (!DISABLE_ASM) {
			const asmMod = await safeDynImport(resolveSfcAssemblerSpec(targetVuePath, tag + '_asm_first'));
			const asmComp = (asmMod as any)?.default ?? (asmMod as any);
			if (asmComp && typeof asmComp === 'object') {
				if (__NS_ENV_VERBOSE__) console.log('[hmr][vue-reset][diag] using assembler-first component');
				return asmComp;
			}
		}
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][diag] assembler-first failed; trying variants', e);
	}
	// 1) Variant assembly (script then template) – closest to browser behavior
	try {
		// Import script variant FIRST to avoid TDZ due to cyclic evaluation between script/template.
		const scriptMod = await safeDynImport(resolveSfcVariantSpec(targetVuePath, 'script', tag + '_script'));
		// Ensure script default is readable before importing the template; this enforces a stable order.
		const base: any = await safeReadDefault(scriptMod as any);
		// Now import the template render implementation
		const templateMod = await safeDynImport(resolveSfcVariantSpec(targetVuePath, 'template', tag + '_template'));
		if (__NS_ENV_VERBOSE__) {
			try {
				const sKeys = scriptMod ? Object.keys(scriptMod).join(',') : '<none>';
				const tKeys = templateMod ? Object.keys(templateMod).join(',') : '<none>';
				console.log('[hmr][vue-reset][diag] variant-imports', targetVuePath, 'script.keys=', sKeys, 'template.keys=', tKeys);
				try {
					console.log('[hmr][vue-reset][diag] scriptMod:', scriptMod);
				} catch {}
				try {
					console.log('[hmr][vue-reset][diag] templateMod:', {
						render: typeof templateMod?.render,
					});
				} catch {}
			} catch {}
		}
		// Only use variant assembly when the script provides a real component options object.
		const render = (templateMod as any)?.render;
		const scriptExports = (scriptMod as any) || {};
		const exportKeys = Object.keys(scriptExports).filter((k) => k !== 'default' && k !== '__esModule');
		if (base && typeof base === 'object') {
			// If variant template didn't produce a render, try assembler as a targeted fallback.
			if (!render) {
				try {
					if (__NS_ENV_VERBOSE__) console.log('[hmr][vue-reset][diag] no render from template variant; attempting assembler for', targetVuePath);
					const asmMod = await safeDynImport(resolveSfcAssemblerSpec(targetVuePath, tag + '_asm_norender'));
					const asmComp = (asmMod as any)?.default ?? (asmMod as any);
					if (asmComp && typeof asmComp === 'object' && typeof (asmComp as any).render === 'function') {
						try {
							(base as any).render = (asmComp as any).render;
						} catch {}
					}
				} catch (e) {
					if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][diag] assembler no-render fallback failed', e);
				}
			} else {
				try {
					(base as any).render = render;
				} catch {}
			}
			// Merge named exports (likely locally-declared components) into the component's components map
			if (exportKeys.length) {
				try {
					(base as any).components = (base as any).components || {};
					for (const k of exportKeys) {
						try {
							(base as any).components[k] = scriptExports[k];
						} catch {}
					}
				} catch {}
			}
			if (__NS_ENV_VERBOSE__) {
				try {
					console.log('[hmr][vue-reset][diag] assembled.component (from script default) keys=', Object.keys(base).join(','), 'has.render=', !!(base as any).render, 'components=', Object.keys((base as any).components || {}).join(','));
				} catch {}
			}
			return base;
		}
		// If script default is absent (common with <script setup> or named exports), but we have a template render,
		// prefer loading the full SFC first if the script provided no named exports — the full SFC may contain
		// compiled metadata (local components, hoisted helpers) that variant assembly can't reconstruct.
		if (!base && typeof render === 'function') {
			if (!exportKeys.length) {
				if (__NS_ENV_VERBOSE__) console.log('[hmr][vue-reset][diag] no script exports detected; attempting assembler import for', targetVuePath);
				try {
					const asm = await safeDynImport(resolveSfcAssemblerSpec(targetVuePath, tag + '_asm'));
					const compAsm = (asm as any)?.default ?? (asm as any);
					if (compAsm && typeof compAsm === 'object') {
						if (__NS_ENV_VERBOSE__) console.log('[hmr][vue-reset][diag] assembler import succeeded and will be used');
						return compAsm;
					}
				} catch (e) {
					if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][diag] assembler import failed, will synthesize as fallback', e);
				}
			}

			// Synthesize a minimal component and attach named exports as local components so template resolveComponent works.
			try {
				ensureVueGlobals();
				const comp = (globalThis as any).defineComponent
					? (globalThis as any).defineComponent({
							name: targetVuePath.split('/').pop() || 'AnonymousSFC',
							render,
						})
					: ({
							name: targetVuePath.split('/').pop() || 'AnonymousSFC',
							render,
						} as any);
				if (exportKeys.length) {
					try {
						(comp as any).components = (comp as any).components || {};
						for (const k of exportKeys) {
							try {
								(comp as any).components[k] = scriptExports[k];
							} catch {}
						}
					} catch {}
				}
				if (__NS_ENV_VERBOSE__) {
					try {
						console.log('[hmr][vue-reset][diag] synthesized.component keys=', Object.keys(comp).join(','), 'components=', Object.keys((comp as any).components || {}).join(','));
					} catch {}
				}
				return comp;
			} catch (e) {
				if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][diag] synthesize component failed', e);
			}
		}
		// Otherwise fall through to full SFC import.
	} catch (e2) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][variant-import] failed; will try full SFC', targetVuePath, e2);
	}
	// 2) Final fallback: assembler import (after a short delay to let dependents settle)
	try {
		if (DISABLE_ASM) throw new Error('asm disabled by __NS_HMR_DISABLE_ASM__');
		await new Promise<void>((r) => setTimeout(r, 10));
		const mod = await safeDynImport(resolveSfcAssemblerSpec(targetVuePath, tag + '_asm_final'));
		try {
			const comp = await safeReadDefault(mod as any);
			if (comp) return comp;
		} catch (err) {
			if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][asm-import-default-read] error', targetVuePath, err);
		}
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr][vue-reset][asm-import] failed', targetVuePath, e);
	}
	// Final soft fallback: return a minimal placeholder so rerender can proceed and surface UI
	return null;
}

export function getRootForVue(
	newComponent: any,
	state: {
		getRootKind: () => 'page' | 'frame';
		setRootKind: (k: 'page' | 'frame') => void;
		getCachedRoot: () => any;
		setCachedRoot: (r: any) => void;
	},
): any {
	const t0 = Date.now();
	if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] begin');
	ensureVueGlobals();
	const g = globalThis as any;
	const AppFactory = g.createApp;
	let RootCtor = g.NSVRoot as any;
	// Hygiene: unmount any existing app instance to avoid duplicate lifecycle hooks
	try {
		const existing = (getCurrentApp() || g.__NS_VUE_APP__) as any;
		if (existing && typeof existing.unmount === 'function') {
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] unmounting existing app before remount');
			try {
				existing.unmount();
			} catch {}
		}
	} catch {}
	try {
		if (!RootCtor) {
			const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
			const req: any = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
			let domMod: any = null;
			if (registry && registry.has('nativescript-vue/dist/dom')) {
				domMod = registry.get('nativescript-vue/dist/dom');
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] NS DOM from vendor registry');
			} else if (typeof req === 'function') {
				try {
					domMod = req('nativescript-vue/dist/dom');
					if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] NS DOM via require');
				} catch (e) {
					if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] NS DOM require failed', e);
				}
			}
			if (domMod) {
				const nsDom = (domMod && (domMod.default ?? domMod)) || domMod;
				const ctor = nsDom?.NSVRoot || (nsDom?.default && nsDom.default.NSVRoot) || domMod?.NSVRoot;
				if (ctor) RootCtor = ctor;
			}
		}
	} catch {}
	const existingApp = getCurrentApp() || g.__NS_VUE_APP__;
	try {
		ensureNsVueBootstrap();
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] ensured NS-Vue bootstrap');
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] ensureNsVueBootstrap failed', e);
	}
	try {
		if (typeof g.start === 'function' && !nsStartDone) {
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] invoking global start()');
			g.start();
			nsStartDone = true;
		}
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] start() failed', e);
	}
	if (!RootCtor) throw new Error('NSVRoot constructor unavailable during HMR remount');
	let app: any;
	try {
		const mk = (globalThis as any).__NS_HMR_CREATE_APP__;
		if (typeof mk === 'function') {
			app = mk(newComponent);
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] app created via custom factory');
		}
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] custom app factory failed', e);
	}
	if (!app) {
		app = AppFactory(newComponent);
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] app created via createApp');
	}
	try {
		const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
		const req: any = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
		let rh: any = null;
		if (registry && registry.has('nativescript-vue/dist/runtimeHelpers')) rh = registry.get('nativescript-vue/dist/runtimeHelpers');
		if (!rh && typeof req === 'function') {
			try {
				rh = req('nativescript-vue/dist/runtimeHelpers');
			} catch {}
		}
		const setRootApp = rh && (rh.setRootApp || rh.default?.setRootApp);
		if (typeof setRootApp === 'function') {
			setRootApp(app);
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] runtimeHelpers.setRootApp applied');
		}
		try {
			let nv: any = null;
			if (registry && registry.has('nativescript-vue')) nv = registry.get('nativescript-vue');
			if (!nv && typeof req === 'function') {
				try {
					nv = req('nativescript-vue');
				} catch {}
			}
			const setRootApp2 = nv && (nv.setRootApp || nv.default?.setRootApp);
			if (typeof setRootApp2 === 'function') {
				setRootApp2(app);
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] nativescript-vue.setRootApp applied');
			}
		} catch {}
	} catch {}
	try {
		const hook = (globalThis as any).__NS_HMR_INSTALL_PLUGINS__;
		if (typeof hook === 'function') {
			hook(app);
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] plugins installed');
		}
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] plugin install failed', e);
	}
	try {
		ensurePiniaOnApp(app);
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] Pinia ensured on app');
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] ensurePiniaOnApp failed', e);
	}
	try {
		(async () => {
			try {
				await syncPiniaAcrossEsm(app);
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] Pinia state sync requested');
			} catch (e) {
				if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] syncPiniaAcrossEsm failed', e);
			}
		})();
	} catch {}
	try {
		bridgePiniaProvides(app, existingApp);
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] provides bridged from previous app');
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] bridgePiniaProvides failed', e);
	}
	try {
		installBuiltInComponentsOnApp(app);
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] built-in components installed');
	} catch (e) {
		if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] installBuiltInComponentsOnApp failed', e);
	}
	const root = new RootCtor();
	const vm = typeof (app as any).runWithContext === 'function' ? (app as any).runWithContext(() => (app as any).mount(root) as any) : ((app as any).mount(root) as any);
	setCurrentApp(app);
	if (__NS_ENV_VERBOSE__) {
		try {
			console.log('[hmr-client] [createRoot] mount result', {
				hasEl: !!vm?.$el,
				elType: vm?.$el?.constructor?.name,
				hasNativeView: !!vm?.$el?.nativeView,
				nativeViewType: vm?.$el?.nativeView?.constructor?.name,
				elapsedMs: Date.now() - t0,
			});
		} catch {}
	}
	const findNativeView = (element: any): any => {
		if (element?.nativeView) return element.nativeView;
		const children = element?.childNodes || element?.children || [];
		for (const child of children) {
			const res = findNativeView(child);
			if (res) return res;
		}
		return null;
	};
	const findFrameNativeView = (element: any): any => {
		if (!element) return null;
		const nv = (element as any).nativeView;
		if (nv) {
			const ctorName = String(nv?.constructor?.name || '').replace(/^_+/, '');
			if (ctorName === 'Frame' || /^Frame(\$\d+)?$/.test(ctorName)) return nv;
		}
		const kids = (element as any)?.childNodes || (element as any)?.children || [];
		for (const k of kids) {
			const res = findFrameNativeView(k);
			if (res) return res;
		}
		return null;
	};
	const findPageNativeView = (element: any): any => {
		if (!element) return null;
		const nv = (element as any).nativeView;
		if (nv) {
			const ctorName = String(nv?.constructor?.name || '').replace(/^_+/, '');
			if (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName)) return nv;
		}
		const kids = (element as any)?.childNodes || (element as any)?.children || [];
		for (const k of kids) {
			const res = findPageNativeView(k);
			if (res) return res;
		}
		return null;
	};
	// Prefer adopting a Frame if the component produced one. This avoids nesting a Frame inside
	// the placeholder Frame and ensures a single authoritative Frame for app navigation.
	const nativeView = findFrameNativeView(vm?.$el) || findPageNativeView(vm?.$el) || findNativeView(vm?.$el);
	const GPage: any = getCore('Page');
	// Decide root type and cache it
	if (nativeView) {
		const ctorName = String(nativeView?.constructor?.name || '').replace(/^_+/, '');
		if (__NS_ENV_VERBOSE__)
			console.log('[hmr-client] [createRoot] nativeView found', {
				ctorName,
			});
		// Treat Frame as authoritative root regardless of whether it already has a currentPage.
		// This avoids producing a Frame inside a wrapper Page which can lead to blank content in complex apps.
		if (ctorName === 'Frame' || /^Frame(\$\d+)?$/.test(ctorName)) {
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] root kind=frame (adopting component Frame)');
			state.setRootKind('frame');
			state.setCachedRoot(nativeView);
			return state.getCachedRoot();
		}
		if (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName)) {
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] root kind=page');
			state.setRootKind('page');
			state.setCachedRoot(nativeView);
			return state.getCachedRoot();
		}
		// Treat Frame$N as Frame as well
		if (ctorName === 'Frame_OLD_NEVER_REACHED') {
			// If a Frame is produced, prefer adopting the Frame as the new root to ensure a single authoritative Frame.
			// Extracting the Page and navigating a placeholder Frame can split realms and break app-controlled navigation.
			let pageCandidate: any = undefined;
			try {
				pageCandidate = (nativeView as any).currentPage || (nativeView as any)._currentEntry?.resolvedPage;
			} catch {}
			if (pageCandidate) {
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] Frame root with currentPage detected; adopting Frame as root');
				state.setRootKind('frame');
				state.setCachedRoot(nativeView);
				return state.getCachedRoot();
			}
			// No currentPage yet; construct a Page wrapper and mount the component inside it
			try {
				if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] no currentPage; creating Page wrapper for navigation-first');
				const registry: Map<string, any> | undefined = (globalThis as any).__nsVendorRegistry;
				const req: any = registry?.get ? (globalThis as any).__nsVendorRequire || (globalThis as any).__nsRequire || (globalThis as any).require : (globalThis as any).__nsRequire || (globalThis as any).require;
				let vueMod: any = null;
				if (registry && registry.has('vue')) vueMod = registry.get('vue');
				if (!vueMod && typeof req === 'function') {
					try {
						vueMod = req('vue');
					} catch {}
				}
				const h = vueMod?.h;
				const WrappedRoot = h
					? {
							name: 'HMRPageWrapper',
							setup() {
								return () => h('Page', null, [h(newComponent as any)]);
							},
						}
					: null;
				if (WrappedRoot) {
					const g = globalThis as any;
					const AppFactory = g.createApp;
					let app2: any = AppFactory(WrappedRoot);
					try {
						const reg2: Map<string, any> | undefined = g.__nsVendorRegistry;
						const req2: any = reg2?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
						let rh2: any = null;
						if (reg2 && reg2.has('nativescript-vue/dist/runtimeHelpers')) rh2 = reg2.get('nativescript-vue/dist/runtimeHelpers');
						if (!rh2 && typeof req2 === 'function') {
							try {
								rh2 = req2('nativescript-vue/dist/runtimeHelpers');
							} catch {}
						}
						const setRootApp2a = rh2 && (rh2.setRootApp || rh2.default?.setRootApp);
						if (typeof setRootApp2a === 'function') setRootApp2a(app2);
						try {
							let nv2: any = null;
							if (reg2 && reg2.has('nativescript-vue')) nv2 = reg2.get('nativescript-vue');
							if (!nv2 && typeof req2 === 'function') {
								try {
									nv2 = req2('nativescript-vue');
								} catch {}
							}
							const setRootApp2b = nv2 && (nv2.setRootApp || nv2.default?.setRootApp);
							if (typeof setRootApp2b === 'function') setRootApp2b(app2);
						} catch {}
					} catch {}
					try {
						const hook = globalThis.__NS_HMR_INSTALL_PLUGINS__;
						if (typeof hook === 'function') hook(app2);
					} catch {}
					try {
						ensurePiniaOnApp(app2);
					} catch {}
					try {
						bridgePiniaProvides(app2, getCurrentApp() || globalThis.__NS_VUE_APP__);
					} catch {}
					try {
						installBuiltInComponentsOnApp(app2);
					} catch {}
					const RootCtor2 = (globalThis as any).NSVRoot || RootCtor;
					const root2 = new RootCtor2();
					const vm2 = typeof (app2 as any).runWithContext === 'function' ? (app2 as any).runWithContext(() => (app2 as any).mount(root2) as any) : ((app2 as any).mount(root2) as any);
					setCurrentApp(app2);
					const findNativeView2 = (element: any): any => {
						if (element?.nativeView) return element.nativeView;
						const kids = element?.childNodes || element?.children || [];
						for (const c of kids) {
							const r = findNativeView2(c);
							if (r) return r;
						}
						return null;
					};
					const findPageNativeView2 = (element: any): any => {
						if (!element) return null;
						const nv = (element as any).nativeView;
						if (nv) {
							const ctorName = String(nv?.constructor?.name || '').replace(/^_+/, '');
							if (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName)) return nv;
						}
						const kids = (element as any)?.childNodes || (element as any)?.children || [];
						for (const k of kids) {
							const r = findPageNativeView2(k);
							if (r) return r;
						}
						return null;
					};
					const nv2 = findPageNativeView2(vm2?.$el) || findNativeView2(vm2?.$el);
					const ctor2 = String(nv2?.constructor?.name || '').replace(/^_+/, '');
					if (ctor2 === 'Page' || /^Page(\$\d+)?$/.test(ctor2)) {
						// Hide wrapper ActionBar to avoid double bars when a Frame is nested inside
						try {
							(nv2 as any).actionBarHidden = true;
						} catch {}
						if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] Page wrapper created successfully');
						state.setRootKind('page');
						state.setCachedRoot(nv2);
						return state.getCachedRoot();
					}
					if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] Page wrapper did not yield Page; got', ctor2);
				}
			} catch (e) {
				if (__NS_ENV_VERBOSE__) console.warn('[hmr-client] [createRoot] Page wrapper attempt failed', e);
			}
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] root kind=frame (no currentPage)');
			state.setRootKind('frame');
			state.setCachedRoot(nativeView);
			return state.getCachedRoot();
		}
		if (GPage) {
			const page = new GPage();
			(page as any).content = nativeView;
			// If we're wrapping a view inside a Page purely to drive navigation,
			// hide the default ActionBar to avoid duplicate bars.
			try {
				(page as any).actionBarHidden = true;
			} catch {}
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] wrapped nativeView in Page (root kind=page)');
			state.setRootKind('page');
			state.setCachedRoot(page);
			return state.getCachedRoot();
		}
	}
	// fallback page
	if (GPage) {
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] [createRoot] fallback empty Page');
		state.setRootKind('page');
		state.setCachedRoot(new GPage());
		return state.getCachedRoot();
	}
	state.setRootKind('page');
	state.setCachedRoot({} as any);
	return state.getCachedRoot();
}
/** Install a robust $navigateBack wrapper once that falls back to remounting the
 * original root component if there's no usable Frame history. This keeps dev UX
 * predictable when testing deep links or isolated component mounts.
 */
export function ensureBackWrapperInstalled(performResetRoot: (comp: any) => void, getCore: (name: string) => any) {
	try {
		const g: any = globalThis as any;
		// Provide global back-remount hooks for bridges to call
		if (!g.__nsAttemptBackRemount) {
			g.__nsAttemptBackRemount = () => {
				try {
					const orig = g.__NS_HMR_ORIG_ROOT_COMPONENT__ || ORIG_ROOT_COMPONENT;
					if (orig) {
						performResetRoot(orig);
						return true;
					}
				} catch {}
				return false;
			};
		}
		if (!g.__NS_HMR_ON_NAVIGATE_BACK) {
			g.__NS_HMR_ON_NAVIGATE_BACK = () => {
				try {
					g.__nsAttemptBackRemount && g.__nsAttemptBackRemount();
				} catch {}
			};
		}
		if (g.__NS_HMR_BACK_WRAPPED__) return;
		const originalBack = g.$navigateBack;
		// Mark wrapped before assigning to avoid re-entrancy races
		g.__NS_HMR_BACK_WRAPPED__ = true;
		g.$navigateBack = (...args: any[]) => {
			try {
				const F = getCore('Frame');
				const top = F?.topmost?.();
				if (top && (top as any).canGoBack?.()) {
					if (typeof originalBack === 'function') return (originalBack as any)(...args);
					// If originalBack is not a function, try Frame fallback
					try {
						return (top as any).goBack?.();
					} catch {}
					return;
				}
			} catch (e) {
				// fall through to fallback
			}
			// Fallback: reset to original root component if available
			const orig = g.__NS_HMR_ORIG_ROOT_COMPONENT__ || ORIG_ROOT_COMPONENT;
			if (orig) {
				try {
					// Reuse the proven remount pipeline for consistency
					performResetRoot(orig);
					return;
				} catch (e) {
					console.warn('[hmr-client] Fallback back nav failed:', e);
				}
			}
			console.warn('[hmr-client] No usable Frame and no original root component available; cannot navigate back.');
		};
	} catch {}
}
async function requestModuleFromServer(name: string): Promise<string | null> {
	try {
		// Derive the dev-server origin (mirrors other resolver helpers in this file)
		const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
		if (!origin) return null;

		// Candidate URL patterns that a Vite-like server might expose for resolving modules to importable URLs.
		const candidates = [
			// Vite serves bare imports under /@modules/<name>
			`${origin.replace(/\/$/, '')}/@modules/${encodeURIComponent(name)}`,
			// Some setups use @id for resolved module ids
			`${origin.replace(/\/$/, '')}/@id/${encodeURIComponent(name)}`,
			// Custom-ish endpoint pattern used elsewhere in this project style
			`${origin.replace(/\/$/, '')}/ns/esmmod?name=${encodeURIComponent(name)}`,
		];

		// Probe each candidate with a lightweight HEAD request first; if allowed, return the candidate URL.
		for (const url of candidates) {
			try {
				const res = await fetch(url, { method: 'HEAD' as any });
				if (res && (res.ok || res.status === 200)) return url;
			} catch {
				// ignore and try next
			}
		}

		// As a final attempt, try GET on the first candidate and return if we get a module-like response.
		try {
			const url = candidates[0];
			const res = await fetch(url, { method: 'GET' as any });
			if (res && res.ok) return url;
		} catch {}

		return null;
	} catch {
		return null;
	}
}
