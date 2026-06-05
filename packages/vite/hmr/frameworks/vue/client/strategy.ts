import type { FrameworkClientStrategy, FrameworkClientMountContext, FrameworkClientBatchContext, FrameworkClientMessageContext } from '../../../client/framework-client-strategy.js';
import { installNsVueDevShims, ensureBackWrapperInstalled, getRootForVue, loadSfcComponent, ensureVueGlobals, ensurePiniaOnApp, recordVuePayloadChanges, handleVueSfcRegistry, handleVueSfcRegistryUpdate, sfcArtifactMap } from './index.js';
import { driveVueSfcUpdateOverlay } from './vue-sfc-update-overlay.js';

const VUE_SFC_RE = /\.vue$/i;

/**
 * Vue's on-device HMR behavior, surfaced as a `FrameworkClientStrategy` so the
 * shared client never references the Vue client module directly. Every method
 * delegates to the existing `vue/client` functions — no behavior change.
 */
export const vueClientStrategy: FrameworkClientStrategy = {
	flavor: 'vue',
	// resetRootView (not in-place navigate) is the proven path for SFC HMR.
	allowNavigateFastPath: false,

	install() {
		installNsVueDevShims();
		// Prime Vue globals (createApp/NSVRoot) eagerly the moment the dynamically
		// imported client strategy resolves. The app-driven navigation path
		// (`__nsNavigateUsingApp` → `beforeNavigateBuild`) is not gated on the
		// strategy import, so seeding them here makes those later hooks pure
		// belt-and-suspenders rather than the first time globals are ensured.
		ensureVueGlobals();
	},

	installBackWrapper(performResetRoot, getCore) {
		ensureBackWrapperInstalled(performResetRoot, getCore);
	},

	selectMountCandidate(ctx: FrameworkClientMountContext): string | null {
		let candidate: string | null = null;
		const appEntry = ctx.graph.get(ctx.appMainEntrySpec);
		if (appEntry && Array.isArray(appEntry.deps)) {
			const vueDep = appEntry.deps.find((d) => typeof d === 'string' && VUE_SFC_RE.test(d));
			if (vueDep) candidate = vueDep;
		}
		if (!candidate) {
			for (const id of ctx.graph.keys()) {
				if (VUE_SFC_RE.test(id)) {
					candidate = id;
					break;
				}
			}
		}
		// Fallback: when the module graph is empty (Vite may not populate it before
		// the first full-graph broadcast), check the SFC artifact registry populated
		// from the ns:vue-sfc-registry message.
		if (!candidate && sfcArtifactMap.size > 0) {
			for (const id of sfcArtifactMap.keys()) {
				if (VUE_SFC_RE.test(id)) {
					candidate = id;
					break;
				}
			}
		}
		return candidate;
	},

	loadComponentForMount(candidate: string, tag: string): Promise<any> {
		return loadSfcComponent(candidate, tag);
	},

	beforeNavigateBuild() {
		ensureVueGlobals();
	},

	onNavAppCreated(app: any) {
		ensurePiniaOnApp(app);
	},

	createRoot(newComponent: any, state: any): any {
		return getRootForVue(newComponent, state);
	},

	recordPayloadChanges(changed: any[], graphVersion: number) {
		recordVuePayloadChanges(changed, graphVersion);
	},

	refreshAfterBatch(drained: string[], ctx: FrameworkClientBatchContext) {
		// Vue SFCs complete their own overlay via the registry-update path. When
		// only a non-SFC dep changed, no registry-update follows — drive the
		// closing frame here so the toast can auto-hide.
		const elapsed = Math.max(0, Date.now() - ctx.startedAt);
		ctx.setUpdateOverlayStage('complete', {
			detail: drained.length === 1 ? `Updated ${drained[0]} in ${elapsed}ms` : `Updated ${drained.length} modules in ${elapsed}ms`,
		});
	},

	handleSfcRegistry(msg: any) {
		handleVueSfcRegistry(msg);
	},

	async handleSfcRegistryUpdate(msg: any, graphVersion: number, ctx: FrameworkClientMessageContext) {
		await driveVueSfcUpdateOverlay(
			{
				filePath: typeof msg.path === 'string' ? msg.path : undefined,
				loadComponent: () => handleVueSfcRegistryUpdate(msg, graphVersion),
				applyComponent: (component) => ctx.performResetRoot(component),
			},
			{ getOverlay: ctx.getOverlay },
		);
	},
};
