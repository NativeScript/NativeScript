/**
 * What a framework flavor contributes to the dev server's device loader
 * configuration (`/ns/import-map.json`). Updates themselves are the framework's
 * own Vite plugin's business.
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
}

// Analog serves recompiled component metadata at `<importer dir>/@ng/component?c=<id>&t=<ts>`;
// each `t` is a distinct recompile, so the query must never be collapsed.
const angularServerStrategy: FrameworkServerStrategy = {
	flavor: 'angular',
	volatilePatterns: () => ['/@ng/component'],
	preserveQueryPaths: () => ['/@ng/component'],
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
