import { verifyAngularComponentOutput } from '../frameworks/angular/server/compile-check.js';

/**
 * The dev-time teardown a framework exposes for a soft reboot. The dev server
 * makes the app entry self-accepting and wires these into its `hot.dispose`
 * and the device's reboot sequence (`hmr/server/entry-boundary.ts`).
 */
export interface FrameworkEntryBoundary {
	/** Module specifier the entry imports them from, e.g. `@nativescript/angular`. */
	module: string;
	/** Export called from the entry's `hot.dispose`; tears the running app down. May return a promise. */
	dispose: string;
	/** Export returning a promise that settles once the re-evaluated entry's app has started. */
	settled?: string;
}

/**
 * What a framework flavor contributes to the dev server: device loader
 * configuration (`/ns/import-map.json`) and the entry boundary that turns an
 * edit below the app entry into a soft reboot. Updates themselves are the
 * framework's own Vite plugin's business.
 */
export interface FrameworkServerStrategy {
	readonly flavor: string;

	/** Bare specifiers the device import map must carry for this framework. */
	importMapSpecifiers?(): string[];

	/**
	 * URL substrings the device runtime drops from its registry before every
	 * dynamic import of a matching URL, so each import re-fetches.
	 */
	volatilePatterns?(): string[];

	/**
	 * Path substrings whose query string is the module identity; the runtime's
	 * canonical-key function keeps it verbatim (`canonicalization.preserveQueryFor`).
	 */
	preserveQueryPaths?(): string[];

	/**
	 * Without one, an edit that reaches the entry has no HMR boundary: Vite
	 * sends `full-reload`, which restarts the app.
	 */
	entryBoundary?: FrameworkEntryBoundary;

	/**
	 * Rejects a module whose transform succeeded but whose output can't run,
	 * before an update carrying it goes out (Angular: a component its compiler
	 * gave up on). The rejection reaches the device as Vite's `error` payload.
	 */
	verifyTransform?(module: { id: string; url: string; code: string }): Promise<Error | undefined> | Error | undefined;

	/**
	 * Custom events the dev server holds until the update of the same save has
	 * passed its compile check, and drops when it failed (Angular's in-place
	 * `angular:component-update`).
	 */
	gatedEvents?: readonly string[];
}

// Analog serves recompiled component metadata at `<importer dir>/@ng/component?c=<id>&t=<ts>`;
// each `t` is a distinct recompile, so the query must never be collapsed.
const angularServerStrategy: FrameworkServerStrategy = {
	flavor: 'angular',
	volatilePatterns: () => ['/@ng/component'],
	preserveQueryPaths: () => ['/@ng/component'],
	entryBoundary: { module: '@nativescript/angular', dispose: 'prepareHmrReboot', settled: 'whenHmrRebootSettled' },
	verifyTransform: (module) => verifyAngularComponentOutput(module),
	gatedEvents: ['angular:component-update'],
};

const BUILT_IN_STRATEGIES = new Map<string, FrameworkServerStrategy>([
	['angular', angularServerStrategy],
	// Key order is significant for the import map.
	['vue', { flavor: 'vue', importMapSpecifiers: () => ['nativescript-vue', 'vue'] }],
	// The vendor bundle externalizes `solid-js`, so its bare import must resolve through the import map.
	['solid', { flavor: 'solid', importMapSpecifiers: () => ['solid-js'] }],
	['react', { flavor: 'react' }],
	['typescript', { flavor: 'typescript' }],
	['javascript', { flavor: 'javascript' }],
]);

export function getBuiltInServerStrategy(flavor: string): FrameworkServerStrategy | undefined {
	return BUILT_IN_STRATEGIES.get(flavor);
}
