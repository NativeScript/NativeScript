/**
 * Client-side framework strategy contract (device HMR runtime).
 *
 * The server-side seam (`hmr/server/framework-strategy.ts`) has a mirror here:
 * each framework that needs bespoke on-device HMR behavior implements this and
 * is selected by `TARGET_FLAVOR`. Today only Vue and Angular ship a dedicated
 * client module; Solid and TypeScript run the shared client paths directly, so
 * they resolve to `undefined` and every hook below is simply skipped.
 *
 * All members are optional except `install`. A missing hook means "use the
 * shared default", which is byte-for-byte the pre-strategy inline behavior.
 *
 * Keeping this file free of any framework import is deliberate: it lets the
 * shared client depend only on the contract, so the concrete per-flavor module
 * can later be loaded through a single dynamic `import()` (the device-bundle
 * win) without the shared client statically pulling in every framework client.
 */

export interface ClientGraphModule {
	id: string;
	deps: string[];
	hash: string;
}

/** Shared state handed to {@link FrameworkClientStrategy.selectMountCandidate}. */
export interface FrameworkClientMountContext {
	graph: Map<string, ClientGraphModule>;
	appMainEntrySpec: string;
}

/** Shared helpers handed to {@link FrameworkClientStrategy.refreshAfterBatch}. */
export interface FrameworkClientBatchContext {
	setUpdateOverlayStage: (stage: any, opts?: any) => void;
	/** Wall-clock (ms) when the queue drain started, for "Updated … in Nms". */
	startedAt: number;
	/** Live client module graph (id → {id, deps, hash}) for reverse-import propagation. */
	graph?: Map<string, ClientGraphModule>;
	/** Swap the live root view to a freshly loaded component (resolves true on success). */
	performResetRoot?: (component: any) => Promise<boolean> | any;
	/** Resolves the live dev-overlay API (null/undefined when not installed). */
	getOverlay?: () => any;
}

/** Shared helpers handed to the framework message hooks. */
export interface FrameworkClientMessageContext {
	getCore: (name: string) => any;
	verbose: boolean;
	performResetRoot: (component: any) => any;
	getOverlay: () => any;
}

export interface FrameworkClientStrategy {
	readonly flavor: string;

	/**
	 * When false, the in-place authoritative-frame `navigate()` fast path is
	 * skipped in favor of a full `resetRootView`. Vue requires this. Absent
	 * strategy/flag defaults to `true` (the legacy `flavor !== 'vue'` behavior).
	 */
	readonly allowNavigateFastPath?: boolean;

	/** One-time client install (dev shims / HMR hooks). Runs at strategy resolve. */
	install(): void;

	/** Install the hardware-back wrapper once a resetRoot fn + core accessor exist. */
	installBackWrapper?(performResetRoot: (comp: any) => void, getCore: (name: string) => any): void;

	/** Pick the initial/rescue mount component id from the module graph (+ registry). */
	selectMountCandidate?(ctx: FrameworkClientMountContext): string | null;

	/** Load the component to mount for `candidate` (e.g. Vue SFC assembly). */
	loadComponentForMount?(candidate: string, tag: string): Promise<any>;

	/** Ensure framework globals exist before building a navigation app. */
	beforeNavigateBuild?(): void;

	/** Hook the freshly-created navigation app instance (e.g. attach Pinia). */
	onNavAppCreated?(app: any): void;

	/** Build the NS root view for `newComponent` (framework-specific mount). */
	createRoot?(newComponent: any, state: any): any;

	/** Record changed-module metadata from a delta payload (framework bookkeeping). */
	recordPayloadChanges?(changed: any[], graphVersion: number): void;

	/** Framework UI refresh after a re-import batch drains. */
	refreshAfterBatch?(drained: string[], ctx: FrameworkClientBatchContext): void | Promise<void>;

	/** Handle a framework hot-update protocol message (resolves true if consumed). */
	handleHotUpdateMessage?(msg: any, ctx: FrameworkClientMessageContext): Promise<boolean>;

	/** Handle the framework SFC registry message. */
	handleSfcRegistry?(msg: any): void;

	/** Handle the framework SFC registry-update message (drives its own overlay). */
	handleSfcRegistryUpdate?(msg: any, graphVersion: number, ctx: FrameworkClientMessageContext): Promise<void>;
}
