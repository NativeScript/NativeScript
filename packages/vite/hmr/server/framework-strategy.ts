import type { HmrContext, ViteDevServer } from 'vite';
import type { ServerResponse } from 'node:http';
import type { WebSocketServer } from 'ws';
// Type-only import (erased at emit). `NsHotUpdateContext` already references
// `FrameworkServerStrategy`, so this is a deliberate type-level cycle — fine for
// tsc and produces no runtime import in the compiled `.js`.
import type { NsHotUpdateContext } from './websocket-hot-update.js';

export interface FrameworkProcessFileContext {
	filePath: string;
	server: ViteDevServer;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	visitedPaths: Set<string>;
	wss: WebSocketServer;
	verbose: boolean;
	helpers?: {
		cleanCode(code: string): string;
		collectImportDependencies(code: string, importer: string): Set<string>;
		isCoreGlobalsReference(spec: string): boolean;
		isNativeScriptCoreModule(spec: string): boolean;
		isNativeScriptPluginModule(spec: string): boolean;
		resolveVendorFromCandidate(spec: string): string | null;
		createHash(value: string): string;
	};
}

export interface FrameworkRegistryContext {
	server: ViteDevServer;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	wss: WebSocketServer;
	verbose: boolean;
	helpers?: {
		cleanCode(code: string): string;
		collectImportDependencies(code: string, importer: string): Set<string>;
		isCoreGlobalsReference(spec: string): boolean;
		isNativeScriptCoreModule(spec: string): boolean;
		isNativeScriptPluginModule(spec: string): boolean;
		resolveVendorFromCandidate(spec: string): string | null;
		createHash(value: string): string;
		rewriteImports(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean, outputDirOverrideRel?: string, httpOrigin?: string): string;
		processSfcCode(code: string): string;
	};
}

export interface FrameworkCleanContext {
	code: string;
}

/**
 * Inputs for {@link FrameworkServerStrategy.rewriteServedModule}, mirroring the
 * arguments the `/ns/m` served-module pipeline passes to `rewriteImports` /
 * `prepareAngularEntryForDevice` today (the angular/else fork in
 * `websocket-ns-m.ts`).
 */
export interface FrameworkServedModuleContext {
	/** Resolved module specifier / URL being served (`resolvedCandidate || spec`). */
	moduleId: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	projectRoot: string;
	serverOrigin: string;
	verbose: boolean;
}

/**
 * Inputs for {@link FrameworkServerStrategy.interceptModuleRequest}: the raw
 * `/ns/m` request BEFORE spec resolution. `isLiveComponentUpdateFetch` is the
 * live-broadcast gate injected from the WebSocket plugin's component-update
 * ledger (Angular; undefined for other flavors).
 */
export interface FrameworkModuleRequestContext {
	urlObj: URL;
	res: ServerResponse;
	next: () => void;
	isLiveComponentUpdateFetch?: (componentId: string, timestamp: number) => boolean;
}

/**
 * Inputs for {@link FrameworkServerStrategy.registerRoutes}. A framework that
 * owns dev-only HTTP endpoints (e.g. Vue's `/ns/sfc*`) registers them here;
 * frameworks without extra endpoints leave the hook undefined (no-op default).
 *
 * Carries everything Vue's `registerSfcHandlers` needs (its
 * `RegisterSfcHandlersOptions` shape): the dev server, plugin state
 * (`sfcFileMap`/`depFileMap`/`appVirtualWithSlash`), the live graph-version
 * accessor, and the active strategy. `wss` is included for parity with the
 * other route registrars (the SFC handlers don't consult it today).
 */
export interface FrameworkRouteContext {
	server: ViteDevServer;
	wss: WebSocketServer | null;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	verbose: boolean;
	appVirtualWithSlash: string;
	getGraphVersion(): number;
	getStrategy(): FrameworkServerStrategy;
}

export interface FrameworkServerStrategy {
	readonly flavor: string;
	matchesFile(id: string): boolean;
	// All transform hooks below are optional and default to identity (return the
	// code unchanged). Only frameworks with real work (Angular, Vue) implement them.
	/** Framework-specific pre-clean phase (remove virtual style imports, etc.). */
	preClean?(code: string): string;
	/** Rewrite framework runtime imports to vendor bundle. */
	rewriteFrameworkImports?(code: string): string;
	/** Framework-specific post-clean phase (strip HMR helpers, etc.). */
	postClean?(code: string): string;
	/**
	 * Collapse framework-specific HTTP endpoint imports to their canonical
	 * (unversioned) URLs. Module identity is the URL; freshness is driven by
	 * explicit eviction, never URL variation. Versioned inbound shapes from
	 * stale cached device code (e.g. `/ns/sfc/<ver>/…`) are stripped here.
	 */
	canonicalizeFrameworkImports?(code: string, origin: string): string;
	/** Optional vendor rewrite hook (e.g. map framework helper imports to vendor). */
	rewriteVendorSpec?(code: string, origin: string, version: number): string;

	// ── Strategy hooks ──────────────────────────────────────────────────────
	// Optional per-framework hooks that absorb what would otherwise be inline
	// `flavor === …` branching in the shared server modules. All OPTIONAL: when a
	// strategy omits a hook, the shared pipeline keeps its default behavior.

	/**
	 * Full per-framework `handleHotUpdate` implementation. Every flavor owns one:
	 * the WebSocket plugin's `handleHotUpdate` Vite hook calls it directly, and
	 * the implementation runs the shared {@link NsHotUpdateContext}-driven
	 * `runHotUpdatePrologue` followed by its own framework tail.
	 */
	handleHotUpdate?(ctx: HmrContext, deps: NsHotUpdateContext): Promise<HmrContext['modules'] | void>;

	/**
	 * Handle a Vite custom event sent FROM the device (`import.meta.hot.send`
	 * arrives on the `/ns-hmr` socket as `{ type: 'custom', event, data }`).
	 * Frameworks use this for runtime→server recovery signals the shared
	 * message pump has no business interpreting. Angular implements it for
	 * `angular:invalidate` — Angular core sends that when an in-place
	 * `ɵɵreplaceMetadata` apply THROWS (see `executeWithInvalidateFallback`),
	 * expecting the dev server to force a full reload the way
	 * `@angular/build`'s Vite server does on web. Defaults to ignore.
	 */
	handleClientCustomEvent?(ctx: { event: string; data: unknown; server: ViteDevServer }, deps: NsHotUpdateContext): Promise<void> | void;

	/**
	 * When `true`, the per-module graph delta is NOT broadcast inline during a
	 * hot update (the framework drives its own re-fetch/patch instead — Angular
	 * & Solid). Defaults to `false` → delta is broadcast (today's TS/Vue path).
	 */
	readonly deferDeltaBroadcast?: boolean;

	/**
	 * When this returns `true` for the changed file, the shared prologue SKIPS
	 * its default module-graph delta upsert — the framework's own
	 * `handleHotUpdate` tail re-queries the graph and drives the update itself
	 * (Angular HTML templates: Analog's in-place swap or the NS reboot path).
	 * Defaults to no-skip (the prologue always upserts).
	 */
	skipDefaultGraphUpdate?(file: string): boolean;

	/**
	 * When `true`, the shared prologue does NOT broadcast `ns:css-updates` for a
	 * component-scoped style edit (a non-global `.css`) — the framework's own
	 * `handleHotUpdate` drives the in-place component update instead. For
	 * Angular with Analog `liveReload` active this is essential: Analog emits
	 * `angular:component-update` only while the css's `?direct` module is absent
	 * from the graph, and the prologue's broadcast makes the device fetch
	 * `…?direct=1`, which creates that module and flips Analog to its
	 * (NativeScript-inert) Vite css-update branch on every subsequent edit. The
	 * global app-entry CSS path is unaffected (it is not component-scoped).
	 * Defaults to `false` (every flavor keeps the component-style broadcast).
	 */
	ownsComponentStyleHmr?(server: ViteDevServer): boolean;

	/**
	 * Intercept a `/ns/m` request before spec resolution. Return `true` when
	 * the request was fully answered (or delegated downstream via `next()`),
	 * so the shared route stops processing it. Angular implements this for
	 * AnalogJS `/@ng/component` metadata fetches (see
	 * `frameworks/angular/server/ng-component-route.ts`). Defaults to no
	 * interception.
	 */
	interceptModuleRequest?(ctx: FrameworkModuleRequestContext): boolean;

	/**
	 * Last-chance export normalization on the final served body (after the
	 * CJS wrap, before URL canonicalization). Vue/Solid/TS implement the
	 * `routes` default-export alias so both `import { routes }` and
	 * `import routes` resolve against a route-config module. Defaults to
	 * identity.
	 */
	normalizeServedExports?(code: string): string;

	/**
	 * Override the `/ns/m` served-module import rewrite. Defaults to the shared
	 * `rewriteImports` (today's non-Angular path); Angular overrides with its
	 * entry-preparation pass. Returns the rewritten code.
	 */
	rewriteServedModule?(code: string, ctx: FrameworkServedModuleContext): string;

	/**
	 * Patch a served `node_modules` module before device delivery (e.g. Solid's
	 * inline `@solid-refresh` patch). Defaults to identity (code unchanged).
	 * `verbose` mirrors the `/ns/m` plugin's `verbose` option and gates the
	 * server-side diagnostics the inline patch emitted today (the device process
	 * sets `globalThis.__NS_ENV_VERBOSE__`, but the Node server never does).
	 */
	transformNodeModule?(code: string, moduleId: string, verbose?: boolean): string;

	/**
	 * Framework SFC post-processing (Vue). Defaults to identity. Mirrors the
	 * `processSfcCode` helper currently injected via the registry context.
	 */
	processSfcCode?(code: string): string;

	/**
	 * Register framework-owned dev HTTP endpoints (Vue: `/ns/sfc*`). Defaults to
	 * no-op for frameworks without extra routes.
	 */
	registerRoutes?(ctx: FrameworkRouteContext): void;

	/**
	 * Extra import-map entries for this framework (e.g. Vue → `vue` /
	 * `nativescript-vue`; Solid → `solid-js`). Defaults to none. Replaces the
	 * `addFrameworkEntries` switch in `import-map.ts`.
	 */
	importMapEntries?(origin: string): Record<string, string>;

	/**
	 * Extra volatile URL patterns the device runtime must always re-fetch.
	 * Defaults to none — no built-in strategy needs any (freshness is
	 * eviction-driven), but the hook stays for custom strategies.
	 */
	volatilePatterns?(): string[];

	processFile(ctx: FrameworkProcessFileContext): Promise<void>;
	buildRegistry(ctx: FrameworkRegistryContext): Promise<void>;
}

export type FrameworkStrategyResolver = (flavor: string) => FrameworkServerStrategy;
