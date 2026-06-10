import type { Plugin, ViteDevServer } from 'vite';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import * as path from 'path';
import { createHash } from 'crypto';
import { getVendorManifest } from '../shared/vendor/registry.js';
import { getPackageJson, getProjectFilePath } from '../../helpers/project.js';
import { loadPrebuiltVendorManifest } from '../shared/vendor/manifest-loader.js';
import '../vendor-bootstrap.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath } from '../../helpers/utils.js';
import { shouldIncludeRuntimeGraphFile, shouldSkipRuntimeGraphDirectoryName } from './runtime-graph-filter.js';
import { getHmrSourceRoots } from '../../helpers/hmr-scope.js';
import { getTsConfigData } from '../../helpers/ts-config-paths.js';
import { normalizeHotReloadMatchPath, shouldSuppressViteFullReloadPayload, type PendingAngularReloadSuppressionEntry } from '../frameworks/angular/server/websocket-angular-hot-update.js';
import { canonicalizeTransformRequestCacheKey } from './transform-cache-invalidation.js';
import { HmrModuleGraph } from './hmr-module-graph.js';
import { registerNsRtBridgeRoute } from './ns-rt-route.js';
import { registerVendorUnifierHandler } from './websocket-vendor-unifier.js';
import { registerTxnHandler } from './websocket-txn.js';
import { registerNsModuleServerRoute } from './websocket-ns-m.js';
import { registerNsCoreRoute } from './websocket-ns-core.js';
import { registerNsEntryRoutes } from './websocket-ns-entry.js';
import { registerImportMapRoute } from './websocket-import-map-route.js';
import { isAngularRootComponentUpdate, resolveBootstrapRootComponent, type BootstrapRootComponent } from '../frameworks/angular/server/angular-root-component.js';
import { cleanCode, collectImportDependencies, processSfcCode, rewriteImports, shouldRemapImport } from './websocket-device-transform.js';
import { classifyBootRoute, createColdBootRequestCounter, formatPopulateInitialGraphSummary, formatServerStartupBanner, type ColdBootRequestCounter } from './perf-instrumentation.js';
import { isCoreGlobalsReference, isNativeScriptCoreModule, isNativeScriptPluginModule, resolveVendorFromCandidate } from './websocket-module-specifiers.js';
import { createSharedTransformRequestRunner, type SharedTransformRequestRunner } from './shared-transform-request.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';

const APP_ROOT_DIR = getProjectAppPath();

// Absolute directories HMR is allowed to react to: the app source dir
// (`nativescript.config.ts` > `appPath`) plus tsconfig-configured shared
// libraries. Computed once per process (tsconfig data is itself memoized) and
// used to scope `handleHotUpdate` so non-source changes.
let _hmrSourceRoots: string[] | null = null;
function getHmrSourceRootsCached(): string[] {
	if (_hmrSourceRoots) return _hmrSourceRoots;
	let tsConfig: { paths?: Record<string, string[]>; baseUrl?: string } = {};
	try {
		tsConfig = getTsConfigData({ platform: '' });
	} catch {}
	_hmrSourceRoots = getHmrSourceRoots(tsConfig);
	return _hmrSourceRoots;
}

const APP_VIRTUAL_PREFIX = getProjectAppVirtualPath();
const APP_VIRTUAL_WITH_SLASH = `${APP_VIRTUAL_PREFIX}/`;
const DEFAULT_MAIN_ENTRY = getProjectAppRelativePath('app.ts');
const DEFAULT_MAIN_ENTRY_VIRTUAL = getProjectAppVirtualPath('app.ts');

// Memoized resolver for the project bootstrap entry as a posix
// project-relative path (e.g. `/src/main.ts`). This mirrors the
// resolution the cold-boot wrapper performs (`getPackageJson().main` →
// project-relative under `/<APP_ROOT_DIR>/`) so the eviction set for
// HMR always lines up with the URL the runtime actually re-imports.
// Resolved at first call and cached: `package.json` is read at startup
// and never changes during a dev session, so it's safe to memoize.
let __ns_bootstrap_entry_rel_cached: string | null = null;
function getBootstrapEntryRelPath(): string {
	if (__ns_bootstrap_entry_rel_cached) return __ns_bootstrap_entry_rel_cached;
	let entry = DEFAULT_MAIN_ENTRY_VIRTUAL;
	try {
		const pkg = getPackageJson();
		const main = (pkg && (pkg as any).main) || DEFAULT_MAIN_ENTRY;
		const abs = getProjectFilePath(main).replace(/\\/g, '/');
		const marker = `/${APP_ROOT_DIR}/`;
		const idx = abs.indexOf(marker);
		entry = idx >= 0 ? abs.substring(idx) : DEFAULT_MAIN_ENTRY_VIRTUAL;
	} catch {}
	if (!entry.startsWith('/')) {
		entry = '/' + entry;
	}
	__ns_bootstrap_entry_rel_cached = entry;
	return entry;
}

// Memoized resolver for the project's Angular bootstrap (root) component.
// The root component owns the navigation `Frame` via `<page-router-outlet>`,
// so Analog's in-place `ɵɵreplaceMetadata` HMR is destructive for it (it
// recreates the root view without re-navigating → permanent white screen).
// Knowing which file is the root lets the bridge drop the in-place update
// and the hot-update handler route the edit through the reboot path instead.
// `undefined` = not yet computed; `null` = computed but unresolvable (the
// caller then keeps its default behavior, e.g. NgModule bootstrap shapes).
let __ns_root_component_cached: BootstrapRootComponent | null | undefined;
function getRootComponentIdentity(): BootstrapRootComponent | null {
	if (__ns_root_component_cached !== undefined) return __ns_root_component_cached;
	__ns_root_component_cached = null;
	try {
		const pkg = getPackageJson();
		const main = (pkg && (pkg as any).main) || DEFAULT_MAIN_ENTRY;
		const entrySource = readFileSync(getProjectFilePath(main), 'utf-8');
		__ns_root_component_cached = resolveBootstrapRootComponent({
			entrySource,
			entryRel: getBootstrapEntryRelPath(),
			appRootRel: '/' + APP_ROOT_DIR,
		});
	} catch {}
	return __ns_root_component_cached;
}

const STRATEGY_REGISTRY = new Map<string, FrameworkServerStrategy>([
	['vue', vueServerStrategy],
	['angular', angularServerStrategy],
	['solid', solidServerStrategy],
	['typescript', typescriptServerStrategy],
]);

function isSocketClientOpen(client: { readyState?: number; OPEN?: number } | null | undefined): boolean {
	if (!client) {
		return false;
	}

	const openState = typeof client.OPEN === 'number' ? client.OPEN : 1;
	return client.readyState === openState;
}

function getHmrSocketRoleFromRequestUrl(requestUrl: string | undefined): string {
	try {
		const url = new URL(requestUrl || '/ns-hmr', 'http://localhost');
		return url.searchParams.get('ns_hmr_role') || 'unknown';
	} catch {
		return 'unknown';
	}
}

function getHmrSocketRole(client: { __nsHmrClientRole?: string } | null | undefined): string {
	if (!client) {
		return 'unknown';
	}
	return typeof client.__nsHmrClientRole === 'string' && client.__nsHmrClientRole ? client.__nsHmrClientRole : 'unknown';
}

// Plugin
function createHmrWebSocketPlugin(opts: { verbose?: boolean }, strategy: FrameworkServerStrategy): Plugin {
	const verbose = !!opts.verbose;
	let wss: WebSocketServer | null = null;
	let sharedTransformRequest!: SharedTransformRequestRunner;
	const pendingAngularReloadSuppressions = new Map<string, PendingAngularReloadSuppressionEntry>();
	const sfcFileMap = new Map<string, string>();
	const depFileMap = new Map<string, string>();
	let vendorBootstrapDone = false;
	let pluginRoot: string | undefined;
	// HMR module graph (spec -> deps/hash) with version tagging and delta/full
	// broadcasts. `wss`/`pluginRoot` are read lazily via accessors because both
	// are established later, during configureServer.
	const moduleGraph = new HmrModuleGraph({
		verbose,
		strategy,
		getWss: () => wss,
		getPluginRoot: () => pluginRoot,
	});
	// Tracks the background initial-graph population so handleHotUpdate can
	// await completion before computing delta roots for the first HMR event.
	let graphInitialPopulationPromise: Promise<void> | null = null;
	// Cold-boot /ns/m request counter — populated the first time a /ns/m
	// request arrives, finalized when the request window goes idle.
	// See Shared across requests so a single counter spans the whole cold boot.
	let coldBootCounter: ColdBootRequestCounter | null = null;
	function rememberAngularReloadSuppression(root: string, file: string, ttlMs = 3000) {
		const absPath = normalizeHotReloadMatchPath(file);
		const relPath = normalizeHotReloadMatchPath(file, root);
		pendingAngularReloadSuppressions.set(absPath, {
			absPath,
			relPath,
			expiresAt: Date.now() + ttlMs,
		});
	}
	function pruneAngularReloadSuppressions(now = Date.now()) {
		for (const [key, entry] of pendingAngularReloadSuppressions) {
			if (!entry || entry.expiresAt <= now) {
				pendingAngularReloadSuppressions.delete(key);
			}
		}
	}
	async function populateInitialGraph(server: ViteDevServer) {
		if (moduleGraph.size) return; // already populated
		const tStart = Date.now();
		const versionAtStart = moduleGraph.version;
		const root = server.config.root || process.cwd();
		// Avoid direct require in ESM build: lazily obtain fs & path via createRequire or dynamic import
		let fs: typeof import('fs');
		let pathMod: typeof import('path');
		try {
			// Prefer createRequire to stay synchronous
			const req = createRequire(import.meta.url);
			fs = req('fs');
			pathMod = req('path');
		} catch {
			// Fallback to dynamic imports (should not normally happen)
			fs = await import('fs');
			pathMod = await import('path');
		}
		// Route every bulk transform through `sharedTransformRequest` when it's
		// already been wired up — this way the background walk shares the 60s
		// TTL cache with live /ns/m requests, so the device sees cached results
		// for any file the walker already visited. The fallback keeps the
		// walker working during server tests where the shared runner isn't
		// constructed yet.
		const bulkTransform: (rel: string) => Promise<{ code?: string } | null | undefined> = (rel) => {
			if (sharedTransformRequest) {
				return sharedTransformRequest(rel) as Promise<{ code?: string } | null | undefined>;
			}
			return server.transformRequest(rel) as Promise<{ code?: string } | null | undefined>;
		};
		async function walk(dir: string) {
			for (const name of fs.readdirSync(dir)) {
				if (name === 'node_modules' || name.startsWith('.') || shouldSkipRuntimeGraphDirectoryName(name)) continue;
				const full = pathMod.join(dir, name);
				try {
					const stat = fs.statSync(full);
					if (stat.isDirectory()) await walk(full);
					else if (stat.isFile()) {
						if (shouldIncludeRuntimeGraphFile(full, /\.(vue|ts|js|mjs|tsx|jsx)$/i)) {
							const rel = '/' + pathMod.relative(root, full).split(pathMod.sep).join('/');
							// Transform via Vite to gather deps (ignore failures)
							try {
								const transformed = await bulkTransform(rel);
								const code = transformed?.code || '';
								const deps: string[] = [];
								// fallback to import relationships via moduleGraph
								const modNode = server.moduleGraph.getModuleById(full) || server.moduleGraph.getModuleById(rel);
								if (modNode) {
									for (const m of modNode.importedModules) {
										if (m.id) deps.push(m.id.split('?')[0]);
									}
								}
								// bumpVersion: false — the initial walk is a bulk load, not a live
								// edit. Keeping graphVersion stable during cold boot avoids double
								// cache-key drift.
								moduleGraph.upsert(rel, code, deps, { bumpVersion: false });
							} catch {}
						}
					}
				} catch {}
			}
		}
		try {
			await walk(pathMod.join(root, 'src'));
		} catch {}
		// Diagnostic summary. Gated behind the verbose flag so the
		// dev console stays quiet on a normal save. Flip
		// NS_VITE_VERBOSE=1 to surface slow cold-boot walks; a
		// `bumpedVersion=no` result is the happy path, `yes`
		// indicates a regression.
		if (verbose) {
			console.info(
				formatPopulateInitialGraphSummary({
					moduleCount: moduleGraph.size,
					durationMs: Date.now() - tStart,
					graphVersion: moduleGraph.version,
					bumpedVersion: moduleGraph.version !== versionAtStart,
				}),
			);
		}
	}
	// Kick off `populateInitialGraph` in the background (non-awaited) so /ns/m
	// responses are never blocked on a full tree walk. Returns the shared
	// promise so hot-update code paths can await completion before computing
	// delta roots for the first HMR event.
	function ensureInitialGraphPopulationStarted(server: ViteDevServer): Promise<void> {
		if (graphInitialPopulationPromise) {
			return graphInitialPopulationPromise;
		}
		if (moduleGraph.size) {
			graphInitialPopulationPromise = Promise.resolve();
			return graphInitialPopulationPromise;
		}
		graphInitialPopulationPromise = populateInitialGraph(server).catch((error) => {
			if (verbose) console.warn('[hmr-ws][graph] background initial population failed', error);
		});
		return graphInitialPopulationPromise;
	}
	return {
		name: 'nativescript-hmr-websocket',
		apply: 'serve',

		configureServer(server) {
			pluginRoot = server.config?.root || process.cwd();
			const httpServer = server.httpServer;
			if (!httpServer) return;
			const wsAny = server.ws as any;
			if (!wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__) {
				const originalSend = server.ws.send.bind(server.ws);
				wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__ = true;
				// Bridge Vite's stock WS broadcasts (`server.ws.send(...)`)
				// to our `/ns-hmr` WebSocket. Vite v8 keeps two completely
				// separate `WebSocketServer` instances: its own (default
				// path `/`, accepting `vite-hmr`/`vite-ping` protocols) and
				// ours (`/ns-hmr`, where the iOS device actually connects).
				// Plugin-emitted events like Analog's
				// `server.ws.send('angular:component-update', { id, ts })`
				// flow through Vite's `normalizedHotChannel.send` →
				// `wss.clients.forEach`, but those `wss.clients` are
				// EMPTY in NativeScript dev — the device never speaks the
				// `vite-hmr` protocol nor connects to `/`. Without a
				// bridge, every plugin-emitted custom event is logged on
				// the server (e.g. `(client) hmr update <html>`) but
				// silently dropped before reaching the device. Symptom:
				// the iOS HMR-applying overlay sticks at 5%
				// ("Preparing update") forever because Angular's compiled
				// `import.meta.hot.on('angular:component-update', cb)`
				// listeners never fire. We mirror the payload onto our
				// `/ns-hmr` clients here so the existing custom-event
				// dispatcher in `hmr/client/index.ts` (which forwards to
				// `__NS_DISPATCH_HOT_EVENT__`) actually runs.
				const bridgeToNsHmrClients = (payload: any, args: any[]): void => {
					try {
						let normalized: any;
						if (typeof args[0] === 'string') {
							normalized = { type: 'custom', event: args[0], data: args[1] };
						} else {
							normalized = payload;
						}
						if (!normalized) return;
						// Vite's stock `update` payload includes per-module
						// HMR boundary info that our device-side client
						// has no handler for (we drive HMR via our own
						// `ns:angular-update`/`ns:hmr-delta`/`ns:css-updates`
						// messages). Forwarding it would just look like
						// noise to the client. Custom events
						// (`type: 'custom'`) — including
						// `angular:component-update` and Analog's
						// CSS-direct/inline `update` shorthand — DO need
						// to reach the device, since they drive the
						// in-place `ɵɵreplaceMetadata` template-swap path.
						// Filter the relay to those.
						if (normalized.type !== 'custom') return;
						// Root-component guard. Analog's in-place
						// `ɵɵreplaceMetadata` recreates the edited
						// component's `LView`s without re-navigating. For
						// the bootstrap (root) component — which hosts the
						// navigation `Frame` via `<page-router-outlet>` —
						// that tears the frame down and leaves an
						// unrecoverable white screen. Drop the in-place
						// update for the root here; the reboot path
						// (`ns:angular-update` → `__reboot_ng_modules__`)
						// re-bootstraps and replays route state, which is
						// the only mechanism that correctly rebuilds the
						// root view. The hot-update handler ensures a reboot
						// is broadcast for root edits (including `.html`).
						if (normalized.event === 'angular:component-update' && isAngularRootComponentUpdate(getRootComponentIdentity(), (normalized.data as { id?: unknown } | undefined)?.id)) {
							if (verbose) {
								console.log('[hmr-ws][bridge] dropped angular:component-update for root component — reboot path owns the root view (PageRouterOutlet frame)');
							}
							return;
						}
						const stringified = JSON.stringify(normalized);
						let recipients = 0;
						wss?.clients.forEach((client: any) => {
							try {
								if (client && client.readyState === 1) {
									client.send(stringified);
									recipients++;
								}
							} catch {}
						});
						if (verbose) {
							const event = (normalized as any)?.event;
							console.log(`[hmr-ws][bridge] forwarded ${normalized.type}${event ? `:${event}` : ''} payload to ${recipients} /ns-hmr client(s)`);
						}
					} catch (err) {
						if (verbose) {
							console.warn('[hmr-ws][bridge] failed to forward payload to /ns-hmr clients', err);
						}
					}
				};
				server.ws.send = ((payload: any, ...rest: any[]) => {
					pruneAngularReloadSuppressions();
					if (
						shouldSuppressViteFullReloadPayload({
							payload,
							pendingEntries: pendingAngularReloadSuppressions.values(),
							root: pluginRoot,
						})
					) {
						if (verbose) {
							console.log('[hmr-ws][angular] suppressed vite full-reload payload', payload);
						}
						return;
					}

					bridgeToNsHmrClients(payload, [payload, ...rest]);
					return originalSend(payload, ...rest);
				}) as typeof server.ws.send;
			}
			// Transform concurrency. Historically we defaulted to 1 to avoid
			// race conditions during HTTP HMR startup, but the shared runner
			// already has per-URL coalescing and an async-cached result map,
			// so higher fan-out is safe and dramatically reduces cold-boot
			// time. We cap at 8 by default to match typical dev machines and
			// respect Vite's internal worker pool limits. Override via the
			// `NS_VITE_HMR_TRANSFORM_CONCURRENCY` env var when needed.
			const configuredTransformConcurrency = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CONCURRENCY || '', 10);
			const transformConcurrency = Number.isFinite(configuredTransformConcurrency) && configuredTransformConcurrency > 0 ? configuredTransformConcurrency : 8;
			// Keep transformed code cached for longer across HMR updates so
			// that unchanged neighbours of an edited file don't re-run
			// through the Angular/TypeScript/Vite transform pipeline. The
			// HMR flow explicitly invalidates affected URLs, so a longer TTL
			// is safe. Override with `NS_VITE_HMR_TRANSFORM_CACHE_MS`.
			const configuredTransformCacheMs = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CACHE_MS || '', 10);
			const transformCacheMs = Number.isFinite(configuredTransformCacheMs) && configuredTransformCacheMs >= 0 ? configuredTransformCacheMs : 60000;
			sharedTransformRequest = createSharedTransformRequestRunner(
				(url) => server.transformRequest(url),
				(url, timeoutMs) => {
					console.warn('[ns:m] slow transformRequest for', url, '(>' + timeoutMs + 'ms)');
				},
				{
					maxConcurrent: transformConcurrency,
					resultCacheTtlMs: transformCacheMs,
					getResultCacheKey: (url) => canonicalizeTransformRequestCacheKey(url, pluginRoot || process.cwd()),
				},
			);

			// Always-on startup banner — prints once per dev server process
			// so anyone investigating perf can immediately see which build
			// is live and what knobs are active.
			try {
				let pkgVersion = 'unknown';
				try {
					const req = createRequire(import.meta.url);
					const pkg = req('@nativescript/vite/package.json');
					if (pkg && typeof pkg.version === 'string') pkgVersion = pkg.version;
				} catch {
					// `@nativescript/vite/package.json` is not always exported; fall
					// back to reading the file from disk next to this module.
					try {
						const here = new URL(import.meta.url).pathname;
						const pkgPath = path.resolve(path.dirname(here), '..', '..', 'package.json');
						if (existsSync(pkgPath)) {
							const parsed = JSON.parse(readFileSync(pkgPath, 'utf-8'));
							if (parsed && typeof parsed.version === 'string') pkgVersion = parsed.version;
						}
					} catch {}
				}
				if (verbose) {
					console.info(
						formatServerStartupBanner({
							version: pkgVersion,
							transformConcurrency,
							transformCacheMs,
							lazyInitialGraph: true,
							graphVersion: moduleGraph.version,
						}),
					);
				}
			} catch {}

			// Always-on cold-boot request trace. Runs in front of every
			// other middleware so it catches all NS dev routes (/ns/m/*,
			// /ns/rt/*, /ns/core/*, /__ns_boot__/*, etc.) with a single
			// hook. Closes itself after an idle window so HMR edits don't
			// get rolled into the cold-boot numbers. The idle window is
			// generous by default (5s) because V8's HTTP ESM resolver
			// pauses between dep levels while parsing — a too-tight window
			// was closing after the first wave and under-reporting boot by
			// 100x. Override via `NS_VITE_HMR_BOOT_TRACE_IDLE_MS` when
			// profiling something tricky.
			try {
				const configuredIdleMs = Number.parseInt(process.env.NS_VITE_HMR_BOOT_TRACE_IDLE_MS || '', 10);
				const idleWindowMs = Number.isFinite(configuredIdleMs) && configuredIdleMs > 0 ? configuredIdleMs : 5000;
				const configuredSummaryEvery = Number.parseInt(process.env.NS_VITE_HMR_BOOT_TRACE_PROGRESS_EVERY || '', 10);
				const summaryEvery = Number.isFinite(configuredSummaryEvery) && configuredSummaryEvery >= 0 ? configuredSummaryEvery : 25;
				if (!coldBootCounter) {
					coldBootCounter = createColdBootRequestCounter({
						summaryEvery,
						idleWindowMs,
						// Gated on the verbose flag so cold-boot progress and
						// the final window-closed summary stay quiet by
						// default. Flip NS_VITE_VERBOSE=1 to surface them.
						log: (line) => {
							if (!verbose) return;
							console.info(line);
						},
					});
				}
			} catch {}
			server.middlewares.use((req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					const route = classifyBootRoute(urlObj.pathname);
					if (route === 'other') return next();
					if (!coldBootCounter) return next();
					const handle = coldBootCounter.record(urlObj.pathname);
					const finishOnce = () => {
						try {
							handle.finish();
						} catch {}
					};
					try {
						res.once('finish', finishOnce);
						res.once('close', finishOnce);
					} catch {}
				} catch {}
				next();
			});

			// Give `populateInitialGraph` a head start. Previously this only
			// kicked off on the first /ns/m hit, which meant populate was
			// competing with the device for the same 8 transform slots
			// throughout the first 4-5 seconds of cold boot. Starting at
			// `configureServer` time gives populate the full app
			// build/launch window (typically 2-3s on simulator) as a head
			// start, so more of its work lands before the device even
			// connects. Disable via `NS_VITE_HMR_DISABLE_POPULATE=1` when
			// profiling whether populate is helping or hurting a specific
			// app.
			try {
				const disablePopulate = process.env.NS_VITE_HMR_DISABLE_POPULATE === '1' || process.env.NS_VITE_HMR_DISABLE_POPULATE === 'true';
				if (disablePopulate) {
					if (verbose) console.info('[hmr-ws][populate] disabled via NS_VITE_HMR_DISABLE_POPULATE');
					// Short-circuit: mark as resolved so /ns/m never schedules it and
					// HMR still works (handleHotUpdate just has no pre-warmed graph).
					graphInitialPopulationPromise = Promise.resolve();
				} else {
					ensureInitialGraphPopulationStarted(server);
				}
			} catch {}

			// Attempt early vendor manifest bootstrap once per server.
			if (!vendorBootstrapDone) {
				vendorBootstrapDone = true;
				const root = server.config?.root || process.cwd();
				const existing = getVendorManifest();
				if (!existing) {
					const loaded = loadPrebuiltVendorManifest(root, verbose);
					if (!loaded && verbose) {
						console.warn('[hmr-ws][vendor] No vendor manifest found during bootstrap. Consider enabling vendorManifestPlugin earlier.');
					}
				} else if (verbose) {
					console.log('[hmr-ws][vendor] Manifest already present with', Object.keys(existing.modules).length, 'modules');
				}
				getGlobalScope().__NS_VENDOR_MANIFEST__ = getVendorManifest();
			}

			// Disable perMessageDeflate to avoid any extension negotiation quirks with native clients
			wss = new WebSocketServer({
				noServer: true,
				path: '/ns-hmr',
				perMessageDeflate: false,
			});

			if (verbose) {
				console.log('[hmr-ws] WebSocket configured on /ns-hmr');
			}

			httpServer.on('upgrade', (request, socket, head) => {
				try {
					if (verbose) {
						const ra = (request.socket as any)?.remoteAddress;
						const rp = (request.socket as any)?.remotePort;
						console.log('[hmr-ws][upgrade]', request.url, 'from', ra + (rp ? ':' + rp : ''));
					}
				} catch {}
				const pathname = new URL(request.url || '', 'http://localhost').pathname;
				if (pathname === '/ns-hmr') {
					wss?.handleUpgrade(request, socket, head, (ws) => {
						wss?.emit('connection', ws, request);
					});
				}
			});

			// Additional connection diagnostics
			wss.on('connection', (ws, req) => {
				const role = getHmrSocketRoleFromRequestUrl(req.url);
				(ws as any).__nsHmrClientRole = role;
				try {
					if (verbose) {
						const ra = (req.socket as any)?.remoteAddress;
						const rp = (req.socket as any)?.remotePort;
						console.log('[hmr-ws] Client connected', { role, remote: ra + (rp ? ':' + rp : '') });
					}
				} catch {}
				ws.on('close', () => {
					try {
						if (verbose) {
							const ra = (req.socket as any)?.remoteAddress;
							const rp = (req.socket as any)?.remotePort;
							console.log('[hmr-ws] Client disconnected', { role, remote: ra + (rp ? ':' + rp : '') });
						}
					} catch {}
				});
			});
			wss.on('error', (err) => {
				console.warn('[hmr-ws] server error:', err?.message || String(err));
			});

			// Import map endpoint: GET /ns/import-map.json — see websocket-import-map-route.ts
			registerImportMapRoute(server, { getStrategy: () => strategy });

			// Dev-only HTTP ESM loader endpoint for device clients
			// 2) ESM module server for application/source modules: GET /ns/m/* — see websocket-ns-m.ts
			registerNsModuleServerRoute(server, {
				verbose,
				appVirtualWithSlash: APP_VIRTUAL_WITH_SLASH,
				sfcFileMap,
				depFileMap,
				getGraphVersion: () => moduleGraph.version,
				getStrategy: () => strategy,
				sharedTransformRequest,
				ensureInitialGraphPopulationStarted,
				upsertGraphModule: (id, code, deps, opts) => {
					moduleGraph.upsert(id, code, deps, opts);
				},
			});

			// 2.5) ESM runtime bridge for NativeScript-Vue: GET /ns/rt[/<ver>] — see ns-rt-route.ts
			registerNsRtBridgeRoute(server, { getGraphVersion: () => moduleGraph.version });

			// 2.55) Dev-only vendor import unifier: rewrite 'vue'/'nativescript-vue' to /ns/rt/<ver>
			// so plugins and the app share a single Vue/NativeScript-Vue realm. See websocket-vendor-unifier.ts.
			registerVendorUnifierHandler(server, { getGraphVersion: () => moduleGraph.version, getStrategy: () => strategy });

			// 2.6) @nativescript/core device bridge (+ stray /node_modules/@nativescript/core redirect) — see websocket-ns-core.ts
			registerNsCoreRoute(server, {
				getGraphVersion: () => moduleGraph.version,
				sharedTransformRequest,
			});

			// 2.6a/2.6b) Device bootstrap: GET /ns/entry-rt + GET /ns/entry — see websocket-ns-entry.ts
			registerNsEntryRoutes(server, {
				verbose,
				appRootDir: APP_ROOT_DIR,
				defaultMainEntry: DEFAULT_MAIN_ENTRY,
				defaultMainEntryVirtual: DEFAULT_MAIN_ENTRY_VIRTUAL,
				getGraphVersion: () => moduleGraph.version,
			});

			// 2.6) Transactional HMR endpoint: GET /ns/txn/<ver> — one ESM that sequentially
			// imports all changed modules for the given graph version. See websocket-txn.ts.
			registerTxnHandler(server, {
				resolveTxnIds: (version, fallbackChangedIds) => {
					let ids = moduleGraph.getTxnBatch(version) || [];
					if (!ids.length && fallbackChangedIds.length) {
						try {
							ids = moduleGraph.computeTxnOrderForChanged(fallbackChangedIds);
						} catch {}
					}
					return ids;
				},
			});

			// Framework-owned dev HTTP endpoints (Vue: /ns/sfc, /ns/sfc-meta, /ns/asm).
			// Only the strategy that owns routes (Vue) registers them via
			// `registerRoutes`; SFC/assembler endpoints are inherently Vue-only
			// (see websocket-sfc.ts).
			strategy.registerRoutes?.({
				server,
				wss,
				verbose,
				appVirtualWithSlash: APP_VIRTUAL_WITH_SLASH,
				sfcFileMap,
				depFileMap,
				getGraphVersion: () => moduleGraph.version,
				getStrategy: () => strategy,
			});

			wss.on('connection', async (ws) => {
				if (verbose) console.log('[hmr-ws] Client connected (dynamic fetch mode)');

				ws.on('close', () => verbose && console.log('[hmr-ws] Client disconnected'));
				ws.on('message', (data: any) => {
					try {
						const msg = JSON.parse(String(data));
						if (msg?.type === 'ns:hmr-resync-request') {
							moduleGraph.emitFullGraph(ws as any);
						} else if (msg?.type === 'ns:hmr-sfc-registry-request') {
							// Resend full SFC registry (lightweight code path)
							strategy
								.buildRegistry({
									server,
									sfcFileMap,
									depFileMap,
									wss: wss!,
									verbose,
									helpers: {
										cleanCode: (code: string) => cleanCode(code, strategy),
										collectImportDependencies,
										isCoreGlobalsReference,
										isNativeScriptCoreModule,
										isNativeScriptPluginModule,
										resolveVendorFromCandidate,
										createHash: (value: string) => createHash('md5').update(value).digest('hex'),
										rewriteImports,
										processSfcCode,
									},
								})
								.catch(() => {});
						}
					} catch {}
				});

				// Populate initial graph (only once) before sending anything
				try {
					await populateInitialGraph(server);
				} catch (e) {
					if (verbose) console.warn('[hmr-ws][graph] initial population failed', e);
				}
				// Send SFC registry on every connection (not just the first).
				// When the NativeScript app restarts (e.g. CLI auto-reload), the new
				// JS context has an empty sfcArtifactMap. Without the registry the
				// rescue-mount cannot find the root .vue component.
				try {
					await strategy.buildRegistry({
						server,
						sfcFileMap,
						depFileMap,
						wss: wss!,
						verbose,
						helpers: {
							cleanCode: (code: string) => cleanCode(code, strategy),
							collectImportDependencies,
							isCoreGlobalsReference,
							isNativeScriptCoreModule,
							isNativeScriptPluginModule,
							resolveVendorFromCandidate,
							createHash: (value: string) => createHash('md5').update(value).digest('hex'),
							rewriteImports,
							processSfcCode,
						},
					});
				} catch (error) {
					console.warn('[hmr-ws] Failed to send registry:', error);
				}
				moduleGraph.emitFullGraph(ws as any);
			});
		},

		async handleHotUpdate(ctx) {
			// Every flavor owns its `handleHotUpdate` (shared prologue + its tail);
			// call the active strategy's hook directly with the injected deps.
			return strategy.handleHotUpdate?.(ctx, {
				wss,
				moduleGraph,
				strategy,
				verbose,
				sfcFileMap,
				depFileMap,
				sharedTransformRequest,
				getHmrSourceRootsCached,
				getBootstrapEntryRelPath,
				isSocketClientOpen,
				getHmrSocketRole,
				shouldRemapImport,
				rememberAngularReloadSuppression,
				getRootComponentIdentity,
				getGraphInitialPopulationPromise: () => graphInitialPopulationPromise,
				appRootDir: APP_ROOT_DIR,
			});
		},
	};
}

/**
 * Build the server-side HMR WebSocket plugin for `flavor`, or `undefined` when
 * the flavor has no registered server strategy (e.g. `react`, which ships only
 * the client plugin today). Driven off `STRATEGY_REGISTRY`, so adding a flavor
 * is a one-line registry change — no per-flavor wrapper and no `getHMRPlugins`
 * switch arm. Replaces the former hmrWebSocket{Vue,Angular,Solid,Typescript}
 * wrappers and the explicit `case 'react': // no-op`.
 */
export function hmrWebSocketPluginForFlavor(flavor: string, opts: { verbose?: boolean }): Plugin | undefined {
	const strategy = STRATEGY_REGISTRY.get(flavor);
	return strategy ? createHmrWebSocketPlugin(opts, strategy) : undefined;
}
