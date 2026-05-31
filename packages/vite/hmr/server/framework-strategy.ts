import type { HmrContext, ViteDevServer } from 'vite';
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
 * Inputs for {@link FrameworkServerStrategy.registerRoutes}. A framework that
 * owns dev-only HTTP endpoints (e.g. Vue's `/ns/sfc*`) registers them here;
 * frameworks without extra endpoints leave the hook undefined (no-op default).
 */
export interface FrameworkRouteContext {
	server: ViteDevServer;
	wss: WebSocketServer | null;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	verbose: boolean;
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
	/** Ensure framework-specific HTTP endpoints/imports are versioned for cache-busting. */
	ensureVersionedImports?(code: string, origin: string, version: number): string;
	/** Optional vendor rewrite hook (e.g. map framework helper imports to vendor). */
	rewriteVendorSpec?(code: string, origin: string, version: number): string;

	// ── Strategy hooks (P2-A1) ──────────────────────────────────────────────
	// Interface gaps that today force inline `flavor === …` branching in shared
	// server modules (§13.2/§13.4). All OPTIONAL: when a strategy omits a hook
	// the shared pipeline keeps its current behavior (the documented default).
	// Call-site wiring lands later, one concern per change: handleHotUpdate →
	// P2-A3; rewriteServedModule + transformNodeModule → P2-A4; registerRoutes +
	// importMapEntries + volatilePatterns → P2-A5.

	/**
	 * Full per-framework `handleHotUpdate` implementation. When defined, the
	 * shared `handleNsHotUpdate` dispatcher delegates to it; when omitted the
	 * shared default path runs (today's behavior). Absorbs the per-flavor switch
	 * in `websocket-hot-update.ts`.
	 */
	handleHotUpdate?(ctx: HmrContext, deps: NsHotUpdateContext): Promise<void>;

	/**
	 * When `true`, the per-module graph delta is NOT broadcast inline during a
	 * hot update (the framework drives its own re-fetch/patch instead — Angular
	 * & Solid). Defaults to `false` → delta is broadcast (today's TS/Vue path).
	 * Replaces `broadcastDelta: flavor !== 'angular' && flavor !== 'solid'`.
	 */
	readonly deferDeltaBroadcast?: boolean;

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
	 * Extra volatile URL patterns the device runtime must always re-fetch (Vue →
	 * `/@ns/sfc/`, `/@ns/asm/`; Angular → `/@ns/asm/`). Defaults to none.
	 * Replaces the framework arm of `getVolatilePatterns`.
	 */
	volatilePatterns?(): string[];

	processFile(ctx: FrameworkProcessFileContext): Promise<void>;
	buildRegistry(ctx: FrameworkRegistryContext): Promise<void>;
}

export type FrameworkStrategyResolver = (flavor: string) => FrameworkServerStrategy;
