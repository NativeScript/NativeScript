import type { FrameworkClientBatchContext, FrameworkClientStrategy } from '../../../client/framework-client-strategy.js';
import { ENV_VERBOSE as VERBOSE, deriveHttpOrigin, getCore, getHMRWsUrl, getHttpOriginForVite, normalizeSpec } from '../../../client/utils.js';
import { getGlobalScope } from '../../../shared/runtime/global-scope.js';

// Define substitution does not reach this raw-served file; prefer the
// globalThis seed from the entry's defines-seed module ('app/'-rooted
// projects would otherwise get the wrong '/src' default).
const APP_ROOT_VIRTUAL = (typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__) || (typeof getGlobalScope().__NS_APP_ROOT_VIRTUAL__ === 'string' && getGlobalScope().__NS_APP_ROOT_VIRTUAL__) || '/src';
const APP_VIRTUAL_WITH_SLASH = APP_ROOT_VIRTUAL.endsWith('/') ? APP_ROOT_VIRTUAL : `${APP_ROOT_VIRTUAL}/`;

/**
 * Map a served/graph module id (e.g. `/app/modal-page.xml`) to its app-root
 * relative path (`modal-page.xml`). Single mapping point — the raw-asset
 * re-registration, page-navigation targets, and modal matching all derive
 * from this; keep them in sync by construction.
 */
function toAppRelativePath(id: string): string | null {
	try {
		const spec = normalizeSpec(id);
		const appVirtual = APP_VIRTUAL_WITH_SLASH.replace(/^\//, '');
		let relPath = spec.startsWith('/') ? spec.slice(1) : spec;
		if (relPath.startsWith(appVirtual)) relPath = relPath.slice(appVirtual.length);
		return relPath || null;
	} catch {
		return null;
	}
}

/** App-root relative module name (no extension) for page-shaped files, else null. */
function toAppModuleName(id: string): string | null {
	const relPath = toAppRelativePath(id);
	if (!relPath || !/\.(xml|ts|js)$/i.test(relPath)) return null;
	return relPath.replace(/\.(xml|ts|js)$/i, '');
}

// ── Open-modal tracking for XML-flavor HMR ──────────────────────────────────
// The typescript flavor's queue closes + re-presents a modal whose XML or
// code-behind changed, instead of wrongly navigating the top frame to the
// modal's page (or worse, resetting the root and losing the modal).
//
// Source of truth is core's live modal stack — `_moduleName` (set by the
// Builder on every createViewFromEntry view) and `_modalOptions` (stored by
// newer cores' `_showNativeModalView`). The View.prototype.showModal wrap
// below is a LEGACY FALLBACK for cores that don't store `_modalOptions` yet;
// delete it (and `openModalRecords`) once the minimum supported core does.
type OpenModalRecord = { moduleName: string; options: any; parent: any; modal: any };
const openModalRecords: OpenModalRecord[] = [];
let modalTrackingInstalled = false;

function ensureModalTracking(): void {
	if (modalTrackingInstalled) return;
	try {
		const View: any = getCore('View') || getGlobalScope().View;
		const proto = View?.prototype;
		if (!proto || typeof proto.showModal !== 'function') return;
		const orig = proto.showModal;
		if (orig.__nsHmrModalTracked) {
			modalTrackingInstalled = true;
			return;
		}
		const wrapped = function (this: any, ...args: any[]) {
			const result = orig.apply(this, args);
			try {
				if (typeof args[0] === 'string' && result) {
					// Mirror core's getModalOptions arg shapes: (moduleName, options)
					// or the deprecated positional form.
					const options = args.length === 2 && args[1] && typeof args[1] === 'object' ? args[1] : { context: args[1], closeCallback: args[2], fullscreen: args[3], animated: args[4], stretched: args[5] };
					const moduleName = String(args[0])
						.replace(/^\.\//, '')
						.replace(/\.(xml|ts|js)$/i, '');
					openModalRecords.push({ moduleName, options, parent: this, modal: result });
					if (VERBOSE) console.log('[hmr][modal] tracked open modal', moduleName);
				}
			} catch {}
			return result;
		};
		(wrapped as any).__nsHmrModalTracked = true;
		proto.showModal = wrapped;
		modalTrackingInstalled = true;
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][modal] tracking install failed', e);
	}
}

/**
 * Enumerate the modals that are currently presented AND were opened by module
 * name, with everything needed to re-present them.
 *
 * Source of truth is core's live modal stack (`_getRootModalViews()`):
 *   - `modal._moduleName` — set by the Builder on every createViewFromEntry
 *     view (longstanding, used by livesync), so available on any core.
 *   - `modal._modalOptions` — the original ShowModalOptions, stored by core's
 *     `_showNativeModalView` (newer cores). For older cores the showModal
 *     wrap's records (see ensureModalTracking) fill the gap.
 *   - `modal._modalParent` — the presenting view.
 * Stale wrap records are pruned against the live stack while we're here.
 */
function getOpenStringModuleModals(): OpenModalRecord[] {
	const out: OpenModalRecord[] = [];
	try {
		const App: any = getCore('Application');
		const root = App?.getRootView?.() || (App as any)?._rootView;
		const stack: any[] = root?._getRootModalViews?.() || [];
		// Prune wrap records whose modal is gone (keeps the fallback list small).
		for (let i = openModalRecords.length - 1; i >= 0; i--) {
			if (!stack.includes(openModalRecords[i].modal)) {
				openModalRecords.splice(i, 1);
			}
		}
		for (const modal of stack) {
			const record = openModalRecords.find((r) => r.modal === modal);
			const rawModuleName = typeof modal?._moduleName === 'string' && modal._moduleName ? modal._moduleName : record?.moduleName;
			const parent = modal?._modalParent || record?.parent;
			const options = modal?._modalOptions || record?.options;
			if (!rawModuleName || !parent) continue;
			const moduleName = String(rawModuleName)
				.replace(/^\.\//, '')
				.replace(/\.(xml|ts|js)$/i, '');
			out.push({ moduleName, options, parent, modal });
		}
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][modal] open-modal enumeration failed', e);
	}
	return out;
}

/**
 * Close and re-present an open modal so it rebuilds from the freshly
 * re-registered XML/code-behind. Core clears the modal stack synchronously on
 * close but the NATIVE dismissal completes asynchronously; iOS refuses a
 * present while a dismissal is in flight. Newer cores fire `closedModally` on
 * the modal at exactly that completion point — preferred signal. Older cores
 * fall back to polling `isLoaded` (flipped by `_tearDownUI` in the same
 * completion callback).
 */
async function reshowOpenModal(record: OpenModalRecord): Promise<void> {
	const { parent, modal, moduleName, options } = record;
	await new Promise<void>((resolve) => {
		let settled = false;
		const finish = () => {
			if (!settled) {
				settled = true;
				resolve();
			}
		};
		let eventArmed = false;
		try {
			if (typeof modal.once === 'function') {
				modal.once('closedModally', finish);
				eventArmed = true;
			}
		} catch {}
		// Poll fallback (also the safety net if the event never fires —
		// e.g. an interactive-dismiss cancellation).
		const deadline = Date.now() + 2000;
		const poll = () => {
			if (settled) return;
			let stillLoaded = false;
			try {
				stillLoaded = !!modal.isLoaded;
			} catch {}
			if ((!eventArmed && !stillLoaded) || Date.now() > deadline) {
				finish();
				return;
			}
			setTimeout(poll, 50);
		};
		setTimeout(poll, 50);
		try {
			modal.closeModal();
		} catch (e) {
			if (VERBOSE) console.warn('[hmr][modal] close failed for', moduleName, e);
			finish();
		}
	});
	// One settle beat so the platform finishes releasing the presentation
	// before the new present begins.
	await new Promise((resolve) => setTimeout(resolve, 100));
	try {
		parent.showModal(moduleName, { ...(options || {}), animated: false });
		if (VERBOSE) console.log('[hmr][modal] re-presented', moduleName);
	} catch (e) {
		console.warn('[hmr][modal] re-present failed for', moduleName, e);
	}
}

/**
 * Modal-aware UI refresh for the typescript (XML) flavor after a queue drain:
 * re-fetch changed raw assets into the bundled module registry, then either
 * navigate in-place to a changed page, re-present open modals whose files
 * changed, or fall back to a full `resetRootView(app-root)`.
 */
async function applyTypescriptRefresh(drained: string[]): Promise<void> {
	try {
		const g: any = getGlobalScope();
		const App = getCore('Application') || g.Application;
		if (!App || typeof App.resetRootView !== 'function') {
			if (VERBOSE) console.warn('[hmr][queue] TS flavor: Application.resetRootView unavailable; skipping UI refresh');
			return;
		}
		// Re-fetch changed XML/CSS files and update the bundled module registry
		// so Builder.createViewFromEntry picks up fresh content.
		const rawAssetIds = drained.filter((id) => /\.(xml|css|scss|sass|less)$/i.test(id));
		if (rawAssetIds.length && typeof g.registerModule === 'function') {
			const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
			if (origin) {
				for (const id of rawAssetIds) {
					try {
						const spec = normalizeSpec(id);
						// Fetch the raw file content directly from Vite's dev server.
						// Use the project-relative path which Vite serves as static files.
						const fetchUrl = origin + (spec.startsWith('/') ? spec : '/' + spec);
						if (VERBOSE) console.log('[hmr][queue] fetching raw asset', { id, fetchUrl });
						const resp = await fetch(fetchUrl);
						if (resp.ok) {
							const rawContent = await resp.text();
							// Register under all nickname variants the module registry uses.
							// The bundler context registers XML as e.g., './main-page.xml' and 'main-page.xml'
							const relPath = toAppRelativePath(id);
							if (!relPath) continue;
							const nicknames = ['./' + relPath, relPath];
							// Also add without extension for CSS
							const extIdx = relPath.lastIndexOf('.');
							if (extIdx > 0) {
								const baseName = relPath.slice(0, extIdx);
								if (!relPath.endsWith('.xml')) nicknames.push(baseName, './' + baseName);
							}
							for (const name of nicknames) {
								if (VERBOSE) console.log('[hmr][queue] re-registering module', name);
								g.registerModule(name, () => rawContent);
							}
						} else if (VERBOSE) {
							console.warn('[hmr][queue] raw asset fetch failed', id, resp.status);
						}
					} catch (e) {
						if (VERBOSE) console.warn('[hmr][queue] raw asset refresh failed for', id, e);
					}
				}
			}
		}
		// Modal-aware refresh: pages currently PRESENTED AS MODALS must be
		// closed + re-presented in place — navigating the top frame to a
		// modal's page would push it as a frame page, and resetRootView
		// would dismiss the modal entirely. State comes from core's live
		// modal stack (_moduleName/_modalOptions/_modalParent); the
		// showModal wrap only backfills options on older cores.
		ensureModalTracking();
		const openModals = getOpenStringModuleModals();
		const changedModuleNames = new Set(drained.map(toAppModuleName).filter(Boolean));
		const modalsToReshow = openModals.filter((record) => changedModuleNames.has(record.moduleName));
		const reshowModuleNames = new Set(modalsToReshow.map((record) => record.moduleName));

		// Determine if we can navigate in-place to a changed page
		// instead of resetting all the way back to app-root.
		// This keeps the user on the page they're editing for faster iteration.
		const changedXmlPages = drained
			.filter((id) => /\.xml$/i.test(id))
			.map((id) => toAppModuleName(id))
			.filter((m) => m && m !== 'app-root' && !reshowModuleNames.has(m));

		// Resolve the topmost Frame from the bundled realm.
		// Frame.topmost() relies on an internal frameStack array, so we must
		// call it on the bundled-realm class. Multiple strategies to find it:
		const FrameClass = getCore('Frame') || g.Frame;
		let topFrame: any = null;
		// 1) Try the vendor-realm static topmost()
		try {
			topFrame = FrameClass?.topmost?.();
		} catch {}
		// 2) Try getting the root view from Application — if it's a Frame, use it
		if (!topFrame) {
			try {
				const rootView = App.getRootView?.() || (App as any)._rootView;
				if (rootView) {
					// rootView could be a Frame itself, or contain a Frame
					const isFrame = rootView.constructor?.name === 'Frame' || rootView.navigate;
					if (isFrame) {
						topFrame = rootView;
					} else if (rootView.getChildAt) {
						// Walk direct children looking for a Frame
						for (let i = 0; i < (rootView.getChildrenCount?.() || 0); i++) {
							const child = rootView.getChildAt(i);
							if (child?.constructor?.name === 'Frame' || child?.navigate) {
								topFrame = child;
								break;
							}
						}
					}
				}
			} catch {}
		}
		if (VERBOSE) console.log('[hmr][queue] TS: changedXmlPages=', changedXmlPages, 'topFrame=', !!topFrame, 'modalsToReshow=', modalsToReshow.length);
		if (changedXmlPages.length > 0 && topFrame) {
			// Navigate the current frame to the changed page directly.
			// Use the last changed XML page (most specific).
			const moduleName = changedXmlPages[changedXmlPages.length - 1];
			if (VERBOSE) console.log('[hmr][queue] TS: navigating in-place to', moduleName);
			try {
				topFrame.navigate({ moduleName, clearHistory: false, animated: false });
			} catch (navErr) {
				console.warn('[hmr][queue] TS flavor: in-place navigate failed, falling back to resetRootView', navErr);
				App.resetRootView({ moduleName: 'app-root' } as any);
			}
		} else if (modalsToReshow.length === 0) {
			// No frame page to refresh and no open modal owns the change —
			// fall back to a full root reset. (Skipped when an open modal is
			// being re-presented below: resetRootView would dismiss it.)
			if (VERBOSE) console.log('[hmr][queue] TS flavor: resetRootView(app-root) after changes');
			App.resetRootView({ moduleName: 'app-root' } as any);
		}
		// Re-present any open modals whose XML/code-behind changed. The
		// modules were already re-registered above (raw XML assets + fresh
		// code-behind exports), so the re-presented modal rebuilds from
		// the new content while the page beneath it stays put.
		for (const record of modalsToReshow) {
			await reshowOpenModal(record);
		}
	} catch (e) {
		console.warn('[hmr][queue] TS flavor: resetRootView(app-root) failed', e);
	}
}

/**
 * TypeScript (plain XML) flavor client strategy. React reuses everything here
 * except `refreshAfterBatch` (see `frameworks/react/client/strategy.ts`) —
 * mirroring the server's `{ ...typescriptServerStrategy, flavor: 'react' }`.
 */
export const typescriptClientStrategy: FrameworkClientStrategy = {
	flavor: 'typescript',

	install() {
		// Record string-module modals from the moment the client is up so an
		// already-open modal can be re-presented when its files change.
		// Installed at strategy resolve (not first-update time) because the wrap
		// can only observe showModal calls made AFTER it lands. Retried briefly
		// because getCore('View') may not resolve until the vendor realm
		// finishes booting.
		const tryInstallModalTracking = (attempts: number) => {
			ensureModalTracking();
			if (!modalTrackingInstalled && attempts > 0) {
				setTimeout(() => tryInstallModalTracking(attempts - 1), 250);
			}
		};
		tryInstallModalTracking(40);
	},

	createRoot(newComponent: any, state: any): any {
		// Treat the component as a factory or direct NS view.
		let root: any = null;
		try {
			if (typeof newComponent === 'function') {
				root = newComponent();
			} else {
				root = newComponent;
			}
		} catch (e) {
			console.warn('[hmr-client][ts] root factory invocation failed', e);
		}
		// Heuristic: if the root "looks" like a Frame, prefer frame semantics
		try {
			const name = String(root?.constructor?.name || '').replace(/^_+/, '');
			if (/^Frame(\$\d+)?$/.test(name)) {
				state.setRootKind('frame');
			}
		} catch {}
		return root || {};
	},

	afterModuleReimport(id: string, mod: any) {
		// Refresh the bundled module registry with the fresh exports so
		// Builder.createViewFromEntry / loadModule('<page>') resolves the NEW
		// code-behind (tap handlers, page events) instead of the stale module
		// captured in the boot bundle. Without this, XML re-renders pick up new
		// markup but keep old behavior.
		if (!mod || !/\.(ts|js)$/i.test(id)) return;
		try {
			const g: any = getGlobalScope();
			const moduleName = toAppModuleName(id);
			if (moduleName && typeof g.registerModule === 'function') {
				g.registerModule(moduleName, () => mod);
				g.registerModule('./' + moduleName, () => mod);
				if (VERBOSE) console.log('[hmr][queue] re-registered code-behind', moduleName);
			}
		} catch (e) {
			if (VERBOSE) console.warn('[hmr][queue] code-behind re-register failed for', id, e);
		}
	},

	async refreshAfterBatch(drained: string[], ctx: FrameworkClientBatchContext) {
		// Always reset back to the conventional app root (or navigate in place /
		// re-present modals). This preserves the shell (Frame, ActionBar, etc.)
		// that the app's own bootstrapping wires up via `Application.run`.
		await applyTypescriptRefresh(drained);
		// Tell the overlay the cycle is done — without this the applying overlay
		// sticks at 'received' (5%) forever even though the in-place navigate /
		// resetRootView already applied the update.
		ctx.setUpdateOverlayStage('complete', {
			detail: `Total ${Math.max(0, Date.now() - ctx.startedAt)}ms`,
		});
	},
};
