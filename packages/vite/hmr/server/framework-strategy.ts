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
	visitedPaths: Set<string>;
	wss: WebSocketServer;
	verbose: boolean;
}

export interface FrameworkRegistryContext {
	server: ViteDevServer;
	sfcFileMap: Map<string, string>;
	wss: WebSocketServer;
	verbose: boolean;
}

export interface FrameworkServerStrategy {
	readonly flavor: string;
	matchesFile(id: string): boolean;

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
	 * Content-file edits (Tailwind scans) that change the generated `app.css`
	 * are normally broadcast as a standalone `ns:css-updates`. Return `true`
	 * when the framework's own update message must carry them instead — the
	 * prologue then hands them to the tail via
	 * {@link HotUpdatePrologueState.deferredCssUpdates} so the device
	 * serializes the CSS with the framework's update cycle instead of racing
	 * it (Angular: a TS edit reboots the root, and the CSS must land inside
	 * that reboot, not against a view tree mid-teardown). Defaults to `false`
	 * (standalone broadcast).
	 */
	defersContentCssToFrameworkUpdate?(file: string): boolean;

	/**
	 * Extra bare specifiers the device import map must carry for this framework
	 * (e.g. Vue → `nativescript-vue` / `vue`; Solid → `solid-js`). Defaults to
	 * none.
	 */
	importMapSpecifiers?(): string[];

	/**
	 * Extra volatile URL patterns the device runtime must always re-fetch.
	 * Defaults to none (freshness is eviction-driven). Angular supplies
	 * `/@ng/component` — its per-save `t` param mints a fresh module per
	 * recompile, so the previous entry must be evicted on every re-import
	 * or the registry accumulates one stale entry per save.
	 */
	volatilePatterns?(): string[];

	/**
	 * Paths (substring match) whose query string IS the module identity and
	 * must be preserved verbatim by the runtime's canonical-key function.
	 * Defaults to none. Angular supplies `/@ng/component` — each
	 * `?c=<id>&t=<ts>` identifies a distinct metadata recompile; stripping
	 * `t` would collapse every HMR fetch onto the boot-time cache key and
	 * `ɵɵreplaceMetadata` would forever replay stale template instructions.
	 * Fed into `configureLoader({ canonicalization.preserveQueryFor })`.
	 */
	preserveQueryPaths?(): string[];

	processFile(ctx: FrameworkProcessFileContext): Promise<void>;
	buildRegistry(ctx: FrameworkRegistryContext): Promise<void>;
}

export type FrameworkStrategyResolver = (flavor: string) => FrameworkServerStrategy;
