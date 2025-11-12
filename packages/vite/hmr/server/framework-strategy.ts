import type { ViteDevServer } from 'vite';
import type { WebSocketServer } from 'ws';

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

export interface FrameworkServerStrategy {
	readonly flavor: string;
	matchesFile(id: string): boolean;
	/**
	 * Framework-specific pre-clean phase (remove virtual style imports, etc.).
	 */
	preClean(code: string): string;
	/**
	 * Rewrite framework runtime imports to vendor bundle.
	 */
	rewriteFrameworkImports(code: string): string;
	/**
	 * Framework-specific post-clean phase (strip HMR helpers, etc.).
	 */
	postClean(code: string): string;
	/**
	 * Ensure framework-specific HTTP endpoints/imports are versioned for cache-busting.
	 */
	ensureVersionedImports(code: string, origin: string, version: number): string;
	/**
	 * Optional vendor rewrite hook (e.g. map framework helper imports to vendor).
	 */
	rewriteVendorSpec?(code: string, origin: string, version: number): string;
	processFile(ctx: FrameworkProcessFileContext): Promise<void>;
	buildRegistry(ctx: FrameworkRegistryContext): Promise<void>;
}

export type FrameworkStrategyResolver = (flavor: string) => FrameworkServerStrategy;
